/**
 * Where the wrapped data key lives. Lane A owns this file.
 *
 * On a phone this is the iOS Keychain / Android Keystore via expo-secure-store,
 * which is the real thing and the only configuration that ships.
 *
 * On web it is localStorage, because expo-secure-store has no web
 * implementation at all — it exports an empty object, so every call fails.
 * Without this shim the vault simply cannot run in a browser, and we'd be
 * forcing everyone onto a phone to build a screen.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * THE WEB PATH IS FOR DEVELOPMENT ONLY. localStorage is readable by any script
 * on the page and survives in the browser profile. It is not secure storage and
 * must never be what a real user runs. Check `isSecureStorage` before showing
 * anything that claims her data is protected — a security claim has to be true,
 * and on web this one isn't.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const ITEM = 'anchor.wrapped_key';

/**
 * iOS syncs Keychain items to iCloud Keychain unless told otherwise, which would
 * put the wrapped key on every device signed into the same Apple account. On a
 * shared family account that is precisely the leak this app exists to prevent.
 */
const OPTS: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
};

/** False in a browser. Surface this wherever the UI talks about protection. */
export const isSecureStorage = Platform.OS !== 'web';

export async function getWrappedKey(): Promise<string | null> {
  if (!isSecureStorage) {
    try {
      return globalThis.localStorage?.getItem(ITEM) ?? null;
    } catch {
      return null;
    }
  }
  return SecureStore.getItemAsync(ITEM, OPTS);
}

export async function setWrappedKey(value: string): Promise<void> {
  if (!isSecureStorage) {
    try {
      globalThis.localStorage?.setItem(ITEM, value);
    } catch {
      // Private browsing or blocked storage. Nothing to fall back to, and this
      // path is development only, so failing quietly beats crashing the app.
    }
    return;
  }
  await SecureStore.setItemAsync(ITEM, value, OPTS);
}

export async function deleteWrappedKey(): Promise<void> {
  if (!isSecureStorage) {
    try {
      globalThis.localStorage?.removeItem(ITEM);
    } catch {
      // See above.
    }
    return;
  }
  await SecureStore.deleteItemAsync(ITEM, OPTS);
}
