import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import type { Database } from '../../../types/database.types';

type HistoricoEstado = Database['public']['Tables']['historico_estado_contratos']['Row'];

export function useHistoricoEstadoContratos() {
  const [data, setData] = useState<HistoricoEstado[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data: rows, error: err } = await supabase
          .from('historico_estado_contratos')
          .select('*')
          .order('fecha', { ascending: false });

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
  }, []);

  return { data, loading, error };
}