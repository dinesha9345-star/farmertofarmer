import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Search, Filter, Star, MapPin, ShoppingBag, Heart, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ProductsPage() {
  const { products, categories, selectedCategory, setSelectedCategory, searchQuery, setSearchQuery, addToCart, wishlist, toggleWishlist } = useApp();
  const navigate = useNavigate();

  const [sortBy, setSortBy] = useState('popular');
  const [organicOnly, setOrganicOnly] = useState(false);
  const [maxPrice, setMaxPrice] = useState(1000);

  // Filter logic
  const filtered = products.filter(p => {
    const matchesCategory = selectedCategory === 'All' || p.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.farmerName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesOrganic = !organicOnly || p.isOrganic;
    const matchesPrice = p.price <= maxPrice;
    return matchesCategory && matchesSearch && matchesOrganic && matchesPrice;
  }).sort((a, b) => {
    if (sortBy === 'price-low') return a.price - b.price;
    if (sortBy === 'price-high') return b.price - a.price;
    if (sortBy === 'rating') return b.rating - a.rating;
    return b.salesCount - a.salesCount;
  });

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-black text-zinc-900 dark:text-zinc-100">Direct Farmer Marketplace</h1>
          <p className="text-xs text-zinc-500 mt-1">Browse verified harvests from local farmers across 35+ categories</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-emerald-100 dark:border-zinc-800 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
                  <Filter className="w-4 h-4 text-emerald-600" />
                  <span>Filters</span>
                </h3>
                <button 
                  onClick={() => { setSelectedCategory('All'); setOrganicOnly(false); setMaxPrice(1000); }}
                  className="text-xs text-emerald-600 hover:underline font-semibold"
                >
                  Reset All
                </button>
              </div>

              {/* Categories list */}
              <div>
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider block mb-3">Categories</label>
                <div className="space-y-1.5 max-h-60 overflow-y-auto pr-2">
                  <button
                    onClick={() => setSelectedCategory('All')}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition ${selectedCategory === 'All' ? 'bg-emerald-600 text-white' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300'}`}
                  >
                    All Categories ({products.length})
                  </button>
                  {categories.map((c, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedCategory(c.name)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition ${selectedCategory === c.name ? 'bg-emerald-600 text-white' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300'}`}
                      data-testid={`filter-cat-${c.name.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      {c.icon} {c.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Organic Badge Checkbox */}
              <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  <input 
                    type="checkbox" 
                    checked={organicOnly}
                    onChange={(e) => setOrganicOnly(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded border-zinc-300 focus:ring-emerald-500"
                    data-testid="organic-checkbox"
                  />
                  <span>🌿 Certified Organic Only</span>
                </label>
              </div>

              {/* Price Range Slider */}
              <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-2">
                <div className="flex justify-between text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  <span>Max Price</span>
                  <span className="text-emerald-600">₹{maxPrice}</span>
                </div>
                <input 
                  type="range" 
                  min="30" 
                  max="1000" 
                  step="20"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                  data-testid="price-range-slider"
                />
              </div>
            </div>
          </div>

          {/* Product Grid */}
          <div className="lg:col-span-3 space-y-6">
            {/* Top Bar Sort & Search status */}
            <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-emerald-100 dark:border-zinc-800 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                Showing <span className="font-bold text-emerald-600">{filtered.length}</span> verified farm products
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-xs text-zinc-400 whitespace-nowrap">Sort by:</span>
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-zinc-100 dark:bg-zinc-800 text-xs text-zinc-800 dark:text-zinc-100 px-3 py-2 rounded-xl border border-transparent focus:border-emerald-500 outline-none cursor-pointer"
                  data-testid="sort-select"
                >
                  <option value="popular">Most Popular</option>
                  <option value="rating">Highest Rated</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
              </div>
            </div>

            {/* Grid */}
            {filtered.length === 0 ? (
              <div className="bg-white dark:bg-zinc-900 rounded-3xl p-12 text-center border border-zinc-200 dark:border-zinc-800 space-y-3">
                <div className="text-4xl">🌾</div>
                <h3 className="font-bold text-base">No harvests found</h3>
                <p className="text-xs text-zinc-400">Try adjusting your category filters or search query.</p>
                <button 
                  onClick={() => { setSelectedCategory('All'); setSearchQuery(''); setOrganicOnly(false); }}
                  className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {filtered.map((prod) => {
                  const isWishlisted = wishlist.includes(prod.id);
                  return (
                    <div 
                      key={prod.id}
                      className="bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden border border-emerald-100/80 dark:border-zinc-800 shadow-sm hover:shadow-xl transition flex flex-col group relative"
                    >
                      {prod.discount > 0 && (
                        <span className="absolute top-3 left-3 z-10 bg-rose-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-md">
                          {prod.discount}% OFF
                        </span>
                      )}

                      <button 
                        onClick={() => toggleWishlist(prod.id)}
                        className={`absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-white/90 dark:bg-zinc-800/90 backdrop-blur-md flex items-center justify-center shadow-md transition ${isWishlisted ? 'text-rose-600' : 'text-zinc-400 hover:text-rose-600'}`}
                      >
                        <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-600' : ''}`} />
                      </button>

                      <div 
                        onClick={() => navigate(`/product/${prod.id}`)}
                        className="h-48 overflow-hidden bg-zinc-100 dark:bg-zinc-800 relative cursor-pointer"
                      >
                        <img src={prod.images[0]} alt={prod.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                        <div className="absolute bottom-2 left-2 bg-zinc-950/60 backdrop-blur-md text-white text-[10px] px-2.5 py-1 rounded-lg flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-emerald-400" />
                          <span>{prod.location}</span>
                        </div>
                      </div>

                      <div className="p-5 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
                            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{prod.category}</span>
                            <span className="flex items-center gap-1 text-amber-500 font-bold">
                              <Star className="w-3.5 h-3.5 fill-amber-500" />
                              {prod.rating}
                            </span>
                          </div>

                          <h3 
                            onClick={() => navigate(`/product/${prod.id}`)}
                            className="font-bold text-zinc-900 dark:text-zinc-100 text-sm line-clamp-1 cursor-pointer hover:text-emerald-600 transition"
                          >
                            {prod.name}
                          </h3>
                          
                          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-2">
                            {prod.description}
                          </p>
                        </div>

                        <div className="mt-5 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                          <div>
                            <div className="text-xs text-zinc-400 line-through">₹{prod.originalPrice}/{prod.unit}</div>
                            <div className="text-base font-black text-emerald-700 dark:text-emerald-400">
                              ₹{prod.price} <span className="text-xs font-normal text-zinc-500">/ {prod.unit}</span>
                            </div>
                          </div>

                          <button 
                            onClick={() => addToCart(prod, 1)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white p-2.5 rounded-xl shadow-md transition flex items-center gap-1 text-xs font-bold"
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
