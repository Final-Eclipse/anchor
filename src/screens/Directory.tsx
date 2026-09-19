/**
 * The help directory: organisations, filtered by what she needs.
 *
 * The cards themselves live in components/ResourceCard, because the end of her
 * plan shows the same organisations and the two lists must look identical.
 * That component is also what routes every call and link through the exit
 * interstitial — never link directly from here.
 *
 * Entries that haven't been verified by a human are marked. A wrong hotline
 * number is worse than no entry, so nothing unchecked should be on screen at
 * judging — `npm run check` lists what's outstanding.
 */

import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Screen } from '../components/Screen';
import { ResourceCard } from '../components/ResourceCard';
import { app, radius, space, type } from '../theme';
import { RESOURCES } from '../data/resources';
import type { NeedCategory } from '../data/types';
import type { ScreenProps } from '../navigation/types';

const CATEGORIES: Array<{ id: NeedCategory; label: string }> = [
  { id: 'hotline', label: 'Someone to talk to' },
  { id: 'shelter', label: 'Somewhere to stay' },
  { id: 'legal', label: 'Legal help' },
  { id: 'emergency-cash', label: 'Emergency money' },
  { id: 'housing', label: 'Housing' },
  { id: 'job-training', label: 'Work & training' },
];

export default function Directory({ route }: ScreenProps<'Directory'>) {
  const [filter, setFilter] = useState<NeedCategory | null>(route.params?.filter ?? null);

  const shown = filter ? RESOURCES.filter((r) => r.categories.includes(filter)) : RESOURCES;

  return (
    <Screen title="Find help nearby" subtitle="Atlanta and Georgia, plus national lines.">
      <View style={styles.filters}>
        <Pressable
          onPress={() => setFilter(null)}
          style={[styles.chip, filter === null && styles.chipOn]}
        >
          <Text style={[styles.chipText, filter === null && styles.chipTextOn]}>Everything</Text>
        </Pressable>
        {CATEGORIES.map((c) => (
          <Pressable
            key={c.id}
            onPress={() => setFilter(c.id)}
            style={[styles.chip, filter === c.id && styles.chipOn]}
          >
            <Text style={[styles.chipText, filter === c.id && styles.chipTextOn]}>
              {c.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {shown.length === 0 ? (
        <Text style={styles.empty}>Nothing listed here yet.</Text>
      ) : (
        shown.map((r) => <ResourceCard key={r.id} resource={r} />)
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  chip: {
    paddingVertical: space.sm,
    paddingHorizontal: space.md,
    borderRadius: 999,
    backgroundColor: app.surface,
    borderWidth: 1,
    borderColor: app.line,
  },
  chipOn: { backgroundColor: app.accent, borderColor: app.accent },
  chipText: { ...type.small, color: app.subtle },
  chipTextOn: { color: app.bg, fontWeight: '700' },

  empty: { ...type.body, color: app.subtle },
});
