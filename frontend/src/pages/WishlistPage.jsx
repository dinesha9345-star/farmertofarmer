import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Heart, ShoppingBag, Star, MapPin, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function WishlistPage() {
  const { wishlist, products, toggleWishlist, addToCart } = useApp();
  const navigate = useNavigate();

  const wishlistedProducts = products.filter(p => wishlist.includes(p.id));

  if (wishlistedProducts.length === 0) {
    return (
      <div className="min-h-[80vh] bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center px-4 text-center">
        <div className="w-24 h-24 rounded-full bg-rose-100 dark:bg-rose-950/60 flex items-center justify-center text-rose-600 mb-4">
          <Heart className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-serif font-bold text-zinc-900 dark:text-zinc-100">Your Wishlist is Empty</h2>
        <p className="text-xs text-zinc-500 mt-1 max-w-sm">Save your favorite organic harvests and local farmers to easily buy later.</p>
        <button 
          onClick={() => navigate('/products')}
          className="mt-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-xl text-xs shadow-md transition"
        >
          Explore Marketplace
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <h1 className="text-3xl font-serif font-black text-zinc-900 dark:text-zinc-100">My Wishlist ({wishlistedProducts.length})</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {wishlistedProducts.map((prod) => (
            <div key={prod.id} className="bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden border border-emerald-100 dark:border-zinc-800 shadow-sm relative flex flex-col group">
              <button 
                onClick={() => toggleWishlist(prod.id)}
                className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-white/90 dark:bg-zinc-800/90 flex items-center justify-center text-rose-600 shadow-md"
              >
                <Heart className="w-4 h-4 fill-rose-600" />
              </button>

              <div onClick={() => navigate(`/product/${prod.id}`)} className="h-48 overflow-hidden bg-zinc-100 dark:bg-zinc-800 cursor-pointer">
                <img src={prod.images[0]} alt={prod.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 onClick={() => navigate(`/product/${prod.id}`)} className="font-bold text-zinc-900 dark:text-zinc-100 text-sm cursor-pointer hover:text-emerald-600">{prod.name}</h3>
                  <div className="text-base font-black text-emerald-700 dark:text-emerald-400 mt-2">₹{prod.price} / {prod.unit}</div>
                </div>

                <button 
                  onClick={() => addToCart(prod, 1)}
                  className="mt-4 w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl text-xs font-bold shadow-md transition flex items-center justify-center gap-1.5"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Move to Cart</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
