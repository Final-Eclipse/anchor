/**
 * Wrapper every real screen should use. Lane A owns this file.
 *
 * Wrap your screen in it and you get the panic button for free — that's the
 * point. Security invariant: panic has to be on *every* screen, and the way to
 * guarantee that is to make it impossible to forget.
 *
 *   export default function Fund() {
 *     return (
 *       <Screen title="Set aside">
 *         ...your content...
 *       </Screen>
 *     );
 *   }
 */

import type { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { app, radius, space, type } from '../theme';
import { usePanic } from '../state/VaultState';
import { isSecureStorage } from '../crypto/keyStore';

interface Props {
  title: string;
  /** Optional line under the title. */
  subtitle?: string;
  children: ReactNode;
  /** Set false if your screen manages its own scrolling, e.g. a FlatList. */
  scroll?: boolean;
}

export function Screen({ title, subtitle, children, scroll = true }: Props) {
  const insets = useSafeAreaInsets();
  const panic = usePanic();

  const header = (
    <View style={styles.header}>
      <View style={styles.headerText}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      <Pressable
        onPress={panic}
        hitSlop={12}
        accessibilityLabel="Close"
        style={({ pressed }) => [styles.panic, pressed && styles.panicPressed]}
      >
        <Text style={styles.panicText}>Close</Text>
      </Pressable>
    </View>
  );

  const body = (
    <>
      {header}
      {isSecureStorage ? null : (
        <Text style={styles.insecure}>
          Running in a browser — storage here is not secure. Build screens this way, but
          never demo or test real data from it.
        </Text>
      )}
      {children}
    </>
  );

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {scroll ? (
        <ScrollView contentContainerStyle={styles.scroll}>{body}</ScrollView>
      ) : (
        <View style={styles.scroll}>{body}</View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: app.bg },
  scroll: { padding: space.md, paddingBottom: space.xl, gap: space.md, flexGrow: 1 },
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: space.md },
  headerText: { flex: 1 },
  title: { ...type.title, color: app.text },
  subtitle: { ...type.body, color: app.subtle, marginTop: space.xs },
  panic: {
    backgroundColor: app.surfaceLift,
    borderRadius: radius.sm,
    paddingVertical: space.sm,
    paddingHorizontal: space.md,
    marginTop: space.xs,
  },
  panicPressed: { opacity: 0.6 },
  panicText: { color: app.subtle, ...type.small, fontWeight: '600' },
  insecure: {
    ...type.small,
    color: app.gold,
    backgroundColor: app.surface,
    borderRadius: radius.sm,
    padding: space.sm,
  },
});
