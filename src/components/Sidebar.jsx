import { NavLink, useLocation } from 'react-router-dom';
import { Home, LayoutDashboard, HandCoins, ReceiptText, Users, FileBarChart, Eye, Settings, X } from 'lucide-react';
import { useData } from '@/hooks/useData';

const NAV_ITEMS = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/donations', label: 'Donations', icon: HandCoins },
  { to: '/expenses', label: 'Expenses', icon: ReceiptText },
  { to: '/donors', label: 'Donors', icon: Users },
  { to: '/reports', label: 'Reports', icon: FileBarChart },
  { to: '/transparency', label: 'Transparency', icon: Eye },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ open, onClose }) {
  const location = useLocation();
  const { settings } = useData();

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden no-print"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-[260px] z-50 flex flex-col glass-strong border-r border-[var(--border-color)] transition-transform duration-300 no-print ${
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Logo / header */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-[var(--border-color)]">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl gradient-bg flex items-center justify-center text-2xl shadow-lg animate-pulseGlow shrink-0">
              🕉️
            </div>
            <div className="min-w-0">
              <h1 className="font-display font-bold text-base leading-tight gradient-text truncate">
                Vinayaka Chavithi
              </h1>
              <p className="text-[0.7rem] text-[var(--text-muted)] truncate">
                {settings.committeeName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.to === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(item.to);
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? 'gradient-bg text-white shadow-lg shadow-orange-500/25'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-glass)] hover:text-[var(--text-primary)]'
                }`}
              >
                <Icon
                  size={18}
                  className={isActive ? '' : 'group-hover:scale-110 transition-transform'}
                />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-[var(--border-color)]">
          <p className="text-center text-[0.7rem] text-[var(--text-muted)] font-display">
            गणपति बप्पा मोर्या
          </p>
          <p className="text-center text-[0.65rem] text-[var(--text-muted)] mt-1">
            {settings.festivalName}
          </p>
        </div>
      </aside>
    </>
  );
}
