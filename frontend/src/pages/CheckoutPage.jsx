import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Truck, CheckCircle2, Lock } from 'lucide-react';
import { toast } from 'sonner';
import api from '../lib/api';

export default function CheckoutPage() {
  const { cart, clearCart, loadOrders } = useApp();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [address, setAddress] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '+91 98765 43210',
    street: 'Flat 402, Green Meadows',
    city: 'Pune',
    state: 'Maharashtra',
    pincode: '411045',
  });
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [isProcessing, setIsProcessing] = useState(false);
  const [couponCode, setCouponCode] = useState('');

  const subtotal = cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  const gst = Math.round(subtotal * 0.05);
  const deliveryFee = subtotal > 500 ? 0 : 49;
  const discount = ['FARM20', 'ORGANIC100'].includes(couponCode.toUpperCase()) ? Math.round(subtotal * 0.15) : 0;
  const total = subtotal + gst + deliveryFee - discount;

  const openRazorpayCheckout = ({ order, razorpayKeyId }) =>
    new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onerror = () => reject(new Error('Failed to load Razorpay'));
      script.onload = () => {
        const options = {
          key: razorpayKeyId,
          amount: Math.round(order.totalAmount * 100),
          currency: 'INR',
          name: 'Farm2Home',
          description: `Order ${order.id}`,
          order_id: order.razorpay_order_id,
          prefill: { name: address.fullName, contact: address.phone, email: user?.email || '' },
          theme: { color: '#059669' },
          handler: async (res) => {
            try {
              await api.post('/orders/razorpay/verify', {
                orderId: order.id,
                razorpay_order_id: res.razorpay_order_id,
                razorpay_payment_id: res.razorpay_payment_id,
                razorpay_signature: res.razorpay_signature,
              });
              resolve(true);
            } catch (e) {
              reject(new Error('Payment verification failed'));
            }
          },
          modal: { ondismiss: () => reject(new Error('Payment cancelled')) },
        };
        new window.Razorpay(options).open();
      };
      document.body.appendChild(script);
    });

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (cart.length === 0) { toast.error('Your cart is empty'); return; }
    setIsProcessing(true);
    try {
      const { data } = await api.post('/orders', {
        address,
        paymentMethod,
        couponCode,
      });
      if (paymentMethod === 'razorpay' && data.order.razorpay_order_id) {
        await openRazorpayCheckout(data);
        toast.success('Payment successful! Order confirmed.');
      } else {
        toast.success('Order placed successfully! Farmer notified.');
      }
      await clearCart();
      await loadOrders();
      navigate('/orders');
    } catch (err) {
      toast.error(err.response?.data?.detail || err.message || 'Failed to place order');
    } finally {
      setIsProcessing(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center py-16 px-4">
        <h2 className="text-xl font-bold text-zinc-700 dark:text-zinc-200">Your cart is empty</h2>
        <button onClick={() => navigate('/products')} className="mt-4 bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold text-xs">Browse Products</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center gap-2 text-xs font-bold text-emerald-600">
          <Lock className="w-4 h-4" />
          <span>256-Bit Encrypted Secure Checkout • Direct Farmer Guarantee</span>
        </div>

        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-emerald-100 dark:border-zinc-800 shadow-sm space-y-4">
              <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Truck className="w-5 h-5 text-emerald-600" />
                <span>Delivery Address</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <FormField label="Full Name" value={address.fullName} onChange={v => setAddress({ ...address, fullName: v })} testid="checkout-name" required />
                <FormField label="Phone" value={address.phone} onChange={v => setAddress({ ...address, phone: v })} testid="checkout-phone" required />
                <FormField label="Street Address" value={address.street} onChange={v => setAddress({ ...address, street: v })} testid="checkout-street" required span2 />
                <FormField label="City" value={address.city} onChange={v => setAddress({ ...address, city: v })} testid="checkout-city" required />
                <FormField label="State" value={address.state} onChange={v => setAddress({ ...address, state: v })} testid="checkout-state" required />
                <FormField label="PIN Code" value={address.pincode} onChange={v => setAddress({ ...address, pincode: v })} testid="checkout-pincode" required />
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-emerald-100 dark:border-zinc-800 shadow-sm space-y-4">
              <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-600" />
                <span>Payment Method</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
                {[
                  { id: 'razorpay', label: 'Razorpay Secure', desc: 'UPI, Cards, Netbanking' },
                  { id: 'upi', label: 'UPI Manual', desc: 'Pay after order confirmation' },
                  { id: 'card', label: 'Debit / Credit Card', desc: 'Via Razorpay' },
                  { id: 'cod', label: 'Cash on Delivery', desc: 'Pay when harvest arrives' },
                ].map((pm) => (
                  <label key={pm.id} className={`p-4 rounded-2xl border-2 flex items-center gap-3 cursor-pointer transition ${paymentMethod === pm.id ? 'border-emerald-600 bg-emerald-50/40 dark:bg-emerald-950/40' : 'border-zinc-200 dark:border-zinc-800'}`} data-testid={`payment-${pm.id}`}>
                    <input type="radio" name="payment" checked={paymentMethod === pm.id} onChange={() => setPaymentMethod(pm.id)} className="accent-emerald-600" />
                    <div>
                      <div className="font-bold text-zinc-900 dark:text-zinc-100">{pm.label}</div>
                      <div className="text-[10px] text-zinc-400">{pm.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
              {paymentMethod === 'razorpay' && !process.env.REACT_APP_RAZORPAY_KEY_ID && (
                <div className="text-[11px] text-amber-700 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 p-2.5 rounded-lg">
                  ⚠️ Razorpay test keys not configured yet. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in backend/.env, and REACT_APP_RAZORPAY_KEY_ID in frontend/.env to enable live payments. Other methods (UPI/COD) work now.
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-emerald-100 dark:border-zinc-800 shadow-sm space-y-4">
              <h3 className="font-bold text-sm text-zinc-800 dark:text-zinc-100 uppercase tracking-wider">Order Summary</h3>

              <div className="flex gap-2">
                <input type="text" placeholder="Coupon: FARM20" value={couponCode} onChange={(e) => setCouponCode(e.target.value)}
                  className="flex-1 bg-zinc-100 dark:bg-zinc-800 px-3 py-2 rounded-xl text-xs border border-transparent focus:border-emerald-500 outline-none"
                  data-testid="checkout-coupon" />
              </div>

              <div className="space-y-2 text-xs text-zinc-600 dark:text-zinc-300 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                <Line label={`Items (${cart.length})`} value={`₹${subtotal}`} />
                {discount > 0 && <Line label="Discount" value={`-₹${discount}`} accent />}
                <Line label="Agri GST (5%)" value={`₹${gst}`} />
                <Line label="Delivery" value={deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`} />
                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex justify-between text-base font-black text-zinc-900 dark:text-zinc-100">
                  <span>Total</span>
                  <span className="text-emerald-700 dark:text-emerald-400" data-testid="checkout-total">₹{total}</span>
                </div>
              </div>

              <button type="submit" disabled={isProcessing}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl shadow-lg transition flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                data-testid="place-order-btn"
              >
                {isProcessing ? 'Processing…' : <><CheckCircle2 className="w-4 h-4" /><span>Place Order (₹{total})</span></>}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

function FormField({ label, value, onChange, testid, required = false, span2 = false }) {
  return (
    <div className={span2 ? 'sm:col-span-2' : ''}>
      <label className="text-zinc-500 font-bold block mb-1">{label}</label>
      <input type="text" required={required} value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full bg-zinc-100 dark:bg-zinc-800 p-3 rounded-xl border border-transparent focus:border-emerald-500 outline-none"
        data-testid={testid} />
    </div>
  );
}
function Line({ label, value, accent }) {
  return <div className={`flex justify-between ${accent ? 'text-emerald-600 font-semibold' : ''}`}><span>{label}</span><span className="font-bold">{value}</span></div>;
}
