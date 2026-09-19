/**
 * PIN entry. Lane A owns this file.
 *
 * Handles both first run (the safety notice, then choose a PIN and confirm it)
 * and every run after (enter it). Six digits, not four — see the note in
 * vault.ts about why PIN length matters far more than the work factor.
 *
 * The notice comes before anything else on first run, and it says what the app
 * can't do as plainly as what it can. An app in this position that oversells its
 * protection is worse than no app, because she'd act on the difference.
 */

import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { app, radius, space, type } from '../theme';
import { useVault } from '../state/VaultState';
import { SafetyNotice } from './SafetyNotice';

const PIN_LENGTH = 6;
const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'];

export function Unlock({ onCancel }: { onCancel: () => void }) {
  const { hasVault, open, create } = useVault();
  const [pin, setPin] = useState('');
  const [firstEntry, setFirstEntry] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [noticeSeen, setNoticeSeen] = useState(false);

  const creating = hasVault === false;
  const confirming = creating && firstEntry !== null;

  async function submit(value: string) {
    setBusy(true);
    setError(null);
    try {
      if (creating) {
        if (firstEntry === null) {
          setFirstEntry(value);
          setPin('');
        } else if (firstEntry === value) {
          await create(value);
        } else {
          setError("Those didn't match. Start again.");
          setFirstEntry(null);
          setPin('');
        }
      } else {
        const result = await open(value);
        if (!result.ok) {
          setPin('');
          if (result.reason === 'locked') {
            const mins = Math.ceil(result.retryInMs / 60_000);
            const secs = Math.ceil(result.retryInMs / 1000);
            setError(
              secs <= 60
                ? `Too many tries. Wait ${secs} seconds.`
                : `Too many tries. Wait ${mins} minutes.`
            );
          } else if (result.reason === 'wrong') {
            setError(
              result.attemptsBeforeWait <= 1
                ? 'Not quite. One more try before a wait.'
                : 'Not quite.'
            );
          } else {
            setError('Not quite.');
          }
        }
      }
    } finally {
      setBusy(false);
    }
  }

  function press(key: string) {
    if (busy) return;
    if (key === '⌫') {
      setPin((p) => p.slice(0, -1));
      return;
    }
    if (!key || pin.length >= PIN_LENGTH) return;

    const next = pin + key;
    setPin(next);
    if (next.length === PIN_LENGTH) submit(next);
  }

  const insets = useSafeAreaInsets();

  // First run: say what this can and can't do before she commits anything to it.
  if (creating && !noticeSeen) {
    return <SafetyNotice onContinue={() => setNoticeSeen(true)} onCancel={onCancel} />;
  }

  const prompt = hasVault === null
    ? ' '
    : confirming
      ? 'Enter it again'
      : creating
        ? 'Choose a 6-digit code'
        : 'Enter your code';

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <Pressable onPress={onCancel} hitSlop={12} style={styles.back}>
        <Text style={styles.backText}>‹ Back</Text>
      </Pressable>

      <View style={styles.center}>
        <Text style={styles.prompt}>{prompt}</Text>

        <View style={styles.dots}>
          {Array.from({ length: PIN_LENGTH }).map((_, i) => (
            <View key={i} style={[styles.dot, i < pin.length && styles.dotFilled]} />
          ))}
        </View>

        <Text style={styles.error}>{busy ? ' ' : (error ?? ' ')}</Text>
        {busy ? <ActivityIndicator color={app.accent} /> : <View style={styles.spinnerSlot} />}
      </View>

      <View style={styles.pad}>
        {KEYS.map((key, i) => (
          <Pressable
            key={i}
            onPress={() => press(key)}
            disabled={!key}
            style={({ pressed }) => [
              styles.key,
              !key && styles.keyEmpty,
              pressed && key ? styles.keyPressed : null,
            ]}
          >
            <Text style={styles.keyText}>{key}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: app.bg, padding: space.md },
  back: { alignSelf: 'flex-start' },
  backText: { ...type.body, color: app.subtle },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: space.md },
  prompt: { ...type.heading, color: app.text },
  dots: { flexDirection: 'row', gap: space.md },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: app.line,
  },
  dotFilled: { backgroundColor: app.accent, borderColor: app.accent },
  error: { ...type.small, color: app.danger, height: 18 },
  spinnerSlot: { height: 20 },
  pad: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, justifyContent: 'center' },
  key: {
    width: '30%',
    paddingVertical: space.md,
    alignItems: 'center',
    backgroundColor: app.surface,
    borderRadius: radius.md,
  },
  keyEmpty: { backgroundColor: 'transparent' },
  keyPressed: { backgroundColor: app.surfaceLift },
  keyText: { ...type.heading, color: app.text },
});
