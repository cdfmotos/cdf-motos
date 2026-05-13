import { DollarSign, TrendingDown, PiggyBank } from 'lucide-react';
import { DataTable } from '../../../components/ui/DataTable';
import { useVistaControlEfectivoListado } from '../hooks/useVistaControlEfectivoListado';
import { formatCurrency } from '../../../utils/formatters';
import { OfflineMessage } from '../components/OnlineGate';
import { useOnlineStatus } from '../../../hooks/useOnlineStatus';
import type { Column } from '../../../components/ui/DataTable/types/types';
import type { Database } from '../../../types/database.types';

type Row = Database['public']['Views']['vista_control_efectivo']['Row'];

export function ResumenDiarioTab() {
  const isOnline = useOnlineStatus();
  const { data, loading, error } = useVistaControlEfectivoListado();

  if (!isOnline) return <OfflineMessage />;

  const ultimo = data[0];
  const recaudo = ultimo?.recaudo_alcanzado ?? 0;
  const gastos = ultimo?.gastos_diario ?? 0;
  const saldo = ultimo?.saldo_acumulado ?? 0;

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
      header: 'Recaudo Alcanzado',
      accessorKey: 'recaudo_alcanzado',
      sortable: true,
      cell: (row) => formatCurrency(row.recaudo_alcanzado ?? 0),
    },
    {
      header: 'Gastos Diario',
      accessorKey: 'gastos_diario',
      sortable: true,
      cell: (row) => formatCurrency(row.gastos_diario ?? 0),
    },
    {
      header: 'Saldo Acumulado',
      accessorKey: 'saldo_acumulado',
      sortable: true,
      cell: (row) => formatCurrency(row.saldo_acumulado ?? 0),
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
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Recaudo Alcanzado</p>
            <p className="text-xl font-bold text-slate-800">{formatCurrency(recaudo)}</p>
          </div>
        </div>

        <div className="bg-white border border-border rounded-xl p-5 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-red-50 text-red-600 rounded-lg">
            <TrendingDown className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Gastos Diario</p>
            <p className="text-xl font-bold text-slate-800">{formatCurrency(gastos)}</p>
          </div>
        </div>

        <div className="bg-white border border-border rounded-xl p-5 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <PiggyBank className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Saldo Acumulado</p>
            <p className="text-xl font-bold text-slate-800">{formatCurrency(saldo)}</p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-border rounded-xl p-5 shadow-sm">
        <h3 className="text-base font-semibold text-slate-700 mb-4">Histórico</h3>
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