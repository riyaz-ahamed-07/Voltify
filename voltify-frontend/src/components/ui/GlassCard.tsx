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
    none:  'hover:border-primary/20 hover:shadow-cyan',
  }[glow];

  return (
    <div
      onClick={onClick}
      className={cn(
        'glass-card rounded-2xl p-6 border border-white/5 transition-all duration-300',
        hover && `glass-hover cursor-pointer ${glowClass}`,
        onClick && 'cursor-pointer hover:scale-[1.01] transform',
        className
      )}
    >
      {children}
    </div>
  );
}
export default GlassCard;
