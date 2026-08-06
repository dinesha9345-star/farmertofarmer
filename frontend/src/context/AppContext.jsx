import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../lib/api';
import { toast } from 'sonner';
import { useAuth } from './AuthContext';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const { user, isAuthed } = useAuth();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [orders, setOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [language, setLanguage] = useState('English');
  const [themeMode, setThemeMode] = useState('light');
  const [loading, setLoading] = useState({ products: false, cart: false });

  // Load products + categories once
  const loadProducts = useCallback(async (params = {}) => {
    setLoading((l) => ({ ...l, products: true }));
    try {
      const { data } = await api.get('/products', { params });
      setProducts(data);
    } finally {
      setLoading((l) => ({ ...l, products: false }));
    }
  }, []);

  const loadCategories = useCallback(async () => {
    const { data } = await api.get('/categories');
    setCategories(data);
  }, []);

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, [loadProducts, loadCategories]);

  // Cart operations (require auth)
  const loadCart = useCallback(async () => {
    if (!isAuthed) { setCart([]); return; }
    try {
      const { data } = await api.get('/cart');
      setCart(data.items || []);
    } catch (_) {}
  }, [isAuthed]);

  const loadWishlist = useCallback(async () => {
    if (!isAuthed) { setWishlist([]); return; }
    try {
      const { data } = await api.get('/wishlist');
      setWishlist(data.items || []);
    } catch (_) {}
  }, [isAuthed]);

  const loadOrders = useCallback(async () => {
    if (!isAuthed) { setOrders([]); return; }
    try {
      const { data } = await api.get('/orders');
      setOrders(data);
    } catch (_) {}
  }, [isAuthed]);

  useEffect(() => {
    loadCart();
    loadWishlist();
    loadOrders();
  }, [loadCart, loadWishlist, loadOrders]);

  const addToCart = async (product, qty = 1) => {
    if (!isAuthed) { toast.error('Please sign in to add items to your cart'); return; }
    try {
      const { data } = await api.post('/cart/add', { productId: product.id, quantity: qty });
      setCart(data.items || []);
      toast.success(`Added ${product.name} to cart!`);
    } catch (e) {
      toast.error('Could not add to cart');
    }
  };

  const removeFromCart = async (productId) => {
    const { data } = await api.post('/cart/update', { productId, quantity: 0 });
    setCart(data.items || []);
    toast.info('Item removed from cart');
  };

  const updateCartQty = async (productId, quantity) => {
    const { data } = await api.post('/cart/update', { productId, quantity });
    setCart(data.items || []);
  };

  const clearCart = async () => {
    await api.post('/cart/clear');
    setCart([]);
  };

  const toggleWishlist = async (productId) => {
    if (!isAuthed) { toast.error('Please sign in to use wishlist'); return; }
    const { data } = await api.post('/wishlist/toggle', { productId });
    setWishlist(data.items || []);
    toast.success(data.items.includes(productId) ? 'Added to wishlist!' : 'Removed from wishlist');
  };

  const addProduct = async (newProd) => {
    try {
      const { data } = await api.post('/products', newProd);
      setProducts((prev) => [data, ...prev]);
      toast.success('Harvest published successfully!');
      return data;
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Could not publish harvest');
      throw e;
    }
  };

  const uploadImage = async (file) => {
    const fd = new FormData();
    fd.append('file', file);
    const { data } = await api.post('/upload/image', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
    return data;
  };

  return (
    <AppContext.Provider value={{
      user,
      products, setProducts, loadProducts,
      categories,
      cart, addToCart, removeFromCart, updateCartQty, clearCart,
      wishlist, toggleWishlist,
      orders, setOrders, loadOrders,
      searchQuery, setSearchQuery, selectedCategory, setSelectedCategory,
      language, setLanguage, themeMode, setThemeMode,
      addProduct, uploadImage,
      loading,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
