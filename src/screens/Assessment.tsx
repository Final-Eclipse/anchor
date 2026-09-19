/**
 * The intake. One question at a time, all of them skippable.
 *
 * She may have very little private time, so nothing here traps her: every
 * question can be passed, she can stop at any point, and a partial set of
 * answers still routes somewhere useful because unanswered questions simply
 * carry no weight.
 *
 * It never tells her she is being abused. It takes what she reports and offers
 * the plan that tends to help people in that situation. That distinction is the
 * whole relationship between her and this app, and it's easy to break by adding
 * a "your score" screen. Don't.
 */

import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Screen } from '../components/Screen';
import { app, radius, space, type } from '../theme';
import { QUESTIONS } from '../data/questions';
import { scoreAssessment } from '../data/scoring';
import { useAppData } from '../state/AppData';
import type { ScreenProps } from '../navigation/types';

export default function Assessment({ navigation }: ScreenProps<'Assessment'>) {
  const { update } = useAppData();
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const question = QUESTIONS[index];
  const isLast = index === QUESTIONS.length - 1;

  async function finish(finalAnswers: Record<string, string>) {
    setSaving(true);
    const result = scoreAssessment(finalAnswers, QUESTIONS);
    await update({ assessment: result });
    navigation.replace('Path', { pathId: result.pathId });
  }

  async function choose(value: string) {
    const next = { ...answers, [question.id]: value };
    setAnswers(next);
    if (isLast) await finish(next);
    else setIndex(index + 1);
  }

  async function skip() {
    if (isLast) await finish(answers);
    else setIndex(index + 1);
  }

  return (
    <Screen title="Where things stand" subtitle="Nothing here leaves this phone.">
      <View style={styles.progressRow}>
        {QUESTIONS.map((q, i) => (
          <View
            key={q.id}
            style={[
              styles.tick,
              i < index && styles.tickDone,
              i === index && styles.tickCurrent,
            ]}
          />
        ))}
      </View>

      <Text style={styles.prompt}>{question.prompt}</Text>
      {question.help ? <Text style={styles.help}>{question.help}</Text> : null}

      <View style={styles.options}>
        {question.options.map((option) => (
          <Pressable
            key={option.value}
            disabled={saving}
            onPress={() => choose(option.value)}
            style={({ pressed }) => [styles.option, pressed && styles.pressed]}
          >
            <Text style={styles.optionText}>{option.label}</Text>
          </Pressable>
        ))}
      </View>

      <Pressable disabled={saving} onPress={skip} style={styles.skip}>
        <Text style={styles.skipText}>
          {isLast ? 'Skip this and finish' : 'Skip this question'}
        </Text>
      </Pressable>

      {index > 0 ? (
        <Pressable disabled={saving} onPress={() => setIndex(index - 1)} style={styles.skip}>
          <Text style={styles.skipText}>Go back a question</Text>
        </Pressable>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  progressRow: { flexDirection: 'row', gap: space.xs },
  tick: { flex: 1, height: 3, borderRadius: 2, backgroundColor: app.line },
  tickDone: { backgroundColor: app.accent },
  tickCurrent: { backgroundColor: app.text },
  prompt: { ...type.heading, color: app.text, marginTop: space.sm },
  help: { ...type.body, color: app.subtle },
  options: { gap: space.sm, marginTop: space.sm },
  option: {
    backgroundColor: app.surface,
    borderRadius: radius.md,
    padding: space.md,
    borderWidth: 1,
    borderColor: app.line,
  },
  pressed: { backgroundColor: app.surfaceLift },
  optionText: { ...type.body, color: app.text, fontWeight: '600' },
  skip: { paddingVertical: space.sm, alignItems: 'center' },
  skipText: { ...type.small, color: app.subtle },
});
