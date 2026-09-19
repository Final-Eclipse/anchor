/**
 * What anyone who opens the app sees. Lane A owns this file.
 *
 * It has to survive being looked at by someone who is suspicious. That means it
 * behaves like a real notes app, not a splash screen — the entries are dull and
 * plausible, tapping one opens it, and nothing hints there is anything else here.
 *
 * The way in is a long-press on the "Notes" title. Chosen because nobody
 * discovers it by accident and she can do it without looking.
 *
 * TODO (Lane A): let the notes be edited and persist. A decoy that cannot be
 * used is a decoy that gets questioned.
 */

import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { decoy, radius, space, type } from '../theme';
import { Unlock } from './Unlock';

const NOTES = [
  { title: 'Groceries', body: 'eggs, rice, dish soap, paper towels' },
  { title: 'Oil change', body: 'due around 92k miles' },
  { title: 'Birthday ideas', body: 'the blue scarf she liked' },
  { title: 'Wifi', body: 'restart the router if it drops again' },
  { title: 'Recipe', body: '350 for 40 min, cover the top halfway' },
];

export function Decoy() {
  const insets = useSafeAreaInsets();
  const [entering, setEntering] = useState(false);
  const [openNote, setOpenNote] = useState<number | null>(null);

  if (entering) return <Unlock onCancel={() => setEntering(false)} />;

  if (openNote !== null) {
    const note = NOTES[openNote];
    return (
      <View style={[styles.root, { paddingTop: insets.top }]}>
        <ScrollView contentContainerStyle={styles.pad}>
          <Pressable onPress={() => setOpenNote(null)} hitSlop={12}>
            <Text style={styles.back}>‹ Notes</Text>
          </Pressable>
          <Text style={styles.noteTitle}>{note.title}</Text>
          <Text style={styles.noteBody}>{note.body}</Text>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.pad}>
        <Pressable onLongPress={() => setEntering(true)} delayLongPress={900}>
          <Text style={styles.title}>Notes</Text>
        </Pressable>

        {NOTES.map((note, i) => (
          <Pressable
            key={note.title}
            onPress={() => setOpenNote(i)}
            style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
          >
            <Text style={styles.rowTitle}>{note.title}</Text>
            <Text style={styles.rowBody} numberOfLines={1}>
              {note.body}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: decoy.bg },
  pad: { padding: space.md, gap: space.sm },
  title: { ...type.title, color: decoy.text, marginBottom: space.sm },
  row: {
    backgroundColor: decoy.surface,
    borderRadius: radius.md,
    padding: space.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: decoy.line,
  },
  rowPressed: { opacity: 0.6 },
  rowTitle: { ...type.body, color: decoy.text, fontWeight: '600' },
  rowBody: { ...type.small, color: decoy.subtle, marginTop: 2 },
  back: { ...type.body, color: decoy.accent, marginBottom: space.md },
  noteTitle: { ...type.heading, color: decoy.text, marginBottom: space.sm },
  noteBody: { ...type.body, color: decoy.text },
});
