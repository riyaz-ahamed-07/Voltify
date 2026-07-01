import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DailyHistoryItem {
  date: string;
  units: number;
}

interface DailyEnergyChartProps {
  dailyHistory: DailyHistoryItem[];
}

export default function DailyEnergyChart({ dailyHistory }: DailyEnergyChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={dailyHistory}>
        <defs>
          <linearGradient id="colorUnits" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#00e5ff" stopOpacity={0.2}/>
            <stop offset="95%" stopColor="#00e5ff" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
        <XAxis 
          dataKey="date" 
          tickFormatter={(str) => {
            const parts = str.split('-');
            return parts[2] ? `${parts[2]}` : ''; // day only
          }}
          tick={{ fill: '#475569', fontSize: 10 }}
          axisLine={false}
        />
        <YAxis 
          tick={{ fill: '#475569', fontSize: 10 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip 
          contentStyle={{ background: '#171c21', borderColor: 'rgba(195,245,255,0.15)', borderRadius: '8px' }}
          labelStyle={{ color: '#bac9cc', fontWeight: 'bold', fontSize: 11 }}
          itemStyle={{ color: '#00e5ff', fontSize: 12 }}
          formatter={(value: any) => [`${value} kWh`, 'Estimated Load']}
        />
        <Area type="monotone" dataKey="units" stroke="#00e5ff" strokeWidth={2} fillOpacity={1} fill="url(#colorUnits)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
