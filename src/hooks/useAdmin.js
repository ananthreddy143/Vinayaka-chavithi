import { useState, useEffect, useCallback } from 'react';

const ADMIN_KEY = 'vc_admin_session';
const ADMIN_PASSWORD_KEY = 'vc_admin_pw_hash';
const ADMIN_SALT_KEY = 'vc_admin_pw_salt';
const DEFAULT_PASSWORD = 'bappa2026';

// ============================================================
// Password hashing using the browser's built-in Web Crypto API
// (SHA-256 + per-install random salt). The raw password is never
// stored — only the salted hash lives in localStorage.
// ============================================================

function bufToHex(buf) {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

async function hashPassword(password, salt) {
  const enc = new TextEncoder();
  const data = enc.encode(salt + ':' + password);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return bufToHex(digest);
}

function genSalt() {
  const arr = new Uint8Array(16);
  crypto.getRandomValues(arr);
  return bufToHex(arr);
}

// Returns { hash, salt } for the currently stored password, or
// initializes (and persists) the default password hash on first run.
async function getStoredHash() {
  let hash, salt;
  try {
    hash = localStorage.getItem(ADMIN_PASSWORD_KEY);
    salt = localStorage.getItem(ADMIN_SALT_KEY);
  } catch { /* ignore */ }

  if (!hash || !salt) {
    // First run: hash the default password and persist.
    salt = genSalt();
    hash = await hashPassword(DEFAULT_PASSWORD, salt);
    try {
      localStorage.setItem(ADMIN_SALT_KEY, salt);
      localStorage.setItem(ADMIN_PASSWORD_KEY, hash);
    } catch { /* ignore */ }
  }
  return { hash, salt };
}

// Ensure the default hash is seeded immediately (non-blocking).
// We kick this off so the first login attempt doesn't wait.
let seedPromise = null;
function ensureSeeded() {
  if (!seedPromise) seedPromise = getStoredHash();
  return seedPromise;
}
ensureSeeded();

export function useAdmin() {
  const [isAdmin, setIsAdmin] = useState(() => {
    try {
      return localStorage.getItem(ADMIN_KEY) === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      if (isAdmin) localStorage.setItem(ADMIN_KEY, 'true');
      else localStorage.removeItem(ADMIN_KEY);
    } catch { /* ignore */ }
  }, [isAdmin]);

  // Window storage event syncs logout across tabs.
  useEffect(() => {
    const handler = (e) => {
      if (e.key === ADMIN_KEY) {
        setIsAdmin(e.newValue === 'true');
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  const login = useCallback(async (password) => {
    const { hash, salt } = await ensureSeeded();
    const inputHash = await hashPassword(password, salt);
    if (inputHash === hash) {
      setIsAdmin(true);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => setIsAdmin(false), []);

  const changePassword = useCallback(async (oldPw, newPw) => {
    if (!newPw || newPw.length < 4) return false;
    const { hash, salt } = await ensureSeeded();
    const oldHash = await hashPassword(oldPw, salt);
    if (oldHash !== hash) return false;
    // Generate a fresh salt for the new password.
    const newSalt = genSalt();
    const newHash = await hashPassword(newPw, newSalt);
    try {
      localStorage.setItem(ADMIN_SALT_KEY, newSalt);
      localStorage.setItem(ADMIN_PASSWORD_KEY, newHash);
    } catch { /* ignore */ }
    return true;
  }, []);

  return { isAdmin, login, logout, changePassword };
}
