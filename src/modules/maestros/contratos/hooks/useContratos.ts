import { useState, useEffect, useCallback } from 'react';
import type { Contrato } from '../../../../db/schema';
import * as contratosService from '../services/contratosService';

export function useContratos() {
  const [contratos, setContratos] = useState<Contrato[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadContratos = useCallback(async () => {
    try {
      setLoading(true);
      const data = await contratosService.getContratos();
      setContratos(data);
      setError(null);
    } catch (err) {
      console.error('Error al cargar contratos:', err);
      setError('Error al cargar la lista de contratos.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadContratos();
  }, [loadContratos]);

  const addContrato = async (contrato: Omit<Contrato, 'id' | '_sync_status' | 'created_at'> & { id?: number }) => {
    try {
      const result = await contratosService.createContrato(contrato);
      if (result.success) {
        await loadContratos();
      }
      return result as { success: boolean; saved?: Contrato; error?: string; localSaved?: boolean };
    } catch (err: any) {
      console.error('Error al crear contrato:', err);
      return { success: false, error: err.message || 'Error al crear el contrato' };
    }
  };

  const updateContrato = async (id: number, updates: Partial<Omit<Contrato, '_sync_status' | 'created_at'>>) => {
    try {
      const result = await contratosService.updateContrato(id, updates);
      if (result.success) {
        await loadContratos();
      }
      return result as { success: boolean; saved?: Contrato; error?: string; localSaved?: boolean };
    } catch (err: any) {
      console.error('Error al actualizar contrato:', err);
      return { success: false, error: err.message || 'Error al actualizar el contrato' };
    }
  };

  const deleteContrato = async (id: number) => {
    try {
      await contratosService.deleteContrato(id);
      setContratos(prev => prev.filter(c => c.id !== id));
      return { success: true };
    } catch (err: any) {
      console.error('Error al eliminar contrato:', err);
      return { success: false, error: err.message || 'Error al eliminar el contrato' };
    }
  };

  const checkContratoActivoMoto = async (placa: string) => {
    try {
      const activos = await contratosService.getContratosActivosByPlaca(placa);
      return activos.length > 0;
    } catch (err) {
      console.error('Error al verificar contratos activos:', err);
      return false;
    }
  };

  return {
    contratos,
    loading,
    error,
    refresh: loadContratos,
    addContrato,
    updateContrato,
    deleteContrato,
    checkContratoActivoMoto
  };
}
