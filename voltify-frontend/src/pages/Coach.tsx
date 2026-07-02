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
    <div className="space-y-8 font-headline text-on-surface">
      <div>
        <h1 className="font-display font-semibold text-3xl tracking-tight text-gradient">
          Voltify Smart Assistant
        </h1>
        <p className="text-xs text-gray-400 mt-1">
          Personalized, data-driven recommendations to optimize your household energy efficiency
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat advisor mock panel */}
        <GlassCard className="col-span-1 lg:col-span-2 space-y-6">
          <div className="flex items-center gap-3 border-b border-white/5 pb-4">
            <div className="size-10 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center relative">
              <BrainCircuit className="size-5 text-primary" />
              <span className="absolute bottom-0 right-0 size-2.5 bg-emerald-500 border-2 border-slate-900 rounded-full animate-pulse" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-sm text-white">Voltify Energy Assistant</h3>
              <p className="text-[10px] text-emerald-400 font-mono">Assistant Active</p>
            </div>
          </div>

          <div className="space-y-4 h-64 overflow-y-auto pr-2 text-xs">
            <div className="bg-white/5 border border-white/5 p-4 rounded-2xl max-w-lg">
              <p className="text-gray-300 leading-relaxed">
                Hello! I'm your Voltify smart assistant. Based on your household profile and energy rates, I've analyzed your consumption patterns. Your Air Conditioning is estimated to account for approximately <span className="text-primary font-bold">35% of your monthly usage</span>. Let's look at a few simple adjustments to optimize this.
              </p>
            </div>

            <div className="bg-primary/10 border border-primary/20 p-4 rounded-2xl max-w-lg ml-auto">
              <p className="text-white leading-relaxed">
                What are the easiest settings to save 10% next week?
              </p>
            </div>

            <div className="bg-white/5 border border-white/5 p-4 rounded-2xl max-w-lg">
              <p className="text-gray-300 leading-relaxed">
                To start saving immediately, try shifting your water heater (geyser) run-times from peak evening hours to early mornings (6–9 AM). Additionally, adjusting your refrigerator to 4°C is an optimal, energy-saving safety standard. Completing these targets will unlock <span className="text-tertiary font-bold">150 coins</span> to redeem as rewards!
              </p>
            </div>
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="Type your message..."
              className="w-full pl-4 pr-12 py-3 bg-slate-900/60 border border-white/10 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all font-sans"
              disabled
            />
            <button className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors">
              <ArrowRight className="size-3" />
            </button>
          </div>
        </GlassCard>

        {/* Advisor card list */}
        <div className="space-y-4">
          <h3 className="font-display font-semibold text-xs uppercase tracking-wider text-gray-400">
            Smart Recommendations
          </h3>
          {tips.map((tip) => (
            <GlassCard key={tip.title} className="space-y-2 text-xs border border-white/5 hover:border-white/10 transition-colors">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-bold text-white text-sm">
                  <span>{tip.icon}</span> {tip.title}
                </span>
                <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  {tip.impact.split(' ')[0]} {tip.impact.split(' ')[1] || ''}
                </span>
              </div>
              <p className="text-gray-400 leading-relaxed text-[11px] font-sans">
                {tip.advice}
              </p>
            </GlassCard>
          ))}
        </div>
      </div>
    </div>
  );
}
export { Coach };
