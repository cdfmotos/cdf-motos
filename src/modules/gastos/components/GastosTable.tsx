import { useState } from 'react';
import { DataTable } from '../../../components/ui/DataTable';
import type { Column } from '../../../components/ui/DataTable/types/types';
import type { Gasto } from '../../../db/schema';
import { Edit, Trash2, CloudUpload, Loader2 } from 'lucide-react';
import { formatCurrency, formatDate } from '../../../utils/formatters';
import { useOnlineStatus } from '../../../hooks/useOnlineStatus';

interface GastosTableProps {
  data: Gasto[];
  loading: boolean;
  onEdit: (gasto: Gasto) => void;
  onDelete: (gasto: Gasto) => void;
  onSync: (gasto: Gasto) => Promise<boolean>;
}

export function GastosTable({ data, loading, onEdit, onDelete, onSync }: GastosTableProps) {
  const isOnline = useOnlineStatus();
  const [syncingId, setSyncingId] = useState<number | null>(null);

  const handleSync = async (gasto: Gasto) => {
    if (!isOnline) return;
    setSyncingId(gasto.id);
    await onSync(gasto);
    setSyncingId(null);
  };

  const columns: Column<Gasto>[] = [
    {
      header: 'Fecha',
      accessorKey: 'fecha',
      cell: (item) => formatDate(item.fecha)
    },
    {
      header: 'Concepto',
      accessorKey: 'concepto',
      cell: (item) => <span className="font-semibold text-slate-700">{item.concepto}</span>
    },
    {
      header: 'Monto',
      accessorKey: 'monto',
      cell: (item) => <span className="text-red-600 font-medium">{formatCurrency(item.monto)}</span>
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
            title="Editar Gasto"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button 
            onClick={() => onDelete(item)}
            className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"
            title="Eliminar Gasto"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    },
  ];

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-xl shadow-sm p-8 text-center text-slate-500 animate-pulse">
        Cargando listado de gastos...
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
