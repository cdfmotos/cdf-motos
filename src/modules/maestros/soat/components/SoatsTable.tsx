
import { useState } from 'react';
import { DataTable } from '../../../../components/ui/DataTable';
import type { Column } from '../../../../components/ui/DataTable/types/types';
import type { Soat } from '../../../../db/schema';
import { Edit, CloudUpload, Loader2 } from 'lucide-react';
import { formatDate } from '../../../../utils/formatters';
import { useOnlineStatus } from '../../../../hooks/useOnlineStatus';

interface SoatsTableProps {
  data: Soat[];
  loading: boolean;
  onEdit: (soat: Soat) => void;
  onSync: (soat: Soat) => Promise<boolean>;
  canEdit?: boolean;
}

export function SoatsTable({ data, loading, onEdit, onSync, canEdit = false }: SoatsTableProps) {
  const { isOnline } = useOnlineStatus();
  const [syncingId, setSyncingId] = useState<number | null>(null);

  const handleSync = async (soat: Soat) => {
    if (!isOnline) return;
    setSyncingId(soat.id);
    await onSync(soat);
    setSyncingId(null);
  };

  const columns: Column<Soat>[] = [
    {
      header: 'Placa Moto',
      accessorKey: 'moto_placa',
      cell: (item) => <span className="font-bold text-slate-700">{item.moto_placa}</span>
    },
    {
      header: 'N° de SOAT',
      accessorKey: 'no_soat',
      cell: (item) => <span className="font-mono text-sm text-slate-600">{item.no_soat}</span>
    },
    {
      header: 'Fecha Vencimiento',
      accessorKey: 'fecha_vencimiento',
      cell: (item) => {
        if (!item.fecha_vencimiento) return 'N/A';
        const isVencido = new Date(item.fecha_vencimiento) < new Date();
        const isProximo = new Date(item.fecha_vencimiento).getTime() - new Date().getTime() < 30 * 24 * 60 * 60 * 1000 && !isVencido;

        return (
          <span className={`px-2 py-1 rounded-md text-xs font-medium ${
            isVencido ? 'bg-red-100 text-red-700' :
            isProximo ? 'bg-yellow-100 text-yellow-700' :
            'bg-green-100 text-green-700'
          }`}>
            {formatDate(item.fecha_vencimiento)}
          </span>
        );
      }
    },
    {
      header: 'Sincronización',
      accessorKey: '_sync_status',
      cell: (item: Soat) => (
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
      accessorKey: 'id',
      sortable: false,
      cell: (item: Soat) => (
        <div className="flex items-center gap-2">
          {item._sync_status !== 'synced' && (
            <button
              onClick={() => handleSync(item)}
              disabled={!isOnline || syncingId === item.id}
              className={`p-1.5 rounded transition-colors ${
                !isOnline
                  ? 'text-slate-400 opacity-50 cursor-not-allowed'
                  : 'text-amber-500 hover:bg-amber-50'
              }`}
              title={!isOnline ? 'Sin conexión' : 'Sincronizar'}
            >
              {syncingId === item.id ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CloudUpload className="w-4 h-4" />
              )}
            </button>
          )}
          <button
            onClick={() => canEdit && onEdit(item)}
            className={`p-1.5 rounded transition-colors ${canEdit ? 'text-primary hover:bg-primary/10' : 'text-slate-300 cursor-not-allowed'}`}
            title={canEdit ? 'Editar SOAT' : 'Solo Admin puede editar'}
          >
            <Edit className="w-4 h-4" />
          </button>
        </div>
      )
    },
  ];

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-xl shadow-sm p-8 text-center text-slate-500 animate-pulse">
        Cargando listado de SOATs...
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm flex flex-col">
      <DataTable
        data={data}
        columns={columns}
        searchable={false}
        pagination={true}
      />
    </div>
  );
}
