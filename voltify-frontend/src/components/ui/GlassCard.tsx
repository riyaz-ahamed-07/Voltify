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
        'glass rounded-xl p-5 border border-outline-variant/20',
        hover && `glass-hover cursor-pointer transition-all duration-200 ${glowClass}`,
        onClick && 'cursor-pointer',
        className
      )}
    >
      {children}
    </div>
  );
}
export default GlassCard;
