import React, { useMemo } from 'react';
import { DataTable } from '../../../components/ui/DataTable';
import type { Column } from '../../../components/ui/DataTable/types/types';
import type { Recaudo } from '../../../db/schema';

const nf = (v: number | null | undefined) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })
    .format(Number(v ?? 0));

const df = (v: string | null | undefined) => {
  if (!v) return '—';
  return new Date(v).toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

interface RecaudosTableProps {
  recaudo: Recaudo[];
  loading: boolean;
}

function RecaudosTableComponent({ recaudo, loading }: RecaudosTableProps) {
  const columns: Column<Recaudo>[] = useMemo(() => [
    {
      header: 'ID',
      accessorKey: 'id',
      sortable: true,
    },
    {
      header: 'Contrato',
      accessorKey: 'contrato_id',
      sortable: true,
      cell: (row) => <span className="font-medium text-slate-800">{row.contrato_id}</span>,
    },
    {
      header: 'N° Recaudo',
      accessorKey: 'numero_recaudo',
      sortable: true,
    },
    {
      header: 'Monto',
      accessorKey: 'monto_recaudado',
      sortable: true,
      cell: (row) => <span className="font-medium text-green-600">{nf(row.monto_recaudado)}</span>,
    },
    {
      header: 'Fecha',
      accessorKey: 'fecha_recaudo',
      sortable: true,
      cell: (row) => df(row.fecha_recaudo),
    },
    {
      header: 'Saldo Pendiente',
      accessorKey: 'saldo_pendiente',
      sortable: true,
      cell: (row) => nf(row.saldo_pendiente),
    },
    {
      header: 'Nuevo Saldo',
      accessorKey: 'nuevo_saldo',
      sortable: true,
      cell: (row) => <span className="font-medium text-slate-800">{nf(row.nuevo_saldo)}</span>,
    },
    {
      header: 'Estado',
      accessorKey: '_sync_status',
      sortable: true,
      cell: (row) => (
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
          row._sync_status === 'synced' 
            ? 'bg-green-100 text-green-700' 
            : row._sync_status === 'pending'
            ? 'bg-amber-100 text-amber-700'
            : 'bg-red-100 text-red-700'
        }`}>
          {row._sync_status === 'synced' ? 'Sincronizado' : row._sync_status === 'pending' ? 'Pendiente' : 'Error'}
        </span>
      ),
    },
  ], []);

  return (
    <DataTable
      data={recaudo}
      columns={columns}
      searchable={false}
      pagination={true}
      defaultRowsPerPage={10}
      loading={loading}
    />
  );
}

export const RecaudosTable = React.memo(RecaudosTableComponent);