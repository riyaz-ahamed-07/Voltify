import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';

interface DailyHistoryItem {
  date: string;   // either 'YYYY-MM-DD' (backend) or ISO string (fallback)
  units?: number;
  cost?: number;
  label?: string;
  actual_units?: number;
  actual_cost?: number;
  estimated_units?: number;
  accuracy_pct?: number;
}

interface DailyEnergyChartProps {
  dailyHistory: DailyHistoryItem[];
}

/** Normalises any date string → 'YYYY-MM-DD' */
function toDateStr(raw: string): string {
  if (!raw) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  return raw.split('T')[0];
}

/** Returns 'May 15' style label */
function formatDayLabel(raw: string): string {
  const dateStr = toDateStr(raw);
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
}

/** Returns 'May 2026' style label */
function formatMonthLabel(raw: string): string {
  const dateStr = toDateStr(raw);
  if (!dateStr) return '';
  const [year, month] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, 1);
  return d.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
}

/** Custom tooltip */
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || payload.length === 0) return null;
  
  const isMonthly = payload.some((p: any) => p.dataKey === 'actual' || p.dataKey === 'estimated');

  if (isMonthly) {
    const actual = payload.find((p: any) => p.dataKey === 'actual')?.value ?? 0;
    const estimated = payload.find((p: any) => p.dataKey === 'estimated')?.value ?? 0;
    const accuracy = payload[0]?.payload?.accuracy_pct ?? 100;
    
    return (
      <div className="bg-[#111] border border-[#333] rounded-xl px-4 py-3 shadow-2xl text-xs space-y-1">
        <p className="font-semibold text-on-surface">{label}</p>
        <p className="text-[#00e5ff] font-medium">Actual Bill: {Number(actual).toFixed(0)} kWh</p>
        <p className="text-[#ec4899] font-medium">Estimated: {Number(estimated).toFixed(0)} kWh</p>
        <p className="text-tertiary text-[10px] uppercase font-bold pt-1 border-t border-[#222]">
          Calibration Accuracy: {Number(accuracy).toFixed(1)}%
        </p>
      </div>
    );
  }

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
  const isMonthly = dailyHistory.some(d => 'actual_units' in d || 'estimated_units' in d);

  // Normalise data
  const data = dailyHistory.map(d => {
    if (isMonthly) {
      return {
        ...d,
        date:      toDateStr(d.date),
        label:     d.label || formatMonthLabel(d.date),
        actual:    d.actual_units ? parseFloat(Number(d.actual_units).toFixed(1)) : 0,
        estimated: d.estimated_units ? parseFloat(Number(d.estimated_units).toFixed(1)) : 0,
        accuracy_pct: d.accuracy_pct ? parseFloat(Number(d.accuracy_pct).toFixed(1)) : 100,
      };
    }

    return {
      ...d,
      date:    toDateStr(d.date),
      label:   d.label || formatDayLabel(d.date),
      units:   d.units ? parseFloat(Number(d.units).toFixed(2)) : 0,
      cost:    d.cost ? parseFloat(Number(d.cost).toFixed(0)) : undefined,
    };
  });

  if (data.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-xs text-on-surface-variant">
        No usage data yet — complete onboarding to generate your energy baseline.
      </div>
    );
  }

  const avgUnits = isMonthly 
    ? data.reduce((s, d) => s + (d.actual || 0), 0) / data.length
    : data.reduce((s, d) => s + (d.units || 0), 0) / data.length;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
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
          interval={data.length <= 12 ? 0 : Math.floor(data.length / 7)}
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
            value: `Avg ${avgUnits.toFixed(0)}`,
            position: 'insideTopRight',
            fill: 'rgba(0,229,255,0.5)',
            fontSize: 9,
          }}
        />

        <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(0,229,255,0.2)', strokeWidth: 1 }} />

        {isMonthly ? (
          <>
            <defs>
              <linearGradient id="gradActual" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#00e5ff" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#00e5ff" stopOpacity={0}   />
              </linearGradient>
              <linearGradient id="gradEstimated" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#ec4899" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#ec4899" stopOpacity={0}   />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="actual"
              stroke="#00e5ff"
              strokeWidth={2.5}
              fill="url(#gradActual)"
              dot={{ r: 4, fill: '#00e5ff', strokeWidth: 0 }}
            />
            <Area
              type="monotone"
              dataKey="estimated"
              stroke="#ec4899"
              strokeWidth={2}
              strokeDasharray="4 4"
              fill="url(#gradEstimated)"
              dot={{ r: 4, fill: '#ec4899', strokeWidth: 0 }}
            />
          </>
        ) : (
          <>
            <defs>
              <linearGradient id="gradUnits" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#00e5ff" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#00e5ff" stopOpacity={0}   />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="units"
              stroke="#00e5ff"
              strokeWidth={2}
              fill="url(#gradUnits)"
              dot={false}
              activeDot={{ r: 4, fill: '#00e5ff', strokeWidth: 0 }}
            />
          </>
        )}
      </AreaChart>
    </ResponsiveContainer>
  );
}
