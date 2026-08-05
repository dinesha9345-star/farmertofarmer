import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, CreditCard, Truck, CheckCircle2, Lock, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export default function CheckoutPage() {
  const { cart, clearCart, setOrders } = useApp();
  const navigate = useNavigate();

  const [address, setAddress] = useState({
    fullName: 'Siddharth Sharma',
    phone: '+91 98765 43210',
    street: 'Flat 402, Green Meadows',
    city: 'Pune',
    state: 'Maharashtra',
    pincode: '411045'
  });

  const [paymentMethod, setPaymentMethod] = useState('upi'); // upi, razorpay, stripe, cod, card
  const [isProcessing, setIsProcessing] = useState(false);

  const subtotal = cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  const gst = Math.round(subtotal * 0.05);
  const deliveryFee = subtotal > 500 ? 0 : 49;
  const total = subtotal + gst + deliveryFee;

  const handlePlaceOrder = (e) => {
    e.preventDefault();
    setIsProcessing(true);

    setTimeout(() => {
      const newOrder = {
        id: `ord-${Math.floor(1000 + Math.random() * 9000)}`,
        date: new Date().toISOString().replace('T', ' ').substring(0, 16),
        items: cart.map(i => ({ productId: i.product.id, name: i.product.name, quantity: i.quantity, price: i.product.price })),
        totalAmount: total,
        status: 'Pending',
        paymentMethod: paymentMethod.toUpperCase(),
        paymentStatus: paymentMethod === 'cod' ? 'Cash on Delivery' : 'Paid securely',
        deliveryAddress: `${address.street}, ${address.city}, ${address.state} - ${address.pincode}`,
        estimatedArrival: 'Tomorrow, by 1:00 PM',
        farmerName: cart[0]?.product.farmerName || 'Direct Farmers'
      };

      setOrders(prev => [newOrder, ...prev]);
      clearCart();
      setIsProcessing(false);
      toast.success("Order placed successfully! Farmer notified.");
      navigate('/orders');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center gap-2 text-xs font-bold text-emerald-600">
          <Lock className="w-4 h-4" />
          <span>256-Bit Encrypted Secure Checkout • Direct Farmer Guarantee</span>
        </div>

        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Address & Payment Form */}
          <div className="lg:col-span-8 space-y-6">
            {/* Address Card */}
            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-emerald-100 dark:border-zinc-800 shadow-sm space-y-4">
              <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Truck className="w-5 h-5 text-emerald-600" />
                <span>Delivery Address & GPS Location</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="text-zinc-500 font-bold block mb-1">Full Name</label>
                  <input 
                    type="text" 
                    value={address.fullName} 
                    onChange={e => setAddress({...address, fullName: e.target.value})}
                    required
                    className="w-full bg-zinc-100 dark:bg-zinc-800 p-3 rounded-xl border border-transparent focus:border-emerald-500 outline-none"
                    data-testid="checkout-name"
                  />
                </div>
                <div>
                  <label className="text-zinc-500 font-bold block mb-1">Phone Number</label>
                  <input 
                    type="text" 
                    value={address.phone} 
                    onChange={e => setAddress({...address, phone: e.target.value})}
                    required
                    className="w-full bg-zinc-100 dark:bg-zinc-800 p-3 rounded-xl border border-transparent focus:border-emerald-500 outline-none"
                    data-testid="checkout-phone"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-zinc-500 font-bold block mb-1">Street Address</label>
                  <input 
                    type="text" 
                    value={address.street} 
                    onChange={e => setAddress({...address, street: e.target.value})}
                    required
                    className="w-full bg-zinc-100 dark:bg-zinc-800 p-3 rounded-xl border border-transparent focus:border-emerald-500 outline-none"
                    data-testid="checkout-street"
                  />
                </div>
                <div>
                  <label className="text-zinc-500 font-bold block mb-1">City</label>
                  <input 
                    type="text" 
                    value={address.city} 
                    onChange={e => setAddress({...address, city: e.target.value})}
                    required
                    className="w-full bg-zinc-100 dark:bg-zinc-800 p-3 rounded-xl border border-transparent focus:border-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-zinc-500 font-bold block mb-1">State</label>
                  <input 
                    type="text" 
                    value={address.state} 
                    onChange={e => setAddress({...address, state: e.target.value})}
                    required
                    className="w-full bg-zinc-100 dark:bg-zinc-800 p-3 rounded-xl border border-transparent focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method Card */}
            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-emerald-100 dark:border-zinc-800 shadow-sm space-y-4">
              <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-600" />
                <span>Select Payment Method</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
                <label className={`p-4 rounded-2xl border-2 flex items-center gap-3 cursor-pointer transition ${paymentMethod === 'upi' ? 'border-emerald-600 bg-emerald-50/40 dark:bg-emerald-950/40' : 'border-zinc-200 dark:border-zinc-800'}`}>
                  <input type="radio" name="payment" checked={paymentMethod === 'upi'} onChange={() => setPaymentMethod('upi')} className="accent-emerald-600" />
                  <div>
                    <div className="font-bold text-zinc-900 dark:text-zinc-100">UPI (GPay / PhonePe / Paytm)</div>
                    <div className="text-[10px] text-zinc-400">Instant transfer with zero fee</div>
                  </div>
                </label>

                <label className={`p-4 rounded-2xl border-2 flex items-center gap-3 cursor-pointer transition ${paymentMethod === 'razorpay' ? 'border-emerald-600 bg-emerald-50/40 dark:bg-emerald-950/40' : 'border-zinc-200 dark:border-zinc-800'}`}>
                  <input type="radio" name="payment" checked={paymentMethod === 'razorpay'} onChange={() => setPaymentMethod('razorpay')} className="accent-emerald-600" />
                  <div>
                    <div className="font-bold text-zinc-900 dark:text-zinc-100">Razorpay Secure</div>
                    <div className="text-[10px] text-zinc-400">Cards, Netbanking & UPI</div>
                  </div>
                </label>

                <label className={`p-4 rounded-2xl border-2 flex items-center gap-3 cursor-pointer transition ${paymentMethod === 'stripe' ? 'border-emerald-600 bg-emerald-50/40 dark:bg-emerald-950/40' : 'border-zinc-200 dark:border-zinc-800'}`}>
                  <input type="radio" name="payment" checked={paymentMethod === 'stripe'} onChange={() => setPaymentMethod('stripe')} className="accent-emerald-600" />
                  <div>
                    <div className="font-bold text-zinc-900 dark:text-zinc-100">Stripe Global Checkout</div>
                    <div className="text-[10px] text-zinc-400">International & Domestic Cards</div>
                  </div>
                </label>

                <label className={`p-4 rounded-2xl border-2 flex items-center gap-3 cursor-pointer transition ${paymentMethod === 'cod' ? 'border-emerald-600 bg-emerald-50/40 dark:bg-emerald-950/40' : 'border-zinc-200 dark:border-zinc-800'}`}>
                  <input type="radio" name="payment" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="accent-emerald-600" />
                  <div>
                    <div className="font-bold text-zinc-900 dark:text-zinc-100">Cash on Delivery (COD)</div>
                    <div className="text-[10px] text-zinc-400">Pay when harvest arrives</div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Order Total & Submit */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-emerald-100 dark:border-zinc-800 shadow-sm space-y-6">
              <h3 className="font-bold text-sm text-zinc-800 dark:text-zinc-100 uppercase tracking-wider">Cart Summary</h3>

              <div className="space-y-3 text-xs text-zinc-600 dark:text-zinc-300">
                <div className="flex justify-between">
                  <span>Items ({cart.length})</span>
                  <span className="font-bold">₹{subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>Agri GST (5%)</span>
                  <span className="font-bold">₹{gst}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Charge</span>
                  <span className="font-bold">{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}</span>
                </div>
                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex justify-between text-base font-black text-zinc-900 dark:text-zinc-100">
                  <span>Total Payable</span>
                  <span className="text-emerald-700 dark:text-emerald-400">₹{total}</span>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isProcessing}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl shadow-lg transition flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                data-testid="place-order-btn"
              >
                {isProcessing ? (
                  <span>Processing Secure Payment...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Place Order (₹{total})</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
