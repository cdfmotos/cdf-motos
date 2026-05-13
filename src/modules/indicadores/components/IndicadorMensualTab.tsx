import { TrendingUp, Target, Percent } from 'lucide-react';
import { DataTable } from '../../../components/ui/DataTable';
import { useVistaIndicadoresMensuales } from '../hooks/useVistaIndicadoresMensuales';
import { formatCurrency } from '../../../utils/formatters';
import { OfflineMessage } from '../components/OnlineGate';
import { useOnlineStatus } from '../../../hooks/useOnlineStatus';
import type { Column } from '../../../components/ui/DataTable/types/types';
import type { Database } from '../../../types/database.types';

type Row = Database['public']['Views']['view_indicadores_mensuales']['Row'];

export function IndicadorMensualTab() {
  const isOnline = useOnlineStatus();
  const { data, loading, error } = useVistaIndicadoresMensuales();

  if (!isOnline) return <OfflineMessage />;

  const ultimo = data[0];
  const recaudoAcumulado = ultimo?.recaudo_acumulado ?? 0;
  const recaudoEsperado = ultimo?.recaudo_esperado_acumulado ?? 0;
  const porcentaje = ultimo?.porcentaje_alcanzado ?? 0;

  const columns: Column<Row>[] = [
    {
      header: 'Fecha',
      accessorKey: 'fecha',
      sortable: true,
      cell: (row) => {
        if (!row.fecha) return '-';
        const d = new Date(row.fecha);
        return d.toLocaleDateString('es-CO');
      },
    },
    {
      header: 'Recaudo Acumulado',
      accessorKey: 'recaudo_acumulado',
      sortable: true,
      cell: (row) => formatCurrency(row.recaudo_acumulado ?? 0),
    },
    {
      header: 'Recaudo Esperado Acumulado',
      accessorKey: 'recaudo_esperado_acumulado',
      sortable: true,
      cell: (row) => formatCurrency(row.recaudo_esperado_acumulado ?? 0),
    },
    {
      header: '% Alcanzado',
      accessorKey: 'porcentaje_alcanzado',
      sortable: true,
      cell: (row) => `${(row.porcentaje_alcanzado ?? 0).toFixed(1)}%`,
    },
  ];

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-border rounded-xl p-5 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-green-50 text-green-600 rounded-lg">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Recaudo Acumulado</p>
            <p className="text-xl font-bold text-slate-800">{formatCurrency(recaudoAcumulado)}</p>
          </div>
        </div>

        <div className="bg-white border border-border rounded-xl p-5 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Recaudo Esperado Acumulado</p>
            <p className="text-xl font-bold text-slate-800">{formatCurrency(recaudoEsperado)}</p>
          </div>
        </div>

        <div className="bg-white border-2 border-primary rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <Percent className="w-5 h-5 text-primary" />
            <p className="text-sm font-medium text-slate-500">% Alcanzado</p>
          </div>
          <p className="text-3xl font-bold text-primary">{porcentaje.toFixed(1)}%</p>
        </div>
      </div>

      <div className="bg-white border border-border rounded-xl p-5 shadow-sm">
        <h3 className="text-base font-semibold text-slate-700 mb-4">Histórico Mensual</h3>
        <DataTable<Row>
          data={data}
          columns={columns}
          searchable={false}
          pagination={true}
          defaultRowsPerPage={10}
          rowsPerPageOptions={[5, 10, 20, 50]}
          loading={loading}
        />
      </div>
    </div>
  );
}