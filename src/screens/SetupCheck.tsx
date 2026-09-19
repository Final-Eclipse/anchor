/**
 * Dev-only diagnostic. Remove this screen (and its entry in Home) before judging.
 *
 * It exists so every teammate can confirm their environment works on day one,
 * and so the PBKDF2 cost gets measured on real hardware instead of guessed at.
 *
 * It refuses to run once a real vault exists, because the test destroys and
 * recreates the vault — which would wipe real data. Don't remove that guard.
 */

import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Screen } from '../components/Screen';
import { app, radius, space, type } from '../theme';
import {
  setupVault,
  unlockVault,
  lockVault,
  isUnlocked,
  isVaultSetUp,
  encryptJson,
  decryptJson,
  destroyVault,
} from '../crypto/vault';
import { deleteRecord } from '../crypto/recordStore';
import { deleteDoc } from '../crypto/docStore';
import { QUESTIONS } from '../data/questions';
import { PATHS } from '../data/paths';
import { RESOURCES, unverified } from '../data/resources';
import { scoreAssessment } from '../data/scoring';
import { useAppData } from '../state/AppData';
import { useVault } from '../state/VaultState';
import { useConfirm } from '../components/Confirm';

type Line = { label: string; detail: string; ok: boolean };

export default function SetupCheck() {
  const [lines, setLines] = useState<Line[]>([]);
  const [running, setRunning] = useState(false);
  const [blocked, setBlocked] = useState<string | null>(null);
  const { data } = useAppData();
  const { destroy } = useVault();
  const confirm = useConfirm();

  /**
   * Wipes the vault, the saved state and every document, so the next launch is a
   * genuine first run — safety notice, choose a code, all of it.
   *
   * Needed because there's no other way to get back to first run on a phone;
   * Expo Go keeps the Keychain entry between reloads. Dev only, and it goes with
   * this screen before judging.
   */
  async function confirmReset() {
    const yes = await confirm({
      title: 'Start over?',
      body: 'Deletes the code, everything saved, and every document on this phone. Cannot be undone.',
      confirmLabel: 'Delete everything',
      cancelLabel: 'Keep it',
      destructive: true,
    });
    if (!yes) return;

    await Promise.all(data.docs.map((d) => deleteDoc(d.id)));
    await deleteRecord();
    // destroy() rather than destroyVault(), so the app knows the code is gone
    // and offers to set a new one instead of asking for the old.
    await destroy();
  }

  async function run() {
    if (await isVaultSetUp()) {
      setBlocked(
        "You've already set up a code on this phone. These tests create and delete a code of their own, so they'd wipe your data — they won't run while it's here. Use Start over below first if you want to test from scratch."
      );
      return;
    }

    setRunning(true);
    setBlocked(null);
    const out: Line[] = [];
    const add = (label: string, detail: string, ok = true) => {
      out.push({ label, detail, ok });
      setLines([...out]);
    };

    try {
      let t = Date.now();
      await setupVault('482100');
      add('Vault created', `${Date.now() - t} ms`);

      t = Date.now();
      const blob = await encryptJson({ hello: 'anchor', n: 42 });
      add('Encrypt record', `${Date.now() - t} ms · ${blob.length} chars`);

      t = Date.now();
      const back = await decryptJson<{ hello: string; n: number }>(blob);
      const ok = back.hello === 'anchor' && back.n === 42;
      add('Decrypt record', ok ? `${Date.now() - t} ms` : 'MISMATCH', ok);

      lockVault();
      add('Lock', isUnlocked() ? 'still unlocked' : 'key dropped', !isUnlocked());

      const wrong = await unlockVault('000000');
      add('Wrong PIN rejected', wrong.ok ? 'ACCEPTED — BUG' : 'rejected', !wrong.ok);

      t = Date.now();
      const right = await unlockVault('482100');
      const unlockMs = Date.now() - t;
      add('Correct PIN accepted', `${unlockMs} ms`, right.ok);
      add(
        'Unlock budget',
        unlockMs < 1000 ? `${unlockMs} ms — fine` : `${unlockMs} ms — lower PBKDF2_ITERATIONS`,
        unlockMs < 1000
      );

      const result = scoreAssessment(
        { 'safety-now': 'no', 'own-account': 'no', 'own-income': 'none' },
        QUESTIONS
      );
      add('Routing', `${result.pathId} → "${PATHS[result.pathId].title}"`);

      const pending = unverified();
      add(
        'Resources verified',
        `${RESOURCES.length - pending.length}/${RESOURCES.length}${pending.length ? ' — Lane C is on it' : ''}`,
        pending.length === 0
      );

      await destroyVault();
      add('Cleaned up', 'test vault destroyed');
    } catch (err) {
      add('Failed', String(err), false);
    }
    setRunning(false);
  }

  const failed = lines.filter((l) => !l.ok).length;

  return (
    <Screen title="Setup check" subtitle="For us, not for her. Delete this screen before judging.">
      <Text style={styles.explainer}>
        Two tools for building. <Text style={styles.strong}>Run checks</Text> proves the
        encryption works on this phone and times how long unlocking takes.{' '}
        <Text style={styles.strong}>Start over</Text> wipes everything so you can see the
        first-run screens again — there's no other way back to them, because the code you set
        survives reloading the app.
      </Text>

      <Pressable
        style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
        onPress={run}
        disabled={running}
      >
        <Text style={styles.buttonText}>{running ? 'Running…' : 'Run checks'}</Text>
      </Pressable>

      {blocked ? <Text style={styles.blocked}>{blocked}</Text> : null}

      {lines.map((line, i) => (
        <View key={i} style={styles.row}>
          <Text style={[styles.mark, line.ok ? styles.markOk : styles.markBad]}>
            {line.ok ? '✓' : '✕'}
          </Text>
          <View style={styles.rowText}>
            <Text style={styles.rowLabel}>{line.label}</Text>
            <Text style={styles.rowDetail}>{line.detail}</Text>
          </View>
        </View>
      ))}

      {lines.length > 0 && !running ? (
        <Text style={[styles.verdict, failed ? styles.verdictBad : styles.verdictOk]}>
          {failed === 0
            ? 'All good. Post your unlock timing in the group chat.'
            : `${failed} check${failed > 1 ? 's' : ''} failed.`}
        </Text>
      ) : null}

      <View style={styles.resetBlock}>
        <Text style={styles.resetHint}>
          Deletes your code, everything saved, and every document on this phone, so the next
          time you long-press the day ring you'll get the safety notice and set a new code —
          exactly what she'd see opening it for the first time.
        </Text>
        <Pressable
          onPress={confirmReset}
          style={({ pressed }) => [styles.reset, pressed && styles.buttonPressed]}
        >
          <Text style={styles.resetText}>Start over</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: app.accent,
    borderRadius: radius.md,
    paddingVertical: space.md,
    alignItems: 'center',
  },
  buttonPressed: { opacity: 0.7 },
  buttonText: { color: app.bg, ...type.body, fontWeight: '700' },
  explainer: { ...type.small, color: app.subtle, lineHeight: 19 },
  strong: { color: app.text, fontWeight: '700' },
  blocked: {
    ...type.small,
    color: app.gold,
    backgroundColor: app.surface,
    padding: space.md,
    borderRadius: radius.md,
  },
  row: {
    flexDirection: 'row',
    gap: space.md,
    paddingVertical: space.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: app.line,
  },
  mark: { fontSize: 15, width: 16 },
  markOk: { color: app.accent },
  markBad: { color: app.danger },
  rowText: { flex: 1 },
  rowLabel: { ...type.body, color: app.text, fontWeight: '600' },
  rowDetail: { ...type.small, color: app.subtle, marginTop: 1 },
  verdict: { ...type.body, marginTop: space.sm },
  verdictOk: { color: app.accent },
  verdictBad: { color: app.danger },
  resetBlock: {
    marginTop: space.lg,
    paddingTop: space.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: app.line,
    gap: space.sm,
  },
  resetHint: { ...type.small, color: app.subtle },
  reset: {
    borderWidth: 1,
    borderColor: app.danger,
    borderRadius: radius.md,
    paddingVertical: space.md,
    alignItems: 'center',
  },
  resetText: { ...type.body, color: app.danger, fontWeight: '600' },
});
