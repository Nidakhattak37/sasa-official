import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatPrice } from '../../utils/currency';
import { normalizeImageUrl, handleImageError, DEFAULT_FALLBACK_IMAGE } from '../../utils/imageUrl';
import { AlertTriangle, CheckCircle, RefreshCw, Search, ShieldAlert } from 'lucide-react';

export const AdminInventory: React.FC = () => {
  const { products, updateProduct, currency } = useApp();
  const [searchTerm, setSearchTerm] = useState('');

  const lowStockProducts = products.filter(p => p.stock < 10);

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStockChange = (id: string, newStock: number) => {
    updateProduct(id, { stock: Math.max(0, newStock) });
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-[#EAE4DC] pb-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-[#222]">Inventory & Warehouse Stock</h2>
          <p className="text-xs text-gray-500">Monitor stock health, reorder thresholds, and adjust suit quantities instantly.</p>
        </div>
      </div>

      {/* Warning Callout for Low Stock */}
      {lowStockProducts.length > 0 && (
        <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl flex items-center gap-3 text-xs text-amber-900">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <div>
            <strong className="block font-bold">Low Stock Warning: {lowStockProducts.length} Suits need replenishment!</strong>
            <span>Items like "{lowStockProducts[0]?.name}" have fallen below the 10-unit threshold.</span>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="bg-white p-4 rounded-xl border border-[#EAE4DC] flex items-center">
        <Search className="w-4 h-4 text-gray-400 mr-2" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by SKU code or product title..."
          className="w-full text-xs outline-none"
        />
      </div>

      {/* Inventory Table */}
      <div className="bg-white border border-[#EAE4DC] rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-[#FAFAFA] text-[#222] border-b border-[#EAE4DC] font-bold uppercase tracking-wider text-[11px]">
              <th className="p-3">SKU</th>
              <th className="p-3">Product Name</th>
              <th className="p-3">Unit Price</th>
              <th className="p-3">Current Stock</th>
              <th className="p-3">Health Status</th>
              <th className="p-3 text-right">Adjust Stock Quantity</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F2F2F2]">
            {filtered.map(p => (
              <tr key={p.id} className="hover:bg-[#FAFAFA]">
                <td className="p-3 font-mono text-[11px] text-gray-500">{p.sku}</td>
                <td className="p-3 font-semibold text-[#222] flex items-center space-x-3">
                  <img
                    src={normalizeImageUrl(p.images?.[0])}
                    alt=""
                    referrerPolicy="no-referrer"
                    onError={(e) => handleImageError(e, DEFAULT_FALLBACK_IMAGE)}
                    className="w-8 h-10 object-cover rounded bg-[#F5F1EC]"
                  />
                  <span>{p.name}</span>
                </td>
                <td className="p-3 font-bold">{formatPrice(p.price, currency)}</td>
                <td className="p-3 font-bold text-sm text-[#222]">{p.stock} units</td>
                <td className="p-3">
                  {p.stock === 0 ? (
                    <span className="px-2 py-0.5 bg-red-100 text-red-800 text-[10px] font-bold rounded">OUT OF STOCK</span>
                  ) : p.stock < 10 ? (
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded">LOW STOCK</span>
                  ) : (
                    <span className="px-2 py-0.5 bg-green-100 text-green-800 text-[10px] font-bold rounded">HEALTHY</span>
                  )}
                </td>
                <td className="p-3 text-right">
                  <div className="inline-flex items-center border border-gray-300 rounded bg-white">
                    <button
                      onClick={() => handleStockChange(p.id, p.stock - 5)}
                      className="px-2 py-1 text-gray-500 hover:bg-gray-100"
                    >
                      -5
                    </button>
                    <button
                      onClick={() => handleStockChange(p.id, p.stock - 1)}
                      className="px-2 py-1 text-gray-700 hover:bg-gray-100 font-bold"
                    >
                      -1
                    </button>
                    <span className="px-3 py-1 font-bold text-[#222]">{p.stock}</span>
                    <button
                      onClick={() => handleStockChange(p.id, p.stock + 1)}
                      className="px-2 py-1 text-gray-700 hover:bg-gray-100 font-bold"
                    >
                      +1
                    </button>
                    <button
                      onClick={() => handleStockChange(p.id, p.stock + 10)}
                      className="px-2 py-1 text-gray-500 hover:bg-gray-100"
                    >
                      +10
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
};
