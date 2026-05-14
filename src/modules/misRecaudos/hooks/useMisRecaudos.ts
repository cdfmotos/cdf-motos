import { useState, useEffect, useCallback, useMemo } from 'react';
import { getMisRecaudos, createRecaudo, deleteRecaudo, getContratoById, type RecaudoInput, type ContratoWithCliente } from '../../recaudo/services/recaudoService';
import { useOnlineStatus } from '../../../hooks/useOnlineStatus';
import { useAuth } from '../../login/hooks/useAuth';
import type { Recaudo } from '../../../db/schema';
import type { RecaudoFilters } from '../../recaudo/hooks/useRecaudos';

export function useMisRecaudos() {
  const [recaudos, setRecaudos] = useState<Recaudo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isOnline } = useOnlineStatus();
  const { user } = useAuth();

  const [filters, setFilters] = useState<RecaudoFilters>({
    contratoId: '',
    fechaDesde: '',
    fechaHasta: '',
  });

  const applyFilters = useCallback((data: Recaudo[], currentFilters: RecaudoFilters) => {
    let result = [...data];

    if (currentFilters.contratoId) {
      const idNum = parseInt(currentFilters.contratoId);
      if (!isNaN(idNum)) {
        result = result.filter(r => r.contrato_id === idNum);
      }
    }
    if (currentFilters.fechaDesde) {
      result = result.filter(r => r.fecha_recaudo >= currentFilters.fechaDesde);
    }
    if (currentFilters.fechaHasta) {
      result = result.filter(r => r.fecha_recaudo <= currentFilters.fechaHasta);
    }

    return result;
  }, []);

  const filteredRecaudos = useMemo(
    () => applyFilters(recaudos, filters),
    [recaudos, filters, applyFilters]
  );

  const loadRecaudos = useCallback(async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const data = await getMisRecaudos(user.id);
      setRecaudos(data);
    } catch (err) {
      console.error('Error loading mis recaudos:', err);
      setError('Error al cargar mis recaudos');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadRecaudos();
  }, [loadRecaudos]);

  const addRecaudo = async (input: RecaudoInput) => {
    try {
      // Ensure the recaudo belongs to the current user
      const result = await createRecaudo({ ...input, usuario_id: user?.id });
      if (result.success) {
        await loadRecaudos();
        return result;
      }
      return { success: false, error: result.error };
    } catch (err) {
      console.error('Error adding recaudo:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Error desconocido', localSaved: false };
    }
  };

  const removeRecaudo = async (id: number) => {
    try {
      await deleteRecaudo(id);
      setRecaudos(prev => prev.filter(r => r.id !== id));
      return true;
    } catch (err) {
      console.error('Error deleting recaudo:', err);
      return false;
    }
  };

  const buscarContrato = useCallback(async (contratoId: number): Promise<ContratoWithCliente | null> => {
    return await getContratoById(contratoId, isOnline);
  }, [isOnline]);

  return {
    recaudo: filteredRecaudos,
    loading,
    error,
    filters,
    setFilters,
    addRecaudo,
    removeRecaudo,
    reload: loadRecaudos,
    buscarContrato,
    isOnline,
  };
}