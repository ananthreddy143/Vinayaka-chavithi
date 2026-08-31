import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';
import FestivalBackground from '@/components/FestivalBackground';
import { useData } from '@/hooks/useData';
import { getSheetsConfig, pullFromSheets } from '@/services/dataService';

export default function Layout({ children }) {
  const { settings } = useData();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Auto-pull from Google Sheets on first load when connected.
  useEffect(() => {
    const cfg = getSheetsConfig();
    if (cfg.connected && cfg.url) {
      pullFromSheets();
    }
  }, []);

  return (
    <div className="flex min-h-screen relative">
      <FestivalBackground />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 page-enter">{children}</main>
        <footer className="py-6 px-6 text-center text-xs text-[var(--text-muted)] no-print border-t border-[var(--border-color)]">
          <p>{settings.festivalName} · {settings.committeeName} · {settings.location}</p>
          <p className="mt-1 font-display">🙏 गणपति बप्पा मोर्या 🐘</p>
        </footer>
      </div>
    </div>
  );
}
