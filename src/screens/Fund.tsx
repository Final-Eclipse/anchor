/**
 * The safety fund.
 *
 * The useful question is not "how much have you saved" — it's "how much do you
 * need, and where does it come from". Someone who has never controlled the money
 * often has no idea what leaving costs, and that number is the thing she cannot
 * get anywhere else. A tracker without it is a number in a box.
 *
 * So the screen has two halves: work out the target, then move toward it.
 *
 * FundEntry carries an amount and a date and nothing else. That is deliberate —
 * if someone reads this screen over her shoulder it shows numbers and nothing
 * that explains them. Don't add a label field, however natural it feels. Same
 * reason the copy says "set aside" and never "escape fund".
 *
 * Amounts are integer cents throughout. Floating point money is a bug you find
 * at 2am the night before judging.
 */

import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Screen } from '../components/Screen';
import { app, radius, space, type } from '../theme';
import { NEEDS } from '../data/needs';
import { useAppData } from '../state/AppData';
import type { ScreenProps } from '../navigation/types';

function money(cents: number): string {
  return `$${(cents / 100).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

/** Accepts "40", "40.50", "$1,200" — anything unparseable returns null. */
function parseAmount(input: string): number | null {
  const cleaned = input.replace(/[^0-9.]/g, '');
  if (!cleaned) return null;
  const value = Number.parseFloat(cleaned);
  if (!Number.isFinite(value) || value <= 0) return null;
  return Math.round(value * 100);
}

export default function Fund({ navigation }: ScreenProps<'Fund'>) {
  const { data, update } = useAppData();
  const [amount, setAmount] = useState('');
  const [planning, setPlanning] = useState(false);
  const [drafts, setDrafts] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      Object.entries(data.fund.needs ?? {}).map(([id, cents]) => [id, String(cents / 100)])
    )
  );

  const needs = data.fund.needs ?? {};
  const hasChildren = data.assessment?.modifiers.includes('children') ?? false;
  const visibleNeeds = NEEDS.filter((n) => !n.requiresChildren || hasChildren);

  const target = Object.values(needs).reduce((sum, cents) => sum + cents, 0);
  const saved = data.fund.entries.reduce((sum, e) => sum + e.amountCents, 0);
  const progress = target > 0 ? Math.min(1, saved / target) : 0;

  // Rough pace from what she's actually put aside, not a projection she'd have
  // to trust. Needs a couple of entries before it means anything.
  const entries = data.fund.entries;
  const perMonth =
    entries.length >= 2
      ? (saved / Math.max(1, (Date.now() - entries[0].at) / (30 * 24 * 60 * 60 * 1000)))
      : 0;
  const monthsLeft = perMonth > 0 && target > saved ? Math.ceil((target - saved) / perMonth) : 0;

  /**
   * Saves as she types rather than on blur. onEndEditing fires inconsistently on
   * web, which silently dropped everything she'd entered — and the writes are
   * cheap because the encryption is native.
   */
  async function setNeed(id: string, text: string) {
    setDrafts((d) => ({ ...d, [id]: text }));
    const cents = parseAmount(text);
    await update((d) => {
      const nextNeeds = { ...(d.fund.needs ?? {}) };
      if (cents === null) delete nextNeeds[id];
      else nextNeeds[id] = cents;
      const nextTarget = Object.values(nextNeeds).reduce((s, c) => s + c, 0);
      return { fund: { ...d.fund, needs: nextNeeds, goalCents: nextTarget } };
    });
  }

  async function add() {
    const cents = parseAmount(amount);
    if (cents === null) return;
    setAmount('');
    await update((d) => ({
      fund: {
        ...d.fund,
        entries: [
          ...d.fund.entries,
          { id: `${Date.now()}-${d.fund.entries.length}`, amountCents: cents, at: Date.now() },
        ],
      },
    }));
  }

  async function remove(id: string) {
    await update((d) => ({
      fund: { ...d.fund, entries: d.fund.entries.filter((e) => e.id !== id) },
    }));
  }

  // ── Planner ───────────────────────────────────────────────────────────────
  if (planning || target === 0) {
    return (
      <Screen title="What you'll need" subtitle="Fill in what you know. Leave the rest blank.">
        <Text style={styles.intro}>
          Most people have never had to price this out. Put in what you can find out — a rough
          number is far better than no number, and you can change it any time.
        </Text>

        {visibleNeeds.map((need) => (
          <View key={need.id} style={styles.needRow}>
            <View style={styles.needText}>
              <Text style={styles.needLabel}>{need.label}</Text>
              <Text style={styles.needHint}>{need.hint}</Text>
            </View>
            <TextInput
              style={styles.needInput}
              value={drafts[need.id] ?? ''}
              onChangeText={(text) => setNeed(need.id, text)}
              placeholder="$"
              placeholderTextColor={app.subtle}
              keyboardType="decimal-pad"
              returnKeyType="done"
            />
          </View>
        ))}

        <View style={styles.targetBox}>
          <Text style={styles.targetLabel}>WHAT LEAVING COSTS</Text>
          <Text style={styles.targetValue}>{target > 0 ? money(target) : '—'}</Text>
          <Text style={styles.targetHint}>
            {target > 0
              ? 'This is your number. It does not have to happen at once.'
              : 'Fill in anything above to see your number.'}
          </Text>
        </View>

        {target > 0 ? (
          <Pressable
            onPress={() => setPlanning(false)}
            style={({ pressed }) => [styles.primary, pressed && styles.pressed]}
          >
            <Text style={styles.primaryText}>Start setting aside</Text>
          </Pressable>
        ) : null}
      </Screen>
    );
  }

  // ── Tracker ───────────────────────────────────────────────────────────────
  return (
    <Screen title="Set aside" subtitle="Amounts and dates. Nothing else.">
      <View style={styles.total}>
        <Text style={styles.totalValue}>{money(saved)}</Text>
        <Text style={styles.totalGoal}>of {money(target)}</Text>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${progress * 100}%` }]} />
        </View>
        {monthsLeft > 0 ? (
          <Text style={styles.pace}>
            About {monthsLeft} {monthsLeft === 1 ? 'month' : 'months'} at this rate
          </Text>
        ) : null}
        <Pressable onPress={() => setPlanning(true)} style={styles.goalLink}>
          <Text style={styles.goalLinkText}>Change what you need</Text>
        </Pressable>
      </View>

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={amount}
          onChangeText={setAmount}
          placeholder="Amount"
          placeholderTextColor={app.subtle}
          keyboardType="decimal-pad"
          onSubmitEditing={add}
        />
        <Pressable
          onPress={add}
          style={({ pressed }) => [styles.inputButton, pressed && styles.pressed]}
        >
          <Text style={styles.inputButtonText}>Add</Text>
        </Pressable>
      </View>

      <Pressable
        onPress={() => navigation.navigate('TrustedHelp')}
        style={({ pressed }) => [styles.secondary, pressed && styles.pressed]}
      >
        <Text style={styles.secondaryText}>Where money can come from ›</Text>
      </Pressable>

      {entries.length === 0 ? (
        <Text style={styles.empty}>
          Nothing here yet. Small amounts add up faster than they feel like they will.
        </Text>
      ) : (
        [...entries].reverse().map((entry) => (
          <Pressable
            key={entry.id}
            onLongPress={() => remove(entry.id)}
            style={({ pressed }) => [styles.row, pressed && styles.pressed]}
          >
            <Text style={styles.rowAmount}>{money(entry.amountCents)}</Text>
            <Text style={styles.rowDate}>
              {new Date(entry.at).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
              })}
            </Text>
          </Pressable>
        ))
      )}

      {entries.length > 0 ? (
        <Text style={styles.hint}>Hold an amount to remove it.</Text>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: { ...type.body, color: app.subtle },

  needRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    backgroundColor: app.surface,
    borderRadius: radius.md,
    padding: space.md,
  },
  needText: { flex: 1 },
  needLabel: { ...type.body, color: app.text, fontWeight: '600' },
  needHint: { ...type.small, color: app.subtle, marginTop: 2 },
  needInput: {
    width: 92,
    backgroundColor: app.surfaceLift,
    borderRadius: radius.sm,
    paddingHorizontal: space.sm,
    paddingVertical: space.sm,
    color: app.text,
    textAlign: 'right',
    ...type.body,
  },

  targetBox: {
    backgroundColor: app.surface,
    borderWidth: 1,
    borderColor: app.accent,
    borderRadius: radius.lg,
    padding: space.lg,
    alignItems: 'center',
    gap: space.xs,
  },
  targetLabel: { ...type.label, color: app.accent },
  targetValue: { fontSize: 40, fontWeight: '300', color: app.text },
  targetHint: { ...type.small, color: app.subtle, textAlign: 'center' },

  total: {
    backgroundColor: app.surface,
    borderRadius: radius.lg,
    padding: space.lg,
    alignItems: 'center',
    gap: space.xs,
  },
  totalValue: { fontSize: 40, fontWeight: '300', color: app.accent },
  totalGoal: { ...type.small, color: app.subtle },
  track: {
    width: '100%',
    height: 6,
    borderRadius: 3,
    backgroundColor: app.surfaceLift,
    marginTop: space.sm,
    overflow: 'hidden',
  },
  fill: { height: '100%', backgroundColor: app.accent, borderRadius: 3 },
  pace: { ...type.small, color: app.subtle, marginTop: space.sm },
  goalLink: { marginTop: space.sm },
  goalLinkText: { ...type.small, color: app.subtle },

  inputRow: { flexDirection: 'row', gap: space.sm, width: '100%' },
  input: {
    flex: 1,
    backgroundColor: app.surfaceLift,
    borderRadius: radius.md,
    paddingHorizontal: space.md,
    paddingVertical: space.md,
    color: app.text,
    ...type.body,
  },
  inputButton: {
    backgroundColor: app.accent,
    borderRadius: radius.md,
    paddingHorizontal: space.lg,
    justifyContent: 'center',
  },
  inputButtonText: { ...type.body, color: app.bg, fontWeight: '700' },

  primary: {
    backgroundColor: app.accent,
    borderRadius: radius.md,
    paddingVertical: space.md,
    alignItems: 'center',
  },
  primaryText: { ...type.body, color: app.bg, fontWeight: '700' },
  secondary: {
    backgroundColor: app.surfaceLift,
    borderRadius: radius.md,
    paddingVertical: space.md,
    alignItems: 'center',
  },
  secondaryText: { ...type.body, color: app.text, fontWeight: '600' },
  pressed: { opacity: 0.7 },

  empty: { ...type.body, color: app.subtle },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: app.surface,
    borderRadius: radius.md,
    padding: space.md,
  },
  rowAmount: { ...type.body, color: app.text, fontWeight: '600' },
  rowDate: { ...type.small, color: app.subtle },
  hint: { ...type.small, color: app.subtle, textAlign: 'center' },
});
