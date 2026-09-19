/**
 * The shared contract between all three lanes.
 *
 * Lane B builds screens against these types. Lane C writes content that
 * satisfies them. Lane A stores them. Changing anything here breaks someone
 * else's work in progress, so changes get agreed in the group chat first.
 */

// ─────────────────────────────────────────────────────────── assessment

export type PathId = 'safety-first' | 'no-money-of-her-own' | 'partly-independent';

/** Overlays that add steps to whichever path she lands on. Not paths themselves. */
export type Modifier = 'children';

export interface QuestionOption {
  value: string;
  label: string;
  /** Points added per path. The highest total wins. See scoring.ts. */
  weights: Partial<Record<PathId, number>>;
  /** Selecting this option turns on these overlays. */
  flags?: Modifier[];
  /** Routes straight to this path regardless of totals. Danger answers only. */
  overrides?: PathId;
}

export interface Question {
  id: string;
  prompt: string;
  /** Plain-language explainer shown under the prompt. Assume no finance jargon. */
  help?: string;
  options: QuestionOption[];
}

export interface AssessmentResult {
  pathId: PathId;
  modifiers: Modifier[];
  /** questionId -> chosen option value. Skipped questions are absent. */
  answers: Record<string, string>;
  completedAt: number;
}

// ─────────────────────────────────────────────────────────────── paths

/**
 * Where a step sends her. 'external' and 'call' both leave the app and leave a
 * trace, so both must go through the exit interstitial — never link directly.
 */
export type PathAction =
  | { kind: 'screen'; screen: 'Vault' | 'Fund' | 'Directory' | 'AccountGuide' }
  | { kind: 'directory'; filter: NeedCategory }
  | { kind: 'external'; url: string }
  | { kind: 'call'; number: string };

export interface PathStep {
  id: string;
  title: string;
  body: string;
  action?: PathAction;
  /** Step only appears when she has this overlay. Omit to always show. */
  requires?: Modifier;
}

export interface PathDefinition {
  id: PathId;
  title: string;
  /** One sentence naming her situation back to her, without judgment. */
  premise: string;
  steps: PathStep[];
}

// ─────────────────────────────────────────────────────────── directory

export type NeedCategory =
  | 'hotline'
  | 'shelter'
  | 'legal'
  | 'emergency-cash'
  | 'housing'
  | 'job-training';

export type AreaId = 'downtown-atlanta' | 'metro-atlanta' | 'georgia' | 'national';

export interface Resource {
  id: string;
  name: string;
  categories: NeedCategory[];
  area: AreaId;
  description: string;
  phone?: string;
  url?: string;
  /** Short practical qualifier: '24/7', 'no ID required', 'Spanish available'. */
  note?: string;
  /**
   * False until a human has called the number and loaded the URL.
   * Nothing unverified ships — a dead hotline number is worse than no entry.
   */
  verified: boolean;
}

// ──────────────────────────────────────────────────────────────── fund

/**
 * Deliberately has no label or category field. If someone reads the screen over
 * her shoulder it shows amounts and dates and nothing that explains them.
 * Don't add a note field here.
 */
export interface FundEntry {
  id: string;
  amountCents: number;
  at: number;
}

export interface FundState {
  goalCents: number;
  entries: FundEntry[];
  /**
   * Her own estimates of what leaving costs, keyed by Need id (src/data/needs.ts).
   * The goal is the sum of these — knowing the number is the point, not the tally.
   */
  needs?: Record<string, number>;
}

// ─────────────────────────────────────────────────────────────── vault

export interface VaultDocMeta {
  id: string;
  title: string;
  mime: string;
  bytes: number;
  addedAt: number;
}

// ──────────────────────────────────────────────────── persisted record

/** Everything the app stores, encrypted as one record under the data key. */
export interface AnchorState {
  assessment?: AssessmentResult;
  fund: FundState;
  docs: VaultDocMeta[];
  /** Step ids she has checked off, per path. */
  completedSteps: string[];
}

export const EMPTY_STATE: AnchorState = {
  fund: { goalCents: 0, entries: [] },
  docs: [],
  completedSteps: [],
};
