/**
 * Lock state for the whole app. Lane A owns this file.
 *
 * Security invariant #3 lives here: the AppState listener drops the key and
 * returns to the decoy the instant the app leaves the foreground, so the
 * multitasking preview never shows real content. Don't remove it.
 *
 * Screens use `usePanic()` for their panic button and `useVault()` if they need
 * to know whether the vault is open.
 */

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { AppState } from 'react-native';
import { isVaultSetUp, setupVault, unlockVault, lockVault } from '../crypto/vault';

interface VaultState {
  /** null while we're still checking the device. */
  hasVault: boolean | null;
  unlocked: boolean;
  /** Returns false on the wrong PIN. */
  open: (pin: string) => Promise<boolean>;
  create: (pin: string) => Promise<void>;
  /** Drops the key and returns to the decoy. Safe to call from anywhere. */
  panic: () => void;
}

const Ctx = createContext<VaultState | null>(null);

export function VaultProvider({ children }: { children: ReactNode }) {
  const [hasVault, setHasVault] = useState<boolean | null>(null);
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    // If the check fails we treat it as "no vault" rather than leaving hasVault
    // null forever — that state silently shows the wrong prompt and strands her
    // on a screen with no way forward.
    isVaultSetUp().then(setHasVault, () => setHasVault(false));
  }, []);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (next) => {
      if (next !== 'active') {
        lockVault();
        setUnlocked(false);
      }
    });
    return () => sub.remove();
  }, []);

  const value: VaultState = {
    hasVault,
    unlocked,
    async open(pin) {
      const ok = await unlockVault(pin);
      setUnlocked(ok);
      return ok;
    },
    async create(pin) {
      await setupVault(pin);
      setHasVault(true);
      setUnlocked(true);
    },
    panic() {
      lockVault();
      setUnlocked(false);
    },
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useVault(): VaultState {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useVault must be used inside VaultProvider');
  return ctx;
}

/** Shorthand for panic buttons. */
export function usePanic(): () => void {
  return useVault().panic;
}
