// src/pages/Settings.tsx
import { useState } from 'react';
import { Settings as SettingsIcon, Shield, Server, RefreshCw, Sliders, DollarSign, Cpu, Trash2, Check, HelpCircle } from 'lucide-react';
import { useDashboardStore } from '../store/dashboardStore';
import { useAuthStore } from '../store/authStore';
import { useGamificationStore } from '../store/gamificationStore';
import GlassCard from '../components/ui/GlassCard';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

export default function Settings() {
  const { onboarding, resetDashboard, isOnboarded } = useDashboardStore();
  const { user, updateUser, logout } = useAuthStore();
  const { resetGamification } = useGamificationStore();
  const navigate = useNavigate();

  // Local config states initialized from onboarding metadata or standard assumptions
  const [selectedDiscom, setSelectedDiscom] = useState(onboarding?.location ? 'BESCOM' : 'MSEDCL');
  const [flatRate, setFlatRate] = useState('6.50');
  const [acTempThreshold, setAcTempThreshold] = useState(24);
  const [autoSnooze, setAutoSnooze] = useState(true);
  const [telemetryResolution, setTelemetryResolution] = useState('5s');

  const discoms = [
    { code: 'BESCOM', name: 'Bangalore Electricity Supply (BESCOM)', rate: '₹7.00/kWh' },
    { code: 'MSEDCL', name: 'Maharashtra State Electricity (MSEDCL)', rate: '₹6.50/kWh' },
    { code: 'TNEB', name: 'Tamil Nadu Electricity Board (TNEB)', rate: '₹6.00/kWh' },
    { code: 'BYPL', name: 'BSES Yamuna Power Limited (BYPL Delhi)', rate: '₹5.80/kWh' },
    { code: 'PGVCL', name: 'Paschim Gujarat Vij (PGVCL)', rate: '₹5.50/kWh' },
  ];

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (isNaN(Number(flatRate)) || Number(flatRate) <= 0) {
      toast.error('Please enter a valid flat tariff rate.');
      return;
    }

    // Save location to user profile
    const discom = discoms.find((d) => d.code === selectedDiscom);
    if (discom && user) {
      updateUser({
        location: discom.name.split(' (')[0],
      });
    }

    toast.success('Settings saved successfully!');
  };

  const handleResetCalibration = () => {
    if (window.confirm('WARNING: This will wipe out all custom estimation settings, user history, and prompt you to run Onboarding calibration again. Proceed?')) {
      resetDashboard();
      resetGamification();
      toast.info('Estimation settings cleared.');
      navigate('/onboarding');
    }
  };

  const handleFactoryReset = () => {
    if (window.confirm('CRITICAL ACTION: This will completely wipe all local storage auth sessions and telemetry data. Proceed?')) {
      resetDashboard();
      resetGamification();
      logout();
      toast.error('All account data cleared successfully.');
      navigate('/');
    }
  };

  return (
    <div className="space-y-8 font-headline">
      {/* Title Header */}
      <div>
        <h1 className="font-display font-semibold text-3xl tracking-tight text-gradient">⚙️ SETTINGS & CONFIGURATIONS</h1>
        <p className="text-sm text-on-surface-variant">Configure energy providers, utility tariffs, and savings preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left two columns: Settings panels */}
        <div className="col-span-1 lg:col-span-2 space-y-6">
          
          {/* DISCOM & GRID CALIBRATION */}
          <GlassCard className="p-6">
            <h2 className="text-lg font-bold text-on-surface flex items-center gap-2 mb-4">
              <Server className="size-5 text-sky-400" /> Electricity Provider Connection
            </h2>
            <p className="text-xs text-on-surface-variant mb-6 leading-relaxed">
              Link your live digital smart meter via national DISCOM servers. Voltify tracks loads and estimates bills based on your utility's tariff slabs.
            </p>

            <form onSubmit={handleSaveConfig} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-on-surface-variant font-semibold">Active DISCOM Utility</label>
                  <select
                    className="w-full bg-surface-container-high border border-outline-variant/50 rounded-lg px-3 py-2 text-on-surface focus:outline-none focus:border-primary transition-colors text-xs"
                    value={selectedDiscom}
                    onChange={(e) => {
                      const code = e.target.value;
                      setSelectedDiscom(code);
                      const rate = discoms.find(d => d.code === code)?.rate.replace('₹', '').split('/')[0] || '6.00';
                      setFlatRate(rate);
                    }}
                  >
                    {discoms.map((d) => (
                      <option key={d.code} value={d.code}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-on-surface-variant font-semibold flex items-center gap-1">
                    Custom Tariff Flat Rate <span className="text-on-surface-variant/50">(₹ per kWh)</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-on-surface-variant/50 font-bold">₹</span>
                    <input
                      type="number"
                      step="0.01"
                      className="w-full bg-surface-container-high border border-outline-variant/50 rounded-lg pl-7 pr-3 py-2 text-on-surface focus:outline-none focus:border-primary transition-colors text-xs font-mono"
                      value={flatRate}
                      onChange={(e) => setFlatRate(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="bg-primary-container text-on-primary-fixed hover:bg-primary-fixed-dim px-4 py-2 rounded-lg transition-colors font-semibold flex items-center gap-1.5 text-xs font-headline"
                >
                  <Check className="size-3.5" /> Save Provider Settings
                </button>
              </div>
            </form>
          </GlassCard>

          {/* COMFORT-SAFE SYSTEM (CSS) SETTINGS */}
          <GlassCard className="p-6">
            <h2 className="text-lg font-bold text-on-surface flex items-center gap-2 mb-4">
              <Sliders className="size-5 text-rose-400" /> Comfort-Safe Efficiency Thresholds
            </h2>
            <p className="text-xs text-on-surface-variant mb-6 leading-relaxed">
              Fine-tune smart target preferences for cooling devices to keep usage in highly-efficient tariff bands.
            </p>

            <div className="space-y-6 text-xs">
              {/* AC slider */}
              <div className="space-y-2">
                <div className="flex justify-between font-mono">
                  <span className="text-on-surface font-semibold">AC Safe Mode Target Temp</span>
                  <span className="text-rose-400 font-bold">{acTempThreshold}°C</span>
                </div>
                <input
                  type="range"
                  min="21"
                  max="28"
                  className="w-full h-1 bg-surface-container-high rounded-lg appearance-none cursor-pointer accent-rose-500"
                  value={acTempThreshold}
                  onChange={(e) => setAcTempThreshold(Number(e.target.value))}
                />
                <div className="flex justify-between text-[10px] text-on-surface-variant/50 font-mono">
                  <span>21°C (Max Performance)</span>
                  <span>24°C (BEE Recommended)</span>
                  <span>28°C (Max Savings)</span>
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={autoSnooze}
                    onChange={(e) => setAutoSnooze(e.target.checked)}
                    className="rounded bg-surface-container-high border-outline-variant/50 text-rose-500 focus:ring-rose-500 size-4"
                  />
                  <div>
                    <p className="text-on-surface font-semibold group-hover:text-rose-400 transition-colors">Enable Autonomous Eco-Snooze</p>
                    <p className="text-[10px] text-on-surface-variant/60">Automatically shifts standby devices to sleep during midnight peak pricing.</p>
                  </div>
                </label>

                <div className="space-y-1.5 pt-2">
                  <label className="text-on-surface-variant font-semibold">Smart Telemetry Poll Frequency</label>
                  <select
                    className="w-full bg-surface-container-high border border-outline-variant/50 rounded-lg px-3 py-2 text-on-surface focus:outline-none focus:border-primary transition-colors text-xs font-mono"
                    value={telemetryResolution}
                    onChange={(e) => setTelemetryResolution(e.target.value)}
                  >
                    <option value="1s">1 second (Realtime - High Bandwidth)</option>
                    <option value="5s">5 seconds (Standard Live Monitoring)</option>
                    <option value="30s">30 seconds (Eco-grid polling)</option>
                    <option value="5m">5 minutes (High Latency - Server Cached)</option>
                  </select>
                </div>
              </div>
            </div>
          </GlassCard>

        </div>

        {/* Right column: Info & Maintenance Cards */}
        <div className="space-y-6">
          {/* Active Status Info */}
          <GlassCard className="p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 size-20 bg-volt-green/5 rounded-full blur-xl" />
            <h3 className="font-bold text-sm text-on-surface mb-3 flex items-center gap-1.5">
              <Cpu className="size-4 text-emerald-400" /> Savings Estimation Model
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between font-mono border-b border-outline-variant/20 pb-2">
                <span className="text-on-surface-variant">Calibrated Model</span>
                <span className="text-emerald-400 font-semibold">Trained-Slab v2.4</span>
              </div>
              <div className="flex justify-between font-mono border-b border-outline-variant/20 pb-2">
                <span className="text-on-surface-variant">Estimation Confidence</span>
                <span className="text-emerald-400 font-semibold">{onboarding?.accuracy_pct || 94}%</span>
              </div>
              <div className="flex justify-between font-mono border-b border-outline-variant/20 pb-2">
                <span className="text-on-surface-variant">Estimated Appliances</span>
                <span className="text-emerald-400 font-semibold">{onboarding?.appliances.length || user?.appliance_count || 0} Connected</span>
              </div>
              <div className="flex justify-between font-mono">
                <span className="text-on-surface-variant">Calibration Status</span>
                <span className={`font-semibold ${isOnboarded ? 'text-emerald-400' : 'text-volt-amber animate-pulse'}`}>
                  {isOnboarded ? 'VERIFIED' : 'PENDING'}
                </span>
              </div>
            </div>
          </GlassCard>

          {/* Maintenance & Purge */}
          <GlassCard className="p-6 border-rose-500/20 bg-rose-500/5">
            <h3 className="font-bold text-sm text-rose-400 mb-3 flex items-center gap-1.5">
              <Trash2 className="size-4" /> System Maintenance
            </h3>
            <p className="text-[11px] text-on-surface-variant mb-6 leading-relaxed">
              Modify the underlying database and session configurations. These actions clear persistant storage.
            </p>

            <div className="space-y-3">
              <button
                onClick={handleResetCalibration}
                className="w-full border border-rose-500/30 hover:bg-rose-500/15 text-on-surface font-semibold text-xs px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all"
              >
                <RefreshCw className="size-3.5" /> Recalibrate Estimators
              </button>

              <button
                onClick={handleFactoryReset}
                className="w-full bg-rose-500/20 hover:bg-rose-500/30 text-on-surface font-semibold text-xs px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all"
              >
                <Trash2 className="size-3.5 text-rose-400" /> Full Database Purge
              </button>
            </div>
          </GlassCard>

          {/* FAQs */}
          <GlassCard className="p-6">
            <h3 className="font-bold text-sm text-on-surface mb-3 flex items-center gap-1.5">
              <HelpCircle className="size-4 text-primary-container" /> Energy Estimation Help
            </h3>
            <div className="space-y-2 text-[11px] text-on-surface-variant">
              <p className="font-semibold text-on-surface">How is energy usage estimated?</p>
              <p className="leading-relaxed">Estimated based on seasonal factors, average usage parameters, and standard appliances. No physical sensors needed!</p>
              <p className="font-semibold text-on-surface pt-2">What is Auto-Snooze?</p>
              <p className="leading-relaxed">It triggers mild power shifts when regional electrical frequencies drop to secure high multiplier coins.</p>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
export { Settings };
