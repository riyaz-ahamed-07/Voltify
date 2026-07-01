// src/components/layout/Topbar.tsx
import { useState } from 'react';
import { Bell, Flame, Coins, Check, Zap } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useGamificationStore } from '../../store/gamificationStore';
import { MOCK_NOTIFICATIONS } from '../../lib/mockData';
import { toast } from 'react-toastify';

export default function Topbar() {
  const { user } = useAuthStore();
  const { coins, streak_days } = useGamificationStore();
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [showDropdown, setShowDropdown] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    toast.success('All notifications marked as read');
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  return (
    <header className="bg-surface/80 backdrop-blur-xl border-b border-outline-variant/30 py-4 px-8 flex items-center justify-between sticky top-0 z-40">
      {/* Title */}
      <div>
        <h2 className="font-display font-bold text-lg tracking-tight text-on-surface">
          SYSTEM STATUS: <span className="text-neon-cyan">ONLINE</span>
        </h2>
        <p className="text-xs text-on-surface-variant">Welcome back, Agent {user?.name || 'Voltifyer'}</p>
      </div>

      {/* Action panel */}
      <div className="flex items-center gap-6">
        {/* Streak indicator */}
        <div className="flex items-center gap-1.5 bg-surface-container-high px-3 py-1.5 rounded-full border border-outline-variant/30 hover:border-volt-pink/50 transition-colors cursor-help group relative">
          <Flame className="w-4 h-4 text-volt-pink animate-pulse" />
          <span className="font-mono text-sm font-semibold text-volt-pink">{streak_days} DAY STREAK</span>
          
          <div className="absolute top-10 right-0 w-48 bg-surface border border-outline-variant p-2.5 rounded shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity text-xs text-on-surface-variant z-50">
            Keep saving daily energy to increase your streak multiplier! Currently: <span className="text-volt-pink font-bold">1.15x</span>
          </div>
        </div>

        {/* Coins indicator */}
        <div className="flex items-center gap-1.5 bg-surface-container-high px-3 py-1.5 rounded-full border border-outline-variant/30 hover:border-primary-container/50 transition-colors cursor-help group relative">
          <Coins className="w-4 h-4 text-primary-container animate-bounce" />
          <span className="font-mono text-sm font-semibold text-primary-container">{coins} COINS</span>
          
          <div className="absolute top-10 right-0 w-48 bg-surface border border-outline-variant p-2.5 rounded shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity text-xs text-on-surface-variant z-50">
            Earn coins by beating your energy estimate. Redeem for credits & vouchers!
          </div>
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="p-2 bg-surface-container-high rounded-full border border-outline-variant/30 text-on-surface-variant hover:text-primary hover:border-primary/50 transition-all relative"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-volt-pink rounded-full border border-surface animate-ping" />
            )}
          </button>

          {showDropdown && (
            <div className="absolute right-0 top-11 w-80 bg-surface-container-low border border-outline-variant rounded-xl shadow-2xl p-4 z-50 animate-slide-up">
              <div className="flex items-center justify-between border-b border-outline-variant/30 pb-2 mb-2">
                <span className="font-headline font-bold text-sm text-on-surface">Telemetry Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-[11px] text-primary hover:underline flex items-center gap-1"
                  >
                    <Check className="w-3 h-3" /> Mark all read
                  </button>
                )}
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="text-center text-xs text-on-surface-variant py-4">No recent logs</p>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => markAsRead(n.id)}
                      className={`p-2.5 rounded-lg border text-xs transition-colors cursor-pointer ${
                        n.read
                          ? 'bg-transparent border-transparent text-on-surface-variant'
                          : 'bg-primary/5 border-primary/20 text-on-surface hover:bg-primary/10'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1 mb-1">
                        <span className="font-bold">{n.title}</span>
                        {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-volt-pink mt-1" />}
                      </div>
                      <p className="text-on-surface-variant text-[11px]">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
