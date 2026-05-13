import React from 'react';
import { Search } from 'lucide-react';
import type { GastoFilters } from '../hooks/useGastos';

interface GastosFilterProps {
  filters: GastoFilters;
  onChange: (filters: GastoFilters) => void;
}

export function GastosFilter({ filters, onChange }: GastosFilterProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onChange({ ...filters, [name]: value });
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4 mb-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Search className="w-5 h-5 text-slate-400" />
        <h3 className="font-medium text-slate-700">Filtros de Búsqueda</h3>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Concepto</label>
          <input
            type="text"
            name="concepto"
            value={filters.concepto}
            onChange={handleChange}
            placeholder="Buscar por concepto..."
            className="w-full px-3 py-2 bg-slate-50 border border-border rounded-lg text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none"
          />
        </div>
        
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Fecha Inicio</label>
          <input
            type="date"
            name="fechaInicio"
            value={filters.fechaInicio}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-slate-50 border border-border rounded-lg text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Fecha Fin</label>
          <input
            type="date"
            name="fechaFin"
            value={filters.fechaFin}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-slate-50 border border-border rounded-lg text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none"
          />
        </div>
      </div>
    </div>
  );
}
