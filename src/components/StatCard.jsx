import { useAnimatedNumber, formatCurrency } from '@/hooks/useData';
import { TrendingUp, TrendingDown, Wallet, Users, CalendarDays, Target } from 'lucide-react';

const ICON_MAP = {
  donations: HandCoinsIcon,
  expenses: ReceiptTextIcon,
  balance: Wallet,
  donors: Users,
  todayDonations: CalendarDays,
  todayExpenses: CalendarDays,
  goal: Target,
};

function HandCoinsIcon(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="8" r="6" /><path d="M18.09 10.37A6 6 0 1 1 10.34 18" /><path d="M7 6h1v4" /><path d="m16.71 13.88.7.71-2.82 2.82" />
    </svg>
  );
}
function ReceiptTextIcon(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z" /><path d="M8 7h8" /><path d="M8 11h8" /><path d="M8 15h5" />
    </svg>
  );
}

export default function StatCard({ type, label, value, currency = '₹', trend, icon: CustomIcon, delay = 0, gradient }) {
  const animated = useAnimatedNumber(value || 0);
  const Icon = CustomIcon || ICON_MAP[type] || TrendingUp;
  const isMoney = type !== 'donors' && type !== 'goal' && type !== 'donorCount';
  const display = isMoney
    ? formatCurrency(animated, currency)
    : type === 'goal'
    ? `${Math.round(animated)}%`
    : Math.round(animated).toString();

  return (
    <div
      className="glass-card p-5 animate-fadeInUp"
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
            gradient ? 'gradient-bg text-white shadow-lg' : 'bg-[var(--bg-glass)] text-[var(--saffron-600)]'
          }`}
        >
          <Icon size={20} />
        </div>
        {trend != null && (
          <span
            className={`text-xs font-semibold flex items-center gap-0.5 ${
              trend >= 0 ? 'text-green-600' : 'text-red-500'
            }`}
          >
            {trend >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <p className="text-[0.78rem] font-medium text-[var(--text-muted)] uppercase tracking-wide mb-1">
        {label}
      </p>
      <p className="text-2xl font-bold text-[var(--text-primary)] font-display tabular-nums">
        {display}
      </p>
    </div>
  );
}
