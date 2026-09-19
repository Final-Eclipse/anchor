/**
 * Sanity checks for lane C's content. Run it after editing questions or paths:
 *
 *   npm run check
 *
 * It answers three questions you otherwise only find out at judging:
 * does every path come out reachable, does every step point somewhere real,
 * and is anything still unverified.
 */

import { QUESTIONS } from '../src/data/questions';
import { PATHS } from '../src/data/paths';
import { RESOURCES, unverified } from '../src/data/resources';
import {
  danglingResourceIds,
  matchResources,
  unreachableResourceIds,
} from '../src/data/matching';
import { scoreAssessment } from '../src/data/scoring';
import type { PathId } from '../src/data/types';

let failures = 0;
const fail = (msg: string) => {
  console.error('  FAIL  ' + msg);
  failures++;
};
const pass = (msg: string) => console.log('  ok    ' + msg);

// ── every path is reachable ──────────────────────────────────────────────
console.log('\nRouting');

const personas: Array<{ who: string; answers: Record<string, string>; expect: PathId }> = [
  {
    who: 'reports feeling unsafe',
    answers: { 'safety-now': 'yes', 'own-account': 'yes', 'own-income': 'yes' },
    expect: 'safety-first',
  },
  {
    who: 'no account, no income of her own',
    answers: {
      'safety-now': 'no',
      'own-account': 'no',
      'own-income': 'none',
      'spending-permission': 'always',
      'debt-visibility': 'no',
    },
    expect: 'no-money-of-her-own',
  },
  {
    who: 'earns and controls her own money',
    answers: {
      'safety-now': 'no',
      'own-account': 'yes',
      'own-income': 'yes',
      'spending-permission': 'no',
      'debt-visibility': 'yes',
    },
    expect: 'partly-independent',
  },
];

for (const p of personas) {
  const got = scoreAssessment(p.answers, QUESTIONS).pathId;
  got === p.expect
    ? pass(`${p.who} -> ${got}`)
    : fail(`${p.who} -> got ${got}, expected ${p.expect}`);
}

// a danger answer must win even when everything else points elsewhere
const override = scoreAssessment(
  { 'safety-now': 'yes', 'own-account': 'yes', 'own-income': 'yes', 'debt-visibility': 'yes' },
  QUESTIONS
).pathId;
override === 'safety-first'
  ? pass('danger answer overrides the totals')
  : fail(`danger answer did not override (got ${override})`);

// a half-finished intake still lands somewhere
const partial = scoreAssessment({ 'own-account': 'no' }, QUESTIONS);
PATHS[partial.pathId] ? pass('partial intake still routes') : fail('partial intake routed nowhere');

// the children overlay comes through
const kids = scoreAssessment({ 'safety-now': 'no', children: 'yes' }, QUESTIONS);
kids.modifiers.includes('children')
  ? pass('children modifier applied')
  : fail('children modifier lost');

// ── paths are well formed ────────────────────────────────────────────────
console.log('\nPaths');

for (const id of ['safety-first', 'no-money-of-her-own', 'partly-independent'] as PathId[]) {
  const path = PATHS[id];
  if (!path) {
    fail(`${id} has no definition`);
    continue;
  }
  path.steps.length >= 3
    ? pass(`${id} has ${path.steps.length} steps`)
    : fail(`${id} has only ${path.steps.length} steps`);

  for (const step of path.steps) {
    const action = step.action;
    if (action?.kind === 'directory') {
      const matches = RESOURCES.filter((r) => r.categories.includes(action.filter));
      if (matches.length === 0) fail(`${id}/${step.id} filters to an empty directory`);
    }
  }
}

// ── the matched directory at the end of a plan ───────────────────────────
console.log('\nMatching');

const dangling = danglingResourceIds();
dangling.length === 0
  ? pass('every match rule points at a resource that exists')
  : fail(`match rules name missing resources: ${dangling.join(', ')}`);

// She can skip everything. That must still produce something to show, or the
// end of her plan is a heading over an empty space.
const emptyIntake = matchResources(scoreAssessment({}, QUESTIONS));
emptyIntake.length > 0
  ? pass(`a fully skipped intake still matches ${emptyIntake.length} group(s)`)
  : fail('a fully skipped intake matches nothing');

// Walk every answer to each question, on its own, and confirm nothing throws
// and every group that appears has something in it.
for (const question of QUESTIONS) {
  for (const option of question.options) {
    const result = scoreAssessment({ [question.id]: option.value }, QUESTIONS);
    const groups = matchResources(result);
    const empty = groups.filter((g) => g.resources.length === 0);
    if (empty.length) {
      fail(`${question.id}=${option.value} produced empty group(s): ${empty.map((g) => g.id).join(', ')}`);
    }
  }
}
pass(`every single answer produces well-formed groups (${QUESTIONS.reduce((n, q) => n + q.options.length, 0)} checked)`);

// No resource should appear twice in one plan — she shouldn't scroll past the
// same hotline under three different headings.
const everything = matchResources(
  scoreAssessment(
    {
      'safety-now': 'yes',
      'own-account': 'no',
      'own-income': 'none',
      'spending-permission': 'always',
      'debt-visibility': 'coerced',
      children: 'yes',
    },
    QUESTIONS
  )
);
const shownIds = everything.flatMap((g) => g.resources.map((r) => r.id));
shownIds.length === new Set(shownIds).size
  ? pass(`highest-need answers show ${shownIds.length} organisations, none repeated`)
  : fail('the same resource appears in more than one group');

const unreachable = unreachableResourceIds();
if (unreachable.length) {
  console.log(`  note  only findable by browsing: ${unreachable.join(', ')}`);
}

// ── content readiness ────────────────────────────────────────────────────
console.log('\nContent');

const pending = unverified();
console.log(`  ${RESOURCES.length - pending.length}/${RESOURCES.length} resources verified`);
if (pending.length) {
  console.log('  still to verify: ' + pending.map((r) => r.name).join(', '));
}

console.log(
  failures === 0
    ? `\nAll structural checks passed.${pending.length ? ' Content verification still outstanding.' : ''}\n`
    : `\n${failures} check(s) failed.\n`
);
process.exit(failures === 0 ? 0 : 1);
