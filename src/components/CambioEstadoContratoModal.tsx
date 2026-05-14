import { useState } from 'react';
import { X, Search, Save, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { formatCurrency } from '../utils/formatters';
import type { Database } from '../types/database.types';

type VistaContratos = Database['public']['Views']['vista_contratos']['Row'];

interface CambioEstadoContratoModalProps {
  open: boolean;
  onClose: () => void;
}

const ESTADOS = [
  { value: 'Bodega', label: 'Bodega' },
  { value: 'Fiscalia', label: 'Fiscalía' },
  { value: 'Liquidado', label: 'Liquidado' },
  { value: 'ParaDenuncio', label: 'Para Denuncio' },
  { value: 'Robada', label: 'Robada' },
  { value: 'Termino', label: 'Término' },
  { value: 'Activo', label: 'Activo' },
];

export function CambioEstadoContratoModal({ open, onClose }: CambioEstadoContratoModalProps) {
  const [contratoId, setContratoId] = useState('');
  const [contrato, setContrato] = useState<VistaContratos | null>(null);
  const [nuevoEstado, setNuevoEstado] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!open) return null;

  const handleBuscar = async () => {
    if (!contratoId.trim()) return;
    
    setLoadingSearch(true);
    setError(null);
    setSuccess(null);
    setContrato(null);
    setNuevoEstado('');

    const idNum = parseInt(contratoId, 10);
    if (isNaN(idNum)) {
      setError('Ingrese un ID de contrato válido');
      setLoadingSearch(false);
      return;
    }

    const { data, error: err } = await supabase
      .from('vista_contratos')
      .select('*')
      .eq('id', idNum)
      .maybeSingle();

    setLoadingSearch(false);

    if (err) {
      setError(err.message);
    } else if (data) {
      setContrato(data);
    } else {
      setError('No se encontró un contrato con ese ID');
    }
  };

  const handleGuardar = async () => {
    if (!contrato || !nuevoEstado || contrato.id === null) return;

    setLoading(true);
    setError(null);

    const estadoLabel = ESTADOS.find(e => e.value === nuevoEstado)?.label || nuevoEstado;

    try {
      const { error: updateError } = await supabase
        .from('contratos')
        .update({ estado: nuevoEstado })
        .eq('id', contrato.id);

      if (updateError) {
        setError(updateError.message);
        setLoading(false);
        return;
      }

      const { error: insertError } = await supabase
        .from('notificaciones')
        .insert({
          contrato_id: contrato.id,
          tipo: nuevoEstado,
          mensaje: `El contrato N° ${contrato.id}, ha cambiado de estado a ${estadoLabel}`,
        });

      if (insertError) {
        setError(insertError.message);
        setLoading(false);
        return;
      }

      setSuccess('Estado actualizado correctamente');
      setContrato(null);
      setContratoId('');
      setNuevoEstado('');
    } catch (err) {
      setError('Error al actualizar el estado');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setContratoId('');
    setContrato(null);
    setNuevoEstado('');
    setError(null);
    setSuccess(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-slate-800">Cambiar Estado de Contrato</h2>
          <button
            onClick={handleClose}
            className="p-1 rounded hover:bg-slate-100 text-slate-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(90vh-130px)]">
          {!contrato && (
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  ID de Contrato
                </label>
                <input
                  type="number"
                  value={contratoId}
                  onChange={(e) => setContratoId(e.target.value)}
                  placeholder="Ingrese el ID del contrato"
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  onKeyDown={(e) => e.key === 'Enter' && handleBuscar()}
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={handleBuscar}
                  disabled={loadingSearch || !contratoId.trim()}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                >
                  <Search className="w-4 h-4" />
                  Buscar
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 text-green-600 rounded-lg text-sm">
              <CheckCircle className="w-4 h-4 shrink-0" />
              {success}
            </div>
          )}

          {contrato && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-slate-500">Tipo Contrato</p>
                  <p className="font-medium text-slate-800">{contrato.tipo_contrato || '-'}</p>
                </div>
                <div>
                  <p className="text-slate-500">Cuota Diaria</p>
                  <p className="font-medium text-slate-800">{formatCurrency(contrato.cuota_diaria || 0)}</p>
                </div>
                {contrato.tipo_contrato === 'Moto' && (
                  <div>
                    <p className="text-slate-500">Placa</p>
                    <p className="font-medium text-slate-800">{contrato.placa || '-'}</p>
                  </div>
                )}
                <div>
                  <p className="text-slate-500">Nombres</p>
                  <p className="font-medium text-slate-800">{contrato.nombres || '-'}</p>
                </div>
                <div>
                  <p className="text-slate-500">Apellidos</p>
                  <p className="font-medium text-slate-800">{contrato.apellidos || '-'}</p>
                </div>
                <div>
                  <p className="text-slate-500">Cédula</p>
                  <p className="font-medium text-slate-800">{contrato.cliente_cedula || '-'}</p>
                </div>
                <div>
                  <p className="text-slate-500">Valor Contrato</p>
                  <p className="font-medium text-slate-800">{formatCurrency(contrato.valor_contrato || 0)}</p>
                </div>
                <div>
                  <p className="text-slate-500">Nuevo Saldo</p>
                  <p className="font-medium text-slate-800">{formatCurrency(contrato.nuevo_saldo || 0)}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-slate-500">Estado Actual</p>
                  <p className="font-medium text-slate-800">{contrato.estado || '-'}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Nuevo Estado
                </label>
                <select
                  value={nuevoEstado}
                  onChange={(e) => setNuevoEstado(e.target.value)}
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="">Seleccione un estado</option>
                  {ESTADOS.map((estado) => (
                    <option key={estado.value} value={estado.value}>
                      {estado.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => { setContrato(null); setNuevoEstado(''); }}
                  className="flex-1 px-4 py-2 border border-border text-slate-600 rounded-lg hover:bg-slate-50 text-sm font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleGuardar}
                  disabled={loading || !nuevoEstado}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                >
                  <Save className="w-4 h-4" />
                  Guardar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}