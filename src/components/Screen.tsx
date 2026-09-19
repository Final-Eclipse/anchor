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
import { useNavigation, useNavigationState } from '@react-navigation/native';
import { app, radius, space, type } from '../theme';
import { usePanic } from '../state/VaultState';
import { isSecureStorage } from '../crypto/keyStore';
import { useAppData } from '../state/AppData';
import { unreadCount } from '../data/messages';

interface Props {
  title: string;
  /** Hide the inbox link on the inbox itself. */
  hideInbox?: boolean;
  /** Optional line under the title. */
  subtitle?: string;
  children: ReactNode;
  /** Set false if your screen manages its own scrolling, e.g. a FlatList. */
  scroll?: boolean;
}

export function Screen({ title, subtitle, children, scroll = true, hideInbox = false }: Props) {
  const { data } = useAppData();
  const unread = unreadCount(data);
  const showInbox = !hideInbox;
  const insets = useSafeAreaInsets();
  const panic = usePanic();
  const navigation = useNavigation();

  /**
   * Reactive, unlike navigation.canGoBack(), which is read once during render.
   * Screens stay mounted, so a screen that was pushed on top of something else
   * kept showing Back after it became the root again — and pressing it threw
   * "GO_BACK was not handled by any navigator".
   */
  const canGoBack = useNavigationState((state) => state.index > 0);

  const header = (
    <View style={styles.headerBlock}>
      {/* Two different exits. Back returns to the previous screen and keeps the
          vault open; Hide drops the key and returns to the decoy. Keep them
          visually distinct — confusing them under pressure is a real cost. */}
      <View style={styles.bar}>
        <View style={styles.barLeft}>
          {canGoBack ? (
            <Pressable
              onPress={() => {
                // Belt and braces: never dispatch GO_BACK with nothing beneath.
                if (navigation.canGoBack()) navigation.goBack();
              }}
              hitSlop={12}
            >
              <Text style={styles.back}>‹ Back</Text>
            </Pressable>
          ) : null}

          {/* The inbox lives here because the app sends no notifications — this
              badge is the only way she ever learns there's something to read. */}
          {showInbox ? (
            <Pressable
              onPress={() => navigation.navigate('Inbox' as never)}
              hitSlop={12}
              accessibilityLabel={unread > 0 ? `Messages, ${unread} unread` : 'Messages'}
              style={styles.inbox}
            >
              <Text style={styles.inboxText}>Messages</Text>
              {unread > 0 ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{unread}</Text>
                </View>
              ) : null}
            </Pressable>
          ) : null}
        </View>
        {/* Sized to be hit in a hurry without looking. The generous hitSlop
            matters more than the visible box — she may be reaching for this
            because someone just walked in. */}
        <Pressable
          onPress={panic}
          hitSlop={{ top: 16, bottom: 16, left: 24, right: 24 }}
          accessibilityLabel="Hide this app"
          style={({ pressed }) => [styles.panic, pressed && styles.panicPressed]}
        >
          <Text style={styles.panicText}>Hide</Text>
        </Pressable>
      </View>

      <View>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
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
  headerBlock: { gap: space.md },
  bar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  barLeft: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  inbox: { flexDirection: 'row', alignItems: 'center', gap: space.xs },
  inboxText: { ...type.small, color: app.subtle, fontWeight: '600' },
  badge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 5,
    backgroundColor: app.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { color: app.bg, fontSize: 11, fontWeight: '700' },
  back: { ...type.body, color: app.accent },
  title: { ...type.title, color: app.text },
  subtitle: { ...type.body, color: app.subtle, marginTop: space.xs },
  panic: {
    backgroundColor: app.surfaceLift,
    borderRadius: radius.md,
    paddingVertical: space.md,
    paddingHorizontal: space.lg,
    borderWidth: 1,
    borderColor: app.line,
  },
  panicPressed: { opacity: 0.6, backgroundColor: app.line },
  panicText: { color: app.text, ...type.body, fontWeight: '700' },
  insecure: {
    ...type.small,
    color: app.gold,
    backgroundColor: app.surface,
    borderRadius: radius.sm,
    padding: space.sm,
  },
});
