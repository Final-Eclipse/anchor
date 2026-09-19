/**
 * One organisation, rendered the same way everywhere it appears.
 *
 * She sees the same organisations in two places — the directory, and the
 * matched list at the end of her plan. They have to look identical, or the
 * second one reads as a different, less trustworthy list. That is the only
 * reason this is a component rather than markup in each screen.
 *
 * Every phone number and link goes through the exit interstitial. A call lands
 * in her recent calls and a link lands in browser history, and this app cannot
 * remove either afterwards — so it warns her first and offers to show the
 * number instead of dialling it. Never call Linking from here.
 */

import { Pressable, StyleSheet, Text, View } from 'react-native';
import { app, radius, space, type } from '../theme';
import { useExitWarning } from './ExitWarning';
import type { Resource } from '../data/types';

const AREA_LABEL: Record<Resource['area'], string> = {
  'downtown-atlanta': 'Downtown Atlanta',
  'metro-atlanta': 'Metro Atlanta',
  georgia: 'Georgia',
  national: 'National',
};

export function ResourceCard({ resource }: { resource: Resource }) {
  const confirmExit = useExitWarning();
  const { name, area, description, note, phone, url, verified } = resource;

  return (
    <View style={styles.card}>
      <View style={styles.cardHead}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.area}>{AREA_LABEL[area]}</Text>
      </View>

      <Text style={styles.description}>{description}</Text>
      {note ? <Text style={styles.note}>{note}</Text> : null}

      <View style={styles.actions}>
        {phone ? (
          <Pressable
            onPress={() => confirmExit({ kind: 'call', number: phone })}
            style={({ pressed }) => [styles.action, pressed && styles.pressed]}
          >
            <Text style={styles.actionText}>Call</Text>
          </Pressable>
        ) : null}
        {url ? (
          <Pressable
            onPress={() => confirmExit({ kind: 'external', url })}
            style={({ pressed }) => [styles.action, pressed && styles.pressed]}
          >
            <Text style={styles.actionText}>Website</Text>
          </Pressable>
        ) : null}
      </View>

      {verified ? null : (
        <Text style={styles.unverified}>
          Contact details not confirmed yet — Lane C is verifying these.
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: app.surface,
    borderRadius: radius.md,
    padding: space.md,
    gap: space.xs,
  },
  cardHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  name: { ...type.body, color: app.text, fontWeight: '600', flex: 1 },
  area: { ...type.label, color: app.subtle },
  description: { ...type.small, color: app.subtle, marginTop: 2 },
  note: { ...type.small, color: app.accent },
  actions: { flexDirection: 'row', gap: space.sm, marginTop: space.sm },
  action: {
    backgroundColor: app.surfaceLift,
    borderRadius: radius.sm,
    paddingVertical: space.sm,
    paddingHorizontal: space.lg,
  },
  pressed: { opacity: 0.7 },
  actionText: { ...type.small, color: app.text, fontWeight: '600' },
  unverified: { ...type.small, color: app.gold, marginTop: space.sm },
});
