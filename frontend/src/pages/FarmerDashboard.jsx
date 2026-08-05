import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Package, TrendingUp, DollarSign, Users, CheckCircle2, Clock, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function FarmerDashboard() {
  const { products, addProduct, orders } = useApp();
  const [activeTab, setActiveTab] = useState('products'); // products, orders, analytics, add-product

  // Add Product form state
  const [newProd, setNewProd] = useState({
    name: '',
    category: 'Fruits',
    subcategory: 'Seasonal Fruits',
    description: '',
    price: 100,
    originalPrice: 120,
    discount: 15,
    stock: 100,
    unit: 'Kg',
    harvestDate: '2026-06-20',
    expiryDate: '2026-07-05',
    freshnessLevel: '100% Farm Fresh',
    isOrganic: true,
    location: 'Ratnagiri, Maharashtra',
    deliveryRadius: '50 km',
    minOrderQty: 1,
    images: ['https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&q=80&w=800']
  });

  const handleCreateProduct = (e) => {
    e.preventDefault();
    if (!newProd.name || !newProd.price) {
      toast.error("Please fill in required fields.");
      return;
    }
    addProduct(newProd);
    setActiveTab('products');
  };

  const farmerProducts = products.filter(p => p.farmerId === 'f1');
  const totalEarnings = 42500;
  const activeOrdersCount = orders.length;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-zinc-900 p-6 sm:p-8 rounded-3xl border border-emerald-100 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center gap-4">
            <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200" alt="Farmer" className="w-16 h-16 rounded-full object-cover border-2 border-emerald-500" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-serif font-black text-zinc-900 dark:text-zinc-100">Ramesh Patil</h1>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full">Verified Farmer</span>
              </div>
              <p className="text-xs text-zinc-500">GreenValley Agro Farms • Ratnagiri, Maharashtra</p>
            </div>
          </div>

          <button 
            onClick={() => setActiveTab('add-product')}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-xl font-bold text-xs shadow-md transition flex items-center gap-2"
            data-testid="add-new-harvest-btn"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Harvest</span>
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-emerald-100 dark:border-zinc-800 shadow-sm space-y-2">
            <div className="flex justify-between items-center text-zinc-400">
              <span className="text-xs font-bold uppercase tracking-wider">Total Earnings</span>
              <DollarSign className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="text-3xl font-black text-zinc-900 dark:text-zinc-100">₹{totalEarnings}</div>
            <span className="text-xs text-emerald-600 font-semibold">+18% vs last month</span>
          </div>

          <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-emerald-100 dark:border-zinc-800 shadow-sm space-y-2">
            <div className="flex justify-between items-center text-zinc-400">
              <span className="text-xs font-bold uppercase tracking-wider">Active Harvests</span>
              <Package className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="text-3xl font-black text-zinc-900 dark:text-zinc-100">{farmerProducts.length} items</div>
            <span className="text-xs text-emerald-600 font-semibold">100% stock live</span>
          </div>

          <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-emerald-100 dark:border-zinc-800 shadow-sm space-y-2">
            <div className="flex justify-between items-center text-zinc-400">
              <span className="text-xs font-bold uppercase tracking-wider">Customer Orders</span>
              <Users className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="text-3xl font-black text-zinc-900 dark:text-zinc-100">{activeOrdersCount}</div>
            <span className="text-xs text-emerald-600 font-semibold">Ready for dispatch</span>
          </div>

          <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-emerald-100 dark:border-zinc-800 shadow-sm space-y-2">
            <div className="flex justify-between items-center text-zinc-400">
              <span className="text-xs font-bold uppercase tracking-wider">Farmer Rating</span>
              <span className="text-amber-500 font-bold">★ 4.9</span>
            </div>
            <div className="text-3xl font-black text-zinc-900 dark:text-zinc-100">4.9 / 5.0</div>
            <span className="text-xs text-zinc-400">Based on 124 reviews</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-3">
          <button 
            onClick={() => setActiveTab('products')} 
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition ${activeTab === 'products' ? 'bg-emerald-600 text-white shadow-md' : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800'}`}
            data-testid="farmer-tab-products"
          >
            My Products & Inventory ({farmerProducts.length})
          </button>
          <button 
            onClick={() => setActiveTab('orders')} 
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition ${activeTab === 'orders' ? 'bg-emerald-600 text-white shadow-md' : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800'}`}
            data-testid="farmer-tab-orders"
          >
            Customer Orders ({orders.length})
          </button>
        </div>

        {/* Tab Content: Products */}
        {activeTab === 'products' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {farmerProducts.map((p) => (
              <div key={p.id} className="bg-white dark:bg-zinc-900 rounded-3xl p-5 border border-emerald-100 dark:border-zinc-800 shadow-sm space-y-3">
                <div className="h-40 rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 relative">
                  <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <span className="text-[10px] text-emerald-600 font-bold uppercase">{p.category}</span>
                  <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 line-clamp-1">{p.name}</h4>
                  <div className="text-base font-black text-emerald-700 dark:text-emerald-400 mt-1">₹{p.price} / {p.unit}</div>
                </div>
                <div className="flex justify-between items-center text-xs pt-3 border-t border-zinc-100 dark:border-zinc-800">
                  <span className="text-zinc-400">Stock: <strong className="text-zinc-800 dark:text-zinc-200">{p.stock} {p.unit}</strong></span>
                  <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-bold">Active</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab Content: Add Product Form */}
        {activeTab === 'add-product' && (
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-10 border border-emerald-100 dark:border-zinc-800 shadow-sm max-w-3xl mx-auto">
            <h2 className="text-xl font-serif font-black text-zinc-900 dark:text-zinc-100 mb-6">Publish New Harvest to Marketplace</h2>
            <form onSubmit={handleCreateProduct} className="space-y-4 text-xs">
              <div>
                <label className="text-zinc-500 font-bold block mb-1">Product Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Organic Alphonso Mangoes" 
                  value={newProd.name}
                  onChange={e => setNewProd({...newProd, name: e.target.value})}
                  required
                  className="w-full bg-zinc-100 dark:bg-zinc-800 p-3 rounded-xl border border-transparent focus:border-emerald-500 outline-none text-sm"
                  data-testid="new-prod-name"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-zinc-500 font-bold block mb-1">Category</label>
                  <select 
                    value={newProd.category}
                    onChange={e => setNewProd({...newProd, category: e.target.value})}
                    className="w-full bg-zinc-100 dark:bg-zinc-800 p-3 rounded-xl border border-transparent focus:border-emerald-500 outline-none"
                    data-testid="new-prod-category"
                  >
                    <option value="Fruits">Fruits</option>
                    <option value="Vegetables">Vegetables</option>
                    <option value="Rice">Rice</option>
                    <option value="Grains">Grains</option>
                    <option value="Spices">Spices</option>
                    <option value="Honey">Honey</option>
                    <option value="Dairy Products">Dairy Products</option>
                    <option value="Organic Products">Organic Products</option>
                  </select>
                </div>
                <div>
                  <label className="text-zinc-500 font-bold block mb-1">Price per Unit (₹)</label>
                  <input 
                    type="number" 
                    value={newProd.price}
                    onChange={e => setNewProd({...newProd, price: Number(e.target.value)})}
                    required
                    className="w-full bg-zinc-100 dark:bg-zinc-800 p-3 rounded-xl border border-transparent focus:border-emerald-500 outline-none text-sm"
                    data-testid="new-prod-price"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-zinc-500 font-bold block mb-1">Stock Quantity</label>
                  <input 
                    type="number" 
                    value={newProd.stock}
                    onChange={e => setNewProd({...newProd, stock: Number(e.target.value)})}
                    required
                    className="w-full bg-zinc-100 dark:bg-zinc-800 p-3 rounded-xl border border-transparent focus:border-emerald-500 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="text-zinc-500 font-bold block mb-1">Unit</label>
                  <select 
                    value={newProd.unit}
                    onChange={e => setNewProd({...newProd, unit: e.target.value})}
                    className="w-full bg-zinc-100 dark:bg-zinc-800 p-3 rounded-xl border border-transparent focus:border-emerald-500 outline-none"
                  >
                    <option value="Kg">Kg</option>
                    <option value="Gram">Gram</option>
                    <option value="Ton">Ton</option>
                    <option value="Piece">Piece</option>
                    <option value="Bundle">Bundle</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-zinc-500 font-bold block mb-1">Description & Harvest Details</label>
                <textarea 
                  rows="3"
                  value={newProd.description}
                  onChange={e => setNewProd({...newProd, description: e.target.value})}
                  placeholder="Describe your soil, natural ripening, organic methods..."
                  className="w-full bg-zinc-100 dark:bg-zinc-800 p-3 rounded-xl border border-transparent focus:border-emerald-500 outline-none"
                  data-testid="new-prod-desc"
                ></textarea>
              </div>

              <button 
                type="submit" 
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl shadow-md transition text-sm"
                data-testid="submit-harvest-btn"
              >
                Publish Harvest to Marketplace
              </button>
            </form>
          </div>
        )}

        {/* Tab Content: Orders */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {orders.map((ord) => (
              <div key={ord.id} className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-emerald-100 dark:border-zinc-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <div className="font-black text-base text-zinc-900 dark:text-zinc-100">Order #{ord.id}</div>
                  <div className="text-xs text-zinc-400 mt-1">{ord.deliveryAddress} • ₹{ord.totalAmount}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full">{ord.status}</span>
                  <button onClick={() => toast.success("Order accepted and dispatch scheduled!")} className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold">Accept Order</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
