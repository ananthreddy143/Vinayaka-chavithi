import { useState } from 'react';
import { Menu, Sun, Moon, Shield } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { useAdmin } from '@/hooks/useAdmin';
import { AdminLoginModal, AdminBadge } from '@/components/AdminAuth';

export default function Topbar({ onMenuClick }) {
  const { theme, toggleTheme } = useTheme();
  const { isAdmin, logout } = useAdmin();
  const [loginOpen, setLoginOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 glass border-b border-[var(--border-color)] no-print">
        <div className="flex items-center justify-between px-4 lg:px-6 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={onMenuClick}
              className="lg:hidden text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors p-2 -ml-2"
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>

            <div className="hidden lg:block">
              <p className="text-xs text-[var(--text-muted)]">
                {isAdmin
                  ? 'Admin mode — you can add, edit & delete data'
                  : 'Viewing mode — read only'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isAdmin ? (
              <button
                onClick={() => setLoginOpen(true)}
                className="btn-ghost inline-flex items-center gap-1.5 text-sm px-3 py-2"
              >
                <Shield size={15} /> <span className="hidden sm:inline">Admin Login</span>
              </button>
            ) : (
              <AdminBadge onLogout={logout} />
            )}
            <button
              onClick={toggleTheme}
              className="flex items-center gap-2 px-3 py-2 rounded-xl btn-ghost text-sm"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
              <span className="hidden sm:inline">{theme === 'light' ? 'Dark' : 'Light'}</span>
            </button>
          </div>
        </div>
      </header>

      <AdminLoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </>
  );
}
