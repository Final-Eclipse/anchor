/**
 * Accepting help without it leaving a trail.
 *
 * This is what a peer-to-peer payment feature became after we looked at it
 * properly. Transfers would have needed a server, accounts and a user directory,
 * and a directory of survivors is the worst thing this app could ship. The need
 * underneath was real though — people want to help her and she needs a way to
 * receive it — so it's served as knowledge instead of infrastructure.
 *
 * The trace labels are the whole point. She can see at a glance which ways of
 * receiving money are invisible and which show up somewhere he can read.
 */

import { StyleSheet, Text, View } from 'react-native';
import { Screen } from '../components/Screen';
import { app, radius, space, type } from '../theme';
import { RECEIVING, ASKING, type HelpMethod } from '../data/trustedHelp';

const TRACE_LABEL: Record<HelpMethod['trace'], string> = {
  none: 'Leaves no record',
  low: 'Leaves little',
  high: 'He can see this',
};

function Method({ method }: { method: HelpMethod }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHead}>
        <Text style={styles.cardTitle}>{method.title}</Text>
        <View style={[styles.pill, styles[method.trace]]}>
          <Text style={[styles.pillText, method.trace === 'high' && styles.pillTextHigh]}>
            {TRACE_LABEL[method.trace]}
          </Text>
        </View>
      </View>
      <Text style={styles.cardBody}>{method.body}</Text>
    </View>
  );
}

export default function TrustedHelp() {
  return (
    <Screen title="Help from someone you trust" subtitle="Which ways leave a record, and which don't.">
      <Text style={styles.intro}>
        People will want to help. How they send it matters more than how much — the fastest
        option on their phone is usually the most visible one on yours.
      </Text>

      <Text style={styles.sectionLabel}>WAYS TO RECEIVE IT</Text>
      {RECEIVING.map((m) => (
        <Method key={m.title} method={m} />
      ))}

      <Text style={styles.sectionLabel}>ASKING</Text>
      {ASKING.map((m) => (
        <Method key={m.title} method={m} />
      ))}

      <Text style={styles.footnote}>
        Anchor never moves money and never holds any. It has no account and no connection to a
        bank — that is what keeps it invisible. This is information about how to use the ways
        that already exist.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: { ...type.body, color: app.subtle },
  sectionLabel: { ...type.label, color: app.accent, marginTop: space.sm },
  card: {
    backgroundColor: app.surface,
    borderRadius: radius.md,
    padding: space.md,
    gap: space.xs,
  },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  cardTitle: { ...type.body, color: app.text, fontWeight: '600', flex: 1 },
  pill: { borderRadius: 999, paddingHorizontal: space.sm, paddingVertical: 3 },
  none: { backgroundColor: app.surfaceLift },
  low: { backgroundColor: app.surfaceLift },
  high: { backgroundColor: app.danger },
  pillText: { ...type.small, fontSize: 11, color: app.subtle, fontWeight: '600' },
  pillTextHigh: { color: app.bg },
  cardBody: { ...type.small, color: app.subtle },
  footnote: { ...type.small, color: app.subtle, marginTop: space.sm },
});
