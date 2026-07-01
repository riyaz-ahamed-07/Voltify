// src/pages/onboarding/index.tsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-toastify';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Upload, ShieldCheck, Home, Check, Play, User as UserIcon, Settings } from 'lucide-react';
import { DEFAULT_APPLIANCES } from '../../types/appliance';
import { useAuthStore } from '../../store/authStore';
import { useDashboardStore } from '../../store/dashboardStore';
import { useGamificationStore } from '../../store/gamificationStore';
import { estimateMonthlyKwh, estimateApplianceBreakdown, generateDailyUsage } from '../../lib/estimation';
import { formatCurrency, formatUnits, getTariffRate } from '../../lib/utils';

// Zod schemas for onboarding step inputs
const profileSchema = z.object({
  household_type: z.enum(['bachelor', 'family', 'large_family', 'organization']),
  location:        z.string().min(2, 'Please select your region'),
  home_type:       z.enum(['apartment', 'house', 'villa']),
});

const billSchema = z.object({
  bill_amount:     z.number({ message: 'Amount is required' }).min(10, 'Invalid bill amount'),
  units:           z.number({ message: 'Units are required' }).min(5, 'Invalid units consumed'),
});

type ProfileForm = z.infer<typeof profileSchema>;
type BillForm = z.infer<typeof billSchema>;

export default function Onboarding() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuthStore();
  const { setOnboarding, setDailyHistory, setApplianceBreakdown, setInsights } = useDashboardStore();
  const { addCoins, setRank } = useGamificationStore();

  const [step, setStep] = useState(1);
  const [profileData, setProfileData] = useState<ProfileForm | null>(null);
  const [billData, setBillData] = useState<BillForm | null>(null);

  // Appliances state
  const [selectedAppliances, setSelectedAppliances] = useState<Record<string, boolean>>({
    AC: true,
    Fridge: true,
    TV: true,
    Lights: true,
    Fans: true,
    Laptop: true,
  });

  const [applianceHours, setApplianceHours] = useState<Record<string, number>>({
    AC: 8,
    Fridge: 24,
    TV: 4,
    Geyser: 1.5,
    WashingMachine: 0.5,
    Microwave: 0.3,
    Lights: 6,
    Fans: 10,
    Laptop: 6,
  });

  const toggleAppliance = (key: string) => {
    setSelectedAppliances((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleHourChange = (key: string, val: number) => {
    setApplianceHours((prev) => ({ ...prev, [key]: val }));
  };

  // Forms
  const { register: regProfile, handleSubmit: handleProfileSubmit, formState: { errors: profileErrors } } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      household_type: 'family',
      location: 'Chennai',
      home_type: 'apartment',
    },
  });

  const { register: regBill, handleSubmit: handleBillSubmit, setValue: setBillValue, formState: { errors: billErrors } } = useForm<BillForm>({
    resolver: zodResolver(billSchema),
  });

  // Dropzone for simulated PDF upload
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        // Mock extract parameters from simulated bill
        toast.info('Analyzing utility document via Voltify AI...');
        setTimeout(() => {
          setBillValue('bill_amount', 3200);
          setBillValue('units', 400);
          toast.success('Simulated bill decoded! ₹3,200 Amount / 400 kWh detected');
        }, 1200);
      }
    },
  });

  // Calculations for step 4 review
  const getReviewCalculations = () => {
    if (!profileData || !billData) return null;
    
    // Construct appliance array from selections
    const appliances = Object.keys(DEFAULT_APPLIANCES)
      .filter((key) => selectedAppliances[key])
      .map((key) => ({
        id: key,
        name: DEFAULT_APPLIANCES[key].name,
        icon: DEFAULT_APPLIANCES[key].icon,
        power_kw: DEFAULT_APPLIANCES[key].power_kw,
        avg_hours_day: applianceHours[key],
        seasonality: DEFAULT_APPLIANCES[key].seasonality,
      }));

    const estKwh = estimateMonthlyKwh(appliances);
    const rate = getTariffRate(profileData.location);
    const accuracy = Math.round(100 - Math.min(100, Math.abs((estKwh - billData.units) / billData.units) * 100));

    return {
      appliances,
      estKwh,
      rate,
      accuracy,
    };
  };

  const currentCalc = getReviewCalculations();

  // Navigation handlers
  const onProfileNext = (data: ProfileForm) => {
    setProfileData(data);
    setStep(2);
  };

  const onBillNext = (data: BillForm) => {
    setBillData(data);
    setStep(3);
  };

  const onAppliancesNext = () => {
    setStep(4);
  };

  const finishOnboarding = () => {
    if (!profileData || !billData || !currentCalc) return;

    // Estimate breakdowns
    const breakdown = estimateApplianceBreakdown(
      currentCalc.appliances,
      billData.bill_amount,
      billData.units,
      currentCalc.rate
    );

    // Generate daily histories
    const history = generateDailyUsage(currentCalc.appliances, 30, profileData.location);

    // Rule-based insights
    const newInsights = [
      {
        id: 'in-1',
        type: 'warning' as const,
        title: 'AC Load Calibration Alert',
        message: 'Your AC is calculated to take up ' + (breakdown.find(b => b.name === 'Air Conditioner')?.percentage || '35') + '% of your total bill. Adjust temperature to save up to ₹900.',
        action: '/dashboard',
      },
      {
        id: 'in-2',
        type: 'success' as const,
        title: 'Energy Calibration Accuracy',
        message: 'Telemetry calculations matched your uploaded utility billing files with ' + currentCalc.accuracy + '% accuracy!',
        action: '/dashboard',
      },
    ];

    // Store in zustand
    setOnboarding({
      household_type: profileData.household_type,
      location: profileData.location,
      home_type: profileData.home_type,
      bill_amount: billData.bill_amount,
      units_per_month: billData.units,
      appliances: currentCalc.appliances,
      estimated_units: currentCalc.estKwh,
      accuracy_pct: currentCalc.accuracy,
      prev_bills: [
        { month: 'April', amount: billData.bill_amount, units: billData.units },
        { month: 'March', amount: billData.bill_amount * 0.9, units: billData.units * 0.9 },
      ],
    });

    setDailyHistory(history);
    setApplianceBreakdown(breakdown);
    setInsights(newInsights);

    // Update user store
    updateUser({
      household_type: profileData.household_type,
      location: profileData.location,
      home_type: profileData.home_type,
      appliance_count: currentCalc.appliances.length,
      coins: user?.coins ? user.coins + 150 : 150,
      streak_days: 1,
    });

    addCoins(150); // Welcome coins
    setRank(47);

    toast.success('Onboarding complete! 150 coins added to your balance.');
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-background grid-bg flex flex-col justify-center py-10 px-4 md:px-10 font-headline">
      <div className="max-w-3xl w-full mx-auto">
        {/* Progress header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded bg-primary-container/20 border border-primary/30 flex items-center justify-center">
              <Zap className="w-4 h-4 text-primary-container" />
            </div>
            <span className="font-display text-xl font-bold tracking-tighter text-neon-cyan">VOLTIFY</span>
          </Link>

          <div className="flex items-center justify-between max-w-md mx-auto relative mb-2">
            <div className="absolute left-0 right-0 h-0.5 bg-outline-variant/30 top-1/2 -translate-y-1/2 -z-10" />
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`w-8 h-8 rounded-full border flex items-center justify-center text-xs font-bold font-mono transition-all duration-300 relative z-10 ${
                  s === step
                    ? 'bg-primary-container text-on-primary-container border-primary shadow-[0_0_15px_rgba(0,229,255,0.4)]'
                    : s < step
                    ? 'bg-tertiary-container text-on-tertiary border-tertiary shadow-[0_0_10px_rgba(35,235,184,0.3)]'
                    : 'bg-surface border-outline-variant/50 text-on-surface-variant'
                }`}
              >
                {s < step ? <Check className="w-4 h-4" /> : s}
              </div>
            ))}
          </div>
          <div className="flex justify-between max-w-md mx-auto text-[10px] uppercase font-bold text-on-surface-variant tracking-wider">
            <span>Profile</span>
            <span>Billing</span>
            <span>Appliances</span>
            <span>Review</span>
          </div>
        </div>

        {/* Content Box */}
        <div className="glass rounded-2xl p-8 border border-outline-variant/30 shadow-2xl relative">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h3 className="font-display font-bold text-xl text-on-surface mb-2">Step 1: Core Household Profile</h3>
                <p className="text-on-surface-variant text-xs mb-6">Calibrate estimated base loads by describing your home type and region.</p>

                <form onSubmit={handleProfileSubmit(onProfileNext)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Home Type */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">Dwelling Type</label>
                      <select
                        {...regProfile('home_type')}
                        className="w-full px-4 py-3 bg-surface border border-outline-variant/50 rounded-lg text-on-surface text-sm focus:outline-none focus:border-primary-container"
                      >
                        <option value="apartment">Apartment / Flat</option>
                        <option value="house">Independent House</option>
                        <option value="villa">Luxury Villa</option>
                      </select>
                    </div>

                    {/* Household Type */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">Household Size</label>
                      <select
                        {...regProfile('household_type')}
                        className="w-full px-4 py-3 bg-surface border border-outline-variant/50 rounded-lg text-on-surface text-sm focus:outline-none focus:border-primary-container"
                      >
                        <option value="bachelor">Bachelor / Single Person</option>
                        <option value="family">Small Family (2–4 Persons)</option>
                        <option value="large_family">Large Family (5+ Persons)</option>
                        <option value="organization">Office / Institution</option>
                      </select>
                    </div>

                    {/* Region */}
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">Electricity DISCOM Region</label>
                      <select
                        {...regProfile('location')}
                        className="w-full px-4 py-3 bg-surface border border-outline-variant/50 rounded-lg text-on-surface text-sm focus:outline-none focus:border-primary-container"
                      >
                        <option value="Chennai">Tamil Nadu (TANGEDCO - Chennai)</option>
                        <option value="Mumbai">Maharashtra (MSEDCL/Adani - Mumbai)</option>
                        <option value="Delhi">Delhi (BSES/Tata Power - Delhi)</option>
                        <option value="Bangalore">Karnataka (BESCOM - Bangalore)</option>
                        <option value="Hyderabad">Telangana (TSSPDCL - Hyderabad)</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <button
                      type="submit"
                      className="bg-primary-container text-on-primary-container px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-primary-container/90 transition-all flex items-center justify-center gap-2"
                    >
                      Next Step <ArrowRightIcon />
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h3 className="font-display font-bold text-xl text-on-surface mb-2">Step 2: Utility Bill Calibration</h3>
                <p className="text-on-surface-variant text-xs mb-6">Drop a PDF copy of your recent DISCOM bill or enter parameters manually for optimal calculation.</p>

                {/* Dropzone */}
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 mb-6 flex flex-col items-center ${
                    isDragActive
                      ? 'border-primary bg-primary/5 shadow-cyan'
                      : 'border-outline-variant/50 bg-surface/50 hover:border-primary/50'
                  }`}
                >
                  <input {...getInputProps()} />
                  <Upload className="w-10 h-10 text-outline mb-3 group-hover:text-primary" />
                  <p className="text-sm font-bold text-on-surface">Drag & Drop simulated DISCOM bill PDF here</p>
                  <p className="text-[10px] text-on-surface-variant uppercase mt-1">Accepts simulated files to automatically decode units</p>
                </div>

                <div className="text-center font-bold text-xs text-outline mb-6">-- OR MANUAL INPUT --</div>

                <form onSubmit={handleBillSubmit(onBillNext)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Bill amount */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">Bill Amount (₹)</label>
                      <input
                        {...regBill('bill_amount', { valueAsNumber: true })}
                        type="number"
                        placeholder="e.g. 3500"
                        className="w-full px-4 py-3 bg-surface border border-outline-variant/50 rounded-lg text-on-surface text-sm focus:outline-none focus:border-primary-container"
                      />
                      {billErrors.bill_amount && <p className="text-volt-pink text-xs mt-1">{billErrors.bill_amount.message}</p>}
                    </div>

                    {/* Units consumed */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">Units Consumed (kWh)</label>
                      <input
                        {...regBill('units', { valueAsNumber: true })}
                        type="number"
                        placeholder="e.g. 420"
                        className="w-full px-4 py-3 bg-surface border border-outline-variant/50 rounded-lg text-on-surface text-sm focus:outline-none focus:border-primary-container"
                      />
                      {billErrors.units && <p className="text-volt-pink text-xs mt-1">{billErrors.units.message}</p>}
                    </div>
                  </div>

                  <div className="flex justify-between pt-4">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="border border-outline-variant text-on-surface px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-surface-container-high transition-all"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      className="bg-primary-container text-on-primary-container px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-primary-container/90 transition-all flex items-center justify-center gap-2"
                    >
                      Next Step <ArrowRightIcon />
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h3 className="font-display font-bold text-xl text-on-surface mb-2">Step 3: Appliance Telemetry Adjustments</h3>
                <p className="text-on-surface-variant text-xs mb-6">Toggle the appliances in use and slide to configure their approximate average daily run-time.</p>

                <div className="space-y-4 max-h-[380px] overflow-y-auto pr-2">
                  {Object.keys(DEFAULT_APPLIANCES).map((key) => {
                    const app = DEFAULT_APPLIANCES[key];
                    const isSelected = selectedAppliances[key];
                    return (
                      <div
                        key={key}
                        className={`p-4 rounded-xl border transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                          isSelected
                            ? 'bg-primary/5 border-primary/30 shadow-[0_0_10px_rgba(0,229,255,0.05)]'
                            : 'bg-surface border-outline-variant/30 opacity-70 hover:opacity-90'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => toggleAppliance(key)}
                            className={`w-6 h-6 rounded border flex items-center justify-center transition-all ${
                              isSelected
                                ? 'bg-primary-container border-primary text-on-primary-container'
                                : 'border-outline-variant hover:border-primary/50'
                            }`}
                          >
                            {isSelected && <Check className="w-4 h-4" />}
                          </button>
                          <div>
                            <span className="text-lg mr-1.5">{app.icon}</span>
                            <span className="text-sm font-bold text-on-surface">{app.name}</span>
                            <p className="text-[10px] text-on-surface-variant font-mono uppercase mt-0.5">Rating: {app.power_kw} kW</p>
                          </div>
                        </div>

                        {isSelected && (
                          <div className="flex-1 max-w-xs md:ml-auto space-y-1.5">
                            <div className="flex justify-between text-xs font-mono font-bold text-on-surface-variant">
                              <span>Daily run-time:</span>
                              <span className="text-primary">{applianceHours[key]} hours</span>
                            </div>
                            <input
                              type="range"
                              min={0.1}
                              max={app.name.includes('Refrigerator') ? 24 : 16}
                              step={0.1}
                              value={applianceHours[key]}
                              onChange={(e) => handleHourChange(key, parseFloat(e.target.value))}
                              className="w-full accent-primary-container h-1 bg-surface-container-high rounded-full outline-none"
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-between pt-6">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="border border-outline-variant text-on-surface px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-surface-container-high transition-all"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={onAppliancesNext}
                    className="bg-primary-container text-on-primary-container px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-primary-container/90 transition-all flex items-center justify-center gap-2"
                  >
                    Next Step <ArrowRightIcon />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 4 && currentCalc && billData && profileData && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <div className="w-12 h-12 bg-tertiary-container/20 rounded-full border border-tertiary/30 flex items-center justify-center mx-auto mb-3 animate-pulse-glow">
                    <ShieldCheck className="w-6 h-6 text-tertiary" />
                  </div>
                  <h3 className="font-display font-bold text-xl text-on-surface">Telemetry Calibration Ready</h3>
                  <p className="text-on-surface-variant text-xs">Mathematical models have disaggregated your appliances and match your real DISCOM parameters.</p>
                </div>

                {/* Score Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-surface border border-outline-variant/30 p-4 rounded-xl text-center">
                    <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block mb-1">Uploaded Utility Bill</span>
                    <span className="font-mono font-bold text-xl text-on-surface">{formatUnits(billData.units)}</span>
                    <span className="block text-[10px] text-outline font-sans mt-0.5">({formatCurrency(billData.bill_amount)})</span>
                  </div>

                  <div className="bg-surface border border-outline-variant/30 p-4 rounded-xl text-center relative overflow-hidden">
                    <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block mb-1">Voltify AI Estimate</span>
                    <span className="font-mono font-bold text-xl text-primary">{formatUnits(currentCalc.estKwh)}</span>
                    <span className="block text-[10px] text-outline font-sans mt-0.5">({formatCurrency(Math.round(currentCalc.estKwh * currentCalc.rate))})</span>
                  </div>

                  <div className="bg-surface border border-outline-variant/30 p-4 rounded-xl text-center">
                    <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block mb-1">Disaggregation Accuracy</span>
                    <span className={`font-mono font-bold text-xl ${
                      currentCalc.accuracy >= 80 ? 'text-tertiary' : 'text-volt-amber'
                    }`}>{currentCalc.accuracy}%</span>
                    <span className="block text-[10px] text-outline font-sans mt-0.5">Calibration Complete</span>
                  </div>
                </div>

                {/* Math Disaggregation breakdown text list */}
                <div className="bg-surface-container-high/40 border border-outline-variant/20 p-5 rounded-xl space-y-3">
                  <h4 className="font-bold text-[10px] uppercase tracking-wider text-on-surface mb-2">Estimated Appliance Breakdown Preview</h4>
                  <div className="space-y-2">
                    {currentCalc.appliances.slice(0, 4).map((app) => {
                      const sharePct = Math.round(
                        ((app.power_kw * applianceHours[app.id] * 30) / (currentCalc.estKwh || 1)) * 100
                      );
                      return (
                        <div key={app.id} className="flex justify-between items-center text-xs">
                          <span className="text-on-surface-variant flex items-center gap-1.5">
                            <span>{app.icon}</span> {app.name}
                          </span>
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-outline">{applianceHours[app.id]} hrs/day</span>
                            <span className="font-mono font-bold text-on-surface">{sharePct}% share</span>
                          </div>
                        </div>
                      );
                    })}
                    {currentCalc.appliances.length > 4 && (
                      <p className="text-center text-[10px] text-outline italic font-sans">+ {currentCalc.appliances.length - 4} more appliances</p>
                    )}
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="border border-outline-variant text-on-surface px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-surface-container-high transition-all"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={finishOnboarding}
                    className="bg-primary-container text-on-primary-container px-10 py-3 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-primary-container/90 transition-all flex items-center justify-center gap-2 animate-pulse-glow font-display"
                  >
                    Acknowledge & Calibrate <Play className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// Arrow icon
function ArrowRightIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
    </svg>
  );
}
