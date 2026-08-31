import { useState } from 'react';
import { useAdmin } from '@/hooks/useAdmin';
import Modal from '@/components/Modal';
import { Shield, Lock, LogOut, KeyRound, Eye, EyeOff, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

// Login modal — shown when a viewer clicks "Admin Login" in the topbar.
export function AdminLoginModal({ open, onClose }) {
  const { login } = useAdmin();
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const ok = await login(password);
    setLoading(false);
    if (ok) {
      setPassword('');
      setError(false);
      onClose();
    } else {
      setError(true);
    }
  };

  const handleClose = () => {
    setPassword('');
    setError(false);
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose} title="Admin Login" maxWidth="max-w-sm">
      <div className="text-center mb-5">
        <div className="w-14 h-14 rounded-2xl gradient-bg flex items-center justify-center text-white mx-auto mb-3 shadow-lg animate-pulseGlow">
          <Shield size={26} />
        </div>
        <p className="text-sm text-[var(--text-secondary)]">
          Enter the admin password to add, edit, and delete data.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label-field">Admin Password</label>
          <div className="relative">
            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(false); }}
              className="input-field pl-10 pr-10"
              placeholder="Enter password"
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShowPw((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              aria-label="Toggle password visibility"
            >
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {error && (
            <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
              <AlertCircle size={13} /> Incorrect password. Please try again.
            </p>
          )}
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full inline-flex items-center justify-center gap-2 disabled:opacity-60">
          {loading ? <Loader2 size={16} className="animate-spin" /> : null}
          {loading ? 'Verifying...' : 'Login'}
        </button>
      </form>
      <p className="text-xs text-[var(--text-muted)] text-center mt-4">
        Default password is <span className="font-mono font-semibold">bappa2026</span> — change it in Settings after logging in.
      </p>
    </Modal>
  );
}

// Compact admin badge + logout shown in the topbar when logged in.
export function AdminBadge({ onLogout }) {
  return (
    <div className="flex items-center gap-2">
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-300">
        <Shield size={13} /> Admin
      </span>
      <button
        onClick={onLogout}
        className="btn-ghost inline-flex items-center gap-1.5 text-sm px-3 py-1.5"
        title="Logout"
      >
        <LogOut size={15} /> <span className="hidden sm:inline">Logout</span>
      </button>
    </div>
  );
}

// Change-password panel used in Settings.
export function ChangePasswordPanel() {
  const { changePassword } = useAdmin();
  const [oldPw, setOldPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [result, setResult] = useState(null); // { ok, msg }
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const ok = await changePassword(oldPw, newPw);
    setLoading(false);
    if (ok) {
      setResult({ ok: true, msg: 'Password changed successfully.' });
      setOldPw('');
      setNewPw('');
    } else {
      setResult({ ok: false, msg: 'Current password is incorrect or new password is too short (min 4 chars).' });
    }
    setTimeout(() => setResult(null), 4000);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label-field">Current Password</label>
          <input type="password" value={oldPw} onChange={(e) => setOldPw(e.target.value)} className="input-field" required />
        </div>
        <div>
          <label className="label-field">New Password</label>
          <input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} className="input-field" required minLength="4" />
        </div>
      </div>
      <button type="submit" disabled={loading} className="btn-primary inline-flex items-center gap-2 disabled:opacity-60">
        {loading ? <Loader2 size={16} className="animate-spin" /> : <KeyRound size={16} />}
        {loading ? 'Updating...' : 'Update Password'}
      </button>
      {result && (
        <div className={`flex items-center gap-2 p-3 rounded-xl text-sm animate-scaleIn ${
          result.ok
            ? 'bg-green-50 text-green-700 border border-green-300'
            : 'bg-red-50 text-red-700 border border-red-300'
        }`}>
          {result.ok ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <p>{result.msg}</p>
        </div>
      )}
    </form>
  );
}
