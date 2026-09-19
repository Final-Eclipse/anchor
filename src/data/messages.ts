/**
 * Messages the app writes to her inbox. Lane C owns the wording.
 *
 * Every one of these is generated on this phone from what she has already done.
 * There is no server, so nothing arrives from outside — which is exactly why the
 * inbox is safe to have at all. It is a place to put the things a normal app
 * would push to her lock screen, where anyone could read them.
 *
 * Each rule has a fixed id so a message is only ever written once. Adding a rule
 * is safe; changing an existing id will make that message appear again for
 * people who have already seen it.
 *
 * Keep them short, and keep them useful. An inbox that fills up with
 * congratulation is an inbox she stops opening.
 */

import type { AnchorState, InboxMessage, PathAction } from './types';
import { PATHS } from './paths';

interface Rule {
  id: string;
  /** Whether this message should exist yet, given everything she's done. */
  when: (state: AnchorState) => boolean;
  title: string | ((state: AnchorState) => string);
  body: string | ((state: AnchorState) => string);
  action?: PathAction;
}

const RULES: Rule[] = [
  {
    id: 'welcome',
    when: () => true,
    title: 'This is where messages go',
    body:
      'Anchor never sends notifications — anything it needs to tell you waits here instead, where only you can read it. Nothing in this inbox comes from the internet. It is all written on this phone.',
  },
  {
    id: 'no-plan-yet',
    when: (s) => !s.assessment,
    title: 'A few questions when you have a moment',
    body:
      'Answering them lets this build a plan around your situation instead of a list of everything. You can skip any question, and stop partway.',
    action: { kind: 'screen', screen: 'Assessment' },
  },
  {
    id: 'plan-ready',
    when: (s) => !!s.assessment,
    title: (s) => `Your plan: ${PATHS[s.assessment!.pathId].title}`,
    body: (s) =>
      `${PATHS[s.assessment!.pathId].premise} Work through it in any order — the steps are yours, not a test.`,
    action: { kind: 'screen', screen: 'Path' },
  },
  {
    id: 'first-step-done',
    when: (s) => s.completedSteps.length >= 1,
    title: 'You did the first one',
    body:
      'That is the hardest part of a list. Nothing here expires and nothing is checked up on — come back when you can.',
  },
  {
    id: 'target-set',
    when: (s) => (s.fund.goalCents ?? 0) > 0,
    title: 'You have a number now',
    body:
      'Most people never get to see what leaving actually costs. Knowing it is what makes it something you can plan for instead of guess at.',
    action: { kind: 'screen', screen: 'Fund' },
  },
  {
    id: 'fund-quarter',
    when: (s) => {
      const saved = s.fund.entries.reduce((n, e) => n + e.amountCents, 0);
      return s.fund.goalCents > 0 && saved >= s.fund.goalCents * 0.25;
    },
    title: 'A quarter of the way',
    body:
      'Worth knowing: anything you set aside is time. Time is what lets you not go back if you leave.',
  },
  {
    id: 'fund-half',
    when: (s) => {
      const saved = s.fund.entries.reduce((n, e) => n + e.amountCents, 0);
      return s.fund.goalCents > 0 && saved >= s.fund.goalCents * 0.5;
    },
    title: 'Halfway',
    body: 'If you have not looked at the account guide yet, now is a good time. Money is safer somewhere he cannot see it.',
    action: { kind: 'screen', screen: 'AccountGuide' },
  },
  {
    id: 'first-document',
    when: (s) => s.docs.length >= 1,
    title: 'Your documents are encrypted',
    body:
      'Anything you photograph here is scrambled with your code before it is saved. Someone who unlocks this phone still cannot open them.',
  },
];

/**
 * The messages that should exist but don't yet. Deterministic: call it as often
 * as you like and it only ever returns what is genuinely new.
 */
export function pendingMessages(state: AnchorState): InboxMessage[] {
  const existing = new Set((state.inbox ?? []).map((m) => m.id));

  return RULES.filter((rule) => !existing.has(rule.id) && rule.when(state)).map((rule) => ({
    id: rule.id,
    title: typeof rule.title === 'function' ? rule.title(state) : rule.title,
    body: typeof rule.body === 'function' ? rule.body(state) : rule.body,
    at: Date.now(),
    read: false,
    action: rule.action,
  }));
}

export function unreadCount(state: AnchorState): number {
  return (state.inbox ?? []).filter((m) => !m.read).length;
}
