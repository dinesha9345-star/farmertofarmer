import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Star, MapPin, Leaf, ShoppingBag, Heart, Truck, Calendar, ArrowLeft, Send, Loader2 } from 'lucide-react';
import api from '../lib/api';

export default function ProductDetailPage() {
  const { id } = useParams();
  const { products, addToCart, wishlist, toggleWishlist } = useApp();
  const navigate = useNavigate();

  const [product, setProduct] = useState(() => products.find((p) => p.id === id) || null);
  const [loading, setLoading] = useState(!product);
  const [notFound, setNotFound] = useState(false);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    // If not in context, fetch directly from API
    if (product && product.id === id) return;
    setLoading(true);
    setNotFound(false);
    api.get(`/products/${id}`)
      .then((r) => { setProduct(r.data); setQty(r.data.minOrderQty || 1); })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    // If context updates and matches, sync
    if (!product) {
      const p = products.find((x) => x.id === id);
      if (p) { setProduct(p); setQty(p.minOrderQty || 1); }
    }
  }, [products, id, product]);

  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [msgInput, setMsgInput] = useState('');

  useEffect(() => {
    if (product) {
      setChatMessages([{ sender: 'farmer', text: `Hello! I am ${product.farmerName}. Have any questions regarding my ${product.name}?` }]);
    }
  }, [product?.id]);

  const sendMsg = (e) => {
    e.preventDefault();
    if (!msgInput.trim()) return;
    setChatMessages((prev) => [...prev, { sender: 'customer', text: msgInput }]);
    setMsgInput('');
    setTimeout(() => {
      setChatMessages((prev) => [...prev, { sender: 'farmer', text: 'Thank you for your query! I ensure 100% fresh dispatch directly from our farm.' }]);
    }, 900);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-zinc-500 text-sm gap-2" data-testid="product-detail-loading">
        <Loader2 className="w-5 h-5 animate-spin" /> Loading harvest…
      </div>
    );
  }
  if (notFound || !product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 py-16 text-center" data-testid="product-not-found">
        <div className="text-5xl">🌾</div>
        <h2 className="text-xl font-bold">Product not found</h2>
        <button onClick={() => navigate('/products')} className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold text-xs">Browse Marketplace</button>
      </div>
    );
  }

  const isWishlisted = wishlist.includes(product.id);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <button onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:text-emerald-600 transition"
          data-testid="back-btn">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Marketplace</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 bg-white dark:bg-zinc-900 p-6 sm:p-10 rounded-3xl border border-emerald-100 dark:border-zinc-800 shadow-sm">
          <div className="lg:col-span-6 space-y-4">
            <div className="h-[380px] sm:h-[450px] rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 relative">
              <img src={product.images?.[0]} alt={product.name} className="w-full h-full object-cover" />
              {product.discount > 0 && (
                <span className="absolute top-4 left-4 bg-rose-600 text-white text-xs font-black px-3 py-1 rounded-full shadow-md">
                  {product.discount}% OFF
                </span>
              )}
            </div>
          </div>

          <div className="lg:col-span-6 space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">{product.category} • {product.subcategory}</span>
                <span className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 px-2.5 py-1 rounded-full text-xs font-bold border border-amber-200 dark:border-amber-800">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  {product.rating} ({product.reviewsCount} reviews)
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-serif font-black text-zinc-900 dark:text-zinc-100" data-testid="product-detail-name">{product.name}</h1>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 leading-relaxed">{product.description}</p>
            </div>

            <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/30 rounded-2xl border border-emerald-100 dark:border-emerald-900/50 flex items-center justify-between">
              <div>
                <div className="text-xs text-zinc-400 line-through">₹{product.originalPrice} / {product.unit}</div>
                <div className="text-3xl font-black text-emerald-700 dark:text-emerald-400">
                  ₹{product.price} <span className="text-xs font-normal text-zinc-500">/ {product.unit}</span>
                </div>
              </div>
              <span className="bg-emerald-600 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-sm">
                In Stock ({product.stock})
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <Attr label="Harvest Date" value={product.harvestDate} icon={Calendar} />
              <Attr label="Freshness" value={product.freshnessLevel} icon={Leaf} />
              <Attr label="Location" value={product.location} icon={MapPin} />
              <Attr label="Delivery" value={product.deliveryRadius} icon={Truck} />
            </div>

            <div className="p-4 bg-white dark:bg-zinc-800 rounded-2xl border border-emerald-200 dark:border-zinc-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src={product.farmerAvatar} alt={product.farmerName} className="w-12 h-12 rounded-full object-cover border-2 border-emerald-500" />
                <div>
                  <span className="text-[10px] text-zinc-400 uppercase font-bold">Direct Farmer</span>
                  <h4 className="font-bold text-sm text-zinc-800 dark:text-zinc-100">{product.farmerName}</h4>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400">Verified Direct Seller</p>
                </div>
              </div>
              <button onClick={() => setChatOpen(!chatOpen)}
                className="bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-3.5 py-2 rounded-xl text-xs font-bold border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition"
                data-testid="chat-farmer-btn">
                💬 Chat with Farmer
              </button>
            </div>

            {chatOpen && (
              <div className="bg-zinc-50 dark:bg-zinc-800 p-4 rounded-2xl border border-emerald-200 dark:border-zinc-700 space-y-3">
                <div className="flex justify-between items-center text-xs font-bold border-b border-zinc-200 dark:border-zinc-700 pb-2">
                  <span>Chat with {product.farmerName}</span>
                  <button onClick={() => setChatOpen(false)} className="text-zinc-400 hover:text-zinc-700">✕</button>
                </div>
                <div className="max-h-40 overflow-y-auto space-y-2 text-xs">
                  {chatMessages.map((m, idx) => (
                    <div key={idx} className={`flex ${m.sender === 'customer' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`p-2.5 rounded-xl max-w-[80%] ${m.sender === 'customer' ? 'bg-emerald-600 text-white' : 'bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700'}`}>
                        {m.text}
                      </div>
                    </div>
                  ))}
                </div>
                <form onSubmit={sendMsg} className="flex gap-2 pt-2">
                  <input type="text" placeholder="Ask about harvest time, bulk order..." value={msgInput}
                    onChange={(e) => setMsgInput(e.target.value)}
                    className="flex-1 bg-white dark:bg-zinc-900 px-3 py-2 rounded-xl text-xs border border-zinc-200 dark:border-zinc-700 outline-none"
                    data-testid="chat-input" />
                  <button type="submit" className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold"><Send className="w-3.5 h-3.5" /></button>
                </form>
              </div>
            )}

            <div className="flex items-center gap-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center border border-zinc-300 dark:border-zinc-700 rounded-xl overflow-hidden">
                <button onClick={() => setQty(Math.max(product.minOrderQty || 1, qty - 1))} className="px-3.5 py-2.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 font-bold">-</button>
                <span className="px-4 py-2.5 font-bold text-sm" data-testid="product-qty-display">{qty}</span>
                <button onClick={() => setQty(qty + 1)} className="px-3.5 py-2.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 font-bold">+</button>
              </div>
              <button onClick={() => addToCart(product, qty)}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 px-6 rounded-xl font-bold text-sm shadow-lg transition flex items-center justify-center gap-2"
                data-testid="add-to-cart-detail-btn">
                <ShoppingBag className="w-4 h-4" />
                <span>Add to Cart • ₹{product.price * qty}</span>
              </button>
              <button onClick={() => toggleWishlist(product.id)}
                className={`p-3.5 rounded-xl border border-zinc-300 dark:border-zinc-700 transition ${isWishlisted ? 'text-rose-600 bg-rose-50 dark:bg-rose-950/40' : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100'}`}
                data-testid="wishlist-detail-btn">
                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-rose-600' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Attr({ label, value, icon: Icon }) {
  return (
    <div className="p-3 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl border border-zinc-200 dark:border-zinc-700 space-y-1">
      <span className="text-zinc-400 block">{label}</span>
      <span className="font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1">
        {Icon && <Icon className="w-3.5 h-3.5 text-emerald-600" />} {value}
      </span>
    </div>
  );
}
