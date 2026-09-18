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

Each person runs their own server on their own laptop and scans with their own
phone. You cannot share a QR code — it points at one specific laptop.

```bash
npm start
```

Scan the QR with Expo Go. Leave the server running; when you save a file the app
reloads on your phone in a second or two.

### If the QR doesn't connect

Campus and guest Wi-Fi usually block phones and laptops from talking to each
other directly. Use tunnel mode, which routes around the network:

```bash
npx expo start --tunnel
```

Slower to start, works almost anywhere. First run installs a helper package.

### No phone?

```bash
npm run web
```

Fine for laying out a screen. The security features behave differently in a
browser, so don't judge those from it.
