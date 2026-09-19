/**
 * The warning before she leaves the app. Lane A owns this file.
 *
 * Everything else here keeps her data on the device. These two actions can't:
 * a phone call lands in her recent calls, and a link lands in her browser
 * history, and once it's there this app cannot clean it up. So we tell her
 * before she taps, and we offer a way to get what she needs without the trace —
 * read the number instead of dialling it.
 *
 * This is the detail that shows we thought past our own app's edge, and it is
 * worth saying out loud in the demo.
 *
 * Usage from any screen:
 *
 *   const confirmExit = useExitWarning();
 *   confirmExit({ kind: 'call', number: '1-800-799-7233' });
 *   confirmExit({ kind: 'external', url: 'https://...' });
 *
 * Never call Linking directly. That's the whole point of this component.
 */

import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { Linking, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { app, radius, space, type } from '../theme';
import type { PathAction } from '../data/types';

type ExitTarget = Extract<PathAction, { kind: 'call' } | { kind: 'external' }>;

const Ctx = createContext<((target: ExitTarget) => void) | null>(null);

export function ExitWarningProvider({ children }: { children: ReactNode }) {
  const [target, setTarget] = useState<ExitTarget | null>(null);
  const [revealed, setRevealed] = useState(false);

  const confirmExit = useCallback((next: ExitTarget) => {
    setRevealed(false);
    setTarget(next);
  }, []);

  function close() {
    setTarget(null);
    setRevealed(false);
  }

  async function proceed() {
    if (!target) return;
    const url = target.kind === 'call' ? `tel:${target.number}` : target.url;
    close();
    try {
      await Linking.openURL(url);
    } catch {
      // Nothing useful to say — a failed open leaves no trace, which is the
      // outcome she was being warned about anyway.
    }
  }

  const isCall = target?.kind === 'call';

  return (
    <Ctx.Provider value={confirmExit}>
      {children}

      <Modal visible={target !== null} transparent animationType="fade" onRequestClose={close}>
        <View style={styles.backdrop}>
          <View style={styles.sheet}>
            <Text style={styles.title}>
              {isCall ? 'This call will be visible' : 'This link will be visible'}
            </Text>

            <Text style={styles.body}>
              {isCall
                ? 'Opening your phone app will put this number in your recent calls. Anchor cannot remove it afterwards.'
                : 'Opening this page will put it in your browser history. Anchor cannot remove it afterwards.'}
            </Text>

            {isCall && revealed ? (
              <View style={styles.reveal}>
                <Text style={styles.revealLabel}>The number</Text>
                <Text selectable style={styles.revealValue}>
                  {target.number}
                </Text>
                <Text style={styles.revealHint}>
                  Write it down, or call from another phone.
                </Text>
              </View>
            ) : null}

            <View style={styles.actions}>
              {isCall && !revealed ? (
                <Pressable
                  onPress={() => setRevealed(true)}
                  style={({ pressed }) => [styles.button, pressed && styles.pressed]}
                >
                  <Text style={styles.buttonText}>Just show me the number</Text>
                </Pressable>
              ) : null}

              <Pressable
                onPress={proceed}
                style={({ pressed }) => [styles.button, styles.primary, pressed && styles.pressed]}
              >
                <Text style={[styles.buttonText, styles.primaryText]}>
                  {isCall ? 'Call anyway' : 'Open anyway'}
                </Text>
              </Pressable>

              <Pressable
                onPress={close}
                style={({ pressed }) => [styles.button, pressed && styles.pressed]}
              >
                <Text style={styles.buttonText}>Go back</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </Ctx.Provider>
  );
}

export function useExitWarning(): (target: ExitTarget) => void {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useExitWarning must be used inside ExitWarningProvider');
  return ctx;
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: space.md,
  },
  sheet: {
    backgroundColor: app.surface,
    borderRadius: radius.lg,
    padding: space.lg,
    gap: space.md,
  },
  title: { ...type.heading, color: app.text },
  body: { ...type.body, color: app.subtle },
  reveal: {
    backgroundColor: app.surfaceLift,
    borderRadius: radius.md,
    padding: space.md,
    gap: space.xs,
  },
  revealLabel: { ...type.label, color: app.subtle, textTransform: 'uppercase' },
  revealValue: { ...type.heading, color: app.accent },
  revealHint: { ...type.small, color: app.subtle },
  actions: { gap: space.sm },
  button: {
    backgroundColor: app.surfaceLift,
    borderRadius: radius.md,
    paddingVertical: space.md,
    alignItems: 'center',
  },
  pressed: { opacity: 0.7 },
  primary: { backgroundColor: app.accent },
  buttonText: { ...type.body, color: app.text, fontWeight: '600' },
  primaryText: { color: app.bg },
});
