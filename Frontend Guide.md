# ⚡ VOLTIFY — Complete Build Guide
## From Zero to Production-Ready MVP (Tier 3 Focus)

> **Stack:** React 18 + TypeScript + Tailwind CSS (Frontend) | Node.js + Express + PostgreSQL (Backend)
> **Design:** Cyberpunk dark — `#050816` bg, `#22d3ee` cyan neon, glassmorphism cards
> **Timeline:** 14 days | **Target:** Tier 3 users (basic meter, bill upload)

---

# PHASE 0: PROJECT SETUP (Day 0 — 2 hours)

## 0.1 Initialize Frontend

```bash
# Create Vite + React + TypeScript project
npm create vite@latest voltify-frontend -- --template react-ts
cd voltify-frontend

# Install all dependencies
npm install \
  react-router-dom@6 \
  axios \
  zustand \
  recharts \
  react-dropzone \
  react-toastify \
  framer-motion \
  lucide-react \
  react-hook-form \
  @hookform/resolvers \
  zod \
  date-fns \
  clsx \
  tailwind-merge

npm install -D \
  tailwindcss \
  postcss \
  autoprefixer \
  @types/node

npx tailwindcss init -p
```

## 0.2 Tailwind Config

```js
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        volt: {
          bg:       '#050816',
          card:     '#0f172a',
          border:   '#1e293b',
          cyan:     '#22d3ee',
          pink:     '#ec4899',
          green:    '#10b981',
          amber:    '#f59e0b',
          red:      '#ef4444',
          purple:   '#8b5cf6',
          textPri:  '#f1f5f9',
          textSec:  '#94a3b8',
          textMute: '#475569',
        },
      },
      fontFamily: {
        display: ['"Orbitron"', 'sans-serif'],
        body:    ['"Rajdhani"', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        cyan:   '0 0 20px rgba(34,211,238,0.3)',
        pink:   '0 0 20px rgba(236,72,153,0.3)',
        green:  '0 0 20px rgba(16,185,129,0.3)',
        card:   '0 4px 24px rgba(0,0,0,0.4)',
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'pulse-cyan':  'pulse-cyan 2s cubic-bezier(0.4,0,0.6,1) infinite',
        'float':       'float 3s ease-in-out infinite',
        'slide-up':    'slide-up 0.3s ease-out',
        'coin-burst':  'coin-burst 0.6s ease-out forwards',
      },
      keyframes: {
        'pulse-cyan': {
          '0%,100%': { boxShadow: '0 0 10px rgba(34,211,238,0.2)' },
          '50%':     { boxShadow: '0 0 30px rgba(34,211,238,0.6)' },
        },
        'float': {
          '0%,100%': { transform: 'translateY(0px)' },
          '50%':     { transform: 'translateY(-8px)' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'coin-burst': {
          '0%':   { transform: 'scale(0) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'scale(1.5) rotate(360deg)', opacity: '0' },
        },
      },
    },
  },
  plugins: [],
}
```

## 0.3 Global CSS

```css
/* src/index.css */
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;900&family=Rajdhani:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  * { box-sizing: border-box; }
  
  html { scroll-behavior: smooth; }
  
  body {
    background-color: #050816;
    color: #f1f5f9;
    font-family: 'Rajdhani', sans-serif;
    font-size: 16px;
    -webkit-font-smoothing: antialiased;
    min-height: 100vh;
    overflow-x: hidden;
  }

  /* Scrollbar styling */
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: #0f172a; }
  ::-webkit-scrollbar-thumb { background: #22d3ee40; border-radius: 3px; }
  ::-webkit-scrollbar-thumb:hover { background: #22d3ee80; }
}

@layer utilities {
  /* Glass card effect */
  .glass {
    background: rgba(15, 23, 42, 0.7);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(34, 211, 238, 0.12);
  }
  
  .glass-hover {
    transition: all 0.2s ease;
  }
  .glass-hover:hover {
    border-color: rgba(34, 211, 238, 0.3);
    box-shadow: 0 0 20px rgba(34, 211, 238, 0.1);
  }
  
  /* Neon text */
  .text-neon-cyan {
    color: #22d3ee;
    text-shadow: 0 0 10px rgba(34, 211, 238, 0.5);
  }
  .text-neon-pink {
    color: #ec4899;
    text-shadow: 0 0 10px rgba(236, 72, 153, 0.5);
  }
  
  /* Gradient text */
  .gradient-text {
    background: linear-gradient(135deg, #22d3ee, #8b5cf6);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  
  /* Grid background pattern */
  .grid-bg {
    background-image: 
      linear-gradient(rgba(34,211,238,0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(34,211,238,0.03) 1px, transparent 1px);
    background-size: 40px 40px;
  }
  
  /* Estimated data label */
  .estimated-label {
    font-size: 0.65rem;
    color: #f59e0b;
    letter-spacing: 0.05em;
  }
}

/* Recharts custom */
.recharts-cartesian-grid-horizontal line,
.recharts-cartesian-grid-vertical line {
  stroke: rgba(34, 211, 238, 0.08) !important;
}
.recharts-tooltip-wrapper { outline: none !important; }
```

## 0.4 Project Structure

```
voltify-frontend/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Topbar.tsx
│   │   │   └── AppLayout.tsx
│   │   ├── ui/
│   │   │   ├── GlassCard.tsx
│   │   │   ├── NeonBadge.tsx
│   │   │   ├── StatsCard.tsx
│   │   │   ├── ProgressBar.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Toast.tsx
│   │   │   ├── LoadingSpinner.tsx
│   │   │   ├── EstimatedLabel.tsx
│   │   │   └── LockedFeature.tsx
│   │   ├── charts/
│   │   │   ├── UsageLineChart.tsx
│   │   │   ├── UsageBarChart.tsx
│   │   │   ├── AppliancePieChart.tsx
│   │   │   ├── MonthlyTrendChart.tsx
│   │   │   └── ActualVsPredicted.tsx
│   │   ├── gamification/
│   │   │   ├── CoinBalance.tsx
│   │   │   ├── StreakTracker.tsx
│   │   │   ├── ChallengeCard.tsx
│   │   │   ├── LeaderboardTable.tsx
│   │   │   └── CoinShop.tsx
│   │   └── onboarding/
│   │       ├── ApplianceCard.tsx
│   │       ├── BillUpload.tsx
│   │       └── CSSSlider.tsx
│   ├── pages/
│   │   ├── Landing.tsx
│   │   ├── auth/
│   │   │   ├── Login.tsx
│   │   │   └── Signup.tsx
│   │   ├── onboarding/
│   │   │   ├── index.tsx
│   │   │   ├── Step1Profile.tsx
│   │   │   ├── Step2Bill.tsx
│   │   │   ├── Step3Appliances.tsx
│   │   │   └── StepReview.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Coach.tsx
│   │   ├── Leaderboard.tsx
│   │   ├── Notifications.tsx
│   │   ├── Profile.tsx
│   │   └── Settings.tsx
│   ├── store/
│   │   ├── authStore.ts
│   │   ├── userStore.ts
│   │   ├── dashboardStore.ts
│   │   └── gamificationStore.ts
│   ├── services/
│   │   ├── api.ts
│   │   ├── auth.service.ts
│   │   ├── dashboard.service.ts
│   │   └── coach.service.ts
│   ├── lib/
│   │   ├── estimation.ts
│   │   ├── mockData.ts
│   │   └── utils.ts
│   ├── types/
│   │   ├── user.ts
│   │   ├── appliance.ts
│   │   └── dashboard.ts
│   ├── App.tsx
│   └── main.tsx
```

## 0.5 Types — Define Everything First

```typescript
// src/types/user.ts
export interface User {
  id: string;
  name: string;
  email: string;
  tier: 1 | 2 | 3;
  household_type: 'bachelor' | 'family' | 'large_family' | 'organization';
  location: string;
  home_type: 'apartment' | 'house' | 'villa';
  appliance_count: number;
  coins: number;
  streak_days: number;
  created_at: string;
}

// src/types/appliance.ts
export interface Appliance {
  id: string;
  name: string;
  icon: string;
  power_kw: number;
  avg_hours_day: number;
  seasonality?: 'whole_year' | 'summer' | 'winter';
  type?: string; // for geyser: electric/solar/instant
  monthly_kwh?: number;
  monthly_cost?: number;
  percentage?: number;
}

export const DEFAULT_APPLIANCES: Record<string, Omit<Appliance, 'id'>> = {
  AC:               { name: 'Air Conditioner', icon: '❄️', power_kw: 1.5, avg_hours_day: 8,    seasonality: 'summer' },
  Fridge:           { name: 'Refrigerator',    icon: '🧊', power_kw: 0.4, avg_hours_day: 24 },
  Geyser:           { name: 'Geyser',          icon: '🚿', power_kw: 3.0, avg_hours_day: 1.5,  type: 'electric' },
  TV:               { name: 'Television',      icon: '📺', power_kw: 0.1, avg_hours_day: 4 },
  WashingMachine:   { name: 'Washing Machine', icon: '🫧', power_kw: 2.0, avg_hours_day: 0.5 },
  Microwave:        { name: 'Microwave',       icon: '📡', power_kw: 1.2, avg_hours_day: 0.3 },
  Lights:           { name: 'Lights',          icon: '💡', power_kw: 0.3, avg_hours_day: 5 },
  Fans:             { name: 'Fans',            icon: '🌀', power_kw: 0.075, avg_hours_day: 8 },
  Laptop:           { name: 'Laptop',          icon: '💻', power_kw: 0.065, avg_hours_day: 6 },
};

// src/types/dashboard.ts
export interface DailyUsage {
  date: string;
  units: number;
  cost: number;
  label: string;
}

export interface ApplianceBreakdown {
  name: string;
  icon: string;
  units: number;
  percentage: number;
  cost: number;
  color: string;
}

export interface Insight {
  id: string;
  type: 'warning' | 'success' | 'tip' | 'info';
  title: string;
  message: string;
  action?: string;
}

export interface Prediction {
  tomorrow: { units: number; cost: number; confidence: number };
  next_week: { units: number; cost: number; confidence: number };
  next_month: { units: number; cost: number; confidence: number };
  bill_shock_risk: boolean;
  projected_bill: number;
}

export interface Challenge {
  id: string;
  title: string;
  target_units: number;
  current_units: number;
  days_remaining: number;
  difficulty: 'easy' | 'medium' | 'hard';
  coins_reward: number;
  status: 'active' | 'completed' | 'failed';
  week_start: string;
  week_end: string;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  coins: number;
  streak: number;
  savings_pct: number;
  rank_change: number;
  is_current_user?: boolean;
}
```

---

# PHASE 1: CORE UI COMPONENTS (Day 1)

## 1.1 GlassCard — Base Card Component

```typescript
// src/components/ui/GlassCard.tsx
import { ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glow?: 'cyan' | 'pink' | 'green' | 'none';
  onClick?: () => void;
}

export function GlassCard({ children, className, hover = false, glow = 'none', onClick }: GlassCardProps) {
  const glowClass = {
    cyan:  'hover:shadow-cyan hover:border-volt-cyan/30',
    pink:  'hover:shadow-pink hover:border-volt-pink/30',
    green: 'hover:shadow-green hover:border-volt-green/30',
    none:  '',
  }[glow];

  return (
    <div
      onClick={onClick}
      className={cn(
        'glass rounded-xl p-5',
        hover && `glass-hover cursor-pointer transition-all duration-200 ${glowClass}`,
        onClick && 'cursor-pointer',
        className
      )}
    >
      {children}
    </div>
  );
}
```

## 1.2 Utils

```typescript
// src/lib/utils.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}

export function formatUnits(units: number): string {
  return `${units.toFixed(1)} kWh`;
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
}

export function getDayLabel(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-IN', { weekday: 'short' });
}

export function getTariffRate(location: string): number {
  // TANGEDCO (Tamil Nadu) average rate
  const rates: Record<string, number> = {
    Chennai: 8.0, Mumbai: 9.5, Delhi: 7.5, Bangalore: 7.8,
    Hyderabad: 7.2, default: 8.0,
  };
  return rates[location] || rates.default;
}

export function getSeasonMultiplier(month: number, appliance: string): number {
  if (appliance === 'AC') {
    if ([4, 5, 6].includes(month)) return 1.3;    // Summer
    if ([12, 1, 2].includes(month)) return 0.7;   // Winter
    return 1.0;
  }
  return 1.0;
}
```

## 1.3 Estimation Engine — The Brain

```typescript
// src/lib/estimation.ts
import { Appliance } from '../types/appliance';
import { DailyUsage, ApplianceBreakdown } from '../types/dashboard';
import { getTariffRate, getSeasonMultiplier } from './utils';

const TARIFF_RATE = 8.0; // ₹/kWh default

export function estimateMonthlyKwh(appliances: Appliance[]): number {
  const currentMonth = new Date().getMonth() + 1;
  return appliances.reduce((total, appliance) => {
    const seasonal = getSeasonMultiplier(currentMonth, appliance.name.includes('AC') ? 'AC' : '');
    const daily = appliance.power_kw * appliance.avg_hours_day;
    const monthly = daily * 30 * seasonal;
    return total + monthly;
  }, 0);
}

export function estimateApplianceBreakdown(
  appliances: Appliance[],
  totalBillAmount: number,
  totalUnits: number,
  tariffRate: number = TARIFF_RATE
): ApplianceBreakdown[] {
  const currentMonth = new Date().getMonth() + 1;
  const NEON_COLORS = ['#22d3ee', '#ec4899', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#a78bfa'];

  const rawEstimates = appliances.map((appliance, idx) => {
    const seasonal = getSeasonMultiplier(currentMonth, appliance.name.includes('AC') ? 'AC' : '');
    const monthly_kwh = appliance.power_kw * appliance.avg_hours_day * 30 * seasonal;
    return { ...appliance, monthly_kwh, color: NEON_COLORS[idx % NEON_COLORS.length] };
  });

  const totalEstimated = rawEstimates.reduce((s, a) => s + a.monthly_kwh, 0);
  const scaleFactor = totalEstimated > 0 ? totalUnits / totalEstimated : 1;

  return rawEstimates.map(a => {
    const units = a.monthly_kwh * scaleFactor;
    const percentage = (units / totalUnits) * 100;
    const cost = (percentage / 100) * totalBillAmount;
    return {
      name: a.name,
      icon: a.icon || '⚡',
      units: parseFloat(units.toFixed(1)),
      percentage: parseFloat(percentage.toFixed(1)),
      cost: parseFloat(cost.toFixed(0)),
      color: a.color,
    };
  });
}

export function generateDailyUsage(
  appliances: Appliance[],
  daysBack: number = 30,
  location: string = 'Chennai'
): DailyUsage[] {
  const tariff = getTariffRate(location);
  const baseDaily = estimateMonthlyKwh(appliances) / 30;
  const result: DailyUsage[] = [];

  for (let i = daysBack - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    // Weekend uses ~15% more, add ±10% noise
    const multiplier = (isWeekend ? 1.15 : 1.0) * (0.9 + Math.random() * 0.2);
    const units = parseFloat((baseDaily * multiplier).toFixed(2));
    const cost = parseFloat((units * tariff).toFixed(0));
    const label = date.toLocaleDateString('en-IN', { weekday: 'short' });

    result.push({
      date: date.toISOString().split('T')[0],
      units,
      cost,
      label,
    });
  }
  return result;
}

export function calculatePredictions(dailyHistory: DailyUsage[], tariffRate: number = TARIFF_RATE) {
  const last7 = dailyHistory.slice(-7);
  const avg7 = last7.reduce((s, d) => s + d.units, 0) / 7;
  const last3 = dailyHistory.slice(-3);
  const avg3 = last3.reduce((s, d) => s + d.units, 0) / 3;

  // Check for bill shock (increasing trend)
  const trendFactor = avg3 / avg7;
  const daysInMonth = 30;
  const daysElapsed = Math.min(new Date().getDate(), daysInMonth);
  const usedSoFar = dailyHistory.slice(-daysElapsed).reduce((s, d) => s + d.units, 0);
  const projectedMonth = (usedSoFar / daysElapsed) * daysInMonth;

  return {
    tomorrow: {
      units: parseFloat((avg7 * (0.95 + Math.random() * 0.1)).toFixed(1)),
      cost: parseFloat((avg7 * tariffRate).toFixed(0)),
      confidence: 85,
    },
    next_week: {
      units: parseFloat((avg7 * 7 * (0.95 + Math.random() * 0.1)).toFixed(0)),
      cost: parseFloat((avg7 * 7 * tariffRate).toFixed(0)),
      confidence: 75,
    },
    next_month: {
      units: parseFloat((projectedMonth * trendFactor).toFixed(0)),
      cost: parseFloat((projectedMonth * trendFactor * tariffRate).toFixed(0)),
      confidence: 65,
    },
    bill_shock_risk: trendFactor > 1.15,
    projected_bill: parseFloat((projectedMonth * tariffRate).toFixed(0)),
  };
}

export function calculateCoins(predictedUnits: number, actualUnits: number, streakDays: number, rank: number): number {
  const saved = predictedUnits - actualUnits;
  if (saved <= 0) return 0;

  let base = saved * 10;
  let multiplier = 1.0;

  if (rank <= 3)        multiplier *= 1.5;
  else if (rank <= 5)   multiplier *= 1.25;
  else if (rank <= 10)  multiplier *= 1.1;

  if (streakDays >= 90)      multiplier *= 1.6;
  else if (streakDays >= 30) multiplier *= 1.35;
  else if (streakDays >= 7)  multiplier *= 1.15;

  return Math.round(base * multiplier);
}

export function calculateEnergyScore(data: {
  savingsPct: number;
  streakDays: number;
  challengesCompleted: number;
  cssApplied: number;
  billsUploaded: number;
}): number {
  const pts =
    Math.min(data.savingsPct * 30, 30) +
    Math.min(data.streakDays * 0.67, 20) +
    Math.min(data.challengesCompleted * 5, 25) +
    Math.min(data.cssApplied * 5, 15) +
    Math.min(data.billsUploaded * 2, 10);

  return Math.round(Math.min(pts, 100));
}

export function generateRuleBasedAlerts(
  dailyHistory: DailyUsage[],
  lastMonthBill: number,
  projectedBill: number
): { type: 'warning' | 'info' | 'success'; title: string; message: string }[] {
  const alerts = [];
  const last7 = dailyHistory.slice(-7);
  const prev7 = dailyHistory.slice(-14, -7);
  
  if (last7.length && prev7.length) {
    const avgLast7 = last7.reduce((s, d) => s + d.units, 0) / 7;
    const avgPrev7 = prev7.reduce((s, d) => s + d.units, 0) / 7;
    const changePct = ((avgLast7 - avgPrev7) / avgPrev7) * 100;

    if (changePct > 20) {
      alerts.push({
        type: 'warning' as const,
        title: `Usage ↑${changePct.toFixed(0)}% vs Last Week`,
        message: `Avg ${avgLast7.toFixed(1)} units/day this week vs ${avgPrev7.toFixed(1)} last week. Likely cause: Higher AC usage.`,
      });
    } else if (changePct < -10) {
      alerts.push({
        type: 'success' as const,
        title: `Usage ↓${Math.abs(changePct).toFixed(0)}% vs Last Week`,
        message: `Great job! You used ${avgPrev7.toFixed(1)} units/day last week vs ${avgLast7.toFixed(1)} this week.`,
      });
    }
  }

  if (projectedBill > lastMonthBill * 1.15) {
    alerts.push({
      type: 'warning' as const,
      title: 'Bill Shock Risk',
      message: `Projected bill ₹${projectedBill.toLocaleString()} vs last month ₹${lastMonthBill.toLocaleString()}. +${(((projectedBill - lastMonthBill) / lastMonthBill) * 100).toFixed(0)}% increase.`,
    });
  }

  return alerts;
}
```

## 1.4 Mock Data for Leaderboard + Demo

```typescript
// src/lib/mockData.ts
import { LeaderboardEntry } from '../types/dashboard';

const TAMIL_NAMES = [
  'Rahul Kumar', 'Priya M', 'Arun S', 'Deepa R', 'Kiran T',
  'Kavitha N', 'Surya P', 'Meena V', 'Vijay K', 'Anitha S',
  'Rajan M', 'Shanthi T', 'Bala K', 'Revathi J', 'Manoj P',
  'Sundari C', 'Ganesh R', 'Padma N', 'Venkat S', 'Lakshmi T',
];

export function generateLeaderboard(
  householdType: string,
  currentUser: { name: string; coins: number; streak: number; rank: number }
): LeaderboardEntry[] {
  const entries: LeaderboardEntry[] = TAMIL_NAMES.slice(0, 19).map((name, idx) => ({
    rank: idx + 1,
    name,
    coins: Math.round(1800 - idx * 65 + Math.random() * 50),
    streak: Math.max(1, Math.round(50 - idx * 2 + Math.random() * 5)),
    savings_pct: Math.max(2, Math.round(20 - idx * 0.7 + Math.random() * 3)),
    rank_change: Math.round((Math.random() - 0.5) * 10),
    is_current_user: false,
  }));

  // Insert current user at their rank
  const userEntry: LeaderboardEntry = {
    rank: currentUser.rank,
    name: currentUser.name + ' (You)',
    coins: currentUser.coins,
    streak: currentUser.streak,
    savings_pct: 8,
    rank_change: 12,
    is_current_user: true,
  };

  entries.splice(currentUser.rank - 1, 0, userEntry);
  return entries.slice(0, 20).map((e, i) => ({ ...e, rank: i + 1 }));
}

export const MOCK_NOTIFICATIONS = [
  {
    id: '1', type: 'bill_alert', read: false,
    title: '⚠️ Bill Alert',
    message: 'Your usage is trending ₹500 above last month',
    created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
    action_url: '/dashboard',
  },
  {
    id: '2', type: 'leaderboard', read: false,
    title: '🏆 Leaderboard Update',
    message: 'You moved up 12 spots — now ranked #47!',
    created_at: new Date(Date.now() - 24 * 3600000).toISOString(),
    action_url: '/leaderboard',
  },
  {
    id: '3', type: 'streak', read: true,
    title: '🔥 Streak Milestone',
    message: '7-day streak achieved! 1.15x multiplier now active',
    created_at: new Date(Date.now() - 2 * 24 * 3600000).toISOString(),
    action_url: '/leaderboard',
  },
  {
    id: '4', type: 'challenge', read: true,
    title: '🎯 New Challenge',
    message: 'New weekly challenge: Use under 100 units this week',
    created_at: new Date(Date.now() - 3 * 24 * 3600000).toISOString(),
    action_url: '/leaderboard',
  },
  {
    id: '5', type: 'tip', read: true,
    title: '💡 Savings Tip',
    message: 'Reducing AC by 2 hrs saves ₹540/month',
    created_at: new Date(Date.now() - 4 * 24 * 3600000).toISOString(),
    action_url: '/coach',
  },
  {
    id: '6', type: 'bill_reminder', read: true,
    title: '📊 Bill Reminder',
    message: 'Upload your latest bill to recalibrate estimates',
    created_at: new Date(Date.now() - 7 * 24 * 3600000).toISOString(),
    action_url: '/settings',
  },
  {
    id: '7', type: 'coins', read: true,
    title: '🪙 Coins Earned',
    message: 'You earned 50 coins this week for saving 5 units!',
    created_at: new Date(Date.now() - 7 * 24 * 3600000).toISOString(),
    action_url: '/leaderboard',
  },
];

export const CSS_RECOMMENDATIONS = [
  {
    id: 'ac_temp',
    appliance: 'Air Conditioner',
    icon: '❄️',
    current_label: '18°C',
    recommended_label: '24°C',
    slider_min: 18,
    slider_max: 26,
    slider_default: 24,
    savings_formula: (val: number) => Math.round((val - 18) * 1.8 * 8), // % saved
    comfort_formula: (val: number) => Math.round(100 - (val - 18) * 1.5), // % comfort
    monthly_savings_formula: (pct: number) => Math.round(pct * 90),
    why_safe: 'BEE (Bureau of Energy Efficiency) recommends 24°C as optimal for Indian climates. Each degree above 18°C saves ~6% energy while maintaining healthy indoor temperatures.',
  },
  {
    id: 'fridge_temp',
    appliance: 'Refrigerator',
    icon: '🧊',
    current_label: '2°C',
    recommended_label: '4°C',
    savings_pct: 8,
    comfort_pct: 95,
    monthly_savings: 120,
    why_safe: 'Food remains safe at 4°C (WHO standard). Raising from 2°C to 4°C reduces compressor load by ~8% with no impact on food safety.',
  },
  {
    id: 'geyser_timing',
    appliance: 'Geyser',
    icon: '🚿',
    current_label: 'Any time',
    recommended_label: '6–9 AM off-peak',
    savings_pct: 15,
    comfort_pct: 100,
    monthly_savings: 45,
    why_safe: 'Shifting geyser usage to 6-9 AM avoids peak tariff hours in most DISCOMs. Water stays hot in the tank for 2+ hours. Zero comfort impact.',
  },
  {
    id: 'tv_standby',
    appliance: 'Television',
    icon: '📺',
    current_label: 'Standby on',
    recommended_label: 'Standby off',
    savings_pct: 5,
    comfort_pct: 100,
    monthly_savings: 30,
    why_safe: 'Standby mode uses 5-10W continuously. Turning off at the plug instead of remote saves ₹30/month with zero comfort loss.',
  },
  {
    id: 'fan_speed',
    appliance: 'Fan',
    icon: '🌀',
    current_label: 'Speed 5',
    recommended_label: 'Speed 4',
    savings_pct: 20,
    comfort_pct: 90,
    monthly_savings: 25,
    why_safe: 'Reducing fan speed from 5 to 4 uses ~20% less energy. Most people cannot notice the difference in airflow at these levels.',
  },
];
```

---

# PHASE 2: ZUSTAND STORES (Day 1)

## 2.1 Auth Store

```typescript
// src/store/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types/user';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      setAuth: (user, token) =>
        set({ user, token, isAuthenticated: true }),

      logout: () =>
        set({ user: null, token: null, isAuthenticated: false }),

      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),
    }),
    { name: 'voltify-auth' }
  )
);
```

## 2.2 Dashboard Store

```typescript
// src/store/dashboardStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Appliance } from '../types/appliance';
import { DailyUsage, ApplianceBreakdown, Insight } from '../types/dashboard';

interface OnboardingData {
  household_type: string;
  location: string;
  home_type: string;
  bill_amount: number;
  units_per_month: number;
  appliances: Appliance[];
  estimated_units: number;
  accuracy_pct: number;
  prev_bills: { month: string; amount: number; units: number }[];
}

interface DashboardState {
  onboarding: OnboardingData | null;
  dailyHistory: DailyUsage[];
  applianceBreakdown: ApplianceBreakdown[];
  insights: Insight[];
  isOnboarded: boolean;
  
  setOnboarding: (data: OnboardingData) => void;
  setDailyHistory: (data: DailyUsage[]) => void;
  setApplianceBreakdown: (data: ApplianceBreakdown[]) => void;
  setInsights: (data: Insight[]) => void;
}

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set) => ({
      onboarding: null,
      dailyHistory: [],
      applianceBreakdown: [],
      insights: [],
      isOnboarded: false,

      setOnboarding: (data) => set({ onboarding: data, isOnboarded: true }),
      setDailyHistory: (data) => set({ dailyHistory: data }),
      setApplianceBreakdown: (data) => set({ applianceBreakdown: data }),
      setInsights: (data) => set({ insights: data }),
    }),
    { name: 'voltify-dashboard' }
  )
);
```

## 2.3 Gamification Store

```typescript
// src/store/gamificationStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Challenge } from '../types/dashboard';

interface GamificationState {
  coins: number;
  streak_days: number;
  rank: number;
  active_challenge: Challenge | null;
  challenge_history: Challenge[];
  css_applied: string[];
  
  addCoins: (amount: number) => void;
  incrementStreak: () => void;
  setRank: (rank: number) => void;
  setChallenge: (challenge: Challenge) => void;
  completeChallenge: () => void;
  applyCss: (id: string) => void;
}

export const useGamificationStore = create<GamificationState>()(
  persist(
    (set, get) => ({
      coins: 250,
      streak_days: 7,
      rank: 47,
      active_challenge: {
        id: 'c1',
        title: 'Use under 100 units this week',
        target_units: 100,
        current_units: 67,
        days_remaining: 3,
        difficulty: 'medium',
        coins_reward: 150,
        status: 'active',
        week_start: new Date(Date.now() - 4 * 86400000).toISOString().split('T')[0],
        week_end: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
      },
      challenge_history: [
        { id: 'c-1', title: 'Use under 110 units', target_units: 110, current_units: 98,  days_remaining: 0, difficulty: 'easy',   coins_reward: 120, status: 'completed', week_start: '', week_end: '' },
        { id: 'c-2', title: 'Use under 115 units', target_units: 115, current_units: 103, days_remaining: 0, difficulty: 'easy',   coins_reward: 110, status: 'completed', week_start: '', week_end: '' },
        { id: 'c-3', title: 'Use under 105 units', target_units: 105, current_units: 120, days_remaining: 0, difficulty: 'medium', coins_reward: 0,   status: 'failed',    week_start: '', week_end: '' },
      ],
      css_applied: [],

      addCoins: (amount) => set((s) => ({ coins: s.coins + amount })),
      incrementStreak: () => set((s) => ({ streak_days: s.streak_days + 1 })),
      setRank: (rank) => set({ rank }),
      setChallenge: (challenge) => set({ active_challenge: challenge }),
      completeChallenge: () => {
        const { active_challenge, challenge_history } = get();
        if (!active_challenge) return;
        const completed = { ...active_challenge, status: 'completed' as const };
        set({
          active_challenge: null,
          challenge_history: [completed, ...challenge_history],
          coins: get().coins + active_challenge.coins_reward,
        });
      },
      applyCss: (id) => set((s) => ({ css_applied: [...s.css_applied, id] })),
    }),
    { name: 'voltify-gamification' }
  )
);
```

---

# PHASE 3: AUTH PAGES (Day 1)

## 3.1 App Router Setup

```typescript
// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuthStore } from './store/authStore';
import { useDashboardStore } from './store/dashboardStore';

import Landing from './pages/Landing';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import Onboarding from './pages/onboarding';
import Dashboard from './pages/Dashboard';
import Coach from './pages/Coach';
import Leaderboard from './pages/Leaderboard';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import AppLayout from './components/layout/AppLayout';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function OnboardedRoute({ children }: { children: React.ReactNode }) {
  const { isOnboarded } = useDashboardStore();
  return isOnboarded ? <>{children}</> : <Navigate to="/onboarding" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/"        element={<Landing />} />
        <Route path="/login"   element={<Login />} />
        <Route path="/signup"  element={<Signup />} />

        {/* Onboarding (auth required) */}
        <Route path="/onboarding" element={
          <PrivateRoute><Onboarding /></PrivateRoute>
        } />

        {/* Protected + onboarded */}
        <Route element={
          <PrivateRoute>
            <OnboardedRoute>
              <AppLayout />
            </OnboardedRoute>
          </PrivateRoute>
        }>
          <Route path="/dashboard"    element={<Dashboard />} />
          <Route path="/coach"        element={<Coach />} />
          <Route path="/leaderboard"  element={<Leaderboard />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/profile"      element={<Profile />} />
          <Route path="/settings"     element={<Settings />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        theme="dark"
        toastStyle={{ background: '#0f172a', border: '1px solid rgba(34,211,238,0.2)', color: '#f1f5f9' }}
      />
    </BrowserRouter>
  );
}
```

## 3.2 Login Page

```typescript
// src/pages/auth/Login.tsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-toastify';
import { Zap, Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const loginSchema = z.object({
  email:    z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});
type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    try {
      // For prototype — mock auth
      await new Promise(r => setTimeout(r, 800));
      const mockUser = {
        id: 'user-1',
        name: 'Ravi Kumar',
        email: data.email,
        tier: 3 as const,
        household_type: 'family' as const,
        location: 'Chennai',
        home_type: 'apartment' as const,
        appliance_count: 8,
        coins: 250,
        streak_days: 7,
        created_at: new Date().toISOString(),
      };
      setAuth(mockUser, 'mock-jwt-token');
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch {
      toast.error('Invalid credentials. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-volt-bg grid-bg flex items-center justify-center p-4">
      {/* Background glow */}
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-volt-cyan/5 rounded-full blur-3xl pointer-events-none" />
      
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-volt-cyan/20 border border-volt-cyan/30 flex items-center justify-center">
              <Zap className="w-5 h-5 text-volt-cyan" />
            </div>
            <span className="font-display text-2xl font-bold text-neon-cyan">VOLTIFY</span>
          </Link>
          <p className="text-volt-textSec mt-2 font-body">Sign in to your account</p>
        </div>

        {/* Card */}
        <div className="glass rounded-2xl p-8 animate-slide-up">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-volt-textSec mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-volt-textMute" />
                <input
                  {...register('email')}
                  type="email"
                  placeholder="ravi@example.com"
                  className="w-full pl-10 pr-4 py-3 bg-volt-bg border border-volt-border rounded-lg text-volt-textPri placeholder-volt-textMute focus:outline-none focus:border-volt-cyan focus:ring-1 focus:ring-volt-cyan/30 transition-all"
                />
              </div>
              {errors.email && <p className="text-volt-red text-xs mt-1">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-volt-textSec mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-volt-textMute" />
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-12 py-3 bg-volt-bg border border-volt-border rounded-lg text-volt-textPri placeholder-volt-textMute focus:outline-none focus:border-volt-cyan focus:ring-1 focus:ring-volt-cyan/30 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-volt-textMute hover:text-volt-textSec transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-volt-red text-xs mt-1">{errors.password.message}</p>}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-volt-cyan text-volt-bg font-semibold font-display rounded-lg hover:bg-volt-cyan/90 transition-all shadow-cyan disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <><span className="w-4 h-4 border-2 border-volt-bg/30 border-t-volt-bg rounded-full animate-spin" />Signing in...</>
              ) : (
                <>Sign In<Zap className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <p className="text-center text-volt-textSec text-sm mt-6">
            Don't have an account?{' '}
            <Link to="/signup" className="text-volt-cyan hover:text-volt-cyan/80 font-medium transition-colors">
              Sign up free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
```

## 3.3 Signup Page

```typescript
// src/pages/auth/Signup.tsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-toastify';
import { Zap, Eye, EyeOff, Mail, Lock, User } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const signupSchema = z.object({
  name:            z.string().min(2, 'Name must be at least 2 characters'),
  email:           z.string().email('Invalid email address'),
  password:        z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});
type SignupForm = z.infer<typeof signupSchema>;

export default function Signup() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupForm) => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    const mockUser = {
      id: 'user-' + Date.now(),
      name: data.name,
      email: data.email,
      tier: 3 as const,
      household_type: 'family' as const,
      location: 'Chennai',
      home_type: 'apartment' as const,
      appliance_count: 0,
      coins: 0,
      streak_days: 0,
      created_at: new Date().toISOString(),
    };
    setAuth(mockUser, 'mock-jwt-token');
    toast.success('Account created! Let\'s set up your profile.');
    setLoading(false);
    navigate('/onboarding');
  };

  return (
    <div className="min-h-screen bg-volt-bg grid-bg flex items-center justify-center p-4">
      <div className="fixed top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-volt-purple/5 rounded-full blur-3xl pointer-events-none" />
      
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-volt-cyan/20 border border-volt-cyan/30 flex items-center justify-center">
              <Zap className="w-5 h-5 text-volt-cyan" />
            </div>
            <span className="font-display text-2xl font-bold text-neon-cyan">VOLTIFY</span>
          </Link>
          <p className="text-volt-textSec mt-2">Create your free account</p>
        </div>

        <div className="glass rounded-2xl p-8 animate-slide-up">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {[
              { field: 'name',            label: 'Full Name',       icon: User,  type: 'text',     placeholder: 'Ravi Kumar' },
              { field: 'email',           label: 'Email',           icon: Mail,  type: 'email',    placeholder: 'ravi@example.com' },
            ].map(({ field, label, icon: Icon, type, placeholder }) => (
              <div key={field}>
                <label className="block text-sm font-medium text-volt-textSec mb-1.5">{label}</label>
                <div className="relative">
                  <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-volt-textMute" />
                  <input
                    {...register(field as keyof SignupForm)}
                    type={type}
                    placeholder={placeholder}
                    className="w-full pl-10 pr-4 py-3 bg-volt-bg border border-volt-border rounded-lg text-volt-textPri placeholder-volt-textMute focus:outline-none focus:border-volt-cyan focus:ring-1 focus:ring-volt-cyan/30 transition-all"
                  />
                </div>
                {errors[field as keyof SignupForm] && (
                  <p className="text-volt-red text-xs mt-1">{errors[field as keyof SignupForm]?.message}</p>
                )}
              </div>
            ))}

            {/* Password + Confirm */}
            {(['password', 'confirmPassword'] as const).map((field) => (
              <div key={field}>
                <label className="block text-sm font-medium text-volt-textSec mb-1.5">
                  {field === 'password' ? 'Password' : 'Confirm Password'}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-volt-textMute" />
                  <input
                    {...register(field)}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-12 py-3 bg-volt-bg border border-volt-border rounded-lg text-volt-textPri placeholder-volt-textMute focus:outline-none focus:border-volt-cyan focus:ring-1 focus:ring-volt-cyan/30 transition-all"
                  />
                  {field === 'password' && (
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-volt-textMute hover:text-volt-textSec transition-colors">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  )}
                </div>
                {errors[field] && <p className="text-volt-red text-xs mt-1">{errors[field]?.message}</p>}
              </div>
            ))}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-volt-cyan text-volt-bg font-semibold font-display rounded-lg hover:bg-volt-cyan/90 transition-all shadow-cyan disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading
                ? <><span className="w-4 h-4 border-2 border-volt-bg/30 border-t-volt-bg rounded-full animate-spin" />Creating...</>
                : <>Create Account <Zap className="w-4 h-4" /></>}
            </button>
          </form>

          <p className="text-center text-volt-textSec text-sm mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-volt-cyan hover:text-volt-cyan/80 font-medium transition-colors">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
```
