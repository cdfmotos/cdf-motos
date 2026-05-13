import { useState } from 'react';
import { ControlDiarioTab } from './components/ControlDiarioTab';
import { ResumenDiarioTab } from './components/ResumenDiarioTab';
import { IndicadorMensualTab } from './components/IndicadorMensualTab';
import { AsistenciaTab } from './components/AsistenciaTab';
import { EstadoContratosTab } from './components/EstadoContratosTab';

const TABS = [
  { id: 'control-diario', label: 'Control Diario', component: ControlDiarioTab },
  { id: 'resumen-diario', label: 'Resumen Diario', component: ResumenDiarioTab },
  { id: 'indicador-mensual', label: 'Indicador Mensual', component: IndicadorMensualTab },
  { id: 'indicador-asistencia', label: 'Indicador Asistencia', component: AsistenciaTab },
  { id: 'estado-contratos', label: 'Estado Contratos', component: EstadoContratosTab },
];

export function IndicadoresPage() {
  const [activeTab, setActiveTab] = useState('control-diario');

  const ActiveComponent = TABS.find(t => t.id === activeTab)?.component;

  return (
    <div className="flex flex-col min-h-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Indicadores</h1>
        <p className="text-sm text-slate-500">Panel de seguimiento y métricas</p>
      </div>

      <div className="flex border-b border-border mb-6 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => tab.component && setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? 'border-primary text-primary'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1">
        {ActiveComponent ? <ActiveComponent /> : (
          <div className="flex items-center justify-center h-48 text-slate-500">
            En desarrollo
          </div>
        )}
      </div>
    </div>
  );
}