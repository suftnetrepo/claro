/**
 * useReceiptScanLimit.ts
 * Claro — Receipt Scanning Feature — free-tier monthly scan cap
 *
 * Tracks how many receipt scans a free user has used this calendar month,
 * persisted via expo-secure-store so it survives app restarts. Premium
 * users are always unlimited and are never charged against the counter.
 *
 * Storage shape (SecureStore, JSON string):
 *   { count: number, month: "YYYY-MM" }
 *
 * The counter resets automatically the first time this hook reads a stored
 * value from a previous month — there's no background job, it's just a
 * lazy reset on next read/write.
 */

import { useCallback, useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";
import { usePremium } from "./usePremium";

const RECEIPT_SCAN_COUNT_KEY = "claro_receipt_scan_count";

export const FREE_SCAN_LIMIT = 10;

interface ScanCounter {
  count: number;
  month: string; // "YYYY-MM"
}

function currentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

/** Reads the counter, resetting to 0 if it's stale (different month) or unreadable. */
async function readCounter(): Promise<ScanCounter> {
  const month = currentMonth();
  try {
    const raw = await SecureStore.getItemAsync(RECEIPT_SCAN_COUNT_KEY);
    if (!raw) return { count: 0, month };

    const parsed = JSON.parse(raw) as Partial<ScanCounter>;
    if (parsed.month !== month || typeof parsed.count !== "number") {
      return { count: 0, month };
    }
    return { count: parsed.count, month };
  } catch {
    // Corrupt value or SecureStore unavailable — fail open rather than
    // blocking a free user from scanning because of a storage glitch.
    return { count: 0, month };
  }
}

async function writeCounter(counter: ScanCounter): Promise<void> {
  try {
    await SecureStore.setItemAsync(RECEIPT_SCAN_COUNT_KEY, JSON.stringify(counter));
  } catch {
    // Non-fatal — worst case the count doesn't persist for this scan.
  }
}

interface UseReceiptScanLimit {
  /** Scans used so far this calendar month (always 0 for premium). */
  scansUsed: number;
  /** Scans left this month — Infinity for premium users. */
  scansRemaining: number;
  /** True only for free users who have hit FREE_SCAN_LIMIT this month. */
  limitReached: boolean;
  /** Call after a successful scan to record it against the monthly count. No-op for premium. */
  incrementCount: () => Promise<void>;
  /**
   * Re-reads the counter from storage. The consuming component (the scan
   * sheet) typically doesn't unmount between opens — only its own visual
   * open/close animates — so this hook's state won't otherwise notice a
   * month rollover or an external change. Call this whenever the sheet
   * becomes visible again to stay in sync.
   */
  refresh: () => Promise<void>;
}

export function useReceiptScanLimit(): UseReceiptScanLimit {
  const { isPremium } = usePremium();
  const [scansUsed, setScansUsed] = useState(0);

  const refresh = useCallback(async () => {
    const counter = await readCounter();
    setScansUsed(counter.count);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const incrementCount = useCallback(async () => {
    if (isPremium) return; // unlimited — don't bother tracking

    // Re-read rather than trust local state: the month may have rolled
    // over since mount, and this keeps concurrent scans from clobbering
    // each other's counts.
    const counter = await readCounter();
    const next: ScanCounter = { count: counter.count + 1, month: currentMonth() };
    await writeCounter(next);
    setScansUsed(next.count);
  }, [isPremium]);

  const scansRemaining = isPremium ? Infinity : Math.max(0, FREE_SCAN_LIMIT - scansUsed);
  const limitReached = !isPremium && scansUsed >= FREE_SCAN_LIMIT;

  return { scansUsed, scansRemaining, limitReached, incrementCount, refresh };
}
