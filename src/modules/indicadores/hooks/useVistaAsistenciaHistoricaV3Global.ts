import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';

// We define the type locally since it might not be in the generated types yet
export interface VistaAsistenciaGlobal {
  dias_operativos: number | null;
  total_esperados: number | null;
  asistencia_contratos: number | null;
  pct_total_global: number | null;
  motos_esperadas: number | null;
  asistencia_motos: number | null;
  pct_motos_global: number | null;
  prestamos_esperados: number | null;
  asistencia_prestamos: number | null;
  pct_prestamos_global: number | null;
}

export function useVistaAsistenciaHistoricaV3Global(anio: number, mes: number) {
  const [data, setData] = useState<VistaAsistenciaGlobal | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!anio || !mes) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data: row, error: err } = await (supabase as any)
          .rpc('fn_asistencia_global_por_periodo', {
            p_anio: anio,
            p_mes: mes
          })
          .maybeSingle();

        if (err) {
          setError(err.message);
        } else {
          setData(row as VistaAsistenciaGlobal);
        }
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [anio, mes]);

  return { data, loading, error };
}