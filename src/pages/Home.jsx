import { Link } from 'react-router-dom';
import { useData, useAnimatedNumber, formatCurrency } from '@/hooks/useData';
import { useAdmin } from '@/hooks/useAdmin';
import { PageHeader, ProgressBar } from '@/components/ui';
import ThankYouBanner from '@/components/ThankYouBanner';
import { ArrowRight, HandCoins, ReceiptText, LayoutDashboard, Eye, Users, FileBarChart, Sparkles, Lock } from 'lucide-react';

export default function Home() {
  const { stats, settings } = useData();
  const { isAdmin } = useAdmin();
  const animatedDonations = useAnimatedNumber(stats.totalDonations);
  const animatedBalance = useAnimatedNumber(stats.balance);

  const features = [
    { to: '/dashboard', label: 'Dashboard', desc: 'Live stats & charts', icon: LayoutDashboard, delay: 'stagger-1' },
    { to: '/donations', label: isAdmin ? 'Add Donation' : 'Donations', desc: 'Record contributions', icon: HandCoins, delay: 'stagger-2' },
    { to: '/expenses', label: 'Track Expenses', desc: 'Log festival spending', icon: ReceiptText, delay: 'stagger-3' },
    { to: '/donors', label: 'Donors', desc: 'Contributor insights', icon: Users, delay: 'stagger-4' },
    { to: '/reports', label: 'Reports', desc: 'Export & print data', icon: FileBarChart, delay: 'stagger-5' },
    { to: '/transparency', label: 'Transparency', desc: 'Public overview', icon: Eye, delay: 'stagger-6' },
  ];

  return (
    <div className="px-4 lg:px-6 py-6 max-w-7xl mx-auto">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl glass-strong p-8 lg:p-12 mb-8 animate-fadeInUp">
        <div className="absolute -right-16 -top-16 text-[12rem] opacity-10 select-none animate-floatY">🕉️</div>
        <div className="absolute right-20 bottom-4 text-6xl opacity-10 select-none animate-floatY" style={{ animationDelay: '2s' }}>🪔</div>
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--bg-glass)] border border-[var(--border-strong)] text-xs font-semibold text-[var(--saffron-600)] mb-4">
            <Sparkles size={14} /> {settings.festivalName}
          </span>
          <h1 className="font-display text-4xl lg:text-5xl font-bold leading-tight mb-4">
            <span className="gradient-text">Vinayaka Chavithi</span>
            <br />
            <span className="text-[var(--text-primary)]">Donation & Expense Manager</span>
          </h1>
          <p className="text-base text-[var(--text-secondary)] mb-6 leading-relaxed">
            Enter data once — everything updates automatically. Track every donation and expense
            with full transparency for your community. {settings.committeeName}, {settings.location}.
          </p>
          <div className="flex flex-wrap gap-3">
            {isAdmin ? (
              <Link to="/donations" className="btn-primary inline-flex items-center gap-2">
                <HandCoins size={18} /> Add a Donation
              </Link>
            ) : (
              <Link to="/donations" className="btn-ghost inline-flex items-center gap-2">
                <Lock size={16} /> View Donations
              </Link>
            )}
            <Link to="/dashboard" className="btn-ghost inline-flex items-center gap-2">
              View Dashboard <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Quick stats */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <div className="glass-card p-6 animate-fadeInUp stagger-1">
          <p className="text-sm text-[var(--text-muted)] mb-1">Total Donations</p>
          <p className="text-3xl font-bold font-display gradient-text">
            {formatCurrency(animatedDonations, settings.currency)}
          </p>
        </div>
        <div className="glass-card p-6 animate-fadeInUp stagger-2">
          <p className="text-sm text-[var(--text-muted)] mb-1">Remaining Balance</p>
          <p className={`text-3xl font-bold font-display ${stats.balance >= 0 ? 'text-green-600' : 'text-red-500'}`}>
            {formatCurrency(animatedBalance, settings.currency)}
          </p>
        </div>
        <div className="glass-card p-6 animate-fadeInUp stagger-3">
          <p className="text-sm text-[var(--text-muted)] mb-2">Goal Progress</p>
          <ProgressBar percent={stats.goalPct} label={`Goal: ${formatCurrency(stats.target, settings.currency)}`} />
        </div>
      </section>

      {/* Thank you banner */}
      <section className="mb-8">
        <ThankYouBanner />
      </section>

      {/* Feature cards */}
      <section>
        <h2 className="font-display text-xl font-bold text-[var(--text-primary)] mb-4">Quick Access</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <Link
                key={f.to}
                to={f.to}
                className={`glass-card p-5 group animate-fadeInUp ${f.delay}`}
              >
                <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center text-white shadow-md mb-3 group-hover:scale-110 transition-transform">
                  <Icon size={18} />
                </div>
                <h3 className="font-display font-semibold text-[var(--text-primary)] text-base mb-0.5">
                  {f.label}
                </h3>
                <p className="text-xs text-[var(--text-muted)]">{f.desc}</p>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
