/**
 * What she sees when she can't get in. Lane A owns this file.
 *
 * There is no recovery, and there cannot be one: any way back in without the
 * code is also a way in for the person holding her phone. A reset email needs an
 * inbox he can read, and security questions are worse than useless here — a
 * partner knows her mother's maiden name and the street she grew up on.
 *
 * But "no recovery" is not the same as "no way forward", and until this screen
 * existed she was simply stuck at a keypad with nothing to tap. That was the
 * real bug. This tells her plainly what is gone, what isn't, and lets her keep
 * using the app.
 *
 * The thing worth saying out loud: almost everything valuable here survives.
 * The organisations, the guides, the plans and the cost calculator are the same
 * for everyone and need no key. What she loses is her own records.
 */

import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { app, radius, space, type } from '../theme';
import { useVault } from '../state/VaultState';
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
  const { destroy } = useVault();
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

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.pad}>
        <Pressable onPress={onBack} hitSlop={12}>
          <Text style={styles.back}>‹ Back</Text>
        </Pressable>

        <Text style={styles.title}>There's no way to recover it</Text>

        <Text style={styles.lead}>
          We can't reset your code for you, and that's deliberate. Anything that could let you
          back in without it would also let in someone else holding this phone. There's no
          reset email, because an inbox is the first place someone looks — and no security
          questions, because a partner usually knows those answers.
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
