/**
 * How to accept help from someone without it leaving a trail. Lane C owns the
 * wording.
 *
 * This replaces a peer-to-peer payment feature the team designed and then cut.
 * The need behind it was real — people want to help her, and she needs a way to
 * receive it — but building transfers meant a server, accounts, and a directory
 * of users. A directory of survivors, searchable by anyone, is the worst thing
 * this app could ship.
 *
 * So the same need is served as knowledge instead of infrastructure: which ways
 * of receiving money leave a record, which don't, and how to ask. No server, no
 * account, nothing to leak.
 */

export interface HelpMethod {
  title: string;
  body: string;
  /** Roughly how visible this is to someone watching her finances. */
  trace: 'none' | 'low' | 'high';
}

export const RECEIVING: HelpMethod[] = [
  {
    title: 'Cash',
    body: 'Nothing to find later. No statement, no notification, no record that it happened at all. If someone asks how to help, this is the answer to give them.',
    trace: 'none',
  },
  {
    title: 'Someone holds it for you',
    body: 'A friend or relative keeps the money in their account until you need it. Nothing appears anywhere in your name, and you are not carrying cash you have to hide.',
    trace: 'none',
  },
  {
    title: 'Gift cards for specific things',
    body: 'Groceries, gas, a phone. They spend like cash, they are easy to explain away, and they do not touch any account of yours.',
    trace: 'low',
  },
  {
    title: 'A transfer to an account only you can see',
    body: 'Works, but only once you have an account he does not know about — and the sender still has a record on their side. Set the account up first.',
    trace: 'low',
  },
  {
    title: 'A transfer to a shared account',
    body: 'Avoid this. It shows up as a deposit he can see, from a name he can read, on a date he can ask about. It can turn help into a reason he starts watching more closely.',
    trace: 'high',
  },
];

export const ASKING: HelpMethod[] = [
  {
    title: 'Tell them how, not just what',
    body: 'People want to help and will reach for the fastest app on their phone. Saying "cash, please, not a transfer" is not rude — it is the difference between help and exposure.',
    trace: 'none',
  },
  {
    title: 'Ask for a thing, not an amount',
    body: 'A tank of gas, a week of groceries, the phone bill. It is easier for people to say yes to, and easier for you to ask.',
    trace: 'none',
  },
  {
    title: 'Keep it off the shared devices',
    body: 'Ask in person if you can. A text asking for money sits in a thread that someone else may scroll through later.',
    trace: 'none',
  },
];
