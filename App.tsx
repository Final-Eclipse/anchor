/**
 * TEMPORARY — setup verification screen.
 *
 * Lane A replaces this with the real decoy shell. Until then it earns its keep
 * twice: every teammate can confirm their environment works end to end on their
 * own phone on day one, and it answers the open question in vault.ts by timing
 * PBKDF2 on real hardware instead of guessing.
 *
 * When you see the unlock timing, write it in the group chat and tune
 * PBKDF2_ITERATIONS to land under about a second.
 */

import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import {
  setupVault,
  unlockVault,
  lockVault,
  isUnlocked,
  encryptJson,
  decryptJson,
  destroyVault,
} from './src/crypto/vault';
import { QUESTIONS } from './src/data/questions';
import { PATHS } from './src/data/paths';
import { RESOURCES, unverified } from './src/data/resources';
import { scoreAssessment } from './src/data/scoring';

type Line = { label: string; detail: string; ok: boolean };

export default function App() {
  const [lines, setLines] = useState<Line[]>([]);
  const [running, setRunning] = useState(false);

  async function run() {
    setRunning(true);
    const out: Line[] = [];
    const add = (label: string, detail: string, ok = true) => {
      out.push({ label, detail, ok });
      setLines([...out]);
    };

    try {
      await destroyVault();

      let t = Date.now();
      await setupVault('4821');
      add('Vault created', `${Date.now() - t} ms`);

      t = Date.now();
      const blob = await encryptJson({ hello: 'anchor', n: 42 });
      add('Encrypt record', `${Date.now() - t} ms · ${blob.length} chars`);

      t = Date.now();
      const back = await decryptJson<{ hello: string; n: number }>(blob);
      const roundTripped = back.hello === 'anchor' && back.n === 42;
      add('Decrypt record', roundTripped ? `${Date.now() - t} ms` : 'MISMATCH', roundTripped);

      lockVault();
      add('Lock', isUnlocked() ? 'still unlocked' : 'key dropped', !isUnlocked());

      t = Date.now();
      const wrong = await unlockVault('0000');
      add('Wrong PIN rejected', wrong ? 'ACCEPTED — BUG' : `${Date.now() - t} ms`, !wrong);

      t = Date.now();
      const right = await unlockVault('4821');
      const unlockMs = Date.now() - t;
      add('Correct PIN accepted', `${unlockMs} ms`, right);
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
        `${RESOURCES.length - pending.length}/${RESOURCES.length}`,
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
    <View style={styles.root}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.eyebrow}>ANCHOR · SETUP CHECK</Text>
        <Text style={styles.title}>Does your machine work?</Text>
        <Text style={styles.body}>
          Runs the real crypto on this device. If everything passes, you're set up and can start
          building.
        </Text>

        <Pressable
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
          onPress={run}
          disabled={running}
        >
          <Text style={styles.buttonText}>{running ? 'Running…' : 'Run checks'}</Text>
        </Pressable>

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

        {lines.length > 0 && !running && (
          <Text style={[styles.verdict, failed ? styles.verdictBad : styles.verdictOk]}>
            {failed === 0
              ? 'All good. Post your unlock timing in the group chat.'
              : `${failed} check${failed > 1 ? 's' : ''} failed.`}
          </Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#131b19' },
  scroll: { padding: 24, paddingTop: 72, gap: 4 },
  eyebrow: { color: '#7fb0a3', fontSize: 11, letterSpacing: 1.5, marginBottom: 8 },
  title: { color: '#ece8e0', fontSize: 30, fontWeight: '600', marginBottom: 10 },
  body: { color: '#a6b0ab', fontSize: 14, lineHeight: 20, marginBottom: 22 },
  button: {
    backgroundColor: '#7fb0a3',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 24,
  },
  buttonPressed: { opacity: 0.7 },
  buttonText: { color: '#131b19', fontSize: 15, fontWeight: '700' },
  row: { flexDirection: 'row', gap: 12, paddingVertical: 9, borderTopWidth: 1, borderTopColor: '#313e3a' },
  mark: { fontSize: 15, width: 16, marginTop: 1 },
  markOk: { color: '#7fb0a3' },
  markBad: { color: '#d28c86' },
  rowText: { flex: 1 },
  rowLabel: { color: '#ece8e0', fontSize: 14, fontWeight: '600' },
  rowDetail: { color: '#a6b0ab', fontSize: 13, marginTop: 1 },
  verdict: { marginTop: 22, fontSize: 14, lineHeight: 20 },
  verdictOk: { color: '#7fb0a3' },
  verdictBad: { color: '#d28c86' },
});
