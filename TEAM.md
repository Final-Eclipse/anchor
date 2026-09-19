# Who does what

**Read this before you start — the app is further along than you may expect.**
Every screen in the MVP is built and working. What's left is the content behind
them, the polish on top of them, and the demo.

Pull before you do anything. Work directly on `main` and push small changes often;
our files barely overlap, so conflicts are rare and frequent pushes keep them that way.

---

## Already built — don't rebuild these

- Disguise: a cycle tracker. Long-press the day ring to get in.
- First-run safety notice, 6-digit code, confirm step
- Hide button on every screen, auto-lock when the app backgrounds
- Lockout after repeated wrong codes
- Assessment → scoring → one of three paths, with the children overlay
- Path checklist with tickable steps that link onward
- Help directory with category filters
- Exit interstitial before any call or link
- Fund tracker, document vault, account guide
- Encrypted storage for all of it

If you want to change one of these, say so in the chat first — someone may be in
that file.

---

## Lane C — content

**The only thing standing between us and a finished project. Start here.**

**Owns:** `src/data/resources.ts`, `questions.ts`, `paths.ts`, `accountGuide.ts`

1. **Call all seven organisations in `resources.ts`.** Confirm a human answers.
   Fill in `phone` and `url`, set `verified: true`. Run `npm run check` to see
   what's outstanding.
2. **Rewrite the questions and path steps.** What's there is a working draft
   written fast. It needs someone to read it aloud and make it sound like a person.

**Rules:** never invent a phone number or an organisation — a wrong hotline number
is worse than no entry. Never diagnose; the app describes what she reported and
offers what tends to help. It's information, not legal or financial advice.

**You don't need Expo or a phone for this.** Edit the files, run `npm run check`.

---

## Design polish

**Owns:** `src/theme.ts`, and visual tweaks inside any screen

The app is consistent but plain. Spacing, type scale, and the empty states could
all be better. Two constraints: the decoy must stay boring and ordinary-looking,
and the Hide button must stay obvious on every screen.

---

## Device testing

Everything has been verified in a browser. The security features behave
differently on real hardware and need checking on an actual phone:

- Backgrounding the app → does it snap to the decoy before the app-switcher
  preview is captured?
- The document vault with real photos (browser storage caps out around 5MB)
- How long unlocking takes — if over a second, lower `PBKDF2_ITERATIONS`
- Whether the long-press feels right

---

## Before judging

- [ ] All seven resources verified
- [ ] Delete `src/screens/SetupCheck.tsx` and its entry in `Home.tsx`
- [ ] Walk the demo on the actual phone you'll present with, three times
- [ ] Deck built around the threat model, not the feature list

---

## Running it

**In a browser — no Expo account, no phone, no QR code:**

```bash
npm install
npm run web
```

**On a phone:** make a free account at expo.dev, install Expo Go, then
`npx expo login` and `npm start`. Add `--tunnel` if campus Wi-Fi blocks it.

**To get back to the first-run flow on a phone:** unlock → Setup check →
Start over. Expo Go keeps the code between reloads, so this is the only way.

**Before pushing:** `npm run check`
