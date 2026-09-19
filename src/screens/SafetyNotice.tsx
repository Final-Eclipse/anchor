/**
 * What she sees before anything else, once. Lane A owns this file.
 *
 * The temptation is to open with reassurance. Don't. She may be about to make
 * decisions based on what this screen claims, and an app in this position that
 * oversells its protection is worse than no app at all — she'd act on the gap
 * between what we promised and what we can actually do.
 *
 * So: what it does, then what it can't, then where to go when it can't. In that
 * order, in plain sentences, with no security vocabulary.
 */

import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { app, radius, space, type } from '../theme';

const CAN = [
  'It looks like a cycle tracker, and keeps looking like one until you unlock it.',
  'Everything you save stays on this phone. Nothing is sent anywhere, and there is no account.',
  'What you save is scrambled with your code. Someone who knows how to unlock this phone still cannot read it.',
  'It never sends notifications.',
];

const CANNOT = [
  'It cannot help if software to watch this phone is already installed on it.',
  'It cannot help if someone is looking over your shoulder while it is open.',
  'Calls you make and links you open from here will show up in your phone and browser. You will be warned first, every time.',
];

export function SafetyNotice({
  onContinue,
  onCancel,
}: {
  onContinue: () => void;
  onCancel: () => void;
}) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.pad}>
        <Text style={styles.title}>Before you start</Text>

        <Text style={styles.lead}>
          Read this once. It matters more than anything else here.
        </Text>

        <View style={styles.block}>
          <Text style={styles.blockTitle}>What this does</Text>
          {CAN.map((line) => (
            <Text key={line} style={styles.item}>
              {line}
            </Text>
          ))}
        </View>

        <View style={[styles.block, styles.blockWarn]}>
          <Text style={[styles.blockTitle, styles.blockTitleWarn]}>What it cannot do</Text>
          {CANNOT.map((line) => (
            <Text key={line} style={styles.item}>
              {line}
            </Text>
          ))}
        </View>

        <Text style={styles.closing}>
          If you think someone may be watching what you do on this phone, use a computer at a
          library, or a friend's phone, instead of this app.
        </Text>

        <Pressable
          onPress={onContinue}
          style={({ pressed }) => [styles.primary, pressed && styles.pressed]}
        >
          <Text style={styles.primaryText}>I understand</Text>
        </Pressable>

        <Pressable onPress={onCancel} style={styles.secondary}>
          <Text style={styles.secondaryText}>Not now</Text>
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
  block: {
    backgroundColor: app.surface,
    borderRadius: radius.md,
    padding: space.md,
    gap: space.sm,
  },
  blockWarn: { borderWidth: 1, borderColor: app.danger },
  blockTitle: { ...type.label, color: app.accent, textTransform: 'uppercase' },
  blockTitleWarn: { color: app.danger },
  item: { ...type.body, color: app.text },
  closing: { ...type.body, color: app.subtle },
  primary: {
    backgroundColor: app.accent,
    borderRadius: radius.md,
    paddingVertical: space.md,
    alignItems: 'center',
  },
  pressed: { opacity: 0.7 },
  primaryText: { ...type.body, color: app.bg, fontWeight: '700' },
  secondary: { paddingVertical: space.sm, alignItems: 'center' },
  secondaryText: { ...type.body, color: app.subtle },
});
