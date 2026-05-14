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
import { Calendar, Users, Bike, FileText } from 'lucide-react';
import { useVistaAsistenciaResumen } from '../hooks/useVistaAsistenciaResumen';
import { useVistaAsistenciaHistorica } from '../hooks/useVistaAsistenciaHistorica';
import { OfflineMessage } from '../components/OnlineGate';
import { useOnlineStatus } from '../../../hooks/useOnlineStatus';

function toYMD(date: Date): string {
  return date.toISOString().split('T')[0];
}

const MOTOS_ASIST_COLOR = '#22c55e';
const MOTOS_ESPERADO_COLOR = '#86efac';
const PRESTAMOS_ASIST_COLOR = '#f59e0b';
const PRESTAMOS_ESPERADO_COLOR = '#fcd34d';

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

export function AsistenciaTab() {
  const isOnline = useOnlineStatus();
  const [fecha, setFecha] = useState(toYMD(new Date()));
  const [fechaGrafico, setFechaGrafico] = useState<string | null>(null);
  const { data, loading, error } = useVistaAsistenciaResumen(fecha);
  const { data: historico, loading: loadingHistorico } = useVistaAsistenciaHistorica();

  if (!isOnline) return <OfflineMessage />;

  const pctTotal = data?.pct_total ?? 0;
  const pctMotos = data?.pct_motos ?? 0;
  const pctPrestamos = data?.pct_prestamos ?? 0;
  const asistenciaContratos = data?.asistencia_contratos ?? 0;
  const asistenciaMotos = data?.asistencia_motos ?? 0;
  const asistenciaPrestamos = data?.asistencia_prestamos ?? 0;
  const contratosSinAsistencia = data?.contratos_sin_asistencia ?? 0;
  const motosEsperadas = data?.motos_esperadas ?? 0;
  const prestamosEsperados = data?.prestamos_esperados ?? 0;
  const totalEsperados = data?.total_esperados ?? 0;

  const fechaLimiteStr = toYMD(new Date(Date.now() - 15 * 24 * 60 * 60 * 1000));

const chartDataFiltered = historico
  .filter((h) => {
    if (!h.fecha) return false;

    const fechaStr = h.fecha.split('T')[0];

    if (fechaGrafico) {
      return fechaStr === fechaGrafico;
    }

    return fechaStr >= fechaLimiteStr;
  })
  .map((h) => ({
    fecha: h.fecha ? h.fecha.slice(5) : '-',
    'Asist. Motos': h.asistencia_motos ?? 0,
    'Motos Esp.': h.motos_esperadas ?? 0,
    'Asist. Préstamos': h.asistencia_prestamos ?? 0,
    'Préstamos Esp.': h.prestamos_esperados ?? 0,
  }));

  const handleLimpiarFiltro = () => setFechaGrafico(null);

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
      ) : !data ? (
        <div className="flex flex-col items-center justify-center h-48 text-slate-500">
          Sin datos para {fecha}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border-2 border-primary rounded-xl p-5 shadow-sm">
              <p className="text-sm font-medium text-slate-500">% Total</p>
              <p className="text-3xl font-bold text-primary">{pctTotal.toFixed(1)}%</p>
            </div>

            <div className="bg-white border border-border rounded-xl p-5 shadow-sm">
              <p className="text-sm font-medium text-slate-500">% Motos</p>
              <p className="text-2xl font-bold text-slate-800">{pctMotos.toFixed(1)}%</p>
            </div>

            <div className="bg-white border border-border rounded-xl p-5 shadow-sm">
              <p className="text-sm font-medium text-slate-500">% Préstamos</p>
              <p className="text-2xl font-bold text-slate-800">{pctPrestamos.toFixed(1)}%</p>
            </div>

            <div className="bg-white border border-border rounded-xl p-5 shadow-sm">
              <p className="text-sm font-medium text-slate-500">Total Esperados</p>
              <p className="text-2xl font-bold text-slate-800">{totalEsperados}</p>
            </div>

            <div className="bg-white border border-border rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-4 h-4 text-slate-500" />
                <p className="text-sm font-medium text-slate-500">Asist. Contratos</p>
              </div>
              <p className="text-xl font-bold text-slate-800">{asistenciaContratos}</p>
            </div>

            <div className="bg-white border border-border rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <Bike className="w-4 h-4 text-slate-500" />
                <p className="text-sm font-medium text-slate-500">Asist. Motos</p>
              </div>
              <p className="text-xl font-bold text-slate-800">{asistenciaMotos}/{motosEsperadas}</p>
            </div>

            <div className="bg-white border border-border rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <FileText className="w-4 h-4 text-slate-500" />
                <p className="text-sm font-medium text-slate-500">Asist. Préstamos</p>
              </div>
              <p className="text-xl font-bold text-slate-800">{asistenciaPrestamos}/{prestamosEsperados}</p>
            </div>

            <div className="bg-white border border-border rounded-xl p-5 shadow-sm">
              <p className="text-sm font-medium text-slate-500">Sin Asistencia</p>
              <p className="text-xl font-bold text-red-600">
                {contratosSinAsistencia}
              </p>
            </div>
          </div>

          <div className="bg-white border border-border rounded-xl p-5 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
              <h3 className="text-base font-semibold text-slate-700">Histórico de Asistencia (Últimos 15 días)</h3>
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
            {loadingHistorico ? (
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
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="Asist. Motos" fill={MOTOS_ASIST_COLOR} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Motos Esp." fill={MOTOS_ESPERADO_COLOR} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Asist. Préstamos" fill={PRESTAMOS_ASIST_COLOR} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Préstamos Esp." fill={PRESTAMOS_ESPERADO_COLOR} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </>
      )}
    </div>
  );
}