import { useState } from 'react';
import { Calendar, CheckCircle, XCircle, Users, Bike, FileText } from 'lucide-react';
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
import { DataTable } from '../../../components/ui/DataTable';
import { useVistaAsistenciaHistoricaDetalle } from '../hooks/useVistaAsistenciaHistoricaDetalle';
import { useVistaAsistenciaHistoricaV3 } from '../hooks/useVistaAsistenciaHistoricaV3';
import { useVistaAsistenciaHistoricaV3Global } from '../hooks/useVistaAsistenciaHistoricaV3Global';
import { formatCurrency, formatDate } from '../../../utils/formatters';
import { OfflineMessage } from '../components/OnlineGate';
import { useOnlineStatus } from '../../../hooks/useOnlineStatus';
import type { Column } from '../../../components/ui/DataTable/types/types';
import type { Database } from '../../../types/database.types';

type Row = Database['public']['Views']['vista_asistencia_historica_v3_detalle']['Row'];

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

export function AsistenciaConAbonosTab() {
  const { isOnline } = useOnlineStatus();

  const today = toYMD(new Date());
  const quinceDiasAtras = new Date();
  quinceDiasAtras.setDate(quinceDiasAtras.getDate() - 15);

  const [fechaDesde, setFechaDesde] = useState(toYMD(quinceDiasAtras));
  const [fechaHasta, setFechaHasta] = useState(today);

  // Extract year and month from fechaHasta for the global stats filter
  const [anio, mes] = fechaHasta.split('-').map(Number);

  const { data: detalle, loading: loadingDetalle, error: errorDetalle } = useVistaAsistenciaHistoricaDetalle(fechaDesde, fechaHasta);
  const { data: historico, loading: loadingHistorico, error: errorHistorico } = useVistaAsistenciaHistoricaV3(fechaDesde, fechaHasta);
  const { data: globalStats, loading: loadingGlobal, error: errorGlobal } = useVistaAsistenciaHistoricaV3Global(anio, mes);

  if (!isOnline) return <OfflineMessage />;

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const columns: Column<Row>[] = [
    {
      header: 'Fecha',
      accessorKey: 'fecha',
      sortable: true,
      cell: (row) => row.fecha ? formatDate(row.fecha) : '-',
    },
    {
      header: 'Contrato',
      accessorKey: 'contrato_id',
      sortable: true,
      cell: (row) => row.contrato_id ?? '-',
    },
    {
      header: 'Placa',
      accessorKey: 'placa',
      sortable: true,
      cell: (row) => row.placa ?? '-',
    },
    {
      header: 'Asistió',
      accessorKey: 'asistio',
      sortable: true,
      cell: (row) => row.asistio ? (
        <span className="inline-flex items-center gap-1 text-green-600">
          <CheckCircle className="w-4 h-4" /> Sí
        </span>
      ) : (
        <span className="inline-flex items-center gap-1 text-red-500">
          <XCircle className="w-4 h-4" /> No
        </span>
      ),
    },
    {
      header: 'Recaudo Día',
      accessorKey: 'total_recaudado_dia',
      sortable: true,
      cell: (row) => formatCurrency(row.total_recaudado_dia ?? 0),
    },
    {
      header: 'Cuota Diaria',
      accessorKey: 'cuota_diaria',
      sortable: true,
      cell: (row) => formatCurrency(row.cuota_diaria ?? 0),
    },
    {
      header: 'Saldo Acum.',
      accessorKey: 'saldo_acumulado',
      sortable: true,
      cell: (row) => (
        <span className={row.saldo_acumulado && row.saldo_acumulado > 0 ? 'text-green-600 font-medium' : ''}>
          {formatCurrency(row.saldo_acumulado ?? 0)}
        </span>
      ),
    },
    {
      header: 'Tipo',
      accessorKey: 'tipo_contrato',
      sortable: true,
      cell: (row) => {
         const isMoto = row.tipo_contrato === 'Moto' || row.tipo_contrato === 'MOTO';
         return (
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            isMoto ? 'bg-blue-100 text-blue-700' :
            'bg-amber-100 text-amber-700'
          }`}>
            {row.tipo_contrato}
          </span>
         );
      },
    },
    {
       header: 'Estado Día',
       accessorKey: 'estado_dia',
       sortable: true,
       cell: (row) => {
          if (!row.estado_dia) return '-';
          const bg = row.estado_dia === 'PAGO_DEL_DIA' ? 'bg-green-100 text-green-700' :
                     row.estado_dia === 'CUBIERTO_POR_ABONO' ? 'bg-blue-100 text-blue-700' :
                     row.estado_dia === 'SISTEMA_CERRADO' ? 'bg-slate-100 text-slate-700' :
                     'bg-red-100 text-red-700';
          return (
             <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${bg}`}>
               {row.estado_dia.replace(/_/g, ' ')}
             </span>
          );
       }
    }
  ];

  const chartDataFiltered = historico.map((h) => ({
    fecha: h.fecha ? h.fecha.slice(5) : '-',
    'Asist. Motos': h.asistencia_motos ?? 0,
    'Motos Esp.': h.motos_esperadas ?? 0,
    'Asist. Préstamos': h.asistencia_prestamos ?? 0,
    'Préstamos Esp.': h.prestamos_esperados ?? 0,
  }));

  const combinedLoading = loadingDetalle || loadingHistorico || loadingGlobal;
  const combinedError = errorDetalle || errorHistorico || errorGlobal;

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

      {combinedError && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
          {combinedError}
        </div>
      )}

      {combinedLoading ? (
        <div className="flex justify-center py-12 text-slate-500">Cargando...</div>
      ) : (
        <>
          {globalStats && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-slate-700">
                <h3 className="text-lg font-bold">Indicadores Globales</h3>
                <span className="text-sm font-medium bg-slate-100 px-2 py-1 rounded-md text-slate-600">
                  {monthNames[mes - 1]} {anio}
                </span>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white border-2 border-primary rounded-xl p-5 shadow-sm">
                <p className="text-sm font-medium text-slate-500">% Total Global</p>
                <p className="text-3xl font-bold text-primary">{globalStats.pct_total_global}%</p>
              </div>

              <div className="bg-white border border-border rounded-xl p-5 shadow-sm">
                <p className="text-sm font-medium text-slate-500">% Motos Global</p>
                <p className="text-2xl font-bold text-slate-800">{globalStats.pct_motos_global}%</p>
              </div>

              <div className="bg-white border border-border rounded-xl p-5 shadow-sm">
                <p className="text-sm font-medium text-slate-500">% Préstamos Global</p>
                <p className="text-2xl font-bold text-slate-800">{globalStats.pct_prestamos_global}%</p>
              </div>

              <div className="bg-white border border-border rounded-xl p-5 shadow-sm">
                <p className="text-sm font-medium text-slate-500">Días Operativos</p>
                <p className="text-2xl font-bold text-slate-800">{globalStats.dias_operativos}</p>
              </div>

              <div className="bg-white border border-border rounded-xl p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="w-4 h-4 text-slate-500" />
                  <p className="text-sm font-medium text-slate-500">Asist. Total</p>
                </div>
                <p className="text-xl font-bold text-slate-800">{globalStats.asistencia_contratos}/{globalStats.total_esperados}</p>
              </div>

              <div className="bg-white border border-border rounded-xl p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-1">
                  <Bike className="w-4 h-4 text-slate-500" />
                  <p className="text-sm font-medium text-slate-500">Asist. Motos</p>
                </div>
                <p className="text-xl font-bold text-slate-800">{globalStats.asistencia_motos}/{globalStats.motos_esperadas}</p>
              </div>

              <div className="bg-white border border-border rounded-xl p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="w-4 h-4 text-slate-500" />
                  <p className="text-sm font-medium text-slate-500">Asist. Préstamos</p>
                </div>
                <p className="text-xl font-bold text-slate-800">{globalStats.asistencia_prestamos}/{globalStats.prestamos_esperados}</p>
              </div>
            </div>
          </div>
        )}

          <div className="bg-white border border-border rounded-xl p-5 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
              <h3 className="text-base font-semibold text-slate-700">Histórico de Asistencia (Rango)</h3>
            </div>
            {chartDataFiltered.length === 0 ? (
              <div className="flex justify-center py-8 text-slate-500">Sin datos históricos en el rango</div>
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

          <div className="bg-white border border-border rounded-xl p-5 shadow-sm">
            <h3 className="text-base font-semibold text-slate-700 mb-4">Detalle de Asistencia y Abonos</h3>
            <DataTable<Row>
              data={detalle}
              columns={columns}
              searchable={true}
              searchPlaceholder="Buscar por placa o contrato..."
              pagination={true}
              defaultRowsPerPage={10}
              rowsPerPageOptions={[10, 20, 50, 100]}
              loading={loadingDetalle}
            />
          </div>
        </>
      )}
    </div>
  );
}
