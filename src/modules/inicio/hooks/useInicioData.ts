import { useState, useEffect } from 'react';
import { getActividadesRecientes } from '../services/actividadesService';
import type { ActividadReciente } from '../services/actividadesService';
import { getIndicadoresHome} from '../services/indicadoresService';
import type { IndicadoresHome } from '../services/indicadoresService';

export function useInicioData() {
  const [actividades, setActividades] = useState<ActividadReciente[]>([]);
  const [indicadores, setIndicadores] = useState<IndicadoresHome | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [acts, inds] = await Promise.all([
          getActividadesRecientes(),
          getIndicadoresHome(),
        ]);
        setActividades(acts);
        setIndicadores(inds);
      } catch (err) {
        console.error('Error fetching inicio data:', err);
        setError('Error al cargar los datos del dashboard');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return { actividades, indicadores, loading, error };
}
