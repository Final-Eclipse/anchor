/**
 * Her messages.
 *
 * This exists because the app sends no notifications. Everything a normal app
 * would push to a lock screen — where a partner reading over her shoulder sees
 * it first — waits here instead, behind her code.
 *
 * Nothing here arrives from outside. Every message is written on this phone from
 * what she has already done, which is why an inbox is safe to have at all.
 */

import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Screen } from '../components/Screen';
import { app, radius, space, type } from '../theme';
import { useAppData } from '../state/AppData';
import { useExitWarning } from '../components/ExitWarning';
import type { InboxMessage } from '../data/types';
import type { ScreenProps } from '../navigation/types';

function when(at: number): string {
  const days = Math.floor((Date.now() - at) / (24 * 60 * 60 * 1000));
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  return `${days} days ago`;
}

export default function Inbox({ navigation }: ScreenProps<'Inbox'>) {
  const { data, update } = useAppData();
  const confirmExit = useExitWarning();
  const messages = [...(data.inbox ?? [])].reverse();

  async function open(message: InboxMessage) {
    if (!message.read) {
      await update((d) => ({
        inbox: (d.inbox ?? []).map((m) => (m.id === message.id ? { ...m, read: true } : m)),
      }));
    }

    const action = message.action;
    if (!action) return;
    switch (action.kind) {
      case 'screen':
        navigation.navigate(action.screen);
        break;
      case 'directory':
        navigation.navigate('Directory', { filter: action.filter });
        break;
      case 'call':
      case 'external':
        confirmExit(action);
        break;
    }
  }

  async function markAllRead() {
    await update((d) => ({ inbox: (d.inbox ?? []).map((m) => ({ ...m, read: true })) }));
  }

  const unread = messages.filter((m) => !m.read).length;

  return (
    <Screen title="Messages" subtitle="Written on this phone. Never sent anywhere." hideInbox>
      {unread > 0 ? (
        <Pressable onPress={markAllRead} style={styles.markAll}>
          <Text style={styles.markAllText}>Mark all as read</Text>
        </Pressable>
      ) : null}

      {messages.length === 0 ? (
        <Text style={styles.empty}>
          Nothing yet. Anchor will leave notes here as you go — it never sends notifications,
          so this is the only place it can say anything.
        </Text>
      ) : (
        messages.map((message) => (
          <Pressable
            key={message.id}
            onPress={() => open(message)}
            style={({ pressed }) => [
              styles.card,
              !message.read && styles.cardUnread,
              pressed && styles.pressed,
            ]}
          >
            <View style={styles.head}>
              {!message.read ? <View style={styles.dot} /> : null}
              <Text style={[styles.title, !message.read && styles.titleUnread]}>
                {message.title}
              </Text>
              <Text style={styles.when}>{when(message.at)}</Text>
            </View>
            <Text style={styles.body}>{message.body}</Text>
            {message.action ? <Text style={styles.go}>Open ›</Text> : null}
          </Pressable>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  markAll: { alignSelf: 'flex-end' },
  markAllText: { ...type.small, color: app.subtle },
  empty: { ...type.body, color: app.subtle },
  card: {
    backgroundColor: app.surface,
    borderRadius: radius.md,
    padding: space.md,
    gap: space.xs,
    borderWidth: 1,
    borderColor: app.surface,
  },
  cardUnread: { borderColor: app.accent },
  pressed: { opacity: 0.8 },
  head: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: app.accent },
  title: { ...type.body, color: app.subtle, flex: 1 },
  titleUnread: { color: app.text, fontWeight: '700' },
  when: { ...type.small, color: app.subtle, fontSize: 11 },
  body: { ...type.small, color: app.subtle, marginTop: 2 },
  go: { ...type.small, color: app.accent, fontWeight: '600', marginTop: space.sm },
});
