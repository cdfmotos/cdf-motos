import { DataTable } from '../../../../components/ui/DataTable';
import { Badge } from '../../../../components/ui/Badge';
import { Edit2, FileText, CloudUpload, Loader2 } from 'lucide-react';
import type { Contrato } from '../../../../db/schema';
import { formatCurrency } from '../../../../utils/formatters';
import { useOnlineStatus } from '../../../../hooks/useOnlineStatus';
import { useState } from 'react';

interface ContratosTableProps {
  data: Contrato[];
  loading: boolean;
  onEdit: (contrato: Contrato) => void;
  onExtracto: (contrato: Contrato) => void;
  onSync?: (id: number) => Promise<boolean>;
  canEdit?: boolean;
}

export function ContratosTable({ data, loading, onEdit, onExtracto, onSync, canEdit = false }: ContratosTableProps) {
  const { isOnline } = useOnlineStatus();
  const [syncingIds, setSyncingIds] = useState<Set<number | string>>(new Set());

  const getEstadoBadge = (estado: string | null) => {
    switch (estado?.toLowerCase()) {
      case 'activo':
        return <Badge variant="success">Activo</Badge>;
      case 'liquidado':
      case 'termino':
        return <Badge variant="secondary">{estado}</Badge>;
      case 'bodega':
      case 'fiscalia':
      case 'paradenuncio':
      case 'robada':
        return <Badge variant="warning">{estado}</Badge>;
      default:
        return <Badge variant="secondary">{estado || 'N/A'}</Badge>;
    }
  };

  const columns = [
    {
      header: 'N° Contrato',
      accessorKey: 'id',
    },
    {
      header: 'Tipo',
      accessorKey: 'tipo_contrato',
    },
    {
      header: 'Placa',
      accessorKey: 'placa',
      cell: (item: Contrato) => item.placa || '-',
    },
    {
      header: 'Cédula',
      accessorKey: 'cliente_cedula',
      cell: (item: Contrato) => item.cliente_cedula || '-',
    },
    {
      header: 'Valor Contrato',
      accessorKey: 'valor_contrato',
      cell: (item: Contrato) => formatCurrency(item.valor_contrato),
    },
    {
      header: 'Cuota Diaria',
      accessorKey: 'cuota_diaria',
      cell: (item: Contrato) => formatCurrency(item.cuota_diaria),
    },
    {
      header: 'Fecha Inicio',
      accessorKey: 'fecha_inicio',
    },
    {
      header: 'Estado',
      accessorKey: 'estado',
      cell: (item: Contrato) => getEstadoBadge(item.estado),
    },
    {
      header: 'Sincronización',
      accessorKey: '_sync_status',
      cell: (item: Contrato) => (
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
    },
    {
      header: 'Acciones',
      accessorKey: 'actions',
      cell: (item: Contrato) => (
        <div className="flex items-center gap-2">
          {onSync && item._sync_status !== 'synced' && (
            <button
              onClick={async (e) => {
                e.stopPropagation();
                if (!onSync || !isOnline) return;
                setSyncingIds(prev => new Set(prev).add(item.id));
                try {
                  await onSync(item.id);
                } finally {
                  setSyncingIds(prev => {
                    const next = new Set(prev);
                    next.delete(item.id);
                    return next;
                  });
                }
              }}
              disabled={!isOnline || syncingIds.has(item.id)}
              className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
              title="Sincronizar"
            >
              {syncingIds.has(item.id) ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CloudUpload className="w-4 h-4" />
              )}
            </button>
          )}
          <button
            onClick={() => onExtracto(item)}
            className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
            title="Ver Extracto"
          >
            <FileText className="w-4 h-4" />
          </button>
          <button
            onClick={() => canEdit && onEdit(item)}
            className={`p-1.5 rounded transition-colors ${canEdit ? 'text-slate-400 hover:text-primary hover:bg-primary/10' : 'text-slate-300 cursor-not-allowed'}`}
            title={canEdit ? 'Editar contrato' : 'Solo Admin puede editar'}
          >
            <Edit2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <DataTable
      data={data}
      columns={columns}
      loading={loading}
      pagination={true}
    />
  );
}
