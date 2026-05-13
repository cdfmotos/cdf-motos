import { useHydrate } from '../context/useHydrate';
import { syncEngine } from '../db/sync/syncEngine';

export function SyncStatusBar() {
  const {
    status,
    mensaje,
    tablaActual,
    pendientes,
    ultimaSync,
    desincronizado,
    recargar,
  } = useHydrate();

  // Cargando
  if (status === 'loading') {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border-b border-blue-200 text-sm text-blue-700">
        <span className="animate-spin">⟳</span>
        <span>{tablaActual ? `Cargando ${tablaActual}...` : mensaje}</span>
      </div>
    );
  }

  // Error de hidratación
  if (status === 'error') {
    return (
      <div className="flex items-center justify-between px-4 py-2 bg-red-50 border-b border-red-200 text-sm text-red-700">
        <span>⚠ {mensaje}</span>
        <button
          onClick={recargar}
          className="underline font-medium hover:text-red-900"
        >
          Reintentar
        </button>
      </div>
    );
  }

  // Hay datos nuevos en Supabase
  if (desincronizado) {
    return (
      <div className="flex items-center justify-between px-4 py-2 bg-yellow-50 border-b border-yellow-200 text-sm text-yellow-700">
        <span>↑ Hay datos nuevos disponibles</span>
        <button
          onClick={recargar}
          className="underline font-medium hover:text-yellow-900"
        >
          Actualizar ahora
        </button>
      </div>
    );
  }

  // Hay operaciones pendientes de subir
  if (pendientes > 0) {
    return (
      <div className="flex items-center justify-between px-4 py-2 bg-orange-50 border-b border-orange-200 text-sm text-orange-700">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-orange-200 text-xs font-bold">
            {pendientes}
          </span>
          <span>
            {pendientes === 1
              ? '1 registro pendiente de sincronizar'
              : `${pendientes} registros pendientes de sincronizar`}
          </span>
        </div>

        <button
          onClick={() => syncEngine.procesarCola()}
          className="text-xs font-medium underline hover:text-orange-900"
        >
          Sincronizar ahora
        </button>
      </div>
    );
  }

  // Todo sincronizado — barra discreta
  if (status === 'success' && ultimaSync) {
    return (
      <div className="flex items-center gap-1 px-4 py-1 bg-green-50 border-b border-green-100 text-xs text-green-600">
        <span>✓</span>
        <span>
          Sincronizado —{' '}
          {ultimaSync.toLocaleTimeString('es-CO', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      </div>
    );
  }

  return null;
}