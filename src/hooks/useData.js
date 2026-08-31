import { useEffect, useState, useSyncExternalStore } from 'react';
import * as dataService from '@/services/dataService';

// Subscribe to dataService changes and re-render on any mutation.
export function useStore() {
  return useSyncExternalStore(
    dataService.subscribe,
    () => JSON.stringify({
      donations: dataService.getDonations(),
      expenses: dataService.getExpenses(),
      stats: dataService.getStats(),
      settings: dataService.getSettings(),
      donors: dataService.getDonors(),
      trend: dataService.getDailyTrend(),
    }),
    () => ''
  );
}

// A lighter hook: get a snapshot + forceUpdate on change.
export function useData() {
  const [, force] = useState(0);
  useEffect(() => dataService.subscribe(() => force((n) => n + 1)), []);
  return {
    donations: dataService.getDonations(),
    expenses: dataService.getExpenses(),
    stats: dataService.getStats(),
    settings: dataService.getSettings(),
    donors: dataService.getDonors(),
    trend: dataService.getDailyTrend(),
  };
}

// Animated number counter
export function useAnimatedNumber(target, duration = 800) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let start = null;
    const from = value;
    const diff = target - from;
    if (diff === 0) return;
    let raf;
    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(from + diff * eased);
      if (progress < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, duration]);
  return value;
}

export function formatCurrency(amount, currency = '₹') {
  const n = Math.round(Number(amount) || 0);
  return currency + n.toLocaleString('en-IN');
}

export function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}
