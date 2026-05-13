import { useState, useEffect, useCallback } from 'react';
import { getRecaudos } from '../../recaudo/services/recaudoService';
import type { Recaudo } from '../../../db/schema';
import { useOnlineStatus } from '../../../hooks/useOnlineStatus';

export function useControlDiario() {
  const [recaudosHoy, setRecaudosHoy] = useState<Recaudo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isOnline = useOnlineStatus();

  const loadRecaudosHoy = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getRecaudos();
      
      // Filtrar solo los de hoy (comparando la fecha local YYYY-MM-DD)
      const hoyStr = new Date().toISOString().split('T')[0];
      
      const filtrados = data.filter(r => {
        if (!r.fecha_recaudo) return false;
        // Tomamos solo la parte de la fecha (asumiendo formato YYYY-MM-DD o ISO)
        const recaudoFechaStr = r.fecha_recaudo.split('T')[0];
        return recaudoFechaStr === hoyStr;
      });

      setRecaudosHoy(filtrados);
    } catch (err) {
      console.error('Error loading recaudos de hoy:', err);
      setError('Error al cargar el control diario');
    } finally {
      setLoading(false);
    }
  }, []);

useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true);

      const data = await getRecaudos();

      const hoyStr = new Date().toISOString().split('T')[0];

      const filtrados = data.filter(r => {
        if (!r.fecha_recaudo) return false;

        const recaudoFechaStr =
          r.fecha_recaudo.split('T')[0];

        return recaudoFechaStr === hoyStr;
      });

      setRecaudosHoy(filtrados);
    } catch (err) {
      console.error(err);
      setError('Error al cargar el control diario');
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, []);

  return {
    recaudosHoy,
    loading,
    error,
    isOnline,
    reload: loadRecaudosHoy,
  };
}
