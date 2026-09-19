/**
 * The help directory: organisations, filtered by what she needs.
 *
 * Every phone number and link goes through the exit interstitial. A call lands
 * in her recent calls and a link lands in browser history, and this app cannot
 * remove either afterwards — so it warns her first and offers to show the number
 * instead of dialling it.
 *
 * Entries that haven't been verified by a human are marked. A wrong hotline
 * number is worse than no entry, so nothing unchecked should be on screen at
 * judging — `npm run check` lists what's outstanding.
 */

import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Screen } from '../components/Screen';
import { app, radius, space, type } from '../theme';
import { RESOURCES } from '../data/resources';
import { useExitWarning } from '../components/ExitWarning';
import type { NeedCategory, Resource } from '../data/types';
import type { ScreenProps } from '../navigation/types';

const CATEGORIES: Array<{ id: NeedCategory; label: string }> = [
  { id: 'hotline', label: 'Someone to talk to' },
  { id: 'shelter', label: 'Somewhere to stay' },
  { id: 'legal', label: 'Legal help' },
  { id: 'emergency-cash', label: 'Emergency money' },
  { id: 'housing', label: 'Housing' },
  { id: 'job-training', label: 'Work & training' },
];

const AREA_LABEL: Record<Resource['area'], string> = {
  'downtown-atlanta': 'Downtown Atlanta',
  'metro-atlanta': 'Metro Atlanta',
  georgia: 'Georgia',
  national: 'National',
};

export default function Directory({ route }: ScreenProps<'Directory'>) {
  const [filter, setFilter] = useState<NeedCategory | null>(route.params?.filter ?? null);
  const confirmExit = useExitWarning();

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
        shown.map((r) => (
          <View key={r.id} style={styles.card}>
            <View style={styles.cardHead}>
              <Text style={styles.name}>{r.name}</Text>
              <Text style={styles.area}>{AREA_LABEL[r.area]}</Text>
            </View>

            <Text style={styles.description}>{r.description}</Text>
            {r.note ? <Text style={styles.note}>{r.note}</Text> : null}

            <View style={styles.actions}>
              {r.phone ? (
                <Pressable
                  onPress={() => confirmExit({ kind: 'call', number: r.phone! })}
                  style={({ pressed }) => [styles.action, pressed && styles.pressed]}
                >
                  <Text style={styles.actionText}>Call</Text>
                </Pressable>
              ) : null}
              {r.url ? (
                <Pressable
                  onPress={() => confirmExit({ kind: 'external', url: r.url! })}
                  style={({ pressed }) => [styles.action, pressed && styles.pressed]}
                >
                  <Text style={styles.actionText}>Website</Text>
                </Pressable>
              ) : null}
            </View>

            {r.verified ? null : (
              <Text style={styles.unverified}>
                Contact details not confirmed yet — Lane C is verifying these.
              </Text>
            )}
          </View>
        ))
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
  card: {
    backgroundColor: app.surface,
    borderRadius: radius.md,
    padding: space.md,
    gap: space.xs,
  },
  cardHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  name: { ...type.body, color: app.text, fontWeight: '600', flex: 1 },
  area: { ...type.label, color: app.subtle },
  description: { ...type.small, color: app.subtle, marginTop: 2 },
  note: { ...type.small, color: app.accent },
  actions: { flexDirection: 'row', gap: space.sm, marginTop: space.sm },
  action: {
    backgroundColor: app.surfaceLift,
    borderRadius: radius.sm,
    paddingVertical: space.sm,
    paddingHorizontal: space.lg,
  },
  pressed: { opacity: 0.7 },
  actionText: { ...type.small, color: app.text, fontWeight: '600' },
  unverified: { ...type.small, color: app.gold, marginTop: space.sm },
});
