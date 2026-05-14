import { useState, useEffect, useCallback } from 'react';
import { db } from '../db/db';
import type { EstadoSistema } from '../db/schema';
import { useAuthContext } from '../contexts/AuthContext';

export function useBlockedDay() {
  const { isAdmin } = useAuthContext();
  const [estadoSistema, setEstadoSistema] = useState<EstadoSistema | null>(null);
  const [loading, setLoading] = useState(true);

  const hoy = new Date().toISOString().split('T')[0];

  const loadEstado = useCallback(async () => {
    try {
      const estado = await db.estado_sistema.where('fecha').equals(hoy).first();
      setEstadoSistema(estado ?? null);
    } catch (err) {
      console.error('Error cargando estado del sistema:', err);
      setEstadoSistema(null);
    } finally {
      setLoading(false);
    }
  }, [hoy]);

  useEffect(() => {
    loadEstado();
  }, [loadEstado]);

  const isBlocked = estadoSistema ? estadoSistema.abierto === false : false;

  const canWrite = (): boolean => {
    if (isAdmin) return true;
    return !isBlocked;
  };

  const canWriteInConfiguracion = (): boolean => {
    return true;
  };

  return {
    isBlocked,
    isOpen: estadoSistema ? estadoSistema.abierto : true,
    estadoSistema,
    canWrite,
    canWriteInConfiguracion,
    loading,
    reload: loadEstado,
  };
}