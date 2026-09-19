/**
 * How to open an account that stays hers.
 *
 * This screen does not open accounts and does not pretend to. It explains the
 * decisions that decide whether one stays private, and then it says what can
 * expose it anyway — because a guide that only lists the reassuring half would
 * leave her believing an account is invisible when a joint tax return isn't.
 *
 * Not financial or legal advice, and it says so.
 */

import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Screen } from '../components/Screen';
import { app, radius, space, type } from '../theme';
import { OPENING_STEPS, STILL_VISIBLE } from '../data/accountGuide';
import type { ScreenProps } from '../navigation/types';

export default function AccountGuide({ navigation }: ScreenProps<'AccountGuide'>) {
  return (
    <Screen title="An account of your own" subtitle="What makes one stay private.">
      <Text style={styles.intro}>
        This is a guide, not a bank. Opening the account is something you do yourself — these
        are the choices along the way that decide whether it stays yours.
      </Text>

      {OPENING_STEPS.map((step, i) => (
        <View key={step.title} style={styles.card}>
          <Text style={styles.index}>{String(i + 1).padStart(2, '0')}</Text>
          <View style={styles.cardText}>
            <Text style={styles.cardTitle}>{step.title}</Text>
            <Text style={styles.cardBody}>{step.body}</Text>
          </View>
        </View>
      ))}

      <View style={styles.warnBlock}>
        <Text style={styles.warnLabel}>WHAT CAN STILL SHOW</Text>
        <Text style={styles.warnIntro}>
          Doing all of the above does not make an account invisible. These are the ways one can
          surface anyway, so you can decide what risk you are taking.
        </Text>
        {STILL_VISIBLE.map((item) => (
          <View key={item.title} style={styles.warnItem}>
            <Text style={styles.warnTitle}>{item.title}</Text>
            <Text style={styles.warnBody}>{item.body}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.disclaimer}>
        This is information, not legal or financial advice. For advice about your situation —
        especially anything involving money, custody or leaving — talk to legal aid. They are
        free.
      </Text>

      <Pressable
        onPress={() => navigation.navigate('Directory', { filter: 'legal' })}
        style={({ pressed }) => [styles.primary, pressed && styles.pressed]}
      >
        <Text style={styles.primaryText}>Find legal help</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: { ...type.body, color: app.subtle },
  card: {
    flexDirection: 'row',
    gap: space.md,
    backgroundColor: app.surface,
    borderRadius: radius.md,
    padding: space.md,
  },
  index: { ...type.label, color: app.accent, paddingTop: 3 },
  cardText: { flex: 1, gap: 2 },
  cardTitle: { ...type.body, color: app.text, fontWeight: '600' },
  cardBody: { ...type.small, color: app.subtle },

  warnBlock: {
    borderWidth: 1,
    borderColor: app.gold,
    borderRadius: radius.md,
    padding: space.md,
    gap: space.sm,
    marginTop: space.sm,
  },
  warnLabel: { ...type.label, color: app.gold },
  warnIntro: { ...type.small, color: app.subtle },
  warnItem: { gap: 2 },
  warnTitle: { ...type.body, color: app.text, fontWeight: '600' },
  warnBody: { ...type.small, color: app.subtle },

  disclaimer: { ...type.small, color: app.subtle, marginTop: space.sm },
  primary: {
    backgroundColor: app.surfaceLift,
    borderRadius: radius.md,
    paddingVertical: space.md,
    alignItems: 'center',
  },
  pressed: { opacity: 0.7 },
  primaryText: { ...type.body, color: app.text, fontWeight: '600' },
});
