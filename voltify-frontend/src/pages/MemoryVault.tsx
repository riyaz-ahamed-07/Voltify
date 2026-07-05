// src/pages/MemoryVault.tsx
import { useState, useEffect } from 'react';
import { apiService } from '../lib/api';
import { GlassCard } from '../components/ui/GlassCard';
import { Brain, FileCode, CheckCircle2, ShieldAlert } from 'lucide-react';
import { toast } from 'react-toastify';

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

export default function MemoryVault() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [stats, setStats] = useState<VaultStats>({ stored: 0, patterns: 0, relationships: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await apiService.getMemoryVault();
        setMemories(res.memories);
        setStats(res.stats);
      } catch (err: any) {
        console.error('Failed to load memory vault:', err);
        toast.error('Failed to fetch memory logs');
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
        <h1 className="font-display text-3xl font-bold tracking-tight text-white">Learned Memories</h1>
        <p className="text-sm text-zinc-400 mt-1">Inspect exactly what your home has learned.</p>
      </div>

      {/* ── Vault Metrics Row ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <GlassCard className="p-5 flex items-center justify-between border-primary/10">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Memories Stored</span>
            <p className="text-2xl font-mono font-bold text-white mt-1">{stats.stored} Nodes</p>
          </div>
          <span className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Brain className="size-5" />
          </span>
        </GlassCard>

        <GlassCard className="p-5 flex items-center justify-between border-primary/10">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Patterns Synthesized</span>
            <p className="text-2xl font-mono font-bold text-teal-400 mt-1">{stats.patterns} Patterns</p>
          </div>
          <span className="size-10 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-400">
            <CheckCircle2 className="size-5" />
          </span>
        </GlassCard>

        <GlassCard className="p-5 flex items-center justify-between border-primary/10">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Relationships Mapped</span>
            <p className="text-2xl font-mono font-bold text-indigo-400 mt-1">{stats.relationships} Edges</p>
          </div>
          <span className="size-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
            <FileCode className="size-5" />
          </span>
        </GlassCard>
      </div>

      {/* ── Memories Table Section ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <GlassCard className="p-6 xl:col-span-2 space-y-6">
          <h2 className="font-display font-semibold text-lg text-white">Learned Facts & Reasoning Logs</h2>

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
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500">
                    <th className="pb-3 font-semibold uppercase tracking-wider w-[40%]">Learned Memory</th>
                    <th className="pb-3 font-semibold uppercase tracking-wider">Source</th>
                    <th className="pb-3 font-semibold uppercase tracking-wider">Confidence</th>
                    <th className="pb-3 font-semibold uppercase tracking-wider w-[40%]">Reasoning / Evidence</th>
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
                        <td className="py-4 pr-4 font-semibold text-white flex items-start gap-2.5">
                          <CheckCircle2 className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                          {m.learned_memory}
                        </td>
                        <td className="py-4">
                          <span className={`px-2 py-0.5 rounded-full border text-[9px] font-mono font-semibold uppercase tracking-wide ${color}`}>
                            {m.source}
                          </span>
                        </td>
                        <td className="py-4 font-mono font-bold text-zinc-300">
                          {m.confidence}%
                        </td>
                        <td className="py-4 pl-4 text-zinc-400 leading-relaxed italic">
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

        {/* Explainability Side Panel */}
        <GlassCard className="p-6 space-y-6">
          <div>
            <h3 className="font-display font-semibold text-sm text-white">How Does the Home Learn?</h3>
            <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
              Unlike simple database variables, Voltify uses <strong>Cognee's hybrid graph-vector memory</strong> to synthesize actions into cognitive understanding.
            </p>
          </div>

          <div className="space-y-4 text-xs">
            <div className="space-y-1 pl-4 border-l border-zinc-800">
              <span className="font-mono text-[9px] uppercase tracking-wider text-zinc-500">1. Fact Extraction</span>
              <p className="text-zinc-300 leading-relaxed">
                Raw events (Check-ins, Uploads) are digested as base facts.
              </p>
            </div>

            <div className="space-y-1 pl-4 border-l border-zinc-800">
              <span className="font-mono text-[9px] uppercase tracking-wider text-zinc-500">2. Relationship Mapping</span>
              <p className="text-zinc-300 leading-relaxed">
                Cognee establishes links between rooms, appliances, weather, and actions.
              </p>
            </div>

            <div className="space-y-1 pl-4 border-l border-zinc-800">
              <span className="font-mono text-[9px] uppercase tracking-wider text-zinc-500">3. Pattern Recognition</span>
              <p className="text-zinc-300 leading-relaxed">
                Repetitive behaviors consolidate into high-confidence habits.
              </p>
            </div>

            <div className="space-y-1 pl-4 border-l border-zinc-800">
              <span className="font-mono text-[9px] uppercase tracking-wider text-zinc-500">4. Insight Synthesis</span>
              <p className="text-zinc-300 leading-relaxed">
                Cognitive rules compare baseline changes to weather spikes and suggest preventative strategies.
              </p>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
