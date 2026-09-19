/**
 * The safety fund.
 *
 * FundEntry carries an amount and a date and nothing else. That is deliberate:
 * if someone reads this screen over her shoulder it shows numbers, and nothing
 * that explains what they are for. Don't add a label, note or category field,
 * however natural it feels — the absence is the security property.
 *
 * Same reason in the copy. It is "set aside", never "escape fund". The screen
 * should be boring to a stranger.
 *
 * Amounts are integer cents throughout. Floating point money is a bug you find
 * at 2am the night before judging.
 */

import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Screen } from '../components/Screen';
import { app, radius, space, type } from '../theme';
import { useAppData } from '../state/AppData';

function money(cents: number): string {
  return `$${(cents / 100).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/** Accepts "40", "40.50", "$40" — anything unparseable returns null. */
function parseAmount(input: string): number | null {
  const cleaned = input.replace(/[^0-9.]/g, '');
  if (!cleaned) return null;
  const value = Number.parseFloat(cleaned);
  if (!Number.isFinite(value) || value <= 0) return null;
  return Math.round(value * 100);
}

export default function Fund() {
  const { data, update } = useAppData();
  const [amount, setAmount] = useState('');
  const [goalInput, setGoalInput] = useState('');
  const [editingGoal, setEditingGoal] = useState(false);

  const { goalCents, entries } = data.fund;
  const savedCents = entries.reduce((sum, e) => sum + e.amountCents, 0);
  const progress = goalCents > 0 ? Math.min(1, savedCents / goalCents) : 0;

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

  async function saveGoal() {
    const cents = parseAmount(goalInput);
    setEditingGoal(false);
    setGoalInput('');
    if (cents === null) return;
    await update((d) => ({ fund: { ...d.fund, goalCents: cents } }));
  }

  async function remove(id: string) {
    await update((d) => ({
      fund: { ...d.fund, entries: d.fund.entries.filter((e) => e.id !== id) },
    }));
  }

  return (
    <Screen title="Set aside" subtitle="Amounts and dates. Nothing else.">
      <View style={styles.total}>
        <Text style={styles.totalValue}>{money(savedCents)}</Text>
        {goalCents > 0 ? (
          <>
            <Text style={styles.totalGoal}>of {money(goalCents)}</Text>
            <View style={styles.track}>
              <View style={[styles.fill, { width: `${progress * 100}%` }]} />
            </View>
          </>
        ) : null}

        {editingGoal ? (
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={goalInput}
              onChangeText={setGoalInput}
              placeholder="Target amount"
              placeholderTextColor={app.subtle}
              keyboardType="decimal-pad"
              autoFocus
              onSubmitEditing={saveGoal}
            />
            <Pressable onPress={saveGoal} style={styles.inputButton}>
              <Text style={styles.inputButtonText}>Save</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable onPress={() => setEditingGoal(true)} style={styles.goalLink}>
            <Text style={styles.goalLinkText}>
              {goalCents > 0 ? 'Change the target' : 'Set a target'}
            </Text>
          </Pressable>
        )}
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
