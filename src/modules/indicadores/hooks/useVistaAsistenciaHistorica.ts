import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import type { Database } from '../../../types/database.types';

type VistaAsistenciaHistorica = Database['public']['Views']['vista_asistencia_historica_v2']['Row'];

export function useVistaAsistenciaHistorica() {
  const [data, setData] = useState<VistaAsistenciaHistorica[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data: rows, error: err } = await supabase
          .from('vista_asistencia_historica_v2')
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