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
import { useVistaAsistenciaHistorica } from '../hooks/useVistaAsistenciaHistorica';
import { OfflineMessage } from '../components/OnlineGate';
import { useOnlineStatus } from '../../../hooks/useOnlineStatus';

function toYMD(date: Date): string {
  // Usa la fecha local del sistema para evitar desfases por timezone (ej. UTC-5 Colombia)
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
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
  const { isOnline } = useOnlineStatus();

  const today = toYMD(new Date());
  const quinceDiasAtras = new Date();
  quinceDiasAtras.setDate(quinceDiasAtras.getDate() - 15);

  const [fechaDesde, setFechaDesde] = useState(toYMD(quinceDiasAtras));
  const [fechaHasta, setFechaHasta] = useState(today);

  // Usamos únicamente la vista histórica para AMBOS: KPIs y gráfico.
  // vista_asistencia_resumen_v2 siempre devuelve solo 1 fila con fecha = HOY
  // (usa CURRENT_TIMESTAMP hardcodeado), por lo que no sirve para filtros históricos.
  const { data: historico, loading, error } = useVistaAsistenciaHistorica(fechaDesde, fechaHasta);

  if (!isOnline) return <OfflineMessage />;

  type HistoricoItem = typeof historico[number];

  const calcularSuma = (key: keyof HistoricoItem) => {
    if (!historico || historico.length === 0) return 0;
    return historico.reduce((acc, curr) => {
      const value = curr[key];
      return acc + (typeof value === 'number' ? value : Number(value) || 0);
    }, 0);
  };

  const asistenciaContratos = calcularSuma('asistencia_contratos');
  const asistenciaMotos = calcularSuma('asistencia_motos');
  const asistenciaPrestamos = calcularSuma('asistencia_prestamos');
  const motosEsperadas = calcularSuma('motos_esperadas');
  const prestamosEsperados = calcularSuma('prestamos_esperados');
  const totalEsperados = calcularSuma('total_esperados');
  // contratos_sin_asistencia no está en la vista histórica → lo derivamos
  const contratosSinAsistencia = totalEsperados - asistenciaContratos;

  const pctTotal = totalEsperados > 0 ? (asistenciaContratos / totalEsperados) * 100 : 0;
  const pctMotos = motosEsperadas > 0 ? (asistenciaMotos / motosEsperadas) * 100 : 0;
  const pctPrestamos = prestamosEsperados > 0 ? (asistenciaPrestamos / prestamosEsperados) * 100 : 0;

  const chartDataFiltered = historico.map((h) => ({
    fecha: h.fecha ? h.fecha.slice(5) : '-',
    'Asist. Motos': h.asistencia_motos ?? 0,
    'Motos Esp.': h.motos_esperadas ?? 0,
    'Asist. Préstamos': h.asistencia_prestamos ?? 0,
    'Préstamos Esp.': h.prestamos_esperados ?? 0,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-slate-500" />
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
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12 text-slate-500">Cargando...</div>
      ) : historico.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 text-slate-500">
          Sin datos para el rango seleccionado
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
              <h3 className="text-base font-semibold text-slate-700">Histórico de Asistencia</h3>
            </div>
            {chartDataFiltered.length === 0 ? (
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