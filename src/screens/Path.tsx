/**
 * ─── LANE B1 ─────────────────────────────────────────────────────────────────
 * Her plan. Delete this placeholder and build it.
 *
 * What it does:
 *   1. Take a pathId (from route params, or the stored assessment result) and
 *      look it up in PATHS (src/data/paths.ts).
 *   2. Show path.premise, then path.steps as a checklist she can tick off.
 *   3. Hide any step whose `requires` isn't in her modifiers — that's how the
 *      children overlay works. One flag, applied to all three paths.
 *   4. Tapping a step follows step.action:
 *        screen    -> navigation.navigate(action.screen)
 *        directory -> navigation.navigate('Directory', { filter: action.filter })
 *        call      -> confirmExit({ kind: 'call', number: action.number })
 *        external  -> confirmExit({ kind: 'external', url: action.url })
 *
 *      via `const confirmExit = useExitWarning()`. Never call Linking directly.
 *
 * The interstitial is not optional. A call lands in her recent calls and a link
 * lands in browser history, and the app can warn her but can't clean up after
 * her. Warning her first is the single most convincing detail in this project —
 * it proves we thought past our own app's edge.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { StyleSheet, Text } from 'react-native';
import { Screen } from '../components/Screen';
import { app, space, type } from '../theme';
import { PATHS } from '../data/paths';
import { useAppData } from '../state/AppData';
import type { ScreenProps } from '../navigation/types';

export default function Path({ route }: ScreenProps<'Path'>) {
  const { data } = useAppData();
  // Route param wins (she just finished the intake); otherwise fall back to the
  // saved result, so returning to this screen later still shows her plan.
  const pathId = route.params?.pathId ?? data.assessment?.pathId ?? 'no-money-of-her-own';
  const path = PATHS[pathId];

  return (
    <Screen title={path.title} subtitle={path.premise}>
      <Text style={styles.todo}>
        Lane B1 builds this. {path.steps.length} steps are written for this path in
        src/data/paths.ts — read the comment at the top of this file for how to render
        and link them.
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
