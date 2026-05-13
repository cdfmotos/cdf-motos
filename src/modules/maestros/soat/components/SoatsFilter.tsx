import React from 'react';
import type { SoatFilters } from '../hooks/useSoats';
import { Search } from 'lucide-react';

interface SoatsFilterProps {
  filters: SoatFilters;
  onChange: (filters: SoatFilters) => void;
}

export function SoatsFilter({ filters, onChange }: SoatsFilterProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onChange({ ...filters, [name]: value });
  };

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm p-4 mb-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Placa de Moto</label>
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
          <label className="block text-xs font-medium text-slate-500 mb-1">N° de SOAT</label>
          <input
            type="text"
            name="noSoat"
            value={filters.noSoat}
            onChange={handleChange}
            className="block w-full px-3 py-1.5 border border-border rounded-lg text-sm bg-slate-50 focus:bg-white focus:ring-1 focus:ring-primary focus:border-primary transition-colors outline-none"
            placeholder="Buscar por número..."
          />
        </div>
      </div>
    </div>
  );
}
