import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Order, OrderStatus } from '../../types';
import { formatPrice } from '../../utils/currency';
import { normalizeImageUrl, handleImageError, DEFAULT_FALLBACK_IMAGE } from '../../utils/imageUrl';
import { PrintInvoiceModal } from './PrintInvoiceModal';
import { Search, Printer, Eye, ChevronDown, CheckCircle2, Clock, Truck, X } from 'lucide-react';

export const AdminOrders: React.FC = () => {
  const { orders, updateOrderStatus, currency } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState<Order | null>(null);
  const [viewingOrderDetails, setViewingOrderDetails] = useState<Order | null>(null);

  const filteredOrders = orders.filter(o => {
    const matchSearch = o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        o.shippingAddress.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        o.phone.includes(searchTerm);
    const matchStatus = filterStatus === 'all' || o.orderStatus === filterStatus;
    return matchSearch && matchStatus;
  });

  const statuses: OrderStatus[] = ['Confirmed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'];

  return (
    <div className="space-y-6 animate-in fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-[#EAE4DC] pb-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-[#222]">Order Fulfillment Center</h2>
          <p className="text-xs text-gray-500">Track incoming checkouts, update shipment status, and print tax invoices.</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between bg-white p-4 rounded-xl border border-[#EAE4DC]">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search orders by ID (#SASA-9842), customer name, or phone..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-[#EAE4DC] rounded focus:outline-none focus:border-[#9E8055]"
          />
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 text-xs border border-[#EAE4DC] rounded bg-white text-[#222] focus:outline-none"
        >
          <option value="all">All Order Statuses ({orders.length})</option>
          {statuses.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-[#EAE4DC] rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-[#FAFAFA] text-[#222] border-b border-[#EAE4DC] font-bold uppercase tracking-wider text-[11px]">
              <th className="p-3">Order ID</th>
              <th className="p-3">Customer</th>
              <th className="p-3">Date</th>
              <th className="p-3">Items</th>
              <th className="p-3">Total Amount</th>
              <th className="p-3">Payment</th>
              <th className="p-3">Fulfillment Status</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F2F2F2]">
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-12 text-center text-gray-500">
                  <div className="max-w-xs mx-auto space-y-2">
                    <p className="font-serif text-base font-bold text-[#222]">No Orders Found</p>
                    <p className="text-xs text-gray-400">
                      There are currently no order records in the admin panel. When customers complete checkout on the storefront, orders will appear here automatically.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredOrders.map(o => (
                <tr key={o.id} className="hover:bg-[#FAFAFA]">
                <td className="p-3 font-bold text-[#9E8055] font-mono">#{o.id}</td>
                <td className="p-3">
                  <strong className="block text-[#222] font-semibold">{o.shippingAddress.fullName}</strong>
                  <span className="text-[10px] text-gray-400">{o.shippingAddress.city} • {o.phone}</span>
                </td>
                <td className="p-3 text-gray-500 text-[11px]">{o.createdAt}</td>
                <td className="p-3 text-gray-600 font-medium">{o.items.length} suit(s)</td>
                <td className="p-3 font-bold text-[#222]">{formatPrice(o.total, currency)}</td>
                <td className="p-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    o.paymentStatus === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {o.paymentMethod} ({o.paymentStatus})
                  </span>
                </td>
                <td className="p-3">
                  <select
                    value={o.orderStatus}
                    onChange={(e) => updateOrderStatus(o.id, e.target.value as OrderStatus)}
                    className="px-2 py-1 bg-white border border-[#EAE4DC] text-[11px] font-semibold rounded text-[#222] focus:outline-none focus:border-[#9E8055]"
                  >
                    {statuses.map(st => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </td>
                <td className="p-3 text-right space-x-1">
                  <button
                    onClick={() => setViewingOrderDetails(o)}
                    className="p-1.5 text-gray-500 hover:text-black rounded"
                    title="View Order Details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setSelectedOrderForInvoice(o)}
                    className="p-1.5 text-gray-500 hover:text-[#9E8055] rounded"
                    title="Print Tax Invoice"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            )))}
          </tbody>
        </table>
      </div>

      {/* Invoice Modal */}
      <PrintInvoiceModal
        order={selectedOrderForInvoice}
        onClose={() => setSelectedOrderForInvoice(null)}
      />

      {/* Order Details Drawer Modal */}
      {viewingOrderDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-xl bg-white rounded-xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex justify-between items-center border-b border-[#EAE4DC] pb-3">
              <h3 className="font-serif text-lg font-bold text-[#222]">Order Details — #{viewingOrderDetails.id}</h3>
              <button onClick={() => setViewingOrderDetails(null)} className="text-gray-400 hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs space-y-3">
              <div className="p-3 bg-[#FAFAFA] rounded border border-[#EAE4DC] space-y-1">
                <strong className="block text-[#222] text-sm">{viewingOrderDetails.shippingAddress.fullName}</strong>
                <p>{viewingOrderDetails.shippingAddress.street}, {viewingOrderDetails.shippingAddress.city}</p>
                <p>Phone: {viewingOrderDetails.phone} | Email: {viewingOrderDetails.email}</p>
              </div>

              <h4 className="font-bold text-[#222]">Purchased Items:</h4>
              <div className="divide-y divide-gray-100">
                {viewingOrderDetails.items.map((it, idx) => (
                  <div key={idx} className="py-2 flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <img
                        src={normalizeImageUrl(it.image)}
                        alt=""
                        referrerPolicy="no-referrer"
                        onError={(e) => handleImageError(e, DEFAULT_FALLBACK_IMAGE)}
                        className="w-10 h-12 object-cover rounded bg-[#F5F1EC]"
                      />
                      <div>
                        <strong className="text-[#222]">{it.productName}</strong>
                        <p className="text-[10px] text-gray-500">Size: {it.selectedSize} • Qty: {it.quantity}</p>
                      </div>
                    </div>
                    <span className="font-bold">{formatPrice(it.price * it.quantity, currency)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-[#EAE4DC] flex justify-end gap-2">
              <button
                onClick={() => {
                  setSelectedOrderForInvoice(viewingOrderDetails);
                  setViewingOrderDetails(null);
                }}
                className="px-4 py-2 bg-[#222] text-white text-xs font-semibold rounded hover:bg-[#9E8055]"
              >
                Print Official Invoice
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
