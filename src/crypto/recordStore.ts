/**
 * Where her encrypted data lives. Lane A owns this file.
 *
 * The wrapped key goes in the Keychain (see keyStore.ts); everything else — her
 * answers, her path, the fund, the document list — is one encrypted blob here.
 * Documents themselves will get their own files alongside it, same pattern.
 *
 * On iOS this sits in the document directory, which iCloud backs up. That sounds
 * alarming and mostly isn't, because of how the layers stack: what gets backed up
 * is ciphertext, and the key that opens it lives in the Keychain marked
 * THIS_DEVICE_ONLY, so it never syncs. A backup copy without the key is noise.
 *
 * Still worth doing properly — excluding the directory from backup is on Lane A's
 * list — but the encryption is what's actually carrying the weight, and that's
 * the honest thing to say if a judge asks.
 */

import { Platform } from 'react-native';
import { Directory, File, Paths } from 'expo-file-system';

const DIR_NAME = 'anchor';
const FILE_NAME = 'state.enc';
const WEB_KEY = 'anchor.state';

const isWeb = Platform.OS === 'web';

function file(): File {
  const dir = new Directory(Paths.document, DIR_NAME);
  if (!dir.exists) dir.create({ intermediates: true });
  return new File(dir, FILE_NAME);
}

/** Returns null when she has never saved anything. */
export async function readRecord(): Promise<string | null> {
  if (isWeb) {
    try {
      return globalThis.localStorage?.getItem(WEB_KEY) ?? null;
    } catch {
      return null;
    }
  }

  const f = file();
  if (!f.exists) return null;
  return f.text();
}

export async function writeRecord(blob: string): Promise<void> {
  if (isWeb) {
    try {
      globalThis.localStorage?.setItem(WEB_KEY, blob);
    } catch {
      // Private browsing or blocked storage. Development-only path.
    }
    return;
  }

  const f = file();
  if (!f.exists) f.create();
  f.write(blob);
}

export async function deleteRecord(): Promise<void> {
  if (isWeb) {
    try {
      globalThis.localStorage?.removeItem(WEB_KEY);
    } catch {
      // See above.
    }
    return;
  }

  const f = file();
  if (f.exists) f.delete();
}
