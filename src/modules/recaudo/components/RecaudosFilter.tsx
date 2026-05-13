import React from 'react';
import type { RecaudoFilters } from '../hooks/useRecaudos';

interface RecaudosFilterProps {
  filters: RecaudoFilters;
  onChange: (filters: RecaudoFilters) => void;
}

export function RecaudosFilter({ filters, onChange }: RecaudosFilterProps) {
  const handleChange = (field: keyof RecaudoFilters, value: string) => {
    onChange({ ...filters, [field]: value });
  };

  return (
    <div className="flex flex-wrap gap-4 mb-4">
      <div className="min-w-[150px]">
        <input
          type="number"
          placeholder="Número de contrato"
          value={filters.contratoId}
          onChange={e => handleChange('contratoId', e.target.value)}
          className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
        />
      </div>
      <div className="min-w-[150px]">
        <input
          type="date"
          placeholder="Desde"
          value={filters.fechaDesde}
          onChange={e => handleChange('fechaDesde', e.target.value)}
          className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
        />
      </div>
      <div className="min-w-[150px]">
        <input
          type="date"
          placeholder="Hasta"
          value={filters.fechaHasta}
          onChange={e => handleChange('fechaHasta', e.target.value)}
          className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
        />
      </div>
    </div>
  );
}