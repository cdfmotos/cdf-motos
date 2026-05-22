import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import type { Database } from '../../../types/database.types';

type VistaAsistenciaHistorica = Database['public']['Views']['vista_asistencia_historica_v2']['Row'];

export function useVistaAsistenciaHistorica(fechaDesde: string, fechaHasta: string) {
  const [data, setData] = useState<VistaAsistenciaHistorica[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!fechaDesde || !fechaHasta) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data: rows, error: err } = await supabase
          .from('vista_asistencia_historica_v2')
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