import { useState, useEffect, useCallback } from 'react';
import { getClientes, createCliente, updateCliente, deleteCliente } from '../services/clientesService';
import type { Cliente } from '../../../../db/schema';

export interface ClienteFilters {
  cedula: string;
  nombre: string;
}

export function useClientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [filteredClientes, setFilteredClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [filters, setFilters] = useState<ClienteFilters>({
    cedula: '',
    nombre: '',
  });

  const loadClientes = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getClientes();
      setClientes(data);
      applyFilters(data, filters);
    } catch (err) {
      console.error('Error loading clientes:', err);
      setError('Error al cargar los clientes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadClientes();
  }, [loadClientes]);

  useEffect(() => {
    applyFilters(clientes, filters);
  }, [filters, clientes]);

  const applyFilters = (data: Cliente[], currentFilters: ClienteFilters) => {
    let result = [...data];

    if (currentFilters.cedula) {
      result = result.filter(c => c.cedula.toLowerCase().includes(currentFilters.cedula.toLowerCase()));
    }
    if (currentFilters.nombre) {
      const searchNombre = currentFilters.nombre.toLowerCase();
      result = result.filter(c => 
        c.nombres.toLowerCase().includes(searchNombre) || 
        c.apellidos.toLowerCase().includes(searchNombre) ||
        `${c.nombres} ${c.apellidos}`.toLowerCase().includes(searchNombre)
      );
    }

    // Sort by nombres ASC
    result.sort((a, b) => a.nombres.localeCompare(b.nombres));

    setFilteredClientes(result);
  };

  const addCliente = async (cliente: Omit<Cliente, 'id' | '_sync_status' | 'created_at'>) => {
    try {
      const result = await createCliente(cliente);
      if (result.success) {
        await loadClientes();
      }
      return result;
    } catch (err) {
      console.error('Error adding cliente:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Error desconocido' };
    }
  };

  const editCliente = async (id: string, updates: Partial<Omit<Cliente, 'id' | '_sync_status' | 'created_at'>>) => {
    try {
      const result = await updateCliente(id, updates);
      if (result.success) {
        await loadClientes();
      }
      return result;
    } catch (err) {
      console.error('Error updating cliente:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Error desconocido' };
    }
  };

  const removeCliente = async (id: string) => {
    try {
      await deleteCliente(id);
      setClientes(prev => prev.filter(c => c.id !== id));
      return true;
    } catch (err) {
      console.error('Error deleting cliente:', err);
      return false;
    }
  };

  return {
    clientes: filteredClientes,
    loading,
    error,
    filters,
    setFilters,
    addCliente,
    editCliente,
    removeCliente,
    reload: loadClientes,
  };
}
