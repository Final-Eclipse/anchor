# Anchor

> The name on the phone is a separate decision and stays innocuous — a notes or
> budget app. "Anchor" is what we call it in the pitch, not on the home screen.

A discretion-first mobile app for women facing financial control in a relationship.
It assesses her situation privately, routes her to a plan built for that situation,
and helps her act on it — designed for a phone that someone else might pick up.

HackHers 2027 · FinanceHER track · Expo SDK 57 · React Native · TypeScript

---

## Getting set up

You need Node 24. If you don't have `nvm`:

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
```

Then, in a new terminal:

```bash
git clone https://github.com/Final-Eclipse/anchor.git
cd anchor
nvm use          # reads .nvmrc so we're all on the same Node
npm install
npm start
```

`npm start` prints a QR code. Install **Expo Go** on your phone, scan it, and the
app opens. Everything in the MVP runs in Expo Go — no native build needed.

Before pushing:

```bash
npm run check    # typecheck + content and routing checks
```

---

## Who owns what

**→ See [TEAM.md](TEAM.md) for your lane and your first task.**

Three lanes, so four people can work at once without colliding.

| Lane | Owns | Files |
|---|---|---|
| **A · Shell & security** | Navigation, the decoy shell, unlock, panic exit, crypto | `src/crypto/`, navigation, `App.tsx` |
| **B · Features** | Assessment UI, fund tracker, directory, vault screens | `src/screens/` |
| **C · Content & design** | Questions, paths, resource data, visual pass | `src/data/questions.ts`, `paths.ts`, `resources.ts` |

**The one rule that prevents most merge conflicts:** only lane A edits navigation
and the app shell. Lane B builds self-contained screens; lane A wires them in.

`src/data/types.ts` is the contract between all three lanes. Changing it breaks
someone else's work in progress — agree changes in the group chat first.

Branch per feature, PR into `main`, one teammate glances before merging:

```bash
git checkout -b feature/assessment-ui
git push -u origin feature/assessment-ui
```

---

## What's already built

- `src/crypto/vault.ts` — key lifecycle and encryption, complete
- `src/data/types.ts` — the shared contract
- `src/data/scoring.ts` — answers → path, with tests passing
- `src/data/questions.ts` — six starter questions, draft wording
- `src/data/paths.ts` — three paths, five steps each, draft wording
- `src/data/resources.ts` — seven real orgs, **contact details not yet filled in**
- `scripts/check-content.ts` — run via `npm run check`

## What's not built yet

Every screen. That's lane A and B's work:

- Decoy shell, PIN unlock, panic exit, auto-lock on background
- Assessment flow, path checklist, fund tracker, directory, document vault
- Account guide, exit interstitials

---

## Security invariants

These are the reason the project is interesting. Don't break them without the
whole team agreeing.

1. **Nothing leaves the device.** No servers, no analytics, no crash reporting,
   no cloud sync. If you add a package that phones home, it comes out.
2. **No notifications.** Not quiet ones. None.
3. **Lock on background.** Every `AppState` change out of `active` calls
   `lockVault()` and shows the decoy. The app switcher preview must never show
   real content.
4. **SecureStore holds the key and nothing else.** iOS rejects values over about
   2 KB, and more importantly records belong in encrypted files, not the Keychain.
5. **Keychain items must not sync to iCloud.** Already set via
   `WHEN_UNLOCKED_THIS_DEVICE_ONLY` in `vault.ts` — don't remove it.
6. **Exclude app data from iOS backup.** Not done yet. Lane A, hour 8.
7. **Calls and links leave a trace.** Every `call` and `external` action goes
   through the exit interstitial that warns her first. Never link directly.

## Content rules

1. **Nothing unverified ships.** Every resource entry needs a number someone on
   this team actually dialled. `npm run check` lists what's still outstanding.
   A dead hotline number is worse than no entry.
2. **Never diagnostic.** The app does not tell her she is being abused. It
   describes what she reported and offers what tends to help.
3. **Not advice.** Not legal, not financial, not counselling. Point to Atlanta
   Legal Aid and the hotlines for that.
4. **Security claims must be literally true.** If the UI says encrypted, it is.

## Crypto, in one paragraph

A random 256-bit data key encrypts everything stored. That key is itself
encrypted under a key derived from her PIN via PBKDF2, and only the wrapped
version touches disk. The PIN is stored nowhere. Someone who knows the device
passcode — the adversary this app is built for — opens the Keychain and finds
noise. AES-GCM comes from `expo-crypto` and runs natively in Expo Go; PBKDF2 is
`@noble/hashes` because Expo doesn't ship one.

`PBKDF2_ITERATIONS` in `vault.ts` is a guess until someone measures unlock time
on a real phone. Measure it, then tune it, then write down what you measured.
