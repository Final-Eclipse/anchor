/**
 * Offered once, right after she sets her code. Lane A owns this file.
 *
 * Without this, forgetting the code means losing everything — and since there is
 * deliberately no reset email and no security questions, there was previously no
 * way back at all. This is the only one that doesn't also open the door to
 * someone holding her phone, because it depends on something kept somewhere else.
 *
 * It is optional, and the screen says plainly why: a code written on paper at
 * home is a liability, and only she knows whether she has somewhere safe. Skip
 * is a legitimate answer and is presented as one, not as a warning.
 */

import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { app, radius, space, type } from '../theme';
import { generateRecoveryCode } from '../crypto/vault';
import { useVault } from '../state/VaultState';

const PLACES = [
  'Memorise it, if you can',
  'Give it to someone you trust completely',
  'Keep it somewhere that isn’t home — a locker, a desk at work',
  'A password manager he has no access to',
];

export function RecoveryCode({ onDone }: { onDone: () => void }) {
  const insets = useSafeAreaInsets();
  const { attachRecovery } = useVault();
  const [code, setCode] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    generateRecoveryCode().then(setCode);
  }, []);

  async function keep() {
    if (!code) return;
    setSaving(true);
    try {
      await attachRecovery(code);
      onDone();
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.pad}>
        <Text style={styles.title}>One way back in</Text>

        <Text style={styles.lead}>
          If you ever forget your code, this is the only thing that can open your information
          again. We can’t recover it for you — there’s no email and no security questions,
          because both are things someone else could get at.
        </Text>

        {code ? (
          <View style={styles.codeBox}>
            <Text selectable style={styles.code}>
              {code}
            </Text>
          </View>
        ) : (
          <View style={styles.codeBox}>
            <ActivityIndicator color={app.accent} />
          </View>
        )}

        <View style={styles.block}>
          <Text style={styles.blockTitle}>WHERE TO KEEP IT</Text>
          {PLACES.map((place) => (
            <Text key={place} style={styles.item}>
              {place}
            </Text>
          ))}
        </View>

        <Text style={styles.warning}>
          Don’t write it somewhere he could come across it. A code found at home is a way into
          everything you’ve saved here — if you don’t have anywhere safe, it’s genuinely better
          to skip this.
        </Text>

        <Pressable
          onPress={keep}
          disabled={!code || saving}
          style={({ pressed }) => [styles.primary, pressed && styles.pressed]}
        >
          <Text style={styles.primaryText}>
            {saving ? 'Saving…' : 'I’ve put it somewhere safe'}
          </Text>
        </Pressable>

        <Pressable onPress={onDone} disabled={saving} style={styles.secondary}>
          <Text style={styles.secondaryText}>Skip — I don’t have anywhere safe</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: app.bg },
  pad: { padding: space.md, gap: space.md, paddingBottom: space.xl },
  title: { ...type.title, color: app.text },
  lead: { ...type.body, color: app.subtle },
  codeBox: {
    backgroundColor: app.surface,
    borderWidth: 1,
    borderColor: app.accent,
    borderRadius: radius.lg,
    paddingVertical: space.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 84,
  },
  code: {
    fontSize: 26,
    letterSpacing: 3,
    color: app.accent,
    fontWeight: '700',
  },
  block: {
    backgroundColor: app.surface,
    borderRadius: radius.md,
    padding: space.md,
    gap: space.sm,
  },
  blockTitle: { ...type.label, color: app.accent },
  item: { ...type.body, color: app.text },
  warning: { ...type.small, color: app.gold },
  primary: {
    backgroundColor: app.accent,
    borderRadius: radius.md,
    paddingVertical: space.md,
    alignItems: 'center',
  },
  primaryText: { ...type.body, color: app.bg, fontWeight: '700' },
  pressed: { opacity: 0.7 },
  secondary: { paddingVertical: space.sm, alignItems: 'center' },
  secondaryText: { ...type.body, color: app.subtle },
});
