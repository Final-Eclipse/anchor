/**
 * What leaving actually costs. Lane C owns the wording.
 *
 * This is the part of the fund she cannot get anywhere else. Someone who has
 * never controlled the money often has no idea what a deposit is, or that most
 * landlords want first month and deposit together. A savings tracker without
 * this is just a number in a box — the target is the useful half.
 *
 * Deliberately no default amounts. Costs vary enormously by situation, and a
 * made-up figure would either frighten her or leave her short. She fills in what
 * she knows; the prompts tell her what to find out.
 */

export interface Need {
  id: string;
  label: string;
  /** What this covers, in plain language. */
  hint: string;
  /** Shown only when she has children. */
  requiresChildren?: boolean;
}

export const NEEDS: Need[] = [
  {
    id: 'deposit',
    label: 'Security deposit',
    hint: 'Usually one month of rent, paid up front and held until you move out.',
  },
  {
    id: 'first-rent',
    label: 'First month of rent',
    hint: 'Most places want this and the deposit together, before you get keys.',
  },
  {
    id: 'transport',
    label: 'Getting there',
    hint: 'A tank of gas, a bus ticket, a few rides. Whatever moving day takes.',
  },
  {
    id: 'food',
    label: 'Two weeks of food',
    hint: 'Enough to not need anyone while you get settled.',
  },
  {
    id: 'phone',
    label: 'Your own phone line',
    hint: 'A prepaid phone if yours is on a shared plan he can see or shut off.',
  },
  {
    id: 'childcare',
    label: 'Childcare',
    hint: 'Even a few days, so you can sort out housing and work.',
    requiresChildren: true,
  },
  {
    id: 'cushion',
    label: 'Something left over',
    hint: 'Anything unspent is time. Time is what lets you not go back.',
  },
];
