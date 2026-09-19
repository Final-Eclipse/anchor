/**
 * Encrypted document files. Lane A owns this file.
 *
 * One file per document, named by id, holding ciphertext and nothing else. The
 * metadata (title, type, when it was added) lives in the encrypted state blob
 * instead, so even the file listing gives nothing away — a directory of
 * `a3f9c1.enc` says nothing about what she photographed.
 *
 * Same web fallback as everywhere else, and the same warning: localStorage is
 * for development only. Photographs of someone's ID do not belong in a browser
 * profile.
 */

import { Platform } from 'react-native';
import { Directory, File, Paths } from 'expo-file-system';

const DIR_NAME = 'anchor/docs';
const WEB_PREFIX = 'anchor.doc.';

const isWeb = Platform.OS === 'web';

function docFile(id: string): File {
  const dir = new Directory(Paths.document, DIR_NAME);
  if (!dir.exists) dir.create({ intermediates: true });
  return new File(dir, `${id}.enc`);
}

export async function writeDoc(id: string, blob: string): Promise<void> {
  if (isWeb) {
    try {
      globalThis.localStorage?.setItem(WEB_PREFIX + id, blob);
    } catch {
      // Development-only path; quota or private browsing.
    }
    return;
  }

  const f = docFile(id);
  if (!f.exists) f.create();
  f.write(blob);
}

export async function readDoc(id: string): Promise<string | null> {
  if (isWeb) {
    try {
      return globalThis.localStorage?.getItem(WEB_PREFIX + id) ?? null;
    } catch {
      return null;
    }
  }

  const f = docFile(id);
  if (!f.exists) return null;
  return f.text();
}

export async function deleteDoc(id: string): Promise<void> {
  if (isWeb) {
    try {
      globalThis.localStorage?.removeItem(WEB_PREFIX + id);
    } catch {
      // See above.
    }
    return;
  }

  const f = docFile(id);
  if (f.exists) f.delete();
}
