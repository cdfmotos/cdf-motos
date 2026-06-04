import { Search } from 'lucide-react';

interface ContratosFilterProps {
  filters: {
    busqueda: string;
    estado: string;
    tipo_contrato: string;
    fecha_inicio_desde: string;
    fecha_inicio_hasta: string;
  };
  onChange: (filters: any) => void;
}

export function ContratosFilter({ filters, onChange }: ContratosFilterProps) {
  return (
    <div className="bg-white p-4 rounded-xl border border-border mb-6 flex flex-col gap-4 shadow-sm">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Búsqueda */}
        <div className="flex-1 relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por N° Contrato, Placa o Cédula..."
            value={filters.busqueda}
            onChange={(e) => onChange({ ...filters, busqueda: e.target.value })}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-sm outline-none"
          />
        </div>
        
        {/* Tipo de contrato */}
        <div className="w-full md:w-48">
          <select
            value={filters.tipo_contrato}
            onChange={(e) => onChange({ ...filters, tipo_contrato: e.target.value })}
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors appearance-none text-sm outline-none text-slate-700 font-medium"
          >
            <option value="">Todos los tipos</option>
            <option value="Prestamo">Prestamo</option>
            <option value="Moto">Moto</option>
          </select>
        </div>

        {/* Estado */}
        <div className="w-full md:w-48">
          <select
            value={filters.estado}
            onChange={(e) => onChange({ ...filters, estado: e.target.value })}
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors appearance-none text-sm outline-none text-slate-700 font-medium"
          >
            <option value="">Todos los estados</option>
            <option value="Activo">Activo</option>
            <option value="Bodega">Bodega</option>
            <option value="Fiscalia">Fiscalia</option>
            <option value="Liquidado">Liquidado</option>
            <option value="ParaDenuncio">ParaDenuncio</option>
            <option value="Robada">Robada</option>
            <option value="Termino">Termino</option>
          </select>
        </div>
      </div>

      {/* Rango de fechas */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-3 border-t border-slate-100">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Fecha Inicio:</span>
        <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-400 font-medium">Desde</label>
            <input
              type="date"
              value={filters.fecha_inicio_desde}
              onChange={(e) => onChange({ ...filters, fecha_inicio_desde: e.target.value })}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-xs text-slate-700 outline-none font-medium"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-400 font-medium">Hasta</label>
            <input
              type="date"
              value={filters.fecha_inicio_hasta}
              onChange={(e) => onChange({ ...filters, fecha_inicio_hasta: e.target.value })}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-xs text-slate-700 outline-none font-medium"
            />
          </div>
          {(filters.fecha_inicio_desde || filters.fecha_inicio_hasta) && (
            <button
              onClick={() => onChange({ ...filters, fecha_inicio_desde: '', fecha_inicio_hasta: '' })}
              className="text-xs text-primary hover:text-primary/80 font-semibold transition-colors"
            >
              Limpiar fechas
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
