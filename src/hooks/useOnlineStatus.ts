import { useEffect, useState, useCallback, useRef } from 'react';
import { syncEngine } from '../db/sync/syncEngine';

// Cada cuánto se reintenta subir la cola pendiente mientras el navegador
// se reporta online. No basta con el evento 'online': una petición puede
// fallar silenciosamente (timeout, corte breve) sin que el navegador
// llegue a disparar offline/online, dejando la cola atascada hasta el
// próximo reinicio de la app.
const INTERVALO_SYNC_MS = 90 * 1000;

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);

  const syncingRef = useRef(false);

  const sincronizar = useCallback(async () => {
    if (!navigator.onLine || syncingRef.current) return;

    syncingRef.current = true;
    try {
      await syncEngine.procesarCola();
    } finally {
      syncingRef.current = false;
    }
  }, []);

  useEffect(() => {
    const goOnline = () => {
      setIsOnline(true);
      sincronizar();
    };

    const goOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);

    // Reintento al montar la app (por si quedó algo pendiente de una sesión
    // anterior) y en un intervalo periódico como red de seguridad, ya que
    // el evento 'online' no cubre fallos silenciosos de red.
    sincronizar();
    const intervalo = setInterval(sincronizar, INTERVALO_SYNC_MS);

    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
      clearInterval(intervalo);
    };
  }, [sincronizar]);

  return { isOnline, forceSync: sincronizar };
}