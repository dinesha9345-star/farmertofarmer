import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ShoppingBag, Trash2, ArrowRight, Tag, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export default function CartPage() {
  const { cart, updateCartQty, removeFromCart, clearCart } = useApp();
  const navigate = useNavigate();

  const [couponCode, setCouponCode] = useState('');
  const [discountApplied, setDiscountApplied] = useState(0);

  const subtotal = cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  const gst = Math.round(subtotal * 0.05); // 5% agri GST
  const deliveryFee = subtotal > 500 ? 0 : 49;
  const total = subtotal + gst + deliveryFee - discountApplied;

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (couponCode.toUpperCase() === 'FARM20' || couponCode.toUpperCase() === 'ORGANIC100') {
      const disc = Math.round(subtotal * 0.15);
      setDiscountApplied(disc);
      toast.success(`Coupon "${couponCode}" applied successfully! Saved ₹${disc}`);
    } else {
      toast.error("Invalid coupon code. Try FARM20");
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-[80vh] bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center px-4 text-center">
        <div className="w-24 h-24 rounded-full bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-serif font-bold text-zinc-900 dark:text-zinc-100">Your Cart is Empty</h2>
        <p className="text-xs text-zinc-500 mt-1 max-w-sm">Explore our direct marketplace and add fresh organic farm harvests to your cart.</p>
        <button 
          onClick={() => navigate('/products')}
          className="mt-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-xl text-xs shadow-md transition"
          data-testid="shop-now-empty-cart"
        >
          Browse Marketplace
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <h1 className="text-3xl font-serif font-black text-zinc-900 dark:text-zinc-100">Shopping Cart ({cart.length} items)</h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-emerald-100 dark:border-zinc-800 p-6 shadow-sm divide-y divide-zinc-100 dark:divide-zinc-800">
              {cart.map((item) => (
                <div key={item.product.id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row items-center justify-between gap-4" data-testid={`cart-item-${item.product.id}`}>
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <img src={item.product.images[0]} alt={item.product.name} className="w-20 h-20 rounded-2xl object-cover border border-zinc-200 dark:border-zinc-700" />
                    <div>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase">{item.product.category}</span>
                      <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{item.product.name}</h4>
                      <p className="text-xs text-zinc-400">By {item.product.farmerName} • {item.product.location}</p>
                      <div className="text-sm font-black text-emerald-700 dark:text-emerald-400 mt-1">₹{item.product.price} / {item.product.unit}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between w-full sm:w-auto gap-6">
                    {/* Quantity controls */}
                    <div className="flex items-center border border-zinc-300 dark:border-zinc-700 rounded-xl overflow-hidden">
                      <button 
                        onClick={() => updateCartQty(item.product.id, item.quantity - 1)}
                        className="px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 font-bold text-xs"
                      >-</button>
                      <span className="px-3 py-1.5 font-bold text-xs">{item.quantity}</span>
                      <button 
                        onClick={() => updateCartQty(item.product.id, item.quantity + 1)}
                        className="px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 font-bold text-xs"
                      >+</button>
                    </div>

                    <div className="text-right font-black text-sm text-zinc-800 dark:text-zinc-100">
                      ₹{item.product.price * item.quantity}
                    </div>

                    <button 
                      onClick={() => removeFromCart(item.product.id)}
                      className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition"
                      data-testid={`remove-item-${item.product.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary & Checkout */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-emerald-100 dark:border-zinc-800 p-6 shadow-sm space-y-6">
              <h3 className="font-bold text-sm text-zinc-800 dark:text-zinc-100 uppercase tracking-wider">Order Summary</h3>

              {/* Coupon Form */}
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Coupon: FARM20" 
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="flex-1 bg-zinc-100 dark:bg-zinc-800 px-3 py-2 rounded-xl text-xs border border-transparent focus:border-emerald-500 outline-none"
                  data-testid="coupon-input"
                />
                <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold">Apply</button>
              </form>

              <div className="space-y-3 text-xs text-zinc-600 dark:text-zinc-300 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-bold">₹{subtotal}</span>
                </div>
                {discountApplied > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Discount (Coupon)</span>
                    <span>-₹{discountApplied}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Agri GST (5%)</span>
                  <span className="font-bold">₹{gst}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Charge</span>
                  <span className="font-bold">{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}</span>
                </div>
                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex justify-between text-base font-black text-zinc-900 dark:text-zinc-100">
                  <span>Total Amount</span>
                  <span className="text-emerald-700 dark:text-emerald-400">₹{total}</span>
                </div>
              </div>

              <button 
                onClick={() => navigate('/checkout')}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl shadow-lg hover:shadow-xl transition flex items-center justify-center gap-2 text-sm"
                data-testid="proceed-checkout-btn"
              >
                <span>Proceed to Secure Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
