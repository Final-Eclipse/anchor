/**
 * What she sees when she can't get in. Lane A owns this file.
 *
 * Two different screens depending on whether she set up a recovery code. With
 * one, this is a route back in. Without one, it explains why there is no reset
 * email and no security questions — both are things someone else could get at,
 * an inbox most of all — and then offers to start over.
 *
 * Either way she is never stranded. Before this existed she reached a keypad
 * with nothing to tap, which was the actual bug.
 *
 * The thing worth saying out loud even in the worst case: almost everything
 * valuable here survives. The organisations, the guides, the plans and the cost
 * calculator are the same for everyone and need no key. What she loses are her
 * own records.
 */

import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { app, radius, space, type } from '../theme';
import { useState } from 'react';
import { useVault } from '../state/VaultState';
import { UseRecoveryCode } from './UseRecoveryCode';
import { useConfirm } from '../components/Confirm';
import { deleteRecord } from '../crypto/recordStore';

const LOST = [
  'What you had set aside, and the amounts you logged',
  'Any documents you photographed',
  'Your answers, and the steps you ticked off',
];

const KEPT = [
  'Every organisation and phone number',
  'The guides — opening an account, taking help from someone',
  'What leaving costs, and the plans',
  'The disguise, and everything that keeps this hidden',
];

export function ForgotCode({ onBack }: { onBack: () => void }) {
  const insets = useSafeAreaInsets();
  const { destroy, recoveryAvailable } = useVault();
  const [usingCode, setUsingCode] = useState(false);
  const confirm = useConfirm();

  async function startOver() {
    const yes = await confirm({
      title: 'Set a new code?',
      body: 'Everything you saved will be deleted from this phone and cannot be brought back. The app itself will work exactly as it does now.',
      confirmLabel: 'Delete and start again',
      cancelLabel: 'Keep trying my code',
      destructive: true,
    });
    if (!yes) return;

    // Documents are keyed by ids inside the record we're about to delete, so
    // they can't be listed any more. They're unreadable without the key either
    // way; a future version should sweep the directory.
    await deleteRecord();
    await destroy();
    onBack();
  }

  if (usingCode) return <UseRecoveryCode onBack={onBack} />;

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.pad}>
        <Pressable onPress={onBack} hitSlop={12}>
          <Text style={styles.back}>‹ Back</Text>
        </Pressable>

        <Text style={styles.title}>
          {recoveryAvailable ? 'Use your recovery code' : "There's no way to recover it"}
        </Text>

        {recoveryAvailable ? (
          <>
            <Text style={styles.lead}>
              You saved a recovery code when you set this up — twelve characters. It opens
              everything, and then you can choose a new code.
            </Text>
            <Pressable
              onPress={() => setUsingCode(true)}
              style={({ pressed }) => [styles.secondary, pressed && styles.pressed]}
            >
              <Text style={styles.secondaryText}>I have my recovery code</Text>
            </Pressable>
          </>
        ) : null}

        <Text style={styles.lead}>
          {recoveryAvailable
            ? "If you don't have that code either, there's no other way back to what you saved — but you can start again below."
            : "We can't reset your code for you, and that's deliberate. Anything that could let you back in without it would also let in someone else holding this phone. There's no reset email, because an inbox is the first place someone looks — and no security questions, because a partner usually knows those answers."}
        </Text>

        <View style={styles.block}>
          <Text style={styles.blockTitle}>WHAT YOU'D LOSE</Text>
          {LOST.map((line) => (
            <Text key={line} style={styles.item}>
              {line}
            </Text>
          ))}
        </View>

        <View style={[styles.block, styles.blockKeep]}>
          <Text style={[styles.blockTitle, styles.blockTitleKeep]}>WHAT STAYS</Text>
          {KEPT.map((line) => (
            <Text key={line} style={styles.item}>
              {line}
            </Text>
          ))}
        </View>

        <Text style={styles.closing}>
          Most of what's useful here isn't yours alone — it's the same for everyone and it needs
          no code. If you start again you lose your own records, not the app.
        </Text>

        <Pressable
          onPress={startOver}
          style={({ pressed }) => [styles.danger, pressed && styles.pressed]}
        >
          <Text style={styles.dangerText}>Set a new code and start again</Text>
        </Pressable>

        <Pressable onPress={onBack} style={styles.secondary}>
          <Text style={styles.secondaryText}>Let me try again</Text>
        </Pressable>

        <Text style={styles.hint}>
          Worth a try first: codes are six digits, and people often reach for a date. Nothing
          bad happens if you guess wrong — you'll just be asked to wait a little between tries.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: app.bg },
  pad: { padding: space.md, gap: space.md, paddingBottom: space.xl },
  back: { ...type.body, color: app.accent },
  title: { ...type.title, color: app.text },
  lead: { ...type.body, color: app.subtle },
  block: {
    backgroundColor: app.surface,
    borderRadius: radius.md,
    padding: space.md,
    gap: space.sm,
    borderWidth: 1,
    borderColor: app.danger,
  },
  blockKeep: { borderColor: app.accent },
  blockTitle: { ...type.label, color: app.danger },
  blockTitleKeep: { color: app.accent },
  item: { ...type.body, color: app.text },
  closing: { ...type.body, color: app.subtle },
  danger: {
    borderWidth: 1,
    borderColor: app.danger,
    borderRadius: radius.md,
    paddingVertical: space.md,
    alignItems: 'center',
  },
  dangerText: { ...type.body, color: app.danger, fontWeight: '600' },
  pressed: { opacity: 0.7 },
  secondary: {
    backgroundColor: app.accent,
    borderRadius: radius.md,
    paddingVertical: space.md,
    alignItems: 'center',
  },
  secondaryText: { ...type.body, color: app.bg, fontWeight: '700' },
  hint: { ...type.small, color: app.subtle },
});
