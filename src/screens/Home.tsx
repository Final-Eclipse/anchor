/**
 * Where she lands after unlocking. Lane A owns this file.
 *
 * TODO (Lane A): once the assessment exists, this should lead with her path
 * rather than a menu — the next step she should take, not a list of features.
 * The menu is scaffolding so the other lanes have somewhere to link from.
 */

import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Screen } from '../components/Screen';
import { app, radius, space, type } from '../theme';
import type { AppStackParamList, ScreenProps } from '../navigation/types';

const DESTINATIONS: Array<{
  route: keyof AppStackParamList;
  label: string;
  hint: string;
}> = [
  { route: 'Assessment', label: 'Where things stand', hint: 'A few private questions' },
  { route: 'Path', label: 'Your plan', hint: 'Steps built for your situation' },
  { route: 'Directory', label: 'Find help nearby', hint: 'Hotlines, legal aid, grants' },
  { route: 'Fund', label: 'Set aside', hint: 'Amounts and dates only' },
  { route: 'Vault', label: 'Documents', hint: 'Encrypted on this phone' },
  { route: 'AccountGuide', label: 'An account of your own', hint: 'How to open one that stays yours' },
  { route: 'SetupCheck', label: 'Setup check', hint: 'Dev only — remove before judging' },
];

export default function Home({ navigation }: ScreenProps<'Home'>) {
  return (
    <Screen title="Anchor" subtitle="Nothing here leaves this phone.">
      <View style={styles.list}>
        {DESTINATIONS.map((d) => (
          <Pressable
            key={d.route}
            onPress={() => navigation.navigate(d.route as never)}
            style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
          >
            <View style={styles.rowText}>
              <Text style={styles.label}>{d.label}</Text>
              <Text style={styles.hint}>{d.hint}</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { gap: space.sm },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: app.surface,
    borderRadius: radius.md,
    padding: space.md,
    gap: space.md,
  },
  rowPressed: { backgroundColor: app.surfaceLift },
  rowText: { flex: 1 },
  label: { ...type.body, color: app.text, fontWeight: '600' },
  hint: { ...type.small, color: app.subtle, marginTop: 2 },
  chevron: { ...type.heading, color: app.subtle },
});
