/**
 * Choosing a new code after getting in with the recovery code.
 *
 * This is not optional and there is no way past it. A vault opened by recovery
 * has no PIN she knows — if she were dropped straight into the app, the next
 * time it locked she'd be stranded exactly where she started.
 *
 * It lives here, rendered above the navigator, rather than inside the recovery
 * screen: succeeding at recovery unlocks the vault, which unmounts the whole
 * locked tree along with anything drawn inside it.
 */

import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { app, radius, space, type } from '../theme';
import { useVault } from '../state/VaultState';

const PIN_LENGTH = 6;
const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'];

export function SetNewPin() {
  const insets = useSafeAreaInsets();
  const { replacePin } = useVault();
  const [pin, setPin] = useState('');
  const [firstEntry, setFirstEntry] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(value: string) {
    setBusy(true);
    setError(null);
    try {
      if (firstEntry === null) {
        setFirstEntry(value);
        setPin('');
      } else if (firstEntry === value) {
        await replacePin(value);
      } else {
        setError('Those didn’t match. Start again.');
        setFirstEntry(null);
        setPin('');
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

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.center}>
        <Text style={styles.prompt}>
          {firstEntry === null ? 'Choose a new 6-digit code' : 'Enter it again'}
        </Text>
        <Text style={styles.sub}>Everything you saved is still here.</Text>

        <View style={styles.dots}>
          {Array.from({ length: PIN_LENGTH }).map((_, i) => (
            <View key={i} style={[styles.dot, i < pin.length && styles.dotFilled]} />
          ))}
        </View>

        <Text style={styles.error}>{busy ? ' ' : (error ?? ' ')}</Text>
        {busy ? <ActivityIndicator color={app.accent} /> : <View style={styles.spinnerSlot} />}
      </View>

      <View style={styles.keypad}>
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
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: space.sm },
  prompt: { ...type.heading, color: app.text },
  sub: { ...type.small, color: app.subtle },
  dots: { flexDirection: 'row', gap: space.md, marginTop: space.sm },
  dot: { width: 12, height: 12, borderRadius: 6, borderWidth: 1.5, borderColor: app.line },
  dotFilled: { backgroundColor: app.accent, borderColor: app.accent },
  error: { ...type.small, color: app.danger, height: 18 },
  spinnerSlot: { height: 20 },
  keypad: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, justifyContent: 'center' },
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
