/**
 * Content for the independent account guide. Lane C owns the wording.
 *
 * The scope is deliberate and worth defending: this does not open accounts.
 * Opening a bank account is regulated activity, and wiring up a banking API
 * would send her details off the device, which breaks the first rule of the
 * project. It explains what makes an account stay private, and then it says
 * plainly what can expose one anyway.
 *
 * That second half is the part that makes it trustworthy. A guide that only
 * lists the reassuring steps would leave her believing an account is invisible
 * when a joint tax return can surface it.
 */

export interface GuideStep {
  title: string;
  body: string;
}

export const OPENING_STEPS: GuideStep[] = [
  {
    title: 'Choose a bank he has never used',
    body: 'Shared institutions are the easiest place to be found. A credit union or an online-only bank he has no relationship with keeps your account out of any view he already has.',
  },
  {
    title: 'Paper statements are the biggest risk',
    body: 'Choose paperless at signup. A single envelope arriving at home undoes everything else on this list.',
  },
  {
    title: 'Make a new email address first',
    body: 'Before you open anything, set up an email he does not know exists, and use it for this account only. Statements, password resets and alerts all flow through it.',
  },
  {
    title: 'Use a phone number he cannot see',
    body: 'Verification codes go to whatever number you give the bank. If your phone is on a shared plan, the numbers you receive texts from can appear on the bill. A prepaid phone or a trusted friend’s number avoids that.',
  },
  {
    title: 'Give a mailing address that is not home',
    body: 'A PO box, a workplace, or the address of someone you trust. Many banks will ask for a home address for identity checks and a separate mailing address — those can be different.',
  },
];

export const STILL_VISIBLE: GuideStep[] = [
  {
    title: 'A credit report he pulls',
    body: 'New accounts can show up on your credit file. If he has your details and checks it, he may see that something was opened, even if he cannot see the balance.',
  },
  {
    title: 'A joint tax return',
    body: 'Interest earned is reported. Filing jointly can surface an account you opened alone.',
  },
  {
    title: 'A shared phone plan or family account',
    body: 'Bills can list numbers that texted you, and a family Apple or Google account can sync app installs and locations across devices.',
  },
  {
    title: 'Direct deposit paperwork',
    body: 'Changing where your pay lands leaves a record at your employer, which may be reachable if he has access there.',
  },
];
