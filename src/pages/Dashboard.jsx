import { useData, formatCurrency, formatDate } from '@/hooks/useData';
import StatCard from '@/components/StatCard';
import ThankYouBanner from '@/components/ThankYouBanner';
import { PageHeader, ProgressBar, Badge } from '@/components/ui';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { LayoutDashboard, HandCoins, ReceiptText, Wallet, Users, CalendarDays, Target, Trophy, Clock } from 'lucide-react';

const PIE_COLORS = ['#f97316', '#fbbf24', '#fb923c', '#fde68a', '#ea6c00', '#fcd34d', '#f59e0b', '#fed7aa'];

export default function Dashboard() {
  const { stats, settings, trend } = useData();
  const cur = settings.currency;

  const expensePieData = Object.entries(stats.expenseBreakdown).map(([name, value]) => ({ name, value }));
  const paymentPieData = Object.entries(stats.paymentBreakdown).map(([name, value]) => ({ name, value }));

  return (
    <div className="px-4 lg:px-6 py-6 max-w-7xl mx-auto">
      <PageHeader
        title="Dashboard"
        subtitle="Live overview of donations, expenses & festival progress"
        icon={<LayoutDashboard size={20} />}
      />

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard type="donations" label="Total Donations" value={stats.totalDonations} currency={cur} icon={HandCoins} delay={0.05} gradient />
        <StatCard type="expenses" label="Total Expenses" value={stats.totalExpenses} currency={cur} icon={ReceiptText} delay={0.1} />
        <StatCard type="balance" label="Balance" value={stats.balance} currency={cur} icon={Wallet} delay={0.15} />
        <StatCard type="donors" label="Total Donors" value={stats.donorCount} icon={Users} delay={0.2} />
      </div>

      {/* Today + Goal */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard type="todayDonations" label="Today's Donations" value={stats.todaysDonations} currency={cur} icon={CalendarDays} delay={0.25} />
        <StatCard type="todayExpenses" label="Today's Expenses" value={stats.todaysExpenses} currency={cur} icon={CalendarDays} delay={0.3} />
        <StatCard type="goal" label="Goal Progress" value={stats.goalPct} icon={Target} delay={0.35} gradient />
        <StatCard label="Avg Donation" value={stats.avgDonation} currency={cur} icon={HandCoins} delay={0.4} />
      </div>

      {/* Goal progress bar */}
      <div className="glass-card p-6 mb-6 animate-fadeInUp stagger-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
          <h3 className="font-display font-semibold text-lg text-[var(--text-primary)]">Donation Goal</h3>
          <p className="text-sm text-[var(--text-muted)]">
            {formatCurrency(stats.totalDonations, cur)} of {formatCurrency(stats.target, cur)}
          </p>
        </div>
        <ProgressBar
          percent={stats.goalPct}
          label={`Target: ${formatCurrency(stats.target, cur)}`}
        />
      </div>

      {/* Thank you banner */}
      <div className="mb-6">
        <ThankYouBanner />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Donation vs Expense */}
        <div className="glass-card p-6 animate-fadeInUp">
          <h3 className="font-display font-semibold text-lg text-[var(--text-primary)] mb-4">
            Donations vs Expenses
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={trend} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gDon" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f97316" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="#f97316" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="gExp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b1a1a" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="#8b1a1a" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(234,108,0,0.1)" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
              <Tooltip formatter={(v) => formatCurrency(v, cur)} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Area type="monotone" dataKey="donations" name="Donations" stroke="#f97316" strokeWidth={2} fill="url(#gDon)" />
              <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#8b1a1a" strokeWidth={2} fill="url(#gExp)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Expense category pie */}
        <div className="glass-card p-6 animate-fadeInUp stagger-1">
          <h3 className="font-display font-semibold text-lg text-[var(--text-primary)] mb-4">
            Expense Breakdown
          </h3>
          {expensePieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={expensePieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} innerRadius={50} paddingAngle={3}>
                  {expensePieData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => formatCurrency(v, cur)} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-[var(--text-muted)] text-center py-20">No expenses recorded yet.</p>
          )}
        </div>
      </div>

      {/* Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Recent donations */}
        <div className="glass-card p-6 animate-fadeInUp">
          <div className="flex items-center gap-2 mb-4">
            <Clock size={18} className="text-[var(--saffron-600)]" />
            <h3 className="font-display font-semibold text-lg text-[var(--text-primary)]">Recent Donations</h3>
          </div>
          <div className="space-y-3">
            {stats.recentDonations.length > 0 ? stats.recentDonations.slice(0, 5).map((d) => (
              <div key={d.id} className="flex items-center justify-between py-2 border-b border-[var(--border-color)] last:border-0">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[var(--text-primary)] truncate">{d.donorName}</p>
                  <p className="text-xs text-[var(--text-muted)]">{formatDate(d.date)} · <Badge>{d.paymentMethod}</Badge></p>
                </div>
                <p className="text-sm font-bold text-[var(--saffron-600)] font-display shrink-0 ml-2">{formatCurrency(d.amount, cur)}</p>
              </div>
            )) : (
              <p className="text-sm text-[var(--text-muted)] text-center py-8">No donations yet.</p>
            )}
          </div>
        </div>

        {/* Recent expenses */}
        <div className="glass-card p-6 animate-fadeInUp stagger-1">
          <div className="flex items-center gap-2 mb-4">
            <Clock size={18} className="text-maroon-600" />
            <h3 className="font-display font-semibold text-lg text-[var(--text-primary)]">Recent Expenses</h3>
          </div>
          <div className="space-y-3">
            {stats.recentExpenses.length > 0 ? stats.recentExpenses.slice(0, 5).map((e) => (
              <div key={e.id} className="flex items-center justify-between py-2 border-b border-[var(--border-color)] last:border-0">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[var(--text-primary)] truncate">{e.description}</p>
                  <p className="text-xs text-[var(--text-muted)]">{formatDate(e.date)} · <Badge variant="error">{e.category}</Badge></p>
                </div>
                <p className="text-sm font-bold text-maroon-600 font-display shrink-0 ml-2">{formatCurrency(e.amount, cur)}</p>
              </div>
            )) : (
              <p className="text-sm text-[var(--text-muted)] text-center py-8">No expenses yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Top contributors + payment breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6 animate-fadeInUp">
          <div className="flex items-center gap-2 mb-4">
            <Trophy size={18} className="text-gold-500" />
            <h3 className="font-display font-semibold text-lg text-[var(--text-primary)]">Top Contributors</h3>
          </div>
          <div className="space-y-3">
            {stats.topContributors.length > 0 ? stats.topContributors.map((d, i) => (
              <div key={i} className="flex items-center gap-3 py-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                  i === 0 ? 'bg-gold-400 text-dark-900' : i === 1 ? 'bg-gray-300 text-gray-700' : i === 2 ? 'bg-amber-600 text-white' : 'bg-[var(--bg-glass)] text-[var(--text-muted)]'
                }`}>
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--text-primary)] truncate">{d.name}</p>
                  <p className="text-xs text-[var(--text-muted)]">{d.count} contribution{d.count > 1 ? 's' : ''}</p>
                </div>
                <p className="text-sm font-bold text-[var(--saffron-600)] font-display shrink-0">{formatCurrency(d.total, cur)}</p>
              </div>
            )) : (
              <p className="text-sm text-[var(--text-muted)] text-center py-8">No donors yet.</p>
            )}
          </div>
        </div>

        <div className="glass-card p-6 animate-fadeInUp stagger-1">
          <h3 className="font-display font-semibold text-lg text-[var(--text-primary)] mb-4">Payment Method Breakdown</h3>
          {paymentPieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={paymentPieData} layout="vertical" margin={{ left: 10, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(234,108,0,0.1)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} width={70} />
                <Tooltip formatter={(v) => formatCurrency(v, cur)} />
                <Bar dataKey="value" name="Amount" radius={[0, 8, 8, 0]}>
                  {paymentPieData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-[var(--text-muted)] text-center py-20">No donations yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
