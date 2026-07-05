// src/pages/Dashboard.tsx
import { useState, useEffect, lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import {
  Zap, Flame, Coins, Trophy, Sparkles, TrendingUp, AlertTriangle, CheckCircle,
  Info, Thermometer, ShieldAlert, BadgeAlert, ArrowUpRight, Plus, Minus, ArrowRight, ArrowLeft, Sliders, Check
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
import { Appliance, DEFAULT_APPLIANCES } from '../types/appliance';

const DailyEnergyChart = lazy(() => import('../components/dashboard/DailyEnergyChart'));
const ApplianceAllocationChart = lazy(() => import('../components/dashboard/ApplianceAllocationChart'));


export default function Dashboard() {
  const { user } = useAuthStore();
  const { onboarding, dailyHistory, applianceBreakdown, insights, setApplianceBreakdown, setDailyHistory, setInsights } = useDashboardStore();
  const { coins, streak_days, rank, css_applied, applyCss, removeCss, addCoins, setCoins, setStreak } = useGamificationStore();

  const [acTemp, setAcTemp] = useState(18); // Starting at a power-heavy 18°C
  const [fridgeTemp, setFridgeTemp] = useState(2); // Power-heavy 2°C
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [usagePeriod, setUsagePeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [activeChallenge, setActiveChallenge] = useState<any>(null);
  const [gamificationStats, setGamificationStats] = useState<any>(null);
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [claimingCheckIn, setClaimingCheckIn] = useState(false);

  // Telemetry check-in states
  const [checkInStep, setCheckInStep] = useState(1);
  const [checkInUnits, setCheckInUnits] = useState(10.5);
  const [checkInApplianceHours, setCheckInApplianceHours] = useState<Record<string, number>>({});

  const userAppliances = onboarding?.appliances || Object.entries(DEFAULT_APPLIANCES).map(([id, app]) => ({ ...app, id } as Appliance));
  const checkInAvgDailyUnits = onboarding?.units_per_month ? parseFloat((onboarding.units_per_month / 30).toFixed(1)) : 10.5;

  // Sync initial state when modal opens or onboarding loads
  useEffect(() => {
    if (showCheckInModal) {
      setCheckInStep(1);
      setCheckInUnits(checkInAvgDailyUnits);
      const initialHours: Record<string, number> = {};
      userAppliances.forEach((app) => {
        initialHours[app.id] = app.avg_hours_day;
      });
      setCheckInApplianceHours(initialHours);
    }
  }, [showCheckInModal, onboarding]);

  // Load general dashboard data from backend
  useEffect(() => {
    async function loadData() {
      try {
        const [summary, breakdown, lb, chal, gamestats] = await Promise.all([
          apiService.getDashboardSummary(),
          apiService.getApplianceBreakdown(),
          apiService.getLeaderboard(onboarding?.household_type || 'family'),
          apiService.getGamificationChallenge(),
          apiService.getGamificationStats()
        ]);

        if (summary) {
          setDashboardStats(summary);
          if (summary.gamification) {
            setCoins(summary.gamification.coins);
            setStreak(summary.gamification.streak_days);
          }
        }

        if (gamestats) {
          setGamificationStats(gamestats);
          // Check if today is already checked in
          const todayStr = new Date().toISOString().split('T')[0];
          const alreadyCheckedIn = gamestats.recent_transactions?.some((tx: any) => {
            const txDate = tx.created_at.split('T')[0];
            return tx.type === 'checkin' && txDate === todayStr;
          });
          
          if (!alreadyCheckedIn) {
            setShowCheckInModal(true);
          }
        }

        // Backend returns { data: [{name, icon, units, percentage, cost, color}] }
        if (breakdown?.data && Array.isArray(breakdown.data) && breakdown.data.length > 0) {
          setApplianceBreakdown(breakdown.data);
        }

        if (lb?.rankings && Array.isArray(lb.rankings)) {
          setLeaderboard(lb.rankings);
        }

        if (chal?.challenge) {
          setActiveChallenge(chal.challenge);
        }
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      }
    }
    if (user) {
      loadData();
    }
  }, [user, onboarding]);

  // Sync and update usage graph history when period changes
  useEffect(() => {
    async function loadUsage() {
      try {
        const usage = await apiService.getDashboardUsage(usagePeriod);
        if (usage?.data && Array.isArray(usage.data)) {
          setDailyHistory(usage.data);
        }
      } catch (err) {
        console.error('Failed to load usage history', err);
      }
    }
    if (user) {
      loadUsage();
    }
  }, [user, onboarding, usagePeriod]);

  const handleClaimDailyCheckIn = async (units: number, applianceHours: Record<string, number>) => {
    try {
      setClaimingCheckIn(true);
      const res = await apiService.dailyCheckin({ total_units: units, appliance_hours: applianceHours });
      if (res.success) {
        toast.success(`✨ Daily Telemetry Logged! +${res.coins_earned} Coins awarded!`);
        addCoins(res.coins_earned);
        setStreak(res.new_streak);
        setShowCheckInModal(false);
        // Refresh summary stats and stats object
        const [summary, gamestats, usage] = await Promise.all([
          apiService.getDashboardSummary(),
          apiService.getGamificationStats(),
          apiService.getDashboardUsage(usagePeriod)
        ]);
        if (summary) setDashboardStats(summary);
        if (gamestats) setGamificationStats(gamestats);
        if (usage?.data && Array.isArray(usage.data)) setDailyHistory(usage.data);
      }
    } catch (err: any) {
      toast.warning(err.message || 'Already checked in today!');
      setShowCheckInModal(false);
    } finally {
      setClaimingCheckIn(false);
    }
  };

  // Initial calculations
  const tariff = getTariffRate(onboarding?.location || 'Chennai', onboarding?.units_per_month || 400);
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
          <h1 className="font-display font-semibold text-3xl tracking-tight text-on-surface">
            Energy Consumption Dashboard
          </h1>
          <p className="text-xs text-on-surface-variant mt-1">
            Region: <span className="font-mono font-semibold text-primary">{onboarding?.location || 'Chennai'}</span> | Utility Rate: <span className="font-mono text-primary">₹{tariff}/kWh</span>
          </p>
        </div>
        <div className="flex items-center gap-2 bg-surface border border-outline px-4 py-2 rounded-xl text-xs shadow-sm">
          <BadgeAlert className="size-4 text-primary" />
          <span className="text-on-surface-variant">Estimated Disaggregation Accuracy:</span>
          <span className="font-mono font-semibold text-primary">{onboarding?.accuracy_pct || 94}%</span>
        </div>
      </div>

      {/* Grid: 4 stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1 */}
        <GlassCard className="relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity text-primary">
            <Zap className="size-10" />
          </div>
          <span className="text-xs font-semibold text-on-surface-variant block mb-1">Avg Daily Load</span>
          <h3 className="font-semibold text-2xl text-on-surface">
            {dashboardStats?.today?.units > 0 ? `${dashboardStats.today.units} kWh` : `${avgDailyUnits} kWh`}
          </h3>
          <p className="text-xs text-on-surface-variant mt-1.5 flex items-center gap-1">
            Approx.{' '}
            <span className="font-semibold text-on-surface">
              ₹{dashboardStats?.today?.cost > 0 ? dashboardStats.today.cost : avgDailyCost}
            </span>{' '}per day
          </p>
        </GlassCard>

        {/* Card 2 */}
        <GlassCard className="relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity text-tertiary">
            <TrendingUp className="size-10" />
          </div>
          <span className="text-xs font-semibold text-on-surface-variant block mb-1">Projected {currentMonth}</span>
          <h3 className="font-semibold text-2xl text-on-surface">
            {formatCurrency(
              dashboardStats?.estimated_bill?.projected > 0
                ? dashboardStats.estimated_bill.projected
                : dynamicProjectedBill
            )}
          </h3>
          <p className="text-xs text-on-surface-variant mt-1.5">
            Target: <span className="font-semibold text-tertiary">-{cssSavings.percentage}%</span> (Saved ₹{cssSavings.money})
          </p>
        </GlassCard>

        {/* Card 3 */}
        <Link to="/streak" className="block cursor-pointer">
          <GlassCard className="relative overflow-hidden group hover:border-volt-pink/40 hover:shadow-[0_0_15px_rgba(236,72,153,0.05)] transition-all duration-300 h-full">
            <div className="absolute top-0 right-0 p-3 opacity-15 group-hover:opacity-25 transition-opacity text-volt-pink">
              <Flame className="size-10 text-volt-pink shrink-0" />
            </div>
            <span className="text-xs font-semibold text-on-surface-variant block mb-1">Active Streak</span>
            <h3 className="font-semibold text-2xl text-on-surface font-mono">{streak_days} Days</h3>
            <p className="text-xs text-on-surface-variant mt-1.5">
              Multiplier active: <span className="font-bold text-volt-pink">{streak_days >= 90 ? '1.60x' : streak_days >= 30 ? '1.35x' : streak_days >= 7 ? '1.15x' : '1.00x'}</span> rate boost
            </p>
          </GlassCard>
        </Link>

        {/* Card 4 */}
        <Link to="/shop" className="block cursor-pointer">
          <GlassCard className="relative overflow-hidden group hover:border-primary/40 hover:shadow-[0_0_15px_rgba(0,229,255,0.05)] transition-all duration-300 h-full">
            <div className="absolute top-0 right-0 p-3 opacity-15 group-hover:opacity-25 transition-opacity text-primary">
              <Coins className="size-10 text-primary shrink-0" />
            </div>
            <span className="text-xs font-semibold text-on-surface-variant block mb-1">Earned Coins</span>
            <h3 className="font-semibold text-2xl text-on-surface font-mono">{coins} COINS</h3>
            <p className="text-xs text-on-surface-variant mt-1.5 flex items-center gap-1">
              Redeemable in <span className="font-semibold text-primary group-hover:underline">Shop Console</span> <ArrowUpRight className="size-3" />
            </p>
          </GlassCard>
        </Link>
      </div>

      {/* Grid: Daily Usage Chart & Appliance breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily/Weekly/Monthly Usage Chart */}
        <GlassCard className="col-span-1 lg:col-span-2 flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-4">
            <div>
              <h3 className="font-display font-semibold text-lg text-on-surface">Energy Consumption Index</h3>
              <p className="text-xs text-on-surface-variant mt-0.5">
                {usagePeriod === 'daily' && `Last ${dailyHistory.length} days of estimated daily load`}
                {usagePeriod === 'weekly' && `Last ${dailyHistory.length} weeks of aggregated consumption`}
                {usagePeriod === 'monthly' && `Historical utility statements and calibration accuracy`}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Period Selectors */}
              <div className="flex p-0.5 bg-white/5 border border-white/[0.06] rounded-xl text-xs font-semibold shrink-0">
                {(['daily', 'weekly', 'monthly'] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setUsagePeriod(p)}
                    className={`px-3 py-1.5 rounded-lg capitalize transition-all duration-200 ${
                      usagePeriod === p
                        ? 'bg-primary text-surface font-bold shadow-md shadow-primary/10'
                        : 'text-on-surface-variant hover:text-white'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="h-64 w-full">
            <Suspense fallback={<div className="h-full flex items-center justify-center text-xs text-on-surface-variant">Loading chart…</div>}>
              <DailyEnergyChart dailyHistory={dailyHistory} />
            </Suspense>
          </div>

          {/* Dynamic Estimation Disclaimer Note */}
          <div className="mt-4 p-3 bg-white/[0.02] border border-white/[0.04] rounded-xl flex items-start gap-2.5 text-[11px] text-on-surface-variant leading-relaxed">
            <Info className="size-4 text-primary shrink-0 mt-0.5" />
            <p>
              <span className="font-semibold text-white">Estimation Notice:</span> Voltify disaggregates your consumption patterns using comparative matching algorithms and actual statement calibration. These values represent mathematical projections rather than perfect live meter readings, and may carry a dynamic variance.
            </p>
          </div>
        </GlassCard>

        {/* Premium Progressive Donut & Allocation Matrix (Re-introducing elegant interactive Pie Chart) */}
        <GlassCard className="flex flex-col h-full justify-between">
          <div>
            <div className="flex justify-between items-center mb-1">
              <h3 className="font-display font-semibold text-lg text-on-surface">Appliance Allocation Index</h3>
              <span className="flex items-center gap-1.5 text-[10px] uppercase font-mono tracking-wider font-semibold text-primary">
                <span className="size-1.5 rounded-full bg-primary animate-ping" /> Dynamic Share
              </span>
            </div>
            <p className="text-xs text-on-surface-variant mb-4">Estimated load distribution based on billing parameters</p>
          </div>

          {applianceBreakdown.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-xs text-on-surface-variant italic">
              Configure appliances in Settings
            </div>
          ) : (
            <div className="space-y-4">
              {/* Interactive Glowing Donut Pie Chart */}
              <div className="h-44 w-full relative flex items-center justify-center bg-white/[0.01] border border-white/[0.03] rounded-2xl p-2 shadow-inner">
                <Suspense fallback={<div className="h-full flex items-center justify-center text-xs text-on-surface-variant">Loading breakdown…</div>}>
                  <ApplianceAllocationChart applianceBreakdown={applianceBreakdown} />
                </Suspense>
              </div>

              {/* Progressive List */}
              <div className="space-y-2.5 overflow-y-auto max-h-[190px] pr-1">
                {applianceBreakdown.map((item) => (
                  <div 
                    key={item.name} 
                    className="p-2.5 bg-white/[0.02] border border-white/[0.04] rounded-xl space-y-2 transition-all duration-300 hover:bg-white/[0.05] hover:border-white/[0.08]"
                  >
                    <div className="flex justify-between items-center text-[11px]">
                      <div className="flex items-center gap-2">
                        <div 
                          className="size-6 rounded-md flex items-center justify-center text-xs border"
                          style={{ 
                            backgroundColor: `${item.color}15`, 
                            borderColor: `${item.color}30` 
                          }}
                        >
                          <span style={{ textShadow: `0 0 6px ${item.color}` }}>{item.icon}</span>
                        </div>
                        <div>
                          <h4 className="font-bold text-white capitalize">{item.name}</h4>
                        </div>
                      </div>
                      <div className="text-right flex items-center gap-2">
                        <span className="text-on-surface-variant font-mono font-medium">{formatUnits(item.units)}</span>
                        <span className="text-white font-bold">•</span>
                        <span className="text-white font-bold">{formatCurrency(item.cost)}</span>
                        <span 
                          className="font-mono font-bold px-1.5 py-0.5 rounded bg-white/5"
                          style={{ color: item.color }}
                        >
                          {item.percentage}%
                        </span>
                      </div>
                    </div>

                    {/* Progressive Bar */}
                    <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-500" 
                        style={{ 
                          width: `${item.percentage}%`,
                          backgroundColor: item.color,
                          boxShadow: `0 0 6px ${item.color}`
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </GlassCard>
      </div>

      {/* Grid: BEE Comfort Sliders & Gamification */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* BEE Sliders panel */}
        <GlassCard className="col-span-1 lg:col-span-2 space-y-6">
          <div>
            <h3 className="font-display font-semibold text-lg text-on-surface">
              ⚡ Appliance Targets & Guidelines
            </h3>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Set standard thresholds recommended by public bodies to lower your monthly statement expenses.
            </p>
          </div>

          <div className="space-y-6">
            {/* AC Temp Slider */}
            <div className="bg-surface border border-outline p-5 rounded-xl space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="text-lg">❄️</span>
                  <div>
                    <h4 className="text-sm font-semibold text-on-surface">Air Conditioner Temp Settings</h4>
                    <p className="text-xs text-on-surface-variant font-medium">BEE Optimal Standard: <span className="text-primary font-semibold">24°C</span></p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`font-semibold text-lg ${acTemp >= 24 ? 'text-primary' : 'text-error'}`}>{acTemp}°C</span>
                </div>
              </div>

              <div className="flex gap-4 items-center">
                <span className="text-xs text-on-surface-variant">18°C</span>
                <input
                  type="range"
                  min={18}
                  max={26}
                  step={1}
                  value={acTemp}
                  onChange={(e) => handleAcSlide(parseInt(e.target.value))}
                  className="flex-1 accent-primary h-1.5 bg-outline rounded-lg cursor-pointer outline-none"
                />
                <span className="text-xs text-on-surface-variant">26°C</span>
              </div>

              {acTemp >= 24 ? (
                <div className="bg-primary/10 border border-primary/20 p-3 rounded-lg text-xs text-primary flex gap-2.5 items-center">
                  <CheckCircle className="size-4 flex-shrink-0" />
                  <p>BEE standard active! Saving <span className="font-semibold">~36% AC energy</span> with zero healthy comfort loss.</p>
                </div>
              ) : (
                <p className="text-xs text-on-surface-variant italic">
                  Tip: Raising temperature from 18°C to 24°C will immediately save you <span className="text-primary font-semibold">₹900/month</span>!
                </p>
              )}
            </div>

            {/* Refrigerator Temp Slider */}
            <div className="bg-surface border border-outline p-5 rounded-xl space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="text-lg">🧊</span>
                  <div>
                    <h4 className="text-sm font-semibold text-on-surface">Refrigerator Temp Settings</h4>
                    <p className="text-xs text-on-surface-variant font-medium">WHO Safety Standard: <span className="text-primary font-semibold">4°C</span></p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`font-semibold text-lg ${fridgeTemp >= 4 ? 'text-primary' : 'text-error'}`}>{fridgeTemp}°C</span>
                </div>
              </div>

              <div className="flex gap-4 items-center">
                <span className="text-xs text-on-surface-variant">1°C</span>
                <input
                  type="range"
                  min={1}
                  max={6}
                  step={1}
                  value={fridgeTemp}
                  onChange={(e) => handleFridgeSlide(parseInt(e.target.value))}
                  className="flex-1 accent-primary h-1.5 bg-outline rounded-lg cursor-pointer outline-none"
                />
                <span className="text-xs text-on-surface-variant">6°C</span>
              </div>

              {fridgeTemp >= 4 ? (
                <div className="bg-primary/10 border border-primary/20 p-3 rounded-lg text-xs text-primary flex gap-2.5 items-center">
                  <CheckCircle className="size-4 flex-shrink-0" />
                  <p>Optimal compressor cycle active! Reduced consumption by <span className="font-semibold">~8%</span>.</p>
                </div>
              ) : (
                <p className="text-xs text-on-surface-variant italic">
                  Tip: Raising from 2°C to 4°C reduces motor cycles with absolute food safety.
                </p>
              )}
            </div>
          </div>
        </GlassCard>

        {/* Side column: Active quests & Leadersboard rankings */}
        <div className="space-y-6">
          {/* Active challenges */}
          <Link to="/streak" className="block cursor-pointer">
            <GlassCard className="space-y-4 hover:border-primary/30 transition-all duration-300">
              <div className="flex justify-between items-center">
                <h3 className="font-display font-semibold text-sm text-on-surface uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="size-4 text-tertiary animate-pulse" /> Active Savings Quest
                </h3>
                <span className="text-[10px] bg-tertiary/10 text-tertiary border border-tertiary/20 px-2 py-0.5 rounded font-mono font-bold">Quest</span>
              </div>

              {activeChallenge ? (
                <div className="bg-surface border border-outline p-4 rounded-xl space-y-3">
                  <span className="text-[10px] font-bold text-volt-pink uppercase tracking-widest block">WEEKLY SAVINGS CHALLENGE</span>
                  <h4 className="text-sm font-semibold text-on-surface">{activeChallenge.title}</h4>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-on-surface-variant font-medium">
                        Progress: {Number(activeChallenge.current_units).toFixed(0)} / {Number(activeChallenge.target_units).toFixed(0)} kWh
                      </span>
                      <span className={activeChallenge.on_track ? "text-tertiary font-bold animate-pulse" : "text-error font-bold"}>
                        {activeChallenge.progress_pct}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-outline rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-300 ${
                          activeChallenge.on_track ? 'bg-tertiary shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'bg-error'
                        }`}
                        style={{ width: `${Math.min(100, activeChallenge.progress_pct)}%` }} 
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-xs text-on-surface-variant pt-2 border-t border-outline font-medium">
                    <span>Reward: <span className="font-semibold text-primary">{activeChallenge.coins_reward} Coins</span></span>
                    <span className="uppercase text-volt-pink font-semibold">{activeChallenge.days_remaining} Days left</span>
                  </div>
                </div>
              ) : (
                <div className="border border-dashed border-white/10 rounded-xl p-6 text-center text-xs text-on-surface-variant italic">
                  No active quest. Complete onboarding profile to begin weekly saving challenges!
                </div>
              )}
            </GlassCard>
          </Link>

          {/* Leaders board rankings */}
          <GlassCard className="space-y-4">
            <h3 className="font-display font-semibold text-sm text-on-surface">DISCOM LEADERBOARD PREVIEW</h3>
            <div className="space-y-1.5">
              {leaderboard.slice(0, 5).map((e) => (
                <div
                  key={e.name}
                  className={`flex justify-between items-center p-2 rounded-lg text-xs transition-colors ${
                    e.is_current_user
                      ? 'bg-primary/10 border border-primary/20 text-primary font-semibold shadow-sm'
                      : 'hover:bg-surface text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="w-4 text-center font-semibold text-[10px] text-on-surface-variant">#{e.rank}</span>
                    <span>{e.name}</span>
                  </span>
                  <div className="flex items-center gap-3 font-semibold text-on-surface">
                    <span className="text-tertiary">{e.streak}d</span>
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
          <h3 className="font-display font-semibold text-sm text-on-surface">ACTIVE UTILITY INSIGHTS</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeAlerts.map((alert) => (
              <div
                key={alert.title}
                className={`p-4 rounded-xl border flex gap-3 items-start text-xs ${
                  alert.type === 'warning'
                    ? 'bg-error/10 border-error/20 text-on-surface'
                    : 'bg-tertiary/10 border-tertiary/20 text-on-surface'
                }`}
              >
                {alert.type === 'warning' ? (
                  <ShieldAlert className="size-5 text-error flex-shrink-0 mt-0.5" />
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
      {/* Daily Check-In Modal with Interactive Telemetry Log */}
      {showCheckInModal && (() => {
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md animate-fade-in px-4">
            <GlassCard className="max-w-md w-full p-8 border border-white/[0.08] shadow-[0_0_50px_rgba(236,72,153,0.15)] relative overflow-hidden space-y-6">
              {/* Glowing neon effects */}
              <div className="absolute -top-24 -left-24 size-48 bg-volt-pink/20 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -right-24 size-48 bg-primary/20 rounded-full blur-3xl pointer-events-none" />

              {/* Close button */}
              <button
                onClick={() => setShowCheckInModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors cursor-pointer text-sm font-bold p-1 hover:bg-white/5 rounded-lg"
              >
                ✕
              </button>

              {/* Header section */}
              <div className="text-center space-y-2">
                <div className="mx-auto size-16 rounded-full bg-volt-pink/15 flex items-center justify-center border border-volt-pink/25 shadow-[0_0_20px_rgba(236,72,153,0.2)] animate-pulse mb-2">
                  <Flame className="size-8 text-volt-pink" />
                </div>
                <h3 className="font-display font-bold text-xl text-white tracking-tight">Daily Telemetry Log</h3>
                <p className="text-[11px] text-on-surface-variant leading-relaxed">
                  {checkInStep === 1
                    ? "Log your total power consumption for today to calculate today's actual cost and claim your daily reward."
                    : "Log today's hours run for each of your active appliances."
                  }
                </p>
              </div>

              {/* Progress Tracker */}
              <div className="flex items-center justify-center gap-2">
                <div className={`h-1.5 rounded-full transition-all duration-300 ${checkInStep === 1 ? 'w-8 bg-volt-pink' : 'w-2 bg-white/20'}`} />
                <div className={`h-1.5 rounded-full transition-all duration-300 ${checkInStep === 2 ? 'w-8 bg-volt-pink' : 'w-2 bg-white/20'}`} />
              </div>

              {checkInStep === 1 ? (
                /* STEP 1: Total Units (kWh) counter and slider */
                <div className="space-y-6">
                  <div className="space-y-4 text-center">
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Total Electricity Today</span>
                    
                    <div className="flex items-center justify-center gap-4">
                      <button
                        type="button"
                        onClick={() => setCheckInUnits(prev => Math.max(0, parseFloat((prev - 0.5).toFixed(1))))}
                        className="size-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-white/20 text-white font-bold transition-all active:scale-95 cursor-pointer"
                      >
                        <Minus className="size-4" />
                      </button>

                      <div className="font-mono text-4xl font-black text-white flex items-baseline gap-1 select-none">
                        <span>{checkInUnits.toFixed(1)}</span>
                        <span className="text-sm font-sans text-volt-pink font-bold">kWh</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => setCheckInUnits(prev => parseFloat((prev + 0.5).toFixed(1)))}
                        className="size-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-white/20 text-white font-bold transition-all active:scale-95 cursor-pointer"
                      >
                        <Plus className="size-4" />
                      </button>
                    </div>

                    <div className="px-2">
                      <input
                        type="range"
                        min="0"
                        max="50"
                        step="0.1"
                        value={checkInUnits}
                        onChange={(e) => setCheckInUnits(parseFloat(parseFloat(e.target.value).toFixed(1)))}
                        className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-volt-pink"
                      />
                    </div>
                  </div>

                  <div className="p-4 bg-white/5 border border-white/[0.04] rounded-xl text-center space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Personalized Recommendation</span>
                    <p className="text-on-surface-variant font-medium text-[11px]">
                      Your average daily consumption is <span className="text-primary font-bold">{checkInAvgDailyUnits} kWh</span>. Drag or click above to adjust today's actual value.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setCheckInStep(2)}
                    className="w-full py-3.5 bg-gradient-to-r from-volt-pink to-rose-500 hover:from-volt-pink/90 hover:to-rose-500/90 text-white rounded-xl font-bold tracking-tight shadow-[0_0_20px_rgba(236,72,153,0.35)] transition-all flex items-center justify-center gap-2 text-xs cursor-pointer"
                  >
                    <span>Proceed to Appliances</span>
                    <ArrowRight className="size-4 animate-pulse" />
                  </button>
                </div>
              ) : (
                /* STEP 2: Appliance hours run today sliders list */
                <div className="space-y-6">
                  <div className="space-y-4 max-h-[250px] overflow-y-auto pr-1 custom-scrollbar">
                    {userAppliances.map((app) => {
                      const currentHours = checkInApplianceHours[app.id] !== undefined ? checkInApplianceHours[app.id] : app.avg_hours_day;
                      return (
                        <div key={app.id} className="p-3 bg-white/5 border border-white/[0.04] rounded-xl space-y-2.5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{app.icon}</span>
                              <span className="text-xs font-semibold text-white">{app.name}</span>
                            </div>
                            <span className="font-mono text-xs font-bold text-volt-pink">
                              {currentHours.toFixed(1)} hrs
                            </span>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="text-[10px] text-slate-500">0h</span>
                            <input
                              type="range"
                              min="0"
                              max="24"
                              step="0.5"
                              value={currentHours}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value);
                                setCheckInApplianceHours(prev => ({
                                  ...prev,
                                  [app.id]: val
                                }));
                              }}
                              className="flex-1 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary"
                            />
                            <span className="text-[10px] text-slate-500">24h</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setCheckInStep(1)}
                      className="flex-1 py-3 border border-white/10 hover:border-white/20 text-white rounded-xl font-bold transition-all text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <ArrowLeft className="size-4" />
                      <span>Back</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleClaimDailyCheckIn(checkInUnits, checkInApplianceHours)}
                      disabled={claimingCheckIn}
                      className="flex-[2] py-3 bg-gradient-to-r from-volt-pink to-rose-500 hover:from-volt-pink/90 hover:to-rose-500/90 text-white rounded-xl font-bold tracking-tight shadow-[0_0_20px_rgba(236,72,153,0.35)] transition-all flex items-center justify-center gap-2 text-xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {claimingCheckIn ? (
                        <span>Logging...</span>
                      ) : (
                        <>
                          <Check className="size-4" />
                          <span>Submit Telemetry</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </GlassCard>
          </div>
        );
      })()}
    </div>
  );
}
export { Dashboard };
