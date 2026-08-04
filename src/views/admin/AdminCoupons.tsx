import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Plus, Trash2, Tag, Ticket, X } from 'lucide-react';

export const AdminCoupons: React.FC = () => {
  const { coupons, addCoupon, deleteCoupon } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'flat' | 'free_shipping'>('percentage');
  const [discountValue, setDiscountValue] = useState<number>(10);
  const [minSpend, setMinSpend] = useState<number>(5000);
  const [expiryDate, setExpiryDate] = useState('2026-12-31');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) return;
    addCoupon({
      code: code.toUpperCase().trim(),
      discountType,
      discountValue: Number(discountValue),
      minOrderValue: Number(minSpend),
      expiryDate,
      usageLimit: 500,
      isActive: true
    });
    setCode('');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      
      <div className="flex justify-between items-center border-b border-[#EAE4DC] pb-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-[#222]">Promotional Coupons & Discounts</h2>
          <p className="text-xs text-gray-500">Configure percentage vouchers, flat discounts, and free shipping codes.</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2.5 bg-[#222222] text-white text-xs font-semibold uppercase tracking-wider rounded hover:bg-[#9E8055] transition flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Create Coupon Code
        </button>
      </div>

      {coupons.length === 0 ? (
        <div className="bg-white border border-[#EAE4DC] rounded-xl p-12 text-center space-y-3">
          <Ticket className="w-10 h-10 text-gray-300 mx-auto" />
          <h3 className="font-serif text-lg font-bold text-[#222]">No Active Coupons</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            You currently have no active discount vouchers or promotional codes. Click "+ Create Coupon Code" to launch a campaign.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-[#222] text-white text-xs font-semibold rounded hover:bg-[#9E8055] transition inline-block"
          >
            + Create First Coupon
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {coupons.map(c => (
            <div key={c.id} className="bg-white border border-[#EAE4DC] rounded-xl p-5 shadow-sm space-y-3 relative overflow-hidden">
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-2">
                  <Ticket className="w-5 h-5 text-[#9E8055]" />
                  <h3 className="font-mono text-lg font-bold text-[#222] tracking-wider">{c.code}</h3>
                </div>

                <button
                  onClick={() => deleteCoupon(c.id)}
                  className="text-gray-400 hover:text-red-500 p-1"
                  title="Delete Coupon"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="text-xs space-y-1 text-gray-600 border-t border-gray-100 pt-3">
                <p>Type: <strong className="text-[#222] uppercase">{c.discountType}</strong></p>
                <p>Discount: <strong className="text-[#9E8055] font-bold">{c.discountType === 'percentage' ? `${c.discountValue}% OFF` : c.discountType === 'flat' ? `PKR ${c.discountValue} OFF` : 'Free Shipping'}</strong></p>
                <p>Min Spend: <strong>PKR {c.minOrderValue?.toLocaleString()}</strong></p>
                <p>Valid Until: <strong>{c.expiryDate}</strong></p>
              </div>

              <div className="text-[10px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded w-max">
                ACTIVE VOUCHER
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-serif text-lg font-bold text-[#222]">Create Coupon Voucher</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Coupon Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SASA20"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full px-3 py-2 border rounded uppercase font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Discount Type</label>
                <select
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value as any)}
                  className="w-full px-3 py-2 border rounded"
                >
                  <option value="percentage">Percentage OFF (%)</option>
                  <option value="flat">Flat PKR OFF</option>
                  <option value="free_shipping">Free Shipping Voucher</option>
                </select>
              </div>

              {discountType !== 'free_shipping' && (
                <div>
                  <label className="block font-semibold mb-1">Discount Amount / %</label>
                  <input
                    type="number"
                    required
                    value={discountValue}
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
              )}

              <div>
                <label className="block font-semibold mb-1">Minimum Order Value (PKR)</label>
                <input
                  type="number"
                  value={minSpend}
                  onChange={(e) => setMinSpend(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Expiry Date</label>
                <input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#222] text-white font-semibold rounded hover:bg-[#9E8055]"
                >
                  Save Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
