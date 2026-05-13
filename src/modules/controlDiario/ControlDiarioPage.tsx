import React, { useMemo } from 'react';
import { useControlDiario } from './hooks/useControlDiario';
import { ControlDiarioTable } from './components/ControlDiarioTable';
import { RefreshCcw, DollarSign, FileText } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export function ControlDiarioPage() {
  const { recaudosHoy, loading, error, reload } = useControlDiario();

  // Calcular KPIs del día
  const kpis = useMemo(() => {
    const totalMonto = recaudosHoy.reduce((acc, r) => acc + (Number(r.monto_recaudado) || 0), 0);
    return {
      totalRecaudado: totalMonto,
      totalRegistros: recaudosHoy.length,
    };
  }, [recaudosHoy]);

  return (
    <div className="flex flex-col min-h-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Control Diario</h1>
          <p className="text-sm text-slate-500">Resumen de recaudos registrados el día de hoy</p>
        </div>
        <button 
          onClick={reload}
          className="flex items-center gap-2 px-3 py-2 border border-border text-slate-600 bg-white rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium"
          title="Recargar datos"
        >
          <RefreshCcw className="w-4 h-4" />
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
          {error}
        </div>
      )}

      {/* Tarjetas de KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="bg-white border border-border rounded-xl p-5 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-green-50 text-green-600 rounded-lg">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Recaudado Hoy</p>
            <p className="text-2xl font-bold text-slate-800">{formatCurrency(kpis.totalRecaudado)}</p>
          </div>
        </div>

        <div className="bg-white border border-border rounded-xl p-5 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Registros Procesados</p>
            <p className="text-2xl font-bold text-slate-800">{kpis.totalRegistros}</p>
          </div>
        </div>
      </div>

      {/* Tabla Informativa */}
      <ControlDiarioTable 
        data={recaudosHoy} 
        loading={loading} 
      />
    </div>
  );
}
