// src/lib/utils.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | null | undefined): string {
  if (amount === undefined || amount === null || isNaN(amount)) return '₹0';
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
  // DISCOM tariff rates
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
