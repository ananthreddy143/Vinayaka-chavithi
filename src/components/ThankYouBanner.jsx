import { useData } from '@/hooks/useData';

// Toast/notification banner shown when latest donation arrives.
export default function ThankYouBanner() {
  const { stats } = useData();
  const latest = stats.latestDonation;

  if (!latest) {
    return (
      <div className="glass-card p-6 text-center animate-fadeInUp">
        <div className="text-4xl mb-3 animate-floatY">🙏</div>
        <h3 className="font-display text-xl font-bold text-[var(--text-primary)] mb-2">
          Be the first to contribute!
        </h3>
        <p className="text-sm text-[var(--text-secondary)] max-w-md mx-auto">
          No donations yet for {`Vinayaka Chavithi 2026`}. Your generosity can start the festival spirit.
          Ganapati Bappa Morya! 🐘
        </p>
      </div>
    );
  }

  return (
    <div className="glass-card p-6 animate-scaleIn relative overflow-hidden">
      <div className="absolute -right-8 -top-8 text-7xl opacity-10 select-none animate-floatY">🐘</div>
      <div className="flex items-center gap-3 mb-2">
        <span className="text-3xl">🙏</span>
        <h3 className="font-display text-xl font-bold gradient-text">
          Thank You, {latest.donorName}!
        </h3>
      </div>
      <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
        Your generous contribution of{' '}
        <span className="font-bold text-[var(--saffron-600)]">
          ₹{Number(latest.amount).toLocaleString('en-IN')}
        </span>{' '}
        helps make Vinayaka Chavithi 2026 special.
      </p>
      <p className="mt-2 font-display text-base text-[var(--text-primary)]">
        Ganapati Bappa Morya! 🐘
      </p>
    </div>
  );
}
