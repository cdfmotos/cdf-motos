import { useState } from 'react';
import { DataTable } from '../../../../components/ui/DataTable';
import type { Column } from '../../../../components/ui/DataTable/types/types';
import type { Cliente } from '../../../../db/schema';
import { Edit, CloudUpload, Loader2 } from 'lucide-react';
import { useOnlineStatus } from '../../../../hooks/useOnlineStatus';

interface ClientesTableProps {
  data: Cliente[];
  loading: boolean;
  onEdit: (cliente: Cliente) => void;
  onSync: (cliente: Cliente) => Promise<boolean>;
  canEdit?: boolean;
}

export function ClientesTable({ data, loading, onEdit, onSync, canEdit = false }: ClientesTableProps) {
  const { isOnline } = useOnlineStatus();
  const [syncingId, setSyncingId] = useState<string | null>(null);

  const handleSync = async (cliente: Cliente) => {
    if (!isOnline) return;
    setSyncingId(cliente.id);
    await onSync(cliente);
    setSyncingId(null);
  };

  const columns: Column<Cliente>[] = [
    {
      header: 'Cédula',
      accessorKey: 'cedula',
      cell: (item) => <span className="font-bold text-slate-700">{item.cedula}</span>
    },
    {
      header: 'Nombre Completo',
      accessorKey: 'nombres',
      cell: (item) => `${item.nombres} ${item.apellidos}`
    },
    {
      header: 'Celular',
      accessorKey: 'celular',
      cell: (item) => item.celular || <span className="text-slate-400 italic">No registrado</span>
    },
    {
      header: 'Celular Alternativo',
      accessorKey: 'celular_alternativo',
      cell: (item) => item.celular_alternativo || <span className="text-slate-400 italic">No registrado</span>
    },
    {
      header: 'Dirección de Residencia',
      accessorKey: 'direccion_residencia',
      cell: (item) => item.direccion_residencia || <span className="text-slate-400 italic">No registrada</span>
    },
    {
      header: 'Sincronización',
      accessorKey: '_sync_status',
      cell: (item: Cliente) => (
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
      cell: (item: Cliente) => (
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
            onClick={() => onEdit(item)}
            className={`p-1.5 rounded transition-colors ${canEdit ? 'text-primary hover:bg-primary/10' : 'text-slate-300 cursor-not-allowed'}`}
            title={canEdit ? 'Editar Cliente' : 'Solo Admin puede editar'}
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
        Cargando listado de clientes...
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
