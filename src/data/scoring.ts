/**
 * Maps answers to one of three paths. Lane C tunes the weights in questions.ts;
 * this file shouldn't need to change.
 *
 * Deliberately not a decision tree. Four yes/no axes branch into sixteen plans
 * nobody has time to write well, and half-written plans are worse than three
 * complete ones.
 */

import type { AssessmentResult, Modifier, PathId, Question } from './types';

/** Ties break toward the more cautious path. */
const CAUTION_ORDER: PathId[] = ['safety-first', 'no-money-of-her-own', 'partly-independent'];

export function scoreAssessment(
  answers: Record<string, string>,
  questions: Question[]
): AssessmentResult {
  const totals: Record<PathId, number> = {
    'safety-first': 0,
    'no-money-of-her-own': 0,
    'partly-independent': 0,
  };
  const modifiers = new Set<Modifier>();
  let override: PathId | null = null;

  for (const question of questions) {
    const chosen = answers[question.id];
    if (chosen === undefined) continue;

    const option = question.options.find((o) => o.value === chosen);
    if (!option) continue;

    for (const [path, points] of Object.entries(option.weights)) {
      totals[path as PathId] += points ?? 0;
    }
    option.flags?.forEach((f) => modifiers.add(f));

    // An answer signalling danger wins outright, however she answered the rest.
    if (option.overrides) override = option.overrides;
  }

  return {
    pathId: override ?? pickHighest(totals),
    modifiers: [...modifiers],
    answers,
    completedAt: Date.now(),
  };
}

function pickHighest(totals: Record<PathId, number>): PathId {
  return CAUTION_ORDER.reduce((best, path) =>
    totals[path] > totals[best] ? path : best
  );
}

/**
 * She can stop partway through. Anything unanswered simply carries no weight,
 * so a half-finished intake still lands somewhere useful rather than nowhere.
 */
export function isAnswered(answers: Record<string, string>, question: Question): boolean {
  return answers[question.id] !== undefined;
}
