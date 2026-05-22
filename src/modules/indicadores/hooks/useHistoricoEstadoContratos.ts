import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import type { Database } from '../../../types/database.types';

type HistoricoEstado = Database['public']['Tables']['historico_estado_contratos']['Row'];

export function useHistoricoEstadoContratos(fechaDesde: string, fechaHasta: string) {
  const [data, setData] = useState<HistoricoEstado[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!fechaDesde || !fechaHasta) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data: rows, error: err } = await supabase
          .from('historico_estado_contratos')
          .select('*')
          .gte('fecha', fechaDesde)
          .lte('fecha', fechaHasta)
          .order('fecha', { ascending: true });

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