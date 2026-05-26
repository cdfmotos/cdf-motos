import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import type { Database } from '../../../types/database.types';

type VistaAsistenciaHistoricaV3 = Database['public']['Views']['vista_asistencia_historica_v3']['Row'];

export function useVistaAsistenciaHistoricaV3(fechaDesde: string, fechaHasta: string) {
  const [data, setData] = useState<VistaAsistenciaHistoricaV3[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!fechaDesde || !fechaHasta) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data: rows, error: err } = await supabase
          .from('vista_asistencia_historica_v3')
          .select('*')
          .gte('fecha', fechaDesde)
          .lte('fecha', fechaHasta)
          .order('fecha', { ascending: true });

        if (err) {
          setError(err.message);
        } else {
          setData(rows || []);
        }
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [fechaDesde, fechaHasta]);

  return { data, loading, error };
}
