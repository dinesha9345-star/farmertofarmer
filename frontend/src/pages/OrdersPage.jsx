import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Package, Truck, Download, CheckCircle2, Clock, Star, MapPin } from 'lucide-react';
import { toast } from 'sonner';

export default function OrdersPage() {
  const { orders, setOrders } = useApp();
  const [selectedOrder, setSelectedOrder] = useState(null);

  const cancelOrder = (orderId) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'Cancelled' } : o));
    toast.info(`Order #${orderId} has been cancelled.`);
  };

  const downloadInvoice = (order) => {
    toast.success(`Invoice for #${order.id} downloaded successfully!`);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-serif font-black text-zinc-900 dark:text-zinc-100">My Orders & Live Tracking</h1>
          <p className="text-xs text-zinc-500 mt-1">Track direct farm dispatches, view invoices, and manage past purchases</p>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-12 text-center border border-zinc-200 dark:border-zinc-800 space-y-3">
            <Package className="w-12 h-12 text-zinc-400 mx-auto" />
            <h3 className="font-bold text-base">No orders placed yet</h3>
            <p className="text-xs text-zinc-400">Once you place an order, live GPS tracking and invoices will appear here.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((ord) => (
              <div key={ord.id} className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-emerald-100 dark:border-zinc-800 shadow-sm space-y-6">
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
                    <button 
                      onClick={() => downloadInvoice(ord)}
                      className="bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-4 py-2 rounded-xl text-xs font-bold border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition flex items-center gap-1.5"
                      data-testid={`download-invoice-${ord.id}`}
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Invoice</span>
                    </button>
                    {ord.status === 'Pending' && (
                      <button 
                        onClick={() => cancelOrder(ord.id)}
                        className="bg-rose-50 text-rose-600 px-4 py-2 rounded-xl text-xs font-bold hover:bg-rose-100 transition"
                      >
                        Cancel Order
                      </button>
                    )}
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-3">
                  {ord.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs">
                      <div>
                        <span className="font-bold text-zinc-800 dark:text-zinc-200">{item.name}</span>
                        <span className="text-zinc-400 ml-2">x {item.quantity}</span>
                      </div>
                      <span className="font-bold text-zinc-900 dark:text-zinc-100">₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>

                {/* GPS Transit Status */}
                <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/30 rounded-2xl border border-emerald-100 dark:border-emerald-900/50 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                      <Truck className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                      <span className="font-bold text-zinc-900 dark:text-zinc-100 block">Live GPS Transit Status</span>
                      <span className="text-zinc-500">{ord.estimatedArrival} • {ord.deliveryAddress}</span>
                    </div>
                  </div>
                  <div className="text-right font-bold text-emerald-700 dark:text-emerald-400">
                    Total: ₹{ord.totalAmount} ({ord.paymentMethod})
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
