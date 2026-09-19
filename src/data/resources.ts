/**
 * The help directory. Lane C owns this file.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * READ THIS BEFORE EDITING
 *
 * Short on purpose. Every entry is either domestic-violence specific,
 * financial-abuse specific, or legal help for leaving. A food bank and a general
 * jobs programme are good things that belong in a different app — here they push
 * the organisations she actually opened this for further down the screen.
 *
 * Every number below was taken from the organisation's own website, and every
 * entry is verified. Never add one from memory and never guess: a wrong number
 * in an app like this is worse than no number, because someone dials it during
 * the worst week of their life and reaches a dead line.
 *
 * Do NOT phone the crisis lines to test them. They are staffed for people in
 * danger. The website is the right source.
 *
 * Some entries carry a URL and no phone. That is deliberate — the organisation
 * does not publish a public service line. A "Website" button and no "Call"
 * button is the honest state.
 *
 * Adding an entry means adding it to matching.ts too, or it will only be
 * findable by browsing. `npm run check` reports both.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import type { Resource } from './types';

export const RESOURCES: Resource[] = [
  // ── Someone to talk to, any hour ────────────────────────────────────────
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
      'One call connects you to the nearest of more than fifty programmes across Georgia.',
    phone: '1-800-334-2836',
    url: 'https://gcadv.org/',
    note: '24/7 · run by the Georgia Coalition Against Domestic Violence',
    verified: true,
  },

  // ── Metro Atlanta programmes ────────────────────────────────────────────
  {
    id: 'padv',
    name: 'Partnership Against Domestic Violence',
    categories: ['hotline', 'shelter', 'legal', 'housing', 'emergency-cash'],
    area: 'metro-atlanta',
    description:
      'Crisis line, emergency shelter, counselling, help with protective orders, and financial assistance.',
    phone: '404-873-1766',
    url: 'https://padv.org/',
    note: '24/7 · Atlanta and Gwinnett',
    verified: true,
  },
  {
    id: 'wrcdv',
    name: 'Women’s Resource Center to End Domestic Violence',
    categories: ['hotline', 'shelter', 'legal', 'housing'],
    area: 'metro-atlanta',
    description:
      'DeKalb-based crisis line, shelter and advocacy. You can stay anonymous on the call.',
    phone: '404-688-9436',
    url: 'https://www.wrcdv.org/get-help',
    note: '24/7 · confidential',
    verified: true,
  },
  {
    id: 'livesafe-cobb',
    name: 'LiveSafe Resources',
    categories: ['hotline', 'shelter', 'legal'],
    area: 'metro-atlanta',
    description: 'Cobb County’s certified domestic violence programme — crisis line and shelter.',
    phone: '770-427-3390',
    url: 'https://www.livesaferesources.org/get-help/',
    note: '24/7 · Cobb, Paulding and Cherokee',
    verified: true,
  },

  // ── Legal help ──────────────────────────────────────────────────────────
  {
    id: 'atlanta-legal-aid',
    name: 'Atlanta Legal Aid Society',
    categories: ['legal'],
    area: 'metro-atlanta',
    description:
      'Free civil legal help if you cannot afford a lawyer — protective orders, divorce, custody, housing.',
    phone: '404-524-5811',
    url: 'https://atlantalegalaid.org/',
    note: 'Fulton, Clayton, Cobb, DeKalb and Gwinnett',
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
    id: 'womenslaw',
    name: 'WomensLaw.org',
    categories: ['legal'],
    area: 'national',
    description:
      'Plain-language explanations of your legal options, state by state — protective orders, custody, divorce.',
    url: 'https://www.womenslaw.org/',
    note: 'Reading only, no calls',
    verified: true,
  },

  // ── Money ───────────────────────────────────────────────────────────────
  {
    id: 'freefrom',
    name: 'FreeFrom',
    categories: ['emergency-cash'],
    area: 'national',
    description:
      'Built specifically around survivors’ financial security. Their Compensation Compass finds money you may already be owed.',
    url: 'https://www.freefrom.org/',
    note: 'Safety fund enquiries by email',
    verified: true,
  },
  {
    id: 'ga-victims-comp',
    name: 'Georgia Crime Victims Compensation',
    categories: ['emergency-cash', 'legal'],
    area: 'georgia',
    description:
      'State money toward medical bills, counselling and lost earnings after a crime. You can apply online.',
    phone: '1-800-547-0060',
    url: 'https://victimscompportal.cjcc.ga.gov/',
    note: 'Run by the Criminal Justice Coordinating Council',
    verified: true,
  },
  {
    id: 'cfpb',
    name: 'Consumer Financial Protection Bureau',
    categories: ['legal', 'emergency-cash'],
    area: 'national',
    description:
      'Where to report debt opened in your name without your agreement, and errors on your credit report.',
    url: 'https://www.consumerfinance.gov/complaint/',
    note: 'Complaints in writing',
    verified: true,
  },

  // ── Housing, work, everything else ──────────────────────────────────────
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
    categories: ['emergency-cash', 'housing', 'job-training'],
    area: 'georgia',
    description:
      'Free and confidential. Trained specialists connect you to help with rent, utilities, food, healthcare and work.',
    phone: '211',
    url: 'https://211online.unitedwayatlanta.org/',
    note: 'Or text your ZIP code and what you need to 898211',
    verified: true,
  },
];

/** Entries still missing verification. Should be empty before you demo. */
export function unverified(list: Resource[] = RESOURCES): Resource[] {
  return list.filter((r) => !r.verified || (!r.phone && !r.url));
}
