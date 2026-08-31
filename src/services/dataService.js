// ============================================================
// dataService.js — Data layer for Vinayaka Chavithi 2026
//
// Storage strategy (dual):
//   1. localStorage — always-on local cache (instant reads/writes,
//      works offline). The app starts EMPTY — no sample data.
//   2. Google Sheets — optional cloud sync. When you provide a
//      Google Apps Script Web App URL in Settings, the service
//      syncs every add/delete/update to your Google Sheet and
//      pulls fresh data on load. While connected, Google Sheets
//      is the source of truth; localStorage is the cache.
//
// To connect Google Sheets:
//   1. Create a Google Sheet with three tabs: Donations, Expenses, Settings.
//   2. Extensions → Apps Script, paste the code from
//      `google-apps-script/Code.gs` in this project, Deploy →
//      New deployment → Web app → "Anyone" access.
//   3. Copy the deployment URL and paste it into Settings →
//      Google Sheets Integration.
// ============================================================

const STORAGE_KEYS = {
  DONATIONS: 'vc_donations',
  EXPENSES: 'vc_expenses',
  SETTINGS: 'vc_settings',
  SHEETS_URL: 'vc_sheets_url',
  SHEETS_CONNECTED: 'vc_sheets_connected',
};

// Start completely empty — no sample/seed data.
const EMPTY_DONATIONS = [];
const EMPTY_EXPENSES = [];

const DEFAULT_SETTINGS = {
  festivalName: 'Vinayaka Chavithi 2026',
  committeeName: '',
  targetAmount: 100000,
  currency: '₹',
  location: '',
  startDate: '',
  endDate: '',
};

// --- Internal storage helpers ---

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch (e) { /* ignore corrupt cache */ }
  return fallback;
}

function save(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) { /* ignore quota errors */ }
}

function genId(prefix) {
  return prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function genReceiptNo() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `VC-${y}${m}${d}-${rand}`;
}

// ============================================================
// Google Sheets sync
// ============================================================

let sheetsUrl = '';
let sheetsConnected = false;
let syncing = false;

function initSheetsConfig() {
  sheetsUrl = load(STORAGE_KEYS.SHEETS_URL, '');
  sheetsConnected = load(STORAGE_KEYS.SHEETS_CONNECTED, false);
}
initSheetsConfig();

export function getSheetsConfig() {
  return { url: sheetsUrl, connected: sheetsConnected };
}

export function setSheetsUrl(url) {
  sheetsUrl = url.trim();
  save(STORAGE_KEYS.SHEETS_URL, sheetsUrl);
}

export function setSheetsConnected(value) {
  sheetsConnected = value;
  save(STORAGE_KEYS.SHEETS_CONNECTED, sheetsConnected);
  listeners.forEach((fn) => fn());
}

async function sheetsRequest(action, payload = {}) {
  if (!sheetsUrl) throw new Error('No Google Sheets URL configured');
  const res = await fetch(sheetsUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ action, ...payload }),
  });
  if (!res.ok) throw new Error(`Sheets sync failed: ${res.status}`);
  const json = await res.json();
  if (!json.ok) throw new Error(json.error || 'Sheets sync error');
  return json;
}

// Push full snapshot to the sheet (used after any local mutation).
async function pushToSheets() {
  if (!sheetsConnected || !sheetsUrl) return;
  const data = getData();
  try {
    await sheetsRequest('sync', {
      donations: data.donations,
      expenses: data.expenses,
      settings: data.settings,
    });
  } catch (e) {
    // Sync errors don't block the UI — data stays in local cache.
    console.warn('Sheets push failed:', e.message);
  }
}

// Pull the full snapshot from the sheet and merge into cache.
export async function pullFromSheets() {
  if (!sheetsUrl) return false;
  syncing = true;
  try {
    const json = await sheetsRequest('get');
    if (json.data) {
      cache = {
        donations: json.data.donations || [],
        expenses: json.data.expenses || [],
        settings: { ...DEFAULT_SETTINGS, ...(json.data.settings || {}) },
      };
      save(STORAGE_KEYS.DONATIONS, cache.donations);
      save(STORAGE_KEYS.EXPENSES, cache.expenses);
      save(STORAGE_KEYS.SETTINGS, cache.settings);
      listeners.forEach((fn) => fn());
      return true;
    }
    return false;
  } catch (e) {
    console.warn('Sheets pull failed:', e.message);
    return false;
  } finally {
    syncing = false;
  }
}

export function isSyncing() {
  return syncing;
}

// Test the connection by asking the sheet for its current data.
export async function testSheetsConnection(url) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ action: 'get' }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  if (!json.ok) throw new Error(json.error || 'Invalid response');
  return json;
}

// ============================================================
// State + subscriptions
// ============================================================

let listeners = [];
let cache = null;

function getData() {
  if (!cache) {
    cache = {
      donations: load(STORAGE_KEYS.DONATIONS, EMPTY_DONATIONS),
      expenses: load(STORAGE_KEYS.EXPENSES, EMPTY_EXPENSES),
      settings: { ...DEFAULT_SETTINGS, ...load(STORAGE_KEYS.SETTINGS, {}) },
    };
  }
  return cache;
}

function persistAndNotify() {
  const data = getData();
  save(STORAGE_KEYS.DONATIONS, data.donations);
  save(STORAGE_KEYS.EXPENSES, data.expenses);
  save(STORAGE_KEYS.SETTINGS, data.settings);
  listeners.forEach((fn) => fn());
  if (sheetsConnected) pushToSheets();
}

export function subscribe(fn) {
  listeners.push(fn);
  return () => { listeners = listeners.filter((f) => f !== fn); };
}

// ============================================================
// Donations
// ============================================================

export function getDonations() {
  return [...getData().donations].sort((a, b) => new Date(b.date) - new Date(a.date));
}

export function addDonation(donation) {
  const data = getData();
  const entry = {
    ...donation,
    id: genId('d'),
    receiptNo: genReceiptNo(),
    amount: Number(donation.amount) || 0,
  };
  data.donations.push(entry);
  persistAndNotify();
  return entry;
}

export function deleteDonation(id) {
  const data = getData();
  data.donations = data.donations.filter((d) => d.id !== id);
  persistAndNotify();
}

// ============================================================
// Expenses
// ============================================================

export function getExpenses() {
  return [...getData().expenses].sort((a, b) => new Date(b.date) - new Date(a.date));
}

export function addExpense(expense) {
  const data = getData();
  const entry = {
    ...expense,
    id: genId('e'),
    amount: Number(expense.amount) || 0,
  };
  data.expenses.push(entry);
  persistAndNotify();
  return entry;
}

export function deleteExpense(id) {
  const data = getData();
  data.expenses = data.expenses.filter((e) => e.id !== id);
  persistAndNotify();
}

// ============================================================
// Settings
// ============================================================

export function getSettings() {
  return { ...getData().settings };
}

export function updateSettings(updates) {
  const data = getData();
  data.settings = { ...data.settings, ...updates };
  persistAndNotify();
  return data.settings;
}

// ============================================================
// Derived / computed stats — recalculated from data every call
// ============================================================

export function getStats() {
  const data = getData();
  const donations = data.donations;
  const expenses = data.expenses;
  const settings = data.settings;

  const totalDonations = donations.reduce((s, d) => s + Number(d.amount), 0);
  const totalExpenses = expenses.reduce((s, e) => s + Number(e.amount), 0);
  const balance = totalDonations - totalExpenses;
  const target = Number(settings.targetAmount) || 1;
  const goalPct = Math.min((totalDonations / target) * 100, 100);

  const today = new Date().toISOString().slice(0, 10);
  const todaysDonations = donations
    .filter((d) => d.date === today)
    .reduce((s, d) => s + Number(d.amount), 0);
  const todaysExpenses = expenses
    .filter((e) => e.date === today)
    .reduce((s, e) => s + Number(e.amount), 0);

  const donorMap = {};
  donations.forEach((d) => {
    const key = d.donorName.trim().toLowerCase();
    if (!donorMap[key]) donorMap[key] = { name: d.donorName, total: 0, count: 0 };
    donorMap[key].total += Number(d.amount);
    donorMap[key].count += 1;
  });
  const donorList = Object.values(donorMap).sort((a, b) => b.total - a.total);
  const donorCount = donorList.length;
  const avgDonation = donorCount > 0 ? totalDonations / donorCount : 0;

  const paymentBreakdown = {};
  donations.forEach((d) => {
    paymentBreakdown[d.paymentMethod] = (paymentBreakdown[d.paymentMethod] || 0) + Number(d.amount);
  });

  const expenseBreakdown = {};
  expenses.forEach((e) => {
    expenseBreakdown[e.category] = (expenseBreakdown[e.category] || 0) + Number(e.amount);
  });

  const recentDonations = [...donations]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 6);
  const recentExpenses = [...expenses]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 6);

  const topContributors = donorList.slice(0, 5);
  const latestDonation = recentDonations[0] || null;

  return {
    totalDonations,
    totalExpenses,
    balance,
    target,
    goalPct,
    donorCount,
    avgDonation,
    todaysDonations,
    todaysExpenses,
    paymentBreakdown,
    expenseBreakdown,
    recentDonations,
    recentExpenses,
    topContributors,
    latestDonation,
    donationCount: donations.length,
    expenseCount: expenses.length,
  };
}

export function getDonors() {
  const data = getData();
  const donorMap = {};
  data.donations.forEach((d) => {
    const key = d.donorName.trim().toLowerCase();
    if (!donorMap[key]) {
      donorMap[key] = {
        name: d.donorName,
        total: 0,
        count: 0,
        phone: d.phone || '',
        paymentMethod: d.paymentMethod,
        purpose: d.purpose,
        lastDate: d.date,
      };
    }
    donorMap[key].total += Number(d.amount);
    donorMap[key].count += 1;
    if (new Date(d.date) > new Date(donorMap[key].lastDate)) {
      donorMap[key].lastDate = d.date;
      donorMap[key].phone = d.phone || donorMap[key].phone;
    }
  });
  return Object.values(donorMap).sort((a, b) => b.total - a.total);
}

export function getDailyTrend(days = 14) {
  const data = getData();
  const today = new Date();
  const daysArr = [];
  for (let i = days - 1; i >= 0; i--) {
    const dt = new Date(today);
    dt.setDate(dt.getDate() - i);
    const ds = dt.toISOString().slice(0, 10);
    const dayDonations = data.donations
      .filter((d) => d.date === ds)
      .reduce((s, d) => s + Number(d.amount), 0);
    const dayExpenses = data.expenses
      .filter((e) => e.date === ds)
      .reduce((s, e) => s + Number(e.amount), 0);
    daysArr.push({
      date: dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
      donations: dayDonations,
      expenses: dayExpenses,
    });
  }
  return daysArr;
}

// Clear all local data (used by Settings → Clear all data).
export function clearAllData() {
  cache = {
    donations: EMPTY_DONATIONS,
    expenses: EMPTY_EXPENSES,
    settings: { ...DEFAULT_SETTINGS },
  };
  persistAndNotify();
}
