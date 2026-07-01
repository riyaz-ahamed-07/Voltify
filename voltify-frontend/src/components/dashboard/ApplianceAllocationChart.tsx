import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

interface ApplianceItem {
  name: string;
  units: number;
  color: string;
}

interface ApplianceAllocationChartProps {
  applianceBreakdown: ApplianceItem[];
}

export default function ApplianceAllocationChart({ applianceBreakdown }: ApplianceAllocationChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={applianceBreakdown}
          cx="50%"
          cy="50%"
          innerRadius={50}
          outerRadius={75}
          paddingAngle={3}
          dataKey="units"
        >
          {applianceBreakdown.map((entry) => (
            <Cell key={`cell-${entry.name}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip 
          contentStyle={{ background: '#171c21', borderColor: 'rgba(195,245,255,0.15)', borderRadius: '8px', fontSize: 11 }}
          itemStyle={{ color: '#f1f5f9' }}
          formatter={(value: any, name: any) => [`${value} units`, name]}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
