import React, { useEffect, useState } from 'react';
import { X, Download, FileText, Wifi, WifiOff } from 'lucide-react';
import { getExtractoContrato, getExtractoContratoOnline } from '../services/extractoContrato';
import { descargarPDFExtractoContrato } from '../utils/exportExtracto';
import { db } from '../../../../db/db';
import { useOnlineStatus } from '../../../../hooks/useOnlineStatus';

interface ExtractoContratoDialogProps {
  open: boolean;
  onClose: () => void;
  contratoId: number | null;
}

// ── Formatters ───────────────────────────────────────────────────────────────
const nf = (v: number | string | null | undefined) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })
    .format(Number(v ?? 0));

const df = (v: Date | string | null | undefined) => {
  if (!v) return '—';
  const d = v instanceof Date ? v : new Date(v);
  return d.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

// ── Component ────────────────────────────────────────────────────────────────
export function ExtractoContratoDialog({ open, onClose, contratoId }: ExtractoContratoDialogProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generandoPDF, setGenerandoPDF] = useState(false);
  const isOnline = useOnlineStatus();

  useEffect(() => {
    if (!open || !contratoId) return;
    setLoading(true);
    setError('');
    setData(null);

    const fetchData = async () => {
      try {
        if (isOnline) {
          // Online: usar view de Supabase (más eficiente para grandes volúmenes)
          const result = await getExtractoContratoOnline(Number(contratoId));
          setData(result);
        } else {
          // Offline: calcular desde Dexie local
          const result = await getExtractoContrato(db, contratoId);
          setData(result);
        }
      } catch (e: any) {
        setError(e.message || String(e));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [open, contratoId, isOnline]);

  const handleDescargarPDF = async () => {
    if (!data) return;
    setGenerandoPDF(true);
    try {
      await descargarPDFExtractoContrato({
        logoPath: '/IMG-20230918-WA0110-picaai.png',
        contratoNum: data.contrato.id,
        nombres: data.cliente.nombres ?? '',
        apellidos: data.cliente.apellidos ?? '',
        cedula: data.contrato.cliente_cedula,
        placa: data.contrato.placa,
        cuotaDiariaPactada: data.recaudos[0]?.cuota_diaria_pactada ?? 0,
        fechaInicial: data.contrato.fecha_inicio,
        saldoALaFecha: data.saldoALaFecha,
        valorContrato: data.contrato.valor_contrato,
        listaRecaudos: data.recaudos,
        modo: 'open',
      });
    } finally {
      setGenerandoPDF(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4">
      <div className="bg-card w-full max-w-4xl rounded-xl shadow-2xl flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold text-slate-800">
              Extracto de Contrato {contratoId ? `#${contratoId}` : ''}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <span className={`flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full ${
              isOnline 
                ? 'bg-green-100 text-green-700' 
                : 'bg-amber-100 text-amber-700'
            }`}>
              {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
              {isOnline ? 'Online' : 'Offline'}
            </span>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-50/50">
          {loading && (
            <div className="py-12 text-center text-slate-500 animate-pulse">
              Cargando extracto...
            </div>
          )}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
              Error: {error}
            </div>
          )}

          {data && (
            <div className="space-y-6">
              {/* Resumen */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-primary/10 border border-primary/20 rounded-xl p-4">
                  <span className="block text-xs font-medium text-primary mb-1 uppercase tracking-wider">Saldo a la fecha</span>
                  <span className="block text-xl font-bold text-primary">{nf(data.saldoALaFecha)}</span>
                </div>
                <div className="bg-white border border-border rounded-xl p-4 shadow-sm">
                  <span className="block text-xs font-medium text-slate-500 mb-1 uppercase tracking-wider">Valor contrato</span>
                  <span className="block text-lg font-semibold text-slate-800">{nf(data.contrato.valor_contrato)}</span>
                </div>
                <div className="bg-white border border-border rounded-xl p-4 shadow-sm">
                  <span className="block text-xs font-medium text-slate-500 mb-1 uppercase tracking-wider">% Recaudado</span>
                  <span className="block text-lg font-semibold text-slate-800">{data.porcentajeRecaudado}%</span>
                </div>
                <div className="bg-white border border-border rounded-xl p-4 shadow-sm">
                  <span className="block text-xs font-medium text-slate-500 mb-1 uppercase tracking-wider">Cliente</span>
                  <span className="block text-sm font-semibold text-slate-800 truncate" title={`${data.cliente.nombres} ${data.cliente.apellidos}`}>
                    {data.cliente.nombres} {data.cliente.apellidos}
                  </span>
                </div>
              </div>

              {/* Barra de progreso */}
              <div className="bg-slate-200 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-primary h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(data.porcentajeRecaudado, 100)}%` }}
                />
              </div>

              {/* Tabla */}
              <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-500 bg-slate-50 border-b border-border">
                      <tr>
                        <th className="px-4 py-3 font-medium">Placa</th>
                        <th className="px-4 py-3 font-medium">N° Recaudo</th>
                        <th className="px-4 py-3 font-medium">Monto Recaudado</th>
                        <th className="px-4 py-3 font-medium">Cuota Diaria</th>
                        <th className="px-4 py-3 font-medium">Fecha Recaudo</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {data.recaudos.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                            Sin recaudos registrados
                          </td>
                        </tr>
                      ) : (
                        data.recaudos.map((r: any) => (
                          <tr key={r.id_recaudo} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-4 py-3 font-medium text-slate-700">{r.placa ?? '—'}</td>
                            <td className="px-4 py-3 text-slate-600">{r.numero_recaudo}</td>
                            <td className="px-4 py-3 font-medium text-green-600">{nf(r.monto_recaudado)}</td>
                            <td className="px-4 py-3 text-slate-600">{nf(r.cuota_diaria_pactada)}</td>
                            <td className="px-4 py-3 text-slate-600">{df(r.fecha_recaudo)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border bg-slate-50 flex justify-end gap-3 rounded-b-xl">
          <button 
            onClick={onClose}
            className="px-4 py-2 border border-border text-slate-700 bg-white rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium"
          >
            Cerrar
          </button>
          {data && (
            <button 
              onClick={handleDescargarPDF}
              disabled={generandoPDF}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium disabled:opacity-70"
            >
              <Download className="w-4 h-4" />
              {generandoPDF ? 'Generando PDF...' : 'Descargar PDF'}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
