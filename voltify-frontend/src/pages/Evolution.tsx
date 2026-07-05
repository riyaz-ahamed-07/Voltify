// src/pages/Evolution.tsx
import { useState, useEffect } from 'react';
import { apiService } from '../lib/api';
import { GlassCard } from '../components/ui/GlassCard';
import { Calendar, TrendingUp, Cpu, Landmark, ShieldAlert, Award, Brain, CheckCircle2, FileCode } from 'lucide-react';
import { toast } from 'react-toastify';

interface TimelineEvent {
  month: string;
  event: string;
  details: string;
  icon: string;
}

interface Memory {
  id: string;
  learned_memory: string;
  confidence: number;
  source: string;
  reasoning: string;
}

interface VaultStats {
  stored: number;
  patterns: number;
  relationships: number;
}

export default function Evolution() {
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [stats, setStats] = useState<VaultStats>({ stored: 0, patterns: 0, relationships: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [timelineData, vaultData] = await Promise.all([
          apiService.getHomeEvolution(),
          apiService.getMemoryVault()
        ]);
        setTimeline(timelineData);
        setMemories(vaultData.memories);
        setStats(vaultData.stats);
      } catch (err: any) {
        console.error('Failed to load evolution & memory data:', err);
        toast.error('Failed to fetch home memory logs');
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
        <h1 className="font-display text-3xl font-bold tracking-tight text-white font-headline">Home Evolution & Memory</h1>
        <p className="text-sm text-zinc-400 mt-1 font-sans">See how today's decisions shape tomorrow's bills and inspect Cognee's structured home memory nodes.</p>
      </div>

      {/* ── Core Hero Stats Card ── */}
      <GlassCard className="p-6 border border-primary/20 bg-gradient-to-r from-primary/5 via-transparent to-transparent">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-6">
          <div className="space-y-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 font-mono">Days Evolved</span>
            <p className="text-2xl font-mono font-bold text-white">286 Days</p>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 font-mono">Efficiency</span>
            <p className="text-2xl font-mono font-bold text-emerald-400">+18%</p>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 font-mono">Saved</span>
            <p className="text-2xl font-mono font-bold text-primary">₹7,420</p>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 font-mono">Stored Nodes</span>
            <p className="text-2xl font-mono font-bold text-teal-400">{stats.stored} Nodes</p>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 font-mono">Patterns</span>
            <p className="text-2xl font-mono font-bold text-indigo-400">{stats.patterns} Patterns</p>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 font-mono">Edges</span>
            <p className="text-2xl font-mono font-bold text-pink-400">{stats.relationships} Edges</p>
          </div>
        </div>
      </GlassCard>

      {/* ── Main Combined Layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Timeline Milestone Chronology (Col span 1) */}
        <GlassCard className="p-6 lg:col-span-1 space-y-6">
          <h2 className="font-display font-semibold text-lg text-white flex items-center gap-2 font-headline">
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
              <p className="text-sm text-zinc-500">Your home has no milestones yet.</p>
            </div>
          ) : (
            <div className="relative border-l border-zinc-800 ml-4 pl-6 space-y-8 py-2">
              {timeline.map((item, idx) => (
                <div key={idx} className="relative group">
                  {/* Timeline Dot Icon */}
                  <span className="absolute -left-[37px] top-0 flex size-6 items-center justify-center rounded-full bg-[#111] border border-zinc-800 text-xs shadow-md group-hover:border-primary/50 transition-colors">
                    {item.icon}
                  </span>

                  <div className="space-y-1 text-left">
                    <span className="text-[10px] font-mono font-semibold uppercase tracking-widest text-primary">
                      {item.month}
                    </span>
                    <h3 className="font-display text-sm font-semibold text-white group-hover:text-primary transition-colors font-headline">
                      {item.event}
                    </h3>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      {item.details}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </GlassCard>

        {/* Right Column: Memories Table (Col span 2) */}
        <GlassCard className="p-6 lg:col-span-2 space-y-6">
          <h2 className="font-display font-semibold text-lg text-white flex items-center gap-2 font-headline">
            <Brain className="size-5 text-teal-400" />
            Learned Facts & Reasoning Logs
          </h2>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-3">
              <span className="size-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              <p className="text-xs text-zinc-500">Reading Cognee memory records...</p>
            </div>
          ) : memories.length === 0 ? (
            <div className="text-center py-12 space-y-2">
              <ShieldAlert className="size-8 text-zinc-600 mx-auto" />
              <p className="text-sm text-zinc-500">Your home has no memories yet. Let's build them together.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs table-fixed">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500 text-[10px] tracking-wider uppercase font-mono">
                    <th className="pb-3 font-semibold w-[35%]">Learned Memory</th>
                    <th className="pb-3 font-semibold w-[18%]">Source</th>
                    <th className="pb-3 font-semibold w-[12%]">Confidence</th>
                    <th className="pb-3 font-semibold w-[35%]">Reasoning / Evidence</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {memories.map((m) => {
                    const sourceColors: Record<string, string> = {
                      'Conversation': 'bg-blue-500/10 border-blue-500/20 text-blue-400',
                      'Onboarding': 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400',
                      'Daily Check-in': 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
                      'User Action': 'bg-purple-500/10 border-purple-500/20 text-purple-400',
                    };
                    const color = sourceColors[m.source] || 'bg-zinc-500/10 border-zinc-500/20 text-zinc-400';

                    return (
                      <tr key={m.id} className="group hover:bg-zinc-800/10 transition-colors">
                        <td className="py-4 pr-4 font-semibold text-white flex items-start gap-2.5 font-sans break-words w-[35%]">
                          <CheckCircle2 className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                          {m.learned_memory}
                        </td>
                        <td className="py-4 w-[18%]">
                          <span className={`px-2 py-0.5 rounded-full border text-[9px] font-mono font-semibold uppercase tracking-wide ${color}`}>
                            {m.source}
                          </span>
                        </td>
                        <td className="py-4 font-mono font-bold text-zinc-300 w-[12%]">
                          {m.confidence}%
                        </td>
                        <td className="py-4 pl-4 text-zinc-400 leading-relaxed italic font-sans break-words w-[35%]">
                          {m.reasoning}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </GlassCard>
      </div>

      {/* ── Footer Explanatory Block ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <GlassCard className="p-6 space-y-3">
          <h3 className="font-display font-semibold text-sm text-white flex items-center gap-2 font-headline">
            <Cpu className="size-4 text-primary" />
            Continuous Ingest Pipeline
          </h3>
          <p className="text-xs text-zinc-400 leading-relaxed font-sans">
            Every action you perform on Voltify — completing a challenge, adjusting appliance loads, checking in daily, or uploading bills — is automatically structured and remembered by the Cognee engine.
          </p>
        </GlassCard>
        <GlassCard className="p-6 space-y-3">
          <h3 className="font-display font-semibold text-sm text-white flex items-center gap-2 font-headline">
            <Brain className="size-4 text-teal-400" />
            How Does the Home Learn?
          </h3>
          <p className="text-xs text-zinc-400 leading-relaxed font-sans">
            Unlike simple database variables, Voltify uses Cognee's hybrid graph-vector memory to extract facts, establish links between devices and weather, and synthesize actions into high-confidence habits.
          </p>
        </GlassCard>
      </div>
    </div>
  );
}
