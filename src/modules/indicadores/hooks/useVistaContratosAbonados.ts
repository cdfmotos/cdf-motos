import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import type { Database } from '../../../types/database.types';

type VistaContratosAbonados = Database['public']['Views']['vista_contratos_abonados']['Row'];

export function useVistaContratosAbonados() {
  const [data, setData] = useState<VistaContratosAbonados[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data: rows, error: err } = await supabase
          .from('vista_contratos_abonados')
          .select('*')
          .order('ultima_fecha_pago', { ascending: false, nullsFirst: false });

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