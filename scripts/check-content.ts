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
