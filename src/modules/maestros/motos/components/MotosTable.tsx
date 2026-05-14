import { useState } from 'react';
import { DataTable } from '../../../../components/ui/DataTable';
import type { Column } from '../../../../components/ui/DataTable/types/types';
import type { Moto } from '../../../../db/schema';
import { Edit, FileText, CloudUpload, Loader2, Trash2 } from 'lucide-react';
import { formatDate } from '../../../../utils/formatters';
import { useOnlineStatus } from '../../../../hooks/useOnlineStatus';

interface MotosTableProps {
  data: Moto[];
  loading: boolean;
  onEdit: (moto: Moto) => void;
  onDelete: (moto: Moto) => void;
  onExtracto: (moto: Moto) => void;
  onSync: (moto: Moto) => Promise<boolean>;
}

export function MotosTable({ data, loading, onEdit, onDelete, onExtracto, onSync }: MotosTableProps) {
  const isOnline = useOnlineStatus();
  const [syncingId, setSyncingId] = useState<number | null>(null);

  const handleSync = async (moto: Moto) => {
    if (!isOnline) return;
    setSyncingId(moto.id);
    await onSync(moto);
    setSyncingId(null);
  };
  const columns: Column<Moto>[] = [
    {
      header: 'Fecha Compra',
      accessorKey: 'fecha_compra',
      cell: (item) => item.fecha_compra ? formatDate(item.fecha_compra) : 'N/A'
    },
    {
      header: 'Marca',
      accessorKey: 'marca',
    },
    {
      header: 'Placa',
      accessorKey: 'placa',
      cell: (item) => <span className="font-semibold text-slate-700">{item.placa}</span>
    },
    {
      header: 'Modelo',
      accessorKey: 'modelo',
    },
    {
      header: 'Año',
      accessorKey: 'anio',
    },
    {
      header: 'Color',
      accessorKey: 'color',
    },
    {
      header: 'Motor / Chasis',
      accessorKey: 'motor',
      cell: (item) => (
        <div className="text-xs">
          <div><span className="text-slate-400">M:</span> {item.motor || '-'}</div>
          <div><span className="text-slate-400">V:</span> {item.chasis_vin || '-'}</div>
        </div>
      )
    },
    {
      header: 'Propietario',
      accessorKey: 'propietario',
    },
    {
          header: 'Sincronización',
          accessorKey: '_sync_status',
          cell: (item: Moto) => (
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
          {item._sync_status === 'pending' && (
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
            onClick={() => onEdit(item)}
            className="p-1.5 text-primary hover:bg-primary/10 rounded transition-colors"
            title="Editar Moto"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button 
            onClick={() => onDelete(item)}
            className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"
            title="Eliminar Moto"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button 
            onClick={() => onExtracto(item)}
            className="p-1.5 text-blue-500 hover:bg-blue-50 rounded transition-colors"
            title="Ver Extracto"
          >
            <FileText className="w-4 h-4" />
          </button>
        </div>
      )
    },
  ];

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-xl shadow-sm p-8 text-center text-slate-500 animate-pulse">
        Cargando listado de motos...
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
