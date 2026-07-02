// src/pages/onboarding/index.tsx
import { useReducer } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-toastify';
import { useDropzone } from 'react-dropzone';
import { AnimatePresence, LazyMotion, domAnimation, m } from 'framer-motion';
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

interface OnboardingState {
  step: number;
  profileData: ProfileForm | null;
  billData: BillForm | null;
  selectedAppliances: Record<string, boolean>;
  applianceHours: Record<string, number>;
}

type OnboardingAction =
  | { type: 'SET_STEP'; payload: number }
  | { type: 'SET_PROFILE_DATA'; payload: ProfileForm }
  | { type: 'SET_BILL_DATA'; payload: BillForm }
  | { type: 'TOGGLE_APPLIANCE'; payload: string }
  | { type: 'SET_APPLIANCE_HOURS'; payload: { key: string; val: number } };

function onboardingReducer(state: OnboardingState, action: OnboardingAction): OnboardingState {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, step: action.payload };
    case 'SET_PROFILE_DATA':
      return { ...state, profileData: action.payload };
    case 'SET_BILL_DATA':
      return { ...state, billData: action.payload };
    case 'TOGGLE_APPLIANCE':
      return {
        ...state,
        selectedAppliances: {
          ...state.selectedAppliances,
          [action.payload]: !state.selectedAppliances[action.payload],
        },
      };
    case 'SET_APPLIANCE_HOURS':
      return {
        ...state,
        applianceHours: {
          ...state.applianceHours,
          [action.payload.key]: action.payload.val,
        },
      };
    default:
      return state;
  }
}

export default function Onboarding() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuthStore();
  const { setOnboarding, setDailyHistory, setApplianceBreakdown, setInsights } = useDashboardStore();
  const { addCoins, setRank } = useGamificationStore();

  const [state, dispatch] = useReducer(onboardingReducer, {
    step: 1,
    profileData: null,
    billData: null,
    selectedAppliances: {
      AC: true,
      Fridge: true,
      TV: true,
      Lights: true,
      Fans: true,
      Laptop: true,
    },
    applianceHours: {
      AC: 8,
      Fridge: 24,
      TV: 4,
      Geyser: 1.5,
      WashingMachine: 0.5,
      Microwave: 0.3,
      Lights: 6,
      Fans: 10,
      Laptop: 6,
    },
  });

  const toggleAppliance = (key: string) => {
    dispatch({ type: 'TOGGLE_APPLIANCE', payload: key });
  };

  const handleHourChange = (key: string, val: number) => {
    dispatch({ type: 'SET_APPLIANCE_HOURS', payload: { key, val } });
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
    if (!state.profileData || !state.billData) return null;
    
    // Construct appliance array from selections
    const appliances = Object.keys(DEFAULT_APPLIANCES).reduce<any[]>((acc, key) => {
      if (state.selectedAppliances[key]) {
        acc.push({
          id: key,
          name: DEFAULT_APPLIANCES[key].name,
          icon: DEFAULT_APPLIANCES[key].icon,
          power_kw: DEFAULT_APPLIANCES[key].power_kw,
          avg_hours_day: state.applianceHours[key],
          seasonality: DEFAULT_APPLIANCES[key].seasonality,
        });
      }
      return acc;
    }, []);

    const estKwh = estimateMonthlyKwh(appliances);
    const rate = getTariffRate(state.profileData.location);
    const accuracy = Math.round(100 - Math.min(100, Math.abs((estKwh - state.billData.units) / state.billData.units) * 100));

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
    dispatch({ type: 'SET_PROFILE_DATA', payload: data });
    dispatch({ type: 'SET_STEP', payload: 2 });
  };

  const onBillNext = (data: BillForm) => {
    dispatch({ type: 'SET_BILL_DATA', payload: data });
    dispatch({ type: 'SET_STEP', payload: 3 });
  };

  const onAppliancesNext = () => {
    dispatch({ type: 'SET_STEP', payload: 4 });
  };

  const finishOnboarding = () => {
    if (!state.profileData || !state.billData || !currentCalc) return;

    // Estimate breakdowns
    const breakdown = estimateApplianceBreakdown(
      currentCalc.appliances,
      state.billData.bill_amount,
      state.billData.units,
      currentCalc.rate
    );

    // Generate daily histories
    const history = generateDailyUsage(currentCalc.appliances, 30, state.profileData.location);

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
      household_type: state.profileData.household_type,
      location: state.profileData.location,
      home_type: state.profileData.home_type,
      bill_amount: state.billData.bill_amount,
      units_per_month: state.billData.units,
      appliances: currentCalc.appliances,
      estimated_units: currentCalc.estKwh,
      accuracy_pct: currentCalc.accuracy,
      prev_bills: [
        { month: 'April', amount: state.billData.bill_amount, units: state.billData.units },
        { month: 'March', amount: state.billData.bill_amount * 0.9, units: state.billData.units * 0.9 },
      ],
    });

    setDailyHistory(history);
    setApplianceBreakdown(breakdown);
    setInsights(newInsights);

    // Update user store
    updateUser({
      household_type: state.profileData.household_type,
      location: state.profileData.location,
      home_type: state.profileData.home_type,
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
    <LazyMotion features={domAnimation}>
      <div className="min-h-screen bg-[#090e1a] flex flex-col justify-center py-10 px-4 md:px-10 font-headline text-on-surface">
        <div className="max-w-3xl w-full mx-auto">
          {/* Progress header */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 mb-4">
              <div className="size-8 rounded bg-slate-800 border border-white/10 flex items-center justify-center">
                <Zap className="size-4 text-primary" />
              </div>
              <span className="font-display text-xl font-bold tracking-tighter text-white">VOLTIFY</span>
            </Link>

          <div className="flex items-center justify-between max-w-md mx-auto relative mb-3">
            <div className="absolute left-0 right-0 h-0.5 bg-white/5 top-1/2 -translate-y-1/2 -z-10" />
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`size-8 rounded-full border flex items-center justify-center text-xs font-bold font-mono transition-all duration-300 relative z-10 ${
                  s === state.step
                    ? 'bg-primary text-slate-900 border-primary'
                    : s < state.step
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : 'bg-slate-900 border-white/5 text-gray-500'
                }`}
              >
                {s < state.step ? <Check className="size-4" /> : s}
              </div>
            ))}
          </div>
          <div className="flex justify-between max-w-md mx-auto text-[10px] uppercase font-bold text-gray-400 tracking-wider">
            <span>Profile</span>
            <span>Billing</span>
            <span>Appliances</span>
            <span>Review</span>
          </div>
        </div>

        {/* Content Box */}
        <div className="glass-card rounded-2xl p-8 border border-white/5 shadow-2xl relative bg-slate-900/60 backdrop-blur-md">
          <AnimatePresence mode="wait">
            {state.step === 1 && (
              <m.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h3 className="font-display font-semibold text-lg text-white mb-1">Step 1: Household Profile</h3>
                <p className="text-gray-400 text-xs mb-6">Describe your home setup to help customize your baseline estimates.</p>

                <form onSubmit={handleProfileSubmit(onProfileNext)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Home Type */}
                    <div>
                      <label htmlFor="home_type" className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Dwelling Type</label>
                      <select
                        {...regProfile('home_type')}
                        id="home_type"
                        className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all font-sans"
                      >
                        <option value="apartment">Apartment / Flat</option>
                        <option value="house">Independent House</option>
                        <option value="villa">Luxury Villa</option>
                      </select>
                    </div>

                    {/* Household Type */}
                    <div>
                      <label htmlFor="household_type" className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Household Size</label>
                      <select
                        {...regProfile('household_type')}
                        id="household_type"
                        className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all font-sans"
                      >
                        <option value="bachelor">Single Person</option>
                        <option value="family">Small Family (2–4 Persons)</option>
                        <option value="large_family">Large Family (5+ Persons)</option>
                        <option value="organization">Office / Institution</option>
                      </select>
                    </div>

                    {/* Region */}
                    <div className="md:col-span-2">
                      <label htmlFor="location" className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Electricity Provider (DISCOM) Region</label>
                      <select
                        {...regProfile('location')}
                        id="location"
                        className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all font-sans"
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
                      className="bg-primary hover:bg-primary-hover text-slate-950 px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 font-display"
                    >
                      Next Step <ArrowRightIcon />
                    </button>
                  </div>
                </form>
              </m.div>
            )}

            {state.step === 2 && (
              <m.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h3 className="font-display font-semibold text-lg text-white mb-1">Step 2: Utility Bill Details</h3>
                <p className="text-gray-400 text-xs mb-6">Upload a simulated electricity bill or enter your last billing figures manually.</p>

                {/* Dropzone */}
                <div
                  {...getRootProps()}
                  className={`border border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 mb-6 flex flex-col items-center ${
                    isDragActive
                      ? 'border-primary bg-primary/5'
                      : 'border-white/10 bg-slate-900/40 hover:border-primary/50'
                  }`}
                >
                  <input {...getInputProps()} />
                  <Upload className="size-8 text-gray-500 mb-3 group-hover:text-primary transition-colors" />
                  <p className="text-sm font-bold text-white">Drag & Drop simulated bill PDF here</p>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide mt-1">Accepts simulated files to instantly decode details</p>
                </div>

                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-white/5"></div>
                  <span className="flex-shrink mx-4 text-gray-500 text-[10px] uppercase font-bold tracking-wider">OR ENTER MANUALLY</span>
                  <div className="flex-grow border-t border-white/5"></div>
                </div>

                <form onSubmit={handleBillSubmit(onBillNext)} className="space-y-6 mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Bill amount */}
                    <div>
                      <label htmlFor="bill_amount" className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Recent Bill Amount (₹)</label>
                      <input
                        {...regBill('bill_amount', { valueAsNumber: true })}
                        id="bill_amount"
                        type="number"
                        placeholder="e.g. 3500"
                        className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all font-sans"
                      />
                      {billErrors.bill_amount && <p className="text-rose-500 text-xs mt-1">{billErrors.bill_amount.message}</p>}
                    </div>

                    {/* Units consumed */}
                    <div>
                      <label htmlFor="units" className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Units Consumed (kWh)</label>
                      <input
                        {...regBill('units', { valueAsNumber: true })}
                        id="units"
                        type="number"
                        placeholder="e.g. 420"
                        className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all font-sans"
                      />
                      {billErrors.units && <p className="text-rose-500 text-xs mt-1">{billErrors.units.message}</p>}
                    </div>
                  </div>

                  <div className="flex justify-between pt-4">
                    <button
                      type="button"
                      onClick={() => dispatch({ type: 'SET_STEP', payload: 1 })}
                      className="border border-white/10 text-gray-300 px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-slate-800 transition-all"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      className="bg-primary hover:bg-primary-hover text-slate-950 px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 font-display font-bold"
                    >
                      Next Step <ArrowRightIcon />
                    </button>
                  </div>
                </form>
              </m.div>
            )}

            {state.step === 3 && (
              <m.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h3 className="font-display font-semibold text-lg text-white mb-1">Step 3: Home Appliance Calibration</h3>
                <p className="text-gray-400 text-xs mb-6">Select key household appliances and adjust their estimated daily active hours.</p>

                <div className="space-y-4 max-h-[380px] overflow-y-auto pr-2">
                  {Object.keys(DEFAULT_APPLIANCES).map((key) => {
                    const app = DEFAULT_APPLIANCES[key];
                    const isSelected = state.selectedAppliances[key];
                    return (
                      <div
                        key={key}
                        className={`p-4 rounded-2xl border transition-all duration-350 flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                          isSelected
                            ? 'bg-primary/5 border-primary/20 shadow-[0_4px_20px_rgba(195,245,255,0.02)]'
                            : 'bg-slate-900/30 border-white/5 opacity-70 hover:opacity-90'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => toggleAppliance(key)}
                            className={`size-5 rounded-md border flex items-center justify-center transition-all ${
                              isSelected
                                ? 'bg-primary border-primary text-slate-950'
                                : 'border-white/10 hover:border-primary/50'
                            }`}
                          >
                            {isSelected && <Check className="size-3.5 stroke-[3]" />}
                          </button>
                          <div>
                            <span className="text-lg mr-1.5">{app.icon}</span>
                            <span className="text-sm font-bold text-white">{app.name}</span>
                            <p className="text-[10px] text-gray-500 font-mono uppercase mt-0.5">Power Rating: {app.power_kw} kW</p>
                          </div>
                        </div>

                        {isSelected && (
                          <div className="flex-1 max-w-xs md:ml-auto space-y-1.5">
                            <div className="flex justify-between text-xs font-mono font-bold text-gray-400">
                              <span>Daily active hours:</span>
                              <span className="text-primary">{state.applianceHours[key]} hours</span>
                            </div>
                            <input
                              type="range"
                              min={0.1}
                              max={app.name.includes('Refrigerator') ? 24 : 16}
                              step={0.1}
                              value={state.applianceHours[key]}
                              onChange={(e) => handleHourChange(key, parseFloat(e.target.value))}
                              className="w-full accent-primary h-1 bg-white/10 rounded-full outline-none cursor-pointer"
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
                    onClick={() => dispatch({ type: 'SET_STEP', payload: 2 })}
                    className="border border-white/10 text-gray-300 px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-slate-800 transition-all"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={onAppliancesNext}
                    className="bg-primary hover:bg-primary-hover text-slate-950 px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 font-display font-bold"
                  >
                    Next Step <ArrowRightIcon />
                  </button>
                </div>
              </m.div>
            )}

            {state.step === 4 && currentCalc && state.billData && state.profileData && (
              <m.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <div className="size-12 bg-emerald-500/10 rounded-full border border-emerald-500/30 flex items-center justify-center mx-auto mb-3">
                    <ShieldCheck className="size-6 text-emerald-400" />
                  </div>
                  <h3 className="font-display font-semibold text-lg text-white">Calibration Complete</h3>
                  <p className="text-gray-400 text-xs">Our estimates successfully match your utility provider bill details.</p>
                </div>

                {/* Score Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-slate-900 border border-white/5 p-4 rounded-xl text-center">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Utility Bill Load</span>
                    <span className="font-mono font-bold text-lg text-white">{formatUnits(state.billData.units)}</span>
                    <span className="block text-[10px] text-gray-500 font-sans mt-0.5">({formatCurrency(state.billData.bill_amount)})</span>
                  </div>

                  <div className="bg-slate-900 border border-white/5 p-4 rounded-xl text-center relative overflow-hidden">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Estimated Baseline</span>
                    <span className="font-mono font-bold text-lg text-primary">{formatUnits(currentCalc.estKwh)}</span>
                    <span className="block text-[10px] text-gray-500 font-sans mt-0.5">({formatCurrency(Math.round(currentCalc.estKwh * currentCalc.rate))})</span>
                  </div>

                  <div className="bg-slate-900 border border-white/5 p-4 rounded-xl text-center">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Calibration Accuracy</span>
                    <span className={`font-mono font-bold text-lg ${
                      currentCalc.accuracy >= 80 ? 'text-emerald-400' : 'text-volt-amber'
                    }`}>{currentCalc.accuracy}%</span>
                    <span className="block text-[10px] text-gray-500 font-sans mt-0.5">Ready for Analysis</span>
                  </div>
                </div>

                {/* Math Disaggregation breakdown text list */}
                <div className="bg-slate-900 border border-white/5 p-5 rounded-xl space-y-3">
                  <h4 className="font-semibold text-[10px] uppercase tracking-wider text-white mb-2">Estimated Appliance Share</h4>
                  <div className="space-y-2">
                    {currentCalc.appliances.slice(0, 4).map((app) => {
                      const sharePct = Math.round(
                        ((app.power_kw * state.applianceHours[app.id] * 30) / (currentCalc.estKwh || 1)) * 100
                      );
                      return (
                        <div key={app.id} className="flex justify-between items-center text-xs">
                          <span className="text-gray-400 flex items-center gap-1.5">
                            <span>{app.icon}</span> {app.name}
                          </span>
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-gray-500">{state.applianceHours[app.id]} hrs/day</span>
                            <span className="font-mono font-bold text-white">{sharePct}% share</span>
                          </div>
                        </div>
                      );
                    })}
                    {currentCalc.appliances.length > 4 && (
                      <p className="text-center text-[10px] text-gray-500 italic font-sans">+ {currentCalc.appliances.length - 4} more appliances</p>
                    )}
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    type="button"
                    onClick={() => dispatch({ type: 'SET_STEP', payload: 3 })}
                    className="border border-white/10 text-gray-300 px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-slate-800 transition-all"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={finishOnboarding}
                    className="bg-primary hover:bg-primary-hover text-slate-950 px-10 py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 font-display font-bold shadow-lg"
                  >
                    Complete Onboarding <Play className="size-4 fill-current text-slate-950" />
                  </button>
                </div>
              </m.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  </LazyMotion>
  );
}

// Arrow icon
function ArrowRightIcon() {
  return (
    <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
    </svg>
  );
}
