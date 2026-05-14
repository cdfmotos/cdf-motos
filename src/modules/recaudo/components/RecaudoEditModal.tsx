import { useState } from 'react';
import { X, Wifi, WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../../../hooks/useOnlineStatus';
import { useToast } from '../../../components/ui/Toast';
import { ConfirmarMontoModal } from '../../../components/ConfirmarMontoModal';
import { editarMontoRecaudo } from '../services/recaudoService';
import type { Recaudo } from '../../../db/schema';

const nf = (v: number | null | undefined) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })
    .format(Number(v ?? 0));

interface RecaudoEditModalProps {
  recaudo: Recaudo;
  onClose: () => void;
  onSave: () => void;
}

export function RecaudoEditModal({ recaudo, onClose, onSave }: RecaudoEditModalProps) {
  const { isOnline } = useOnlineStatus();
  const { addToast } = useToast();
  const [monto, setMonto] = useState(String(recaudo.monto_recaudado));
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');

  const montoNum = parseInt(monto.replace(/[^\d]/g, ''), 10);
  const montoOriginal = recaudo.monto_recaudado;

  const handleSave = async () => {
    if (isNaN(montoNum) || montoNum <= 0) {
      setError('Ingrese un monto válido');
      return;
    }

    if (montoNum === montoOriginal) {
      onClose();
      return;
    }

    setShowConfirm(true);
  };

  const handleConfirmSave = async () => {
    setShowConfirm(false);
    setLoading(true);
    setError('');

    try {
      await editarMontoRecaudo(recaudo.id, montoNum);
      addToast('Monto actualizado correctamente', 'success');
      onSave();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar');
      addToast('Error al actualizar el monto', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
        <div className="bg-card w-full max-w-md rounded-xl shadow-2xl" onClick={e => e.stopPropagation()}>

          <div className="flex items-center justify-between p-5 border-b border-border">
            <h2 className="text-lg font-semibold text-slate-800">Editar Recaudo</h2>
            <div className="flex items-center gap-3">
              <span className={`flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full ${isOnline ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
                {isOnline ? 'Online' : 'Offline'}
              </span>
              <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-5 space-y-4">
            <div className="bg-slate-50 border border-border rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Contrato</span>
                <span className="font-medium">{recaudo.contrato_id}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Fecha</span>
                <span className="font-medium">{new Date(recaudo.fecha_recaudo).toLocaleDateString('es-CO')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Cuota Diaria</span>
                <span className="font-medium">{nf(recaudo.cuota_diaria_pactada)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Saldo Pendiente</span>
                <span className="font-medium text-primary">{nf(recaudo.saldo_pendiente)}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nuevo Monto</label>
              <input
                type="text"
                value={monto}
                onChange={e => setMonto(e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            {montoNum !== montoOriginal && !isNaN(montoNum) && (
              <div className={`p-3 rounded-lg text-sm ${montoNum > montoOriginal ? 'bg-amber-50 border border-amber-200 text-amber-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
                {montoNum > montoOriginal ? (
                  <p>El monto es mayor al original ({nf(montoOriginal)}). Se recalcularán los saldos.</p>
                ) : (
                  <p>El monto es menor al original ({nf(montoOriginal)}). Se recalcularán los saldos.</p>
                )}
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">{error}</div>
            )}
          </div>

          <div className="p-5 border-t border-border bg-slate-50 flex justify-end gap-3 rounded-b-xl">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-border text-slate-700 bg-white rounded-lg hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </div>
      </div>

      <ConfirmarMontoModal
        open={showConfirm}
        montoOriginal={montoOriginal}
        montoNuevo={montoNum}
        cuotaDiaria={recaudo.cuota_diaria_pactada}
        onConfirm={handleConfirmSave}
        onCancel={() => setShowConfirm(false)}
      />
    </>
  );
}