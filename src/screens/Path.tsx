/**
 * Her plan: an ordered checklist built from her answers.
 *
 * A path creates almost no new surface of its own — each step points at
 * something that already exists. That's the only reason three complete paths
 * are affordable, and it's why this screen is mostly routing.
 *
 * Steps marked `requires` only appear when she has that overlay, which is how
 * the children modifier works: one flag, applied across all three paths.
 *
 * Calls and links go through the exit interstitial, never straight to Linking.
 * A call lands in her recent calls and a link lands in browser history, and
 * this app cannot clean up after either — so it warns her first, every time.
 */

import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Screen } from '../components/Screen';
import { app, radius, space, type } from '../theme';
import { PATHS } from '../data/paths';
import { useAppData } from '../state/AppData';
import { useExitWarning } from '../components/ExitWarning';
import type { PathStep } from '../data/types';
import type { ScreenProps } from '../navigation/types';

export default function Path({ route, navigation }: ScreenProps<'Path'>) {
  const { data, update } = useAppData();
  const confirmExit = useExitWarning();

  // The route param wins when she has just finished the intake; otherwise fall
  // back to what's saved, so returning here later still shows her plan.
  const pathId = route.params?.pathId ?? data.assessment?.pathId;
  const path = pathId ? PATHS[pathId] : undefined;
  const modifiers = data.assessment?.modifiers ?? [];
  const done = data.completedSteps;

  if (!path) {
    return (
      <Screen title="Your plan" subtitle="A few questions first.">
        <Text style={styles.empty}>
          Answering a few questions lets this build a plan around your situation rather than a
          generic list. You can skip anything, and stop whenever you like.
        </Text>
        <Pressable
          onPress={() => navigation.navigate('Assessment')}
          style={({ pressed }) => [styles.primary, pressed && styles.pressed]}
        >
          <Text style={styles.primaryText}>Start</Text>
        </Pressable>
      </Screen>
    );
  }

  const steps = path.steps.filter((s) => !s.requires || modifiers.includes(s.requires));

  function follow(step: PathStep) {
    const action = step.action;
    if (!action) return;

    switch (action.kind) {
      case 'screen':
        navigation.navigate(action.screen);
        break;
      case 'directory':
        navigation.navigate('Directory', { filter: action.filter });
        break;
      case 'call':
      case 'external':
        confirmExit(action);
        break;
    }
  }

  function toggle(step: PathStep) {
    update((d) => ({
      completedSteps: d.completedSteps.includes(step.id)
        ? d.completedSteps.filter((id) => id !== step.id)
        : [...d.completedSteps, step.id],
    }));
  }

  return (
    <Screen title={path.title} subtitle={path.premise}>
      {steps.map((step, i) => {
        const checked = done.includes(step.id);
        return (
          <View key={step.id} style={styles.step}>
            <Pressable onPress={() => toggle(step)} hitSlop={8} style={styles.checkWrap}>
              <View style={[styles.check, checked && styles.checkOn]}>
                {checked ? <Text style={styles.checkMark}>✓</Text> : null}
              </View>
            </Pressable>

            <Pressable style={styles.stepBody} onPress={() => follow(step)}>
              <Text style={styles.stepIndex}>STEP {i + 1}</Text>
              <Text style={[styles.stepTitle, checked && styles.stepTitleDone]}>
                {step.title}
              </Text>
              <Text style={styles.stepText}>{step.body}</Text>
              {step.action ? <Text style={styles.stepGo}>Open ›</Text> : null}
            </Pressable>
          </View>
        );
      })}

      <Pressable
        onPress={() => navigation.navigate('Assessment')}
        style={styles.redo}
      >
        <Text style={styles.redoText}>Things have changed — answer again</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  empty: { ...type.body, color: app.subtle },
  primary: {
    backgroundColor: app.accent,
    borderRadius: radius.md,
    paddingVertical: space.md,
    alignItems: 'center',
  },
  primaryText: { ...type.body, color: app.bg, fontWeight: '700' },
  pressed: { opacity: 0.7 },

  step: {
    flexDirection: 'row',
    gap: space.md,
    backgroundColor: app.surface,
    borderRadius: radius.md,
    padding: space.md,
  },
  checkWrap: { paddingTop: 2 },
  check: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: app.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkOn: { backgroundColor: app.accent, borderColor: app.accent },
  checkMark: { color: app.bg, fontSize: 14, fontWeight: '700' },
  stepBody: { flex: 1, gap: 2 },
  stepIndex: { ...type.label, color: app.subtle },
  stepTitle: { ...type.body, color: app.text, fontWeight: '600' },
  stepTitleDone: { color: app.subtle, textDecorationLine: 'line-through' },
  stepText: { ...type.small, color: app.subtle, marginTop: 2 },
  stepGo: { ...type.small, color: app.accent, marginTop: space.sm, fontWeight: '600' },

  redo: { paddingVertical: space.md, alignItems: 'center' },
  redoText: { ...type.small, color: app.subtle },
});
