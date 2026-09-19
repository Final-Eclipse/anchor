/**
 * The disguise. Lane A owns this file.
 *
 * It's a cycle tracker, and that choice does more protective work than any
 * hidden gesture could: a period tracker is the one category of app a male
 * partner reliably will not open. It is also completely unremarkable on a
 * woman's phone, so it invites no questions at all.
 *
 * It has to survive being looked at by someone suspicious, which means it has to
 * behave like a real app — the dates track today, the symptom chips respond.
 * A screen that does nothing when you touch it reads as fake immediately.
 *
 * The way in is a long-press on the big day circle. It's the focal element, so
 * touching it looks like using the app rather than performing a secret gesture.
 *
 * Known limit, and it belongs in the pitch rather than hidden: reproductive
 * coercion is a real pattern, and a partner who controls her reproductively may
 * be exactly the one who opens this. No single disguise is safe for everyone,
 * which is why letting her choose her own is on the roadmap.
 */

import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { decoy, radius, space, type } from '../theme';
import { readDecoy, writeDecoy } from '../state/decoyStore';
import { Unlock } from './Unlock';

const CYCLE_LENGTH = 28;
const SYMPTOMS = ['Cramps', 'Headache', 'Tired', 'Mood', 'Bloating'];
const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

/** Dates derive from today so the app never looks abandoned. */
function cycleInfo() {
  const today = new Date();
  const started = new Date(today);
  started.setDate(today.getDate() - 13);

  const dayOfCycle = 14;
  const daysUntilNext = CYCLE_LENGTH - dayOfCycle;

  const week = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - today.getDay() + i);
    return d;
  });

  return { today, started, dayOfCycle, daysUntilNext, week };
}

/** Symptoms are logged against a date, so they clear naturally on a new day. */
function loadLogged(): string[] {
  const saved = readDecoy();
  const todayKey = new Date().toDateString();
  return saved && saved.day === todayKey ? saved.logged : [];
}

export function Decoy() {
  const insets = useSafeAreaInsets();
  const [entering, setEntering] = useState(false);
  const [logged, setLogged] = useState<string[]>(loadLogged);

  if (entering) return <Unlock onCancel={() => setEntering(false)} />;

  const { today, started, dayOfCycle, daysUntilNext, week } = cycleInfo();

  function toggle(symptom: string) {
    const next = logged.includes(symptom)
      ? logged.filter((s) => s !== symptom)
      : [...logged, symptom];
    setLogged(next);
    writeDecoy({ logged: next, day: new Date().toDateString() });
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.pad}>
        <Text style={styles.brand}>Cycle</Text>

        <View style={styles.weekRow}>
          {week.map((d, i) => {
            const isToday = d.toDateString() === today.toDateString();
            return (
              <View key={i} style={styles.weekCell}>
                <Text style={styles.weekLabel}>{DAY_LABELS[i]}</Text>
                <View style={[styles.weekDot, isToday && styles.weekDotToday]}>
                  <Text style={[styles.weekNum, isToday && styles.weekNumToday]}>
                    {d.getDate()}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        <Pressable onLongPress={() => setEntering(true)} delayLongPress={900}>
          <View style={styles.ring}>
            <Text style={styles.ringLabel}>Day</Text>
            <Text style={styles.ringNumber}>{dayOfCycle}</Text>
            <Text style={styles.ringSub}>of {CYCLE_LENGTH}</Text>
          </View>
        </Pressable>

        <Text style={styles.prediction}>
          Next period in {daysUntilNext} days
        </Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>How are you feeling?</Text>
          <View style={styles.chips}>
            {SYMPTOMS.map((s) => {
              const on = logged.includes(s);
              return (
                <Pressable
                  key={s}
                  onPress={() => toggle(s)}
                  style={[styles.chip, on && styles.chipOn]}
                >
                  <Text style={[styles.chipText, on && styles.chipTextOn]}>{s}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>This cycle</Text>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Started</Text>
            <Text style={styles.statValue}>
              {started.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Average length</Text>
            <Text style={styles.statValue}>{CYCLE_LENGTH} days</Text>
          </View>
          <View style={[styles.statRow, styles.statRowLast]}>
            <Text style={styles.statLabel}>Logged days</Text>
            <Text style={styles.statValue}>{logged.length}</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: decoy.bg },
  pad: { padding: space.md, gap: space.md, alignItems: 'stretch' },
  brand: { ...type.title, color: decoy.text },

  weekRow: { flexDirection: 'row', justifyContent: 'space-between' },
  weekCell: { alignItems: 'center', gap: space.xs },
  weekLabel: { ...type.small, color: decoy.subtle },
  weekDot: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekDotToday: { backgroundColor: decoy.accent },
  weekNum: { ...type.small, color: decoy.text },
  weekNumToday: { color: '#ffffff', fontWeight: '700' },

  ring: {
    alignSelf: 'center',
    width: 190,
    height: 190,
    borderRadius: 95,
    borderWidth: 10,
    borderColor: decoy.accentSoft,
    backgroundColor: decoy.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: space.sm,
  },
  ringLabel: { ...type.small, color: decoy.subtle, letterSpacing: 1 },
  ringNumber: { fontSize: 64, fontWeight: '300', color: decoy.accent, lineHeight: 70 },
  ringSub: { ...type.small, color: decoy.subtle },

  prediction: { ...type.body, color: decoy.text, textAlign: 'center' },

  card: {
    backgroundColor: decoy.surface,
    borderRadius: radius.lg,
    padding: space.md,
    gap: space.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: decoy.line,
  },
  cardTitle: { ...type.body, color: decoy.text, fontWeight: '600' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  chip: {
    paddingVertical: space.sm,
    paddingHorizontal: space.md,
    borderRadius: 999,
    backgroundColor: decoy.bg,
    borderWidth: 1,
    borderColor: decoy.line,
  },
  chipOn: { backgroundColor: decoy.accentSoft, borderColor: decoy.accent },
  chipText: { ...type.small, color: decoy.subtle },
  chipTextOn: { color: decoy.accent, fontWeight: '600' },

  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: space.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: decoy.line,
  },
  statRowLast: { borderBottomWidth: 0 },
  statLabel: { ...type.small, color: decoy.subtle },
  statValue: { ...type.small, color: decoy.text, fontWeight: '600' },
});
