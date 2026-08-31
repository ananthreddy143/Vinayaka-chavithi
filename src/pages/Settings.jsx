import { useState } from 'react';
import { useData } from '@/hooks/useData';
import { useAdmin } from '@/hooks/useAdmin';
import {
  updateSettings, clearAllData,
  getSheetsConfig, setSheetsUrl, setSheetsConnected,
  testSheetsConnection, pullFromSheets,
} from '@/services/dataService';
import { PageHeader } from '@/components/ui';
import { ChangePasswordPanel } from '@/components/AdminAuth';
import {
  Settings as SettingsIcon, Save, RotateCcw, CheckCircle2, Info,
  Sheet, Link2, Unlink, Loader2, AlertCircle, Cloud, CloudOff, RefreshCw,
  KeyRound, Lock,
} from 'lucide-react';

export default function Settings() {
  const { settings } = useData();
  const { isAdmin } = useAdmin();
  const [form, setForm] = useState(settings);
  const [saved, setSaved] = useState(false);

  // Google Sheets integration state
  const sheetsCfg = getSheetsConfig();
  const [sheetsUrlInput, setSheetsUrlInput] = useState(sheetsCfg.url);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null); // { ok, msg }
  const [syncing, setSyncing] = useState(false);

  const handleChange = (field) => (e) => {
    const val = e.target.value;
    setForm((f) => ({ ...f, [field]: field === 'targetAmount' ? Number(val) : val }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    updateSettings(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleClearAll = () => {
    if (confirm('Clear ALL local donations and expenses? This cannot be undone.')) {
      clearAllData();
      setForm({ ...settings });
    }
  };

  const handleTestConnect = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      await testSheetsConnection(sheetsUrlInput.trim());
      setSheetsUrl(sheetsUrlInput.trim());
      setSheetsConnected(true);
      setTestResult({ ok: true, msg: 'Connected! Data will sync to your Google Sheet.' });
    } catch (e) {
      setSheetsConnected(false);
      setTestResult({ ok: false, msg: e.message || 'Connection failed. Check the URL.' });
    } finally {
      setTesting(false);
    }
  };

  const handleDisconnect = () => {
    setSheetsConnected(false);
    setTestResult({ ok: true, msg: 'Disconnected. Data now stays in your browser only.' });
  };

  const handleSyncNow = async () => {
    setSyncing(true);
    const ok = await pullFromSheets();
    setSyncing(false);
    setTestResult({
      ok,
      msg: ok ? 'Synced from Google Sheets.' : 'Sync failed. Check your connection.',
    });
  };

  return (
    <div className="px-4 lg:px-6 py-6 max-w-3xl mx-auto">
      <PageHeader
        title="Settings"
        subtitle="Festival details, donation goal & Google Sheets sync"
        icon={<SettingsIcon size={20} />}
      />

      {saved && (
        <div className="glass-card p-4 mb-6 animate-scaleIn border-green-300">
          <div className="flex items-center gap-3">
            <CheckCircle2 size={20} className="text-green-600 shrink-0" />
            <p className="text-sm font-semibold text-[var(--text-primary)]">Settings saved successfully.</p>
          </div>
        </div>
      )}

      {/* Festival details */}
      <form onSubmit={handleSave} className="glass-card p-6 space-y-5 animate-fadeInUp">
        <div>
          <h3 className="font-display font-semibold text-lg text-[var(--text-primary)] mb-4">Festival Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="label-field">Festival Name</label>
              <input type="text" value={form.festivalName} onChange={handleChange('festivalName')} className="input-field" disabled={!isAdmin} />
            </div>
            <div className="sm:col-span-2">
              <label className="label-field">Committee Name</label>
              <input type="text" value={form.committeeName} onChange={handleChange('committeeName')} className="input-field" placeholder="Your committee or organization name" disabled={!isAdmin} />
            </div>
            <div>
              <label className="label-field">Location</label>
              <input type="text" value={form.location} onChange={handleChange('location')} className="input-field" placeholder="City, State" disabled={!isAdmin} />
            </div>
            <div>
              <label className="label-field">Currency Symbol</label>
              <input type="text" value={form.currency} onChange={handleChange('currency')} className="input-field" maxLength="3" disabled={!isAdmin} />
            </div>
            <div>
              <label className="label-field">Festival Start Date</label>
              <input type="date" value={form.startDate} onChange={handleChange('startDate')} className="input-field" disabled={!isAdmin} />
            </div>
            <div>
              <label className="label-field">Festival End Date</label>
              <input type="date" value={form.endDate} onChange={handleChange('endDate')} className="input-field" disabled={!isAdmin} />
            </div>
          </div>
        </div>

        <div className="border-t border-[var(--border-color)] pt-5">
          <h3 className="font-display font-semibold text-lg text-[var(--text-primary)] mb-4">Donation Goal</h3>
          <div>
            <label className="label-field">Target Amount ({form.currency})</label>
            <input type="number" min="1" value={form.targetAmount} onChange={handleChange('targetAmount')} className="input-field" disabled={!isAdmin} />
            <p className="text-xs text-[var(--text-muted)] mt-2">
              The goal progress bar on the dashboard and transparency page is calculated from this target.
            </p>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          {isAdmin ? (
            <button type="submit" className="btn-primary inline-flex items-center gap-2">
              <Save size={17} /> Save Settings
            </button>
          ) : (
            <p className="text-xs text-[var(--text-muted)] inline-flex items-center gap-1.5">
              <Lock size={13} /> Login as admin to edit settings.
            </p>
          )}
        </div>
      </form>

      {/* Admin: change password */}
      {isAdmin && (
        <div className="glass-card p-6 mt-6 animate-fadeInUp stagger-2">
          <div className="flex items-center gap-2 mb-4">
            <KeyRound size={20} className="text-[var(--saffron-600)]" />
            <h3 className="font-display font-semibold text-lg text-[var(--text-primary)]">Change Admin Password</h3>
          </div>
          <ChangePasswordPanel />
        </div>
      )}

      {/* Google Sheets integration */}
      <div className="glass-card p-6 mt-6 animate-fadeInUp stagger-1">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sheet size={20} className="text-green-600" />
            <h3 className="font-display font-semibold text-lg text-[var(--text-primary)]">Google Sheets Integration</h3>
          </div>
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
            sheetsCfg.connected
              ? 'bg-green-100 text-green-700 border border-green-300'
              : 'bg-gray-100 text-gray-500 border border-gray-300'
          }`}>
            {sheetsCfg.connected ? <Cloud size={13} /> : <CloudOff size={13} />}
            {sheetsCfg.connected ? 'Connected' : 'Not connected'}
          </span>
        </div>

        {/* Setup instructions */}
        <div className="flex items-start gap-3 p-4 rounded-xl bg-[var(--bg-glass)] mb-4">
          <Info size={18} className="text-[var(--saffron-600)] shrink-0 mt-0.5" />
          <div className="text-xs text-[var(--text-secondary)] leading-relaxed space-y-1.5">
            <p className="font-semibold text-[var(--text-primary)]">How to connect:</p>
            <p>1. Create a Google Sheet, then open <strong>Extensions → Apps Script</strong>.</p>
            <p>2. Paste the code from the <code className="px-1 py-0.5 rounded bg-[var(--bg-elevated)]">google-apps-script/Code.gs</code> file in this project.</p>
            <p>3. Click <strong>Deploy → New deployment → Web app</strong>, set access to <strong>Anyone</strong>, and authorize.</p>
            <p>4. Copy the deployment URL (ends in <code>/exec</code>) and paste it below.</p>
          </div>
        </div>

        {/* URL input + connect */}
        <label className="label-field">Google Apps Script Web App URL</label>
        <div className="flex flex-col sm:flex-row gap-2 mb-3">
          <input
            type="url"
            value={sheetsUrlInput}
            onChange={(e) => setSheetsUrlInput(e.target.value)}
            placeholder="https://script.google.com/macros/s/AKfy.../exec"
            className="input-field flex-1"
            disabled={!isAdmin}
          />
          {!sheetsCfg.connected ? (
            <button
              onClick={handleTestConnect}
              disabled={testing || !sheetsUrlInput.trim() || !isAdmin}
              className="btn-primary inline-flex items-center justify-center gap-2 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {testing ? <Loader2 size={16} className="animate-spin" /> : <Link2 size={16} />}
              {testing ? 'Testing...' : 'Test & Connect'}
            </button>
          ) : (
            <button
              onClick={handleDisconnect}
              disabled={!isAdmin}
              className="btn-ghost inline-flex items-center justify-center gap-2 shrink-0 text-red-600 border-red-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Unlink size={16} /> Disconnect
            </button>
          )}
        </div>

        {isAdmin && (
          <p className="text-xs text-[var(--text-muted)] mb-3 inline-flex items-center gap-1">
            <Lock size={12} /> Only admin can connect or disconnect.
          </p>
        )}

        {/* Sync now button when connected */}
        {sheetsCfg.connected && (
          <button
            onClick={handleSyncNow}
            disabled={syncing}
            className="btn-ghost inline-flex items-center gap-2 text-sm mb-3"
          >
            {syncing ? <Loader2 size={15} className="animate-spin" /> : <RefreshCw size={15} />}
            {syncing ? 'Syncing...' : 'Sync from Sheets now'}
          </button>
        )}

        {/* Test result feedback */}
        {testResult && (
          <div className={`flex items-start gap-2 p-3 rounded-xl text-sm animate-scaleIn ${
            testResult.ok
              ? 'bg-green-50 text-green-700 border border-green-300'
              : 'bg-red-50 text-red-700 border border-red-300'
          }`}>
            {testResult.ok ? <CheckCircle2 size={16} className="shrink-0 mt-0.5" /> : <AlertCircle size={16} className="shrink-0 mt-0.5" />}
            <p>{testResult.msg}</p>
          </div>
        )}

        {/* What syncs */}
        <div className="mt-4 pt-4 border-t border-[var(--border-color)]">
          <p className="text-xs text-[var(--text-muted)] leading-relaxed">
            When connected, every donation and expense you add is automatically pushed to your Google Sheet,
            and you can pull the latest data anytime. Your data also stays cached locally in your browser
            so the app works even if the sheet is temporarily unreachable.
          </p>
        </div>
      </div>

      {/* Data management */}
      <div className="glass-card p-6 mt-6 animate-fadeInUp stagger-2">
        <h3 className="font-display font-semibold text-lg text-[var(--text-primary)] mb-2">Data Management</h3>
        <div className="flex items-start gap-3 p-4 rounded-xl bg-[var(--bg-glass)] mb-4">
          <Info size={18} className="text-[var(--saffron-600)] shrink-0 mt-0.5" />
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            Your data is stored locally in your browser{sheetsCfg.connected ? ' and synced to Google Sheets when connected' : ''}.
            Use the button below to clear all local data and start fresh.
          </p>
        </div>
        <button
          onClick={handleClearAll}
          disabled={!isAdmin}
          className="btn-ghost inline-flex items-center gap-2 text-sm text-red-600 border-red-300 hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <RotateCcw size={15} /> Clear All Local Data
        </button>
        {!isAdmin && (
          <p className="text-xs text-[var(--text-muted)] mt-2 inline-flex items-center gap-1">
            <Lock size={12} /> Requires admin login.
          </p>
        )}
      </div>
    </div>
  );
}
