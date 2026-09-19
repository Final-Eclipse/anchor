/**
 * The three plans. Lane C owns the wording; lane B renders it.
 *
 * A path is an ordered checklist that points at features that already exist.
 * It creates no new screens of its own, which is the only reason three complete
 * paths are affordable in a weekend. Build these last.
 */

import type { PathDefinition } from './types';

export const PATHS: Record<string, PathDefinition> = {
  'safety-first': {
    id: 'safety-first',
    title: 'Safety first',
    premise: 'Money can wait. This is about getting through the next few days.',
    steps: [
      {
        id: 'sf-hotline',
        title: 'Talk to someone who does this every day',
        body: 'Advocates help with safety planning, not just emergencies. The call is free and confidential.',
        action: { kind: 'directory', filter: 'hotline' },
      },
      {
        id: 'sf-shelter',
        title: 'Know where you could go tonight',
        body: 'Look now, while you have time, so the answer already exists if you need it suddenly.',
        action: { kind: 'directory', filter: 'shelter' },
      },
      {
        id: 'sf-docs',
        title: 'Photograph your documents',
        body: 'ID, birth certificates, insurance, any account statements you can reach. Photos live encrypted on this phone.',
        action: { kind: 'screen', screen: 'Vault' },
      },
      {
        id: 'sf-custody',
        title: 'Get custody-aware legal help',
        body: 'Leaving with children has rules that vary by state. Free legal aid can tell you what applies in Georgia before you act.',
        action: { kind: 'directory', filter: 'legal' },
        requires: 'children',
      },
      {
        id: 'sf-cash',
        title: 'Find emergency money',
        body: 'Some funds pay out in days and do not ask for a credit check.',
        action: { kind: 'directory', filter: 'emergency-cash' },
      },
    ],
  },

  'no-money-of-her-own': {
    id: 'no-money-of-her-own',
    title: 'Money of your own',
    premise: 'Right now the money is his. These steps are about making some of it yours.',
    steps: [
      {
        id: 'nm-account',
        title: 'Open an account he cannot see',
        body: 'Which bank, which address, which email, which phone number — the details that decide whether it stays private.',
        action: { kind: 'screen', screen: 'AccountGuide' },
      },
      {
        id: 'nm-fund',
        title: 'Start putting something aside',
        body: 'Amounts and dates only. Nothing on this screen explains what the money is for.',
        action: { kind: 'screen', screen: 'Fund' },
      },
      {
        id: 'nm-docs',
        title: 'Photograph anything financial you can reach',
        body: 'Statements, tax returns, account numbers. Easier now than after you leave.',
        action: { kind: 'screen', screen: 'Vault' },
      },
      {
        id: 'nm-grants',
        title: 'Apply for help that does not need a bank history',
        body: 'Several funds are built for exactly this situation and do not ask for credit or savings.',
        action: { kind: 'directory', filter: 'emergency-cash' },
      },
      {
        id: 'nm-legal',
        title: 'Ask about the children before you move money',
        body: 'Free legal aid can tell you how moving funds or leaving affects custody in Georgia.',
        action: { kind: 'directory', filter: 'legal' },
        requires: 'children',
      },
    ],
  },

  'partly-independent': {
    id: 'partly-independent',
    title: 'Making it fully yours',
    premise: 'You already have a footing. These steps widen it until it holds on its own.',
    steps: [
      {
        id: 'pi-separate',
        title: 'Separate what is still shared',
        body: 'Redirect statements and alerts, change the recovery email and phone on anything in your name.',
        action: { kind: 'screen', screen: 'AccountGuide' },
      },
      {
        id: 'pi-credit',
        title: 'Build credit in your own name',
        body: 'Housing and jobs both check it. If everything has been in his name, this is the gap that shows up later.',
        action: { kind: 'screen', screen: 'AccountGuide' },
      },
      {
        id: 'pi-fund',
        title: 'Give the fund a target',
        body: 'A deposit, a month of rent, and a margin. Knowing the number makes it reachable.',
        action: { kind: 'screen', screen: 'Fund' },
      },
      {
        id: 'pi-housing',
        title: 'Look at housing help',
        body: 'Transitional programs and first-month assistance exist for people leaving, not only for people already out.',
        action: { kind: 'directory', filter: 'housing' },
      },
      {
        id: 'pi-work',
        title: 'Job training and re-entry programs',
        body: 'Several are free and specifically for survivors returning to work.',
        action: { kind: 'directory', filter: 'job-training' },
      },
    ],
  },
};
