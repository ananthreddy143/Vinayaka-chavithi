import { useData, formatCurrency } from '@/hooks/useData';

// Reusable page header with title + optional actions.
export function PageHeader({ title, subtitle, actions, icon }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 animate-fadeInUp">
      <div className="flex items-center gap-3">
        {icon && (
          <div className="w-11 h-11 rounded-xl gradient-bg flex items-center justify-center text-white shadow-lg shrink-0">
            {icon}
          </div>
        )}
        <div>
          <h1 className="font-display text-2xl font-bold text-[var(--text-primary)]">{title}</h1>
          {subtitle && <p className="text-sm text-[var(--text-muted)] mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
    </div>
  );
}

// Progress bar with animated fill.
export function ProgressBar({ percent, label }) {
  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between items-baseline mb-2">
          <span className="text-sm font-medium text-[var(--text-secondary)]">{label}</span>
          <span className="text-sm font-bold text-[var(--saffron-600)]">{Math.round(percent)}%</span>
        </div>
      )}
      <div className="w-full h-3 bg-[var(--bg-glass)] rounded-full overflow-hidden border border-[var(--border-color)]">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{
            width: `${Math.min(percent, 100)}%`,
            background: 'var(--gradient-primary)',
            animation: 'progressFill 1.2s ease-out',
          }}
        />
      </div>
    </div>
  );
}

// Empty state component.
export function EmptyState({ icon, title, message }) {
  return (
    <div className="glass-card p-10 text-center animate-fadeIn">
      <div className="text-4xl mb-3 opacity-60">{icon}</div>
      <h3 className="font-display text-lg font-semibold text-[var(--text-primary)] mb-1">{title}</h3>
      <p className="text-sm text-[var(--text-muted)] max-w-sm mx-auto">{message}</p>
    </div>
  );
}

// Badge for payment methods / categories.
export function Badge({ children, variant = 'default' }) {
  const styles = {
    default: 'bg-[var(--bg-glass)] text-[var(--text-secondary)] border-[var(--border-color)]',
    success: 'bg-green-100 text-green-700 border-green-300',
    warning: 'bg-amber-100 text-amber-700 border-amber-300',
    error: 'bg-red-100 text-red-700 border-red-300',
    gold: 'bg-gold-100 text-gold-600 border-gold-300',
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[variant]}`}
    >
      {children}
    </span>
  );
}
