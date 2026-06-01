import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  getGastos,
  createGasto,
  updateGasto,
  deleteGasto,
} from '../services/gastosService';
import type { Gasto } from '../../../db/schema';

export interface GastoFilters {
  concepto: string;
  fecha: string;
}

// Normaliza cualquier fecha (Date, ISO string, "YYYY-MM-DD") a "YYYY-MM-DD"
function toDateStr(fecha: unknown): string {
  if (fecha instanceof Date) {
    const y = fecha.getFullYear();
    const m = String(fecha.getMonth() + 1).padStart(2, '0');
    const d = String(fecha.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  return String(fecha).slice(0, 10);
}

export function useGastos() {
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<GastoFilters>({
    concepto: '',
    fecha: '',
  });

  const loadGastos = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getGastos();
      setGastos(data);
    } catch (err) {
      console.error('Error loading gastos:', err);
      setError('Error al cargar los gastos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGastos();
  }, [loadGastos]);

  const filteredGastos = useMemo(() => {
    let result = [...gastos];

    if (filters.concepto) {
      result = result.filter(g =>
        g.concepto.toLowerCase().includes(filters.concepto.toLowerCase())
      );
    }

    if (filters.fecha) {
  result = result.filter(g => {
    const converted = toDateStr(g.fecha);
    return g.fecha ? converted === filters.fecha : false;
  });
}

    result.sort((a, b) =>
      toDateStr(b.fecha).localeCompare(toDateStr(a.fecha))
    );

    return result;
  }, [gastos, filters]);

  const addGasto = async (
    gasto: Omit<Gasto, 'id' | '_sync_status' | 'created_at'>
  ) => {
    try {
      const newGasto = await createGasto(gasto);
      setGastos(prev => [newGasto, ...prev]);
      return true;
    } catch (err) {
      console.error('Error adding gasto:', err);
      return false;
    }
  };

  const editGasto = async (
    id: number,
    updates: Partial<Omit<Gasto, 'id' | '_sync_status' | 'created_at'>>
  ) => {
    try {
      const updated = await updateGasto(id, updates);
      setGastos(prev => prev.map(g => (g.id === id ? updated : g)));
      return true;
    } catch (err) {
      console.error('Error updating gasto:', err);
      return false;
    }
  };

  const removeGasto = async (id: number) => {
    try {
      await deleteGasto(id);
      setGastos(prev => prev.filter(g => g.id !== id));
      return true;
    } catch (err) {
      console.error('Error deleting gasto:', err);
      return false;
    }
  };

  const syncGasto = async (gasto: Gasto) => {
    if (gasto._sync_status !== 'pending' && gasto._sync_status !== 'error') {
      return false;
    }
    try {
      const { syncEngine } = await import('../../../db/sync/syncEngine');
      await syncEngine.procesarCola();
      await loadGastos();
      return true;
    } catch (err) {
      console.error('Error syncing gasto:', err);
      return false;
    }
  };

  return {
    gastos: filteredGastos,
    loading,
    error,
    filters,
    setFilters,
    addGasto,
    editGasto,
    removeGasto,
    syncGasto,
    reload: loadGastos,
  };
}