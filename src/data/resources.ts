/**
 * The help directory. Lane C owns this file and it is the longest job in the project.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * READ THIS BEFORE EDITING
 *
 * Every entry below is a stub. The organisation names are real; the contact
 * details are deliberately left blank rather than guessed, because a wrong
 * number in an app like this is worse than no number at all — someone dials it
 * during the worst week of her life and reaches a disconnected line.
 *
 * To fill one in: find the org's official site, copy the number, then actually
 * call it and confirm someone answers. Only then set verified: true.
 * `unverified(RESOURCES)` fails the check while anything is still a stub, and
 * nothing unverified should be on screen at judging.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import type { Resource } from './types';

export const RESOURCES: Resource[] = [
  {
    id: 'ndvh',
    name: 'National Domestic Violence Hotline',
    categories: ['hotline'],
    area: 'national',
    description: 'Free, confidential advocates 24 hours a day. They help with planning, not only emergencies.',
    phone: '1-800-799-7233',
    note: '24/7 · interpretation available',
    verified: false,
  },
  {
    id: 'gcadv',
    name: 'Georgia Coalition Against Domestic Violence',
    categories: ['hotline', 'shelter', 'legal'],
    area: 'georgia',
    description: 'Statewide coalition that can route you to the nearest member program.',
    verified: false,
  },
  {
    id: 'padv',
    name: 'Partnership Against Domestic Violence',
    categories: ['hotline', 'shelter'],
    area: 'metro-atlanta',
    description: 'Metro Atlanta crisis line and emergency shelter.',
    verified: false,
  },
  {
    id: 'atlanta-legal-aid',
    name: 'Atlanta Legal Aid Society',
    categories: ['legal'],
    area: 'metro-atlanta',
    description: 'Free civil legal help, including protective orders, divorce and custody.',
    verified: false,
  },
  {
    id: 'ywca-atlanta',
    name: 'YWCA of Greater Atlanta',
    categories: ['shelter', 'job-training', 'emergency-cash'],
    area: 'metro-atlanta',
    description: 'Support services for survivors, including housing and work programs.',
    verified: false,
  },
  {
    id: 'ga-legal-services',
    name: 'Georgia Legal Services Program',
    categories: ['legal'],
    area: 'georgia',
    description: 'Free civil legal aid for Georgians outside metro Atlanta.',
    verified: false,
  },
  {
    id: 'united-way-211',
    name: 'United Way 211',
    categories: ['emergency-cash', 'housing'],
    area: 'georgia',
    description: 'Referral line for rent, utilities and emergency assistance funds.',
    verified: false,
  },
];

/** Entries still missing verification. Should be empty before you demo. */
export function unverified(list: Resource[] = RESOURCES): Resource[] {
  return list.filter((r) => !r.verified || (!r.phone && !r.url));
}
