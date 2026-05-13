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
  fechaInicio: string;
  fechaFin: string;
}

export function useGastos() {
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<GastoFilters>({
    concepto: '',
    fechaInicio: '',
    fechaFin: '',
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

  // ✅ Correcto: cargar datos externos
useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true);

      const data = await getGastos();

      setGastos(data);
    } catch (err) {
      console.error(err);
      setError('Error al cargar gastos');
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, []);

  // ✅ Derivar estado con useMemo
  const filteredGastos = useMemo(() => {
    let result = [...gastos];

    if (filters.concepto) {
      result = result.filter(g =>
        g.concepto
          .toLowerCase()
          .includes(filters.concepto.toLowerCase())
      );
    }

    if (filters.fechaInicio) {
      result = result.filter(
        g => g.fecha && g.fecha >= filters.fechaInicio
      );
    }

    if (filters.fechaFin) {
      result = result.filter(
        g => g.fecha && g.fecha <= filters.fechaFin
      );
    }

    result.sort((a, b) => b.fecha.localeCompare(a.fecha));

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

      setGastos(prev =>
        prev.map(g => (g.id === id ? updated : g))
      );

      return true;
    } catch (err) {
      console.error('Error updating gasto:', err);
      return false;
    }
  };

  const removeGasto = async (id: number) => {
    try {
      await deleteGasto(id);

      setGastos(prev =>
        prev.filter(g => g.id !== id)
      );

      return true;
    } catch (err) {
      console.error('Error deleting gasto:', err);
      return false;
    }
  };

  const syncGasto = async (gasto: Gasto) => {
    if (
      gasto._sync_status !== 'pending' &&
      gasto._sync_status !== 'error'
    ) {
      return false;
    }

    try {
      const { syncEngine } = await import(
        '../../../db/sync/syncEngine'
      );

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