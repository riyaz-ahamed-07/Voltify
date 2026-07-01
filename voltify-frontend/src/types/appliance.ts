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
