import React from 'react';
import { useInicioData } from './hooks/useInicioData';
import { IndicatorCardAnimated } from './components/IndicatorCardAnimated';
import { LatestContractsTable } from './components/LatestContractsTable';
import { 
  FileText, 
  Clock, 
  Wallet, 
  TrendingUp, 
  DollarSign, 
  Activity 
} from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export function Dashboard() {
  const { actividades, indicadores, loading, error } = useInicioData();

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Panel de Inicio</h1>
        <p className="text-sm text-slate-500">Resumen de la actividad y recaudos</p>
      </div>

      {loading && !indicadores ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-28 bg-slate-200 rounded-xl"></div>
          ))}
        </div>
      ) : indicadores ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <IndicatorCardAnimated 
            title="Contratos Activos" 
            value={indicadores.numero_contratos_activos} 
            icon={FileText} 
            delay={0}
          />
          <IndicatorCardAnimated 
            title="Recaudos de Hoy" 
            value={indicadores.contratos_recaudados} 
            icon={Activity} 
            delay={100}
          />
          <IndicatorCardAnimated 
            title="Sin Recaudar (Contratos)" 
            value={indicadores.contratos_sin_recaudar} 
            icon={Clock} 
            delay={200}
          />
          <IndicatorCardAnimated 
            title="Dinero Recaudado Hoy" 
            value={formatCurrency(indicadores.dinero_recaudado_hoy)} 
            icon={Wallet} 
            delay={300}
          />
          <IndicatorCardAnimated 
            title="Dinero Sin Recaudar" 
            value={formatCurrency(indicadores.dinero_sin_recaudar)} 
            icon={DollarSign} 
            delay={400}
          />
          <IndicatorCardAnimated 
            title="% de Recaudo" 
            value={`${indicadores.porcentaje_recaudo}%`} 
            icon={TrendingUp} 
            delay={500}
          />
        </div>
      ) : null}

      <div className="mt-8">
        <LatestContractsTable data={actividades} loading={loading} />
      </div>
    </div>
  );
}
