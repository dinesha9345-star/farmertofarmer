import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Leaf, User, Mail, Lock, Phone, MapPin, Sprout } from 'lucide-react';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', email: '', password: '', role: 'customer',
    phone: '', location: '', farmName: '',
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setError('');
    try {
      const u = await register(form);
      if (u.role === 'farmer') navigate('/farmer-dashboard');
      else navigate('/');
    } catch (err) {
      setError(err.message);
    } finally { setBusy(false); }
  };

  return (
    <div className="min-h-[85vh] bg-gradient-to-br from-emerald-50 via-amber-50 to-white dark:from-zinc-950 dark:to-zinc-900 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl border border-emerald-100 dark:border-zinc-800 shadow-xl p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center"><Leaf className="w-5 h-5" /></div>
          <div>
            <h1 className="text-xl font-serif font-black text-zinc-900 dark:text-zinc-100">Join Farm2Home</h1>
            <p className="text-xs text-zinc-500">Buy directly from farmers or start selling your harvest</p>
          </div>
        </div>

        {/* Role Selector */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <button type="button" onClick={() => setForm({ ...form, role: 'customer' })}
            className={`p-3 rounded-2xl border-2 text-left transition ${form.role === 'customer' ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40' : 'border-zinc-200 dark:border-zinc-800'}`}
            data-testid="role-customer"
          >
            <div className="font-bold text-sm">🛒 I'm a Customer</div>
            <div className="text-[10px] text-zinc-500 mt-0.5">Buy fresh from farmers</div>
          </button>
          <button type="button" onClick={() => setForm({ ...form, role: 'farmer' })}
            className={`p-3 rounded-2xl border-2 text-left transition ${form.role === 'farmer' ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40' : 'border-zinc-200 dark:border-zinc-800'}`}
            data-testid="role-farmer"
          >
            <div className="font-bold text-sm">🌾 I'm a Farmer</div>
            <div className="text-[10px] text-zinc-500 mt-0.5">Sell your harvest</div>
          </button>
        </div>

        <form onSubmit={submit} className="space-y-3" data-testid="register-form">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Full Name" icon={User} value={form.name} onChange={(v) => setForm({ ...form, name: v })} testid="reg-name" required />
            <Field label="Email" type="email" icon={Mail} value={form.email} onChange={(v) => setForm({ ...form, email: v })} testid="reg-email" required />
          </div>
          <Field label="Password" type="password" icon={Lock} value={form.password} onChange={(v) => setForm({ ...form, password: v })} testid="reg-password" required />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Phone" icon={Phone} value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} testid="reg-phone" />
            <Field label="Location (City, State)" icon={MapPin} value={form.location} onChange={(v) => setForm({ ...form, location: v })} testid="reg-location" />
          </div>
          {form.role === 'farmer' && (
            <Field label="Farm Name" icon={Sprout} value={form.farmName} onChange={(v) => setForm({ ...form, farmName: v })} testid="reg-farm" />
          )}

          {error && <div className="text-xs text-rose-600 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 p-2.5 rounded-lg" data-testid="register-error">{error}</div>}

          <button type="submit" disabled={busy}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl shadow-lg disabled:opacity-50 transition text-sm"
            data-testid="register-submit"
          >
            {busy ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className="mt-4 text-xs text-center text-zinc-500">
          Already have an account?{' '}
          <Link to="/login" className="text-emerald-600 font-bold hover:underline" data-testid="goto-login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

function Field({ label, icon: Icon, value, onChange, type = 'text', testid, required = false }) {
  return (
    <div>
      <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">{label}</label>
      <div className="relative">
        {Icon && <Icon className="absolute left-3 top-3 w-4 h-4 text-zinc-400" />}
        <input
          type={type}
          required={required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full bg-zinc-100 dark:bg-zinc-800 ${Icon ? 'pl-10' : 'pl-3'} pr-3 py-2.5 rounded-xl text-sm border border-transparent focus:border-emerald-500 outline-none`}
          data-testid={testid}
        />
      </div>
    </div>
  );
}
