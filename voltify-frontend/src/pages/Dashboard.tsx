// src/pages/Dashboard.tsx
import { useState, useEffect } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import {
  Zap, Flame, Coins, Trophy, Sparkles, TrendingUp, AlertTriangle, CheckCircle,
  Info, Thermometer, ShieldAlert, BadgeAlert, ArrowUpRight
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useDashboardStore } from '../store/dashboardStore';
import { useGamificationStore } from '../store/gamificationStore';
import { calculatePredictions, generateRuleBasedAlerts } from '../lib/estimation';
import { formatCurrency, formatUnits, getTariffRate } from '../lib/utils';
import { CSS_RECOMMENDATIONS, generateLeaderboard } from '../lib/mockData';
import { toast } from 'react-toastify';
import GlassCard from '../components/ui/GlassCard';

export default function Dashboard() {
  const { user } = useAuthStore();
  const { onboarding, dailyHistory, applianceBreakdown, insights, setApplianceBreakdown } = useDashboardStore();
  const { coins, streak_days, rank, css_applied, applyCss, removeCss, addCoins } = useGamificationStore();

  const [acTemp, setAcTemp] = useState(18); // Starting at a power-heavy 18°C
  const [fridgeTemp, setFridgeTemp] = useState(2); // Power-heavy 2°C
  const [leaderboard, setLeaderboard] = useState<any[]>([]);

  // Load leaderboard rankings
  useEffect(() => {
    if (user) {
      setLeaderboard(generateLeaderboard(onboarding?.household_type || 'family', {
        name: user.name,
        coins,
        streak: streak_days,
        rank,
      }));
    }
  }, [user, coins, streak_days, rank, onboarding]);

  // Initial calculations
  const tariff = getTariffRate(onboarding?.location || 'Chennai');
  const baseMonthlyBill = onboarding?.bill_amount || 3200;
  const baseMonthlyUnits = onboarding?.units_per_month || 400;

  // Real-time calculations depending on active Comfort-Safe Savings (CSS) sliders
  const getDynamicSavings = () => {
    let totalSavingsPct = 0;
    
    // AC Temp adjustments: raising AC by 1°C saves ~6% energy. Base load starts at 18°C
    if (acTemp > 18) {
      totalSavingsPct += (acTemp - 18) * 6;
    }
    // Refrigerator adjustments: raising fridge from 2°C to 4°C saves ~8% energy
    if (fridgeTemp > 2) {
      totalSavingsPct += (fridgeTemp - 2) * 4;
    }

    const unitsSaved = baseMonthlyUnits * (totalSavingsPct / 100);
    const moneySaved = unitsSaved * tariff;

    return {
      percentage: totalSavingsPct,
      units: parseFloat(unitsSaved.toFixed(1)),
      money: parseFloat(moneySaved.toFixed(0)),
    };
  };

  const cssSavings = getDynamicSavings();

  // Active predictions
  const dynamicProjectedUnits = Math.max(100, baseMonthlyUnits - cssSavings.units);
  const dynamicProjectedBill = Math.max(800, baseMonthlyBill - cssSavings.money);

  // Daily statistics
  const currentMonth = new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
  const avgDailyUnits = parseFloat((dynamicProjectedUnits / 30).toFixed(1));
  const avgDailyCost = parseFloat((avgDailyUnits * tariff).toFixed(0));

  // Dynamic comfort score
  const dynamicComfortScore = Math.max(50, 100 - (acTemp - 18) * 1.5 - (fridgeTemp - 2) * 2.5);

  // Active BEE slide handles
  const handleAcSlide = (val: number) => {
    setAcTemp(val);
    if (val >= 24) {
      if (!css_applied.includes('ac_temp')) {
        applyCss('ac_temp');
        addCoins(100);
        toast.success('🎯 BEE Target Achieved! +100 Coins for raising AC to optimal 24°C!');
      }
    } else {
      if (css_applied.includes('ac_temp')) {
        removeCss('ac_temp');
      }
    }
  };

  const handleFridgeSlide = (val: number) => {
    setFridgeTemp(val);
    if (val >= 4) {
      if (!css_applied.includes('fridge_temp')) {
        applyCss('fridge_temp');
        addCoins(50);
        toast.success('🎯 Food Safety standard matched! +50 Coins for raising Refrigerator to optimal 4°C!');
      }
    } else {
      if (css_applied.includes('fridge_temp')) {
        removeCss('fridge_temp');
      }
    }
  };

  // Live telemetry alerts list
  const activeAlerts = generateRuleBasedAlerts(dailyHistory, baseMonthlyBill, dynamicProjectedBill);

  return (
    <div className="space-y-8 font-headline text-on-surface">
      {/* Upper overview section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-display font-extrabold text-3xl tracking-tight text-gradient">
            ENERGY TELEMETRY CONSOLE
          </h1>
          <p className="text-sm text-on-surface-variant">
            Telemetry Region: <span className="font-mono font-bold text-primary">{onboarding?.location || 'Chennai'}</span> | Model Rate: <span className="font-mono text-primary">₹{tariff}/kWh</span>
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-xs backdrop-blur-md shadow-md">
          <BadgeAlert className="w-4 h-4 text-primary" />
          <span className="text-gray-400">Estimated Disaggregation Accuracy:</span>
          <span className="font-mono font-bold text-primary">{onboarding?.accuracy_pct || 94}%</span>
        </div>
      </div>

      {/* Grid: 4 glowing stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1 */}
        <GlassCard className="relative overflow-hidden group hover:border-primary/50 transition-all duration-300">
          <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-40 transition-opacity">
            <Zap className="w-10 h-10 text-primary" />
          </div>
          <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block mb-1">Avg Daily Load</span>
          <h3 className="font-mono font-extrabold text-2xl text-on-surface">{avgDailyUnits} kWh</h3>
          <p className="text-xs text-on-surface-variant mt-1.5 flex items-center gap-1">
            Approx. <span className="font-bold text-primary">₹{avgDailyCost}</span> per day
          </p>
        </GlassCard>

        {/* Card 2 */}
        <GlassCard className="relative overflow-hidden group hover:border-tertiary/50 transition-all duration-300">
          <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-40 transition-opacity">
            <TrendingUp className="w-10 h-10 text-tertiary" />
          </div>
          <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block mb-1">Projected {currentMonth}</span>
          <h3 className="font-mono font-extrabold text-2xl text-tertiary">{formatCurrency(dynamicProjectedBill)}</h3>
          <p className="text-xs text-on-surface-variant mt-1.5">
            Target: <span className="font-bold text-tertiary">-{cssSavings.percentage}%</span> (Saved ₹{cssSavings.money})
          </p>
        </GlassCard>

        {/* Card 3 */}
        <GlassCard className="relative overflow-hidden group hover:border-volt-pink/50 transition-all duration-300">
          <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-40 transition-opacity">
            <Flame className="w-10 h-10 text-volt-pink" />
          </div>
          <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block mb-1">Active Streak</span>
          <h3 className="font-mono font-extrabold text-2xl text-volt-pink">{streak_days} Days</h3>
          <p className="text-xs text-on-surface-variant mt-1.5">
            Active Multiplier: <span className="font-bold text-volt-pink">1.15x</span> Telemetry Bonus
          </p>
        </GlassCard>

        {/* Card 4 */}
        <GlassCard className="relative overflow-hidden group hover:border-primary-container/50 transition-all duration-300">
          <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-40 transition-opacity">
            <Coins className="w-10 h-10 text-primary-container" />
          </div>
          <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block mb-1">Earned Coins</span>
          <h3 className="font-mono font-extrabold text-2xl text-primary-container">{coins} COINS</h3>
          <p className="text-xs text-on-surface-variant mt-1.5">
            Redeemable in <span className="font-bold text-primary-container">Shop Console</span>
          </p>
        </GlassCard>
      </div>

      {/* Grid: Daily Usage Chart & Appliance breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recharts Daily Usage Area chart */}
        <GlassCard className="col-span-1 lg:col-span-2 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-display font-bold text-lg text-on-surface">DAILY ENERGY CONSUMPTION INDEX</h3>
              <p className="text-xs text-on-surface-variant">Showing estimated smart-calibrated telemetry log for the last 30 days</p>
            </div>
            <div className="flex gap-2">
              <span className="flex items-center gap-1.5 text-xs text-on-surface-variant">
                <span className="w-2.5 h-2.5 bg-primary rounded-full" /> Load (kWh)
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyHistory}>
                <defs>
                  <linearGradient id="colorUnits" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00e5ff" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#00e5ff" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(str) => {
                    const parts = str.split('-');
                    return `${parts[2]}`; // day only
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
          </div>
        </GlassCard>

        {/* Recharts Appliance breakdown Pie chart */}
        <GlassCard className="flex flex-col justify-between">
          <div>
            <h3 className="font-display font-bold text-lg text-on-surface">APPLIANCE CALIBRATION INDEX</h3>
            <p className="text-xs text-on-surface-variant mb-6">Visual distribution breakdown based on your active usage profile</p>
          </div>

          <div className="h-44 w-full relative flex items-center justify-center">
            {applianceBreakdown.length === 0 ? (
              <p className="text-center text-xs text-outline">Configure appliances in Settings</p>
            ) : (
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
                    {applianceBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ background: '#171c21', borderColor: 'rgba(195,245,255,0.15)', borderRadius: '8px', fontSize: 11 }}
                    itemStyle={{ color: '#f1f5f9' }}
                    formatter={(value: any, name: any) => [`${value} units`, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Breakdown parameters list */}
          <div className="space-y-1.5 mt-4 max-h-[140px] overflow-y-auto pr-1">
            {applianceBreakdown.slice(0, 4).map((item) => (
              <div key={item.name} className="flex justify-between items-center text-xs">
                <span className="text-on-surface-variant flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span>{item.icon} {item.name}</span>
                </span>
                <span className="font-mono text-on-surface font-bold">{item.percentage}% ({formatCurrency(item.cost)})</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Grid: BEE Comfort Sliders & Gamification */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* BEE Sliders panel */}
        <GlassCard className="col-span-1 lg:col-span-2 space-y-6">
          <div>
            <h3 className="font-display font-bold text-lg text-on-surface">
              ⚡ COMFORT-SAFE SAVINGS (CSS) MANAGER
            </h3>
            <p className="text-xs text-on-surface-variant">
              Interact with optimal temperature values to reduce your bill instantly without sacrificing comfort.
            </p>
          </div>

          <div className="space-y-6">
            {/* AC Temp Slider */}
            <div className="bg-white/5 border border-white/10 p-5 rounded-2xl space-y-4 backdrop-blur-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="text-lg">❄️</span>
                  <div>
                    <h4 className="text-sm font-bold text-white">Air Conditioner Temp Settings</h4>
                    <p className="text-[10px] text-gray-400 font-medium">BEE Optimal Standard: <span className="text-primary font-bold font-mono">24°C</span></p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`font-mono font-bold text-lg ${acTemp >= 24 ? 'text-primary' : 'text-volt-amber'}`}>{acTemp}°C</span>
                </div>
              </div>

              <div className="flex gap-4 items-center">
                <span className="text-xs text-gray-500 font-mono">18°C</span>
                <input
                  type="range"
                  min={18}
                  max={26}
                  step={1}
                  value={acTemp}
                  onChange={(e) => handleAcSlide(parseInt(e.target.value))}
                  className="flex-1 accent-primary h-1.5 bg-white/10 rounded-lg cursor-pointer outline-none"
                />
                <span className="text-xs text-gray-500 font-mono">26°C</span>
              </div>

              {acTemp >= 24 ? (
                <div className="bg-primary/15 border border-primary/20 p-3 rounded-xl text-xs text-primary flex gap-2.5 items-center">
                  <CheckCircle className="w-4 h-4 flex-shrink-0" />
                  <p>BEE standard active! Saving <span className="font-bold">~36% AC energy</span> with zero healthy comfort loss.</p>
                </div>
              ) : (
                <p className="text-[11px] text-gray-400 italic">
                  Tip: Raising temperature from 18°C to 24°C will immediately save you <span className="text-primary font-bold">₹900/month</span>!
                </p>
              )}
            </div>

            {/* Refrigerator Temp Slider */}
            <div className="bg-white/5 border border-white/10 p-5 rounded-2xl space-y-4 backdrop-blur-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="text-lg">🧊</span>
                  <div>
                    <h4 className="text-sm font-bold text-white">Refrigerator Temp Settings</h4>
                    <p className="text-[10px] text-gray-400 font-medium">WHO Safety Standard: <span className="text-primary font-bold font-mono">4°C</span></p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`font-mono font-bold text-lg ${fridgeTemp >= 4 ? 'text-primary' : 'text-volt-amber'}`}>{fridgeTemp}°C</span>
                </div>
              </div>

              <div className="flex gap-4 items-center">
                <span className="text-xs text-gray-500 font-mono">1°C</span>
                <input
                  type="range"
                  min={1}
                  max={6}
                  step={1}
                  value={fridgeTemp}
                  onChange={(e) => handleFridgeSlide(parseInt(e.target.value))}
                  className="flex-1 accent-primary h-1.5 bg-white/10 rounded-lg cursor-pointer outline-none"
                />
                <span className="text-xs text-gray-500 font-mono">6°C</span>
              </div>

              {fridgeTemp >= 4 ? (
                <div className="bg-primary/15 border border-primary/20 p-3 rounded-xl text-xs text-primary flex gap-2.5 items-center">
                  <CheckCircle className="w-4 h-4 flex-shrink-0" />
                  <p>Optimal compressor cycle active! Reduced consumption by <span className="font-bold">~8%</span>.</p>
                </div>
              ) : (
                <p className="text-[11px] text-gray-400 italic">
                  Tip: Raising from 2°C to 4°C reduces motor cycles with absolute food safety.
                </p>
              )}
            </div>
          </div>
        </GlassCard>

        {/* Side column: Active quests & Leadersboard rankings */}
        <div className="space-y-6">
          {/* Active challenges */}
          <GlassCard className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-display font-bold text-sm text-white">ACTIVE SAVINGS QUEST</h3>
              <Sparkles className="w-4 h-4 text-primary animate-pulse" />
            </div>

            <div className="bg-white/5 border border-white/10 p-4 rounded-xl space-y-3">
              <span className="text-[9px] font-mono font-bold text-volt-pink uppercase tracking-widest block">WEEKLY QUEST</span>
              <h4 className="text-sm font-bold text-white">Use under 100 kWh this week</h4>
              
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-mono">
                  <span className="text-gray-400 font-medium">Progress: 67 / 100 units</span>
                  <span className="text-primary font-bold">67%</span>
                </div>
                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="bg-primary h-full rounded-full" style={{ width: '67%' }} />
                </div>
              </div>

              <div className="flex justify-between items-center text-[10px] text-gray-400 pt-2 border-t border-white/5">
                <span>Reward: <span className="font-bold text-primary font-mono">150 Coins</span></span>
                <span className="font-mono uppercase text-volt-pink font-semibold">3 Days left</span>
              </div>
            </div>
          </GlassCard>

          {/* Leaders board rankings */}
          <GlassCard className="space-y-4">
            <h3 className="font-display font-bold text-sm text-white">DISCOM LEADERBOARD PREVIEW</h3>
            <div className="space-y-1.5">
              {leaderboard.slice(0, 5).map((e) => (
                <div
                  key={e.name}
                  className={`flex justify-between items-center p-2 rounded-xl text-xs transition-colors ${
                    e.is_current_user
                      ? 'bg-primary/10 border border-primary/20 text-primary font-bold shadow-cyan'
                      : 'hover:bg-white/5 text-gray-400 hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="w-4 text-center font-mono font-bold text-[10px] text-gray-500">#{e.rank}</span>
                    <span>{e.name}</span>
                  </span>
                  <div className="flex items-center gap-3 font-mono font-bold text-white">
                    <span className="text-volt-pink font-semibold">{e.streak}d</span>
                    <span>{e.coins} c</span>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Grid: Alerts & Smart notifications */}
      {activeAlerts.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-display font-bold text-sm text-on-surface">ACTIVE TELEMETRY ALERTS</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeAlerts.map((alert, i) => (
              <div
                key={i}
                className={`p-4 rounded-xl border flex gap-3 items-start text-xs ${
                  alert.type === 'warning'
                    ? 'bg-volt-pink/5 border-volt-pink/20 text-on-surface'
                    : 'bg-tertiary/5 border-tertiary/20 text-on-surface'
                }`}
              >
                {alert.type === 'warning' ? (
                  <ShieldAlert className="w-5 h-5 text-volt-pink flex-shrink-0 mt-0.5" />
                ) : (
                  <CheckCircle className="w-5 h-5 text-tertiary flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <h4 className="font-bold text-sm leading-tight mb-1">{alert.title}</h4>
                  <p className="text-on-surface-variant leading-relaxed">{alert.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
export { Dashboard };
