import { useState, useEffect, useCallback } from 'react';
import { getMotos, createMoto, updateMoto, deleteMoto } from '../services/motosService';
import type { Moto } from '../../../../db/schema';

export interface MotoFilters {
  placa: string;
  marca: string;
  modelo: string;
  fechaInicio: string;
  fechaFin: string;
}

export function useMotos() {
  const [motos, setMotos] = useState<Moto[]>([]);
  const [filteredMotos, setFilteredMotos] = useState<Moto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<MotoFilters>({
    placa: '',
    marca: '',
    modelo: '',
    fechaInicio: '',
    fechaFin: '',
  });

  const loadMotos = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getMotos();
      setMotos(data);
      applyFilters(data, filters);
    } catch (err) {
      console.error('Error loading motos:', err);
      setError('Error al cargar las motos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMotos();
  }, [loadMotos]);

  useEffect(() => {
    applyFilters(motos, filters);
  }, [filters, motos]);

  const applyFilters = (data: Moto[], currentFilters: MotoFilters) => {
    let result = [...data];

    if (currentFilters.placa) {
      result = result.filter(m => m.placa.toLowerCase().includes(currentFilters.placa.toLowerCase()));
    }
    if (currentFilters.marca) {
      result = result.filter(m => m.marca?.toLowerCase().includes(currentFilters.marca.toLowerCase()));
    }
    if (currentFilters.modelo) {
      result = result.filter(m => m.modelo?.toLowerCase().includes(currentFilters.modelo.toLowerCase()));
    }
    if (currentFilters.fechaInicio) {
      result = result.filter(m => m.fecha_compra && m.fecha_compra >= currentFilters.fechaInicio);
    }
    if (currentFilters.fechaFin) {
      result = result.filter(m => m.fecha_compra && m.fecha_compra <= currentFilters.fechaFin);
    }

    result.sort((a, b) => {
      const dateA = a.fecha_compra || '';
      const dateB = b.fecha_compra || '';
      return dateB.localeCompare(dateA);
    });

    setFilteredMotos(result);
  };

  const addMoto = async (moto: Omit<Moto, 'id' | '_sync_status' | 'created_at'>) => {
    try {
      const result = await createMoto(moto);
      if (result.success) {
        await loadMotos();
      }
      return result;
    } catch (err) {
      console.error('Error adding moto:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Error desconocido' };
    }
  };

  const editMoto = async (id: number, updates: Partial<Omit<Moto, 'id' | '_sync_status' | 'created_at'>>) => {
    try {
      const result = await updateMoto(id, updates);
      if (result.success) {
        await loadMotos();
      }
      return result;
    } catch (err) {
      console.error('Error updating moto:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Error desconocido' };
    }
  };

  const removeMoto = async (id: number) => {
    try {
      await deleteMoto(id);
      setMotos(prev => prev.filter(m => m.id !== id));
      return true;
    } catch (err) {
      console.error('Error deleting moto:', err);
      return false;
    }
  };

  return {
    motos: filteredMotos,
    loading,
    error,
    filters,
    setFilters,
    addMoto,
    editMoto,
    removeMoto,
    reload: loadMotos,
  };
}