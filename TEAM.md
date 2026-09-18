# Who builds what

Four lanes so nobody waits on anybody. Claim yours in the group chat.

**The one rule:** only Lane A touches navigation and `App.tsx`. Everyone else
builds self-contained screens and Lane A wires them in. That single rule prevents
almost every merge conflict you'd otherwise hit.

Pull before you start. Work on a branch, not `main`.

---

## Lane A — shell & security

Give this to whoever is most comfortable with React.

**Owns:** `App.tsx`, navigation, `src/crypto/`

1. Replace the setup screen with the real shell: a decoy screen that looks like a
   plain notes or budget app, with a few plausible fake entries.
2. A PIN entry that gets past the decoy into the real app.
3. A panic button on every screen that returns to the decoy immediately.
4. An `AppState` listener that calls `lockVault()` the moment the app backgrounds.

**Done when:** you can unlock, background the app, and it snaps back to the decoy
so the app-switcher preview never shows real content.

**Note:** use a 6-digit PIN, not 4. Ten thousand combinations is not enough, and
six digits costs nothing. See the comment in `vault.ts`.

---

## Lane B1 — assessment & paths

**Owns:** `src/screens/Assessment.tsx`, `src/screens/Path.tsx`

1. Show the questions from `src/data/questions.ts` one at a time.
2. Store answers as `{ questionId: optionValue }`.
3. Call `scoreAssessment(answers, QUESTIONS)` from `src/data/scoring.ts`.
4. Show the matching path from `src/data/paths.ts` as a checklist.

Every question must be skippable — she may have very little private time.

**Done when:** answering "no account / no income" lands on a different path than
"yes account / yes income."

---

## Lane B2 — directory & fund

**Owns:** `src/screens/Directory.tsx`, `src/screens/Fund.tsx`

1. List `RESOURCES` with filter buttons for the six categories.
2. A savings tracker: goal, amount saved, add an amount.

Read `FundEntry` in `types.ts` first. It has no label or note field, deliberately —
if someone reads the screen over her shoulder it shows amounts and dates and
nothing that explains them. Don't add one.

**Done when:** filtering to "legal" shows only legal orgs.

---

## Lane C — content

**Start immediately. This is the longest job and the one that will be unfinished
at the end if nobody starts now.**

**Owns:** `src/data/questions.ts`, `paths.ts`, `resources.ts`

1. Call all seven organizations in `resources.ts`. Confirm a human answers.
   Fill in `phone` and `url`, then set `verified: true`.
2. Rewrite the question and path wording — what's there is a working draft.

Run `npm run check` to see what's still outstanding.

**Done when:** `npm run check` reports 7/7 verified.

**You don't need the phone setup yet.** Your work is data files and
`npm run check`, both terminal-only. Skip Expo Go until there are screens worth
looking at.

---

## Running the app

**You do not need Expo, an Expo account, or a phone to work on this project.**
Expo Go is only a way to preview the app on a phone. GitHub is what connects us.
You can write code, commit and push with none of it installed.

### The easy way — browser, no account, no phone

```bash
npm run web
```

Opens in your browser. No login, no QR code, nothing to install. Use this to
build and lay out your screens. This is the right default for everyone.

The security features (backgrounding, the app-switcher preview, biometrics)
behave differently in a browser, so Lane A should check those on a real phone
before we demo. Everyone else can stay in the browser the whole time.

### On a phone, when you want it

One-time: make a free account at expo.dev, install **Expo Go** on your phone,
then run `npx expo login` on your laptop.

```bash
npm start
```

Scan the QR with Expo Go. Each person runs their own server and scans with their
own phone — a QR code points at one specific laptop and can't be shared.

If it won't connect, campus Wi-Fi is probably blocking phone-to-laptop traffic.
Route around it:

```bash
npx expo start --tunnel
```
