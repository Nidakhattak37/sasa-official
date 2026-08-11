import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Product, Category, Order, Coupon, Review, Banner, Customer, StoreSettings, CMSPage, CartItem, Currency, OrderStatus, MenuItem, InstantClassicsSection, DualEditorialSection, SaleCampaign, AdminUser
} from '../types';
import {
  INITIAL_PRODUCTS, INITIAL_CATEGORIES, INITIAL_ORDERS, INITIAL_COUPONS, INITIAL_REVIEWS, INITIAL_BANNERS, INITIAL_CUSTOMERS,
  INITIAL_STORE_SETTINGS, INITIAL_CMS_PAGES, DEFAULT_INSTANT_CLASSICS, DEFAULT_DUAL_EDITORIAL
} from '../data/mockData';

const DEFAULT_MENU_ITEMS: MenuItem[] = [
  { id: 'm-1', label: 'Home', targetType: 'view', targetValue: 'home' },
  { id: 'm-2', label: 'New Arrivals', targetType: 'category', targetValue: 'new-arrivals' },
  { id: 'm-3', label: 'Pret', targetType: 'category', targetValue: 'pret' },
  { id: 'm-4', label: 'Unstitched', targetType: 'category', targetValue: 'unstitched' },
  { id: 'm-5', label: 'Contact', targetType: 'view', targetValue: 'contact' },
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
  instantClassics: InstantClassicsSection;
  dualEditorial: DualEditorialSection;
  updateInstantClassics: (data: InstantClassicsSection) => void;
  updateDualEditorial: (data: DualEditorialSection) => void;

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
  clearWishlist: () => void;

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

  // Sale Campaigns Management
  saleCampaigns: SaleCampaign[];
  addSaleCampaign: (campaign: Omit<SaleCampaign, 'id' | 'createdAt'>) => void;
  updateSaleCampaign: (campaign: SaleCampaign) => void;
  deleteSaleCampaign: (id: string) => void;
  applySaleCampaign: (campaignId: string) => void;
  revertSaleCampaign: (campaignId: string) => void;
  restoreAllOriginalPrices: () => void;

  // Team & Admin Users Management
  adminUsers: AdminUser[];
  currentAdmin: AdminUser | null;
  addAdminUser: (admin: Omit<AdminUser, 'id' | 'createdAt'>) => { success: boolean; message: string };
  updateAdminUser: (admin: AdminUser) => void;
  removeAdminUser: (id: string) => { success: boolean; message: string };

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

const INITIAL_ADMIN_USERS: AdminUser[] = [
  {
    id: 'admin-1',
    name: 'Admin Director',
    email: 'info@sasaofficial.com',
    password: 'admin123',
    role: 'Super Admin',
    status: 'active',
    createdAt: '2025-01-01',
    lastLogin: '2025-01-01'
  }
];

const INITIAL_SALE_CAMPAIGNS: SaleCampaign[] = [
  {
    id: 'sale-1',
    name: '2024 Collection Clearance',
    targetType: 'year',
    targetValue: '2024',
    discountPercentage: 25,
    isActive: false,
    createdAt: '2025-01-10'
  },
  {
    id: 'sale-2',
    name: 'Unstitched Festive Promo',
    targetType: 'category',
    targetValue: 'Unstitched',
    discountPercentage: 20,
    isActive: false,
    createdAt: '2025-01-15'
  }
];

const isAdminRoute = (pathname: string) => {
  if (typeof window === 'undefined') return false;
  const p = (pathname || window.location.pathname || '').toLowerCase().replace(/\/$/, '');
  return p === '/sasa/admin' || p === '/admin' || p.startsWith('/sasa/admin');
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation
  const [currentView, setCurrentView] = useState<string>('home');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState<boolean>(false);
  const [currency, setCurrency] = useState<Currency>('PKR');

  // User & Role State - Checks if URL is /sasa/admin
  const [userRole, setUserRole] = useState<'customer' | 'admin'>(() => {
    if (typeof window !== 'undefined' && isAdminRoute(window.location.pathname)) {
      return 'admin';
    }
    return 'customer';
  });

  // Admin Auth State
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('sasa_admin_authed') === 'true';
  });

  // Admin Users & Team State
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>(() => {
    const saved = localStorage.getItem('sasa_admin_users');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {
        return INITIAL_ADMIN_USERS;
      }
    }
    return INITIAL_ADMIN_USERS;
  });

  const [currentAdmin, setCurrentAdmin] = useState<AdminUser | null>(() => {
    const saved = localStorage.getItem('sasa_current_admin');
    if (saved) {
      try { return JSON.parse(saved); } catch { return null; }
    }
    return null;
  });

  // Sale Campaigns State
  const [saleCampaigns, setSaleCampaigns] = useState<SaleCampaign[]>(() => {
    const saved = localStorage.getItem('sasa_sale_campaigns');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        return INITIAL_SALE_CAMPAIGNS;
      }
    }
    return INITIAL_SALE_CAMPAIGNS;
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

  // Storefront Data - Initialized with rich luxury catalog, persisted locally and synced with MongoDB Atlas
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('sasa_products');
    if (saved) {
      try {
        const parsed: Product[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map(p => ({
            ...p,
            sizes: (p.sizes || []).filter(sz => sz !== 'Custom Stitching' && sz !== 'Customized Stitching')
          }));
        }
      } catch {
        return INITIAL_PRODUCTS;
      }
    }
    return INITIAL_PRODUCTS;
  });

  // Helper to remove any MongoDB internal _id before saving to state or sending over API
  const stripMongoId = <T extends Record<string, any>>(obj: T): T => {
    if (!obj || typeof obj !== 'object') return obj;
    const { _id, ...rest } = obj;
    return rest as T;
  };

  // Sync products & orders from MongoDB Atlas on mount if server database has records
  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.products) && data.products.length > 0) {
          const cleanProds = data.products.map((p: any) => stripMongoId(p));
          setProducts(cleanProds);
          localStorage.setItem('sasa_products', JSON.stringify(cleanProds));
        }
      })
      .catch(() => {});

    fetch('/api/orders')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.orders) && data.orders.length > 0) {
          const cleanOrders = data.orders.map((o: any) => stripMongoId(o));
          setOrders(prev => {
            // Merge existing local orders with MongoDB orders
            const map = new Map();
            cleanOrders.forEach((o: Order) => map.set(o.id, o));
            prev.forEach(o => {
              if (!map.has(o.id)) map.set(o.id, o);
            });
            const merged = Array.from(map.values());
            localStorage.setItem('sasa_orders', JSON.stringify(merged));
            return merged;
          });
        }
      })
      .catch(() => {});
  }, []);

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
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.length > 0) return parsed;
    }
    return INITIAL_REVIEWS;
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

  const [instantClassics, setInstantClassics] = useState<InstantClassicsSection>(() => {
    const saved = localStorage.getItem('sasa_instant_classics');
    return saved ? JSON.parse(saved) : DEFAULT_INSTANT_CLASSICS;
  });

  const [dualEditorial, setDualEditorial] = useState<DualEditorialSection>(() => {
    const saved = localStorage.getItem('sasa_dual_editorial');
    return saved ? JSON.parse(saved) : DEFAULT_DUAL_EDITORIAL;
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
  useEffect(() => { localStorage.setItem('sasa_instant_classics', JSON.stringify(instantClassics)); }, [instantClassics]);
  useEffect(() => { localStorage.setItem('sasa_dual_editorial', JSON.stringify(dualEditorial)); }, [dualEditorial]);
  useEffect(() => { localStorage.setItem('sasa_cart', JSON.stringify(cart)); }, [cart]);
  useEffect(() => { localStorage.setItem('sasa_wishlist', JSON.stringify(wishlist)); }, [wishlist]);
  useEffect(() => { localStorage.setItem('sasa_admin_authed', String(isAdminAuthenticated)); }, [isAdminAuthenticated]);
  useEffect(() => { localStorage.setItem('sasa_customer_authed', String(isCustomerAuthenticated)); }, [isCustomerAuthenticated]);
  useEffect(() => { localStorage.setItem('sasa_admin_users', JSON.stringify(adminUsers)); }, [adminUsers]);
  useEffect(() => { localStorage.setItem('sasa_sale_campaigns', JSON.stringify(saleCampaigns)); }, [saleCampaigns]);
  useEffect(() => {
    if (currentAdmin) {
      localStorage.setItem('sasa_current_admin', JSON.stringify(currentAdmin));
    } else {
      localStorage.removeItem('sasa_current_admin');
    }
  }, [currentAdmin]);
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('sasa_current_customer', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('sasa_current_customer');
    }
  }, [currentUser]);

  // URL listener for /sasa/admin route
  useEffect(() => {
    const checkUrlRoute = () => {
      if (typeof window !== 'undefined') {
        const isAdm = isAdminRoute(window.location.pathname);
        if (isAdm && userRole !== 'admin') {
          setUserRole('admin');
        }
      }
    };

    window.addEventListener('popstate', checkUrlRoute);
    checkUrlRoute();
    return () => window.removeEventListener('popstate', checkUrlRoute);
  }, [userRole]);

  // Sync URL when userRole changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (userRole === 'admin') {
        if (!isAdminRoute(window.location.pathname)) {
          window.history.pushState(null, '', '/sasa/admin');
        }
      }
    }
  }, [userRole]);

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

  // Sale Campaigns Management Engine
  const addSaleCampaign = (campaignData: Omit<SaleCampaign, 'id' | 'createdAt'>) => {
    const newCamp: SaleCampaign = {
      ...campaignData,
      id: `sale-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setSaleCampaigns(prev => [newCamp, ...prev]);
    if (newCamp.isActive) {
      applySaleCampaignLogic(newCamp);
    }
  };

  const updateSaleCampaign = (updated: SaleCampaign) => {
    setSaleCampaigns(prev => prev.map(c => c.id === updated.id ? updated : c));
    if (updated.isActive) {
      applySaleCampaignLogic(updated);
    } else {
      revertSaleCampaignLogic(updated);
    }
  };

  const deleteSaleCampaign = (id: string) => {
    const target = saleCampaigns.find(c => c.id === id);
    if (target && target.isActive) {
      revertSaleCampaignLogic(target);
    }
    setSaleCampaigns(prev => prev.filter(c => c.id !== id));
  };

  const applySaleCampaignLogic = (campaign: SaleCampaign) => {
    setProducts(prev => prev.map(prod => {
      let isMatch = false;
      if (campaign.targetType === 'category') {
        const prodCat = (prod.category || '').toLowerCase();
        const targetCat = (campaign.targetValue || '').toLowerCase();
        isMatch = prodCat.includes(targetCat) || targetCat.includes(prodCat);
      } else if (campaign.targetType === 'pieceType') {
        isMatch = (prod.pieceType || '').toLowerCase() === (campaign.targetValue || '').toLowerCase();
      } else if (campaign.targetType === 'year') {
        const prodYear = prod.year ? String(prod.year) : '';
        isMatch = prodYear === String(campaign.targetValue);
      } else if (campaign.targetType === 'all') {
        isMatch = true;
      }

      if (isMatch) {
        const originalBasePrice = prod.originalPrice || prod.price;
        const discountMultiplier = (100 - campaign.discountPercentage) / 100;
        const newSalePrice = Math.round(originalBasePrice * discountMultiplier);
        return {
          ...prod,
          originalPrice: originalBasePrice,
          price: newSalePrice,
          isSale: true
        };
      }
      return prod;
    }));
  };

  const revertSaleCampaignLogic = (campaign: SaleCampaign) => {
    setProducts(prev => prev.map(prod => {
      let isMatch = false;
      if (campaign.targetType === 'category') {
        const prodCat = (prod.category || '').toLowerCase();
        const targetCat = (campaign.targetValue || '').toLowerCase();
        isMatch = prodCat.includes(targetCat) || targetCat.includes(prodCat);
      } else if (campaign.targetType === 'pieceType') {
        isMatch = (prod.pieceType || '').toLowerCase() === (campaign.targetValue || '').toLowerCase();
      } else if (campaign.targetType === 'year') {
        const prodYear = prod.year ? String(prod.year) : '';
        isMatch = prodYear === String(campaign.targetValue);
      } else if (campaign.targetType === 'all') {
        isMatch = true;
      }

      if (isMatch && prod.originalPrice) {
        return {
          ...prod,
          price: prod.originalPrice,
          isSale: false
        };
      }
      return prod;
    }));
  };

  const applySaleCampaign = (campaignId: string) => {
    const campaign = saleCampaigns.find(c => c.id === campaignId);
    if (!campaign) return;
    const updated = { ...campaign, isActive: true };
    setSaleCampaigns(prev => prev.map(c => c.id === campaignId ? updated : c));
    applySaleCampaignLogic(updated);
  };

  const revertSaleCampaign = (campaignId: string) => {
    const campaign = saleCampaigns.find(c => c.id === campaignId);
    if (!campaign) return;
    const updated = { ...campaign, isActive: false };
    setSaleCampaigns(prev => prev.map(c => c.id === campaignId ? updated : c));
    revertSaleCampaignLogic(updated);
  };

  const restoreAllOriginalPrices = () => {
    setProducts(prev => prev.map(prod => ({
      ...prod,
      price: prod.originalPrice || prod.price,
      isSale: false
    })));
    setSaleCampaigns(prev => prev.map(c => ({ ...c, isActive: false })));
  };

  // Admin Users & Team Management
  const addAdminUser = (adminData: Omit<AdminUser, 'id' | 'createdAt'>) => {
    const formattedEmail = adminData.email.trim().toLowerCase();
    const existing = adminUsers.find(a => a.email.toLowerCase() === formattedEmail);
    if (existing) {
      return { success: false, message: 'An administrator with this email already exists.' };
    }
    const newAdmin: AdminUser = {
      ...adminData,
      email: formattedEmail,
      id: `admin-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setAdminUsers(prev => [newAdmin, ...prev]);
    return { success: true, message: `Administrator ${newAdmin.name} added successfully.` };
  };

  const updateAdminUser = (updated: AdminUser) => {
    setAdminUsers(prev => prev.map(a => a.id === updated.id ? updated : a));
    if (currentAdmin && currentAdmin.id === updated.id) {
      setCurrentAdmin(updated);
    }
  };

  const removeAdminUser = (id: string) => {
    if (adminUsers.length <= 1) {
      return { success: false, message: 'Cannot remove the last remaining administrator.' };
    }
    if (currentAdmin && currentAdmin.id === id) {
      return { success: false, message: 'You cannot remove your own active administrator account.' };
    }
    setAdminUsers(prev => prev.filter(a => a.id !== id));
    return { success: true, message: 'Administrator removed successfully.' };
  };

  // Admin Auth Logic
  const loginAdmin = (email: string, pass: string): boolean => {
    const formattedEmail = email.trim().toLowerCase();
    const foundAdmin = adminUsers.find(a => a.email.toLowerCase() === formattedEmail && a.password === pass);
    
    if (foundAdmin) {
      if (foundAdmin.status === 'Inactive') {
        return false;
      }
      const updatedAdmin = {
        ...foundAdmin,
        lastLogin: new Date().toISOString().split('T')[0]
      };
      updateAdminUser(updatedAdmin);
      setCurrentAdmin(updatedAdmin);
      setIsAdminAuthenticated(true);
      setUserRole('admin');
      if (typeof window !== 'undefined' && !isAdminRoute(window.location.pathname)) {
        window.history.pushState(null, '', '/sasa/admin');
      }
      return true;
    }

    // Default master credentials fallback
    if ((formattedEmail === 'info@sasaofficial.com' || formattedEmail === 'admin@sasaofficial.com') && pass === 'admin123') {
      const master = adminUsers[0] || INITIAL_ADMIN_USERS[0];
      setCurrentAdmin(master);
      setIsAdminAuthenticated(true);
      setUserRole('admin');
      if (typeof window !== 'undefined' && !isAdminRoute(window.location.pathname)) {
        window.history.pushState(null, '', '/sasa/admin');
      }
      return true;
    }

    return false;
  };

  const logoutAdmin = () => {
    setIsAdminAuthenticated(false);
    setCurrentAdmin(null);
    setUserRole('customer');
    setCurrentView('home');
    if (typeof window !== 'undefined' && window.location.pathname !== '/') {
      window.history.pushState(null, '', '/');
    }
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

  const clearWishlist = () => {
    setWishlist([]);
    localStorage.removeItem('sasa_wishlist');
  };

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
    let updatedOrderObj: Order | null = null;

    setOrders(prev => prev.map(order => {
      if (order.id === orderId) {
        const updatedTimeline = order.timeline.map(t => {
          if (t.status === newStatus) {
            return { ...t, timestamp: nowStr, completed: true };
          }
          return t;
        });

        const updated = {
          ...order,
          orderStatus: newStatus,
          paymentStatus: newStatus === 'Delivered' ? 'Paid' : order.paymentStatus,
          adminNotes: adminNote || order.adminNotes,
          timeline: updatedTimeline
        };
        updatedOrderObj = updated;
        return updated;
      }
      return order;
    }));

    if (updatedOrderObj) {
      fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: stripMongoId(updatedOrderObj) })
      }).catch(err => console.warn('[MONGODB ORDER SYNC NOTICE]', err));
    }
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

    // Asynchronously sync product metadata & image links to backend / MongoDB Atlas
    fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product: stripMongoId(newProd) })
    }).catch(err => console.warn('[MONGODB SYNC NOTICE]', err));
  };

  const updateProduct = (updated: Product) => {
    setProducts(prev => prev.map(p => p.id === updated.id ? updated : p));

    // Asynchronously sync updated product to backend / MongoDB Atlas
    fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product: stripMongoId(updated) })
    }).catch(err => console.warn('[MONGODB SYNC NOTICE]', err));
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));

    // Asynchronously delete product in backend / MongoDB Atlas
    fetch(`/api/products/${id}`, {
      method: 'DELETE'
    }).catch(err => console.warn('[MONGODB DELETE NOTICE]', err));
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

  const updateInstantClassics = (data: InstantClassicsSection) => setInstantClassics(data);
  const updateDualEditorial = (data: DualEditorialSection) => setDualEditorial(data);

  // Automatic universal scroll-to-top handler for all views, categories, and products
  const handleSetCurrentView = (view: string) => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }
    setCurrentView(view);
  };

  const handleSetSelectedProductId = (id: string | null) => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }
    setSelectedProductId(id);
  };

  const handleSetSelectedCategorySlug = (slug: string | null) => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }
    setSelectedCategorySlug(slug);
  };

  return (
    <AppContext.Provider value={{
      currentView, setCurrentView: handleSetCurrentView,
      selectedProductId, setSelectedProductId: handleSetSelectedProductId,
      selectedCategorySlug, setSelectedCategorySlug: handleSetSelectedCategorySlug,
      isSearchOpen, setIsSearchOpen,
      isCartDrawerOpen, setIsCartDrawerOpen,
      currency, setCurrency,
      products, categories, orders, coupons, reviews, banners, customers, settings, cmsPages, menuItems, updateMenuItems,
      instantClassics, dualEditorial, updateInstantClassics, updateDualEditorial,
      clearAllAdminRecords, restoreSampleData,
      cart, addToCart, removeFromCart, updateCartQuantity, clearCart,
      activeCoupon, applyCoupon, removeCoupon,
      wishlist, toggleWishlist, isInWishlist, clearWishlist,
      createOrder, updateOrderStatus, getOrderById,
      addProduct, updateProduct, deleteProduct, duplicateProduct,
      addCategory, updateCategory, deleteCategory,
      addCoupon, updateCoupon, deleteCoupon,
      addReview, updateReviewStatus, replyReview,
      addBanner, updateBanner, deleteBanner,
      updateSettings, updateCMSPage,
      saleCampaigns, addSaleCampaign, updateSaleCampaign, deleteSaleCampaign, applySaleCampaign, revertSaleCampaign, restoreAllOriginalPrices,
      adminUsers, currentAdmin, addAdminUser, updateAdminUser, removeAdminUser,
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
