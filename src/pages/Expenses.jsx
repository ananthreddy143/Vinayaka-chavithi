import { useState } from 'react';
import { useData, formatCurrency, formatDate } from '@/hooks/useData';
import { useAdmin } from '@/hooks/useAdmin';
import { addExpense, deleteExpense } from '@/services/dataService';
import { PageHeader, Badge, EmptyState } from '@/components/ui';
import Modal from '@/components/Modal';
import { ReceiptText, Plus, Trash2, Search, CheckCircle2, Lock } from 'lucide-react';

const INITIAL_FORM = {
  description: '', category: 'Decoration', amount: '', date: new Date().toISOString().slice(0, 10),
  paidTo: '', paymentMethod: 'Cash', notes: '', bill: '',
};

const CATEGORIES = ['Idol', 'Decoration', 'Pooja', 'Food', 'Equipment', 'Cultural', 'Transport', 'Miscellaneous'];
const PAYMENT_METHODS = ['UPI', 'Cash', 'Bank', 'Other'];

export default function Expenses() {
  const { expenses, stats, settings } = useData();
  const { isAdmin } = useAdmin();
  const cur = settings.currency;
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('All');
  const [success, setSuccess] = useState(false);

  const filtered = expenses.filter((e) => {
    const matchSearch =
      e.description.toLowerCase().includes(search.toLowerCase()) ||
      (e.paidTo || '').toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat === 'All' || e.category === filterCat;
    return matchSearch && matchCat;
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.description.trim() || !form.amount) return;
    addExpense(form);
    setSuccess(true);
    setForm(INITIAL_FORM);
    setModalOpen(false);
    setTimeout(() => setSuccess(false), 4000);
  };

  const handleChange = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
  };

  return (
    <div className="px-4 lg:px-6 py-6 max-w-7xl mx-auto">
      <PageHeader
        title="Expenses"
        subtitle={`${stats.expenseCount} expenses · ${formatCurrency(stats.totalExpenses, cur)} total`}
        icon={<ReceiptText size={20} />}
        actions={
          isAdmin ? (
            <button onClick={() => setModalOpen(true)} className="btn-primary inline-flex items-center gap-2">
              <Plus size={18} /> Add Expense
            </button>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-[var(--text-muted)] bg-[var(--bg-glass)] border border-[var(--border-color)]">
              <Lock size={13} /> Read-only
            </span>
          )
        }
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6 animate-fadeInUp">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Search by description or payee..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        <select value={filterCat} onChange={(e) => setFilterCat(e.target.value)} className="input-field sm:w-44">
          <option value="All">All Categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {success && (
        <div className="glass-card p-4 mb-6 animate-scaleIn border-green-300">
          <div className="flex items-center gap-3">
            <CheckCircle2 size={20} className="text-green-600 shrink-0" />
            <p className="text-sm font-semibold text-[var(--text-primary)]">Expense recorded — dashboard & reports updated automatically.</p>
          </div>
        </div>
      )}

      {filtered.length > 0 ? (
        <div className="glass-card overflow-hidden animate-fadeInUp">
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border-color)] text-left">
                  <th className="px-4 py-3 font-semibold text-[var(--text-secondary)]">Description</th>
                  <th className="px-4 py-3 font-semibold text-[var(--text-secondary)]">Category</th>
                  <th className="px-4 py-3 font-semibold text-[var(--text-secondary)]">Paid To</th>
                  <th className="px-4 py-3 font-semibold text-[var(--text-secondary)]">Method</th>
                  <th className="px-4 py-3 font-semibold text-[var(--text-secondary)]">Date</th>
                  <th className="px-4 py-3 font-semibold text-[var(--text-secondary)] text-right">Amount</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((e) => (
                  <tr key={e.id} className="border-b border-[var(--border-color)] last:border-0 hover:bg-[var(--bg-glass)] transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-[var(--text-primary)]">{e.description}</p>
                      {e.notes && <p className="text-xs text-[var(--text-muted)] truncate max-w-[200px]">{e.notes}</p>}
                    </td>
                    <td className="px-4 py-3"><Badge variant="error">{e.category}</Badge></td>
                    <td className="px-4 py-3 text-[var(--text-secondary)]">{e.paidTo || '—'}</td>
                    <td className="px-4 py-3"><Badge>{e.paymentMethod}</Badge></td>
                    <td className="px-4 py-3 text-[var(--text-muted)]">{formatDate(e.date)}</td>
                    <td className="px-4 py-3 text-right font-bold font-display text-maroon-600">{formatCurrency(e.amount, cur)}</td>
                    <td className="px-4 py-3 text-right">
                      {isAdmin ? (
                        <button
                          onClick={() => { if (confirm('Delete this expense?')) deleteExpense(e.id); }}
                          className="text-red-400 hover:text-red-600 transition-colors p-1"
                          aria-label="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden divide-y divide-[var(--border-color)]">
            {filtered.map((e) => (
              <div key={e.id} className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-[var(--text-primary)]">{e.description}</p>
                    <p className="text-xs text-[var(--text-muted)]">{formatDate(e.date)} · {e.paidTo || '—'}</p>
                  </div>
                  <p className="font-bold font-display text-maroon-600 shrink-0 ml-2">{formatCurrency(e.amount, cur)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="error">{e.category}</Badge>
                  <Badge>{e.paymentMethod}</Badge>
                </div>
                {e.notes && <p className="text-xs text-[var(--text-muted)] mt-2">{e.notes}</p>}
                {isAdmin && (
                  <button
                    onClick={() => { if (confirm('Delete this expense?')) deleteExpense(e.id); }}
                    className="text-red-400 hover:text-red-600 text-xs mt-2 inline-flex items-center gap-1"
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <EmptyState
          icon="🧾"
          title="No expenses found"
          message={search || filterCat !== 'All' ? 'Try adjusting your filters.' : isAdmin ? 'Add your first expense to get started.' : 'No expenses have been recorded yet.'}
        />
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Expense" maxWidth="max-w-xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="label-field">Description *</label>
              <input type="text" required value={form.description} onChange={handleChange('description')} className="input-field" placeholder="e.g. Pandal decoration materials" />
            </div>
            <div>
              <label className="label-field">Category</label>
              <select value={form.category} onChange={handleChange('category')} className="input-field">
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label-field">Amount (₹) *</label>
              <input type="number" required min="1" value={form.amount} onChange={handleChange('amount')} className="input-field" placeholder="500" />
            </div>
            <div>
              <label className="label-field">Date *</label>
              <input type="date" required value={form.date} onChange={handleChange('date')} className="input-field" />
            </div>
            <div>
              <label className="label-field">Paid To</label>
              <input type="text" value={form.paidTo} onChange={handleChange('paidTo')} className="input-field" placeholder="Vendor / person name" />
            </div>
            <div>
              <label className="label-field">Payment Method</label>
              <select value={form.paymentMethod} onChange={handleChange('paymentMethod')} className="input-field">
                {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="label-field">Bill / Receipt No.</label>
              <input type="text" value={form.bill} onChange={handleChange('bill')} className="input-field" placeholder="Invoice ref (optional)" />
            </div>
            <div className="sm:col-span-2">
              <label className="label-field">Notes</label>
              <textarea value={form.notes} onChange={handleChange('notes')} className="input-field" placeholder="Any additional note..." />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-primary flex-1">Save Expense</button>
            <button type="button" onClick={() => setModalOpen(false)} className="btn-ghost">Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
