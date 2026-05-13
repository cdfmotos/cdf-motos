import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import type { Database } from '../../../types/database.types';

type VistaControlEfectivo =
  Database['public']['Views']['vista_control_efectivo']['Row'];

export function useVistaControlEfectivoListado() {
  const [data, setData] = useState<VistaControlEfectivo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data: rows, error: err } = await supabase
          .from('vista_control_efectivo')
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