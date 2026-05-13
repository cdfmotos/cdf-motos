import { useState, useEffect, useCallback } from 'react';
import { getSoats, createSoat, updateSoat, deleteSoat } from '../services/soatsService';
import type { Soat } from '../../../../db/schema';

export interface SoatFilters {
  placa: string;
  noSoat: string;
}

export function useSoats() {
  const [soats, setSoats] = useState<Soat[]>([]);
  const [filteredSoats, setFilteredSoats] = useState<Soat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [filters, setFilters] = useState<SoatFilters>({
    placa: '',
    noSoat: '',
  });

  const loadSoats = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getSoats();
      setSoats(data);
      applyFilters(data, filters);
    } catch (err) {
      console.error('Error loading soats:', err);
      setError('Error al cargar los SOATs');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSoats();
  }, [loadSoats]);

  useEffect(() => {
    applyFilters(soats, filters);
  }, [filters, soats]);

  const applyFilters = (data: Soat[], currentFilters: SoatFilters) => {
    let result = [...data];

    if (currentFilters.placa) {
      result = result.filter(s => s.moto_placa.toLowerCase().includes(currentFilters.placa.toLowerCase()));
    }
    if (currentFilters.noSoat) {
      result = result.filter(s => s.no_soat.toLowerCase().includes(currentFilters.noSoat.toLowerCase()));
    }

    // Sort by fecha_vencimiento ASC (los más próximos a vencer primero)
    result.sort((a, b) => {
      const dateA = a.fecha_vencimiento || '';
      const dateB = b.fecha_vencimiento || '';
      return dateA.localeCompare(dateB);
    });

    setFilteredSoats(result);
  };

  const addSoat = async (soat: Omit<Soat, 'id' | '_sync_status' | 'created_at'>) => {
    try {
      const newSoat = await createSoat(soat);
      setSoats(prev => [newSoat, ...prev]);
      return true;
    } catch (err) {
      console.error('Error adding soat:', err);
      return false;
    }
  };

  const editSoat = async (id: number, updates: Partial<Omit<Soat, 'id' | '_sync_status' | 'created_at'>>) => {
    try {
      const updated = await updateSoat(id, updates);
      setSoats(prev => prev.map(s => s.id === id ? updated : s));
      return true;
    } catch (err) {
      console.error('Error updating soat:', err);
      return false;
    }
  };

  const removeSoat = async (id: number) => {
    try {
      await deleteSoat(id);
      setSoats(prev => prev.filter(s => s.id !== id));
      return true;
    } catch (err) {
      console.error('Error deleting soat:', err);
      return false;
    }
  };

  return {
    soats: filteredSoats,
    loading,
    error,
    filters,
    setFilters,
    addSoat,
    editSoat,
    removeSoat,
    reload: loadSoats,
  };
}
