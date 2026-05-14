import { useState } from 'react';
import { X, AlertTriangle, CheckCircle } from 'lucide-react';

const nf = (v: number | null | undefined) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })
    .format(Number(v ?? 0));

interface ConfirmarMontoModalProps {
  open: boolean;
  montoOriginal: number;
  montoNuevo: number;
  cuotaDiaria: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmarMontoModal({
  open,
  montoOriginal,
  montoNuevo,
  cuotaDiaria,
  onConfirm,
  onCancel,
}: ConfirmarMontoModalProps) {
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const diferencia = montoNuevo - montoOriginal;
  const diasDiferencia = Math.round(diferencia / cuotaDiaria);
  const esMayor = diferencia > 0;
  const esMenor = diferencia < 0;
  const esIgual = diferencia === 0;

  const handleConfirm = async () => {
    setLoading(true);
    await onConfirm();
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4">
      <div className="bg-card w-full max-w-md rounded-xl shadow-2xl" onClick={e => e.stopPropagation()}>

        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-100 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <h2 className="text-lg font-semibold text-slate-800">Confirmar Cambio de Monto</h2>
          </div>
          <button onClick={onCancel} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="bg-slate-50 border border-border rounded-xl p-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-slate-500">Monto Original</span>
              <span className="font-medium text-slate-700">{nf(montoOriginal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-slate-500">Monto Nuevo</span>
              <span className="font-medium text-slate-700">{nf(montoNuevo)}</span>
            </div>
            <div className="border-t border-border pt-2 flex justify-between">
              <span className="text-sm text-slate-500">Diferencia</span>
              <span className={`font-semibold ${esMayor ? 'text-amber-600' : esMenor ? 'text-red-600' : 'text-slate-700'}`}>
                {esIgual ? 'Sin cambios' : `${esMayor ? '+' : ''}${nf(diferencia)}`}
              </span>
            </div>
          </div>

          {!esIgual && (
            <div className={`p-3 rounded-lg text-sm ${esMayor ? 'bg-amber-50 border border-amber-200 text-amber-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
              {esMayor ? (
                <p>El nuevo monto es mayor. Se pagarán aproximadamente <strong>{diasDiferencia} días extra</strong>.</p>
              ) : (
                <p>El nuevo monto es menor. Se reducirán aproximadamente <strong>{Math.abs(diasDiferencia)} días</strong> pagados.</p>
              )}
              <p className="mt-1 font-medium">Esto recalculará todos los saldos posteriores.</p>
            </div>
          )}

          <div className="flex items-center gap-2 text-sm text-slate-500 bg-blue-50 border border-blue-200 p-3 rounded-lg">
            <CheckCircle className="w-4 h-4 text-blue-600 shrink-0" />
            <span>Los cambios se aplicarán localmente. Se sincronizarán al reconectar.</span>
          </div>
        </div>

        <div className="p-5 border-t border-border bg-slate-50 flex justify-end gap-3 rounded-b-xl">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-border text-slate-700 bg-white rounded-lg hover:bg-slate-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? 'Guardando...' : 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  );
}