import { useState } from 'react';
import { Plus, DollarSign } from 'lucide-react';
import { useRecaudos } from './hooks/useRecaudos';
import { RecaudosTable } from './components/RecaudosTable';
import { RecaudosFilter } from './components/RecaudosFilter';
import { RecaudoForm } from './components/RecaudoForm';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

export function RecaudosPage() {
  const { recaudo, loading, filters, setFilters, addRecaudo, buscarContrato } = useRecaudos();
  const [showForm, setShowForm] = useState(false);
  const isOnline = useOnlineStatus();

  const handleSubmit = async (data: {
    contrato_id: number;
    monto_recaudado: number;
    fecha_recaudo: string;
    cuota_diaria_pactada: number;
    tipo_contrato: string;
  }) => {
    return await addRecaudo(data);
  };

  const totalRecaudado = recaudo.reduce((sum, r) => sum + (r.monto_recaudado ?? 0), 0);
  const nf = (v: number) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(v);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Recaudos</h1>
          <p className="text-slate-500">Registro y gestión de recaudos</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nuevo Recaudo
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-border rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase">Total Recaudado</p>
              <p className="text-xl font-bold text-slate-800">{nf(totalRecaudado)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-border rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase">Total Registros</p>
              <p className="text-xl font-bold text-slate-800">{recaudo.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-border rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isOnline ? 'bg-green-100' : 'bg-amber-100'}`}>
              <span className={`text-xs font-medium ${isOnline ? 'text-green-600' : 'text-amber-600'}`}>
                {isOnline ? 'ONLINE' : 'OFFLINE'}
              </span>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase">Estado Conexión</p>
              <p className="text-sm font-medium text-slate-800">
                {isOnline ? 'Conectado' : 'Sin conexión'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <RecaudosFilter filters={filters} onChange={setFilters} />

      {/* Table */}
      <RecaudosTable recaudo={recaudo} loading={loading} />

      {/* Form Modal */}
      {showForm && (
        <RecaudoForm
          onClose={() => setShowForm(false)}
          onSubmit={handleSubmit}
          buscarContrato={buscarContrato}
        />
      )}
    </div>
  );
}