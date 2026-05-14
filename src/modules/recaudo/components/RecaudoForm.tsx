import { useState } from 'react';
import { X, Search, Wifi, WifiOff, AlertCircle } from 'lucide-react';
import type { ContratoWithCliente } from '../services/recaudoService';
import { useOnlineStatus } from '../../../hooks/useOnlineStatus';

interface RecaudoFormProps {
  onClose: () => void;
  onSubmit: (data: {
    contrato_id: number;
    monto_recaudado: number;
    fecha_recaudo: string;
    cuota_diaria_pactada: number;
    tipo_contrato: string;
  }) => Promise<{ success: boolean; error?: string }>;
  buscarContrato: (id: number) => Promise<ContratoWithCliente | null>;
}

const nf = (v: number | null | undefined) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })
    .format(Number(v ?? 0));

export function RecaudoForm({ onClose, onSubmit, buscarContrato }: RecaudoFormProps) {
  const isOnline = useOnlineStatus();
  const [contratoId, setContratoId] = useState('');
  const [contrato, setContrato] = useState<ContratoWithCliente | null>(null);
  const [buscando, setBuscando] = useState(false);
  const [monto, setMonto] = useState('');
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleBuscar = async () => {
    const id = parseInt(contratoId);
    if (isNaN(id) || id <= 0) {
      setError('Ingrese un número de contrato válido');
      return;
    }

    setBuscando(true);
    setError('');
    setContrato(null);

    try {
      const result = await buscarContrato(id);
      if (result) {
        setContrato(result);
      } else {
        setError('Contrato no encontrado');
      }
    } catch (e) {
      setError('Error al buscar contrato');
    } finally {
      setBuscando(false);
    }
  };

  const handleSubmit = async () => {
    if (!contrato) {
      setError('Debe buscar y seleccionar un contrato');
      return;
    }

    const montoNum = parseInt(monto.replace(/[^\d]/g, ''));
    if (isNaN(montoNum) || montoNum <= 0) {
      setError('Ingrese un monto válido');
      return;
    }

    if (!fecha) {
      setError('Ingrese una fecha');
      return;
    }

    setLoading(true);
    setError('');

    const result = await onSubmit({
      contrato_id: contrato.id,
      monto_recaudado: montoNum,
      fecha_recaudo: fecha,
      cuota_diaria_pactada: contrato.cuota_diaria,
      tipo_contrato: contrato.tipo_contrato,
    });

    setLoading(false);

    if (result.success) {
      onClose();
    } else {
      setError(result.error || 'Error al guardar');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-card w-full max-w-2xl rounded-xl shadow-2xl flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-slate-800">Nuevo Recaudo</h2>
          <div className="flex items-center gap-3">
            <span className={`flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full ${
              isOnline ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
            }`}>
              {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
              {isOnline ? 'Online' : 'Offline'}
            </span>
            <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {/* Buscar contrato */}
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Número de contrato"
              value={contratoId}
              onChange={e => { setContratoId(e.target.value); setContrato(null); setError(''); }}
              className="flex-1 px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
            <button
              onClick={handleBuscar}
              disabled={buscando}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              {buscando ? 'Buscando...' : 'Buscar'}
            </button>
          </div>

          {/* Contrato encontrado */}
          {contrato && (
            <div className="bg-slate-50 border border-border rounded-xl p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs text-slate-500 uppercase tracking-wider">Cliente</span>
                  <p className="font-semibold text-slate-800">{contrato.cliente?.nombres} {contrato.cliente?.apellidos}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-500 uppercase tracking-wider">Cédula</span>
                  <p className="font-medium text-slate-800">{contrato.cliente_cedula}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-slate-500 uppercase tracking-wider">Placa</span>
                  <p className="font-medium text-slate-700">{contrato.placa ?? '—'}</p>
                </div>
                <div>
                  <span className="text-xs text-slate-500 uppercase tracking-wider">Tipo</span>
                  <p className="font-medium text-slate-700">{contrato.tipo_contrato}</p>
                </div>
                <div>
                  <span className="text-xs text-slate-500 uppercase tracking-wider">Valor Contrato</span>
                  <p className="font-medium text-slate-700">{nf(contrato.valor_contrato)}</p>
                </div>
                <div>
                  <span className="text-xs text-slate-500 uppercase tracking-wider">Cuota Diaria</span>
                  <p className="font-medium text-green-600">{nf(contrato.cuota_diaria)}</p>
                </div>
              </div>

              <div className="pt-2 border-t border-border">
                {contrato.sin_datos_recientes ? (
                  <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm">Sin datos recientes offline. Saldo参考: {nf(contrato.valor_contrato)}</span>
                  </div>
                ) : (
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-500 uppercase tracking-wider">Saldo Pendiente</span>
                    <span className="font-bold text-primary text-lg">{nf(contrato.saldo_pendiente)}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Monto */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Monto a Recaudar</label>
            <input
              type="text"
              placeholder="$ 0"
              value={monto}
              onChange={e => setMonto(e.target.value)}
              className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          {/* Fecha */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Fecha de Recaudo</label>
            <input
              type="date"
              value={fecha}
              onChange={e => setFecha(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">{error}</div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border bg-slate-50 flex justify-end gap-3 rounded-b-xl">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-border text-slate-700 bg-white rounded-lg hover:bg-slate-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !contrato}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? 'Guardando...' : 'Guardar'}
          </button>
        </div>

      </div>
    </div>
  );
}