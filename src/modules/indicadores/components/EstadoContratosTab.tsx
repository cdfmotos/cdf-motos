import { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Calendar } from 'lucide-react';
import { useHistoricoEstadoContratos } from '../hooks/useHistoricoEstadoContratos';
import { OfflineMessage } from '../components/OnlineGate';
import { useOnlineStatus } from '../../../hooks/useOnlineStatus';

function toYMD(date: Date): string {
  return date.toISOString().split('T')[0];
}

const COLORS: Record<string, string> = {
  'Activo': '#22c55e',
  'Bodega': '#3b82f6',
  'Fiscalía': '#8b5cf6',
  'Liquidado': '#f59e0b',
  'Para Denuncio': '#ef4444',
  'Robada': '#ec4899',
  'Término': '#6b7280',
};

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-border rounded-lg shadow-lg p-3 text-sm">
        <p className="font-semibold text-slate-700 mb-1">{label}</p>
        {payload.map((p: any) => (
          <p key={p.dataKey} style={{ color: p.fill }}>
            {p.name}: {p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
}

export function EstadoContratosTab() {
  const isOnline = useOnlineStatus();
  const [fecha, setFecha] = useState(toYMD(new Date()));
  const [fechaGrafico, setFechaGrafico] = useState<string | null>(null);
  const { data, loading, error } = useHistoricoEstadoContratos();

  if (!isOnline) return <OfflineMessage />;

  const registro = data.find((d) => d.fecha === fecha);
  const totalContratos = registro?.total_contratos ?? 0;
  const activo = registro?.activo ?? 0;
  const bodega = registro?.bodega ?? 0;
  const fiscalia = registro?.fiscalia ?? 0;
  const liquidado = registro?.liquidado ?? 0;
  const paradenuncio = registro?.paradenuncio ?? 0;
  const robada = registro?.robada ?? 0;
  const termino = registro?.termino ?? 0;

  const fechaLimiteStr = toYMD(new Date(Date.now() - 15 * 24 * 60 * 60 * 1000));

  const chartDataFiltered = data
    .filter((d) => {
      if (!d.fecha) return false;
      const fechaStr = d.fecha;
      if (fechaGrafico) return fechaStr === fechaGrafico;
      return fechaStr >= fechaLimiteStr;
    })
    .map((d) => ({
      fecha: d.fecha?.slice(5) || '-',
      'Activo': d.activo ?? 0,
      'Bodega': d.bodega ?? 0,
      'Fiscalía': d.fiscalia ?? 0,
      'Liquidado': d.liquidado ?? 0,
      'Para Denuncio': d.paradenuncio ?? 0,
      'Robada': d.robada ?? 0,
      'Término': d.termino ?? 0,
    }));

  const handleLimpiarFiltro = () => setFechaGrafico(null);

  const kpis = [
    { label: 'Total Contratos', value: totalContratos, highlight: true },
    { label: 'Activo', value: activo, color: COLORS['Activo'] },
    { label: 'Bodega', value: bodega, color: COLORS['Bodega'] },
    { label: 'Fiscalía', value: fiscalia, color: COLORS['Fiscalía'] },
    { label: 'Liquidado', value: liquidado, color: COLORS['Liquidado'] },
    { label: 'Para Denuncio', value: paradenuncio, color: COLORS['Para Denuncio'] },
    { label: 'Robada', value: robada, color: COLORS['Robada'] },
    { label: 'Término', value: termino, color: COLORS['Término'] },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-slate-500" />
          <input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            className="border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12 text-slate-500">Cargando...</div>
      ) : !registro && data.length > 0 ? (
        <div className="flex flex-col items-center justify-center h-48 text-slate-500">
          Sin datos para {fecha}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {kpis.map((kpi) => (
              <div
                key={kpi.label}
                className={`rounded-xl p-5 shadow-sm ${
                  kpi.highlight
                    ? 'bg-white border-2 border-primary'
                    : 'bg-white border border-border'
                }`}
              >
                <p className="text-sm font-medium text-slate-500">{kpi.label}</p>
                <p
                  className={`text-2xl font-bold ${
                    kpi.highlight ? 'text-primary' : 'text-slate-800'
                  }`}
                >
                  {kpi.value}
                </p>
              </div>
            ))}
          </div>

          <div className="bg-white border border-border rounded-xl p-5 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
              <h3 className="text-base font-semibold text-slate-700">Histórico de Estados (Últimos 15 días)</h3>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-500" />
                <input
                  type="date"
                  value={fechaGrafico || ''}
                  onChange={(e) => setFechaGrafico(e.target.value || null)}
                  className="border border-border rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50"
                />
                {fechaGrafico && (
                  <button
                    onClick={handleLimpiarFiltro}
                    className="text-xs text-primary hover:underline"
                  >
                    Ver todo
                  </button>
                )}
              </div>
            </div>
            {loading ? (
              <div className="flex justify-center py-8 text-slate-500">Cargando gráfico...</div>
            ) : chartDataFiltered.length === 0 ? (
              <div className="flex justify-center py-8 text-slate-500">Sin datos históricos</div>
            ) : (
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={chartDataFiltered} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="fecha" tick={{ fontSize: 12, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Bar dataKey="Activo" fill={COLORS['Activo']} stackId="a" />
                  <Bar dataKey="Bodega" fill={COLORS['Bodega']} stackId="a" />
                  <Bar dataKey="Fiscalía" fill={COLORS['Fiscalía']} stackId="a" />
                  <Bar dataKey="Liquidado" fill={COLORS['Liquidado']} stackId="a" />
                  <Bar dataKey="Para Denuncio" fill={COLORS['Para Denuncio']} stackId="a" />
                  <Bar dataKey="Robada" fill={COLORS['Robada']} stackId="a" />
                  <Bar dataKey="Término" fill={COLORS['Término']} stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </>
      )}
    </div>
  );
}