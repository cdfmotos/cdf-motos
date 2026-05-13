import React, { useState } from 'react';
import { DataTable } from '../../../components/ui/DataTable';
import type { Column } from '../../../components/ui/DataTable/types/types';
import type { EstadoSistema } from '../../../db/schema';
import { CloudUpload, Loader2, Lock, Unlock, Edit2 } from 'lucide-react';
import { formatDate } from '../../../utils/formatters';
import { useOnlineStatus } from '../../../hooks/useOnlineStatus';

interface HistorialEstadosTableProps {
  data: EstadoSistema[];
  loading: boolean;
  onEdit: (estado: EstadoSistema) => void;
  onSync: (estado: EstadoSistema) => Promise<boolean>;
}

export function HistorialEstadosTable({ data, loading, onEdit, onSync }: HistorialEstadosTableProps) {
  const isOnline = useOnlineStatus();
  const [syncingId, setSyncingId] = useState<string | null>(null);

  const handleSync = async (estado: EstadoSistema) => {
    if (!isOnline) return;
    setSyncingId(estado.fecha);
    await onSync(estado);
    setSyncingId(null);
  };

  const columns: Column<EstadoSistema>[] = [
    {
      header: 'Fecha',
      accessorKey: 'fecha',
      cell: (item) => <span className="font-medium text-slate-700">{formatDate(item.fecha)}</span>
    },
    {
      header: 'Estado',
      accessorKey: 'abierto',
      cell: (item) => (
        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
          item.abierto ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {item.abierto ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
          {item.abierto ? 'Abierto' : 'Cerrado'}
        </div>
      )
    },
    {
      header: 'Observación',
      accessorKey: 'observacion',
      cell: (item) => <span className="text-sm text-slate-500">{item.observacion || '—'}</span>
    },
    {
      header: 'Actualizado Por',
      accessorKey: 'actualizado_por',
      cell: (item) => <span className="text-sm text-slate-500">{item.actualizado_por || '—'}</span>
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
      accessorKey: 'fecha',
      sortable: false,
      cell: (item) => (
        <div className="flex items-center gap-2">
          {item._sync_status === 'pending' && (
            <button
              onClick={() => handleSync(item)}
              disabled={!isOnline || syncingId === item.fecha}
              className={`p-1.5 rounded transition-colors ${
                !isOnline 
                  ? 'text-slate-400 opacity-50 cursor-not-allowed' 
                  : 'text-amber-500 hover:bg-amber-50'
              }`}
              title={!isOnline ? 'Sin conexión' : 'Sincronizar'}
            >
              {syncingId === item.fecha ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CloudUpload className="w-4 h-4" />
              )}
            </button>
          )}
          <button 
            onClick={() => onEdit(item)}
            className="p-1.5 text-primary hover:bg-primary/10 rounded transition-colors"
            title="Editar Estado"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        </div>
      )
    },
  ];

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-xl shadow-sm p-8 text-center text-slate-500 animate-pulse">
        Cargando historial de estados...
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm flex flex-col">
      <DataTable 
        data={data} 
        columns={columns} 
        searchable={true}
        pagination={true}
      />
    </div>
  );
}
