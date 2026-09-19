/**
 * Key lifecycle and encryption. Lane A owns this file.
 *
 * The design, in one paragraph: a random 256-bit data key encrypts everything
 * the app stores. That data key is itself encrypted with a key derived from her
 * PIN, and only the wrapped version is ever written to disk. The PIN is never
 * stored anywhere. So an abuser who knows the device passcode — which is the
 * whole point of this app — unlocks the phone, opens the Keychain, and finds a
 * short run of noise.
 *
 * The unwrapped data key lives in module memory only. lockVault() drops it, and
 * the app calls that on panic exit and whenever it leaves the foreground.
 *
 * Why native AES and not a JS implementation: expo-crypto ships AES-GCM that
 * runs in Expo Go (SDK 57). It is faster than anything pure JS, which matters
 * once the vault holds photographs. PBKDF2 is still pure JS because expo-crypto
 * does not offer one — that cost is paid once per unlock, not per record.
 *
 * Everything here is async. Native crypto and Keychain access both are.
 */

import {
  getRandomBytesAsync,
  AESEncryptionKey,
  AESKeySize,
  AESSealedData,
  aesEncryptAsync,
  aesDecryptAsync,
} from 'expo-crypto';
import { pbkdf2 } from '@noble/hashes/pbkdf2.js';
import { sha256 } from '@noble/hashes/sha2.js';
import { getWrappedKey, setWrappedKey, deleteWrappedKey } from './keyStore';

const SALT_BYTES = 16;

/**
 * PBKDF2 here is pure JS and runs far slower in Hermes than on a laptop.
 * Measured on an iPhone: 100,000 took well over a second, and 30,000 landed at
 * almost exactly one second — still too slow for an app someone may be opening
 * with very little time. 18,000 puts it near half a second.
 *
 * The trade is smaller than it looks. This work makes guessing the code
 * expensive, but the code's length is the real limit: six digits is a million
 * possibilities and four is ten thousand, which dwarfs any iteration count we
 * could afford on a phone. Six digits plus the lockout below is where the
 * protection actually comes from.
 */
const PBKDF2_ITERATIONS = 18_000;

/**
 * Counts we have shipped before. A record written under one of these has no
 * `iterations` field, so unlock falls back to trying them in order.
 *
 * This exists because changing the count silently broke every existing vault:
 * the key is wrapped under a key derived with a specific count, so deriving with
 * a different one produces the wrong key and looks exactly like a wrong code.
 * Every record now stores the count it was written with, and anything older gets
 * migrated on the next successful unlock. Never remove a value from this list.
 */
const LEGACY_ITERATIONS = [30_000, 100_000];

interface WrappedKeyRecord {
  v: 1;
  /** PBKDF2 salt, hex. Not secret. */
  salt: string;
  /** The data key sealed under the PIN-derived key. Base64, IV included. */
  wrapped: string;
  /** PBKDF2 count this record was written with. Absent on pre-migration records. */
  iterations?: number;
  /** Consecutive wrong codes. Reset to zero on a correct one. */
  failures?: number;
  /** Epoch ms before which no attempt is accepted. */
  lockedUntil?: number;
  /**
   * The same data key, wrapped a second time under her recovery code. Optional,
   * because turning it on means having somewhere safe to keep the code, and only
   * she knows whether she does.
   */
  recovery?: { salt: string; wrapped: string; iterations: number };
}

/**
 * Unambiguous alphabet: no O/0, no I/1/L. She may be copying this onto paper in
 * a hurry, or reading it back months later.
 */
const CODE_ALPHABET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
const CODE_GROUPS = 3;
const CODE_GROUP_LENGTH = 4;

/** Strips formatting so "anch or-1234" and "ANCHOR1234" both work. */
export function normalizeRecoveryCode(input: string): string {
  return input.toUpperCase().replace(/[^0-9A-Z]/g, '');
}

/** Twelve characters from a 31-letter alphabet — about 59 bits. */
export async function generateRecoveryCode(): Promise<string> {
  const bytes = await getRandomBytesAsync(CODE_GROUPS * CODE_GROUP_LENGTH);
  const chars = [...bytes].map((b) => CODE_ALPHABET[b % CODE_ALPHABET.length]);

  const groups: string[] = [];
  for (let i = 0; i < CODE_GROUPS; i++) {
    groups.push(chars.slice(i * CODE_GROUP_LENGTH, (i + 1) * CODE_GROUP_LENGTH).join(''));
  }
  return groups.join('-');
}

/**
 * What a wrong code costs, by consecutive failure count. The realistic attack
 * is him picking up her phone and trying the dates he knows — birthdays,
 * anniversaries — not a patient search. Making the fourth guess cost thirty
 * seconds ends that entirely.
 *
 * Be honest about what this doesn't do: someone who extracts the Keychain item
 * can attack the wrapped key offline, where none of this applies. PBKDF2 is what
 * slows that down, and a six-digit code is what limits it. This handles the
 * attacker who is actually holding the phone.
 */
function lockoutFor(failures: number): number {
  if (failures < 4) return 0;
  if (failures === 4) return 30_000;
  if (failures === 5) return 60_000;
  if (failures === 6) return 5 * 60_000;
  return 15 * 60_000;
}

export type UnlockResult =
  | { ok: true }
  | { ok: false; reason: 'wrong'; attemptsBeforeWait: number }
  | { ok: false; reason: 'locked'; retryInMs: number }
  | { ok: false; reason: 'no-vault' };

/**
 * The unwrapped data key, present only while unlocked. It is an opaque native
 * handle, so unlike a byte array we cannot overwrite the material ourselves —
 * dropping the reference is the most JS can do.
 */
let dataKey: AESEncryptionKey | null = null;

// ────────────────────────────────────────────────────────────── encoding

function toHex(bytes: Uint8Array): string {
  let out = '';
  for (const b of bytes) out += b.toString(16).padStart(2, '0');
  return out;
}

function fromHex(hex: string): Uint8Array {
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  return out;
}

// ───────────────────────────────────────────────────────── key lifecycle

/** Turns a PIN into a key-encrypting key. Slow on purpose. */
async function deriveKek(
  pin: string,
  salt: Uint8Array,
  iterations: number = PBKDF2_ITERATIONS
): Promise<AESEncryptionKey> {
  const bytes = pbkdf2(sha256, pin, salt, { c: iterations, dkLen: 32 });
  return AESEncryptionKey.import(bytes);
}

/**
 * Re-wraps the key under a PIN. Preserves any recovery copy: changing the PIN
 * must not silently invalidate a code she wrote down months ago.
 */
async function writeWrappedKey(key: AESEncryptionKey, pin: string): Promise<void> {
  const existing = await getWrappedKey();
  const previous: WrappedKeyRecord | null = existing ? JSON.parse(existing) : null;

  const salt = await getRandomBytesAsync(SALT_BYTES);
  const sealed = await aesEncryptAsync(await key.bytes(), await deriveKek(pin, salt));

  const record: WrappedKeyRecord = {
    v: 1,
    salt: toHex(salt),
    wrapped: await sealed.combined('base64'),
    iterations: PBKDF2_ITERATIONS,
    recovery: previous?.recovery,
  };
  await setWrappedKey(JSON.stringify(record));
}

export async function isVaultSetUp(): Promise<boolean> {
  return (await getWrappedKey()) !== null;
}

/** First run. Generates the data key and leaves the vault unlocked. */
export async function setupVault(pin: string): Promise<void> {
  const key = await AESEncryptionKey.generate(AESKeySize.AES256);
  await writeWrappedKey(key, pin);
  dataKey = key;
}

/**
 * A wrong code fails GCM authentication, which throws before producing any
 * output — a wrong guess reveals nothing about the key. Repeated wrong guesses
 * cost increasing amounts of time; see lockoutFor.
 */
export async function unlockVault(pin: string): Promise<UnlockResult> {
  const stored = await getWrappedKey();
  if (!stored) return { ok: false, reason: 'no-vault' };

  const record: WrappedKeyRecord = JSON.parse(stored);

  const lockedUntil = record.lockedUntil ?? 0;
  if (lockedUntil > Date.now()) {
    return { ok: false, reason: 'locked', retryInMs: lockedUntil - Date.now() };
  }

  // A record written before iterations were stored could be under any count we
  // once shipped, so try each until one authenticates.
  const candidates = record.iterations ? [record.iterations] : LEGACY_ITERATIONS;
  const salt = fromHex(record.salt);
  const sealed = AESSealedData.fromCombined(record.wrapped);

  for (const iterations of candidates) {
    try {
      const kek = await deriveKek(pin, salt, iterations);
      const keyBytes = await aesDecryptAsync(sealed, kek, { output: 'bytes' });
      dataKey = await AESEncryptionKey.import(keyBytes);

      if (iterations !== PBKDF2_ITERATIONS) {
        // Re-wrap at the current count so the next unlock is fast and this
        // migration path stops being needed.
        await writeWrappedKey(dataKey, pin);
      } else if (record.failures) {
        await setWrappedKey(JSON.stringify({ ...record, failures: 0, lockedUntil: 0 }));
      }
      return { ok: true };
    } catch {
      // Wrong count, or wrong code. Try the next candidate before deciding.
    }
  }

  // Every candidate failed, so the code is wrong.
  dataKey = null;

  const failures = (record.failures ?? 0) + 1;
  const wait = lockoutFor(failures);
  await setWrappedKey(
    JSON.stringify({
      ...record,
      failures,
      lockedUntil: wait ? Date.now() + wait : 0,
    })
  );

  if (wait) return { ok: false, reason: 'locked', retryInMs: wait };
  return { ok: false, reason: 'wrong', attemptsBeforeWait: 4 - failures };
}

// ────────────────────────────────────────────────────────────── recovery

/**
 * Wraps the data key a second time under her recovery code, so either the code
 * or the PIN opens the vault. Requires the vault to be unlocked, because we need
 * the key itself — there is no way to enable this from a locked state, which is
 * the point.
 */
export async function enableRecovery(code: string): Promise<void> {
  const key = requireKey();
  const stored = await getWrappedKey();
  if (!stored) throw new Error('No vault to attach recovery to');

  const record: WrappedKeyRecord = JSON.parse(stored);
  const salt = await getRandomBytesAsync(SALT_BYTES);
  const kek = await deriveKek(normalizeRecoveryCode(code), salt);
  const sealed = await aesEncryptAsync(await key.bytes(), kek);

  await setWrappedKey(
    JSON.stringify({
      ...record,
      recovery: {
        salt: toHex(salt),
        wrapped: await sealed.combined('base64'),
        iterations: PBKDF2_ITERATIONS,
      },
    } satisfies WrappedKeyRecord)
  );
}

export async function hasRecovery(): Promise<boolean> {
  const stored = await getWrappedKey();
  if (!stored) return false;
  return !!(JSON.parse(stored) as WrappedKeyRecord).recovery;
}

/**
 * Opens the vault with the recovery code instead of the PIN. Deliberately not
 * subject to the wrong-code lockout: someone typing a twelve-character code is
 * not guessing it, and locking her out of her own escape hatch would be cruel.
 * The code's own length is what makes brute force hopeless.
 *
 * She should be sent straight to setting a new PIN afterwards.
 */
export async function unlockWithRecovery(code: string): Promise<boolean> {
  const stored = await getWrappedKey();
  if (!stored) return false;

  const record: WrappedKeyRecord = JSON.parse(stored);
  if (!record.recovery) return false;

  try {
    const kek = await deriveKek(
      normalizeRecoveryCode(code),
      fromHex(record.recovery.salt),
      record.recovery.iterations
    );
    const sealed = AESSealedData.fromCombined(record.recovery.wrapped);
    const keyBytes = await aesDecryptAsync(sealed, kek, { output: 'bytes' });
    dataKey = await AESEncryptionKey.import(keyBytes);
    return true;
  } catch {
    dataKey = null;
    return false;
  }
}

/** Sets a new PIN for an already-unlocked vault, clearing any lockout. */
export async function setNewPin(pin: string): Promise<void> {
  const key = requireKey();
  await writeWrappedKey(key, pin);
}

/** Call on panic exit, and on every AppState change out of 'active'. */
export function lockVault(): void {
  dataKey = null;
}

export function isUnlocked(): boolean {
  return dataKey !== null;
}

/** Re-wraps the same data key under a new PIN, so stored records stay readable. */
export async function changePin(currentPin: string, nextPin: string): Promise<boolean> {
  const result = await unlockVault(currentPin);
  if (!result.ok || !dataKey) return false;
  await writeWrappedKey(dataKey, nextPin);
  return true;
}

// ────────────────────────────────────────────────────────────── payloads

function requireKey(): AESEncryptionKey {
  if (!dataKey) throw new Error('Vault is locked');
  return dataKey;
}

/**
 * Returns base64 — the IV and authentication tag travel inside it, so this
 * single string is everything needed to decrypt later. Safe to hand straight to
 * expo-file-system with an encoding of base64.
 */
export async function encryptBytes(plain: Uint8Array): Promise<string> {
  const sealed = await aesEncryptAsync(plain, requireKey());
  return sealed.combined('base64');
}

export async function decryptBytes(blob: string): Promise<Uint8Array> {
  const sealed = AESSealedData.fromCombined(blob);
  return aesDecryptAsync(sealed, requireKey(), { output: 'bytes' });
}

/**
 * For payloads that are already base64 — an image straight from the picker, say.
 * Avoids decoding to bytes and re-encoding for no reason; expo-crypto takes
 * base64 directly.
 */
export async function encryptBase64(plainBase64: string): Promise<string> {
  const sealed = await aesEncryptAsync(plainBase64, requireKey());
  return sealed.combined('base64');
}

/** Returns base64, ready to drop into a data: URI. */
export async function decryptToBase64(blob: string): Promise<string> {
  const sealed = AESSealedData.fromCombined(blob);
  return aesDecryptAsync(sealed, requireKey(), { output: 'base64' });
}

export async function encryptJson(value: unknown): Promise<string> {
  return encryptBytes(new TextEncoder().encode(JSON.stringify(value)));
}

export async function decryptJson<T>(blob: string): Promise<T> {
  return JSON.parse(new TextDecoder().decode(await decryptBytes(blob))) as T;
}

/**
 * Wipes the wrapped key, which makes every encrypted record permanently
 * unreadable. Whoever builds the UI for this: confirm twice, and say plainly
 * that it cannot be undone.
 */
export async function destroyVault(): Promise<void> {
  lockVault();
  await deleteWrappedKey();
}
