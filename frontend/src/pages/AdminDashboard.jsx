import React from 'react';
import { useApp } from '../context/AppContext';
import { ShieldCheck, Users, DollarSign, Package, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function AdminDashboard() {
  const { products, farmers, orders } = useApp();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="bg-white dark:bg-zinc-900 p-6 sm:p-8 rounded-3xl border border-emerald-100 dark:border-zinc-800 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg">
              ⚙️
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-serif font-black text-zinc-900 dark:text-zinc-100">Admin Control Panel</h1>
              <p className="text-xs text-zinc-500">Platform Analytics, Farmer Verifications, Orders & Revenue Control</p>
            </div>
          </div>
          <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold px-3 py-1 rounded-full">
            System Status: 100% Operational
          </span>
        </div>

        {/* Admin Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-emerald-100 dark:border-zinc-800 shadow-sm space-y-2">
            <div className="flex justify-between items-center text-zinc-400">
              <span className="text-xs font-bold uppercase tracking-wider">Total Revenue</span>
              <DollarSign className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="text-3xl font-black text-zinc-900 dark:text-zinc-100">₹8,42,500</div>
            <span className="text-xs text-emerald-600 font-semibold">+24% this month</span>
          </div>

          <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-emerald-100 dark:border-zinc-800 shadow-sm space-y-2">
            <div className="flex justify-between items-center text-zinc-400">
              <span className="text-xs font-bold uppercase tracking-wider">Active Farmers</span>
              <Users className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="text-3xl font-black text-zinc-900 dark:text-zinc-100">1,240</div>
            <span className="text-xs text-emerald-600 font-semibold">18 pending verification</span>
          </div>

          <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-emerald-100 dark:border-zinc-800 shadow-sm space-y-2">
            <div className="flex justify-between items-center text-zinc-400">
              <span className="text-xs font-bold uppercase tracking-wider">Total Products</span>
              <Package className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="text-3xl font-black text-zinc-900 dark:text-zinc-100">{products.length} listed</div>
            <span className="text-xs text-emerald-600 font-semibold">Across 35+ categories</span>
          </div>

          <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-emerald-100 dark:border-zinc-800 shadow-sm space-y-2">
            <div className="flex justify-between items-center text-zinc-400">
              <span className="text-xs font-bold uppercase tracking-wider">Daily Orders</span>
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="text-3xl font-black text-zinc-900 dark:text-zinc-100">312 / day</div>
            <span className="text-xs text-emerald-600 font-semibold">99.4% on-time delivery</span>
          </div>
        </div>

        {/* Farmers Verification Table */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-emerald-100 dark:border-zinc-800 shadow-sm space-y-6">
          <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">Farmer Verification & KYC Requests</h3>
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800 text-xs">
            {farmers.map((f) => (
              <div key={f.id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <img src={f.avatar} alt={f.name} className="w-12 h-12 rounded-full object-cover border-2 border-emerald-500" />
                  <div>
                    <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{f.name} ({f.farmName})</h4>
                    <p className="text-zinc-400">{f.location} • Joined {f.joinedDate}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full font-bold">KYC Verified</span>
                  <button className="bg-emerald-600 text-white px-4 py-2 rounded-xl font-bold">View Profile</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
