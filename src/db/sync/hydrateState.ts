type HydrateStatus = 'idle' | 'loading' | 'success' | 'error';

type HydrateState = {
  status: HydrateStatus;
  mensaje: string;
  tablaActual: string | null;
  pendientes: number;         // registros en sync_queue
  ultimaSync: Date | null;    // última vez que se hidratò exitosamente
  desincronizado: boolean;    // hay cambios en supabase que no están en dexie
};

// Estado reactivo simple sin zustand ni redux
let state: HydrateState = {
  status: 'idle',
  mensaje: '',
  tablaActual: null,
  pendientes: 0,
  ultimaSync: null,
  desincronizado: false,
};

// Listeners para notificar cambios (patrón observer)
const listeners = new Set<() => void>();

export function getHydrateState() {
  return state;
}

export function setHydrateState(partial: Partial<HydrateState>) {
  state = { ...state, ...partial };
  listeners.forEach(fn => fn());
}

export function subscribeHydrateState(fn: () => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);   // retorna unsubscribe
}

export function resetHydrateState() {
  state = {
    status: 'idle',
    mensaje: '',
    tablaActual: null,
    pendientes: 0,
    ultimaSync: null,
    desincronizado: false,
  };
  listeners.forEach(fn => fn());
}