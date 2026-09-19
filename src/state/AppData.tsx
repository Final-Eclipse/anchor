/**
 * Her saved data. Lane A owns this file; every other lane reads and writes
 * through the hook.
 *
 * Everything she enters lives in one encrypted blob — the assessment result, the
 * fund, the document list, which steps she's ticked off. It loads when she
 * unlocks and is dropped when she locks, so nothing readable outlives the
 * session in memory.
 *
 * How to use it from a screen:
 *
 *   const { data, update } = useAppData();
 *   await update({ assessment: result });          // merges and saves
 *   await update((d) => ({ fund: {...d.fund} }));  // when you need the old value
 *
 * Saving is automatic. Don't write to the filesystem directly from a screen.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { EMPTY_STATE, type AnchorState } from '../data/types';
import { decryptJson, encryptJson, isUnlocked } from '../crypto/vault';
import { readRecord, writeRecord } from '../crypto/recordStore';
import { useVault } from './VaultState';

type Updater = Partial<AnchorState> | ((current: AnchorState) => Partial<AnchorState>);

interface AppDataValue {
  /** EMPTY_STATE until the first load finishes. */
  data: AnchorState;
  loading: boolean;
  update: (changes: Updater) => Promise<void>;
}

const Ctx = createContext<AppDataValue | null>(null);

export function AppDataProvider({ children }: { children: ReactNode }) {
  const { unlocked } = useVault();
  const [data, setData] = useState<AnchorState>(EMPTY_STATE);
  const [loading, setLoading] = useState(false);
  /**
   * Mirrors `data` so update() can compute the next state without reading it out
   * of a setState updater — React makes no promise about when those run, and
   * two quick saves in a row would race and lose one.
   */
  const latest = useRef<AnchorState>(EMPTY_STATE);

  function commit(next: AnchorState) {
    latest.current = next;
    setData(next);
  }

  useEffect(() => {
    if (!unlocked) {
      commit(EMPTY_STATE);
      return;
    }

    let cancelled = false;
    setLoading(true);

    (async () => {
      try {
        const blob = await readRecord();
        // No blob means she has never saved anything, which is the normal first
        // run — not an error.
        const next = blob ? await decryptJson<AnchorState>(blob) : EMPTY_STATE;
        if (!cancelled) commit({ ...EMPTY_STATE, ...next });
      } catch {
        // A blob we can't decrypt means it was written under a different key.
        // Starting from empty is the only safe move; overwriting happens on her
        // next save, which is what she'd expect from an app that lost its data.
        if (!cancelled) commit(EMPTY_STATE);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [unlocked]);

  const update = useCallback(async (changes: Updater) => {
    // Locking mid-edit is normal — she hit Hide, or the app backgrounded. There
    // is no key to encrypt with any more, so drop the write rather than throw.
    if (!isUnlocked()) return;

    const current = latest.current;
    const patch = typeof changes === 'function' ? changes(current) : changes;
    const next = { ...current, ...patch };

    commit(next);
    await writeRecord(await encryptJson(next));
  }, []);

  return <Ctx.Provider value={{ data, loading, update }}>{children}</Ctx.Provider>;
}

export function useAppData(): AppDataValue {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAppData must be used inside AppDataProvider');
  return ctx;
}
