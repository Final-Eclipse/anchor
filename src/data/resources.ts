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
 * Everything below the first seven entries was gathered in an assisted pass on
 * 2026-09-19 and is sitting at `verified: false` until a person on this team
 * loads the official site and confirms it. `npm run check` lists what's left.
 * The Directory screen already labels unverified entries on screen, so it is
 * safe to have them in the array while that work happens.
 *
 * A few entries carry a URL and no phone. That is deliberate — either the
 * organisation does not publish a public service line, or we have not found one
 * we trust yet. A "Website" button and no "Call" button is the honest state.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import type { Resource } from './types';

export const RESOURCES: Resource[] = [
  // ─────────────────────────────────────────── crisis lines, any hour
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
    id: 'victimconnect',
    name: 'VictimConnect Resource Center',
    categories: ['hotline', 'legal'],
    area: 'national',
    description:
      'A referral line for people harmed by any crime. They talk through the financial and legal side, not only the immediate danger.',
    phone: '1-855-484-2846',
    url: 'https://victimconnect.org/',
    note: '24/7 · anonymous · text and chat available',
    verified: false,
  },
  {
    id: 'rainn',
    name: 'National Sexual Assault Hotline',
    categories: ['hotline'],
    area: 'national',
    description:
      'Run by RAINN. Connects you to a trained specialist at a support centre near you, in English or Spanish.',
    phone: '1-800-656-4673',
    url: 'https://rainn.org/',
    note: '24/7 · text HOPE to 64673 · chat at online.rainn.org',
    verified: false,
  },
  {
    id: 'stronghearts',
    name: 'StrongHearts Native Helpline',
    categories: ['hotline'],
    area: 'national',
    description:
      'Advocates for Native American and Alaska Native people, working from a Native-centred understanding of family and community.',
    phone: '1-844-762-8483',
    url: 'https://strongheartshelpline.org/',
    note: '24/7 · anonymous and confidential',
    verified: false,
  },
  {
    id: 'loveisrespect',
    name: 'love is respect',
    categories: ['hotline'],
    area: 'national',
    description:
      'For young people worried about a dating relationship. Same advocates as the national hotline, trained for under-25s.',
    phone: '1-866-331-9474',
    url: 'https://www.loveisrespect.org/',
    note: '24/7 · text LOVEIS to 22522',
    verified: false,
  },
  {
    id: 'trafficking-hotline',
    name: 'National Human Trafficking Hotline',
    categories: ['hotline'],
    area: 'national',
    description:
      'For situations where someone is being made to work, or made to hand over what they earn, and cannot leave.',
    phone: '1-888-373-7888',
    url: 'https://humantraffickinghotline.org/en',
    note: '24/7 · text 233733 · TTY 711',
    verified: false,
  },
  {
    id: '988-lifeline',
    name: '988 Suicide & Crisis Lifeline',
    categories: ['hotline'],
    area: 'national',
    description:
      'For any kind of mental health crisis, including when things feel unbearable rather than unsafe.',
    phone: '988',
    url: 'https://988lifeline.org/',
    note: '24/7 · call or text 988 · chat at chat.988lifeline.org',
    verified: false,
  },

  // ───────────────────────── local domestic violence programmes, by county
  {
    id: 'wrcdv',
    name: 'Women’s Resource Center to End Domestic Violence',
    categories: ['hotline', 'shelter', 'legal', 'housing'],
    area: 'metro-atlanta',
    description:
      'The main domestic violence programme in DeKalb County. Emergency shelter through to longer-term housing, plus court advocacy.',
    phone: '404-688-9436',
    url: 'https://www.wrcdv.org/',
    note: '24/7 · DeKalb County · sexual assault line 404-377-1428',
    verified: false,
  },
  {
    id: 'livesafe-cobb',
    name: 'liveSAFE Resources',
    categories: ['hotline', 'shelter', 'legal'],
    area: 'metro-atlanta',
    description:
      'Cobb County crisis line, emergency shelter and counselling for domestic violence and sexual assault.',
    phone: '770-427-3390',
    url: 'https://www.livesaferesources.org/',
    note: '24/7 · Cobb County',
    verified: false,
  },
  {
    id: 'securus-house',
    name: 'Securus House',
    categories: ['hotline', 'shelter', 'legal'],
    area: 'metro-atlanta',
    description:
      'Clayton County Association Against Family Violence. Emergency shelter, longer-term housing, and someone to sit with you in court.',
    phone: '770-961-7233',
    url: 'https://securushouse.org/',
    note: '24/7 · Clayton County and south metro',
    verified: false,
  },
  {
    id: 'promise-place',
    name: 'Promise Place',
    categories: ['hotline', 'shelter', 'legal'],
    area: 'metro-atlanta',
    description:
      'South metro crisis line and emergency shelter, with help applying for a protective order and going to court.',
    phone: '770-460-1604',
    url: 'https://promiseplace.org/',
    note: '24/7 · south metro Atlanta · V/TTY 1-866-780-3718',
    verified: false,
  },
  {
    id: 'tapestri',
    name: 'Tapestri',
    categories: ['hotline', 'legal'],
    area: 'metro-atlanta',
    description:
      'For immigrant and refugee survivors. Advocates who speak your language and understand what leaving costs when your status is tied to his.',
    phone: '404-299-2185',
    url: 'https://tapestri.org/',
    note: 'Many languages · Atlanta area',
    verified: false,
  },
  {
    id: 'raksha',
    name: 'Raksha',
    categories: ['hotline', 'legal'],
    area: 'metro-atlanta',
    description:
      'Support, interpretation and case help for South Asian survivors in Georgia, in your own language if you want it.',
    phone: '404-876-0670',
    url: 'https://www.raksha.org/',
    note: 'Mon–Fri 9am–5pm · not a crisis line',
    verified: false,
  },
  {
    id: 'ahimsa-house',
    name: 'Ahimsa House',
    categories: ['shelter'],
    area: 'georgia',
    description:
      'Free emergency boarding and vet care for pets, statewide, so a pet is not the reason you stay.',
    phone: '404-452-6248',
    url: 'https://ahimsahouse.org/',
    note: '24/7 crisis line · all of Georgia',
    verified: false,
  },

  // ─────────────────────────────────────────────────────────── legal help
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
    id: 'avlf',
    name: 'Atlanta Volunteer Lawyers Foundation',
    categories: ['legal', 'housing'],
    area: 'metro-atlanta',
    description:
      'Free lawyers for protective orders through their courthouse office, and for tenants facing eviction.',
    phone: '404-521-0790',
    url: 'https://avlf.org/',
    note: 'Safe Families Office is based at the courthouse',
    verified: false,
  },
  {
    id: 'gain',
    name: 'Georgia Asylum and Immigration Network',
    categories: ['legal'],
    area: 'georgia',
    description:
      'Free immigration lawyers for survivors of domestic violence, trafficking and other crimes. Your status may not depend on his.',
    phone: '678-335-6040',
    url: 'https://georgiaasylum.org/',
    note: 'Free · statewide',
    verified: false,
  },
  {
    id: 'georgia-legal-aid-web',
    name: 'GeorgiaLegalAid.org',
    categories: ['legal'],
    area: 'georgia',
    description:
      'Plain-English explanations of Georgia law and the actual court forms, from Atlanta Legal Aid and Georgia Legal Services.',
    url: 'https://www.georgialegalaid.org/',
    note: 'Website · self-help forms and a legal help finder',
    verified: false,
  },
  {
    id: 'womenslaw',
    name: 'WomensLaw.org',
    categories: ['legal'],
    area: 'national',
    description:
      'State-by-state legal information written for survivors, from the National Network to End Domestic Violence.',
    url: 'https://www.womenslaw.org/',
    note: 'Website · email legal questions, no phone line',
    verified: false,
  },
  {
    id: 'cfpb',
    name: 'Consumer Financial Protection Bureau',
    categories: ['legal'],
    area: 'national',
    description:
      'Where to complain if a lender or debt collector will not fix something. Also explains how to read a credit report and dispute what is wrong on it.',
    phone: '1-855-411-2372',
    url: 'https://www.consumerfinance.gov/consumer-tools/credit-reports-and-scores/',
    note: 'Federal agency · TTY/TDD 1-855-729-2372',
    verified: false,
  },

  // ─────────────────────────────────────────────── money you can apply for
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
  {
    id: 'ga-victims-comp',
    name: 'Georgia Crime Victims Compensation',
    categories: ['emergency-cash', 'legal'],
    area: 'georgia',
    description:
      'A state fund that can repay costs caused by a violent crime, including lost income and counselling, up to $25,000. You apply; it is not a loan.',
    phone: '404-657-1956',
    url: 'https://cjcc.georgia.gov/victims-compensation',
    note: 'Toll free 1-877-231-6590 · pays after other sources are used up',
    verified: false,
  },
  {
    id: 'ga-gateway',
    name: 'Georgia Gateway',
    categories: ['emergency-cash', 'job-training'],
    area: 'georgia',
    description:
      'The state site to apply for food stamps, cash assistance, Medicaid and help paying for childcare. One application covers several.',
    phone: '1-877-423-4746',
    url: 'https://gateway.ga.gov/',
    note: 'Free interpreters · Georgia Relay 711',
    verified: false,
  },
  {
    id: 'freefrom',
    name: 'FreeFrom',
    categories: ['emergency-cash'],
    area: 'national',
    description:
      'A survivor-led organisation that gives direct cash and matches savings, aimed squarely at the money side of leaving.',
    url: 'https://www.freefrom.org/',
    note: 'Website · applications open in rounds, check the site',
    verified: false,
  },

  // ───────────────────────────────────────────── somewhere to stay, housing

  // ───────────────────────────────────────────────────── work and training
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
];

/** Entries still missing verification. Should be empty before you demo. */
export function unverified(list: Resource[] = RESOURCES): Resource[] {
  return list.filter((r) => !r.verified || (!r.phone && !r.url));
}
