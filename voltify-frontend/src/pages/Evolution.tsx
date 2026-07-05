// src/pages/Evolution.tsx
import { useState, useEffect } from 'react';
import { apiService } from '../lib/api';
import { GlassCard } from '../components/ui/GlassCard';
import { Calendar, TrendingUp, Cpu, Landmark, ShieldAlert, Award } from 'lucide-react';
import { toast } from 'react-toastify';

interface TimelineEvent {
  month: string;
  event: string;
  details: string;
  icon: string;
}

export default function Evolution() {
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await apiService.getHomeEvolution();
        setTimeline(data);
      } catch (err: any) {
        console.error('Failed to load evolution data:', err);
        toast.error('Failed to fetch evolution history');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="space-y-8 animate-fade-in p-6">
      {/* ── Page Header ── */}
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight text-white">Home Evolution</h1>
        <p className="text-sm text-zinc-400 mt-1">See how today's decisions shape tomorrow's bills.</p>
      </div>

      {/* ── Core Hero Stats Card ── */}
      <GlassCard className="p-6 border border-primary/20 bg-gradient-to-r from-primary/5 via-transparent to-transparent">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Days Evolved</span>
            <p className="text-3xl font-mono font-bold text-white">286 Days</p>
          </div>
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Current Efficiency</span>
            <p className="text-3xl font-mono font-bold text-emerald-400">+18%</p>
          </div>
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Lifetime Saved</span>
            <p className="text-3xl font-mono font-bold text-primary">₹7,420</p>
          </div>
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">CO₂ Avoided</span>
            <p className="text-3xl font-mono font-bold text-teal-400">112 kg</p>
          </div>
        </div>
      </GlassCard>

      {/* ── Timeline Section ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Timeline representation (Col span 2) */}
        <GlassCard className="p-6 lg:col-span-2 space-y-6">
          <h2 className="font-display font-semibold text-lg text-white flex items-center gap-2">
            <Calendar className="size-5 text-primary" />
            Milestone Chronology
          </h2>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-3">
              <span className="size-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              <p className="text-xs text-zinc-500">Reconstructing home timeline...</p>
            </div>
          ) : timeline.length === 0 ? (
            <div className="text-center py-12 space-y-2">
              <ShieldAlert className="size-8 text-zinc-600 mx-auto" />
              <p className="text-sm text-zinc-500">Your home has no memories yet. Let's build them together.</p>
            </div>
          ) : (
            <div className="relative border-l border-zinc-800 ml-4 pl-6 space-y-8 py-2">
              {timeline.map((item, idx) => (
                <div key={idx} className="relative group">
                  {/* Timeline Dot Icon */}
                  <span className="absolute -left-[37px] top-0 flex size-6 items-center justify-center rounded-full bg-[#111] border border-zinc-800 text-xs shadow-md group-hover:border-primary/50 transition-colors">
                    {item.icon}
                  </span>

                  <div className="space-y-1">
                    <span className="text-[10px] font-mono font-semibold uppercase tracking-widest text-primary">
                      {item.month}
                    </span>
                    <h3 className="font-display text-sm font-semibold text-white group-hover:text-primary transition-colors">
                      {item.event}
                    </h3>
                    <p className="text-xs text-zinc-400 leading-relaxed max-w-xl">
                      {item.details}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </GlassCard>

        {/* Narrative reasoning guide card (Col span 1) */}
        <div className="space-y-6">
          <GlassCard className="p-6 space-y-4">
            <h3 className="font-display font-semibold text-sm text-white flex items-center gap-2">
              <Cpu className="size-4 text-primary" />
              Continuous Ingest Pipeline
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Every action you perform on Voltify — completing a challenge, adjusting appliance loads, checking in daily, or uploading bills — is automatically structured and remembered by the Cognee engine.
            </p>
            <div className="border-t border-zinc-800 pt-3 space-y-2">
              <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-500">
                <span className="size-1.5 rounded-full bg-emerald-500" />
                Input: Daily check-in log
              </div>
              <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-500">
                <span className="size-1.5 rounded-full bg-emerald-500" />
                Input: Bi-monthly utility statement
              </div>
              <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-500">
                <span className="size-1.5 rounded-full bg-emerald-500" />
                Input: Recommendation feedback
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6 space-y-4 border border-teal-500/10 bg-teal-500/5">
            <h3 className="font-display font-semibold text-sm text-teal-400 flex items-center gap-2">
              <Award className="size-4" />
              Memory Milestone Met!
            </h3>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Your home reached the <strong>Efficiency-Balanced</strong> status on August 2026. Cognee consolidated your AC routines and confirmed a permanent 18% savings pattern.
            </p>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
