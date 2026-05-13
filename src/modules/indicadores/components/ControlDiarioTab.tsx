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
import {
  Calendar,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';

import { useVistaControlDiario } from '../hooks/useVistaControlDiario';
import { formatCurrency } from '../../../utils/formatters';
import { OfflineMessage } from '../components/OnlineGate';
import { useOnlineStatus } from '../../../hooks/useOnlineStatus';

function toYMD(date: Date): string {
  return date.toLocaleDateString('en-CA');
}

const PENDING_COLOR = '#3b82f6';
const ACHIEVED_COLOR = '#22c55e';

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

function CustomTooltip({
  active,
  payload,
  label,
}: CustomTooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-border rounded-lg shadow-lg p-3 text-sm">
        <p className="font-semibold text-slate-700 mb-1">
          {label}
        </p>

        {payload.map((p: any) => (
          <p
            key={p.dataKey}
            style={{ color: p.fill }}
          >
            {p.name}: {formatCurrency(p.value)}
          </p>
        ))}
      </div>
    );
  }

  return null;
}

export function ControlDiarioTab() {
  const isOnline = useOnlineStatus();

  const [fecha, setFecha] = useState(
    toYMD(new Date())
  );

  const {
    data,
    loading,
    error,
  } = useVistaControlDiario(fecha);

  if (!isOnline) {
    return <OfflineMessage />;
  }

  const esperado = data?.recaudo_esperado ?? 0;

  const alcanzado =
    data?.recaudo_alcanzado ?? 0;

  const diferencia =
    esperado - alcanzado;

  const diffPct =
    esperado > 0
      ? (
          (alcanzado / esperado) *
          100
        ).toFixed(1)
      : '0.0';

  const chartData = [
    {
      name: 'Recaudo',
      Esperado: esperado,
      Alcanzado: alcanzado,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-slate-500" />

          <input
            type="date"
            value={fecha}
            onChange={(e) =>
              setFecha(e.target.value)
            }
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
        <div className="flex justify-center py-12 text-slate-500">
          Cargando...
        </div>
      ) : !data ? (
        <div className="flex flex-col items-center justify-center h-48 text-slate-500">
          Sin datos para {fecha}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border-2 border-primary rounded-xl p-5 shadow-sm">
              <p className="text-sm font-medium text-slate-500">
                % Recaudo
              </p>

              <p className="text-3xl font-bold text-primary">
                {diffPct}%
              </p>
            </div>

            <div className="bg-white border border-border rounded-xl p-5 shadow-sm">
              <p className="text-sm font-medium text-slate-500">
                Recaudo Esperado
              </p>

              <p className="text-xl font-bold text-slate-800">
                {formatCurrency(esperado)}
              </p>
            </div>

            <div className="bg-white border border-border rounded-xl p-5 shadow-sm">
              <p className="text-sm font-medium text-slate-500">
                Recaudo Alcanzado
              </p>

              <p className="text-xl font-bold text-green-600">
                {formatCurrency(alcanzado)}
              </p>
            </div>

            <div className="bg-white border border-border rounded-xl p-5 shadow-sm flex items-start gap-3">
              <div
                className={`mt-1 ${
                  diferencia <= 0
                    ? 'text-green-500'
                    : 'text-red-500'
                }`}
              >
                {diferencia <= 0 ? (
                  <TrendingUp className="w-5 h-5" />
                ) : (
                  <TrendingDown className="w-5 h-5" />
                )}
              </div>

              <div>
                <p className="text-sm font-medium text-slate-500">
                  Diferencia
                </p>

                <p
                  className={`text-xl font-bold ${
                    diferencia <= 0
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}
                >
                  {formatCurrency(
                    Math.abs(diferencia)
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-border rounded-xl p-5 shadow-sm">
            <h3 className="text-base font-semibold text-slate-700 mb-4">
              Comparativa de Recaudo
            </h3>

            <ResponsiveContainer
              width="100%"
              height={300}
            >
              <BarChart
                data={chartData}
                margin={{
                  top: 5,
                  right: 20,
                  left: 10,
                  bottom: 5,
                }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e2e8f0"
                />

                <XAxis
                  dataKey="name"
                  tick={{
                    fontSize: 12,
                    fill: '#64748b',
                  }}
                />

                <YAxis
                  tick={{
                    fontSize: 12,
                    fill: '#64748b',
                  }}
                  tickFormatter={(v) =>
                    `$${(
                      v / 1000000
                    ).toFixed(1)}M`
                  }
                />

                <Tooltip
                  content={<CustomTooltip />}
                />

                <Legend
                  wrapperStyle={{
                    fontSize: 12,
                  }}
                />

                <Bar
                  dataKey="Esperado"
                  fill={PENDING_COLOR}
                  radius={[4, 4, 0, 0]}
                />

                <Bar
                  dataKey="Alcanzado"
                  fill={ACHIEVED_COLOR}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
}