/**
 * Proving the recovery code. Lane A owns this file.
 *
 * Only the first half of getting back in. Succeeding here unlocks the vault,
 * which unmounts this whole tree, so choosing the new PIN happens in SetNewPin —
 * rendered above the navigator and impossible to skip.
 *
 * Input is normalised, so spacing, dashes and case don't matter. Someone typing
 * twelve characters off a piece of paper should not be punished for it.
 *
 * Deliberately not rate-limited like the PIN is: this code is long enough that
 * guessing is hopeless, and locking her out of her own escape hatch would be a
 * cruel way to enforce a rule that buys nothing.
 */

import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { app, radius, space, type } from '../theme';
import { useVault } from '../state/VaultState';

export function UseRecoveryCode({ onBack }: { onBack: () => void }) {
  const insets = useSafeAreaInsets();
  const { recoverWith } = useVault();

  const [entry, setEntry] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function check() {
    setBusy(true);
    setError(null);
    try {
      const ok = await recoverWith(entry);
      if (!ok) setError('That code doesn’t open this. Check it and try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.pad}>
        <Pressable onPress={onBack} hitSlop={12}>
          <Text style={styles.back}>‹ Back</Text>
        </Pressable>

        <Text style={styles.title}>Your recovery code</Text>
        <Text style={styles.lead}>
          The twelve characters you were given when you set this up. Spacing and capitals don’t
          matter.
        </Text>

        <TextInput
          style={styles.input}
          value={entry}
          onChangeText={setEntry}
          placeholder="XXXX-XXXX-XXXX"
          placeholderTextColor={app.subtle}
          autoCapitalize="characters"
          autoCorrect={false}
          onSubmitEditing={check}
        />

        <Text style={styles.error}>{error ?? ' '}</Text>

        <Pressable
          onPress={check}
          disabled={busy || entry.trim().length < 8}
          style={({ pressed }) => [styles.primary, pressed && styles.pressed]}
        >
          {busy ? (
            <ActivityIndicator color={app.bg} />
          ) : (
            <Text style={styles.primaryText}>Open with this code</Text>
          )}
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: app.bg, padding: space.md },
  pad: { gap: space.md, paddingBottom: space.xl },
  back: { ...type.body, color: app.accent },
  title: { ...type.title, color: app.text },
  lead: { ...type.body, color: app.subtle },
  input: {
    backgroundColor: app.surface,
    borderRadius: radius.md,
    paddingHorizontal: space.md,
    paddingVertical: space.md,
    color: app.text,
    fontSize: 20,
    letterSpacing: 2,
    textAlign: 'center',
  },
  error: { ...type.small, color: app.danger, minHeight: 18, textAlign: 'center' },
  primary: {
    backgroundColor: app.accent,
    borderRadius: radius.md,
    paddingVertical: space.md,
    alignItems: 'center',
  },
  primaryText: { ...type.body, color: app.bg, fontWeight: '700' },
  pressed: { opacity: 0.7 },

});
