/**
 * Storage for the disguise. Deliberately NOT encrypted.
 *
 * This is the one place in the app where plaintext is correct. The decoy's whole
 * job is to be readable by anyone who opens it — an encrypted cycle tracker that
 * showed nothing would be far more suspicious than one that just works. What she
 * taps here is fiction, so it costs nothing to leave it in the open, and leaving
 * it in the open is what makes the disguise hold up when someone actually uses it.
 */

import { Platform } from 'react-native';
import { Directory, File, Paths } from 'expo-file-system';

const FILE_NAME = 'cycle.json';
const WEB_KEY = 'cycle.state';

const isWeb = Platform.OS === 'web';

export interface DecoyState {
  logged: string[];
  period: boolean;
  /** Date these were logged against, so they clear on a new day. */
  day: string;
}

function file(): File {
  const dir = new Directory(Paths.document, 'anchor');
  if (!dir.exists) dir.create({ intermediates: true });
  return new File(dir, FILE_NAME);
}

export function readDecoy(): DecoyState | null {
  try {
    if (isWeb) {
      const raw = globalThis.localStorage?.getItem(WEB_KEY);
      return raw ? JSON.parse(raw) : null;
    }
    const f = file();
    return f.exists ? JSON.parse(f.textSync()) : null;
  } catch {
    return null;
  }
}

export function writeDecoy(state: DecoyState): void {
  try {
    const raw = JSON.stringify(state);
    if (isWeb) {
      globalThis.localStorage?.setItem(WEB_KEY, raw);
      return;
    }
    const f = file();
    if (!f.exists) f.create();
    f.write(raw);
  } catch {
    // The disguise still works without persistence; never let this throw into
    // the decoy's render path.
  }
}
