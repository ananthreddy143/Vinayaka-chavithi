import { useState } from 'react';
import { useData, formatCurrency, formatDate } from '@/hooks/useData';
import { useAdmin } from '@/hooks/useAdmin';
import { addDonation, deleteDonation } from '@/services/dataService';
import { PageHeader, Badge, EmptyState } from '@/components/ui';
import Modal from '@/components/Modal';
import { HandCoins, Plus, Trash2, Search, CheckCircle2, Lock } from 'lucide-react';

const INITIAL_FORM = {
  donorName: '', amount: '', date: new Date().toISOString().slice(0, 10),
  paymentMethod: 'UPI', purpose: 'General Fund', transactionId: '', phone: '', notes: '',
};

const PAYMENT_METHODS = ['UPI', 'Cash', 'Bank', 'Other'];
const PURPOSES = ['General Fund', 'Idol Fund', 'Pooja Items', 'Decoration', 'Pandal Setup', 'Cultural Events', 'Annadanam', 'Other'];

export default function Donations() {
  const { donations, stats, settings } = useData();
  const { isAdmin } = useAdmin();
  const cur = settings.currency;
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);
  const [search, setSearch] = useState('');
  const [filterMethod, setFilterMethod] = useState('All');
  const [successEntry, setSuccessEntry] = useState(null);

  const filtered = donations.filter((d) => {
    const matchSearch =
      d.donorName.toLowerCase().includes(search.toLowerCase()) ||
      d.purpose.toLowerCase().includes(search.toLowerCase()) ||
      (d.transactionId || '').toLowerCase().includes(search.toLowerCase());
    const matchMethod = filterMethod === 'All' || d.paymentMethod === filterMethod;
    return matchSearch && matchMethod;
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.donorName.trim() || !form.amount) return;
    const entry = addDonation(form);
    setSuccessEntry(entry);
    setForm(INITIAL_FORM);
    setModalOpen(false);
  };

  const handleChange = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
  };

  return (
    <div className="px-4 lg:px-6 py-6 max-w-7xl mx-auto">
      <PageHeader
        title="Donations"
        subtitle={`${stats.donationCount} donations · ${formatCurrency(stats.totalDonations, cur)} total`}
        icon={<HandCoins size={20} />}
        actions={
          isAdmin ? (
            <button onClick={() => setModalOpen(true)} className="btn-primary inline-flex items-center gap-2">
              <Plus size={18} /> Add Donation
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
            placeholder="Search by name, purpose, or transaction ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        <select value={filterMethod} onChange={(e) => setFilterMethod(e.target.value)} className="input-field sm:w-44">
          <option value="All">All Methods</option>
          {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>

      {/* Success banner */}
      {successEntry && (
        <div className="glass-card p-5 mb-6 animate-scaleIn border-green-300">
          <div className="flex items-center gap-3">
            <CheckCircle2 size={22} className="text-green-600 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-[var(--text-primary)]">
                Donation recorded successfully!
              </p>
              <p className="text-xs text-[var(--text-muted)]">
                Receipt No: <span className="font-mono font-semibold text-[var(--saffron-600)]">{successEntry.receiptNo}</span>
                {' · '}Thank you, {successEntry.donorName}!
              </p>
            </div>
            <button onClick={() => setSuccessEntry(null)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-sm">
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* List */}
      {filtered.length > 0 ? (
        <div className="glass-card overflow-hidden animate-fadeInUp">
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border-color)] text-left">
                  <th className="px-4 py-3 font-semibold text-[var(--text-secondary)]">Donor</th>
                  <th className="px-4 py-3 font-semibold text-[var(--text-secondary)]">Purpose</th>
                  <th className="px-4 py-3 font-semibold text-[var(--text-secondary)]">Method</th>
                  <th className="px-4 py-3 font-semibold text-[var(--text-secondary)]">Date</th>
                  <th className="px-4 py-3 font-semibold text-[var(--text-secondary)] text-right">Amount</th>
                  <th className="px-4 py-3 font-semibold text-[var(--text-secondary)] text-center">Receipt</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((d) => (
                  <tr key={d.id} className="border-b border-[var(--border-color)] last:border-0 hover:bg-[var(--bg-glass)] transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-[var(--text-primary)]">{d.donorName}</p>
                      {d.notes && <p className="text-xs text-[var(--text-muted)] truncate max-w-[200px]">{d.notes}</p>}
                    </td>
                    <td className="px-4 py-3 text-[var(--text-secondary)]">{d.purpose}</td>
                    <td className="px-4 py-3"><Badge>{d.paymentMethod}</Badge></td>
                    <td className="px-4 py-3 text-[var(--text-muted)]">{formatDate(d.date)}</td>
                    <td className="px-4 py-3 text-right font-bold font-display text-[var(--saffron-600)]">{formatCurrency(d.amount, cur)}</td>
                    <td className="px-4 py-3 text-center text-xs font-mono text-[var(--text-muted)]">{d.receiptNo || '—'}</td>
                    <td className="px-4 py-3 text-right">
                      {isAdmin ? (
                        <button
                          onClick={() => { if (confirm('Delete this donation?')) deleteDonation(d.id); }}
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
            {filtered.map((d) => (
              <div key={d.id} className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-medium text-[var(--text-primary)]">{d.donorName}</p>
                    <p className="text-xs text-[var(--text-muted)]">{formatDate(d.date)}</p>
                  </div>
                  <p className="font-bold font-display text-[var(--saffron-600)]">{formatCurrency(d.amount, cur)}</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge>{d.paymentMethod}</Badge>
                  <span className="text-xs text-[var(--text-muted)]">{d.purpose}</span>
                  {d.receiptNo && <span className="text-xs font-mono text-[var(--text-muted)] ml-auto">{d.receiptNo}</span>}
                </div>
                {d.notes && <p className="text-xs text-[var(--text-muted)] mt-2">{d.notes}</p>}
                {isAdmin && (
                  <button
                    onClick={() => { if (confirm('Delete this donation?')) deleteDonation(d.id); }}
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
          icon="🤲"
          title="No donations found"
          message={search || filterMethod !== 'All' ? 'Try adjusting your filters.' : isAdmin ? 'Add your first donation to get started.' : 'No donations have been recorded yet.'}
        />
      )}

      {/* Add donation modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Donation" maxWidth="max-w-xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="label-field">Donor Name *</label>
              <input type="text" required value={form.donorName} onChange={handleChange('donorName')} className="input-field" placeholder="e.g. Rajesh Sharma" />
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
              <label className="label-field">Payment Method</label>
              <select value={form.paymentMethod} onChange={handleChange('paymentMethod')} className="input-field">
                {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="label-field">Purpose</label>
              <select value={form.purpose} onChange={handleChange('purpose')} className="input-field">
                {PURPOSES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="label-field">Transaction ID</label>
              <input type="text" value={form.transactionId} onChange={handleChange('transactionId')} className="input-field" placeholder="UPI ref / bank ref (optional)" />
            </div>
            <div>
              <label className="label-field">Phone</label>
              <input type="tel" value={form.phone} onChange={handleChange('phone')} className="input-field" placeholder="98XXXXXXXX" />
            </div>
            <div className="sm:col-span-2">
              <label className="label-field">Notes</label>
              <textarea value={form.notes} onChange={handleChange('notes')} className="input-field" placeholder="Any additional note..." />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-primary flex-1">Save Donation</button>
            <button type="button" onClick={() => setModalOpen(false)} className="btn-ghost">Cancel</button>
          </div>
          <p className="text-xs text-[var(--text-muted)] text-center">A receipt number will be generated automatically.</p>
        </form>
      </Modal>
    </div>
  );
}
