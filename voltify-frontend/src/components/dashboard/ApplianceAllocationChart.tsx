import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

interface ApplianceItem {
  name: string;
  icon?: string;
  units: number;
  percentage?: number;
  cost?: number;
  color: string;
}

interface ApplianceAllocationChartProps {
  applianceBreakdown: ApplianceItem[];
}

/** Custom tooltip */
const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload || payload.length === 0) return null;
  const d = payload[0].payload as ApplianceItem;
  return (
    <div className="bg-[#111] border border-[#333] rounded-xl px-4 py-3 shadow-2xl text-xs">
      <p className="font-semibold text-on-surface mb-1">
        {d.icon} {d.name}
      </p>
      <p style={{ color: d.color }}>{Number(d.units).toFixed(1)} kWh</p>
      {d.percentage !== undefined && (
        <p className="text-on-surface-variant mt-0.5">{Number(d.percentage).toFixed(1)}%</p>
      )}
      {d.cost !== undefined && d.cost > 0 && (
        <p className="text-on-surface-variant">≈ ₹{Number(d.cost).toFixed(0)}</p>
      )}
    </div>
  );
};

export default function ApplianceAllocationChart({ applianceBreakdown }: ApplianceAllocationChartProps) {
  // Filter out zero-unit entries so the pie has visible slices
  const data = applianceBreakdown.filter(a => a.units > 0);
  const totalUnits = data.reduce((s, a) => s + a.units, 0);

  if (data.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-xs text-on-surface-variant">
        No appliance data — complete onboarding to see your breakdown.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={48}
          outerRadius={72}
          paddingAngle={3}
          dataKey="units"
          labelLine={false}
          label={false}
          strokeWidth={0}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>

        {/* Center label */}
        <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle">
          <tspan x="50%" dy="-0.5em" fill="#ededed" fontSize={13} fontWeight={700}>
            {totalUnits.toFixed(0)}
          </tspan>
          <tspan x="50%" dy="1.4em" fill="#888" fontSize={9}>
            kWh/mo
          </tspan>
        </text>

        <Tooltip content={<CustomTooltip />} />
      </PieChart>
    </ResponsiveContainer>
  );
}
