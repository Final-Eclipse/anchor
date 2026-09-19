/**
 * Where she lands after unlocking.
 *
 * It leads with the next thing to do, not a menu of features. Someone opening
 * this under pressure shouldn't have to decide where to start — the app already
 * asked her, so it should already know.
 *
 * Before she's answered anything there's nothing to lead with, so it asks.
 */

import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Screen } from '../components/Screen';
import { app, radius, space, type } from '../theme';
import { PATHS } from '../data/paths';
import { useAppData } from '../state/AppData';
import type { AppStackParamList, ScreenProps } from '../navigation/types';

const ELSEWHERE: Array<{ route: keyof AppStackParamList; label: string; hint: string }> = [
  { route: 'Directory', label: 'Find help nearby', hint: 'Hotlines, legal aid, grants' },
  { route: 'Fund', label: 'Set aside', hint: 'Amounts and dates only' },
  { route: 'Vault', label: 'Documents', hint: 'Encrypted on this phone' },
  { route: 'AccountGuide', label: 'An account of your own', hint: 'How to open one that stays yours' },
  { route: 'SetupCheck', label: 'Setup check', hint: 'Dev only — remove before judging' },
];

export default function Home({ navigation }: ScreenProps<'Home'>) {
  const { data } = useAppData();
  const assessment = data.assessment;
  const path = assessment ? PATHS[assessment.pathId] : undefined;

  const steps = path
    ? path.steps.filter((s) => !s.requires || assessment!.modifiers.includes(s.requires))
    : [];
  const nextStep = steps.find((s) => !data.completedSteps.includes(s.id));
  const doneCount = steps.filter((s) => data.completedSteps.includes(s.id)).length;

  return (
    <Screen title="Anchor" subtitle="Nothing here leaves this phone.">
      {path ? (
        <Pressable
          onPress={() => navigation.navigate('Path')}
          style={({ pressed }) => [styles.lead, pressed && styles.pressed]}
        >
          <Text style={styles.leadLabel}>YOUR PLAN</Text>
          <Text style={styles.leadTitle}>{path.title}</Text>
          {nextStep ? (
            <>
              <Text style={styles.leadNextLabel}>Next</Text>
              <Text style={styles.leadNext}>{nextStep.title}</Text>
            </>
          ) : (
            <Text style={styles.leadNext}>Every step done. Answer again if things change.</Text>
          )}
          <Text style={styles.leadProgress}>
            {doneCount} of {steps.length} done
          </Text>
        </Pressable>
      ) : (
        <Pressable
          onPress={() => navigation.navigate('Assessment')}
          style={({ pressed }) => [styles.lead, pressed && styles.pressed]}
        >
          <Text style={styles.leadLabel}>START HERE</Text>
          <Text style={styles.leadTitle}>A few questions</Text>
          <Text style={styles.leadNext}>
            They take a couple of minutes, you can skip any of them, and they let this build a
            plan around your situation instead of a generic list.
          </Text>
        </Pressable>
      )}

      <View style={styles.list}>
        {ELSEWHERE.map((d) => (
          <Pressable
            key={d.route}
            onPress={() => navigation.navigate(d.route as never)}
            style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
          >
            <View style={styles.rowText}>
              <Text style={styles.label}>{d.label}</Text>
              <Text style={styles.hint}>{d.hint}</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  lead: {
    backgroundColor: app.surface,
    borderRadius: radius.lg,
    padding: space.md,
    gap: space.xs,
    borderWidth: 1,
    borderColor: app.accent,
  },
  pressed: { opacity: 0.8 },
  leadLabel: { ...type.label, color: app.accent },
  leadTitle: { ...type.heading, color: app.text },
  leadNextLabel: { ...type.label, color: app.subtle, marginTop: space.sm },
  leadNext: { ...type.body, color: app.text },
  leadProgress: { ...type.small, color: app.subtle, marginTop: space.sm },

  list: { gap: space.sm },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: app.surface,
    borderRadius: radius.md,
    padding: space.md,
    gap: space.md,
  },
  rowPressed: { backgroundColor: app.surfaceLift },
  rowText: { flex: 1 },
  label: { ...type.body, color: app.text, fontWeight: '600' },
  hint: { ...type.small, color: app.subtle, marginTop: 2 },
  chevron: { ...type.heading, color: app.subtle },
});
