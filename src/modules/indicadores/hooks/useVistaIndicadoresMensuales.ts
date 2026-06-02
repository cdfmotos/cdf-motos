import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../../lib/supabase';
import type { Database } from '../../../types/database.types';

type VistaIndicadoresMensuales = Database['public']['Views']['view_indicadores_mensuales']['Row'];

export function useVistaIndicadoresMensuales() {
  const [data, setData] = useState<VistaIndicadoresMensuales[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: rows, error: err } = await supabase
        .from('view_indicadores_mensuales')
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
  }, []);

  useEffect(() => {
    fetchData();

    const handleRecaudoChanged = () => {
      fetchData();
    };

    window.addEventListener('recaudo-changed', handleRecaudoChanged);
    return () => {
      window.removeEventListener('recaudo-changed', handleRecaudoChanged);
    };
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}