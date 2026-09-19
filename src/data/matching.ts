/**
 * Answers -> the organisations worth putting in front of her. Lane C owns this.
 *
 * This is NOT scoring. scoring.ts picks one of three plans and is deliberately
 * coarse. This file is the opposite: it reads the individual answers and pulls
 * out the specific organisations that match them, so the plan stays short while
 * the directory still arrives tailored.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * RULES FOR ANYTHING ADDED HERE
 *
 * 1. `reason` is shown to her, verbatim, above the group. It must describe what
 *    she reported and nothing more. "You said you do not have an account only
 *    you can see" is fine. "You are being financially abused" is not, and never
 *    will be — that is the line this whole app is built around.
 *
 * 2. Never infer something she did not answer. We do not ask about pets,
 *    immigration status or language, so no rule may claim she has a pet or is
 *    an immigrant. Where a resource matters but we have no answer for it, put
 *    it in UNPROMPTED at the bottom, which is honestly labelled as not being
 *    based on her answers.
 *
 * 3. Order inside `resources` matters — most relevant first. A resource that
 *    matches several rules is shown once, under the first rule that claimed it,
 *    so put the most specific rules earliest in the array.
 *
 * `npm run check` fails if a rule names a resource id that doesn't exist, and
 * warns if a resource is unreachable by every possible set of answers.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { RESOURCES } from './resources';
import type { AssessmentResult, Resource } from './types';

export interface MatchRule {
  /** Stable id, used by the checks. Not shown to her. */
  id: string;
  /**
   * Shown above the group, verbatim. Describes what she reported — never what
   * it means about her. See rule 1 above.
   */
  reason: string;
  /** Resource ids, most relevant first. */
  resources: string[];
  /** Omit for a rule that always applies. */
  when?: (r: AssessmentResult) => boolean;
}

const answered = (r: AssessmentResult, question: string, ...values: string[]) =>
  values.includes(r.answers[question] ?? '');

export const MATCH_RULES: MatchRule[] = [
  {
    id: 'unsafe-now',
    reason: 'You said you do not feel safe right now.',
    when: (r) => answered(r, 'safety-now', 'yes', 'unsure'),
    resources: ['ndvh', 'ga-haven', 'padv'],
  },
  {
    id: 'somewhere-tonight',
    reason: 'Places with beds tonight. Each one covers a different county.',
    when: (r) => answered(r, 'safety-now', 'yes', 'unsure') || r.pathId === 'safety-first',
    resources: ['wrcdv', 'livesafe-cobb', 'securus-house', 'promise-place'],
  },
  {
    id: 'pets',
    reason: 'If a pet is part of what makes leaving hard.',
    when: (r) => answered(r, 'safety-now', 'yes', 'unsure') || r.pathId === 'safety-first',
    resources: ['ahimsa-house'],
  },
  {
    id: 'coerced-debt',
    reason: 'You said there is debt you did not agree to.',
    when: (r) => answered(r, 'debt-visibility', 'coerced'),
    resources: ['cfpb', 'atlanta-legal-aid', 'ga-legal-services', 'georgia-legal-aid-web'],
  },
  {
    id: 'debt-unknown',
    reason: 'You said you do not know what is owed in your name.',
    when: (r) => answered(r, 'debt-visibility', 'no'),
    resources: ['cfpb', 'georgia-legal-aid-web'],
  },
  {
    id: 'no-money-in',
    reason: 'You said the money coming in is not yours to control.',
    when: (r) => answered(r, 'own-income', 'none', 'controlled'),
    resources: [
      'ga-gateway',
      'united-way-211',
      'ga-victims-comp',
      'freefrom',
      'atlanta-food-bank',
    ],
  },
  {
    id: 'no-account',
    reason: 'You said you do not have an account only you can see.',
    when: (r) => answered(r, 'own-account', 'no', 'joint-only'),
    resources: ['ga-gateway', 'united-way-211', 'freefrom'],
  },
  {
    id: 'spending-watched',
    reason: 'You said you have to explain what you spend.',
    when: (r) => answered(r, 'spending-permission', 'always', 'large'),
    resources: ['united-way-211', 'freefrom', 'ga-victims-comp'],
  },
  {
    id: 'income-of-your-own',
    reason: 'Free places to start, if you want income of your own.',
    when: (r) => answered(r, 'own-income', 'none', 'controlled'),
    resources: ['goodwill-north-georgia', 'ywca-atlanta', 'jfcs-atlanta', 'ga-dol'],
  },
  {
    id: 'children',
    reason: 'You said there are children involved.',
    when: (r) => r.modifiers.includes('children'),
    resources: ['atlanta-legal-aid', 'avlf', 'ga-legal-services', 'nicholas-house', 'ga-gateway'],
  },
  {
    id: 'own-footing',
    reason: 'You said you already have some footing of your own.',
    when: (r) => r.pathId === 'partly-independent',
    resources: ['ywca-atlanta', 'goodwill-north-georgia', 'jfcs-atlanta', 'ga-dol'],
  },
  {
    // Kept apart from own-footing on purpose. Two of these are homelessness
    // services, and putting them under "you already have some footing" reads
    // as a contradiction of what she just told us.
    id: 'somewhere-of-your-own',
    reason: 'Housing help, if the next step is somewhere of your own.',
    when: (r) => r.pathId === 'partly-independent',
    resources: ['united-way-211', 'gateway-center', 'nicholas-house'],
  },
  {
    // Only organisations that actually put a lawyer on the phone. The websites
    // live in the next rule — after de-duplication this group can shrink to a
    // single entry, and "free lawyers" over a link to a reading site is a
    // promise the group would not be keeping.
    id: 'legal-anyway',
    reason: 'Free lawyers, whenever you want to know where you stand.',
    resources: ['atlanta-legal-aid', 'ga-legal-services', 'avlf'],
  },
  {
    id: 'legal-reading',
    reason: 'If you would rather read it yourself first.',
    resources: ['georgia-legal-aid-web', 'womenslaw'],
  },
  {
    id: 'always-open',
    reason: 'Lines that are open whatever else is going on.',
    resources: ['ndvh', 'victimconnect', '988-lifeline', 'gcal'],
  },
];

/**
 * Shown last, under a heading that says plainly it is not based on her answers.
 *
 * The intake does not ask about language, immigration status, or what kind of
 * harm she has experienced — questions that cost private time she may not have,
 * and that are risky to have on screen. So these organisations cannot be
 * matched. Listing them unmatched is the honest alternative to either guessing
 * or dropping them, and several of them are the only door that works for the
 * person who needs them.
 */
export const UNPROMPTED: MatchRule = {
  id: 'unprompted',
  reason: 'Not based on your answers — listed because they exist and might fit.',
  resources: [
    'tapestri',
    'raksha',
    'cpacs',
    'latin-american-association',
    'gain',
    'rainn',
    'stronghearts',
    'loveisrespect',
    'trafficking-hotline',
  ],
};

export interface MatchGroup {
  id: string;
  reason: string;
  resources: Resource[];
}

const BY_ID = new Map(RESOURCES.map((r) => [r.id, r]));

/**
 * Groups of organisations that match her answers, in the order to show them.
 *
 * A resource appears once, under the first rule that claimed it, so she does
 * not scroll past the same hotline five times. Groups left empty by that
 * de-duplication are dropped.
 */
export function matchResources(result: AssessmentResult): MatchGroup[] {
  const seen = new Set<string>();
  const groups: MatchGroup[] = [];

  for (const rule of [...MATCH_RULES, UNPROMPTED]) {
    if (rule.when && !rule.when(result)) continue;

    const resources: Resource[] = [];
    for (const id of rule.resources) {
      if (seen.has(id)) continue;
      const resource = BY_ID.get(id);
      // A missing id is a content bug, not a runtime one — `npm run check`
      // catches it before it ships, and skipping beats crashing her plan.
      if (!resource) continue;
      seen.add(id);
      resources.push(resource);
    }

    if (resources.length) groups.push({ id: rule.id, reason: rule.reason, resources });
  }

  return groups;
}

/** Rule entries pointing at a resource id that no longer exists. For the checks. */
export function danglingResourceIds(): string[] {
  const missing = new Set<string>();
  for (const rule of [...MATCH_RULES, UNPROMPTED]) {
    for (const id of rule.resources) if (!BY_ID.has(id)) missing.add(id);
  }
  return [...missing];
}

/** Resources no rule can ever reach. They'd only be findable by browsing. */
export function unreachableResourceIds(): string[] {
  const reachable = new Set([...MATCH_RULES, UNPROMPTED].flatMap((r) => r.resources));
  return RESOURCES.filter((r) => !reachable.has(r.id)).map((r) => r.id);
}
