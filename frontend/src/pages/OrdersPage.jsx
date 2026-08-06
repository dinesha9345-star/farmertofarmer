import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { Package, Truck, Download, RefreshCcw } from 'lucide-react';
import { toast } from 'sonner';
import api from '../lib/api';

export default function OrdersPage() {
  const { orders, loadOrders } = useApp();
  const [busy, setBusy] = useState(false);

  useEffect(() => { loadOrders(); }, [loadOrders]);

  const cancelOrder = async (orderId) => {
    setBusy(true);
    try {
      await api.post(`/orders/${orderId}/cancel`);
      await loadOrders();
      toast.info(`Order #${orderId} cancelled`);
    } catch (_) { toast.error('Could not cancel'); }
    finally { setBusy(false); }
  };

  const downloadInvoice = (order) => {
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>Invoice ${order.id}</title>
      <style>body{font-family:system-ui,sans-serif;padding:40px;color:#1b2a17}
      h1{color:#065f46}table{width:100%;border-collapse:collapse;margin-top:20px}
      th,td{padding:10px;border-bottom:1px solid #ccc;text-align:left}
      .total{font-weight:800;font-size:1.2em;color:#065f46}</style></head><body>
      <h1>Farm2Home — Invoice</h1><p><b>Order:</b> ${order.id}</p>
      <p><b>Date:</b> ${order.date}</p><p><b>Ship to:</b> ${order.deliveryAddress}</p>
      <p><b>Farmer:</b> ${order.farmerName || ''}</p>
      <table><thead><tr><th>Item</th><th>Qty</th><th>Price</th><th>Subtotal</th></tr></thead>
      <tbody>${(order.items || []).map((i) => `<tr><td>${i.name}</td><td>${i.quantity}</td><td>₹${i.price}</td><td>₹${i.price * i.quantity}</td></tr>`).join('')}</tbody></table>
      <p class="total">Total: ₹${order.totalAmount}</p>
      <p style="margin-top:40px;color:#5c7153">Payment: ${order.paymentMethod?.toUpperCase()} • ${order.paymentStatus}</p>
      </body></html>`;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `farm2home-invoice-${order.id}.html`; a.click();
    URL.revokeObjectURL(url);
    toast.success(`Invoice for #${order.id} downloaded`);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-serif font-black text-zinc-900 dark:text-zinc-100">My Orders & Tracking</h1>
            <p className="text-xs text-zinc-500 mt-1">Track direct farm dispatches, view invoices, and manage purchases</p>
          </div>
          <button onClick={loadOrders} className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1"><RefreshCcw className="w-3.5 h-3.5" /> Refresh</button>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-12 text-center border border-zinc-200 dark:border-zinc-800 space-y-3" data-testid="no-orders">
            <Package className="w-12 h-12 text-zinc-400 mx-auto" />
            <h3 className="font-bold text-base">No orders yet</h3>
            <p className="text-xs text-zinc-400">Place your first order to see live tracking and invoices here.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((ord) => (
              <div key={ord.id} className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-emerald-100 dark:border-zinc-800 shadow-sm space-y-6" data-testid={`order-card-${ord.id}`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-zinc-100 dark:border-zinc-800 gap-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="font-black text-base text-zinc-900 dark:text-zinc-100">Order #{ord.id}</span>
                      <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${ord.status === 'Delivered' ? 'bg-emerald-100 text-emerald-800' : ord.status === 'Cancelled' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'}`}>
                        {ord.status}
                      </span>
                    </div>
                    <span className="text-xs text-zinc-400 mt-1 block">Placed on {ord.date} • Farmer: {ord.farmerName}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => downloadInvoice(ord)} className="bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-4 py-2 rounded-xl text-xs font-bold border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition flex items-center gap-1.5" data-testid={`download-invoice-${ord.id}`}>
                      <Download className="w-3.5 h-3.5" /><span>Invoice</span>
                    </button>
                    {ord.status === 'Pending' && (
                      <button onClick={() => cancelOrder(ord.id)} disabled={busy} className="bg-rose-50 text-rose-600 px-4 py-2 rounded-xl text-xs font-bold hover:bg-rose-100 transition disabled:opacity-50" data-testid={`cancel-order-${ord.id}`}>
                        Cancel
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  {(ord.items || []).map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs">
                      <div>
                        <span className="font-bold text-zinc-800 dark:text-zinc-200">{item.name}</span>
                        <span className="text-zinc-400 ml-2">x {item.quantity}</span>
                      </div>
                      <span className="font-bold text-zinc-900 dark:text-zinc-100">₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>

                <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/30 rounded-2xl border border-emerald-100 dark:border-emerald-900/50 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center"><Truck className="w-5 h-5 animate-pulse" /></div>
                    <div>
                      <span className="font-bold text-zinc-900 dark:text-zinc-100 block">Live Transit Status</span>
                      <span className="text-zinc-500">{ord.estimatedArrival} • {ord.deliveryAddress}</span>
                    </div>
                  </div>
                  <div className="text-right font-bold text-emerald-700 dark:text-emerald-400">
                    Total: ₹{ord.totalAmount} ({ord.paymentMethod?.toUpperCase()})
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
