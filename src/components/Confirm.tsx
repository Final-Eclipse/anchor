/**
 * Confirmation dialogs that work everywhere. Lane A owns this file.
 *
 * React Native's Alert is not implemented in react-native-web, so on the browser
 * build every Alert.alert call silently does nothing — the dialog never appears
 * and the confirm handler never runs. Destructive actions looked like they were
 * failing when in fact they were never being asked about.
 *
 * Since most of the team builds in a browser, anything using Alert would appear
 * broken to them. Use this instead:
 *
 *   const confirm = useConfirm();
 *   const yes = await confirm({
 *     title: 'Remove this document?',
 *     body: 'It will be deleted from this phone. This cannot be undone.',
 *     confirmLabel: 'Remove',
 *     destructive: true,
 *   });
 *   if (yes) { ... }
 */

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { app, radius, space, type } from '../theme';

interface ConfirmOptions {
  title: string;
  body?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
}

const Ctx = createContext<((options: ConfirmOptions) => Promise<boolean>) | null>(null);

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const resolver = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback((next: ConfirmOptions) => {
    setOptions(next);
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve;
    });
  }, []);

  function settle(answer: boolean) {
    setOptions(null);
    resolver.current?.(answer);
    resolver.current = null;
  }

  return (
    <Ctx.Provider value={confirm}>
      {children}

      <Modal
        visible={options !== null}
        transparent
        animationType="fade"
        onRequestClose={() => settle(false)}
      >
        <View style={styles.backdrop}>
          <View style={styles.sheet}>
            <Text style={styles.title}>{options?.title}</Text>
            {options?.body ? <Text style={styles.body}>{options.body}</Text> : null}

            <View style={styles.actions}>
              <Pressable
                onPress={() => settle(true)}
                style={({ pressed }) => [
                  styles.button,
                  options?.destructive ? styles.destructive : styles.primary,
                  pressed && styles.pressed,
                ]}
              >
                <Text
                  style={[
                    styles.buttonText,
                    options?.destructive ? styles.destructiveText : styles.primaryText,
                  ]}
                >
                  {options?.confirmLabel ?? 'Confirm'}
                </Text>
              </Pressable>

              <Pressable
                onPress={() => settle(false)}
                style={({ pressed }) => [styles.button, pressed && styles.pressed]}
              >
                <Text style={styles.buttonText}>{options?.cancelLabel ?? 'Cancel'}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </Ctx.Provider>
  );
}

export function useConfirm(): (options: ConfirmOptions) => Promise<boolean> {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useConfirm must be used inside ConfirmProvider');
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
  actions: { gap: space.sm },
  button: {
    backgroundColor: app.surfaceLift,
    borderRadius: radius.md,
    paddingVertical: space.md,
    alignItems: 'center',
  },
  pressed: { opacity: 0.7 },
  primary: { backgroundColor: app.accent },
  destructive: { backgroundColor: app.danger },
  buttonText: { ...type.body, color: app.text, fontWeight: '600' },
  primaryText: { color: app.bg },
  destructiveText: { color: app.bg },
});
