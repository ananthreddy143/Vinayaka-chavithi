import { useData, formatCurrency } from '@/hooks/useData';
import { PageHeader, ProgressBar } from '@/components/ui';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import { Eye, Shield, Heart, HandCoins, ReceiptText, Wallet, Target } from 'lucide-react';

const PIE_COLORS = ['#f97316', '#fbbf24', '#fb923c', '#fde68a', '#ea6c00', '#fcd34d', '#f59e0b'];

export default function Transparency() {
  const { stats, settings } = useData();
  const cur = settings.currency;

  const expensePieData = Object.entries(stats.expenseBreakdown).map(([name, value]) => ({ name, value }));
  const paymentPieData = Object.entries(stats.paymentBreakdown).map(([name, value]) => ({ name, value }));

  return (
    <div className="px-4 lg:px-6 py-6 max-w-5xl mx-auto">
      <PageHeader
        title="Transparency"
        subtitle="Public financial overview — no private data exposed"
        icon={<Eye size={20} />}
      />

      {/* Public notice banner */}
      <div className="glass-strong rounded-2xl p-6 mb-6 text-center animate-fadeInUp relative overflow-hidden">
        <div className="absolute -left-10 -top-10 text-8xl opacity-10 select-none">🛡️</div>
        <div className="absolute -right-10 -bottom-10 text-8xl opacity-10 select-none">🕉️</div>
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold mb-3">
            <Shield size={14} /> Transparent & Accountable
          </div>
          <h2 className="font-display text-2xl font-bold gradient-text mb-2">{settings.festivalName}</h2>
          <p className="text-sm text-[var(--text-secondary)] max-w-lg mx-auto">
            {settings.committeeName} is committed to full financial transparency.
            Every rupee donated is tracked and reported here. Personal details like phone numbers
            and transaction IDs are never shown publicly.
          </p>
        </div>
      </div>

      {/* Key figures */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6">
        <div className="glass-card p-6 text-center animate-fadeInUp">
          <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center text-white mx-auto mb-3 shadow-lg">
            <HandCoins size={22} />
          </div>
          <p className="text-xs text-[var(--text-muted)] uppercase mb-1">Total Donations</p>
          <p className="text-2xl font-bold font-display gradient-text">{formatCurrency(stats.totalDonations, cur)}</p>
          <p className="text-xs text-[var(--text-muted)] mt-1">from {stats.donorCount} donors</p>
        </div>
        <div className="glass-card p-6 text-center animate-fadeInUp stagger-1">
          <div className="w-12 h-12 rounded-xl bg-maroon-600 flex items-center justify-center text-white mx-auto mb-3 shadow-lg">
            <ReceiptText size={22} />
          </div>
          <p className="text-xs text-[var(--text-muted)] uppercase mb-1">Total Expenses</p>
          <p className="text-2xl font-bold font-display text-maroon-600">{formatCurrency(stats.totalExpenses, cur)}</p>
          <p className="text-xs text-[var(--text-muted)] mt-1">{stats.expenseCount} expenses</p>
        </div>
        <div className="glass-card p-6 text-center animate-fadeInUp stagger-2">
          <div className="w-12 h-12 rounded-xl bg-green-600 flex items-center justify-center text-white mx-auto mb-3 shadow-lg">
            <Wallet size={22} />
          </div>
          <p className="text-xs text-[var(--text-muted)] uppercase mb-1">Remaining Balance</p>
          <p className={`text-2xl font-bold font-display ${stats.balance >= 0 ? 'text-green-600' : 'text-red-500'}`}>
            {formatCurrency(stats.balance, cur)}
          </p>
        </div>
      </div>

      {/* Goal progress */}
      <div className="glass-card p-6 mb-6 animate-fadeInUp">
        <div className="flex items-center gap-2 mb-4">
          <Target size={18} className="text-[var(--saffron-600)]" />
          <h3 className="font-display font-semibold text-lg text-[var(--text-primary)]">Donation Goal Progress</h3>
        </div>
        <ProgressBar percent={stats.goalPct} label={`Target: ${formatCurrency(stats.target, cur)}`} />
        <p className="text-sm text-[var(--text-muted)] mt-3 text-center">
          We've raised {formatCurrency(stats.totalDonations, cur)} of our {formatCurrency(stats.target, cur)} goal.
          {stats.goalPct >= 100 ? ' Goal achieved! Thank you! 🎉' : ` Only ${formatCurrency(stats.target - stats.totalDonations, cur)} to go!`}
        </p>
      </div>

      {/* Payment method breakdown */}
      <div className="glass-card p-6 mb-6 animate-fadeInUp">
        <h3 className="font-display font-semibold text-lg text-[var(--text-primary)] mb-4">Payment Method Breakdown</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
          {paymentPieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={paymentPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={85} label={({ name }) => name}>
                    {paymentPieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => formatCurrency(v, cur)} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2">
                {paymentPieData.map((p, i) => (
                  <div key={p.name} className="flex items-center justify-between py-2 border-b border-[var(--border-color)] last:border-0">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                      <span className="text-sm text-[var(--text-secondary)]">{p.name}</span>
                    </div>
                    <span className="text-sm font-semibold text-[var(--text-primary)]">{formatCurrency(p.value, cur)}</span>
                  </div>
                ))}
              </div>
            </>
          ) : <p className="text-sm text-[var(--text-muted)] text-center py-12 col-span-2">No donation data available.</p>}
        </div>
      </div>

      {/* Expense breakdown */}
      <div className="glass-card p-6 mb-6 animate-fadeInUp">
        <h3 className="font-display font-semibold text-lg text-[var(--text-primary)] mb-4">Expense Breakdown by Category</h3>
        {expensePieData.length > 0 ? (
          <>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={expensePieData} margin={{ left: 0, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(234,108,0,0.1)" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                <Tooltip formatter={(v) => formatCurrency(v, cur)} />
                <Bar dataKey="value" name="Amount" radius={[8, 8, 0, 0]}>
                  {expensePieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
              {expensePieData.map((e, i) => (
                <div key={e.name} className="flex items-center justify-between p-3 rounded-lg bg-[var(--bg-glass)]">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-3 h-3 rounded-full shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                    <span className="text-xs text-[var(--text-secondary)] truncate">{e.name}</span>
                  </div>
                  <span className="text-xs font-semibold text-[var(--text-primary)] shrink-0 ml-2">{formatCurrency(e.value, cur)}</span>
                </div>
              ))}
            </div>
          </>
        ) : <p className="text-sm text-[var(--text-muted)] text-center py-12">No expense data available.</p>}
      </div>

      {/* Trust note */}
      <div className="glass-card p-6 text-center animate-fadeInUp">
        <Heart size={24} className="text-[var(--saffron-600)] mx-auto mb-2" />
        <p className="font-display text-lg font-semibold text-[var(--text-primary)] mb-1">
          Thank you for your trust and generosity
        </p>
        <p className="text-sm text-[var(--text-muted)]">
          This page is safe to share publicly. No phone numbers, transaction IDs, or private donor details are displayed.
        </p>
        <p className="font-display text-base text-[var(--saffron-600)] mt-3">🙏 गणपति बप्पा मोर्या 🐘</p>
      </div>
    </div>
  );
}
