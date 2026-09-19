/**
 * ─── LANE B2 ─────────────────────────────────────────────────────────────────
 * The safety fund. Delete this placeholder and build it.
 *
 * What it does:
 *   1. A goal amount she can set.
 *   2. A list of amounts she's put aside, with dates.
 *   3. Progress toward the goal.
 *
 * Read FundEntry in src/data/types.ts before you start. It has amountCents and
 * a timestamp and nothing else — no label, no note, no category. That is a
 * deliberate design decision, not an oversight: if someone reads this screen
 * over her shoulder it shows numbers and dates and nothing that explains what
 * they are for. Don't add a description field, however natural it feels.
 *
 * Same reason, in the copy: call it "set aside", never "escape fund" or
 * "leaving". The screen should be boring to a stranger.
 *
 * Store amounts as integer cents. Floating point money is a bug you'll find at
 * 2am the night before judging.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { StyleSheet, Text } from 'react-native';
import { Screen } from '../components/Screen';
import { app, space, type } from '../theme';

export default function Fund() {
  return (
    <Screen title="Set aside" subtitle="Amounts and dates. Nothing else.">
      <Text style={styles.todo}>
        Lane B2 builds this. Read FundEntry in src/data/types.ts and the comment at the
        top of this file first — the missing label field is on purpose.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  todo: {
    ...type.body,
    color: app.subtle,
    backgroundColor: app.surface,
    padding: space.md,
    borderRadius: 10,
  },
});
