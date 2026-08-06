import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Leaf, Lock, Mail } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const quickLogin = (e, p) => { setEmail(e); setPassword(p); };

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setError('');
    try {
      const u = await login(email, password);
      if (u.role === 'farmer') navigate('/farmer-dashboard');
      else if (u.role === 'admin') navigate('/admin-dashboard');
      else navigate(from === '/login' ? '/' : from);
    } catch (err) {
      setError(err.message);
    } finally { setBusy(false); }
  };

  return (
    <div className="min-h-[85vh] bg-gradient-to-br from-emerald-50 via-amber-50 to-white dark:from-zinc-950 dark:to-zinc-900 flex items-center justify-center py-16 px-4">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl border border-emerald-100 dark:border-zinc-800 shadow-xl p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center"><Leaf className="w-5 h-5" /></div>
          <div>
            <h1 className="text-xl font-serif font-black text-zinc-900 dark:text-zinc-100">Welcome Back</h1>
            <p className="text-xs text-zinc-500">Sign in to Farm2Home</p>
          </div>
        </div>

        <form onSubmit={submit} className="space-y-4" data-testid="login-form">
          <div>
            <label className="text-xs font-bold text-zinc-500 uppercase block mb-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 w-4 h-4 text-zinc-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-zinc-100 dark:bg-zinc-800 pl-10 pr-3 py-3 rounded-xl text-sm border border-transparent focus:border-emerald-500 outline-none"
                placeholder="you@example.com"
                data-testid="login-email"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-zinc-500 uppercase block mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 w-4 h-4 text-zinc-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-zinc-100 dark:bg-zinc-800 pl-10 pr-3 py-3 rounded-xl text-sm border border-transparent focus:border-emerald-500 outline-none"
                placeholder="••••••••"
                data-testid="login-password"
              />
            </div>
          </div>

          {error && <div className="text-xs text-rose-600 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 p-2.5 rounded-lg" data-testid="login-error">{error}</div>}

          <button type="submit" disabled={busy}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl shadow-lg disabled:opacity-50 transition text-sm"
            data-testid="login-submit"
          >
            {busy ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 space-y-2">
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider text-center">Quick demo access</p>
          <div className="grid grid-cols-3 gap-2 text-[11px]">
            <button onClick={() => quickLogin('customer@farm2home.com', 'customer123')} className="px-2 py-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold hover:bg-emerald-100" data-testid="quick-customer">🛒 Customer</button>
            <button onClick={() => quickLogin('ramesh@farm2home.com', 'farmer123')} className="px-2 py-2 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-bold hover:bg-amber-100" data-testid="quick-farmer">🌾 Farmer</button>
            <button onClick={() => quickLogin('admin@farm2home.com', 'Farm2Home@2026')} className="px-2 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 font-bold hover:bg-zinc-200" data-testid="quick-admin">⚙️ Admin</button>
          </div>
        </div>

        <p className="mt-6 text-xs text-center text-zinc-500">
          New to Farm2Home?{' '}
          <Link to="/register" className="text-emerald-600 font-bold hover:underline" data-testid="goto-register">Create an account</Link>
        </p>
      </div>
    </div>
  );
}
