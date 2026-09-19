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
import {
  isVaultSetUp,
  setupVault,
  unlockVault,
  lockVault,
  destroyVault,
  enableRecovery,
  unlockWithRecovery,
  setNewPin,
  hasRecovery,
  type UnlockResult,
} from '../crypto/vault';

interface VaultState {
  /** null while we're still checking the device. */
  hasVault: boolean | null;
  unlocked: boolean;
  /** Says why it failed, so the screen can explain a wait rather than just "no". */
  open: (pin: string) => Promise<UnlockResult>;
  create: (pin: string) => Promise<void>;
  /** Drops the key and returns to the decoy. Safe to call from anywhere. */
  panic: () => void;
  /**
   * Deletes the code and locks. Anything encrypted under it becomes permanently
   * unreadable, so callers confirm first.
   *
   * Must go through here rather than calling destroyVault() directly — this is
   * what tells the app the vault is gone. Skipping it leaves the UI asking for a
   * code that no longer exists, which reads to the user as "wrong code".
   */
  destroy: () => Promise<void>;
  /** Attaches a recovery code to an unlocked vault. */
  attachRecovery: (code: string) => Promise<void>;
  /** Opens with the recovery code. She should set a new PIN straight after. */
  recoverWith: (code: string) => Promise<boolean>;
  /** Replaces the PIN on an unlocked vault, keeping the recovery code valid. */
  replacePin: (pin: string) => Promise<void>;
  /** Whether a recovery code was ever set up. */
  recoveryAvailable: boolean;
  /** True from creating the vault until the recovery offer is answered. */
  justCreated: boolean;
  dismissRecoveryOffer: () => void;
  /**
   * True after a recovery unlock, until she sets a new PIN. The vault is open but
   * the only PIN that works is the one she just told us she doesn't have, so the
   * app must not let her past this.
   */
  needsNewPin: boolean;
}

const Ctx = createContext<VaultState | null>(null);

export function VaultProvider({ children }: { children: ReactNode }) {
  const [hasVault, setHasVault] = useState<boolean | null>(null);
  const [unlocked, setUnlocked] = useState(false);
  const [recoveryAvailable, setRecoveryAvailable] = useState(false);
  const [justCreated, setJustCreated] = useState(false);
  const [needsNewPin, setNeedsNewPin] = useState(false);

  useEffect(() => {
    // If the check fails we treat it as "no vault" rather than leaving hasVault
    // null forever — that state silently shows the wrong prompt and strands her
    // on a screen with no way forward.
    isVaultSetUp().then(setHasVault, () => setHasVault(false));
    hasRecovery().then(setRecoveryAvailable, () => setRecoveryAvailable(false));
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
      const result = await unlockVault(pin);
      setUnlocked(result.ok);
      return result;
    },
    async create(pin) {
      await setupVault(pin);
      setHasVault(true);
      setUnlocked(true);
      setJustCreated(true);
    },
    panic() {
      lockVault();
      setUnlocked(false);
    },
    async destroy() {
      await destroyVault();
      setHasVault(false);
      setUnlocked(false);
      setRecoveryAvailable(false);
      setJustCreated(false);
    },
    async attachRecovery(code) {
      await enableRecovery(code);
      setRecoveryAvailable(true);
    },
    async recoverWith(code) {
      const ok = await unlockWithRecovery(code);
      setUnlocked(ok);
      if (ok) setNeedsNewPin(true);
      return ok;
    },
    async replacePin(pin) {
      await setNewPin(pin);
      setNeedsNewPin(false);
    },
    recoveryAvailable,
    justCreated,
    dismissRecoveryOffer: () => setJustCreated(false),
    needsNewPin,
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
