import { useState, useEffect } from 'react';
import { X, Download, FileSpreadsheet } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { formatCurrency } from '../utils/formatters';
import { exportarReporteRecaudosExcel } from '../utils/exportReporteRecaudos';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import type { Database } from '../types/database.types';

type VistaReportePendientes = Database['public']['Views']['vista_reporte_pendientes']['Row'];

interface ReporteRecaudosModalProps {
  open: boolean;
  onClose: () => void;
}

export function ReporteRecaudosModal({ open, onClose }: ReporteRecaudosModalProps) {
  const isOnline = useOnlineStatus();
  const [data, setData] = useState<VistaReportePendientes[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    if (!isOnline) {
      setError('Esta función requiere conexión a internet');
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      const { data: rows, error: err } = await supabase
        .from('vista_reporte_pendientes')
        .select('*');

      setLoading(false);
      if (err) {
        setError(err.message);
      } else {
        setData(rows || []);
      }
    };

    fetchData();
  }, [open, isOnline]);

  if (!open) return null;

  const handleExport = () => {
    if (data.length > 0) {
      exportarReporteRecaudosExcel(data);
    }
  };

  const columns = [
    { key: 'contrato_numero', label: 'Contrato #' },
    { key: 'placa', label: 'Placa' },
    { key: 'cliente', label: 'Cliente' },
    { key: 'cuota_diaria', label: 'Cuota Diaria' },
    { key: 'valor_contrato', label: 'Valor Contrato' },
    { key: 'saldo_pendiente', label: 'Saldo Pendiente' },
    { key: 'tipo_contrato', label: 'Tipo Contrato' },
  ];

  const formatValue = (key: string, value: any) => {
    if (key === 'placa') return value || 'N/A';
    if (['cuota_diaria', 'valor_contrato', 'saldo_pendiente'].includes(key)) {
      return formatCurrency(value || 0);
    }
    return value || '-';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-5xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-slate-800">Reporte de Recaudos</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-slate-100 text-slate-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 overflow-hidden flex flex-col h-[calc(90vh-70px)]">
          <div className="flex justify-end mb-4">
            <button
              onClick={handleExport}
              disabled={loading || data.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            >
              <Download className="w-4 h-4" />
              Generar Excel
            </button>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm mb-4">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-12 text-slate-500">Cargando...</div>
          ) : data.length === 0 ? (
            <div className="flex justify-center py-12 text-slate-500">Sin datos disponibles</div>
          ) : (
            <div className="flex-1 overflow-auto">
              <table className="w-full text-sm text-left text-slate-600">
                <thead className="text-xs text-slate-700 uppercase bg-slate-50 border-b border-border sticky top-0">
                  <tr>
                    {columns.map((col) => (
                      <th key={col.key} className="px-4 py-3 font-semibold">
                        {col.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.map((row, idx) => (
                    <tr key={idx} className="bg-white border-b border-border hover:bg-slate-50/50">
                      {columns.map((col) => (
                        <td key={col.key} className="px-4 py-3 whitespace-nowrap">
                          {formatValue(col.key, row[col.key as keyof VistaReportePendientes])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-4 text-sm text-slate-500">
            Total de registros: {data.length}
          </div>
        </div>
      </div>
    </div>
  );
}