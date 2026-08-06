import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Sparkles, ArrowRight, ShieldCheck, Star, MapPin, Search, Filter, ShoppingBag, Heart, CheckCircle2, ChevronRight, SlidersHorizontal, Flame, TrendingUp } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function Home() {
  const { products, categories, setSelectedCategory, addToCart, wishlist, toggleWishlist, t } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('All');

  const filteredProducts = activeTab === 'All' 
    ? products 
    : products.filter(p => p.category.toLowerCase() === activeTab.toLowerCase());

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-900 via-emerald-800 to-green-950 text-white py-20 lg:py-28">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 bg-emerald-800/80 border border-emerald-600/50 px-3.5 py-1.5 rounded-full text-xs font-semibold text-emerald-200">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
                <span>{t('AI-Powered Direct Farmer Marketplace • Zero Middlemen')}</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-black tracking-tight leading-tight">
                {t('Fresh From The Soil,')} <br />
                <span className="text-amber-400 italic">{t('Direct To Your Door')}</span>
              </h1>
              <p className="text-base sm:text-lg text-emerald-100 max-w-xl font-light leading-relaxed">
                {t('Empowering 10,000+ local farmers with fair pricing and verified organic harvests. Experience peak freshness within 24 hours of harvest.')}
              </p>
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button 
                  onClick={() => navigate('/products')}
                  className="bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold px-8 py-3.5 rounded-xl shadow-lg hover:shadow-xl transition flex items-center gap-2 text-sm"
                  data-testid="hero-explore-btn"
                >
                  <span>{t('Explore Fresh Harvest')}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => navigate('/ai-hub')}
                  className="bg-emerald-800/90 hover:bg-emerald-700 text-white font-semibold px-6 py-3.5 rounded-xl border border-emerald-600/60 transition flex items-center gap-2 text-sm"
                  data-testid="hero-ai-btn"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>{t('AI Crop Price Predictor')}</span>
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 pt-8 border-t border-emerald-800/60">
                <div>
                  <div className="text-2xl sm:text-3xl font-black text-amber-400">10k+</div>
                  <div className="text-xs text-emerald-200">{t('Verified Farmers')}</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-black text-amber-400">35+</div>
                  <div className="text-xs text-emerald-200">{t('Produce Categories')}</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-black text-amber-400">24 hrs</div>
                  <div className="text-xs text-emerald-200">{t('Farm to Doorstep')}</div>
                </div>
              </div>
            </div>

            {/* Hero Image Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-emerald-600/30 group">
                <img 
                  src="https://images.unsplash.com/photo-1595855759920-86582396756a?auto=format&fit=crop&q=80&w=800" 
                  alt="Fresh organic harvest" 
                  className="w-full h-[420px] object-cover group-hover:scale-105 transition duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent flex flex-col justify-end p-6">
                  <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 text-white flex items-center justify-between">
                    <div>
                      <span className="text-xs uppercase tracking-wider text-emerald-300 font-bold">Featured Farmer</span>
                      <h4 className="font-bold text-base">Ramesh Patil (Ratnagiri Orchards)</h4>
                      <p className="text-xs text-zinc-300">Organic Alphonso Mangoes • Harvested Today</p>
                    </div>
                    <span className="bg-amber-500 text-zinc-950 font-black text-xs px-2.5 py-1.5 rounded-lg">
                      ★ 4.9
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex justify-between items-end mb-8">
          <div>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider">{t('Direct Harvest Categories')}</span>
            <h2 className="text-2xl sm:text-3xl font-serif font-black text-zinc-900 dark:text-zinc-100 mt-1">{t('Browse By Crop & Produce')}</h2>
          </div>
          <button 
            onClick={() => navigate('/products')}
            className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1"
          >
            <span>{t('View All 35+ Categories')}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {categories.map((cat, idx) => (
            <div 
              key={idx}
              onClick={() => { setSelectedCategory(cat.name); navigate('/products'); }}
              className="group bg-white dark:bg-zinc-900 rounded-2xl p-4 text-center border border-emerald-100 dark:border-zinc-800 hover:border-emerald-500 dark:hover:border-emerald-500 shadow-sm hover:shadow-md transition cursor-pointer flex flex-col items-center"
              data-testid={`category-card-${cat.name.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <div className="w-16 h-16 rounded-2xl overflow-hidden mb-3 bg-emerald-50 dark:bg-emerald-950/40 relative shadow-inner">
                <img src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                <span className="absolute bottom-1 right-1 text-base">{cat.icon}</span>
              </div>
              <h3 className="font-bold text-xs text-zinc-800 dark:text-zinc-200 group-hover:text-emerald-600 transition">{cat.name}</h3>
              <span className="text-[10px] text-zinc-400 mt-0.5">{cat.count} items</span>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
          <div>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider">{t('Fresh & Organic')}</span>
            <h2 className="text-2xl sm:text-3xl font-serif font-black text-zinc-900 dark:text-zinc-100 mt-1">{t("Today's Direct Harvest")}</h2>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 w-full md:w-auto">
            {['All', 'Fruits', 'Vegetables', 'Rice', 'Dairy Products', 'Honey'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${activeTab === tab ? 'bg-emerald-600 text-white shadow-md' : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100'}`}
                data-testid={`filter-tab-${tab.toLowerCase()}`}
              >
                {t(tab)}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((prod) => {
            const isWishlisted = wishlist.includes(prod.id);
            return (
              <div 
                key={prod.id}
                className="bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden border border-emerald-100/80 dark:border-zinc-800 shadow-sm hover:shadow-xl transition flex flex-col group relative"
                data-testid={`product-card-${prod.id}`}
              >
                {/* Discount Badge */}
                {prod.discount > 0 && (
                  <span className="absolute top-3 left-3 z-10 bg-rose-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-md">
                    {prod.discount}% OFF
                  </span>
                )}

                {/* Wishlist Button */}
                <button 
                  onClick={() => toggleWishlist(prod.id)}
                  className={`absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-white/90 dark:bg-zinc-800/90 backdrop-blur-md flex items-center justify-center shadow-md transition ${isWishlisted ? 'text-rose-600' : 'text-zinc-400 hover:text-rose-600'}`}
                  data-testid={`wishlist-btn-${prod.id}`}
                >
                  <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-600' : ''}`} />
                </button>

                {/* Product Image */}
                <div 
                  onClick={() => navigate(`/product/${prod.id}`)}
                  className="h-52 overflow-hidden bg-zinc-100 dark:bg-zinc-800 relative cursor-pointer"
                >
                  <img src={prod.images[0]} alt={prod.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                  <div className="absolute bottom-2 left-2 bg-zinc-950/60 backdrop-blur-md text-white text-[10px] px-2.5 py-1 rounded-lg flex items-center gap-1 font-medium">
                    <MapPin className="w-3 h-3 text-emerald-400" />
                    <span>{prod.location}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{prod.category}</span>
                      <span className="flex items-center gap-1 text-amber-500 font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-500" />
                        {prod.rating} ({prod.reviewsCount})
                      </span>
                    </div>

                    <h3 
                      onClick={() => navigate(`/product/${prod.id}`)}
                      className="font-bold text-zinc-900 dark:text-zinc-100 text-base line-clamp-1 cursor-pointer hover:text-emerald-600 transition"
                    >
                      {prod.name}
                    </h3>
                    
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-2">
                      {prod.description}
                    </p>

                    <div className="flex items-center gap-2 mt-3 text-xs">
                      <span className="bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded font-medium border border-emerald-200 dark:border-emerald-800">
                        {prod.freshnessLevel}
                      </span>
                      {prod.isOrganic && (
                        <span className="bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded font-medium border border-amber-200 dark:border-amber-800">
                          🌿 Organic
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                    <div>
                      <div className="text-xs text-zinc-400 line-through">₹{prod.originalPrice}/{prod.unit}</div>
                      <div className="text-lg font-black text-emerald-700 dark:text-emerald-400">
                        ₹{prod.price} <span className="text-xs font-normal text-zinc-500">/ {prod.unit}</span>
                      </div>
                    </div>

                    <button 
                      onClick={() => addToCart(prod, 1)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white p-2.5 rounded-xl shadow-md transition flex items-center gap-1.5 text-xs font-bold"
                      data-testid={`add-to-cart-${prod.id}`}
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* AI Hub Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-gradient-to-r from-emerald-900 via-green-800 to-zinc-900 rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden shadow-xl">
          <div className="absolute right-0 top-0 w-96 h-full opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:12px_12px] pointer-events-none"></div>
          <div className="max-w-2xl space-y-4 relative z-10">
            <span className="bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider">
              ✨ {t('Smart Agriculture Intelligence')}
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-black">{t('AI Crop Price Prediction & Smart Recommendations')}</h2>
            <p className="text-sm text-emerald-100 leading-relaxed">
              {t('Our advanced machine learning models analyze soil conditions, historical market demand, weather forecasts, and mandi trends to give farmers and buyers accurate future pricing.')}
            </p>
            <div className="pt-2">
              <button 
                onClick={() => navigate('/ai-hub')}
                className="bg-white text-zinc-950 font-bold px-6 py-3 rounded-xl shadow-lg hover:bg-emerald-50 transition text-xs flex items-center gap-2"
                data-testid="goto-ai-hub-btn"
              >
                <span>{t('Launch AI Hub & Chat Assistant')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
