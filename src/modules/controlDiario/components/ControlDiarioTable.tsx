
import { DataTable } from '../../../components/ui/DataTable';
import type { Column } from '../../../components/ui/DataTable/types/types';
import type { Recaudo } from '../../../db/schema';
import { formatCurrency} from '../../../utils/formatters';

interface ControlDiarioTableProps {
  data: Recaudo[];
  loading: boolean;
}

export function ControlDiarioTable({ data, loading }: ControlDiarioTableProps) {
  const columns: Column<Recaudo>[] = [
    {
      header: 'N° Recaudo',
      accessorKey: 'numero_recaudo',
      cell: (item) => <span className="font-semibold text-slate-700">{item.numero_recaudo}</span>
    },
    {
      header: 'Contrato ID',
      accessorKey: 'contrato_id',
    },
    {
      header: 'Monto Recaudado',
      accessorKey: 'monto_recaudado',
      cell: (item) => <span className="text-green-600 font-medium">{formatCurrency(item.monto_recaudado)}</span>
    },
    {
      header: 'Saldo Pendiente',
      accessorKey: 'saldo_pendiente',
      cell: (item) => formatCurrency(item.saldo_pendiente)
    },
    {
      header: 'Nuevo Saldo',
      accessorKey: 'nuevo_saldo',
      cell: (item) => formatCurrency(item.nuevo_saldo)
    },
    {
      header: 'Tipo',
      accessorKey: 'tipo_contrato',
    },
    {
      header: 'Sincronización',
      accessorKey: '_sync_status',
      cell: (item) => (
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            item._sync_status === 'synced' ? 'bg-green-500' :
            item._sync_status === 'error' ? 'bg-red-500' : 'bg-yellow-500'
          }`} />
          <span className="text-xs text-slate-500 capitalize">
            {item._sync_status || 'synced'}
          </span>
        </div>
      ),
    }
  ];

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-xl shadow-sm p-8 text-center text-slate-500 animate-pulse">
        Cargando control diario...
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm flex flex-col">
      <DataTable 
        data={data} 
        columns={columns} 
        searchable={true}
        pagination={true}
      />
    </div>
  );
}
