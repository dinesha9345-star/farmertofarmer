import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { Plus, Package, DollarSign, Users, Upload, Trash2, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import api from '../lib/api';

const CATEGORY_LIST = ['Fruits', 'Vegetables', 'Rice', 'Grains', 'Millets', 'Spices', 'Dairy Products', 'Honey', 'Eggs', 'Leafy Vegetables', 'Dry Fruits', 'Organic Products'];

export default function FarmerDashboard() {
  const { products, addProduct, uploadImage, loadProducts } = useApp();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('products');
  const [stats, setStats] = useState({ products: 0, orders: 0, earnings: 0, rating: 4.9 });
  const [farmerOrders, setFarmerOrders] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [newProd, setNewProd] = useState({
    name: '', category: 'Fruits', subcategory: '', description: '',
    price: 100, originalPrice: 120, discount: 15, stock: 100, unit: 'Kg',
    harvestDate: '2026-06-20', expiryDate: '2026-07-05',
    freshnessLevel: '100% Farm Fresh', isOrganic: true,
    location: user?.location || 'Ratnagiri, Maharashtra',
    deliveryRadius: '50 km', minOrderQty: 1,
    images: [],
  });

  const farmerProducts = products.filter((p) => p.farmerId === user?.id);

  useEffect(() => {
    (async () => {
      try {
        const [s, o] = await Promise.all([
          api.get('/farmer/stats').then((r) => r.data),
          api.get('/orders').then((r) => r.data),
        ]);
        setStats(s);
        setFarmerOrders(o);
      } catch (_) {}
    })();
  }, []);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const data = await uploadImage(file);
      const backend = process.env.REACT_APP_BACKEND_URL;
      const url = `${backend}${data.url}`;
      setNewProd((p) => ({ ...p, images: [...p.images, url] }));
      toast.success('Image uploaded');
    } catch (err) {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (idx) => {
    setNewProd((p) => ({ ...p, images: p.images.filter((_, i) => i !== idx) }));
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    if (!newProd.name || !newProd.price) { toast.error('Please fill in required fields.'); return; }
    if (newProd.images.length === 0) {
      newProd.images = ['https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800'];
    }
    setSubmitting(true);
    try {
      await addProduct(newProd);
      await loadProducts();
      setActiveTab('products');
      setNewProd({ ...newProd, name: '', description: '', images: [] });
    } finally {
      setSubmitting(false);
    }
  };

  const acceptOrder = async (oid) => {
    try {
      await api.post(`/orders/${oid}/status`, { status: 'Accepted' });
      const { data } = await api.get('/orders');
      setFarmerOrders(data);
      toast.success('Order accepted!');
    } catch (_) { toast.error('Failed to update status'); }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-zinc-900 p-6 sm:p-8 rounded-3xl border border-emerald-100 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center gap-4">
            <img src={user?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200'} alt={user?.name} className="w-16 h-16 rounded-full object-cover border-2 border-emerald-500" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-serif font-black text-zinc-900 dark:text-zinc-100" data-testid="farmer-name">{user?.name}</h1>
                {user?.verified && <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full">Verified</span>}
              </div>
              <p className="text-xs text-zinc-500">{user?.farmName || 'Farm2Home Farmer'} • {user?.location || 'India'}</p>
            </div>
          </div>
          <button onClick={() => setActiveTab('add-product')}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-xl font-bold text-xs shadow-md transition flex items-center gap-2"
            data-testid="add-new-harvest-btn"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Harvest</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard icon={DollarSign} label="Total Earnings" value={`₹${stats.earnings.toLocaleString('en-IN')}`} sub="from paid orders" />
          <StatCard icon={Package} label="Active Harvests" value={`${stats.products} items`} sub="live on marketplace" />
          <StatCard icon={Users} label="Customer Orders" value={stats.orders} sub="lifetime" />
          <StatCard icon={Users} label="Farmer Rating" value={`${stats.rating} / 5.0`} sub="verified reviews" />
        </div>

        <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-3">
          <TabBtn active={activeTab === 'products'} onClick={() => setActiveTab('products')} testid="farmer-tab-products">My Products ({farmerProducts.length})</TabBtn>
          <TabBtn active={activeTab === 'orders'} onClick={() => setActiveTab('orders')} testid="farmer-tab-orders">Customer Orders ({farmerOrders.length})</TabBtn>
          <TabBtn active={activeTab === 'add-product'} onClick={() => setActiveTab('add-product')} testid="farmer-tab-add">+ Add Harvest</TabBtn>
        </div>

        {activeTab === 'products' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {farmerProducts.length === 0 ? (
              <div className="col-span-full text-center py-12 text-zinc-400 text-sm">You haven't listed any harvest yet. Click "Add New Harvest" to publish your first product.</div>
            ) : farmerProducts.map((p) => (
              <div key={p.id} className="bg-white dark:bg-zinc-900 rounded-3xl p-5 border border-emerald-100 dark:border-zinc-800 shadow-sm space-y-3" data-testid={`my-product-${p.id}`}>
                <div className="h-40 rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-800"><img src={p.images?.[0]} alt={p.name} className="w-full h-full object-cover" /></div>
                <div>
                  <span className="text-[10px] text-emerald-600 font-bold uppercase">{p.category}</span>
                  <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 line-clamp-1">{p.name}</h4>
                  <div className="text-base font-black text-emerald-700 dark:text-emerald-400 mt-1">₹{p.price} / {p.unit}</div>
                </div>
                <div className="flex justify-between items-center text-xs pt-3 border-t border-zinc-100 dark:border-zinc-800">
                  <span className="text-zinc-400">Stock: <strong className="text-zinc-800 dark:text-zinc-200">{p.stock}</strong></span>
                  <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-bold">Active</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'add-product' && (
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-10 border border-emerald-100 dark:border-zinc-800 shadow-sm max-w-3xl mx-auto">
            <h2 className="text-xl font-serif font-black text-zinc-900 dark:text-zinc-100 mb-6">Publish New Harvest</h2>
            <form onSubmit={handleCreateProduct} className="space-y-4 text-xs">
              <Field label="Product Name" value={newProd.name} onChange={(v) => setNewProd({ ...newProd, name: v })} testid="new-prod-name" required />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-zinc-500 font-bold block mb-1">Category</label>
                  <select value={newProd.category} onChange={(e) => setNewProd({ ...newProd, category: e.target.value })}
                    className="w-full bg-zinc-100 dark:bg-zinc-800 p-3 rounded-xl border border-transparent focus:border-emerald-500 outline-none"
                    data-testid="new-prod-category"
                  >
                    {CATEGORY_LIST.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <Field label="Price per Unit (₹)" type="number" value={newProd.price} onChange={(v) => setNewProd({ ...newProd, price: Number(v) })} testid="new-prod-price" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Stock Quantity" type="number" value={newProd.stock} onChange={(v) => setNewProd({ ...newProd, stock: Number(v) })} required />
                <div>
                  <label className="text-zinc-500 font-bold block mb-1">Unit</label>
                  <select value={newProd.unit} onChange={(e) => setNewProd({ ...newProd, unit: e.target.value })}
                    className="w-full bg-zinc-100 dark:bg-zinc-800 p-3 rounded-xl border border-transparent focus:border-emerald-500 outline-none">
                    {['Kg', 'Gram', 'Ton', 'Piece', 'Bundle', 'Sack'].map((u) => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Harvest Date" type="date" value={newProd.harvestDate} onChange={(v) => setNewProd({ ...newProd, harvestDate: v })} />
                <Field label="Expiry Date" type="date" value={newProd.expiryDate} onChange={(v) => setNewProd({ ...newProd, expiryDate: v })} />
              </div>
              <div>
                <label className="text-zinc-500 font-bold block mb-1">Description</label>
                <textarea rows="3" value={newProd.description} onChange={(e) => setNewProd({ ...newProd, description: e.target.value })}
                  placeholder="Describe your organic methods, freshness, region..."
                  className="w-full bg-zinc-100 dark:bg-zinc-800 p-3 rounded-xl border border-transparent focus:border-emerald-500 outline-none"
                  data-testid="new-prod-desc" />
              </div>
              <div>
                <label className="text-zinc-500 font-bold block mb-2">Product Images</label>
                <div className="flex flex-wrap gap-3">
                  {newProd.images.map((img, idx) => (
                    <div key={idx} className="relative w-24 h-24 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-700">
                      <img src={img} alt="" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => removeImage(idx)} className="absolute top-1 right-1 bg-rose-600 text-white p-0.5 rounded-full"><X className="w-3 h-3" /></button>
                    </div>
                  ))}
                  <label className="w-24 h-24 border-2 border-dashed border-emerald-300 dark:border-emerald-700 rounded-xl flex flex-col items-center justify-center cursor-pointer text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40" data-testid="upload-image-input">
                    {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Upload className="w-5 h-5" /><span className="text-[10px] mt-1">Upload</span></>}
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploading} />
                  </label>
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={newProd.isOrganic} onChange={(e) => setNewProd({ ...newProd, isOrganic: e.target.checked })} className="w-4 h-4 accent-emerald-600" />
                <span className="font-semibold text-zinc-700 dark:text-zinc-200">🌿 Certified Organic Produce</span>
              </label>

              <button type="submit" disabled={submitting}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl shadow-md transition text-sm disabled:opacity-50"
                data-testid="submit-harvest-btn"
              >
                {submitting ? 'Publishing…' : 'Publish Harvest'}
              </button>
            </form>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-4">
            {farmerOrders.length === 0 && <div className="text-center py-12 text-zinc-400 text-sm">No customer orders yet.</div>}
            {farmerOrders.map((ord) => (
              <div key={ord.id} className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-emerald-100 dark:border-zinc-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4" data-testid={`farmer-order-${ord.id}`}>
                <div>
                  <div className="font-black text-base text-zinc-900 dark:text-zinc-100">Order #{ord.id}</div>
                  <div className="text-xs text-zinc-400 mt-1">{ord.deliveryAddress} • ₹{ord.totalAmount}</div>
                  <div className="text-xs text-zinc-500 mt-1">{ord.items?.map((i) => `${i.name} x${i.quantity}`).join(', ')}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full">{ord.status}</span>
                  {ord.status === 'Pending' && (
                    <button onClick={() => acceptOrder(ord.id)} className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold" data-testid={`accept-order-${ord.id}`}>Accept</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub }) {
  return (
    <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-emerald-100 dark:border-zinc-800 shadow-sm space-y-2">
      <div className="flex justify-between items-center text-zinc-400">
        <span className="text-xs font-bold uppercase tracking-wider">{label}</span>
        {Icon && <Icon className="w-5 h-5 text-emerald-600" />}
      </div>
      <div className="text-2xl font-black text-zinc-900 dark:text-zinc-100">{value}</div>
      <span className="text-xs text-emerald-600 font-semibold">{sub}</span>
    </div>
  );
}
function TabBtn({ active, onClick, testid, children }) {
  return <button onClick={onClick} data-testid={testid} className={`px-5 py-2.5 rounded-xl text-xs font-bold transition ${active ? 'bg-emerald-600 text-white shadow-md' : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800'}`}>{children}</button>;
}
function Field({ label, value, onChange, testid, required = false, type = 'text' }) {
  return (
    <div>
      <label className="text-zinc-500 font-bold block mb-1">{label}</label>
      <input type={type} required={required} value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full bg-zinc-100 dark:bg-zinc-800 p-3 rounded-xl border border-transparent focus:border-emerald-500 outline-none text-sm"
        data-testid={testid} />
    </div>
  );
}
