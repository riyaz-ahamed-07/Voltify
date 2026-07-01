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
    <aside className="w-64 bg-surface border-r border-white/5 flex flex-col justify-between p-6 h-screen sticky top-0 shrink-0 shadow-2xl z-30">
      <div className="space-y-8">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/25 flex items-center justify-center shadow-cyan">
            <Zap className="w-5 h-5 text-primary animate-pulse" />
          </div>
          <span className="font-display font-black text-xl tracking-tighter text-neon-cyan">VOLTIFY</span>
        </div>

        {/* Navigation links */}
        <nav className="space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center gap-3.5 px-4.5 py-3 rounded-xl font-headline font-semibold text-sm transition-all duration-300 ${
                    isActive
                      ? 'bg-primary/10 text-primary border-l-2 border-primary shadow-cyan'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`
                }
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="tracking-wide">{link.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Logout button */}
      <div className="pt-6 border-t border-white/5">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3.5 px-4.5 py-3 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-500/10 font-headline font-semibold text-sm transition-all duration-300"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          <span className="tracking-wide">Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
