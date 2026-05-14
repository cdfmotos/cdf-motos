
import { DataTable } from '../../../../components/ui/DataTable';
import type { Column } from '../../../../components/ui/DataTable/types/types';
import type { GPS } from '../../../../db/schema';
import { Edit } from 'lucide-react';
import { formatDate } from '../../../../utils/formatters';

interface GpsTableProps {
  data: GPS[];
  loading: boolean;
  onEdit: (gps: GPS) => void;
}

export function GpsTable({ data, loading, onEdit }: GpsTableProps) {
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
      cell: (item) => (
        <div className="flex items-center gap-2">
          <button 
            onClick={() => onEdit(item)}
            className="p-1.5 text-primary hover:bg-primary/10 rounded transition-colors"
            title="Editar GPS"
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
        searchable={false} // El filtrado ya lo hace el componente superior
        pagination={true}
      />
    </div>
  );
}
