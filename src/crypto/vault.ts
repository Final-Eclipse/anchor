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

import * as SecureStore from 'expo-secure-store';
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

const WRAPPED_KEY_ITEM = 'anchor.wrapped_key';
const SALT_BYTES = 16;

/**
 * PBKDF2 here is pure JS and runs far slower in Hermes than on a laptop. This
 * count is a starting guess — unlock happens on every return to the foreground,
 * so measure it on a real phone. If it costs more than about a second, lower it
 * and write down what you measured and why.
 */
const PBKDF2_ITERATIONS = 100_000;

/**
 * iOS syncs Keychain items to iCloud Keychain unless told otherwise, which would
 * put the wrapped key on every device signed into the same Apple account. On a
 * shared family account that is precisely the leak this app exists to prevent.
 */
const SECURE_STORE_OPTS: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
};

interface WrappedKeyRecord {
  v: 1;
  /** PBKDF2 salt, hex. Not secret. */
  salt: string;
  /** The data key sealed under the PIN-derived key. Base64, IV included. */
  wrapped: string;
}

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
async function deriveKek(pin: string, salt: Uint8Array): Promise<AESEncryptionKey> {
  const bytes = pbkdf2(sha256, pin, salt, { c: PBKDF2_ITERATIONS, dkLen: 32 });
  return AESEncryptionKey.import(bytes);
}

async function writeWrappedKey(key: AESEncryptionKey, pin: string): Promise<void> {
  const salt = await getRandomBytesAsync(SALT_BYTES);
  const sealed = await aesEncryptAsync(await key.bytes(), await deriveKek(pin, salt));

  const record: WrappedKeyRecord = {
    v: 1,
    salt: toHex(salt),
    wrapped: await sealed.combined('base64'),
  };
  await SecureStore.setItemAsync(WRAPPED_KEY_ITEM, JSON.stringify(record), SECURE_STORE_OPTS);
}

export async function isVaultSetUp(): Promise<boolean> {
  return (await SecureStore.getItemAsync(WRAPPED_KEY_ITEM, SECURE_STORE_OPTS)) !== null;
}

/** First run. Generates the data key and leaves the vault unlocked. */
export async function setupVault(pin: string): Promise<void> {
  const key = await AESEncryptionKey.generate(AESKeySize.AES256);
  await writeWrappedKey(key, pin);
  dataKey = key;
}

/**
 * Returns false on the wrong PIN. GCM authentication fails and throws before
 * producing any output, so a wrong guess reveals nothing about the key.
 */
export async function unlockVault(pin: string): Promise<boolean> {
  const stored = await SecureStore.getItemAsync(WRAPPED_KEY_ITEM, SECURE_STORE_OPTS);
  if (!stored) return false;

  const record: WrappedKeyRecord = JSON.parse(stored);
  try {
    const sealed = AESSealedData.fromCombined(record.wrapped);
    const kek = await deriveKek(pin, fromHex(record.salt));
    const keyBytes = await aesDecryptAsync(sealed, kek, { output: 'bytes' });
    dataKey = await AESEncryptionKey.import(keyBytes);
    return true;
  } catch {
    dataKey = null;
    return false;
  }
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
  if (!(await unlockVault(currentPin)) || !dataKey) return false;
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
  await SecureStore.deleteItemAsync(WRAPPED_KEY_ITEM, SECURE_STORE_OPTS);
}
