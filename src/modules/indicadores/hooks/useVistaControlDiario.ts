import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import type { Database } from '../../../types/database.types';

type VistaControlEfectivo = Database['public']['Views']['vista_control_efectivo']['Row'];

export function useVistaControlDiario(fecha: string) {
  const [data, setData] = useState<VistaControlEfectivo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!fecha) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data: row, error: err } = await supabase
          .from('vista_control_efectivo')
          .select('*')
          .eq('fecha', fecha)
          .maybeSingle();

        if (err) {
          setError(err.message);
        } else {
          setData(row);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [fecha]);

  return { data, loading, error };
}