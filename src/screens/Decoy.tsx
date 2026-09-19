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

/** Every real tracker leads with the phase, so this one does too. */
function phaseFor(day: number): { name: string; blurb: string } {
  if (day <= 5) return { name: 'Period', blurb: 'Rest if you can.' };
  if (day <= 12) return { name: 'Follicular phase', blurb: 'Energy usually climbs now.' };
  if (day <= 15) return { name: 'Ovulation', blurb: 'Most fertile days of your cycle.' };
  return { name: 'Luteal phase', blurb: 'Symptoms often show up late in this phase.' };
}

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

/** Logs are kept against a date, so they clear naturally on a new day. */
function loadToday(): { logged: string[]; period: boolean } {
  const saved = readDecoy();
  const todayKey = new Date().toDateString();
  return saved && saved.day === todayKey
    ? { logged: saved.logged, period: saved.period }
    : { logged: [], period: false };
}

export function Decoy() {
  const insets = useSafeAreaInsets();
  const [entering, setEntering] = useState(false);
  const [{ logged, period }, setToday] = useState(loadToday);

  if (entering) return <Unlock onCancel={() => setEntering(false)} />;

  const { today, started, dayOfCycle, daysUntilNext, week } = cycleInfo();

  function save(next: { logged: string[]; period: boolean }) {
    setToday(next);
    writeDecoy({ ...next, day: new Date().toDateString() });
  }

  function toggle(symptom: string) {
    save({
      period,
      logged: logged.includes(symptom)
        ? logged.filter((s) => s !== symptom)
        : [...logged, symptom],
    });
  }

  /** Untapping is normal in real trackers — people mis-tap and undo it. */
  function togglePeriod() {
    save({ logged, period: !period });
  }

  const summary = period
    ? logged.length
      ? `Period · ${logged.length} symptom${logged.length > 1 ? 's' : ''}`
      : 'Period'
    : logged.length
      ? `${logged.length} symptom${logged.length > 1 ? 's' : ''}`
      : 'Nothing yet';

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

        <View style={styles.phaseBlock}>
          <Text style={styles.phaseName}>{phaseFor(dayOfCycle).name}</Text>
          <Text style={styles.phaseBlurb}>{phaseFor(dayOfCycle).blurb}</Text>
          <Text style={styles.prediction}>Next period in {daysUntilNext} days</Text>
        </View>

        <Pressable
          onPress={togglePeriod}
          style={({ pressed }) => [
            styles.logPeriod,
            period && styles.logPeriodOn,
            pressed && styles.logPressed,
          ]}
        >
          <Text style={[styles.logPeriodText, period && styles.logPeriodTextOn]}>
            {period ? 'Logged today · tap to undo' : 'Log period'}
          </Text>
        </Pressable>

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
            <Text style={styles.statLabel}>Logged today</Text>
            <Text style={styles.statValue}>{summary}</Text>
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

  phaseBlock: { alignItems: 'center', gap: 2 },
  phaseName: { ...type.heading, color: decoy.text },
  phaseBlurb: { ...type.small, color: decoy.subtle },
  prediction: { ...type.body, color: decoy.text, textAlign: 'center', marginTop: space.xs },

  logPeriod: {
    borderRadius: 999,
    paddingVertical: space.md,
    alignItems: 'center',
    backgroundColor: decoy.accent,
  },
  logPeriodOn: { backgroundColor: decoy.accentSoft },
  logPressed: { opacity: 0.8 },
  logPeriodText: { ...type.body, color: '#ffffff', fontWeight: '700' },
  logPeriodTextOn: { color: decoy.accent },

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
