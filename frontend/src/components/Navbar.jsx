import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { Leaf, ShoppingBag, Heart, ShieldCheck, Search, Menu, X, Sparkles, LogOut, LayoutDashboard, LogIn } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

export default function Navbar() {
  const { cart, wishlist, searchQuery, setSearchQuery, language, setLanguage, t } = useApp();
  const { user, isAuthed, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const cartItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const role = user?.role;

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-b border-emerald-100 dark:border-zinc-800 shadow-sm">
      {/* Top Bar */}
      <div className="bg-emerald-800 text-emerald-50 text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <span className="flex items-center gap-1 font-medium"><Leaf className="w-3.5 h-3.5 text-emerald-300" /> {t('100% Direct From Farmers • Zero Middlemen • Fair Pricing')}</span>
            <span className="hidden md:inline-block text-emerald-200">| {t('Helpline')}: +91 93454 67520 • dinesha9345@gmail.com</span>
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-emerald-900 text-emerald-100 text-xs rounded px-1.5 py-0.5 border border-emerald-700 outline-none cursor-pointer"
              data-testid="language-selector"
            >
              <option value="English">English 🌐</option>
              <option value="Tamil">தமிழ் (Tamil)</option>
              <option value="Hindi">हिन्दी (Hindi)</option>
            </select>
            {isAuthed ? (
              <span className="bg-emerald-700 text-white px-2 py-0.5 rounded text-xs font-semibold" data-testid="current-role-badge">
                {role?.toUpperCase()}
              </span>
            ) : (
              <Link to="/login" className="bg-amber-500 hover:bg-amber-400 text-zinc-950 px-2 py-0.5 rounded text-xs font-semibold" data-testid="signin-top">{t('Sign In')}</Link>
            )}
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4 py-3">
        <Link to="/" className="flex items-center gap-2.5 group" data-testid="logo-link">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-green-700 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition">
            <Leaf className="w-6 h-6 text-emerald-100 animate-pulse" />
          </div>
          <div>
            <span className="text-xl font-black tracking-tight text-emerald-900 dark:text-emerald-400 font-serif">
              Farm<span className="text-amber-600 dark:text-amber-500">2</span>Home
            </span>
            <span className="block text-[10px] tracking-wider uppercase font-semibold text-zinc-500 dark:text-zinc-400">Direct Farmer Market</span>
          </div>
        </Link>

        <div className="flex-1 max-w-xl hidden md:flex items-center relative">
          <Search className="absolute left-3.5 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder={t('Search fresh mangoes, organic honey, rice, vegetables, farmers...')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && navigate('/products')}
            className="w-full bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 pl-10 pr-4 py-2.5 rounded-full text-sm border border-transparent focus:border-emerald-500 focus:bg-white dark:focus:bg-zinc-900 focus:outline-none transition shadow-inner"
            data-testid="main-search-input"
          />
          <button
            onClick={() => navigate('/products')}
            className="absolute right-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-4 py-1.5 rounded-full font-medium transition"
            data-testid="search-submit-btn"
          >
            {t('Search')}
          </button>
        </div>

        <div className="flex items-center space-x-3 sm:space-x-4">
          <Link
            to="/ai-hub"
            className="hidden lg:flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 px-3 py-1.5 rounded-full text-xs font-bold border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition shadow-sm"
            data-testid="nav-ai-hub"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>{t('AI Hub')}</span>
          </Link>

          {role === 'farmer' && (
            <Link to="/farmer-dashboard" className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition" data-testid="nav-farmer-dashboard">
              <LayoutDashboard className="w-4 h-4" />
              <span className="hidden sm:inline">{t('Farmer Hub')}</span>
            </Link>
          )}
          {role === 'admin' && (
            <Link to="/admin-dashboard" className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition" data-testid="nav-admin-dashboard">
              <ShieldCheck className="w-4 h-4" />
              <span className="hidden sm:inline">{t('Admin')}</span>
            </Link>
          )}

          {(!role || role === 'customer') && (
            <>
              <Link to="/wishlist" className="relative p-2 text-zinc-700 dark:text-zinc-200 hover:text-emerald-600 transition" data-testid="nav-wishlist-link" title="Wishlist">
                <Heart className="w-5 h-5" />
                {wishlist.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                    {wishlist.length}
                  </span>
                )}
              </Link>
              <Link to="/cart" className="relative flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-full text-xs font-semibold shadow-md transition" data-testid="nav-cart-link">
                <ShoppingBag className="w-4 h-4" />
                <span className="hidden sm:inline">Cart</span>
                {cartItemsCount > 0 && (
                  <span className="bg-amber-500 text-zinc-950 font-extrabold text-[11px] px-1.5 py-0.5 rounded-full">
                    {cartItemsCount}
                  </span>
                )}
              </Link>
            </>
          )}

          {isAuthed ? (
            <div className="relative flex items-center gap-2 pl-2 border-l border-zinc-200 dark:border-zinc-700">
              <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="flex items-center gap-2" data-testid="user-avatar-btn">
                <img src={user.avatar || `https://api.dicebear.com/7.x/thumbs/svg?seed=${user.id}`} alt={user.name} className="w-9 h-9 rounded-full object-cover border-2 border-emerald-500 shadow-sm" />
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 top-12 w-48 bg-white dark:bg-zinc-800 rounded-xl shadow-xl border border-emerald-100 dark:border-zinc-700 py-1.5 z-50">
                  <div className="px-3 py-2 border-b border-zinc-100 dark:border-zinc-700">
                    <div className="text-xs font-bold text-zinc-800 dark:text-zinc-100">{user.name}</div>
                    <div className="text-[10px] text-zinc-400">{user.email}</div>
                  </div>
                  {(role === 'customer' || !role) && <Link to="/orders" onClick={() => setUserMenuOpen(false)} className="block px-3 py-2 text-xs hover:bg-emerald-50 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200" data-testid="menu-orders">📦 {t('My Orders')}</Link>}
                  <button onClick={() => { logout(); setUserMenuOpen(false); navigate('/'); }} className="w-full text-left px-3 py-2 text-xs hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 flex items-center gap-2" data-testid="menu-logout">
                    <LogOut className="w-3.5 h-3.5" /> {t('Sign Out')}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="flex items-center gap-1.5 border border-emerald-600 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 px-3.5 py-2 rounded-full text-xs font-bold transition" data-testid="nav-login-btn">
              <LogIn className="w-4 h-4" />
              <span>{t('Sign In')}</span>
            </Link>
          )}

          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 text-zinc-700 dark:text-zinc-200">
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 px-4 py-4 space-y-3">
          <div className="relative mb-3">
            <Search className="absolute left-3.5 w-4 h-4 text-zinc-400 top-3" />
            <input
              type="text"
              placeholder="Search fresh products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 pl-10 pr-4 py-2 rounded-lg text-sm"
            />
          </div>
          <Link to="/" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-medium text-zinc-800 dark:text-zinc-100">🏠 Home Marketplace</Link>
          <Link to="/products" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-medium text-zinc-800 dark:text-zinc-100">🥕 All Products</Link>
          <Link to="/ai-hub" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-medium text-emerald-600 dark:text-emerald-400">✨ AI Hub</Link>
          {isAuthed && <Link to="/orders" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-medium text-zinc-800 dark:text-zinc-100">📦 My Orders</Link>}
          {role === 'farmer' && <Link to="/farmer-dashboard" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-medium text-zinc-800 dark:text-zinc-100">🌾 Farmer Dashboard</Link>}
          {role === 'admin' && <Link to="/admin-dashboard" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-medium text-zinc-800 dark:text-zinc-100">⚙️ Admin</Link>}
        </div>
      )}
    </header>
  );
}
