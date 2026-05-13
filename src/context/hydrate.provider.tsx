import { useEffect, useState } from 'react';
import { HydrateContext } from './hydrate.context';
import {
  getHydrateState,
  subscribeHydrateState
} from '../db/sync/hydrateState';
import { verificarDesincronizacion } from '../db/sync/hydrate';
import { useAuth } from '../modules/login/hooks/useAuth'; 

export function HydrateProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState(getHydrateState);

  const { user } = useAuth(); // 👈 detectar login

  // 🔥 Sync automático cuando hay usuario logueado
  useEffect(() => {
    if (user) {
      const run = async () => {
        const { hidratarDB } = await import('../db/sync/hydrate');
        await hidratarDB();
      };

      run();
    }
  }, [user]);

  // 🔁 listener de estado global de sync
  useEffect(() => {
    const unsub = subscribeHydrateState(() => {
      setState({ ...getHydrateState() });
    });

    const intervalo = setInterval(verificarDesincronizacion, 2 * 60 * 1000);

    return () => {
      unsub();
      clearInterval(intervalo);
    };
  }, []);

  // 🔄 recarga manual (botón “reintentar” o “actualizar ahora”)
  async function recargar() {
    const { hidratarDB } = await import('../db/sync/hydrate');
    await hidratarDB();
  }

  return (
    <HydrateContext.Provider value={{ ...state, recargar }}>
      {children}
    </HydrateContext.Provider>
  );
}