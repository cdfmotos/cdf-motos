import { AlertTriangle } from 'lucide-react';
import { useBlockedDay } from '../../hooks/useBlockedDay';
import { useAuthContext } from '../../contexts/AuthContext';

export function BlockedDayAlert() {
  const { isBlocked } = useBlockedDay();
  const { isAdmin } = useAuthContext();

  if (!isBlocked || isAdmin) return null;

  return (
    <div className="bg-amber-50 border-b border-amber-200 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-amber-800">
            Día cerrado — Operaciones bloqueadas
          </p>
          <p className="text-xs text-amber-600">
            No se permiten inserciones, ediciones ni eliminaciones. Solo lectura.
          </p>
        </div>
      </div>
    </div>
  );
}