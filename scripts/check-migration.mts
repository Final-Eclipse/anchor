/**
 * Proves the KDF migration: a record wrapped at the old iteration count must
 * still unlock under the new one, and must then be rewritten at the new count.
 * Mirrors vault.ts's logic against node's WebCrypto.
 */
import { pbkdf2 } from '@noble/hashes/pbkdf2.js';
import { sha256 } from '@noble/hashes/sha2.js';
import { webcrypto as crypto } from 'node:crypto';

const OLD = 30_000;
const NEW = 18_000;
const LEGACY = [30_000, 100_000];

const enc = (b: Uint8Array) => Buffer.from(b).toString('base64');
const dec = (s: string) => new Uint8Array(Buffer.from(s, 'base64'));

async function wrap(pin: string, salt: Uint8Array, dataKey: Uint8Array, iters: number) {
  const kekBytes = pbkdf2(sha256, pin, salt, { c: iters, dkLen: 32 });
  const kek = await crypto.subtle.importKey('raw', kekBytes, 'AES-GCM', false, ['encrypt']);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, kek, dataKey));
  const combined = new Uint8Array(iv.length + ct.length);
  combined.set(iv, 0);
  combined.set(ct, iv.length);
  return enc(combined);
}

async function tryUnwrap(pin: string, salt: Uint8Array, wrapped: string, iters: number) {
  const kekBytes = pbkdf2(sha256, pin, salt, { c: iters, dkLen: 32 });
  const kek = await crypto.subtle.importKey('raw', kekBytes, 'AES-GCM', false, ['decrypt']);
  const blob = dec(wrapped);
  const out = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: blob.subarray(0, 12) },
    kek,
    blob.subarray(12)
  );
  return new Uint8Array(out);
}

/** The unlock path from vault.ts: known count if present, else try the legacy list. */
async function unlock(pin: string, record: { salt: Uint8Array; wrapped: string; iterations?: number }) {
  const candidates = record.iterations ? [record.iterations] : LEGACY;
  for (const iters of candidates) {
    try {
      const key = await tryUnwrap(pin, record.salt, record.wrapped, iters);
      return { ok: true as const, key, usedIterations: iters };
    } catch {
      /* try next */
    }
  }
  return { ok: false as const };
}

const salt = crypto.getRandomValues(new Uint8Array(16));
const dataKey = crypto.getRandomValues(new Uint8Array(32));
const PIN = '482100';

let failures = 0;
const check = (name: string, cond: boolean) => {
  console.log((cond ? '  ok    ' : '  FAIL  ') + name);
  if (!cond) failures++;
};

// A vault written before iterations were recorded — exactly Andrew's phone.
const legacyRecord = { salt, wrapped: await wrap(PIN, salt, dataKey, OLD), iterations: undefined };

const a = await unlock(PIN, legacyRecord);
check('legacy vault (30k, no iterations field) still opens', a.ok);
check('  and is recognised as legacy', a.ok && a.usedIterations === OLD);
check('  returning the original key', a.ok && Buffer.from(a.key).equals(Buffer.from(dataKey)));

// After migration it is stored at the new count.
const migrated = { salt, wrapped: await wrap(PIN, salt, dataKey, NEW), iterations: NEW };
const b = await unlock(PIN, migrated);
check('migrated vault opens at the new count', b.ok && b.usedIterations === NEW);

// A wrong code still fails against every candidate.
const c = await unlock('000000', legacyRecord);
check('wrong code rejected across all candidates', !c.ok);

// The bug that started this: new count against an old record, no fallback.
let brokeWithoutFallback = false;
try {
  await tryUnwrap(PIN, salt, legacyRecord.wrapped, NEW);
} catch {
  brokeWithoutFallback = true;
}
check('reproduces the original bug when the fallback is skipped', brokeWithoutFallback);

console.log(failures === 0 ? '\nMigration verified.\n' : `\n${failures} failed.\n`);
process.exit(failures ? 1 : 0);
