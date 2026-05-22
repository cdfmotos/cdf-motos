import { DataTable } from '../../../components/ui/DataTable';
import { useVistaContratosAbonados } from '../hooks/useVistaContratosAbonados';
import { formatCurrency, formatDate } from '../../../utils/formatters';
import { OfflineMessage } from '../components/OnlineGate';
import { useOnlineStatus } from '../../../hooks/useOnlineStatus';
import type { Column } from '../../../components/ui/DataTable/types/types';
import type { Database } from '../../../types/database.types';
import { CheckCircle, XCircle } from 'lucide-react';

type Row = Database['public']['Views']['vista_contratos_abonados']['Row'];

export function ContratosAbonadosTab() {
  const isOnline = useOnlineStatus();
  const { data, loading, error } = useVistaContratosAbonados();

  if (!isOnline) return <OfflineMessage />;

  const columns: Column<Row>[] = [
    {
      header: 'Contrato',
      accessorKey: 'contrato_id',
      sortable: true,
      cell: (row) => row.contrato_id ?? '-',
    },
    {
      header: 'Placa',
      accessorKey: 'placa',
      sortable: true,
    },
    {
      header: 'Cédula',
      accessorKey: 'cliente_cedula',
      sortable: true,
    },
    {
      header: 'Estado',
      accessorKey: 'estado',
      sortable: true,
      cell: (row) => (
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
          row.estado === 'Activo' ? 'bg-green-100 text-green-700' :
          row.estado === 'Liquidado' ? 'bg-amber-100 text-amber-700' :
          'bg-slate-100 text-slate-700'
        }`}>
          {row.estado}
        </span>
      ),
    },
    {
      header: 'Abonado',
      accessorKey: 'tiene_abono',
      sortable: true,
      cell: (row) => row.tiene_abono ? (
        <span className="inline-flex items-center gap-1 text-green-600">
          <CheckCircle className="w-4 h-4" /> Sí
        </span>
      ) : (
        <span className="inline-flex items-center gap-1 text-red-500">
          <XCircle className="w-4 h-4" /> No
        </span>
      ),
    },
    {
      header: 'Valor',
      accessorKey: 'valor_contrato',
      sortable: true,
      cell: (row) => formatCurrency(row.valor_contrato ?? 0),
    },
    {
      header: 'Cuota',
      accessorKey: 'cuota_diaria',
      sortable: true,
      cell: (row) => formatCurrency(row.cuota_diaria ?? 0),
    },
    {
      header: 'Pagado',
      accessorKey: 'total_pagado',
      sortable: true,
      cell: (row) => formatCurrency(row.total_pagado ?? 0),
    },
    {
      header: 'Deuda Esp.',
      accessorKey: 'deuda_esperada',
      sortable: true,
      cell: (row) => formatCurrency(row.deuda_esperada ?? 0),
    },
    {
      header: 'Saldo Favor',
      accessorKey: 'saldo_a_favor',
      sortable: true,
      cell: (row) => (
        <span className={row.saldo_a_favor && row.saldo_a_favor > 0 ? 'text-green-600 font-medium' : ''}>
          {formatCurrency(row.saldo_a_favor ?? 0)}
        </span>
      ),
    },
    {
      header: 'Último Pago',
      accessorKey: 'ultima_fecha_pago',
      sortable: true,
      cell: (row) => row.ultima_fecha_pago ? formatDate(row.ultima_fecha_pago) : '-',
    },
  ];

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="bg-white border border-border rounded-xl p-5 shadow-sm">
        <h3 className="text-base font-semibold text-slate-700 mb-4">Contratos Abonados</h3>
        <DataTable<Row>
          data={data}
          columns={columns}
          searchable={true}
          searchPlaceholder="Buscar por placa, cédula o contrato..."
          pagination={true}
          defaultRowsPerPage={10}
          rowsPerPageOptions={[10, 20, 50, 100]}
          loading={loading}
        />
      </div>
    </div>
  );
}