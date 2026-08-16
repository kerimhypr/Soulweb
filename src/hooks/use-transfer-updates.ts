'use client';
import { useCallback, useEffect, useState } from 'react';
import type { Transfer } from '@/types';

/** A single, cleanup-safe polling subscription; replace with SSE/WebSocket in a gateway integration. */
export function useTransferUpdates(initial: Transfer[], intervalMs = 5_000) {
  const [transfers, setTransfers] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const refresh = useCallback(async () => {
    try {
      const response = await fetch('/api/transfers', { cache: 'no-store' });
      const payload: unknown = await response.json();
      if (!response.ok || typeof payload !== 'object' || payload === null || !('data' in payload) || !Array.isArray(payload.data)) throw new Error();
      setTransfers(payload.data as Transfer[]); setError(null);
    } catch { setError('Transfer updates are temporarily unavailable.'); }
  }, []);
  useEffect(() => { const timer = window.setInterval(refresh, intervalMs); return () => window.clearInterval(timer); }, [intervalMs, refresh]);
  return { transfers, setTransfers, refresh, error };
}
