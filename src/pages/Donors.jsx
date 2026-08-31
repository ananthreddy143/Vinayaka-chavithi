import { useState, useMemo } from 'react';
import { useData, formatCurrency, formatDate } from '@/hooks/useData';
import { PageHeader, Badge, EmptyState } from '@/components/ui';
import { Users, Search, ArrowUpDown, Trophy, Phone } from 'lucide-react';

export default function Donors() {
  const { donors, stats, settings } = useData();
  const cur = settings.currency;
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('total'); // total | count | name

  const filtered = useMemo(() => {
    let list = donors.filter((d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      (d.phone || '').includes(search)
    );
    if (sortBy === 'total') list = list.sort((a, b) => b.total - a.total);
    else if (sortBy === 'count') list = list.sort((a, b) => b.count - a.count);
    else list = list.sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [donors, search, sortBy]);

  return (
    <div className="px-4 lg:px-6 py-6 max-w-7xl mx-auto">
      <PageHeader
        title="Donors"
        subtitle={`${stats.donorCount} donors · ${formatCurrency(stats.totalDonations, cur)} total contributions`}
        icon={<Users size={20} />}
      />

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="glass-card p-5 animate-fadeInUp">
          <p className="text-xs text-[var(--text-muted)] uppercase mb-1">Total Donors</p>
          <p className="text-2xl font-bold font-display gradient-text">{stats.donorCount}</p>
        </div>
        <div className="glass-card p-5 animate-fadeInUp stagger-1">
          <p className="text-xs text-[var(--text-muted)] uppercase mb-1">Total Contributions</p>
          <p className="text-2xl font-bold font-display text-[var(--saffron-600)]">{formatCurrency(stats.totalDonations, cur)}</p>
        </div>
        <div className="glass-card p-5 animate-fadeInUp stagger-2">
          <p className="text-xs text-[var(--text-muted)] uppercase mb-1">Average Donation</p>
          <p className="text-2xl font-bold font-display text-gold-600">{formatCurrency(stats.avgDonation, cur)}</p>
        </div>
      </div>

      {/* Top 3 podium */}
      {donors.length >= 3 && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[1, 0, 2].map((idx, pos) => {
            const d = donors[idx];
            if (!d) return null;
            const medals = ['🥇', '🥈', '🥉'];
            const heights = ['h-32', 'h-40', 'h-28'];
            const order = ['order-2', 'order-1', 'order-3'];
            return (
              <div key={idx} className={`${order[pos]} flex flex-col items-center justify-end`}>
                <div className={`glass-card p-3 ${heights[pos]} flex flex-col items-center justify-end animate-scaleIn`} style={{ animationDelay: `${pos * 0.15}s` }}>
                  <span className="text-2xl mb-1">{medals[pos]}</span>
                  <p className="text-xs font-semibold text-[var(--text-primary)] text-center truncate w-full">{d.name}</p>
                  <p className="text-sm font-bold font-display text-[var(--saffron-600)]">{formatCurrency(d.total, cur)}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6 animate-fadeInUp">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Search donors by name or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        <div className="relative">
          <ArrowUpDown size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="input-field pl-10 sm:w-48">
            <option value="total">Sort: Total Amount</option>
            <option value="count">Sort: Contribution Count</option>
            <option value="name">Sort: Name (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Donor list */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((d, i) => (
            <div key={i} className="glass-card p-5 animate-fadeInUp" style={{ animationDelay: `${Math.min(i * 0.05, 0.4)}s` }}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shrink-0 ${
                    i === 0 ? 'bg-gold-400 text-dark-900' : i === 1 ? 'bg-gray-300 text-gray-700' : i === 2 ? 'bg-amber-600 text-white' : 'gradient-bg text-white'
                  }`}>
                    {d.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-[var(--text-primary)] truncate flex items-center gap-1">
                      {d.name}
                      {i < 3 && <Trophy size={14} className="text-gold-500 shrink-0" />}
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">
                      Last: {formatDate(d.lastDate)}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold font-display text-[var(--saffron-600)]">{formatCurrency(d.total, cur)}</p>
                  <p className="text-xs text-[var(--text-muted)]">{d.count} contribution{d.count > 1 ? 's' : ''}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-3 flex-wrap">
                <Badge>{d.paymentMethod}</Badge>
                <Badge variant="gold">{d.purpose}</Badge>
                {d.phone && (
                  <span className="text-xs text-[var(--text-muted)] inline-flex items-center gap-1">
                    <Phone size={12} /> {d.phone}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon="👥"
          title="No donors found"
          message={search ? 'Try a different search term.' : 'Donations will populate the donor list automatically.'}
        />
      )}
    </div>
  );
}
