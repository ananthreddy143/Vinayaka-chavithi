import { useData, formatCurrency, formatDate } from '@/hooks/useData';
import { getDonations, getExpenses } from '@/services/dataService';
import { PageHeader, Badge } from '@/components/ui';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { FileBarChart, Download, Printer, TrendingUp, TrendingDown, Wallet, Users } from 'lucide-react';

const PIE_COLORS = ['#f97316', '#fbbf24', '#fb923c', '#fde68a', '#ea6c00', '#fcd34d', '#f59e0b'];

function exportCSV(filename, rows) {
  const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function Reports() {
  const { stats, settings, trend } = useData();
  const cur = settings.currency;

  const handleExportDonations = () => {
    const rows = [['Receipt No', 'Donor Name', 'Amount', 'Date', 'Method', 'Purpose', 'Transaction ID', 'Phone', 'Notes']];
    getDonations().forEach((d) => {
      rows.push([d.receiptNo || '', d.donorName, d.amount, d.date, d.paymentMethod, d.purpose, d.transactionId || '', d.phone || '', d.notes || '']);
    });
    exportCSV('vc2026_donations.csv', rows);
  };

  const handleExportExpenses = () => {
    const rows = [['Description', 'Category', 'Amount', 'Date', 'Paid To', 'Method', 'Bill No', 'Notes']];
    getExpenses().forEach((e) => {
      rows.push([e.description, e.category, e.amount, e.date, e.paidTo || '', e.paymentMethod, e.bill || '', e.notes || '']);
    });
    exportCSV('vc2026_expenses.csv', rows);
  };

  const handlePrint = () => window.print();

  const expensePieData = Object.entries(stats.expenseBreakdown).map(([name, value]) => ({ name, value }));
  const paymentPieData = Object.entries(stats.paymentBreakdown).map(([name, value]) => ({ name, value }));

  return (
    <div className="px-4 lg:px-6 py-6 max-w-7xl mx-auto">
      <PageHeader
        title="Reports"
        subtitle="Financial summary, trends & exports"
        icon={<FileBarChart size={20} />}
        actions={
          <div className="flex gap-2 flex-wrap no-print">
            <button onClick={handleExportDonations} className="btn-ghost inline-flex items-center gap-1.5 text-sm">
              <Download size={15} /> Donations CSV
            </button>
            <button onClick={handleExportExpenses} className="btn-ghost inline-flex items-center gap-1.5 text-sm">
              <Download size={15} /> Expenses CSV
            </button>
            <button onClick={handlePrint} className="btn-primary inline-flex items-center gap-1.5 text-sm">
              <Printer size={15} /> Print
            </button>
          </div>
        }
      />

      {/* Print header (only visible when printing) */}
      <div className="print-only mb-6 text-center">
        <h1 className="text-2xl font-bold">{settings.festivalName}</h1>
        <p>{settings.committeeName} · {settings.location}</p>
        <p>Generated on {formatDate(new Date().toISOString())}</p>
      </div>

      {/* Financial summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="glass-card p-5 animate-fadeInUp">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={18} className="text-[var(--saffron-600)]" />
            <span className="text-xs text-[var(--text-muted)] uppercase">Donations</span>
          </div>
          <p className="text-xl font-bold font-display text-[var(--saffron-600)]">{formatCurrency(stats.totalDonations, cur)}</p>
          <p className="text-xs text-[var(--text-muted)] mt-1">{stats.donationCount} entries</p>
        </div>
        <div className="glass-card p-5 animate-fadeInUp stagger-1">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown size={18} className="text-maroon-600" />
            <span className="text-xs text-[var(--text-muted)] uppercase">Expenses</span>
          </div>
          <p className="text-xl font-bold font-display text-maroon-600">{formatCurrency(stats.totalExpenses, cur)}</p>
          <p className="text-xs text-[var(--text-muted)] mt-1">{stats.expenseCount} entries</p>
        </div>
        <div className="glass-card p-5 animate-fadeInUp stagger-2">
          <div className="flex items-center gap-2 mb-2">
            <Wallet size={18} className="text-green-600" />
            <span className="text-xs text-[var(--text-muted)] uppercase">Balance</span>
          </div>
          <p className={`text-xl font-bold font-display ${stats.balance >= 0 ? 'text-green-600' : 'text-red-500'}`}>{formatCurrency(stats.balance, cur)}</p>
        </div>
        <div className="glass-card p-5 animate-fadeInUp stagger-3">
          <div className="flex items-center gap-2 mb-2">
            <Users size={18} className="text-gold-600" />
            <span className="text-xs text-[var(--text-muted)] uppercase">Donors</span>
          </div>
          <p className="text-xl font-bold font-display text-gold-600">{stats.donorCount}</p>
          <p className="text-xs text-[var(--text-muted)] mt-1">Avg: {formatCurrency(stats.avgDonation, cur)}</p>
        </div>
      </div>

      {/* Daily trend chart */}
      <div className="glass-card p-6 mb-6 animate-fadeInUp">
        <h3 className="font-display font-semibold text-lg text-[var(--text-primary)] mb-4">Daily Trends (Last 14 Days)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={trend} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="rptDon" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f97316" stopOpacity={0.6} />
                <stop offset="100%" stopColor="#f97316" stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="rptExp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8b1a1a" stopOpacity={0.5} />
                <stop offset="100%" stopColor="#8b1a1a" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(234,108,0,0.1)" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
            <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
            <Tooltip formatter={(v) => formatCurrency(v, cur)} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Area type="monotone" dataKey="donations" name="Donations" stroke="#f97316" strokeWidth={2} fill="url(#rptDon)" />
            <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#8b1a1a" strokeWidth={2} fill="url(#rptExp)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Breakdown charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="glass-card p-6 animate-fadeInUp">
          <h3 className="font-display font-semibold text-lg text-[var(--text-primary)] mb-4">Payment Method Breakdown</h3>
          {paymentPieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={paymentPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={95} label={({ name }) => name}>
                  {paymentPieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v) => formatCurrency(v, cur)} />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="text-sm text-[var(--text-muted)] text-center py-16">No data.</p>}
        </div>
        <div className="glass-card p-6 animate-fadeInUp stagger-1">
          <h3 className="font-display font-semibold text-lg text-[var(--text-primary)] mb-4">Expense Category Breakdown</h3>
          {expensePieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={expensePieData} margin={{ left: 0, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(234,108,0,0.1)" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                <Tooltip formatter={(v) => formatCurrency(v, cur)} />
                <Bar dataKey="value" name="Amount" radius={[8, 8, 0, 0]}>
                  {expensePieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-sm text-[var(--text-muted)] text-center py-16">No data.</p>}
        </div>
      </div>

      {/* Detailed tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6 animate-fadeInUp">
          <h3 className="font-display font-semibold text-lg text-[var(--text-primary)] mb-4">Donation Breakdown</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[var(--border-color)] text-left">
                  <th className="py-2 pr-2 font-semibold text-[var(--text-secondary)]">Donor</th>
                  <th className="py-2 px-2 font-semibold text-[var(--text-secondary)]">Method</th>
                  <th className="py-2 px-2 font-semibold text-[var(--text-secondary)]">Date</th>
                  <th className="py-2 pl-2 font-semibold text-[var(--text-secondary)] text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {getDonations().slice(0, 15).map((d) => (
                  <tr key={d.id} className="border-b border-[var(--border-color)] last:border-0">
                    <td className="py-2 pr-2 text-[var(--text-primary)] truncate max-w-[120px]">{d.donorName}</td>
                    <td className="py-2 px-2"><Badge>{d.paymentMethod}</Badge></td>
                    <td className="py-2 px-2 text-[var(--text-muted)]">{formatDate(d.date)}</td>
                    <td className="py-2 pl-2 text-right font-semibold text-[var(--saffron-600)]">{formatCurrency(d.amount, cur)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="glass-card p-6 animate-fadeInUp stagger-1">
          <h3 className="font-display font-semibold text-lg text-[var(--text-primary)] mb-4">Expense Breakdown</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[var(--border-color)] text-left">
                  <th className="py-2 pr-2 font-semibold text-[var(--text-secondary)]">Description</th>
                  <th className="py-2 px-2 font-semibold text-[var(--text-secondary)]">Category</th>
                  <th className="py-2 px-2 font-semibold text-[var(--text-secondary)]">Date</th>
                  <th className="py-2 pl-2 font-semibold text-[var(--text-secondary)] text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {getExpenses().slice(0, 15).map((e) => (
                  <tr key={e.id} className="border-b border-[var(--border-color)] last:border-0">
                    <td className="py-2 pr-2 text-[var(--text-primary)] truncate max-w-[120px]">{e.description}</td>
                    <td className="py-2 px-2"><Badge variant="error">{e.category}</Badge></td>
                    <td className="py-2 px-2 text-[var(--text-muted)]">{formatDate(e.date)}</td>
                    <td className="py-2 pl-2 text-right font-semibold text-maroon-600">{formatCurrency(e.amount, cur)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
