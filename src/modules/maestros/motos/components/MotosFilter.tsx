import React from 'react';
import type { MotoFilters } from '../hooks/useMotos';
import { Search } from 'lucide-react';

interface MotosFilterProps {
  filters: MotoFilters;
  onChange: (filters: MotoFilters) => void;
}

export function MotosFilter({ filters, onChange }: MotosFilterProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onChange({ ...filters, [name]: value });
  };

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm p-4 mb-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Placa</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              name="placa"
              value={filters.placa}
              onChange={handleChange}
              className="block w-full pl-8 pr-3 py-1.5 border border-border rounded-lg text-sm bg-slate-50 focus:bg-white focus:ring-1 focus:ring-primary focus:border-primary transition-colors outline-none"
              placeholder="Buscar placa..."
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Marca</label>
          <input
            type="text"
            name="marca"
            value={filters.marca}
            onChange={handleChange}
            className="block w-full px-3 py-1.5 border border-border rounded-lg text-sm bg-slate-50 focus:bg-white focus:ring-1 focus:ring-primary focus:border-primary transition-colors outline-none"
            placeholder="Ej. Yamaha"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Modelo</label>
          <input
            type="text"
            name="modelo"
            value={filters.modelo}
            onChange={handleChange}
            className="block w-full px-3 py-1.5 border border-border rounded-lg text-sm bg-slate-50 focus:bg-white focus:ring-1 focus:ring-primary focus:border-primary transition-colors outline-none"
            placeholder="Ej. FZ-150"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Fecha Desde</label>
          <input
            type="date"
            name="fechaInicio"
            value={filters.fechaInicio}
            onChange={handleChange}
            className="block w-full px-3 py-1.5 border border-border rounded-lg text-sm bg-slate-50 focus:bg-white focus:ring-1 focus:ring-primary focus:border-primary transition-colors outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Fecha Hasta</label>
          <input
            type="date"
            name="fechaFin"
            value={filters.fechaFin}
            onChange={handleChange}
            className="block w-full px-3 py-1.5 border border-border rounded-lg text-sm bg-slate-50 focus:bg-white focus:ring-1 focus:ring-primary focus:border-primary transition-colors outline-none"
          />
        </div>
      </div>
    </div>
  );
}
