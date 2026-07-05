// src/pages/Dashboard.tsx
import { useState, useEffect, lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import {
  Zap, Flame, Coins, Trophy, Sparkles, TrendingUp, AlertTriangle, CheckCircle, CheckCircle2,
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

  // Comfort-Safe Savings (CSS) Recommendations State
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [cssTotals, setCssTotals] = useState<any>({ potential: 1020, annual: 12240 });

  // Telemetry check-in states
  const [overallPerception, setOverallPerception] = useState<'below' | 'normal' | 'above' | 'custom'>('normal');
  const [appliancePerceptions, setAppliancePerceptions] = useState<Record<string, 'below' | 'normal' | 'above' | 'custom'>>({});
  const [checkInApplianceHours, setCheckInApplianceHours] = useState<Record<string, number>>({});

  const userAppliances = onboarding?.appliances || Object.entries(DEFAULT_APPLIANCES).map(([id, app]) => ({ ...app, id } as Appliance));
  const checkInAvgDailyUnits = onboarding?.units_per_month ? parseFloat((onboarding.units_per_month / 30).toFixed(1)) : 10.5;

  // Sync initial state when modal opens or onboarding loads
  useEffect(() => {
    if (showCheckInModal) {
      setOverallPerception('normal');
      const initialHours: Record<string, number> = {};
      const initialPerceptions: Record<string, 'below' | 'normal' | 'above' | 'custom'> = {};
      userAppliances.forEach((app) => {
        initialHours[String(app.id)] = app.avg_hours_day;
        initialPerceptions[String(app.id)] = 'normal';
      });
      setCheckInApplianceHours(initialHours);
      setAppliancePerceptions(initialPerceptions);
    }
  }, [showCheckInModal, onboarding]);

  // Load general dashboard data from backend
  useEffect(() => {
    async function loadData() {
      try {
        const [summary, breakdown, lb, chal, gamestats, cssRes] = await Promise.all([
          apiService.getDashboardSummary(),
          apiService.getApplianceBreakdown(),
          apiService.getLeaderboard(onboarding?.household_type || 'family'),
          apiService.getGamificationChallenge(),
          apiService.getGamificationStats(),
          apiService.getCSSRecommendations()
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

        if (cssRes && cssRes.recommendations) {
          setRecommendations(cssRes.recommendations);
          setCssTotals({
            potential: cssRes.total_potential_savings_rs || 1020,
            annual: cssRes.total_annual_savings_rs || 12240
          });
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

  const handleApplyRecommendation = async (recId: string, appliance: string, setting: string) => {
    try {
      const res = await apiService.applyCSSRecommendation({
        recommendation_id: recId,
        appliance,
        setting_applied: setting
      });
      if (res.success) {
        toast.success(`Applied! Earned ${res.coins_earned || 80} coins! Expected savings: ₹${res.expected_monthly_savings || 240}/mo.`);
        
        // Update local state to show applied status
        setRecommendations(prev => 
          prev.map(r => r.id === recId ? { ...r, already_applied: true } : r)
        );

        // Add coins to store
        addCoins(res.coins_earned || 80);

        // Also refresh dashboard stats to reflect the updated projected bill!
        const summary = await apiService.getDashboardSummary();
        if (summary) setDashboardStats(summary);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to apply optimization target");
    }
  };

  const getApplianceEmoji = (appliance: string) => {
    switch (appliance?.toUpperCase()) {
      case 'AC': return '❄️';
      case 'GEYSER': return '♨️';
      case 'FRIDGE':
      case 'REFRIGERATOR': return '🧊';
      case 'TV': return '📺';
      case 'FAN': return '🌀';
      default: return '🔌';
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
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCheckInModal(true)}
            className="px-4 py-2 bg-primary/10 border border-primary/20 hover:bg-primary/20 text-primary transition-all rounded-xl text-xs font-semibold cursor-pointer"
          >
            📊 Log Telemetry
          </button>
          <div className="flex items-center gap-2 bg-surface border border-outline px-4 py-2 rounded-xl text-xs shadow-sm">
            <BadgeAlert className="size-4 text-primary" />
            <span className="text-on-surface-variant">Estimated Disaggregation Accuracy:</span>
            <span className="font-mono font-semibold text-primary">{onboarding?.accuracy_pct || 94}%</span>
          </div>
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
        {/* Comfort-Safe Savings (CSS) Recommendations */}
        <GlassCard className="col-span-1 lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="size-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <CheckCircle2 className="size-4 text-emerald-400" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-sm text-white">Comfort-Safe Savings (CSS)</h3>
                <p className="text-[10px] text-gray-400">BEE & Comfort-standard optimization targets</p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs font-mono text-emerald-400 font-bold block">₹{cssTotals.potential}/mo</span>
              <span className="text-[9px] text-gray-400 block font-mono">Potential Savings</span>
            </div>
          </div>

          {/* List of Recommendations */}
          <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
            {recommendations && recommendations.length > 0 ? (
              recommendations.map((tip) => (
                <div key={tip.id} className="p-4 rounded-xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.02] transition-all space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 font-bold text-white text-xs">
                      <span>{getApplianceEmoji(tip.appliance)}</span> {tip.title || `${tip.appliance} Optimization`}
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
                      Save ₹{tip.monthly_savings_rs || tip.monthly_savings || 240}/mo
                    </span>
                  </div>
                  
                  <p className="text-gray-400 leading-relaxed text-[11px] font-sans">
                    {tip.explanation || tip.why_safe || 'BEE & WHO environmental comfort guidelines for appliance energy reduction.'}
                  </p>

                  <div className="flex items-center justify-between pt-3 border-t border-white/[0.03] text-[10px]">
                    <div className="flex items-center gap-3">
                      <span className="text-gray-500 font-sans">
                        Target: <span className="font-semibold text-white font-mono">{tip.recommended_setting || tip.target_setting || 'ECO'}</span>
                      </span>
                      {tip.comfort_pct && (
                        <span className="text-gray-500 font-sans">
                          Comfort: <span className="text-primary font-semibold font-mono">{tip.comfort_pct}%</span>
                        </span>
                      )}
                    </div>
                    
                    {tip.already_applied ? (
                      <span className="font-mono text-emerald-400 flex items-center gap-1 font-semibold">
                        <CheckCircle2 className="size-3" /> Target Applied
                      </span>
                    ) : (
                      <button 
                        onClick={() => handleApplyRecommendation(tip.id, tip.appliance, tip.recommended_setting || tip.target_setting || 'ECO')}
                        className="inline-flex items-center gap-1 text-[9px] text-slate-950 bg-primary px-3 py-1.5 rounded-lg hover:opacity-90 transition-all font-semibold uppercase tracking-wider cursor-pointer"
                      >
                        <Coins className="size-3" /> Apply & Earn
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="h-40 flex items-center justify-center border border-white/5 rounded-2xl bg-white/[0.01]">
                <span className="text-xs text-gray-500">Loading energy targets...</span>
              </div>
            )}
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
                  Log your appliance use today. Adjust overall usage to pre-fill all run times instantly!
                </p>
              </div>

              {/* Telemetry Input Form */}
              <div className="space-y-6">
                
                {/* Overall Usage perception selector card (Very obvious and user friendly!) */}
                <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl space-y-3">
                  <label className="block text-[10px] text-slate-400 uppercase tracking-widest font-black font-sans text-center">
                    ⚡ Did you use more or less energy today overall?
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['below', 'normal', 'above'] as const).map((p) => {
                      const labels = {
                        below: '🔋 Less Than Avg',
                        normal: '🏠 Normal / Avg',
                        above: '📈 More Than Avg'
                      };
                      const activeColors = {
                        below: 'border-emerald-500 bg-emerald-500/15 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]',
                        normal: 'border-primary bg-primary/15 text-primary shadow-[0_0_15px_rgba(0,229,255,0.15)]',
                        above: 'border-volt-pink bg-volt-pink/15 text-volt-pink shadow-[0_0_15px_rgba(236,72,153,0.15)]'
                      };
                      const isSelected = overallPerception === p;
                      return (
                        <button
                          key={p}
                          type="button"
                          onClick={() => {
                            setOverallPerception(p);
                            // Automatically pre-fill all individual appliances in one click!
                            const multipliers = { below: 0.7, normal: 1.0, above: 1.3 };
                            const updatedHours: Record<string, number> = {};
                            const updatedPerceptions: Record<string, 'below' | 'normal' | 'above' | 'custom'> = {};
                            userAppliances.forEach((app) => {
                              const newHrs = Math.max(0, Math.min(24, parseFloat((app.avg_hours_day * multipliers[p]).toFixed(1))));
                              updatedHours[String(app.id)] = newHrs;
                              updatedPerceptions[String(app.id)] = p;
                            });
                            setCheckInApplianceHours(updatedHours);
                            setAppliancePerceptions(updatedPerceptions);
                          }}
                          className={`py-3 px-1.5 border rounded-xl text-[9px] font-bold text-center tracking-tight transition-all active:scale-95 cursor-pointer flex flex-col items-center justify-center gap-1 ${
                            isSelected
                              ? activeColors[p]
                              : 'border-white/10 hover:border-white/20 text-slate-400 hover:text-white bg-transparent'
                          }`}
                        >
                          <span>{labels[p]}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Appliance Sliders and Obvious Per-Appliance Quick Selector Badges */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-[10px] text-slate-400 uppercase tracking-widest font-bold font-sans">
                      Fine-Tune Hours Per Device
                    </label>
                    {overallPerception === 'custom' && (
                      <span className="text-[9px] text-volt-pink font-mono uppercase font-bold animate-pulse">Custom Tuned</span>
                    )}
                  </div>
                  
                  <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1 custom-scrollbar">
                    {userAppliances.map((app) => {
                      const currentHours = checkInApplianceHours[String(app.id)] !== undefined ? checkInApplianceHours[String(app.id)] : app.avg_hours_day;
                      return (
                        <div key={app.id} className="p-3 bg-white/5 border border-white/[0.04] rounded-xl space-y-2.5 hover:bg-white/[0.07] hover:border-white/[0.08] transition-all">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              <span className="text-xl">{app.icon}</span>
                              <div>
                                <span className="text-xs font-semibold text-white block leading-tight">{app.name}</span>
                                <span className="text-[9px] text-gray-500 font-sans block">Avg: {app.avg_hours_day} hrs</span>
                              </div>
                            </div>
                            
                            {/* Larger, obvious, and highly user-friendly per-appliance buttons */}
                            <div className="flex items-center gap-1 bg-[#1a1a1a] p-1 rounded-xl border border-white/[0.05]">
                              {(['below', 'normal', 'above'] as const).map((p) => {
                                const labels = { below: 'Less', normal: 'Avg', above: 'More' };
                                const activeStyles = {
                                  below: 'bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 shadow-[0_0_8px_rgba(16,185,129,0.1)] font-extrabold scale-105',
                                  normal: 'bg-primary/25 text-primary border border-primary/30 shadow-[0_0_8px_rgba(0,229,255,0.1)] font-extrabold scale-105',
                                  above: 'bg-volt-pink/25 text-volt-pink border border-volt-pink/30 shadow-[0_0_8px_rgba(236,72,153,0.1)] font-extrabold scale-105'
                                };
                                const isSelected = appliancePerceptions[String(app.id)] === p;
                                return (
                                  <button
                                    key={p}
                                    type="button"
                                    onClick={() => {
                                      const multipliers = { below: 0.7, normal: 1.0, above: 1.3 };
                                      const newHrs = Math.max(0, Math.min(24, parseFloat((app.avg_hours_day * multipliers[p]).toFixed(1))));
                                      setCheckInApplianceHours(prev => ({ ...prev, [String(app.id)]: newHrs }));
                                      setAppliancePerceptions(prev => ({ ...prev, [String(app.id)]: p }));
                                      setOverallPerception('custom'); // Flag that overall has been customized
                                    }}
                                    className={`px-3 py-1 rounded-lg text-[10px] cursor-pointer transition-all duration-200 ${
                                      isSelected 
                                        ? activeStyles[p] 
                                        : 'text-gray-500 hover:text-white border border-transparent bg-transparent hover:bg-white/5'
                                    }`}
                                  >
                                    {labels[p]}
                                  </button>
                                );
                              })}
                            </div>
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
                                  [String(app.id)]: val
                                }));
                                setAppliancePerceptions(prev => ({
                                  ...prev,
                                  [String(app.id)]: 'custom'
                                }));
                                setOverallPerception('custom'); // Flag overall customized
                              }}
                              className="flex-1 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary"
                            />
                            <span className="text-[10px] text-volt-pink font-semibold font-mono whitespace-nowrap min-w-[32px] text-right">
                              {currentHours.toFixed(1)}h
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Submission button */}
                <button
                  type="button"
                  onClick={() => {
                    const totalSelectedLoad = userAppliances.reduce((sum, app) => {
                      const hrs = checkInApplianceHours[String(app.id)] !== undefined ? checkInApplianceHours[String(app.id)] : app.avg_hours_day;
                      return sum + (Number(app.power_kw) * hrs);
                    }, 0);
                    const totalBaseLoad = userAppliances.reduce((sum, app) => {
                      return sum + (Number(app.power_kw) * app.avg_hours_day);
                    }, 0);
                    const ratio = totalBaseLoad > 0 ? totalSelectedLoad / totalBaseLoad : 1.0;
                    const calculatedUnits = parseFloat((checkInAvgDailyUnits * ratio).toFixed(1));

                    handleClaimDailyCheckIn(calculatedUnits, checkInApplianceHours);
                  }}
                  disabled={claimingCheckIn}
                  className="w-full py-3.5 bg-gradient-to-r from-volt-pink to-rose-500 hover:from-volt-pink/90 hover:to-rose-500/90 text-white rounded-xl font-bold tracking-tight shadow-[0_0_20px_rgba(236,72,153,0.35)] transition-all flex items-center justify-center gap-2 text-xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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
            </GlassCard>
          </div>
        );
      })()}
    </div>
  );
}
export { Dashboard };
