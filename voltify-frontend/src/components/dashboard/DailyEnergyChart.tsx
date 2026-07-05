import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';

interface DailyHistoryItem {
  date: string;   // either 'YYYY-MM-DD' (backend) or ISO string (fallback)
  units: number;
  cost?: number;
  label?: string;
}

interface DailyEnergyChartProps {
  dailyHistory: DailyHistoryItem[];
}

/** Normalises any date string → 'YYYY-MM-DD' */
function toDateStr(raw: string): string {
  // Already short: '2026-05-15'
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  // ISO with time: '2026-05-15T18:30:00.000Z'
  return raw.split('T')[0];
}

/** Returns 'May 15' style label */
function formatDayLabel(raw: string): string {
  const dateStr = toDateStr(raw);
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
}

/** Custom tooltip */
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || payload.length === 0) return null;
  const units = payload[0]?.value ?? 0;
  const cost  = payload[0]?.payload?.cost ?? 0;
  return (
    <div className="bg-[#111] border border-[#333] rounded-xl px-4 py-3 shadow-2xl text-xs">
      <p className="font-semibold text-on-surface mb-1">{label}</p>
      <p className="text-[#00e5ff]">{Number(units).toFixed(2)} kWh</p>
      {cost > 0 && <p className="text-on-surface-variant mt-0.5">≈ ₹{Number(cost).toFixed(0)}</p>}
    </div>
  );
};

export default function DailyEnergyChart({ dailyHistory }: DailyEnergyChartProps) {
  // Normalise data
  const data = dailyHistory.map(d => ({
    ...d,
    date:    toDateStr(d.date),
    label:   d.label || formatDayLabel(d.date),
    units:   parseFloat(Number(d.units).toFixed(2)),
    cost:    d.cost ? parseFloat(Number(d.cost).toFixed(0)) : undefined,
  }));

  if (data.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-xs text-on-surface-variant">
        No usage data yet — complete onboarding to generate your energy baseline.
      </div>
    );
  }

  const avgUnits = data.reduce((s, d) => s + d.units, 0) / data.length;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
        <defs>
          <linearGradient id="gradUnits" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#00e5ff" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#00e5ff" stopOpacity={0}   />
          </linearGradient>
        </defs>

        <CartesianGrid
          strokeDasharray="3 3"
          vertical={false}
          stroke="rgba(255,255,255,0.05)"
        />

        <XAxis
          dataKey="label"
          tick={{ fill: '#666', fontSize: 10 }}
          tickLine={false}
          axisLine={false}
          interval={data.length <= 10 ? 0 : Math.floor(data.length / 7)}
        />

        <YAxis
          tick={{ fill: '#666', fontSize: 10 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => `${v}`}
          width={30}
        />

        {/* Average reference line */}
        <ReferenceLine
          y={parseFloat(avgUnits.toFixed(2))}
          stroke="rgba(0,229,255,0.25)"
          strokeDasharray="4 4"
          label={{
            value: `Avg ${avgUnits.toFixed(1)}`,
            position: 'insideTopRight',
            fill: 'rgba(0,229,255,0.5)',
            fontSize: 9,
          }}
        />

        <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(0,229,255,0.2)', strokeWidth: 1 }} />

        <Area
          type="monotone"
          dataKey="units"
          stroke="#00e5ff"
          strokeWidth={2}
          fill="url(#gradUnits)"
          dot={false}
          activeDot={{ r: 4, fill: '#00e5ff', strokeWidth: 0 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
