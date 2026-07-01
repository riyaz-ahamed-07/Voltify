// src/pages/Profile.tsx
import { useState } from 'react';
import { User, Shield, Flame, Coins, Zap, MapPin, Home, Users, Check, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useDashboardStore } from '../store/dashboardStore';
import GlassCard from '../components/ui/GlassCard';
import { toast } from 'react-toastify';

export default function Profile() {
  const { user, updateUser } = useAuthStore();
  const { onboarding } = useDashboardStore();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    home_type: user?.home_type || 'apartment',
    household_type: user?.household_type || 'family',
    location: user?.location || '',
  });

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] font-headline text-center">
        <AlertCircle className="w-12 h-12 text-volt-pink mb-4 animate-pulse" />
        <h2 className="text-xl font-bold text-on-surface mb-2">Unauthorized Access</h2>
        <p className="text-sm text-on-surface-variant max-w-sm">Please log in to view your energy neural profile.</p>
      </div>
    );
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      toast.error('Name and Email cannot be blank');
      return;
    }
    updateUser({
      name: formData.name,
      email: formData.email,
      home_type: formData.home_type as any,
      household_type: formData.household_type as any,
      location: formData.location,
    });
    setIsEditing(false);
    toast.success('Agent Profile successfully updated!');
  };

  const getTierLabel = (tier: number) => {
    switch (tier) {
      case 1:
        return { label: 'Bronze Energy Saver', color: 'text-amber-500 border-amber-500/30 bg-amber-500/10' };
      case 2:
        return { label: 'Silver Grid Warden', color: 'text-slate-300 border-slate-300/30 bg-slate-300/10' };
      case 3:
        return { label: 'Gold Superconductor', color: 'text-neon-cyan border-volt-cyan/30 bg-volt-cyan/10' };
      default:
        return { label: 'Novice Saver', color: 'text-on-surface border-outline/30 bg-surface/5' };
    }
  };

  const tierInfo = getTierLabel(user.tier);

  return (
    <div className="space-y-8 font-headline">
      {/* Title Header */}
      <div>
        <h1 className="font-display font-extrabold text-3xl tracking-tight text-gradient">👤 AGENT PROTOCOL</h1>
        <p className="text-sm text-on-surface-variant">Calibrate household parameters & view grid performance stats</p>
      </div>

      {/* Grid Dashboard Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <GlassCard className="p-6 col-span-1 md:col-span-2 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-all duration-500" />
          
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-primary-container text-2xl font-display font-bold">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-on-surface">{user.name}</h2>
                  <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full border ${tierInfo.color}`}>
                    {tierInfo.label}
                  </span>
                </div>
                <p className="text-xs text-on-surface-variant font-mono">AGENT ID: {user.id}</p>
                <p className="text-xs text-on-surface-variant">{user.email}</p>
              </div>
            </div>

            <hr className="border-outline-variant/30" />

            {/* Editing Drawer Form */}
            {!isEditing ? (
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <span className="text-on-surface-variant flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-neon-cyan" /> Location Grid</span>
                  <p className="font-bold text-on-surface">{user.location || 'Not Specified'}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-on-surface-variant flex items-center gap-1.5"><Home className="w-3.5 h-3.5 text-neon-cyan" /> Household Layout</span>
                  <p className="font-bold text-on-surface capitalize">{user.home_type}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-on-surface-variant flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-neon-cyan" /> Household Size</span>
                  <p className="font-bold text-on-surface capitalize">{user.household_type.replace('_', ' ')}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-on-surface-variant flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-neon-cyan" /> Appliances Disaggregated</span>
                  <p className="font-bold text-on-surface">{user.appliance_count} active</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSave} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-on-surface-variant font-semibold">Agent Name</label>
                    <input
                      type="text"
                      className="w-full bg-surface-container-high border border-outline-variant/50 rounded-lg px-3 py-2 text-on-surface focus:outline-none focus:border-primary transition-colors text-xs"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-on-surface-variant font-semibold">Agent Email Address</label>
                    <input
                      type="email"
                      className="w-full bg-surface-container-high border border-outline-variant/50 rounded-lg px-3 py-2 text-on-surface focus:outline-none focus:border-primary transition-colors text-xs"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-on-surface-variant font-semibold">Home Classification</label>
                    <select
                      className="w-full bg-surface-container-high border border-outline-variant/50 rounded-lg px-3 py-2 text-on-surface focus:outline-none focus:border-primary transition-colors text-xs"
                      value={formData.home_type}
                      onChange={(e) => setFormData({ ...formData, home_type: e.target.value as any })}
                    >
                      <option value="apartment">Apartment</option>
                      <option value="house">Detached House</option>
                      <option value="villa">Premium Villa</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-on-surface-variant font-semibold">Household Cohort</label>
                    <select
                      className="w-full bg-surface-container-high border border-outline-variant/50 rounded-lg px-3 py-2 text-on-surface focus:outline-none focus:border-primary transition-colors text-xs"
                      value={formData.household_type}
                      onChange={(e) => setFormData({ ...formData, household_type: e.target.value as any })}
                    >
                      <option value="bachelor">Bachelor (1 Person)</option>
                      <option value="family">Small Family (2-4 People)</option>
                      <option value="large_family">Large Family (5+ People)</option>
                      <option value="organization">Office / Org</option>
                    </select>
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-on-surface-variant font-semibold">Location / Regional Tariff Area</label>
                    <input
                      type="text"
                      className="w-full bg-surface-container-high border border-outline-variant/50 rounded-lg px-3 py-2 text-on-surface focus:outline-none focus:border-primary transition-colors text-xs"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="e.g. Bengaluru, Karnataka"
                    />
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="border border-outline-variant hover:bg-surface-container-high text-on-surface px-4 py-2 rounded-lg transition-colors font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-primary-container text-on-primary-fixed hover:bg-primary-fixed-dim px-4 py-2 rounded-lg transition-colors font-semibold flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" /> Save Configuration
                  </button>
                </div>
              </form>
            )}
          </div>

          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="mt-6 border border-outline-variant hover:border-primary/50 text-on-surface hover:text-primary-container text-xs px-4 py-2 rounded-lg text-center font-bold uppercase transition-all duration-300"
            >
              Modify Calibration Metrics
            </button>
          )}
        </GlassCard>

        {/* Level and Rewards Stat Card */}
        <div className="space-y-6">
          {/* Energy Rank Card */}
          <GlassCard className="p-6 relative overflow-hidden group">
            <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-volt-pink/10 rounded-full blur-2xl group-hover:bg-volt-pink/20 transition-all duration-500" />
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-mono text-xs text-on-surface-variant uppercase tracking-wider">Level Progress</span>
                <span className="font-mono text-xs text-volt-pink font-bold">LVL {user.tier === 3 ? '42' : user.tier === 2 ? '24' : '8'}</span>
              </div>
              <div className="space-y-1">
                <h3 className="text-2xl font-bold font-display text-on-surface flex items-center gap-1.5">
                  <Shield className="w-5 h-5 text-volt-pink animate-pulse" /> Grid Guardian
                </h3>
                <p className="text-xs text-on-surface-variant">Calibrate smart saving settings to gain more points.</p>
              </div>
              {/* Fake progress bar */}
              <div className="space-y-1.5">
                <div className="w-full bg-surface-container-high rounded-full h-2 overflow-hidden border border-outline-variant/30">
                  <div 
                    className="bg-gradient-to-right bg-volt-pink h-full rounded-full transition-all duration-500 shadow-[0_0_8px_#ec4899]"
                    style={{ width: user.tier === 3 ? '78%' : user.tier === 2 ? '45%' : '18%' }}
                  />
                </div>
                <div className="flex justify-between text-[10px] font-mono text-on-surface-variant">
                  <span>{user.tier === 3 ? '15,600 XP' : user.tier === 2 ? '4,500 XP' : '800 XP'}</span>
                  <span>{user.tier === 3 ? '20,000 XP' : user.tier === 2 ? '10,000 XP' : '5,000 XP'}</span>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Wallet Balance Info */}
          <GlassCard className="p-6 relative overflow-hidden group">
            <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-volt-cyan/10 rounded-full blur-2xl group-hover:bg-volt-cyan/20 transition-all duration-500" />
            <div className="space-y-4">
              <span className="font-mono text-xs text-on-surface-variant uppercase tracking-wider block">Wallet Balance</span>
              <div className="flex gap-4 items-center">
                <div className="w-10 h-10 rounded-full bg-primary-container/15 flex items-center justify-center text-primary-container">
                  <Coins className="w-5 h-5 animate-bounce" />
                </div>
                <div>
                  <p className="text-2xl font-bold font-mono text-primary-container">{user.coins || 0} COINS</p>
                  <p className="text-[10px] text-on-surface-variant">Estimated Credit Value: <span className="text-volt-green font-semibold">₹{(user.coins || 0) * 0.5}</span></p>
                </div>
              </div>
              <div className="flex gap-4 items-center">
                <div className="w-10 h-10 rounded-full bg-volt-pink/15 flex items-center justify-center text-volt-pink">
                  <Flame className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <p className="text-2xl font-bold font-mono text-volt-pink">{user.streak_days || 0} DAYS</p>
                  <p className="text-[10px] text-on-surface-variant">Streak Multiplier: <span className="text-volt-pink font-semibold">1.15x</span></p>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Onboarding Calibrated Summary Card */}
      {onboarding && (
        <GlassCard className="p-6 border-primary/20 bg-primary/5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <h3 className="font-bold text-lg text-on-surface flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary-container" /> Calibrated Estimation Profile
              </h3>
              <p className="text-xs text-on-surface-variant max-w-2xl leading-relaxed">
                Your neural load estimators have been optimized using your uploaded DISCOM history (monthly target of <span className="text-on-surface font-semibold">₹{onboarding.bill_amount}</span> for ~<span className="text-on-surface font-semibold">{onboarding.units_per_month} kWh</span>). Accuracy confidence is verified at <span className="text-volt-green font-bold">{onboarding.accuracy_pct}%</span>.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 bg-surface-container-high/50 p-4 rounded-xl border border-outline-variant/30 text-center font-mono">
              <div className="px-2">
                <p className="text-xs text-on-surface-variant">CALIBRATED LOAD</p>
                <p className="text-xl font-bold text-primary-container">{onboarding.estimated_units.toFixed(1)} kWh</p>
              </div>
              <div className="px-2 border-l border-outline-variant/30">
                <p className="text-xs text-on-surface-variant">CONFIDENCE</p>
                <p className="text-xl font-bold text-volt-green">{onboarding.accuracy_pct}%</p>
              </div>
            </div>
          </div>
        </GlassCard>
      )}
    </div>
  );
}
export { Profile };
