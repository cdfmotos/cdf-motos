import { useEffect, useState, useCallback, useRef } from 'react';
import { syncEngine } from '../db/sync/syncEngine';

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);

  const syncingRef = useRef(false);

  useEffect(() => {
    const goOnline = async () => {
      setIsOnline(true);

      // evita múltiples sync simultáneos
      if (syncingRef.current) return;

      syncingRef.current = true;
      try {
        await syncEngine.procesarCola();
      } finally {
        syncingRef.current = false;
      }
    };

    const goOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);

    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  const forceSync = useCallback(async () => {
    if (!navigator.onLine) return;

    if (syncingRef.current) return;

    syncingRef.current = true;
    try {
      await syncEngine.procesarCola();
    } finally {
      syncingRef.current = false;
    }
  }, []);

  return { isOnline, forceSync };
}