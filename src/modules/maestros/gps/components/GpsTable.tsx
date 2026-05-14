
import { useState } from 'react';
import { DataTable } from '../../../../components/ui/DataTable';
import type { Column } from '../../../../components/ui/DataTable/types/types';
import type { GPS } from '../../../../db/schema';
import { Edit, CloudUpload, Loader2 } from 'lucide-react';
import { formatDate } from '../../../../utils/formatters';
import { useOnlineStatus } from '../../../../hooks/useOnlineStatus';

interface GpsTableProps {
  data: GPS[];
  loading: boolean;
  onEdit: (gps: GPS) => void;
  onSync: (gps: GPS) => Promise<boolean>;
  canEdit?: boolean;
}

export function GpsTable({ data, loading, onEdit, onSync, canEdit = false }: GpsTableProps) {
  const { isOnline } = useOnlineStatus();
  const [syncingId, setSyncingId] = useState<number | null>(null);

  const handleSync = async (gps: GPS) => {
    if (!isOnline) return;
    setSyncingId(gps.id);
    await onSync(gps);
    setSyncingId(null);
  };

  const columns: Column<GPS>[] = [
    {
      header: 'Placa Moto',
      accessorKey: 'moto_placa',
      cell: (item) => <span className="font-bold text-slate-700">{item.moto_placa}</span>
    },
    {
      header: 'IMEI',
      accessorKey: 'gps_imei',
      cell: (item) => <span className="font-mono text-sm text-slate-600">{item.gps_imei}</span>
    },
    {
      header: 'Simcard',
      accessorKey: 'simcard',
      cell: (item) => item.simcard || <span className="text-slate-400 italic">No registrada</span>
    },
    {
      header: 'Fecha Registro',
      accessorKey: 'created_at',
      cell: (item) => item.created_at ? formatDate(item.created_at) : 'N/A'
    },
    {
      header: 'Sincronización',
      accessorKey: '_sync_status',
      cell: (item: GPS) => (
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
      cell: (item: GPS) => (
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
            title={canEdit ? 'Editar GPS' : 'Solo Admin puede editar'}
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
        Cargando listado de dispositivos GPS...
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
