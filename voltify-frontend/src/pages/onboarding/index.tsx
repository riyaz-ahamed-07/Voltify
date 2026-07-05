// src/pages/onboarding/index.tsx
import { useReducer, useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-toastify';
import { useDropzone } from 'react-dropzone';
import { AnimatePresence, LazyMotion, domAnimation, m } from 'framer-motion';
import {
  Zap, Upload, ShieldCheck, Home, Check, Play, User as UserIcon,
  Settings, Trash2, Plus, ChevronDown, MapPin, Loader2, Sparkles, AlertCircle
} from 'lucide-react';
import { DEFAULT_APPLIANCES } from '../../types/appliance';
import { useAuthStore } from '../../store/authStore';
import { useDashboardStore } from '../../store/dashboardStore';
import { useGamificationStore } from '../../store/gamificationStore';
import { estimateMonthlyKwh, estimateApplianceBreakdown, generateDailyUsage } from '../../lib/estimation';
import { formatCurrency, formatUnits, getTariffRate } from '../../lib/utils';
import { apiService } from '../../lib/api';

// ─── Zod schemas ────────────────────────────────────────────────────────────
const profileSchema = z.object({
  household_type: z.enum(['bachelor', 'family', 'large_family', 'organization'], {
    message: 'Please select household size'
  }),
  location:        z.enum(['Chennai', 'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Kolkata'], {
    message: 'Please select a supported city'
  }),
  home_type:       z.enum(['apartment', 'house', 'villa'], {
    message: 'Please select dwelling type'
  }),
});

const billSchema = z.object({
  bill_amount: z.number({ message: 'Amount is required' }).min(10, 'Invalid bill amount'),
  units:       z.number({ message: 'Units are required' }).min(5, 'Invalid units consumed'),
});

type ProfileForm = z.infer<typeof profileSchema>;
type BillForm    = z.infer<typeof billSchema>;

// ─── State ────────────────────────────────────────────────────────────────
interface OnboardingState {
  step: number;
  profileData: ProfileForm | null;
  billData: BillForm | null;
  appliances: any[];
}

type OnboardingAction =
  | { type: 'SET_STEP'; payload: number }
  | { type: 'SET_PROFILE_DATA'; payload: ProfileForm }
  | { type: 'SET_BILL_DATA'; payload: BillForm }
  | { type: 'SET_APPLIANCES'; payload: any[] }
  | { type: 'ADD_APPLIANCE'; payload: any }
  | { type: 'REMOVE_APPLIANCE'; payload: string }
  | { type: 'UPDATE_APPLIANCE'; payload: { id: string; fields: Partial<any> } };

function onboardingReducer(state: OnboardingState, action: OnboardingAction): OnboardingState {
  switch (action.type) {
    case 'SET_STEP':         return { ...state, step: action.payload };
    case 'SET_PROFILE_DATA': return { ...state, profileData: action.payload };
    case 'SET_BILL_DATA':    return { ...state, billData: action.payload };
    case 'SET_APPLIANCES':   return { ...state, appliances: action.payload };
    case 'ADD_APPLIANCE':    return { ...state, appliances: [...state.appliances, action.payload] };
    case 'REMOVE_APPLIANCE': return { ...state, appliances: state.appliances.filter(a => a.id !== action.payload) };
    case 'UPDATE_APPLIANCE':
      return {
        ...state,
        appliances: state.appliances.map(a =>
          a.id === action.payload.id ? { ...a, ...action.payload.fields } : a
        )
      };
    default: return state;
  }
}

// ─── Custom Dropdown Component ────────────────────────────────────────────
interface DropdownOption { value: string; label: string; description?: string; icon?: string }

interface CustomDropdownProps {
  id?: string;
  value: string;
  onChange: (val: string) => void;
  options: DropdownOption[];
  placeholder?: string;
  error?: string;
}

function CustomDropdown({ id, value, onChange, options, placeholder = 'Select...', error }: CustomDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find(o => o.value === value);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={ref} className="relative w-full" id={id}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={`w-full px-4 py-2.5 bg-surface border rounded-lg text-sm flex items-center justify-between gap-2 transition-all duration-200 outline-none ${
          open
            ? 'border-primary ring-1 ring-primary/20'
            : error
            ? 'border-error/60'
            : 'border-outline hover:border-outline-variant'
        }`}
      >
        <span className={selected ? 'text-on-surface font-medium' : 'text-on-surface-variant'}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown
          className={`size-4 text-on-surface-variant flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-1.5 z-50 bg-surface-container border border-outline rounded-xl shadow-2xl overflow-hidden">
          <div className="py-1 max-h-52 overflow-y-auto">
            {options.map(opt => {
              const isActive = value === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => { onChange(opt.value); setOpen(false); }}
                  className={`w-full px-4 py-2.5 text-left flex items-center gap-3 transition-all duration-150 ${
                    isActive
                      ? 'bg-primary/15 text-primary'
                      : 'text-on-surface hover:bg-surface/60'
                  }`}
                >
                  {opt.icon && <span className="text-base">{opt.icon}</span>}
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-medium truncate">{opt.label}</span>
                    {opt.description && (
                      <span className="text-[11px] text-on-surface-variant mt-0.5">{opt.description}</span>
                    )}
                  </div>
                  {isActive && <Check className="size-4 ml-auto flex-shrink-0 text-primary" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {error && <p className="text-error text-xs mt-1">{error}</p>}
    </div>
  );
}

// ─── Month Dropdown (for history) ─────────────────────────────────────────
function MonthDropdown({ value, onChange, months }: { value: string; onChange: (v: string) => void; months: { value: string; label: string }[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = months.find(m => m.value === value);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={ref} className="relative w-full">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={`w-full px-3 py-2 bg-surface border rounded-lg text-xs flex items-center justify-between gap-2 transition-all duration-200 outline-none ${
          open ? 'border-primary ring-1 ring-primary/20' : 'border-outline hover:border-outline-variant'
        }`}
      >
        <span className={selected ? 'text-on-surface font-medium' : 'text-on-surface-variant'}>
          {selected ? selected.label : 'Select month...'}
        </span>
        <ChevronDown className={`size-3.5 text-on-surface-variant flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-surface-container border border-outline rounded-xl shadow-2xl overflow-hidden">
          <div className="py-1 max-h-44 overflow-y-auto">
            {months.map(m => {
              const isActive = value === m.value;
              return (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => { onChange(m.value); setOpen(false); }}
                  className={`w-full px-3 py-2 text-left text-xs transition-all duration-150 flex items-center justify-between ${
                    isActive ? 'bg-primary/15 text-primary font-semibold' : 'text-on-surface hover:bg-surface/60'
                  }`}
                >
                  {m.label}
                  {isActive && <Check className="size-3 text-primary" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Onboarding ─────────────────────────────────────────────────────
export default function Onboarding() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuthStore();
  const { setOnboarding, setDailyHistory, setApplianceBreakdown, setInsights } = useDashboardStore();
  const { addCoins, setRank } = useGamificationStore();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [prevBills, setPrevBills] = useState<{ month: string; monthLabel: string; bill_amount: number; units: number }[]>([]);
  const [historyMonth, setHistoryMonth] = useState('');
  const [historyAmount, setHistoryAmount] = useState('');
  const [historyUnits, setHistoryUnits] = useState('');
  const [isAddDropdownOpen, setIsAddDropdownOpen] = useState(false);
  const addBtnRef = useRef<HTMLDivElement>(null);

  const [state, dispatch] = useReducer(onboardingReducer, {
    step: 1,
    profileData: null,
    billData: null,
    appliances: [
      { id: 'AC',     name: 'Air Conditioner', icon: '❄️', power_kw: 1.5,   avg_hours_day: 8,  seasonality: 'summer' },
      { id: 'Fridge', name: 'Refrigerator',    icon: '🧊', power_kw: 0.4,   avg_hours_day: 24, seasonality: 'whole_year' },
      { id: 'Lights', name: 'Lights',          icon: '💡', power_kw: 0.3,   avg_hours_day: 5,  seasonality: 'whole_year' },
      { id: 'Fans',   name: 'Fans',            icon: '🌀', power_kw: 0.075, avg_hours_day: 8,  seasonality: 'whole_year' },
    ],
  });

  // Close add-appliance dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (addBtnRef.current && !addBtnRef.current.contains(e.target as Node)) setIsAddDropdownOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const getPastMonths = () => {
    const months = [];
    const date = new Date();
    for (let i = 1; i <= 6; i++) {
      const d = new Date(date.getFullYear(), date.getMonth() - i, 1);
      months.push({
        label: d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }),
        value: d.toISOString().split('T')[0]
      });
    }
    return months;
  };

  const handleAddHistoryBill = () => {
    if (!historyMonth || !historyAmount || !historyUnits) {
      toast.warning('Please fill in all fields (Month, Amount, and Units) for the historical bill.');
      return;
    }
    const amountNum = parseFloat(historyAmount);
    const unitsNum  = parseFloat(historyUnits);
    if (isNaN(amountNum) || amountNum <= 0) { toast.warning('Please enter a valid bill amount.'); return; }
    if (isNaN(unitsNum)  || unitsNum  <= 0) { toast.warning('Please enter valid units consumed.');  return; }

    const monthsList = getPastMonths();
    const match = monthsList.find(m => m.value === historyMonth);
    const label = match ? match.label : historyMonth;

    if (prevBills.some(b => b.month === historyMonth)) {
      toast.warning(`Bill record for ${label} has already been added.`);
      return;
    }

    setPrevBills([...prevBills, { month: historyMonth, monthLabel: label, bill_amount: amountNum, units: unitsNum }]);
    setHistoryMonth(''); setHistoryAmount(''); setHistoryUnits('');
    toast.success(`Bill record for ${label} added!`);
  };

  const handleRemoveHistoryBill = (idx: number) => setPrevBills(prevBills.filter((_, i) => i !== idx));

  const handleAddDefaultAppliance = (defApp: any) => {
    dispatch({
      type: 'ADD_APPLIANCE',
      payload: { id: defApp.key, name: defApp.name, icon: defApp.icon, power_kw: defApp.power_kw, avg_hours_day: defApp.avg_hours_day, seasonality: defApp.seasonality || 'whole_year' }
    });
    setIsAddDropdownOpen(false);
    toast.success(`${defApp.name} added!`);
  };

  const handleAddCustomAppliance = () => {
    dispatch({
      type: 'ADD_APPLIANCE',
      payload: { id: `custom-${Date.now()}`, name: 'Custom Appliance', icon: '🔌', power_kw: 0.5, avg_hours_day: 2.0, seasonality: 'whole_year', isCustom: true }
    });
    toast.success('Custom appliance template added!');
  };

  // ─── Forms ────────────────────────────────────────────────────────────
  const {
    register: regProfile, handleSubmit: handleProfileSubmit,
    setValue: setProfileValue, watch: watchProfile,
    formState: { errors: profileErrors }
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: { household_type: '' as any, location: '' as any, home_type: '' as any },
  });

  const watchedHomeType      = watchProfile('home_type');
  const watchedHouseholdType = watchProfile('household_type');
  const watchedLocation      = watchProfile('location');

  const {
    register: regBill, handleSubmit: handleBillSubmit,
    setValue: setBillValue, formState: { errors: billErrors }
  } = useForm<BillForm>({ resolver: zodResolver(billSchema) });

  // Dropzone
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    onDrop: async (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        const loadingId = toast.info('Analyzing utility statement via Voltify AI...');
        try {
          const res = await apiService.parseBillPDF(file);
          if (res.data) {
            setBillValue('bill_amount', res.data.bill_amount, { shouldValidate: true });
            setBillValue('units',       res.data.units,       { shouldValidate: true });
            toast.dismiss(loadingId);
            toast.success(`Statement parsed successfully! Detected ₹${res.data.bill_amount.toLocaleString()} net payable & ${res.data.units} kWh units consumed.`);
          }
        } catch (err: any) {
          toast.dismiss(loadingId);
          toast.error(err.message || 'Failed to parse statement PDF. Please enter manually.');
        }
      }
    },
  });

  // ─── Calculations for step 4 ──────────────────────────────────────────
  const getReviewCalculations = () => {
    if (!state.profileData || !state.billData) return null;
    const estKwh    = estimateMonthlyKwh(state.appliances);
    const rate      = getTariffRate(state.profileData.location, state.billData.units);
    const accuracy  = Math.round(100 - Math.min(100, Math.abs((estKwh - state.billData.units) / state.billData.units) * 100));
    return { appliances: state.appliances, estKwh, rate, accuracy };
  };

  const currentCalc = getReviewCalculations();

  // ─── Navigation handlers ─────────────────────────────────────────────
  const onProfileNext = async (data: ProfileForm) => {
    try {
      setIsSubmitting(true);
      await apiService.saveProfile({ ...data, appliance_count: state.appliances.length });
      dispatch({ type: 'SET_PROFILE_DATA', payload: data });
      dispatch({ type: 'SET_STEP', payload: 2 });
    } catch (e: any) {
      toast.error(e.message || 'Failed to save profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onBillNext = async (data: BillForm) => {
    try {
      setIsSubmitting(true);
      await apiService.saveBill({
        ...data,
        prev_bills: prevBills.map(b => ({ bill_amount: b.bill_amount, units: b.units, month: b.month }))
      });
      dispatch({ type: 'SET_BILL_DATA', payload: data });
      dispatch({ type: 'SET_STEP', payload: 3 });
    } catch (e: any) {
      toast.error(e.message || 'Failed to save bill');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onAppliancesNext = () => {
    if (state.appliances.length === 0) {
      toast.warning('Please add at least one appliance to calibrate your energy model.');
      return;
    }
    dispatch({ type: 'SET_STEP', payload: 4 });
  };

  const finishOnboarding = async () => {
    if (!state.profileData || !state.billData || !currentCalc) return;
    let serverData: any = null;
    try {
      setIsSubmitting(true);
      const response = await apiService.saveAppliances(currentCalc.appliances);
      if (response && response.success && response.data) serverData = response.data;
    } catch (e: any) {
      toast.error(e.message || 'Failed to save appliances');
      return;
    } finally {
      setIsSubmitting(false);
    }

    const NEON_COLORS = ['#22d3ee', '#ec4899', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#a78bfa'];

    const breakdown = serverData?.breakdown
      ? serverData.breakdown.map((item: any, idx: number) => {
          const appKey = Object.keys(DEFAULT_APPLIANCES).find(k => DEFAULT_APPLIANCES[k].name === item.name);
          return {
            name: item.name,
            icon: appKey ? DEFAULT_APPLIANCES[appKey].icon : '🔌',
            units: parseFloat(item.estimated_kwh || item.units || '0'),
            percentage: parseFloat(item.percentage || '0'),
            cost: parseFloat(item.estimated_cost || item.cost || '0'),
            color: NEON_COLORS[idx % NEON_COLORS.length],
          };
        })
      : estimateApplianceBreakdown(currentCalc.appliances, state.billData.bill_amount, state.billData.units, currentCalc.rate);

    const history = generateDailyUsage(currentCalc.appliances, 30, state.profileData.location, state.billData.units);

    const newInsights = [
      {
        id: 'in-1', type: 'warning' as const, title: 'AC Load Calibration Alert',
        message: 'Your AC is calculated to take up ' + (breakdown.find((b: any) => b.name === 'Air Conditioner')?.percentage || '35') + '% of your total bill. Adjust temperature to save up to ₹900.',
        action: '/dashboard',
      },
      {
        id: 'in-2', type: 'success' as const, title: 'Energy Calibration Accuracy',
        message: 'Telemetry calculations matched your uploaded utility billing files with ' + (serverData?.match_percentage ?? currentCalc.accuracy) + '% accuracy!',
        action: '/dashboard',
      },
    ];

    setOnboarding({
      household_type: state.profileData.household_type,
      location:       state.profileData.location,
      home_type:      state.profileData.home_type,
      bill_amount:    state.billData.bill_amount,
      units_per_month: state.billData.units,
      appliances:     currentCalc.appliances,
      estimated_units: serverData?.estimated_monthly_units ?? currentCalc.estKwh,
      accuracy_pct:   serverData?.match_percentage ?? currentCalc.accuracy,
      prev_bills: prevBills.length > 0
        ? prevBills.map(b => ({ month: b.monthLabel, amount: b.bill_amount, units: b.units }))
        : [
            { month: 'April', amount: state.billData.bill_amount,         units: state.billData.units },
            { month: 'March', amount: state.billData.bill_amount * 0.9,   units: state.billData.units * 0.9 },
          ],
    });

    setDailyHistory(history);
    setApplianceBreakdown(breakdown);
    setInsights(newInsights);

    updateUser({
      household_type: state.profileData.household_type,
      location:       state.profileData.location,
      home_type:      state.profileData.home_type,
      appliance_count: currentCalc.appliances.length,
      coins:     user?.coins ? user.coins + 150 : 150,
      streak_days: 1,
    });

    addCoins(150);
    setRank(47);
    toast.success('Onboarding complete! 150 coins added to your balance.');
    navigate('/dashboard');
  };

  const remainingDefaults = Object.keys(DEFAULT_APPLIANCES)
    .filter(key => !state.appliances.some(a => a.id === key))
    .map(key => ({ key, ...DEFAULT_APPLIANCES[key] }));

  // ─── Dropdown options ─────────────────────────────────────────────────
  const homeTypeOptions: DropdownOption[] = [
    { value: 'apartment', label: 'Apartment / Flat',   description: 'Flat in a multi-storey building', icon: '🏢' },
    { value: 'house',     label: 'Independent House',  description: 'Standalone or row house',          icon: '🏠' },
    { value: 'villa',     label: 'Luxury Villa',       description: 'Large independent bungalow',       icon: '🏡' },
  ];

  const householdTypeOptions: DropdownOption[] = [
    { value: 'bachelor',     label: 'Single Person',              description: '1 person',        icon: '👤' },
    { value: 'family',       label: 'Small Family',               description: '2–4 persons',     icon: '👨‍👩‍👧' },
    { value: 'large_family', label: 'Large Family',               description: '5+ persons',      icon: '👨‍👩‍👧‍👦' },
    { value: 'organization', label: 'Office / Institution',       description: 'Commercial use',  icon: '🏢' },
  ];

  const locationOptions: DropdownOption[] = [
    { value: 'Chennai',   label: 'Chennai',   description: 'Tamil Nadu (Tariff: ₹8.0/kWh)',   icon: '🏖️' },
    { value: 'Mumbai',    label: 'Mumbai',    description: 'Maharashtra (Tariff: ₹9.5/kWh)',  icon: '🌆' },
    { value: 'Delhi',     label: 'Delhi',     description: 'National Capital (Tariff: ₹7.5/kWh)', icon: '🏛️' },
    { value: 'Bangalore', label: 'Bangalore', description: 'Karnataka (Tariff: ₹7.8/kWh)',     icon: '💻' },
    { value: 'Hyderabad', label: 'Hyderabad', description: 'Telangana (Tariff: ₹8.2/kWh)',     icon: '🏰' },
    { value: 'Kolkata',   label: 'Kolkata',   description: 'West Bengal (Tariff: ₹8.0/kWh)',   icon: '🛕' },
  ];

  // ─── Render ────────────────────────────────────────────────────────────
  return (
    <LazyMotion features={domAnimation}>
      {/* Full viewport, no page scroll */}
      <div className="h-screen overflow-hidden bg-background flex flex-col font-body text-on-surface">

        {/* ── Top bar: Logo + progress ── */}
        <div className="flex-shrink-0 flex flex-col items-center pt-5 pb-3 px-4">
          <Link to="/" className="inline-flex items-center gap-3 mb-4">
            <img src="/logo.gif" alt="Voltify Logo" className="size-14 object-contain drop-shadow-lg" />
            <span className="font-display text-2xl font-bold tracking-tight text-on-surface">VOLTIFY</span>
          </Link>

          {/* Step indicators */}
          <div className="flex items-center justify-between w-full max-w-xs relative mb-2">
            <div className="absolute left-0 right-0 h-px bg-outline top-1/2 -translate-y-1/2 -z-10" />
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`size-8 rounded-full border flex items-center justify-center text-xs font-semibold transition-all duration-300 relative z-10 ${
                  s === state.step
                    ? 'bg-primary text-surface border-primary shadow-[0_0_12px_rgba(0,112,243,0.4)]'
                    : s < state.step
                    ? 'bg-tertiary/10 text-tertiary border-tertiary/30'
                    : 'bg-surface border-outline text-on-surface-variant'
                }`}
              >
                {s < state.step ? <Check className="size-4 text-tertiary" /> : s}
              </div>
            ))}
          </div>
          <div className="flex justify-between w-full max-w-xs text-[10px] uppercase font-semibold text-on-surface-variant tracking-wider">
            <span>Profile</span>
            <span>Billing</span>
            <span>Appliances</span>
            <span>Review</span>
          </div>
        </div>

        {/* ── Card: fit content, scrollable if needed ── */}
        <div className="flex-1 overflow-y-auto p-4 flex justify-center items-center">
          <div className="w-full max-w-2xl bg-surface-container rounded-2xl border border-outline shadow-xl flex flex-col overflow-hidden">
            <div className="p-6 md:p-8">
              <AnimatePresence mode="wait">

                {/* ───────── STEP 1: Profile ───────── */}
                {state.step === 1 && (
                  <m.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <h3 className="font-display font-semibold text-lg text-on-surface mb-1 flex items-center gap-2">
                      <UserIcon className="size-5 text-primary" /> Step 1: Household Profile
                    </h3>
                    <p className="text-on-surface-variant text-sm mb-5">Describe your home setup to help customize your baseline estimates.</p>

                    <form onSubmit={handleProfileSubmit(onProfileNext)} className="space-y-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {/* Dwelling Type */}
                        <div>
                          <label className="block text-xs font-semibold text-on-surface mb-2">Dwelling Type</label>
                          <CustomDropdown
                            id="home_type"
                            value={watchedHomeType || ''}
                            onChange={(val) => setProfileValue('home_type', val as any, { shouldValidate: true })}
                            options={homeTypeOptions}
                            placeholder="Select dwelling type..."
                            error={profileErrors.home_type?.message}
                          />
                        </div>

                        {/* Household Size */}
                        <div>
                          <label className="block text-xs font-semibold text-on-surface mb-2">Household Size</label>
                          <CustomDropdown
                            id="household_type"
                            value={watchedHouseholdType || ''}
                            onChange={(val) => setProfileValue('household_type', val as any, { shouldValidate: true })}
                            options={householdTypeOptions}
                            placeholder="Select household size..."
                            error={profileErrors.household_type?.message}
                          />
                        </div>

                        {/* Location Dropdown Selection */}
                        <div className="md:col-span-2">
                          <label className="block text-xs font-semibold text-on-surface mb-2">Location / City</label>
                          <CustomDropdown
                            id="location"
                            value={watchedLocation || ''}
                            onChange={(val) => setProfileValue('location', val as any, { shouldValidate: true })}
                            options={locationOptions}
                            placeholder="Select your city..."
                            error={profileErrors.location?.message}
                          />
                        </div>
                      </div>

                      <div className="flex justify-end pt-2">
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="bg-primary text-surface px-6 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 hover:bg-primary/90 disabled:opacity-50 shadow-md"
                        >
                          {isSubmitting ? <><Loader2 className="size-4 animate-spin" /> Saving...</> : <>Next Step <ArrowRightIcon /></>}
                        </button>
                      </div>
                    </form>
                  </m.div>
                )}

                {/* ───────── STEP 2: Billing ───────── */}
                {state.step === 2 && (
                  <m.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <h3 className="font-display font-semibold text-lg text-on-surface mb-1 flex items-center gap-2">
                      <Upload className="size-5 text-primary" /> Step 2: Utility Bill Details
                    </h3>
                    <p className="text-on-surface-variant text-sm mb-4">Upload your bill PDF or enter billing figures manually.</p>

                    {/* Dropzone — compact */}
                    <div
                      {...getRootProps()}
                      className={`border border-dashed rounded-xl p-4 text-center cursor-pointer transition-all duration-300 mb-4 flex items-center gap-4 ${
                        isDragActive ? 'border-primary bg-primary/5' : 'border-outline bg-surface hover:border-primary/50'
                      }`}
                    >
                      <input {...getInputProps()} />
                      <Upload className="size-7 text-on-surface-variant flex-shrink-0" />
                      <div className="text-left">
                        <p className="text-sm font-semibold text-on-surface">Drag &amp; Drop electricity bill PDF</p>
                        <p className="text-xs text-on-surface-variant mt-0.5">Voltify AI decodes the details instantly</p>
                      </div>
                    </div>

                    <div className="relative flex py-2 items-center mb-2">
                      <div className="flex-grow border-t border-outline" />
                      <span className="flex-shrink mx-4 text-on-surface-variant text-xs font-semibold uppercase tracking-wider">Or enter manually</span>
                      <div className="flex-grow border-t border-outline" />
                    </div>

                    <form onSubmit={handleBillSubmit(onBillNext)} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="bill_amount" className="block text-xs font-semibold text-on-surface mb-2">Bill Amount (₹)</label>
                          <input
                            {...regBill('bill_amount', { valueAsNumber: true })}
                            id="bill_amount" type="number" placeholder="e.g. 3500"
                            className="w-full px-4 py-2.5 bg-surface border border-outline rounded-lg text-on-surface text-sm focus:outline-none focus:border-primary transition-colors"
                          />
                          {billErrors.bill_amount && <p className="text-error text-xs mt-1">{billErrors.bill_amount.message}</p>}
                        </div>
                        <div>
                          <label htmlFor="units" className="block text-xs font-semibold text-on-surface mb-2">Units Consumed (kWh)</label>
                          <input
                            {...regBill('units', { valueAsNumber: true })}
                            id="units" type="number" placeholder="e.g. 420"
                            className="w-full px-4 py-2.5 bg-surface border border-outline rounded-lg text-on-surface text-sm focus:outline-none focus:border-primary transition-colors"
                          />
                          {billErrors.units && <p className="text-error text-xs mt-1">{billErrors.units.message}</p>}
                        </div>
                      </div>

                      {/* Past bills — collapsible-style */}
                      <div className="border border-outline/40 rounded-xl overflow-hidden">
                        <div className="bg-surface/30 px-4 py-3 flex items-center gap-2 border-b border-outline/30">
                          <Sparkles className="size-4 text-primary flex-shrink-0" />
                          <div>
                            <p className="text-xs font-semibold text-on-surface">Optional: Past Months' Bills</p>
                            <p className="text-[11px] text-on-surface-variant">Helps AI build a more accurate seasonal baseline</p>
                          </div>
                        </div>
                        <div className="p-4 space-y-3">
                          <div className="grid grid-cols-3 gap-3">
                            <div>
                              <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">Month</label>
                              <MonthDropdown value={historyMonth} onChange={setHistoryMonth} months={getPastMonths()} />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">Amount (₹)</label>
                              <input
                                type="number" placeholder="e.g. 2800" value={historyAmount}
                                onChange={(e) => setHistoryAmount(e.target.value)}
                                className="w-full px-3 py-2 bg-surface border border-outline rounded-lg text-on-surface text-xs focus:outline-none focus:border-primary transition-colors"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">Units (kWh)</label>
                              <input
                                type="number" placeholder="e.g. 350" value={historyUnits}
                                onChange={(e) => setHistoryUnits(e.target.value)}
                                className="w-full px-3 py-2 bg-surface border border-outline rounded-lg text-on-surface text-xs focus:outline-none focus:border-primary transition-colors"
                              />
                            </div>
                          </div>
                          <div className="flex justify-end">
                            <button
                              type="button" onClick={handleAddHistoryBill}
                              className="px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all"
                            >
                              <Plus className="size-3.5" /> Add Record
                            </button>
                          </div>

                          {prevBills.length > 0 && (
                            <div className="space-y-1.5 max-h-28 overflow-y-auto">
                              {prevBills.map((b, idx) => (
                                <div key={idx} className="flex items-center justify-between p-2.5 bg-surface/50 border border-outline/30 rounded-lg text-xs">
                                  <div className="flex items-center gap-3 min-w-0">
                                    <span className="font-semibold text-on-surface truncate">{b.monthLabel}</span>
                                    <span className="text-on-surface-variant hidden sm:block">₹{b.bill_amount}</span>
                                    <span className="text-on-surface-variant hidden sm:block">{b.units} kWh</span>
                                  </div>
                                  <button type="button" onClick={() => handleRemoveHistoryBill(idx)} className="text-error/70 hover:text-error p-1 flex-shrink-0">
                                    <Trash2 className="size-3.5" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex justify-between pt-1">
                        <button
                          type="button" onClick={() => dispatch({ type: 'SET_STEP', payload: 1 })}
                          className="border border-outline text-on-surface-variant px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-surface transition-all"
                        >
                          Back
                        </button>
                        <button
                          type="submit" disabled={isSubmitting}
                          className="bg-primary text-surface px-6 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 hover:bg-primary/90 disabled:opacity-50 shadow-md"
                        >
                          {isSubmitting ? <><Loader2 className="size-4 animate-spin" /> Saving...</> : <>Next Step <ArrowRightIcon /></>}
                        </button>
                      </div>
                    </form>
                  </m.div>
                )}

                {/* ───────── STEP 3: Appliances ───────── */}
                {state.step === 3 && (
                  <m.div
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex flex-col h-full"
                  >
                    <h3 className="font-display font-semibold text-lg text-on-surface mb-1 flex items-center gap-2">
                      <Settings className="size-5 text-primary" /> Step 3: Appliance Calibration
                    </h3>
                    <p className="text-on-surface-variant text-sm mb-4">Adjust your household appliances and their energy characteristics.</p>

                    {/* Appliances list – scrollable */}
                    <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1 mb-4">
                      {state.appliances.map((app) => (
                        <div key={app.id} className="p-4 rounded-xl border bg-surface/50 border-outline hover:border-primary/30 transition-all duration-300 flex flex-col gap-3 shadow-sm">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="text-xl">{app.icon}</span>
                              {app.isCustom ? (
                                <input
                                  type="text" value={app.name}
                                  onChange={(e) => dispatch({ type: 'UPDATE_APPLIANCE', payload: { id: app.id, fields: { name: e.target.value } } })}
                                  placeholder="Appliance Name"
                                  className="bg-surface border border-outline rounded px-2.5 py-1 text-sm font-semibold text-on-surface focus:outline-none focus:border-primary"
                                />
                              ) : (
                                <span className="text-sm font-semibold text-on-surface">{app.name}</span>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => dispatch({ type: 'REMOVE_APPLIANCE', payload: app.id })}
                              className="text-error/60 hover:text-error hover:bg-error/10 p-1.5 rounded-lg transition-all"
                            >
                              <Trash2 className="size-4" />
                            </button>
                          </div>

                          <div className="grid grid-cols-3 gap-3 border-t border-outline/30 pt-3">
                            {/* Power Rating */}
                            <div>
                              <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">Power (kW)</label>
                              <div className="relative">
                                <input
                                  type="number" step="0.05" min="0.01" max="20.0"
                                  value={app.power_kw}
                                  onChange={(e) => dispatch({ type: 'UPDATE_APPLIANCE', payload: { id: app.id, fields: { power_kw: parseFloat(e.target.value) || 0 } } })}
                                  className="w-full px-3 py-1.5 pr-8 bg-surface border border-outline rounded-lg text-xs font-semibold text-on-surface focus:outline-none focus:border-primary"
                                />
                                <span className="absolute inset-y-0 right-2.5 flex items-center text-[10px] font-bold text-on-surface-variant pointer-events-none">kW</span>
                              </div>
                            </div>

                            {/* Hours/day */}
                            <div>
                              <label className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">
                                <span>Hrs / Day</span>
                                <span className="text-primary">{app.avg_hours_day}h</span>
                              </label>
                              <input
                                type="range" min="0.1" max="24" step="0.5"
                                value={app.avg_hours_day}
                                onChange={(e) => dispatch({ type: 'UPDATE_APPLIANCE', payload: { id: app.id, fields: { avg_hours_day: parseFloat(e.target.value) || 1 } } })}
                                className="w-full accent-primary h-1 bg-white/10 rounded-full outline-none cursor-pointer mt-2.5"
                              />
                            </div>

                            {/* Seasonality */}
                            <div>
                              <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">Season</label>
                              <div className="grid grid-cols-3 bg-surface border border-outline rounded-lg p-0.5 text-center text-[9px] font-semibold text-on-surface-variant">
                                {(['whole_year', 'summer', 'winter'] as const).map((season) => {
                                  const active = app.seasonality === season;
                                  const label  = season === 'whole_year' ? 'All' : season === 'summer' ? 'Sum' : 'Win';
                                  return (
                                    <button
                                      key={season} type="button"
                                      onClick={() => dispatch({ type: 'UPDATE_APPLIANCE', payload: { id: app.id, fields: { seasonality: season } } })}
                                      className={`py-1 rounded-md transition-all ${active ? 'bg-primary text-surface font-bold' : 'hover:text-on-surface'}`}
                                    >
                                      {label}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Add appliance buttons */}
                    <div ref={addBtnRef} className="relative flex gap-3 mb-4">
                      <button
                        type="button"
                        onClick={() => setIsAddDropdownOpen(!isAddDropdownOpen)}
                        className="px-4 py-2 bg-primary text-surface font-semibold text-xs rounded-lg flex items-center gap-1.5 transition-all shadow-md hover:bg-primary/90"
                      >
                        <Plus className="size-4 stroke-[3]" /> Add Appliance <ChevronDown className={`size-3.5 transition-transform ${isAddDropdownOpen ? 'rotate-180' : ''}`} />
                      </button>
                      <button
                        type="button" onClick={handleAddCustomAppliance}
                        className="px-4 py-2 bg-surface border border-outline hover:border-primary/30 text-on-surface font-semibold text-xs rounded-lg flex items-center gap-1.5 transition-all"
                      >
                        <Plus className="size-4" /> Custom
                      </button>

                      {isAddDropdownOpen && (
                        <div className="absolute top-full left-0 mt-1 w-60 rounded-xl bg-surface-container border border-outline shadow-2xl z-50 overflow-hidden">
                          <div className="px-3 py-2 text-[9px] font-bold uppercase tracking-wider text-on-surface-variant border-b border-outline/35">
                            Standard appliances
                          </div>
                          <div className="py-1 max-h-48 overflow-y-auto">
                            {remainingDefaults.length === 0 ? (
                              <div className="px-4 py-3 text-xs text-on-surface-variant italic">All appliances added!</div>
                            ) : (
                              remainingDefaults.map((defApp) => (
                                <button
                                  key={defApp.key} type="button"
                                  onClick={() => handleAddDefaultAppliance(defApp)}
                                  className="w-full text-left px-4 py-2.5 text-xs text-on-surface hover:bg-primary/10 transition-colors flex items-center gap-2.5"
                                >
                                  <span className="text-base">{defApp.icon}</span>
                                  <span className="font-medium flex-1">{defApp.name}</span>
                                  <span className="text-[10px] text-on-surface-variant font-bold">{defApp.power_kw}kW</span>
                                </button>
                              ))
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between pt-3 border-t border-outline/30">
                      <button
                        type="button" onClick={() => dispatch({ type: 'SET_STEP', payload: 2 })}
                        className="border border-outline text-on-surface-variant px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-surface transition-all"
                      >
                        Back
                      </button>
                      <button
                        type="button" onClick={onAppliancesNext}
                        className="bg-primary text-surface px-6 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 hover:bg-primary/90 shadow-md"
                      >
                        Next Step <ArrowRightIcon />
                      </button>
                    </div>
                  </m.div>
                )}

                {/* ───────── STEP 4: Review ───────── */}
                {state.step === 4 && currentCalc && state.billData && state.profileData && (
                  <m.div
                    key="step4"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-5"
                  >
                    <div className="text-center">
                      <div className="size-14 bg-tertiary/10 rounded-full border border-tertiary/30 flex items-center justify-center mx-auto mb-3">
                        <ShieldCheck className="size-7 text-tertiary animate-pulse" />
                      </div>
                      <h3 className="font-display font-semibold text-lg text-on-surface">Calibration Complete</h3>
                      <p className="text-on-surface-variant text-sm mt-1">Our estimates match your utility bill details.</p>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-surface border border-outline p-4 rounded-xl text-center">
                        <span className="text-[11px] font-semibold text-on-surface-variant block mb-1">Utility Load</span>
                        <span className="font-semibold text-base text-on-surface">{formatUnits(state.billData.units)}</span>
                        <span className="block text-[11px] text-on-surface-variant mt-0.5">{formatCurrency(state.billData.bill_amount)}</span>
                      </div>
                      <div className="bg-surface border border-outline p-4 rounded-xl text-center">
                        <span className="text-[11px] font-semibold text-on-surface-variant block mb-1">Est. Baseline</span>
                        <span className="font-semibold text-base text-primary">{formatUnits(currentCalc.estKwh)}</span>
                        <span className="block text-[11px] text-on-surface-variant mt-0.5">{formatCurrency(Math.round(currentCalc.estKwh * currentCalc.rate))}</span>
                      </div>
                      <div className="bg-surface border border-outline p-4 rounded-xl text-center">
                        <span className="text-[11px] font-semibold text-on-surface-variant block mb-1">Accuracy</span>
                        <span className={`font-semibold text-base ${currentCalc.accuracy >= 80 ? 'text-tertiary' : 'text-error'}`}>
                          {currentCalc.accuracy}%
                        </span>
                        <span className="block text-[11px] text-on-surface-variant mt-0.5">Ready</span>
                      </div>
                    </div>

                    {/* Appliance breakdown */}
                    <div className="bg-surface border border-outline p-4 rounded-xl space-y-2.5">
                      <h4 className="font-semibold text-xs text-on-surface mb-2 flex items-center gap-1.5">
                        <Zap className="size-3.5 text-primary" /> Estimated Appliance Share
                      </h4>
                      {currentCalc.appliances.slice(0, 5).map((app) => {
                        const sharePct = Math.round(((app.power_kw * app.avg_hours_day * 30) / (currentCalc.estKwh || 1)) * 100);
                        return (
                          <div key={app.id} className="flex justify-between items-center text-sm border-b border-outline/20 pb-2 last:border-b-0 last:pb-0">
                            <span className="text-on-surface-variant flex items-center gap-2 text-xs">
                              <span>{app.icon}</span> {app.name}
                            </span>
                            <div className="flex items-center gap-3">
                              <span className="text-on-surface-variant text-[11px]">{app.avg_hours_day}h/day</span>
                              <span className="font-semibold text-on-surface text-xs">{sharePct}%</span>
                            </div>
                          </div>
                        );
                      })}
                      {currentCalc.appliances.length > 5 && (
                        <p className="text-center text-xs text-on-surface-variant italic pt-1">
                          + {currentCalc.appliances.length - 5} more calibrated
                        </p>
                      )}
                    </div>

                    <div className="flex justify-between pt-2">
                      <button
                        type="button" disabled={isSubmitting}
                        onClick={() => dispatch({ type: 'SET_STEP', payload: 3 })}
                        className="border border-outline text-on-surface-variant px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-surface transition-all disabled:opacity-50"
                      >
                        Back
                      </button>
                      <button
                        type="button" onClick={finishOnboarding} disabled={isSubmitting}
                        className="bg-primary hover:bg-primary/90 text-surface px-6 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 shadow-md disabled:opacity-50"
                      >
                        {isSubmitting
                          ? <><Loader2 className="size-4 animate-spin" /> Completing...</>
                          : <><Play className="size-4 fill-current" /> Complete Onboarding</>
                        }
                      </button>
                    </div>
                  </m.div>
                )}

              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </LazyMotion>
  );
}

function ArrowRightIcon() {
  return (
    <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
    </svg>
  );
}
