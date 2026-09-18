/**
 * The intake. Lane C owns this file.
 *
 * These are starter questions drawn from recognised economic-abuse indicators —
 * control of accounts, sabotaged employment, coerced debt, enforced accounting
 * for spending. They are a working draft, not finished content. Expect to
 * rewrite the wording; keep the structure.
 *
 * Rules for anything added here:
 *   · Plain language. No finance jargon without a help line explaining it.
 *   · Never diagnostic. The app does not tell her she is being abused; it
 *     describes what she reported and offers what tends to help.
 *   · Every question is skippable. She may have very little private time.
 */

import type { Question } from './types';

export const QUESTIONS: Question[] = [
  {
    id: 'safety-now',
    prompt: 'Do you feel physically unsafe right now?',
    help: 'This one changes what we show you first. Nothing you tap here leaves your phone.',
    options: [
      {
        value: 'yes',
        label: 'Yes',
        weights: {},
        overrides: 'safety-first',
      },
      { value: 'unsure', label: "I'm not sure", weights: { 'safety-first': 2 } },
      { value: 'no', label: 'No', weights: {} },
    ],
  },
  {
    id: 'own-account',
    prompt: 'Do you have a bank account that only you can see?',
    help: 'An account in your name alone, where nobody else gets the statements or the alerts.',
    options: [
      { value: 'no', label: 'No', weights: { 'no-money-of-her-own': 3 } },
      {
        value: 'joint-only',
        label: 'Only a shared one',
        weights: { 'no-money-of-her-own': 3 },
      },
      { value: 'yes', label: 'Yes', weights: { 'partly-independent': 3 } },
    ],
  },
  {
    id: 'own-income',
    prompt: 'Do you have money coming in that is yours?',
    help: 'A job, benefits, or any regular income that arrives in your name.',
    options: [
      { value: 'none', label: 'No income of my own', weights: { 'no-money-of-her-own': 3 } },
      {
        value: 'controlled',
        label: 'I earn, but he controls it',
        weights: { 'no-money-of-her-own': 2, 'safety-first': 1 },
      },
      { value: 'yes', label: 'Yes, and I control it', weights: { 'partly-independent': 3 } },
    ],
  },
  {
    id: 'spending-permission',
    prompt: 'Do you have to explain or ask permission for what you spend?',
    options: [
      { value: 'always', label: 'For everything', weights: { 'no-money-of-her-own': 2, 'safety-first': 1 } },
      { value: 'large', label: 'For anything large', weights: { 'no-money-of-her-own': 1 } },
      { value: 'no', label: 'No', weights: { 'partly-independent': 1 } },
    ],
  },
  {
    id: 'debt-visibility',
    prompt: 'Do you know what is owed in your name?',
    help: 'Cards, loans, or accounts opened using your name — including any you did not agree to.',
    options: [
      { value: 'no', label: 'I have no idea', weights: { 'no-money-of-her-own': 2 } },
      {
        value: 'coerced',
        label: 'There is debt I did not agree to',
        weights: { 'no-money-of-her-own': 2, 'safety-first': 1 },
      },
      { value: 'yes', label: 'Yes, I know', weights: { 'partly-independent': 2 } },
    ],
  },
  {
    id: 'children',
    prompt: 'Are there children involved?',
    help: 'This adds custody-aware legal help to your plan. It does not change anything else.',
    options: [
      { value: 'yes', label: 'Yes', weights: {}, flags: ['children'] },
      { value: 'no', label: 'No', weights: {} },
    ],
  },
];
