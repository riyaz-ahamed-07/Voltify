// src/pages/Dashboard.tsx
import { useState, useEffect, lazy, Suspense } from 'react';
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
import { apiService } from '../lib/api';
import { toast } from 'react-toastify';
import GlassCard from '../components/ui/GlassCard';

const DailyEnergyChart = lazy(() => import('../components/dashboard/DailyEnergyChart'));
const ApplianceAllocationChart = lazy(() => import('../components/dashboard/ApplianceAllocationChart'));

export default function Dashboard() {
  const { user } = useAuthStore();
  const { onboarding, dailyHistory, applianceBreakdown, insights, setApplianceBreakdown, setDailyHistory, setInsights } = useDashboardStore();
  const { coins, streak_days, rank, css_applied, applyCss, removeCss, addCoins } = useGamificationStore();

  const [acTemp, setAcTemp] = useState(18); // Starting at a power-heavy 18°C
  const [fridgeTemp, setFridgeTemp] = useState(2); // Power-heavy 2°C
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [dashboardStats, setDashboardStats] = useState<any>(null);

  // Load data from backend
  useEffect(() => {
    async function loadData() {
      try {
        const [summary, usage, breakdown, lb] = await Promise.all([
          apiService.getDashboardSummary(),
          apiService.getDashboardUsage('daily'),
          apiService.getApplianceBreakdown(),
          apiService.getLeaderboard(onboarding?.household_type || 'family')
        ]);
        setDashboardStats(summary);
        if (usage.data && usage.data.length > 0) setDailyHistory(usage.data);
        if (breakdown.data && breakdown.data.length > 0) setApplianceBreakdown(breakdown.data);
        if (lb.rankings) setLeaderboard(lb.rankings);
      } catch (err) {
        console.error('Failed to load dashboard data', err);
        // Fallback for leaderboard is already covered by API simulation
      }
    }
    if (user) {
      loadData();
    }
  }, [user, onboarding]);

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
          <h1 className="font-display font-semibold text-3xl tracking-tight text-gradient">
            Energy Consumption Dashboard
          </h1>
          <p className="text-xs text-gray-400">
            Region: <span className="font-mono font-bold text-primary">{onboarding?.location || 'Chennai'}</span> | Utility Rate: <span className="font-mono text-primary">₹{tariff}/kWh</span>
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-xs backdrop-blur-md shadow-md">
          <BadgeAlert className="size-4 text-primary" />
          <span className="text-gray-400">Estimated Disaggregation Accuracy:</span>
          <span className="font-mono font-bold text-primary">{onboarding?.accuracy_pct || 94}%</span>
        </div>
      </div>

      {/* Grid: 4 glowing stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1 */}
        <GlassCard className="relative overflow-hidden group hover:border-primary/50 transition-all duration-300">
          <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-40 transition-opacity">
            <Zap className="size-10 text-primary" />
          </div>
          <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block mb-1">Avg Daily Load</span>
          <h3 className="font-mono font-semibold text-2xl text-on-surface">{dashboardStats ? dashboardStats.today.units : avgDailyUnits} kWh</h3>
          <p className="text-xs text-on-surface-variant mt-1.5 flex items-center gap-1">
            Approx. <span className="font-bold text-primary">₹{dashboardStats ? dashboardStats.today.cost : avgDailyCost}</span> per day
          </p>
        </GlassCard>

        {/* Card 2 */}
        <GlassCard className="relative overflow-hidden group hover:border-tertiary/50 transition-all duration-300">
          <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-40 transition-opacity">
            <TrendingUp className="size-10 text-tertiary" />
          </div>
          <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block mb-1">Projected {currentMonth}</span>
          <h3 className="font-mono font-semibold text-2xl text-tertiary">{formatCurrency(dashboardStats ? dashboardStats.estimated_bill.projected : dynamicProjectedBill)}</h3>
          <p className="text-xs text-on-surface-variant mt-1.5">
            Target: <span className="font-bold text-tertiary">-{cssSavings.percentage}%</span> (Saved ₹{cssSavings.money})
          </p>
        </GlassCard>

        {/* Card 3 */}
        <GlassCard className="relative overflow-hidden group hover:border-volt-pink/50 transition-all duration-300">
          <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-40 transition-opacity">
            <Flame className="size-10 text-volt-pink" />
          </div>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Active Streak</span>
          <h3 className="font-mono font-semibold text-2xl text-volt-pink">{streak_days} Days</h3>
          <p className="text-xs text-gray-400 mt-1.5">
            Multiplier active: <span className="font-bold text-volt-pink">1.15x</span> rate boost
          </p>
        </GlassCard>

        {/* Card 4 */}
        <GlassCard className="relative overflow-hidden group hover:border-primary-container/50 transition-all duration-300">
          <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-40 transition-opacity">
            <Coins className="size-10 text-primary-container" />
          </div>
          <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block mb-1">Earned Coins</span>
          <h3 className="font-mono font-semibold text-2xl text-primary-container">{coins} COINS</h3>
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
              <h3 className="font-display font-semibold text-lg text-white">Daily Energy Consumption Index</h3>
              <p className="text-xs text-gray-450">Estimated smart consumption statistics over the last 30 days</p>
            </div>
            <div className="flex gap-2">
              <span className="flex items-center gap-1.5 text-xs text-on-surface-variant">
                <span className="size-2.5 bg-primary rounded-full" /> Load (kWh)
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <Suspense fallback={<div className="h-full flex items-center justify-center text-xs text-slate-500">Loading daily metrics…</div>}>
              <DailyEnergyChart dailyHistory={dailyHistory} />
            </Suspense>
          </div>
        </GlassCard>

        {/* Recharts Appliance breakdown Pie chart */}
        <GlassCard className="flex flex-col justify-between">
          <div>
            <h3 className="font-display font-semibold text-lg text-white">Appliance Allocation Index</h3>
            <p className="text-xs text-gray-450 mb-6">Estimated load distribution based on your billing parameters</p>
          </div>

          <div className="h-44 w-full relative flex items-center justify-center">
            {applianceBreakdown.length === 0 ? (
              <p className="text-center text-xs text-outline">Configure appliances in Settings</p>
            ) : (
              <Suspense fallback={<div className="h-full flex items-center justify-center text-xs text-slate-500">Loading breakdown…</div>}>
                <ApplianceAllocationChart applianceBreakdown={applianceBreakdown} />
              </Suspense>
            )}
          </div>

          {/* Breakdown parameters list */}
          <div className="space-y-1.5 mt-4 max-h-[140px] overflow-y-auto pr-1">
            {applianceBreakdown.slice(0, 4).map((item) => (
              <div key={item.name} className="flex justify-between items-center text-xs">
                <span className="text-on-surface-variant flex items-center gap-1.5">
                  <span className="size-2.5 rounded-full" style={{ backgroundColor: item.color }} />
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
            <h3 className="font-display font-semibold text-lg text-white">
              ⚡ Appliance Targets & Guidelines
            </h3>
            <p className="text-xs text-gray-405">
              Set standard thresholds recommended by public bodies to lower your monthly statement expenses.
            </p>
          </div>

          <div className="space-y-6">
            {/* AC Temp Slider */}
            <div className="bg-white/5 border border-white/10 p-5 rounded-2xl space-y-4 backdrop-blur-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="text-lg">❄️</span>
                  <div>
                    <h4 className="text-sm font-semibold text-white">Air Conditioner Temp Settings</h4>
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
                  <CheckCircle className="size-4 flex-shrink-0" />
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
                    <h4 className="text-sm font-semibold text-white">Refrigerator Temp Settings</h4>
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
                  <CheckCircle className="size-4 flex-shrink-0" />
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
              <h3 className="font-display font-semibold text-sm text-white">ACTIVE SAVINGS QUEST</h3>
              <Sparkles className="size-4 text-primary animate-pulse" />
            </div>

            <div className="bg-white/5 border border-white/10 p-4 rounded-xl space-y-3">
              <span className="text-[9px] font-mono font-bold text-volt-pink uppercase tracking-widest block">WEEKLY QUEST</span>
              <h4 className="text-sm font-semibold text-white">Use under 100 kWh this week</h4>
              
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
            <h3 className="font-display font-semibold text-sm text-white">DISCOM LEADERBOARD PREVIEW</h3>
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
          <h3 className="font-display font-semibold text-sm text-white">ACTIVE UTILITY INSIGHTS</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeAlerts.map((alert) => (
              <div
                key={alert.title}
                className={`p-4 rounded-xl border flex gap-3 items-start text-xs ${
                  alert.type === 'warning'
                    ? 'bg-volt-pink/5 border-volt-pink/20 text-on-surface'
                    : 'bg-tertiary/5 border-tertiary/20 text-on-surface'
                }`}
              >
                {alert.type === 'warning' ? (
                  <ShieldAlert className="size-5 text-volt-pink flex-shrink-0 mt-0.5" />
                ) : (
                  <CheckCircle className="size-5 text-tertiary flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <h4 className="font-semibold text-sm leading-tight mb-1">{alert.title}</h4>
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
