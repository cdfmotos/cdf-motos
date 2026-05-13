import React from 'react';
import { Search } from 'lucide-react';

interface ContratosFilterProps {
  filters: {
    busqueda: string;
    estado: string;
    tipo_contrato: string;
  };
  onChange: (filters: any) => void;
}

export function ContratosFilter({ filters, onChange }: ContratosFilterProps) {
  return (
    <div className="bg-white p-4 rounded-xl border border-border mb-6 flex flex-col sm:flex-row gap-4">
      <div className="flex-1 relative">
        <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Buscar por N° Contrato, Placa o Cédula..."
          value={filters.busqueda}
          onChange={(e) => onChange({ ...filters, busqueda: e.target.value })}
          className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
        />
      </div>
      <div className="w-full sm:w-48">
        <select
          value={filters.tipo_contrato}
          onChange={(e) => onChange({ ...filters, tipo_contrato: e.target.value })}
          className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors appearance-none"
        >
          <option value="">Todos los tipos</option>
          <option value="Prestamo">Prestamo</option>
          <option value="Moto">Moto</option>
        </select>
      </div>
      <div className="w-full sm:w-48">
        <select
          value={filters.estado}
          onChange={(e) => onChange({ ...filters, estado: e.target.value })}
          className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors appearance-none"
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
  );
}
