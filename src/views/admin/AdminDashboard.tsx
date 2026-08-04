import React from 'react';
import { useApp } from '../../context/AppContext';
import { formatPrice } from '../../utils/currency';
import { AdminAnalytics } from './AdminAnalytics';
import { ShoppingBag, DollarSign, Package, Users, AlertTriangle, ArrowRight, Plus } from 'lucide-react';

interface AdminDashboardProps {
  onNavigateTab: (tab: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigateTab }) => {
  const { orders, products, customers, currency } = useApp();

  const totalRevenue = orders.reduce((acc, o) => acc + o.total, 0);
  const pendingOrders = orders.filter(o => o.orderStatus !== 'Delivered' && o.orderStatus !== 'Cancelled');
  const lowStockCount = products.filter(p => p.stock < 10).length;

  return (
    <div className="space-y-8 animate-in fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-[#EAE4DC] pb-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-[#9E8055]">SASA Command Center</span>
          <h2 className="font-serif text-3xl font-bold text-[#222]">Store Performance Dashboard</h2>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onNavigateTab('products')}
            className="px-4 py-2 bg-[#222] text-white text-xs font-semibold rounded hover:bg-[#9E8055] transition flex items-center gap-1.5 shadow"
          >
            <Plus className="w-4 h-4" /> Add Product
          </button>
        </div>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        <div className="p-5 bg-white border border-[#EAE4DC] rounded-xl shadow-sm space-y-2">
          <div className="flex justify-between items-center text-xs text-gray-500 font-semibold uppercase">
            <span>Total Gross Revenue</span>
            <div className="w-8 h-8 rounded-full bg-green-50 text-green-700 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="font-serif text-2xl font-bold text-[#222]">{formatPrice(totalRevenue, currency)}</p>
          <span className="text-[10px] text-green-700 font-semibold">From {orders.length} total orders</span>
        </div>

        <div className="p-5 bg-white border border-[#EAE4DC] rounded-xl shadow-sm space-y-2">
          <div className="flex justify-between items-center text-xs text-gray-500 font-semibold uppercase">
            <span>Active Orders</span>
            <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <p className="font-serif text-2xl font-bold text-[#222]">{pendingOrders.length}</p>
          <span className="text-[10px] text-amber-700 font-semibold">Pending dispatch in warehouse</span>
        </div>

        <div className="p-5 bg-white border border-[#EAE4DC] rounded-xl shadow-sm space-y-2">
          <div className="flex justify-between items-center text-xs text-gray-500 font-semibold uppercase">
            <span>Catalog Products</span>
            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <p className="font-serif text-2xl font-bold text-[#222]">{products.length}</p>
          <span className="text-[10px] text-gray-500 font-semibold">{lowStockCount} items on low stock</span>
        </div>

        <div className="p-5 bg-white border border-[#EAE4DC] rounded-xl shadow-sm space-y-2">
          <div className="flex justify-between items-center text-xs text-gray-500 font-semibold uppercase">
            <span>Registered Patrons</span>
            <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-700 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="font-serif text-2xl font-bold text-[#222]">{customers.length}</p>
          <span className="text-[10px] text-purple-700 font-semibold">Verified VIP clients</span>
        </div>

      </div>

      {/* Analytics Recharts Widget */}
      <AdminAnalytics />

      {/* Recent Orders Overview */}
      <div className="bg-white border border-[#EAE4DC] rounded-xl p-6 shadow-sm space-y-4">
        <div className="flex justify-between items-center border-b border-[#EAE4DC] pb-3">
          <h3 className="font-serif text-lg font-bold text-[#222]">Recent Orders</h3>
          <button
            onClick={() => onNavigateTab('orders')}
            className="text-xs text-[#9E8055] font-semibold hover:underline flex items-center gap-1"
          >
            View All Fulfillment →
          </button>
        </div>

        {orders.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-gray-400">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <h4 className="font-serif text-base font-bold text-[#222]">Admin Panel Is Currently Empty</h4>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              No orders or sales records found. You can add new products in 'Product Inventory' or click '⚡ Load Sample Data' in the header to preview mock records.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#FAFAFA] text-[#222] border-b border-[#EAE4DC] font-bold uppercase tracking-wider text-[10px]">
                  <th className="p-3">Order ID</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Total</th>
                  <th className="p-3">Payment</th>
                  <th className="p-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F2F2F2]">
                {orders.slice(0, 5).map(ord => (
                  <tr key={ord.id} className="hover:bg-[#FAFAFA]">
                    <td className="p-3 font-bold text-[#9E8055] font-mono">#{ord.id}</td>
                    <td className="p-3 font-semibold text-[#222]">{ord.shippingAddress.fullName}</td>
                    <td className="p-3 text-gray-500">{ord.createdAt}</td>
                    <td className="p-3 font-bold text-[#222]">{formatPrice(ord.total, currency)}</td>
                    <td className="p-3 text-gray-600">{ord.paymentMethod}</td>
                    <td className="p-3 text-right">
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-800 text-[10px] font-bold rounded">
                        {ord.orderStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
