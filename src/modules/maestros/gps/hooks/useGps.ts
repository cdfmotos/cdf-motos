import { useState, useEffect, useCallback } from 'react';
import { getGpsList, createGps, updateGps, deleteGps } from '../services/gpsService';
import type { GPS } from '../../../../db/schema';

export interface GpsFilters {
  placa: string;
  imei: string;
}

export function useGps() {
  const [gpsList, setGpsList] = useState<GPS[]>([]);
  const [filteredGpsList, setFilteredGpsList] = useState<GPS[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [filters, setFilters] = useState<GpsFilters>({
    placa: '',
    imei: '',
  });

  const loadGps = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getGpsList();
      setGpsList(data);
      applyFilters(data, filters);
    } catch (err) {
      console.error('Error loading GPS:', err);
      setError('Error al cargar los dispositivos GPS');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGps();
  }, [loadGps]);

  useEffect(() => {
    applyFilters(gpsList, filters);
  }, [filters, gpsList]);

  const applyFilters = (data: GPS[], currentFilters: GpsFilters) => {
    let result = [...data];

    if (currentFilters.placa) {
      result = result.filter(g => g.moto_placa.toLowerCase().includes(currentFilters.placa.toLowerCase()));
    }
    if (currentFilters.imei) {
      result = result.filter(g => g.gps_imei.toLowerCase().includes(currentFilters.imei.toLowerCase()));
    }

    // Sort by fecha de creación DESC
    result.sort((a, b) => {
      const dateA = a.created_at || '';
      const dateB = b.created_at || '';
      return dateB.localeCompare(dateA);
    });

    setFilteredGpsList(result);
  };

  const addGps = async (gps: Omit<GPS, 'id' | '_sync_status' | 'created_at'>) => {
    try {
      const result = await createGps(gps);
      if (result.success) {
        await loadGps();
      }
      return result;
    } catch (err) {
      console.error('Error adding GPS:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Error desconocido' };
    }
  };

  const editGps = async (id: number, updates: Partial<Omit<GPS, 'id' | '_sync_status' | 'created_at'>>) => {
    try {
      const result = await updateGps(id, updates);
      if (result.success) {
        await loadGps();
      }
      return result;
    } catch (err) {
      console.error('Error updating GPS:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Error desconocido' };
    }
  };

  const removeGps = async (id: number) => {
    try {
      await deleteGps(id);
      setGpsList(prev => prev.filter(g => g.id !== id));
      return true;
    } catch (err) {
      console.error('Error deleting GPS:', err);
      return false;
    }
  };

  return {
    gpsList: filteredGpsList,
    loading,
    error,
    filters,
    setFilters,
    addGps,
    editGps,
    removeGps,
    reload: loadGps,
  };
}
