import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import type { Database } from '../../../types/database.types';

type HistoricoEstado = Database['public']['Tables']['historico_estado_contratos']['Row'];

/**
 * Carga el histórico de estado de contratos.
 * Si fechaDesde y fechaHasta están vacíos, carga todo el histórico disponible.
 */
export function useHistoricoEstadoContratos(fechaDesde: string, fechaHasta: string) {
  const [data, setData] = useState<HistoricoEstado[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        let query = supabase
          .from('historico_estado_contratos')
          .select('*')
          .order('fecha', { ascending: true });

        // Solo aplica filtros de fecha si tienen valor (permite cargar el histórico completo)
        if (fechaDesde) query = query.gte('fecha', fechaDesde);
        if (fechaHasta) query = query.lte('fecha', fechaHasta);

        const { data: rows, error: err } = await query;

        if (err) {
          setError(err.message);
        } else {
          setData(rows || []);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [fechaDesde, fechaHasta]);

  return { data, loading, error };
}