// src/pages/Coach.tsx
import { Zap, Sparkles, BrainCircuit, MessageSquare, ArrowRight, Lightbulb } from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';

export default function Coach() {
  const tips = [
    { title: 'Air Conditioner Temperature Optimization', icon: '❄️', impact: 'High Impact (Save ~₹900/mo)', advice: 'Maintain your AC thermostat at 24°C as advised by the Bureau of Energy Efficiency. Set a timer to shut off 1 hour before waking up; the room remains cool.' },
    { title: 'Geyser Off-Peak Dispatching', icon: '🚿', impact: 'Medium Impact (Save ~₹150/mo)', advice: 'Run your water heater from 6–9 AM instead of evening peak hours. Heavy loads on off-peak hours reduce DISCOM grid strains.' },
    { title: 'Standby Power Eliminators', icon: '📺', impact: 'Low Impact (Save ~₹50/mo)', advice: 'Smart TVs and appliances consume 5–10W continuously on standby. Turning off at the plug completely terminates standby currents.' },
  ];

  return (
    <div className="space-y-8 font-headline">
      <div>
        <h1 className="font-display font-extrabold text-3xl tracking-tight text-gradient">⚡ VOLTIFY AI COACH</h1>
        <p className="text-sm text-on-surface-variant">Real-time disaggregation advice powered by machine learning mathematical logs</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat advisor mock panel */}
        <GlassCard className="col-span-1 lg:col-span-2 space-y-6">
          <div className="flex items-center gap-3 border-b border-outline-variant/30 pb-4">
            <div className="w-10 h-10 rounded-full bg-primary-container/20 border border-primary/30 flex items-center justify-center animate-pulse-glow">
              <BrainCircuit className="w-5 h-5 text-primary-container" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-on-surface">Voltify Advisor v1.4</h3>
              <p className="text-[10px] text-tertiary font-mono uppercase">Status: Core Online</p>
            </div>
          </div>

          <div className="space-y-4 h-64 overflow-y-auto pr-2 text-xs">
            <div className="bg-surface-container-high/40 border border-outline-variant/20 p-3.5 rounded-xl max-w-lg">
              <p className="text-on-surface-variant leading-relaxed">
                Hello! I am your mathematical energy advisor. I have disaggregated your monthly utility parameters and detected a major surge risk during peak summer intervals. Your AC consumes approximately <span className="text-primary font-bold">35% of total household current</span>. Let's calibrate!
              </p>
            </div>

            <div className="bg-primary/5 border border-primary/20 p-3.5 rounded-xl max-w-lg ml-auto">
              <p className="text-primary leading-relaxed">
                What are the easiest settings to save 10% next week?
              </p>
            </div>

            <div className="bg-surface-container-high/40 border border-outline-variant/20 p-3.5 rounded-xl max-w-lg">
              <p className="text-on-surface-variant leading-relaxed">
                Certainly! Try shifting your Geyser run-times from 6 PM to 7 AM. Additionally, set your Refrigerator temperature threshold to 4°C. These adjustments will unlock <span className="text-tertiary font-bold">150 coins</span> immediately on your dashboard!
              </p>
            </div>
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="Ask your energy advisor..."
              className="w-full pl-4 pr-12 py-3 bg-surface border border-outline-variant/50 rounded-xl text-xs text-on-surface placeholder-outline/50 focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container/30 transition-all font-sans"
              disabled
            />
            <button className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 bg-primary-container text-on-primary-container rounded-lg hover:opacity-90">
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </GlassCard>

        {/* Advisor card list */}
        <div className="space-y-4">
          <h3 className="font-display font-bold text-sm text-on-surface uppercase tracking-wider">Active Telemetry Tips</h3>
          {tips.map((tip, idx) => (
            <GlassCard key={idx} className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-bold text-on-surface text-sm">
                  <span>{tip.icon}</span> {tip.title}
                </span>
                <span className="text-[9px] font-mono text-tertiary bg-tertiary/10 px-2 py-0.5 rounded-full uppercase tracking-wider">{tip.impact}</span>
              </div>
              <p className="text-on-surface-variant leading-relaxed text-[11px] font-sans">{tip.advice}</p>
            </GlassCard>
          ))}
        </div>
      </div>
    </div>
  );
}
export { Coach };
