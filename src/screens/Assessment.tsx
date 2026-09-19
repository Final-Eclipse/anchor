/**
 * ─── LANE B1 ─────────────────────────────────────────────────────────────────
 * The intake. Delete this placeholder and build it.
 *
 * What it does:
 *   1. Show one question at a time from QUESTIONS (src/data/questions.ts).
 *   2. Collect answers as { [question.id]: option.value }.
 *   3. When she finishes — or taps Skip to the end — call
 *      scoreAssessment(answers, QUESTIONS) and navigate to 'Path'.
 *
 * Rules that matter here:
 *   · Every question must be skippable. She may have very little private time,
 *     and a half-finished intake still routes somewhere useful.
 *   · Show question.help under the prompt when it exists. Assume no finance
 *     vocabulary at all.
 *   · Never show a score, a diagnosis, or a "you are being abused" conclusion.
 *     She reports, the app responds. That's the whole relationship.
 *
 * Wiring the result up to storage is Lane A's job — get the flow working first
 * and hand the AssessmentResult over when it runs end to end.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { StyleSheet, Text } from 'react-native';
import { Screen } from '../components/Screen';
import { app, space, type } from '../theme';
import { QUESTIONS } from '../data/questions';
import type { ScreenProps } from '../navigation/types';

export default function Assessment({ navigation }: ScreenProps<'Assessment'>) {
  return (
    <Screen title="Where things stand" subtitle="You can skip anything, and stop whenever.">
      <Text style={styles.todo}>
        Lane B1 builds this. {QUESTIONS.length} questions are written and waiting in
        src/data/questions.ts — read the comment at the top of this file for what to do
        with them.
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
