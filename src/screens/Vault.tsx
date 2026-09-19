/**
 * Encrypted documents. Lane A owns this file.
 *
 * Photograph the papers that are hard to reach later — ID, birth certificates,
 * account statements, a lease. Each one is encrypted with her data key and
 * written to its own file; the titles live in the encrypted state blob, so the
 * file listing itself gives nothing away.
 *
 * Nothing decrypted is ever written to disk. Viewing decrypts into memory and
 * renders from a data URI, which disappears when the screen closes.
 *
 * The word is "documents", never "evidence" — whether something is admissible is
 * a lawyer's question and we shouldn't imply an answer.
 *
 * TODO (Lane A): exclude the docs directory from iOS backup. The contents are
 * ciphertext and the key never leaves the device, so a backup copy is not a
 * disaster — but it shouldn't be there at all.
 */

import { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { randomUUID } from 'expo-crypto';
import { Screen } from '../components/Screen';
import { app, radius, space, type } from '../theme';
import { encryptBase64, decryptToBase64 } from '../crypto/vault';
import { writeDoc, readDoc, deleteDoc } from '../crypto/docStore';
import { useAppData } from '../state/AppData';
import { useConfirm } from '../components/Confirm';
import type { VaultDocMeta } from '../data/types';

export default function Vault() {
  const { data, update } = useAppData();
  const confirm = useConfirm();
  const [busy, setBusy] = useState(false);
  const [viewing, setViewing] = useState<{ meta: VaultDocMeta; uri: string } | null>(null);

  async function add() {
    const picked = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      base64: true,
      quality: 0.7,
    });
    if (picked.canceled || !picked.assets[0]?.base64) return;

    setBusy(true);
    try {
      const asset = picked.assets[0];
      const id = randomUUID();
      await writeDoc(id, await encryptBase64(asset.base64!));

      const meta: VaultDocMeta = {
        id,
        title: `Document ${data.docs.length + 1}`,
        mime: asset.mimeType ?? 'image/jpeg',
        bytes: asset.base64!.length,
        addedAt: Date.now(),
      };
      await update((d) => ({ docs: [...d.docs, meta] }));
    } finally {
      setBusy(false);
    }
  }

  async function view(meta: VaultDocMeta) {
    setBusy(true);
    try {
      const blob = await readDoc(meta.id);
      if (!blob) return;
      const base64 = await decryptToBase64(blob);
      setViewing({ meta, uri: `data:${meta.mime};base64,${base64}` });
    } finally {
      setBusy(false);
    }
  }

  async function confirmRemove(meta: VaultDocMeta) {
    const yes = await confirm({
      title: 'Remove this document?',
      body: 'It will be deleted from this phone. This cannot be undone.',
      confirmLabel: 'Remove',
      cancelLabel: 'Keep it',
      destructive: true,
    });
    if (!yes) return;

    await deleteDoc(meta.id);
    await update((d) => ({ docs: d.docs.filter((x) => x.id !== meta.id) }));
  }

  return (
    <Screen title="Documents" subtitle="Encrypted on this phone. Nowhere else.">
      <Pressable
        onPress={add}
        disabled={busy}
        style={({ pressed }) => [styles.add, pressed && styles.pressed]}
      >
        <Text style={styles.addText}>{busy ? 'Working…' : 'Add a photo'}</Text>
      </Pressable>

      {data.docs.length === 0 ? (
        <Text style={styles.empty}>
          Photograph anything that would be hard to get to later — ID, birth certificates,
          statements, a lease. It is easier now than after you leave.
        </Text>
      ) : (
        data.docs.map((meta) => (
          <Pressable
            key={meta.id}
            onPress={() => view(meta)}
            onLongPress={() => confirmRemove(meta)}
            style={({ pressed }) => [styles.row, pressed && styles.pressed]}
          >
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>{meta.title}</Text>
              <Text style={styles.rowMeta}>
                {new Date(meta.addedAt).toLocaleDateString()} · hold to remove
              </Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </Pressable>
        ))
      )}

      {busy ? <ActivityIndicator color={app.accent} /> : null}

      {/* The vault is a safe place for copies, not a replacement for originals.
          Someone who deletes the original after photographing it has made this
          app a single point of failure — and if she ever loses her code, that
          document is gone. Say it plainly, where she'll read it. */}
      <Text style={styles.keepOriginals}>
        Keep the originals wherever they are. This is somewhere safe for copies, not a
        replacement — if you ever lose your code, anything only stored here goes with it.
      </Text>

      <Modal visible={viewing !== null} transparent animationType="fade">
        <View style={styles.viewer}>
          <Pressable style={styles.viewerClose} onPress={() => setViewing(null)}>
            <Text style={styles.viewerCloseText}>Done</Text>
          </Pressable>
          {viewing ? (
            <Image source={{ uri: viewing.uri }} style={styles.image} resizeMode="contain" />
          ) : null}
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  add: {
    backgroundColor: app.accent,
    borderRadius: radius.md,
    paddingVertical: space.md,
    alignItems: 'center',
  },
  addText: { ...type.body, color: app.bg, fontWeight: '700' },
  pressed: { opacity: 0.7 },
  empty: { ...type.body, color: app.subtle },
  keepOriginals: {
    ...type.small,
    color: app.gold,
    backgroundColor: app.surface,
    borderRadius: radius.sm,
    padding: space.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: app.surface,
    borderRadius: radius.md,
    padding: space.md,
  },
  rowText: { flex: 1 },
  rowTitle: { ...type.body, color: app.text, fontWeight: '600' },
  rowMeta: { ...type.small, color: app.subtle, marginTop: 2 },
  chevron: { ...type.heading, color: app.subtle },
  viewer: { flex: 1, backgroundColor: '#000000', justifyContent: 'center' },
  viewerClose: { position: 'absolute', top: 60, right: space.md, zIndex: 1 },
  viewerCloseText: { ...type.body, color: '#ffffff', fontWeight: '600' },
  image: { width: '100%', height: '80%' },
});
