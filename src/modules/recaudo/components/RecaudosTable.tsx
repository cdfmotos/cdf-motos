import React, { useMemo, useState } from 'react';
import { DataTable } from '../../../components/ui/DataTable';
import type { Column } from '../../../components/ui/DataTable/types/types';
import type { Recaudo } from '../../../db/schema';
import { syncEngine } from '../../../db/sync/syncEngine';
import { useOnlineStatus } from '../../../hooks/useOnlineStatus';
import { useToast } from '../../../components/ui/Toast';
import { RefreshCw, Edit2, Printer } from 'lucide-react';

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
  onSyncSuccess?: () => void;
  onEdit?: (recaudo: Recaudo) => void;
  onPrint?: (recaudo: Recaudo) => void;
}

function RecaudosTableComponent({ recaudo, loading, onSyncSuccess, onEdit, onPrint }: RecaudosTableProps) {
  const { isOnline } = useOnlineStatus();
  const { addToast } = useToast();
  const [syncingId, setSyncingId] = useState<string | null>(null);

  const handleSync = async (row: Recaudo) => {
    const pk = row._local_id ?? String(row.id);
    if (!pk.startsWith('local-') && row._sync_status === 'synced') return;

    setSyncingId(pk);
    const ok = await syncEngine.sincronizarItem('recaudo', pk);
    setSyncingId(null);

    if (ok) {
      addToast('Recaudo sincronizado correctamente', 'success');
      onSyncSuccess?.();
    } else {
      addToast('Error al sincronizar. Se intentará automáticamente al reconectar.', 'error');
    }
  };

  const handlePrint = (row: Recaudo) => {
    onPrint?.(row);
  };

  const handleEdit = (row: Recaudo) => {
    onEdit?.(row);
  };

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
    {
      header: 'Acciones',
      accessorKey: 'id',
      sortable: false,
      cell: (row) => {
        const pk = row._local_id ?? String(row.id);
        const isPending = row._sync_status !== 'synced';
        const isSyncing = syncingId === pk;
        const canEdit = row._sync_status === 'pending';

        return (
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleSync(row)}
              disabled={!isOnline || !isPending || isSyncing}
              title={isPending ? 'Sincronizar ahora' : 'Ya sincronizado'}
              className={`p-1.5 rounded transition-colors ${
                isPending && isOnline && !isSyncing
                  ? 'text-blue-600 hover:bg-blue-50'
                  : 'text-slate-300 cursor-default'
              }`}
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={() => handleEdit(row)}
              disabled={!canEdit}
              title={canEdit ? 'Editar monto' : 'No editable (ya sincronizado)'}
              className={`p-1.5 rounded transition-colors ${
                canEdit
                  ? 'text-amber-600 hover:bg-amber-50'
                  : 'text-slate-300 cursor-default'
              }`}
            >
              <Edit2 className="w-4 h-4" />
            </button>

            <button
              onClick={() => handlePrint(row)}
              title="Imprimir recibo"
              className="p-1.5 rounded text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>
        );
      },
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