import React, { createContext, useContext, useState, useEffect } from 'react';
import { MOCK_PRODUCTS, MOCK_CATEGORIES, MOCK_FARMERS, MOCK_ORDERS } from '../mock';
import { toast } from 'sonner';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [userRole, setUserRole] = useState('customer'); // 'customer', 'farmer', 'admin', 'guest'
  const [currentUser, setCurrentUser] = useState({
    id: 'c1',
    name: 'Siddharth Sharma',
    email: 'siddharth@example.com',
    role: 'customer',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    phone: '+91 98765 43210',
    location: 'Pune, Maharashtra'
  });

  const [products, setProducts] = useState(MOCK_PRODUCTS);
  const [categories, setCategories] = useState(MOCK_CATEGORIES);
  const [farmers, setFarmers] = useState(MOCK_FARMERS);
  const [orders, setOrders] = useState(MOCK_ORDERS);
  const [cart, setCart] = useState([
    { product: MOCK_PRODUCTS[0], quantity: 2 },
    { product: MOCK_PRODUCTS[1], quantity: 1 }
  ]);
  const [wishlist, setWishlist] = useState(['p1', 'p3']);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [language, setLanguage] = useState('English'); // English, Tamil, Hindi
  const [themeMode, setThemeMode] = useState('light'); // light, dark

  // Cart methods
  const addToCart = (product, qty = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.product.id === product.id ? { ...item, quantity: item.quantity + qty } : item
        );
      }
      return [...prev, { product, quantity: qty }];
    });
    toast.success(`Added ${product.name} to cart!`);
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
    toast.info("Item removed from cart");
  };

  const updateCartQty = (productId, qty) => {
    if (qty <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev => prev.map(item => 
      item.product.id === productId ? { ...item, quantity: qty } : item
    ));
  };

  const clearCart = () => setCart([]);

  // Wishlist methods
  const toggleWishlist = (productId) => {
    setWishlist(prev => {
      if (prev.includes(productId)) {
        toast.info("Removed from wishlist");
        return prev.filter(id => id !== productId);
      } else {
        toast.success("Added to wishlist!");
        return [...prev, productId];
      }
    });
  };

  // Add Product (Farmer)
  const addProduct = (newProd) => {
    const productWithId = {
      ...newProd,
      id: `p-${Date.now()}`,
      farmerId: currentUser.id,
      farmerName: currentUser.name,
      farmerAvatar: currentUser.avatar,
      rating: 5.0,
      reviewsCount: 0,
      salesCount: 0
    };
    setProducts(prev => [productWithId, ...prev]);
    toast.success("New product published successfully!");
  };

  // Switch role helper for testing
  const switchRole = (role) => {
    setUserRole(role);
    if (role === 'customer') {
      setCurrentUser({ id: 'c1', name: 'Siddharth Sharma', email: 'customer@farm2home.com', role: 'customer', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200' });
    } else if (role === 'farmer') {
      setCurrentUser({ id: 'f1', name: 'Ramesh Patil', email: 'farmer@farm2home.com', role: 'farmer', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200' });
    } else if (role === 'admin') {
      setCurrentUser({ id: 'a1', name: 'Admin Master', email: 'admin@farm2home.com', role: 'admin', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200' });
    }
    toast.success(`Switched role to ${role.toUpperCase()}`);
  };

  return (
    <AppContext.Provider value={{
      userRole, setUserRole, currentUser, setCurrentUser,
      products, setProducts, categories, farmers, orders, setOrders,
      cart, addToCart, removeFromCart, updateCartQty, clearCart,
      wishlist, toggleWishlist, addProduct,
      searchQuery, setSearchQuery, selectedCategory, setSelectedCategory,
      language, setLanguage, themeMode, setThemeMode, switchRole
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
