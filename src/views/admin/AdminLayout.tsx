import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AdminDashboard } from './AdminDashboard';
import { AdminOrders } from './AdminOrders';
import { AdminProducts } from './AdminProducts';
import { AdminCategories } from './AdminCategories';
import { AdminInventory } from './AdminInventory';
import { AdminCoupons } from './AdminCoupons';
import { AdminReviews } from './AdminReviews';
import { AdminBanners } from './AdminBanners';
import { AdminCMS } from './AdminCMS';
import { AdminCustomers } from './AdminCustomers';
import { AdminAnalytics } from './AdminAnalytics';
import { AdminSettings } from './AdminSettings';
import {
  LayoutDashboard, ShoppingBag, Package, Layers, AlertTriangle, Tag, MessageSquare, Image, FileText, Users, BarChart3, Settings, LogOut, Store, Bell
} from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const {
    userRole, setUserRole, setCurrentView, orders, products, reviews,
    logoutAdmin, clearAllAdminRecords, restoreSampleData
  } = useApp();
  const [activeTab, setActiveTab] = useState('dashboard');

  const pendingOrdersCount = orders.filter(o => o.orderStatus !== 'Delivered' && o.orderStatus !== 'Cancelled').length;
  const lowStockCount = products.filter(p => p.stock < 10).length;
  const pendingReviewsCount = reviews.filter(r => r.status === 'Pending').length;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'orders', label: 'Order Fulfillment', icon: <ShoppingBag className="w-4 h-4" />, badge: pendingOrdersCount },
    { id: 'products', label: 'Product Inventory', icon: <Package className="w-4 h-4" /> },
    { id: 'categories', label: 'Categories Architecture', icon: <Layers className="w-4 h-4" /> },
    { id: 'inventory', label: 'Stock & Warehouse', icon: <AlertTriangle className="w-4 h-4" />, badge: lowStockCount > 0 ? lowStockCount : null, badgeColor: 'bg-amber-500' },
    { id: 'coupons', label: 'Coupons & Vouchers', icon: <Tag className="w-4 h-4" /> },
    { id: 'reviews', label: 'Reviews Moderation', icon: <MessageSquare className="w-4 h-4" />, badge: pendingReviewsCount },
    { id: 'banners', label: 'Homepage Banners', icon: <Image className="w-4 h-4" /> },
    { id: 'cms', label: 'CMS & Legal Pages', icon: <FileText className="w-4 h-4" /> },
    { id: 'customers', label: 'Customers & CRM', icon: <Users className="w-4 h-4" /> },
    { id: 'analytics', label: 'Analytics Reports', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'settings', label: 'Store Settings', icon: <Settings className="w-4 h-4" /> }
  ];

  return (
    <div className="min-h-screen bg-[#F4F4F6] flex text-[#222222]">
      
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-[#1E1E24] text-[#D5D5D5] flex flex-col justify-between border-r border-[#2E2E38] shadow-xl flex-shrink-0">
        <div>
          {/* Logo Header */}
          <div className="p-6 border-b border-[#2E2E38] flex items-center justify-between">
            <div>
              <span className="font-serif text-2xl font-bold tracking-[0.2em] text-white uppercase block">
                SASA
              </span>
              <span className="text-[9px] tracking-[0.35em] text-[#D4AF37] uppercase font-sans font-bold block">
                ADMIN CONTROL
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold transition ${
                  activeTab === item.id
                    ? 'bg-[#D4AF37] text-[#1E1E24] shadow'
                    : 'text-gray-300 hover:bg-[#2A2A33] hover:text-white'
                }`}
              >
                <span className="flex items-center gap-3">
                  {item.icon}
                  {item.label}
                </span>

                {item.badge !== undefined && item.badge !== null && (
                  <span className={`px-2 py-0.5 text-[10px] rounded-full font-bold ${
                    item.badgeColor || 'bg-red-500 text-white'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-[#2E2E38] space-y-2">
          <button
            onClick={() => {
              setUserRole('customer');
              setCurrentView('home');
            }}
            className="w-full py-2.5 px-3 bg-[#2A2A33] hover:bg-[#333340] text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition border border-gray-700"
          >
            <Store className="w-4 h-4 text-[#D4AF37]" />
            <span>Switch to Storefront</span>
          </button>

          <button
            onClick={() => {
              logoutAdmin();
            }}
            className="w-full py-2.5 px-3 bg-red-950/40 hover:bg-red-900/60 text-red-300 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition border border-red-900/50"
          >
            <LogOut className="w-4 h-4 text-red-400" />
            <span>Sign Out Admin</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header Bar */}
        <header className="h-16 bg-white border-b border-[#EAE4DC] px-8 flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-3 text-xs text-gray-500 font-medium">
            <span>SASA Portal</span>
            <span>/</span>
            <span className="text-[#222] font-semibold uppercase tracking-wider">
              {navItems.find(n => n.id === activeTab)?.label}
            </span>
          </div>

          <div className="flex items-center space-x-3">
            {/* Quick Record Management Buttons */}
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to remove ALL records from the admin panel? This will clear products, orders, coupons, reviews, banners, and customers.')) {
                  clearAllAdminRecords();
                }
              }}
              className="px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 text-xs font-semibold rounded-lg transition flex items-center gap-1.5"
              title="Wipe all products, orders, coupons, and records"
            >
              <span>🗑️ Wipe Admin Data</span>
            </button>

            <button
              onClick={() => {
                restoreSampleData();
              }}
              className="px-3 py-1.5 bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200 text-xs font-semibold rounded-lg transition flex items-center gap-1.5"
              title="Load demo luxury pret products and orders"
            >
              <span>⚡ Load Sample Data</span>
            </button>

            <div className="relative border-l border-gray-200 pl-3">
              <button className="p-2 text-gray-500 hover:text-black rounded-full hover:bg-gray-100 relative">
                <Bell className="w-4 h-4" />
                {pendingOrdersCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-ping" />
                )}
              </button>
            </div>

            <div className="flex items-center space-x-2 pl-3 border-l border-gray-200">
              <div className="w-8 h-8 rounded-full bg-[#222] text-[#D4AF37] font-serif font-bold text-xs flex items-center justify-center border border-[#D4AF37]">
                A
              </div>
              <div className="text-left text-xs hidden sm:block">
                <span className="block font-bold text-[#222]">Admin Director</span>
                <span className="text-[10px] text-gray-400">admin@sasaofficial.com</span>
              </div>

              <button
                onClick={logoutAdmin}
                className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-100 transition ml-1"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Dynamic Body */}
        <main className="flex-1 p-8 overflow-y-auto">
          {activeTab === 'dashboard' && <AdminDashboard onNavigateTab={(tab) => setActiveTab(tab)} />}
          {activeTab === 'orders' && <AdminOrders />}
          {activeTab === 'products' && <AdminProducts />}
          {activeTab === 'categories' && <AdminCategories />}
          {activeTab === 'inventory' && <AdminInventory />}
          {activeTab === 'coupons' && <AdminCoupons />}
          {activeTab === 'reviews' && <AdminReviews />}
          {activeTab === 'banners' && <AdminBanners />}
          {activeTab === 'cms' && <AdminCMS />}
          {activeTab === 'customers' && <AdminCustomers />}
          {activeTab === 'analytics' && <AdminAnalytics />}
          {activeTab === 'settings' && <AdminSettings />}
        </main>

      </div>

    </div>
  );
};
