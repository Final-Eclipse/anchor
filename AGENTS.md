# Anchor

Read this before writing code. It is the difference between helping and breaking
something that matters.

## Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v57.0.0/ before
writing any code against an Expo API. This is not optional and it has already
paid off once: the docs revealed that `expo-crypto` ships native AES-GCM that
runs in Expo Go, which replaced a planned pure-JS implementation.

## What this is

A React Native app for women experiencing financial control in an abusive
relationship. It assesses her situation privately, routes her to one of three
plans, and helps her act on it.

Hackathon project, HackHers 2027, FinanceHER track. Team of four.

## The threat model — everything follows from this

Assume an abuser has physical access to the phone, may know the device passcode,
and checks it periodically.

That single assumption produces every design rule below. When in doubt about a
decision, reason from it.

## Security invariants — do not break these

1. **Nothing leaves the device.** No servers, no analytics, no crash reporting,
   no cloud sync. If a package phones home, it does not go in.
2. **No notifications.** Not quiet ones. None. Do not add the capability.
3. **Lock on background.** Every `AppState` change out of `active` must call
   `lockVault()` and show the decoy, so the app-switcher preview never shows real
   content.
4. **SecureStore holds the key and nothing else.** iOS rejects values over ~2KB.
   Records belong in encrypted files.
5. **Keychain items must not sync to iCloud.** Set via
   `WHEN_UNLOCKED_THIS_DEVICE_ONLY` in `vault.ts`. Never remove it.
6. **Calls and links leave a trace.** A phone call lands in the call log; a link
   lands in browser history. Every `call` and `external` action must go through
   an interstitial that warns her first. Never link directly.
7. **`FundEntry` has no label field, deliberately.** If someone reads the screen
   over her shoulder it shows amounts and dates and nothing explaining them.
   Do not add a note, category or memo field.

## Content rules

1. **Never diagnostic.** The app does not tell her she is being abused. It
   describes what she reported and offers what tends to help.
2. **Not advice.** Not legal, not financial, not counselling. Point to Atlanta
   Legal Aid and the hotlines.
3. **Never invent a phone number, URL or organisation.** A wrong hotline number
   is worse than no entry — someone dials it during the worst week of her life
   and reaches a dead line. Entries stay `verified: false` until a human has
   called and confirmed. If asked to fill in contact details you do not know,
   say so instead of guessing.
4. **Security claims must be literally true.** If the UI says encrypted, it is.
5. **Plain language.** No finance jargon without an explainer. Assume she has
   never been allowed to see the household numbers.

## Architecture

```
src/crypto/vault.ts    key lifecycle + encryption   (Lane A owns)
src/data/types.ts      shared contract across lanes (changes need team agreement)
src/data/scoring.ts    answers -> one of three paths
src/data/questions.ts  the intake                   (Lane C owns)
src/data/paths.ts      the three plans              (Lane C owns)
src/data/resources.ts  the help directory           (Lane C owns)
src/screens/           feature screens              (Lane B owns)
App.tsx, navigation    app shell                    (Lane A owns — nobody else)
scripts/check-content.ts   npm run check
```

**Crypto:** a random 256-bit data key encrypts everything. That key is itself
encrypted under a PBKDF2-derived key from her PIN; only the wrapped version
touches disk. The PIN is stored nowhere. AES-GCM is native via `expo-crypto`;
PBKDF2 is `@noble/hashes` because Expo ships none.

**Routing:** three paths plus a `children` overlay. Deliberately not a decision
tree — combinatorial branching produces more plans than anyone can write well,
and half-written plans are worse than three complete ones.

## Working here

- `npm run web` — run in a browser, no Expo account needed. The default.
- `npm run check` — typecheck plus routing and content checks. Run before pushing.
- `npm start` — phone preview via Expo Go. Needs a free expo.dev account.
  Add `--tunnel` if campus Wi-Fi blocks the connection.

Four lanes work in parallel; see TEAM.md. Only Lane A edits `App.tsx` and
navigation — everyone else builds self-contained screens that Lane A wires in.
This is the rule that prevents merge conflicts.

## Scope

This is a weekend build with four people, most of them new to React Native.
Prefer finishing three things well over starting six. The security shell is the
reason the project is interesting — if something has to be cut, cut a content
feature, never the shell.
