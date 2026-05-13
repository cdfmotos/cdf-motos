import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import type { Database } from '../../../types/database.types';

type VistaAsistenciaResumen = Database['public']['Views']['vista_asistencia_resumen_v2']['Row'];

export function useVistaAsistenciaResumen(fecha: string) {
  const [data, setData] = useState<VistaAsistenciaResumen | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!fecha) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data: row, error: err } = await supabase
          .from('vista_asistencia_resumen_v2')
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