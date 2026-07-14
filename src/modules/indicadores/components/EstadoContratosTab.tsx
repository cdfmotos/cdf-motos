import { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Calendar, History, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useHistoricoEstadoContratos } from '../hooks/useHistoricoEstadoContratos';
import { OfflineMessage } from '../components/OnlineGate';
import { useOnlineStatus } from '../../../hooks/useOnlineStatus';

function toYMD(date: Date): string {
  // Usa la fecha local del sistema para evitar desfases por timezone (ej. UTC-5 Colombia)
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
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
          <p key={p.dataKey} style={{ color: p.stroke }}>
            {p.name}: <span className="font-semibold">{p.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
}

/** Muestra el ícono y color correcto para un delta */
function DeltaIcon({ delta }: { delta: number }) {
  if (delta > 0) return <TrendingUp className="w-3 h-3 text-red-500 inline ml-1" />;
  if (delta < 0) return <TrendingDown className="w-3 h-3 text-green-500 inline ml-1" />;
  return <Minus className="w-3 h-3 text-slate-400 inline ml-1" />;
}

export function EstadoContratosTab() {
  const { isOnline } = useOnlineStatus();

  const today = toYMD(new Date());
  const quinceDiasAtras = new Date();
  quinceDiasAtras.setDate(quinceDiasAtras.getDate() - 15);

  // Fechas del filtro; vacías = histórico completo
  const [fechaDesde, setFechaDesde] = useState(toYMD(quinceDiasAtras));
  const [fechaHasta, setFechaHasta] = useState(today);
  const [modoHistorico, setModoHistorico] = useState(false);

  const queryDesde = modoHistorico ? '' : fechaDesde;
  const queryHasta = modoHistorico ? '' : fechaHasta;

  const { data, loading, error } = useHistoricoEstadoContratos(queryDesde, queryHasta);

  if (!isOnline) return <OfflineMessage />;

  const firstRecord = data[0];
  const lastRecord = data[data.length - 1];
  const isRange = data.length > 1;

  /**
   * Modo snapshot: sin filtro activo (histórico completo) o solo 1 registro → muestra el último valor real.
   * Modo delta: rango con >1 registro → muestra la variación (último - primero).
   */
  const modoSnapshot = modoHistorico || !isRange;

  const getSnapshot = (key: keyof typeof data[0]): number => {
    if (!lastRecord) return 0;
    return Number(lastRecord[key]) || 0;
  };

  const getDelta = (key: keyof typeof data[0]): number => {
    if (!firstRecord || !lastRecord) return 0;
    return (Number(lastRecord[key]) || 0) - (Number(firstRecord[key]) || 0);
  };

  const getValue = (key: keyof typeof data[0]) =>
    modoSnapshot ? getSnapshot(key) : getDelta(key);

  const totalContratos = getValue('total_contratos');
  const activo = getValue('activo');
  const bodega = getValue('bodega');
  const fiscalia = getValue('fiscalia');
  const liquidado = getValue('liquidado');
  const paradenuncio = getValue('paradenuncio');
  const robada = getValue('robada');
  const termino = getValue('termino');

  const chartData = data.map((d) => ({
    fecha: d.fecha?.slice(5) || '-',
    'Activo': d.activo ?? 0,
    'Bodega': d.bodega ?? 0,
    'Fiscalía': d.fiscalia ?? 0,
    'Liquidado': d.liquidado ?? 0,
    'Para Denuncio': d.paradenuncio ?? 0,
    'Robada': d.robada ?? 0,
    'Término': d.termino ?? 0,
  }));

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

  // Etiqueta que explica qué representan los KPIs
  const kpiSubtitle = modoSnapshot
    ? lastRecord
      ? `Estado al ${lastRecord.fecha}`
      : 'Estado actual'
    : `Variación del ${firstRecord?.fecha ?? ''} al ${lastRecord?.fecha ?? ''}`;

  const handleToggleHistorico = () => {
    setModoHistorico((prev) => !prev);
  };

  const formatDeltaValue = (value: number) => {
    if (modoSnapshot) return value;
    return value > 0 ? `+${value}` : `${value}`;
  };

  return (
    <div className="space-y-6">
      {/* Barra de controles */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-wrap">
        {/* Filtros de fecha — deshabilitados en modo histórico */}
        <div className={`flex items-center gap-2 transition-opacity ${modoHistorico ? 'opacity-40 pointer-events-none select-none' : ''}`}>
          <Calendar className="w-5 h-5 text-slate-500 shrink-0" />
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={fechaDesde}
              onChange={(e) => setFechaDesde(e.target.value)}
              className="border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <span className="text-slate-500">a</span>
            <input
              type="date"
              value={fechaHasta}
              onChange={(e) => setFechaHasta(e.target.value)}
              className="border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
        </div>

        {/* Botón histórico completo */}
        <button
          onClick={handleToggleHistorico}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
            modoHistorico
              ? 'bg-primary text-white border-primary'
              : 'bg-white text-slate-600 border-border hover:bg-slate-50'
          }`}
        >
          <History className="w-4 h-4" />
          {modoHistorico ? 'Aplicar filtro de fechas' : 'Ver histórico completo'}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12 text-slate-500">Cargando...</div>
      ) : data.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 text-slate-500">
          Sin datos para el rango seleccionado
        </div>
      ) : (
        <>
          {/* Subtítulo de KPIs */}
          <div className="flex items-center gap-2">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">
              {modoSnapshot ? '📸 Snapshot —' : '📊 Variación —'}
            </p>
            <p className="text-xs text-slate-500">{kpiSubtitle}</p>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {kpis.map((kpi) => {
              const displayValue = formatDeltaValue(kpi.value);
              const isDelta = !modoSnapshot && kpi.label !== 'Total Contratos';
              const deltaPositive = isDelta && kpi.value > 0;
              const deltaNegative = isDelta && kpi.value < 0;

              return (
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
                    className={`text-2xl font-bold flex items-center gap-1 ${
                      kpi.highlight
                        ? 'text-primary'
                        : deltaPositive
                        ? 'text-red-500'
                        : deltaNegative
                        ? 'text-green-600'
                        : 'text-slate-800'
                    }`}
                    style={!kpi.highlight && modoSnapshot ? { color: kpi.color } : {}}
                  >
                    {displayValue}
                    {isDelta && <DeltaIcon delta={kpi.value} />}
                  </p>
                  {isDelta && (
                    <p className="text-xs text-slate-400 mt-1">
                      {kpi.value === 0 ? 'Sin cambio' : kpi.value > 0 ? 'aumentaron' : 'disminuyeron'}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Gráfico de líneas */}
          <div className="bg-white border border-border rounded-xl p-5 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
              <div>
                <h3 className="text-base font-semibold text-slate-700">Evolución de Estados</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {modoHistorico ? 'Histórico completo' : `${data.length} días en el rango`}
                </p>
              </div>
            </div>
            {chartData.length === 0 ? (
              <div className="flex justify-center py-8 text-slate-500">Sin datos históricos</div>
            ) : (
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="fecha" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  {Object.entries(COLORS).map(([key, color]) => (
                    <Line
                      key={key}
                      type="monotone"
                      dataKey={key}
                      stroke={color}
                      strokeWidth={2}
                      dot={data.length <= 30}
                      activeDot={{ r: 5 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </>
      )}
    </div>
  );
}