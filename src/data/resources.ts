/**
 * The help directory. Lane C owns this file and it is the longest job in the project.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * READ THIS BEFORE EDITING
 *
 * Numbers here were taken from each organisation's own website on 2026-09-19.
 * Never write one from memory or guess at one — a wrong number in an app like
 * this is worse than no number at all, because someone dials it during the worst
 * week of her life and reaches a dead line.
 *
 * `verified: true` means a human on this team confirmed the details against the
 * official site, and re-checked them close to the demo. Do NOT phone the crisis
 * lines to test them; they are staffed for people in danger. The website is the
 * right source.
 *
 * `npm run check` lists anything still outstanding.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import type { Resource } from './types';

export const RESOURCES: Resource[] = [
  {
    id: 'ndvh',
    name: 'National Domestic Violence Hotline',
    categories: ['hotline'],
    area: 'national',
    description:
      'Free, confidential advocates any hour of the day. They help with planning ahead, not only emergencies.',
    phone: '1-800-799-7233',
    url: 'https://www.thehotline.org/',
    note: '24/7 · text START to 88788 · chat online',
    verified: true,
  },
  {
    id: 'ga-haven',
    name: 'Georgia Statewide Domestic Violence Hotline',
    categories: ['hotline', 'shelter'],
    area: 'georgia',
    description:
      'One call connects you to the nearest of more than fifty programs across Georgia.',
    phone: '1-800-334-2836',
    url: 'https://gcadv.org/',
    note: '24/7 · run by the Georgia Coalition Against Domestic Violence',
    verified: true,
  },
  {
    id: 'padv',
    name: 'Partnership Against Domestic Violence',
    categories: ['hotline', 'shelter', 'legal', 'housing', 'emergency-cash'],
    area: 'metro-atlanta',
    description:
      'Metro Atlanta crisis line, emergency shelter, counselling, help with protective orders, and financial assistance.',
    phone: '404-873-1766',
    url: 'https://padv.org/',
    note: '24/7 crisis line · metro Atlanta and Gwinnett',
    verified: true,
  },
  {
    id: 'atlanta-legal-aid',
    name: 'Atlanta Legal Aid Society',
    categories: ['legal'],
    area: 'metro-atlanta',
    description:
      'Free civil legal help if you cannot afford a lawyer — protective orders, divorce, custody, housing.',
    phone: '404-524-5811',
    url: 'https://atlantalegalaid.org/',
    note: 'Fulton, Clayton, Cobb, DeKalb and Gwinnett counties',
    verified: true,
  },
  {
    id: 'ga-legal-services',
    name: 'Georgia Legal Services Program',
    categories: ['legal'],
    area: 'georgia',
    description: 'Free civil legal aid for Georgians on low incomes outside metro Atlanta.',
    phone: '1-833-457-7529',
    url: 'https://www.glsp.org/',
    note: 'Regional offices across the state',
    verified: true,
  },
  {
    id: 'ywca-atlanta',
    name: 'YWCA of Greater Atlanta',
    categories: ['job-training', 'housing'],
    area: 'metro-atlanta',
    description:
      'Economic empowerment and education programmes, childcare, and advocacy for women and families.',
    phone: '404-892-3476',
    url: 'https://www.ywcaatlanta.org/',
    verified: true,
  },
  {
    id: 'united-way-211',
    name: 'Georgia 211',
    categories: ['emergency-cash', 'housing'],
    area: 'georgia',
    description:
      'Dial 211 to be referred to help with rent, utilities, food and emergency assistance funds near you.',
    phone: '211',
    url: 'https://211online.unitedwayatlanta.org/',
    note: 'Free referral line',
    verified: false,
  },
];

/** Entries still missing verification. Should be empty before you demo. */
export function unverified(list: Resource[] = RESOURCES): Resource[] {
  return list.filter((r) => !r.verified || (!r.phone && !r.url));
}
