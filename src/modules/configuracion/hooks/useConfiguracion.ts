import { useState, useEffect, useCallback } from 'react';
import {
  getHistorialEstadoSistema,
  updateEstadoSistema,
} from '../services/configuracionService';
import type { EstadoSistema } from '../../../db/schema';
import { useOnlineStatus } from '../../../hooks/useOnlineStatus';

export function useConfiguracion() {
  const [historial, setHistorial] = useState<EstadoSistema[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { isOnline } = useOnlineStatus();

  const loadHistorial = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data =
        await getHistorialEstadoSistema();

      setHistorial(data);
    } catch (err) {
      console.error(
        'Error loading historial de estados:',
        err
      );

      setError(
        'Error al cargar la configuración'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      await loadHistorial();
    };

    fetchData();
  }, [loadHistorial]);

  const cambiarEstadoDia = async (
    fecha: string,
    abierto: boolean,
    observacion?: string
  ) => {
    try {
      await updateEstadoSistema(
        fecha,
        { abierto, observacion },
        isOnline
      );

      await loadHistorial();

      return true;
    } catch (err) {
      console.error(
        'Error al cambiar el estado del día:',
        err
      );

      return false;
    }
  };

  const syncEstado = async (
    estado: EstadoSistema
  ) => {
    if (
      estado._sync_status !== 'pending' &&
      estado._sync_status !== 'error'
    ) {
      return false;
    }

    try {
      const { syncEngine } = await import(
        '../../../db/sync/syncEngine'
      );

      await syncEngine.procesarCola();

      await loadHistorial();

      return true;
    } catch (err) {
      console.error(
        'Error syncing estado:',
        err
      );

      return false;
    }
  };

  return {
    historial,
    loading,
    error,
    isOnline,
    cambiarEstadoDia,
    syncEstado,
    reload: loadHistorial,
  };
}