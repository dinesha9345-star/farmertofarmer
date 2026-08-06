import React, { useEffect, useState } from 'react';
import { Users, DollarSign, Package, TrendingUp, CheckCircle2 } from 'lucide-react';
import api from '../lib/api';
import { toast } from 'sonner';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ totalUsers: 0, farmers: 0, customers: 0, products: 0, orders: 0, revenue: 0 });
  const [farmers, setFarmers] = useState([]);
  const [allOrders, setAllOrders] = useState([]);

  const load = async () => {
    try {
      const [s, f, o] = await Promise.all([
        api.get('/admin/stats').then((r) => r.data),
        api.get('/admin/farmers').then((r) => r.data),
        api.get('/orders').then((r) => r.data),
      ]);
      setStats(s);
      setFarmers(f);
      setAllOrders(o);
    } catch (e) {
      toast.error('Failed to load admin data');
    }
  };

  useEffect(() => { load(); }, []);

  const verifyFarmer = async (fid) => {
    try {
      await api.post(`/admin/verify-farmer/${fid}`);
      await load();
      toast.success('Farmer verified');
    } catch (_) { toast.error('Failed to verify'); }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="bg-white dark:bg-zinc-900 p-6 sm:p-8 rounded-3xl border border-emerald-100 dark:border-zinc-800 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg">⚙️</div>
            <div>
              <h1 className="text-xl sm:text-2xl font-serif font-black text-zinc-900 dark:text-zinc-100">Admin Control Panel</h1>
              <p className="text-xs text-zinc-500">Platform Analytics, Verifications & Revenue</p>
            </div>
          </div>
          <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold px-3 py-1 rounded-full">System Status: 100% Operational</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Stat icon={DollarSign} label="Total Revenue" value={`₹${Number(stats.revenue || 0).toLocaleString('en-IN')}`} sub="from paid orders" testid="stat-revenue" />
          <Stat icon={Users} label="Verified Farmers" value={stats.farmers} sub={`${stats.customers} customers on platform`} testid="stat-farmers" />
          <Stat icon={Package} label="Products" value={stats.products} sub="live on marketplace" testid="stat-products" />
          <Stat icon={TrendingUp} label="Total Orders" value={stats.orders} sub="all time" testid="stat-orders" />
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-emerald-100 dark:border-zinc-800 shadow-sm space-y-6">
          <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">Farmer Verification & KYC</h3>
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800 text-xs">
            {farmers.length === 0 && <div className="py-4 text-zinc-400 text-center">No farmers registered.</div>}
            {farmers.map((f) => (
              <div key={f.id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row items-center justify-between gap-4" data-testid={`farmer-row-${f.id}`}>
                <div className="flex items-center gap-4">
                  <img src={f.avatar} alt={f.name} className="w-12 h-12 rounded-full object-cover border-2 border-emerald-500" />
                  <div>
                    <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{f.name} <span className="text-zinc-400 font-normal">({f.farmName})</span></h4>
                    <p className="text-zinc-400">{f.location || 'India'} • {f.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {f.verified ? (
                    <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full font-bold flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Verified</span>
                  ) : (
                    <button onClick={() => verifyFarmer(f.id)} className="bg-emerald-600 text-white px-4 py-2 rounded-xl font-bold" data-testid={`verify-${f.id}`}>Verify</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-emerald-100 dark:border-zinc-800 shadow-sm space-y-4">
          <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">Recent Orders</h3>
          <div className="space-y-3 text-xs">
            {allOrders.slice(0, 10).map((o) => (
              <div key={o.id} className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-2" data-testid={`recent-order-${o.id}`}>
                <div>
                  <span className="font-bold text-zinc-800 dark:text-zinc-200">#{o.id}</span>
                  <span className="text-zinc-400 ml-2">{o.userName} • {o.date}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-emerald-600 font-bold">₹{o.totalAmount}</span>
                  <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-bold">{o.status}</span>
                </div>
              </div>
            ))}
            {allOrders.length === 0 && <div className="text-zinc-400">No orders yet.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value, sub, testid }) {
  return (
    <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-emerald-100 dark:border-zinc-800 shadow-sm space-y-2" data-testid={testid}>
      <div className="flex justify-between items-center text-zinc-400">
        <span className="text-xs font-bold uppercase tracking-wider">{label}</span>
        <Icon className="w-5 h-5 text-emerald-600" />
      </div>
      <div className="text-2xl font-black text-zinc-900 dark:text-zinc-100">{value}</div>
      <span className="text-xs text-emerald-600 font-semibold">{sub}</span>
    </div>
  );
}
