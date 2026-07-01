// src/components/layout/Sidebar.tsx
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, BrainCircuit, Trophy, User, Settings, LogOut, Zap } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export default function Sidebar() {
  const { logout } = useAuthStore();

  const links = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/coach', label: 'Energy Coach', icon: BrainCircuit },
    { to: '/leaderboard', label: 'Leaderboard', icon: Trophy },
    { to: '/profile', label: 'Profile', icon: User },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-surface border-r border-outline-variant/30 flex flex-col justify-between p-6 h-screen sticky top-0">
      <div className="space-y-8">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded bg-primary-container/20 border border-primary/30 flex items-center justify-center animate-pulse-glow">
            <Zap className="w-5 h-5 text-primary-container" />
          </div>
          <span className="font-display font-bold text-xl tracking-tight text-gradient">VOLTIFY</span>
        </div>

        {/* Navigation links */}
        <nav className="space-y-2">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg font-headline font-semibold text-sm transition-all duration-300 ${
                    isActive
                      ? 'bg-primary-container/10 text-primary border-l-2 border-primary-container shadow-[0_0_15px_rgba(0,229,255,0.1)]'
                      : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-high/50'
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                <span>{link.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Logout button */}
      <div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-on-surface-variant hover:text-error hover:bg-error-container/10 font-headline font-semibold text-sm transition-all duration-300"
        >
          <LogOut className="w-5 h-5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
