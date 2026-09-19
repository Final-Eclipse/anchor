/**
 * ─── LANE A ──────────────────────────────────────────────────────────────────
 * Document storage. Delete this placeholder and build it.
 *
 * What it does:
 *   1. Pick a photo (expo-image-picker — install it, it works in Expo Go).
 *   2. Read the bytes, encryptBytes() them, write the base64 to app storage
 *      with expo-file-system.
 *   3. Keep a VaultDocMeta list (src/data/types.ts) in the encrypted state.
 *   4. Decrypt and show one when tapped.
 *
 * This is the most expensive feature in the MVP — four moving parts that each
 * work alone and argue when combined. Build it after the shell is solid, and if
 * hour 14 arrives and it's still fighting you, cut it. A working app without a
 * vault beats a broken app with one.
 *
 * Two things to get right:
 *   · Never write a decrypted file to disk, not even briefly. Decrypt into
 *     memory and render from there.
 *   · Exclude the storage directory from iOS backup, or iCloud quietly copies
 *     her documents to every device on the family account. This is the leak the
 *     whole app exists to prevent, and it is on by default.
 *
 * Call it "documents" in the UI, never "evidence" — whether something is
 * admissible is a lawyer's question and we shouldn't imply an answer.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { StyleSheet, Text } from 'react-native';
import { Screen } from '../components/Screen';
import { app, space, type } from '../theme';

export default function Vault() {
  return (
    <Screen title="Documents" subtitle="Encrypted on this phone. Nowhere else.">
      <Text style={styles.todo}>
        Lane A builds this, after the shell. See the comment at the top of this file —
        especially the iOS backup exclusion.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  todo: {
    ...type.body,
    color: app.subtle,
    backgroundColor: app.surface,
    padding: space.md,
    borderRadius: 10,
  },
});
