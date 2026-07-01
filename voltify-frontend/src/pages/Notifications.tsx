// src/pages/Notifications.tsx
import { useState } from 'react';
import { Bell, Flame, Coins, ShieldAlert, CheckCircle, Info, Zap } from 'lucide-react';
import { MOCK_NOTIFICATIONS } from '../lib/mockData';
import GlassCard from '../components/ui/GlassCard';

export default function Notifications() {
  const [list, setList] = useState(MOCK_NOTIFICATIONS);

  const markAllRead = () => {
    setList((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <div className="space-y-8 font-headline">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-display font-extrabold text-3xl tracking-tight text-gradient">🚨 SYSTEM TELEMETRY LOGS</h1>
          <p className="text-sm text-on-surface-variant">Review historical warnings and active saving multipliers</p>
        </div>
        <button
          onClick={markAllRead}
          className="border border-outline-variant text-on-surface hover:text-primary px-4 py-2 rounded-xl text-xs uppercase tracking-wider font-semibold transition-all"
        >
          Acknowledge All Logs
        </button>
      </div>

      <div className="max-w-3xl space-y-4">
        {list.map((n) => {
          return (
            <GlassCard
              key={n.id}
              className={`p-5 transition-all duration-300 ${
                n.read ? 'opacity-70 hover:opacity-90' : 'border-primary/30 shadow-[0_0_15px_rgba(0,229,255,0.05)]'
              }`}
            >
              <div className="flex gap-4 items-start text-xs">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  n.type === 'bill_alert'
                    ? 'bg-volt-pink/15 text-volt-pink'
                    : n.type === 'streak'
                    ? 'bg-volt-pink/10 text-volt-pink'
                    : 'bg-primary-container/20 text-primary-container'
                }`}>
                  <Zap className="w-4 h-4" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm text-on-surface">{n.title}</h3>
                    <span className="text-[10px] font-mono text-outline">{new Date(n.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="text-on-surface-variant text-xs font-sans leading-relaxed">{n.message}</p>
                </div>
              </div>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
}
export { Notifications };
