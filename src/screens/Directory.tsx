/**
 * ─── LANE B2 ─────────────────────────────────────────────────────────────────
 * The help directory. Delete this placeholder and build it.
 *
 * What it does:
 *   1. List RESOURCES (src/data/resources.ts).
 *   2. Filter buttons for the six categories: hotline, shelter, legal,
 *      emergency-cash, housing, job-training. A resource can be in several.
 *   3. If route.params.filter is set, open pre-filtered — that's how path steps
 *      link straight to "legal" or "emergency-cash".
 *   4. Each entry shows name, description, note, and how to reach them.
 *
 * Two things that are not negotiable:
 *   · Tapping a phone number or a link must go through the exit interstitial.
 *     It's built and waiting for you — never call Linking yourself:
 *
 *       const confirmExit = useExitWarning();
 *       confirmExit({ kind: 'call', number: resource.phone });
 *       confirmExit({ kind: 'external', url: resource.url });
 *
 *     It explains the trace, and offers to show the number instead of dialling.
 *   · Don't show unverified entries as if they were checked. Lane C is calling
 *     each organisation now; `verified` flips to true only after a human
 *     confirms someone answers. While you're building, showing everything is
 *     fine — just don't ship it that way.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { StyleSheet, Text } from 'react-native';
import { Screen } from '../components/Screen';
import { app, space, type } from '../theme';
import { RESOURCES } from '../data/resources';
import type { ScreenProps } from '../navigation/types';

export default function Directory({ route }: ScreenProps<'Directory'>) {
  const filter = route.params?.filter;

  return (
    <Screen title="Find help nearby" subtitle={filter ? `Filtered: ${filter}` : undefined}>
      <Text style={styles.todo}>
        Lane B2 builds this. {RESOURCES.length} organisations are in
        src/data/resources.ts — read the comment at the top of this file for what to do
        with them.
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
