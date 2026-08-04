import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Product, Category, Order, Coupon, Review, Banner, Customer, StoreSettings, CMSPage, CartItem, Currency, OrderStatus, MenuItem
} from '../types';
import {
  INITIAL_CATEGORIES, INITIAL_STORE_SETTINGS, INITIAL_CMS_PAGES
} from '../data/mockData';

const DEFAULT_MENU_ITEMS: MenuItem[] = [
  { id: 'm-1', label: 'Home', targetType: 'view', targetValue: 'home' },
  { id: 'm-2', label: 'New Arrivals', targetType: 'category', targetValue: 'new-arrivals' },
  { id: 'm-3', label: 'Pret', targetType: 'category', targetValue: 'pret' },
  { id: 'm-4', label: 'Luxury Pret', targetType: 'category', targetValue: 'luxury-pret' },
  { id: 'm-5', label: 'Unstitched', targetType: 'category', targetValue: 'unstitched' },
  { id: 'm-6', label: 'Sale', targetType: 'category', targetValue: 'sale' },
  { id: 'm-7', label: 'Contact', targetType: 'view', targetValue: 'contact' },
];

interface AppContextType {
  // Navigation & UI State
  currentView: string;
  setCurrentView: (view: string) => void;
  selectedProductId: string | null;
  setSelectedProductId: (id: string | null) => void;
  selectedCategorySlug: string | null;
  setSelectedCategorySlug: (slug: string | null) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  isCartDrawerOpen: boolean;
  setIsCartDrawerOpen: (open: boolean) => void;
  currency: Currency;
  setCurrency: (c: Currency) => void;

  // Storefront Data
  products: Product[];
  categories: Category[];
  orders: Order[];
  coupons: Coupon[];
  reviews: Review[];
  banners: Banner[];
  customers: Customer[];
  settings: StoreSettings;
  cmsPages: CMSPage[];
  menuItems: MenuItem[];

  // Navigation Menu Management
  updateMenuItems: (items: MenuItem[]) => void;

  // Data Reset & Seeding Controls
  clearAllAdminRecords: () => void;
  restoreSampleData: () => void;

  // Cart & Wishlist
  cart: CartItem[];
  addToCart: (product: Product, size: string, color: string, qty?: number) => void;
  removeFromCart: (productId: string, size: string, color: string) => void;
  updateCartQuantity: (productId: string, size: string, color: string, qty: number) => void;
  clearCart: () => void;
  activeCoupon: Coupon | null;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;

  wishlist: string[]; // product IDs
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;

  // Order Operations
  createOrder: (orderData: Omit<Order, 'id' | 'createdAt' | 'trackingCode' | 'timeline'>) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus, adminNote?: string) => void;
  getOrderById: (orderId: string) => Order | undefined;

  // Admin Data CRUD Operations
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  duplicateProduct: (id: string) => void;

  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (category: Category) => void;
  deleteCategory: (id: string) => void;

  addCoupon: (coupon: Omit<Coupon, 'id' | 'timesUsed'>) => void;
  updateCoupon: (coupon: Coupon) => void;
  deleteCoupon: (id: string) => void;

  addReview: (productId: string, productName: string, customerName: string, customerEmail: string, rating: number, comment: string) => void;
  updateReviewStatus: (reviewId: string, status: 'Approved' | 'Pending' | 'Rejected') => void;
  replyReview: (reviewId: string, reply: string) => void;

  addBanner: (banner: Omit<Banner, 'id'>) => void;
  updateBanner: (banner: Banner) => void;
  deleteBanner: (id: string) => void;

  updateSettings: (newSettings: StoreSettings) => void;
  updateCMSPage: (page: CMSPage) => void;

  // Authentication & Roles
  userRole: 'customer' | 'admin';
  setUserRole: (role: 'customer' | 'admin') => void;
  
  // Admin Auth
  isAdminAuthenticated: boolean;
  loginAdmin: (email: string, pass: string) => boolean;
  logoutAdmin: () => void;

  // Customer Auth
  isCustomerAuthenticated: boolean;
  currentUser: Customer | null;
  setCurrentUser: (user: Customer | null) => void;
  isCustomerAuthModalOpen: boolean;
  setIsCustomerAuthModalOpen: (open: boolean) => void;
  loginCustomer: (email: string, pass: string) => { success: boolean; message: string };
  registerCustomer: (data: { name: string; email: string; phone: string; password: string }) => { success: boolean; message: string };
  logoutCustomer: () => void;

  // Order Tracking State
  trackSearch: { orderId: string; contact: string };
  setTrackSearch: (data: { orderId: string; contact: string }) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation
  const [currentView, setCurrentView] = useState<string>('home');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState<boolean>(false);
  const [currency, setCurrency] = useState<Currency>('PKR');

  // Admin Auth State
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('sasa_admin_authed') === 'true';
  });

  // Customer Auth State
  const [isCustomerAuthenticated, setIsCustomerAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('sasa_customer_authed') === 'true';
  });

  const [isCustomerAuthModalOpen, setIsCustomerAuthModalOpen] = useState<boolean>(false);

  const [currentUser, setCurrentUser] = useState<Customer | null>(() => {
    const saved = localStorage.getItem('sasa_current_customer');
    if (saved) return JSON.parse(saved);
    return null;
  });

  // Navigation Menu State
  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => {
    const saved = localStorage.getItem('sasa_menu_items');
    return saved ? JSON.parse(saved) : DEFAULT_MENU_ITEMS;
  });

  // Storefront Data - Defaults to empty arrays so admin panel starts EMPTY as requested
  const [products, setProducts] = useState<Product[]>(() => {
    const isWiped = localStorage.getItem('sasa_v2_admin_wiped');
    if (!isWiped) {
      localStorage.setItem('sasa_products', JSON.stringify([]));
      localStorage.setItem('sasa_orders', JSON.stringify([]));
      localStorage.setItem('sasa_coupons', JSON.stringify([]));
      localStorage.setItem('sasa_reviews', JSON.stringify([]));
      localStorage.setItem('sasa_banners', JSON.stringify([]));
      localStorage.setItem('sasa_customers', JSON.stringify([]));
      localStorage.setItem('sasa_v2_admin_wiped', 'true');
      return [];
    }
    const saved = localStorage.getItem('sasa_products');
    return saved ? JSON.parse(saved) : [];
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('sasa_categories');
    return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('sasa_orders');
    return saved ? JSON.parse(saved) : [];
  });

  const [coupons, setCoupons] = useState<Coupon[]>(() => {
    const saved = localStorage.getItem('sasa_coupons');
    return saved ? JSON.parse(saved) : [];
  });

  const [reviews, setReviews] = useState<Review[]>(() => {
    const saved = localStorage.getItem('sasa_reviews');
    return saved ? JSON.parse(saved) : [];
  });

  const [banners, setBanners] = useState<Banner[]>(() => {
    const saved = localStorage.getItem('sasa_banners');
    return saved ? JSON.parse(saved) : [];
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem('sasa_customers');
    return saved ? JSON.parse(saved) : [];
  });

  const [settings, setSettings] = useState<StoreSettings>(() => {
    const saved = localStorage.getItem('sasa_settings');
    return saved ? JSON.parse(saved) : INITIAL_STORE_SETTINGS;
  });

  const [cmsPages, setCmsPages] = useState<CMSPage[]>(() => {
    const saved = localStorage.getItem('sasa_cms');
    return saved ? JSON.parse(saved) : INITIAL_CMS_PAGES;
  });

  // Cart & Wishlist State
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('sasa_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [wishlist, setWishlist] = useState<string[]>(() => {
    const saved = localStorage.getItem('sasa_wishlist');
    return saved ? JSON.parse(saved) : [];
  });

  const [activeCoupon, setActiveCoupon] = useState<Coupon | null>(null);

  // User & Role State
  const [userRole, setUserRole] = useState<'customer' | 'admin'>('customer');
  const [trackSearch, setTrackSearch] = useState<{ orderId: string; contact: string }>({ orderId: '', contact: '' });

  // Save to LocalStorage effects
  useEffect(() => { localStorage.setItem('sasa_menu_items', JSON.stringify(menuItems)); }, [menuItems]);
  useEffect(() => { localStorage.setItem('sasa_products', JSON.stringify(products)); }, [products]);
  useEffect(() => { localStorage.setItem('sasa_categories', JSON.stringify(categories)); }, [categories]);
  useEffect(() => { localStorage.setItem('sasa_orders', JSON.stringify(orders)); }, [orders]);
  useEffect(() => { localStorage.setItem('sasa_coupons', JSON.stringify(coupons)); }, [coupons]);
  useEffect(() => { localStorage.setItem('sasa_reviews', JSON.stringify(reviews)); }, [reviews]);
  useEffect(() => { localStorage.setItem('sasa_banners', JSON.stringify(banners)); }, [banners]);
  useEffect(() => { localStorage.setItem('sasa_customers', JSON.stringify(customers)); }, [customers]);
  useEffect(() => { localStorage.setItem('sasa_settings', JSON.stringify(settings)); }, [settings]);
  useEffect(() => { localStorage.setItem('sasa_cms', JSON.stringify(cmsPages)); }, [cmsPages]);
  useEffect(() => { localStorage.setItem('sasa_cart', JSON.stringify(cart)); }, [cart]);
  useEffect(() => { localStorage.setItem('sasa_wishlist', JSON.stringify(wishlist)); }, [wishlist]);
  useEffect(() => { localStorage.setItem('sasa_admin_authed', String(isAdminAuthenticated)); }, [isAdminAuthenticated]);
  useEffect(() => { localStorage.setItem('sasa_customer_authed', String(isCustomerAuthenticated)); }, [isCustomerAuthenticated]);
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('sasa_current_customer', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('sasa_current_customer');
    }
  }, [currentUser]);

  const updateMenuItems = (items: MenuItem[]) => {
    setMenuItems(items);
  };

  // Data Wipe and Sample Seeding Functions
  const clearAllAdminRecords = () => {
    setProducts([]);
    setOrders([]);
    setCoupons([]);
    setReviews([]);
    setBanners([]);
    setCustomers([]);
    localStorage.setItem('sasa_products', JSON.stringify([]));
    localStorage.setItem('sasa_orders', JSON.stringify([]));
    localStorage.setItem('sasa_coupons', JSON.stringify([]));
    localStorage.setItem('sasa_reviews', JSON.stringify([]));
    localStorage.setItem('sasa_banners', JSON.stringify([]));
    localStorage.setItem('sasa_customers', JSON.stringify([]));
  };

  const restoreSampleData = () => {
    setProducts(INITIAL_PRODUCTS);
    setCategories(INITIAL_CATEGORIES);
    setOrders(INITIAL_ORDERS);
    setCoupons(INITIAL_COUPONS);
    setReviews(INITIAL_REVIEWS);
    setBanners(INITIAL_BANNERS);
    setCustomers(INITIAL_CUSTOMERS);
  };

  // Admin Auth Logic
  const loginAdmin = (email: string, pass: string): boolean => {
    // Standard credential validation
    if (email.trim().toLowerCase() === 'admin@sasaofficial.com' && pass === 'admin123') {
      setIsAdminAuthenticated(true);
      setUserRole('admin');
      return true;
    }
    // Allow any non-empty input for convenience if user wants custom login
    if (email.trim() && pass.trim()) {
      setIsAdminAuthenticated(true);
      setUserRole('admin');
      return true;
    }
    return false;
  };

  const logoutAdmin = () => {
    setIsAdminAuthenticated(false);
    setUserRole('customer');
    setCurrentView('home');
  };

  // Customer Auth Logic
  const loginCustomer = (email: string, pass: string) => {
    const formattedEmail = email.trim().toLowerCase();
    const existing = customers.find(c => c.email.toLowerCase() === formattedEmail);
    if (existing) {
      setCurrentUser(existing);
      setIsCustomerAuthenticated(true);
      setIsCustomerAuthModalOpen(false);
      return { success: true, message: `Welcome back, ${existing.name}!` };
    }
    
    // Create new customer session
    const newCust: Customer = {
      id: `cust-${Date.now()}`,
      name: email.split('@')[0],
      email: formattedEmail,
      phone: '+92 300 0000000',
      totalOrders: 0,
      totalSpent: 0,
      city: 'Lahore',
      createdAt: new Date().toISOString().split('T')[0]
    };
    setCustomers(prev => [...prev, newCust]);
    setCurrentUser(newCust);
    setIsCustomerAuthenticated(true);
    setIsCustomerAuthModalOpen(false);
    return { success: true, message: `Account signed in!` };
  };

  const registerCustomer = (data: { name: string; email: string; phone: string; password: string }) => {
    const formattedEmail = data.email.trim().toLowerCase();
    const existing = customers.find(c => c.email.toLowerCase() === formattedEmail);
    if (existing) {
      return { success: false, message: 'An account with this email already exists. Please sign in.' };
    }

    const newCust: Customer = {
      id: `cust-${Date.now()}`,
      name: data.name,
      email: formattedEmail,
      phone: data.phone || '+92 300 0000000',
      totalOrders: 0,
      totalSpent: 0,
      city: 'Lahore',
      createdAt: new Date().toISOString().split('T')[0],
      password: data.password
    };

    setCustomers(prev => [...prev, newCust]);
    setCurrentUser(newCust);
    setIsCustomerAuthenticated(true);
    setIsCustomerAuthModalOpen(false);
    return { success: true, message: 'Registration successful! Welcome to SASA Privé.' };
  };

  const logoutCustomer = () => {
    setIsCustomerAuthenticated(false);
    setCurrentUser(null);
  };

  // Cart Functions
  const addToCart = (product: Product, size: string, color: string, qty: number = 1) => {
    setCart(prev => {
      const existingIndex = prev.findIndex(item => item.product.id === product.id && item.selectedSize === size && item.selectedColor === color);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += qty;
        return updated;
      }
      return [...prev, { product, selectedSize: size, selectedColor: color, quantity: qty }];
    });
    setIsCartDrawerOpen(true);
  };

  const removeFromCart = (productId: string, size: string, color: string) => {
    setCart(prev => prev.filter(item => !(item.product.id === productId && item.selectedSize === size && item.selectedColor === color)));
  };

  const updateCartQuantity = (productId: string, size: string, color: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(productId, size, color);
      return;
    }
    setCart(prev => prev.map(item => {
      if (item.product.id === productId && item.selectedSize === size && item.selectedColor === color) {
        return { ...item, quantity: qty };
      }
      return item;
    }));
  };

  const clearCart = () => {
    setCart([]);
    setActiveCoupon(null);
  };

  const applyCoupon = (code: string) => {
    const formatted = code.trim().toUpperCase();
    const found = coupons.find(c => c.code === formatted && c.isActive);
    if (!found) {
      return { success: false, message: 'Invalid or expired coupon code.' };
    }
    const subtotal = cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
    if (subtotal < found.minOrderValue) {
      return { success: false, message: `Minimum order value for this coupon is PKR ${found.minOrderValue.toLocaleString()}` };
    }
    setActiveCoupon(found);
    return { success: true, message: `Coupon ${found.code} applied successfully!` };
  };

  const removeCoupon = () => {
    setActiveCoupon(null);
  };

  // Wishlist Functions
  const toggleWishlist = (productId: string) => {
    setWishlist(prev => prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]);
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  // Order Functions
  const createOrder = (orderData: Omit<Order, 'id' | 'createdAt' | 'trackingCode' | 'timeline'>): Order => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const id = `SASA-${randomNum}`;
    const trackingCode = `SASA-TRK-${randomNum}-PK`;
    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 16);

    const initialTimeline = [
      { status: 'Confirmed' as OrderStatus, timestamp: nowStr, description: `Order placed via ${orderData.paymentMethod}`, completed: true },
      { status: 'Packed' as OrderStatus, timestamp: '', description: 'Item packaging in progress', completed: false },
      { status: 'Shipped' as OrderStatus, timestamp: '', description: 'Handover to courier', completed: false },
      { status: 'Out for Delivery' as OrderStatus, timestamp: '', description: 'Delivery rider dispatched', completed: false },
      { status: 'Delivered' as OrderStatus, timestamp: '', description: 'Final delivery', completed: false }
    ];

    const newOrder: Order = {
      ...orderData,
      id,
      trackingCode,
      createdAt: nowStr,
      timeline: initialTimeline
    };

    setOrders(prev => [newOrder, ...prev]);

    // Update coupon usage count if used
    if (orderData.couponCode) {
      setCoupons(prev => prev.map(c => c.code === orderData.couponCode ? { ...c, timesUsed: c.timesUsed + 1 } : c));
    }

    // Decrement stock levels
    setProducts(prev => prev.map(p => {
      const itemInCart = orderData.items.find(i => i.productId === p.id);
      if (itemInCart) {
        return { ...p, stock: Math.max(0, p.stock - itemInCart.quantity) };
      }
      return p;
    }));

    clearCart();
    return newOrder;
  };

  const updateOrderStatus = (orderId: string, newStatus: OrderStatus, adminNote?: string) => {
    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 16);
    setOrders(prev => prev.map(order => {
      if (order.id === orderId) {
        const updatedTimeline = order.timeline.map(t => {
          if (t.status === newStatus) {
            return { ...t, timestamp: nowStr, completed: true };
          }
          return t;
        });

        return {
          ...order,
          orderStatus: newStatus,
          paymentStatus: newStatus === 'Delivered' ? 'Paid' : order.paymentStatus,
          adminNotes: adminNote || order.adminNotes,
          timeline: updatedTimeline
        };
      }
      return order;
    }));
  };

  const getOrderById = (orderId: string) => orders.find(o => o.id.toLowerCase() === orderId.toLowerCase());

  // Admin CRUD Operations
  const addProduct = (productData: Omit<Product, 'id' | 'createdAt'>) => {
    const newProd: Product = {
      ...productData,
      id: `prod-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setProducts(prev => [newProd, ...prev]);
  };

  const updateProduct = (updated: Product) => {
    setProducts(prev => prev.map(p => p.id === updated.id ? updated : p));
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const duplicateProduct = (id: string) => {
    const target = products.find(p => p.id === id);
    if (!target) return;
    const duplicated: Product = {
      ...target,
      id: `prod-${Date.now()}`,
      name: `${target.name} (Copy)`,
      sku: `${target.sku}-COPY`,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setProducts(prev => [duplicated, ...prev]);
  };

  const addCategory = (categoryData: Omit<Category, 'id'>) => {
    const newCat: Category = {
      ...categoryData,
      id: `cat-${Date.now()}`
    };
    setCategories(prev => [...prev, newCat]);
  };

  const updateCategory = (updated: Category) => {
    setCategories(prev => prev.map(c => c.id === updated.id ? updated : c));
  };

  const deleteCategory = (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
  };

  const addCoupon = (couponData: Omit<Coupon, 'id' | 'timesUsed'>) => {
    const newCoupon: Coupon = {
      ...couponData,
      id: `coup-${Date.now()}`,
      timesUsed: 0
    };
    setCoupons(prev => [newCoupon, ...prev]);
  };

  const updateCoupon = (updated: Coupon) => {
    setCoupons(prev => prev.map(c => c.id === updated.id ? updated : c));
  };

  const deleteCoupon = (id: string) => {
    setCoupons(prev => prev.filter(c => c.id !== id));
  };

  const addReview = (productId: string, productName: string, customerName: string, customerEmail: string, rating: number, comment: string) => {
    const newRev: Review = {
      id: `rev-${Date.now()}`,
      productId,
      productName,
      customerName,
      customerEmail,
      rating,
      comment,
      date: new Date().toISOString().split('T')[0],
      status: 'Approved'
    };
    setReviews(prev => [newRev, ...prev]);
  };

  const updateReviewStatus = (reviewId: string, status: 'Approved' | 'Pending' | 'Rejected') => {
    setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, status } : r));
  };

  const replyReview = (reviewId: string, reply: string) => {
    setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, adminReply: reply } : r));
  };

  const addBanner = (bannerData: Omit<Banner, 'id'>) => {
    const newBanner: Banner = {
      ...bannerData,
      id: `ban-${Date.now()}`
    };
    setBanners(prev => [...prev, newBanner]);
  };

  const updateBanner = (updated: Banner) => {
    setBanners(prev => prev.map(b => b.id === updated.id ? updated : b));
  };

  const deleteBanner = (id: string) => {
    setBanners(prev => prev.filter(b => b.id !== id));
  };

  const updateSettings = (newSettings: StoreSettings) => setSettings(newSettings);

  const updateCMSPage = (page: CMSPage) => {
    setCmsPages(prev => prev.map(p => p.id === page.id ? page : p));
  };

  return (
    <AppContext.Provider value={{
      currentView, setCurrentView,
      selectedProductId, setSelectedProductId,
      selectedCategorySlug, setSelectedCategorySlug,
      isSearchOpen, setIsSearchOpen,
      isCartDrawerOpen, setIsCartDrawerOpen,
      currency, setCurrency,
      products, categories, orders, coupons, reviews, banners, customers, settings, cmsPages,
      clearAllAdminRecords, restoreSampleData,
      cart, addToCart, removeFromCart, updateCartQuantity, clearCart,
      activeCoupon, applyCoupon, removeCoupon,
      wishlist, toggleWishlist, isInWishlist,
      createOrder, updateOrderStatus, getOrderById,
      addProduct, updateProduct, deleteProduct, duplicateProduct,
      addCategory, updateCategory, deleteCategory,
      addCoupon, updateCoupon, deleteCoupon,
      addReview, updateReviewStatus, replyReview,
      addBanner, updateBanner, deleteBanner,
      updateSettings, updateCMSPage,
      userRole, setUserRole,
      isAdminAuthenticated, loginAdmin, logoutAdmin,
      isCustomerAuthenticated, currentUser, setCurrentUser,
      isCustomerAuthModalOpen, setIsCustomerAuthModalOpen,
      loginCustomer, registerCustomer, logoutCustomer,
      trackSearch, setTrackSearch
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
