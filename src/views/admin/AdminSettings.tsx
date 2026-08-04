import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Save, CheckCircle, Store, Truck, Globe, Shield } from 'lucide-react';

export const AdminSettings: React.FC = () => {
  const { settings, updateSettings } = useApp();

  const [storeName, setStoreName] = useState(settings.storeName);
  const [phone, setPhone] = useState(settings.phone);
  const [email, setEmail] = useState(settings.email);
  const [address, setAddress] = useState(settings.address);
  const [defaultShippingFee, setDefaultShippingFee] = useState(settings.defaultShippingFee);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(settings.freeShippingThreshold);
  const [taxRate, setTaxRate] = useState(settings.taxRate);
  const [currencyCode, setCurrencyCode] = useState(settings.currencyCode);

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      storeName,
      phone,
      email,
      address,
      defaultShippingFee: Number(defaultShippingFee),
      freeShippingThreshold: Number(freeShippingThreshold),
      taxRate: Number(taxRate),
      currencyCode
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      
      <div className="border-b border-[#EAE4DC] pb-4">
        <h2 className="font-serif text-2xl font-bold text-[#222]">Store Settings & Configurations</h2>
        <p className="text-xs text-gray-500">Configure store contact information, shipping rate thresholds, and tax policies.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6 max-w-3xl text-xs">
        
        {savedSuccess && (
          <div className="p-4 bg-green-50 text-green-800 text-xs font-semibold rounded border border-green-200 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            Store settings updated successfully!
          </div>
        )}

        {/* Brand Details */}
        <div className="bg-white border border-[#EAE4DC] rounded-xl p-6 shadow-sm space-y-4">
          <h3 className="font-serif text-base font-bold text-[#222] flex items-center gap-2 border-b border-[#EAE4DC] pb-3">
            <Store className="w-4 h-4 text-[#9E8055]" /> Brand & Storefront Specs
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold mb-1 text-[#222]">Store Name</label>
              <input
                type="text"
                required
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full px-3 py-2 border rounded"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1 text-[#222]">Contact Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border rounded"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1 text-[#222]">Helpline / Phone Number</label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 border rounded"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1 text-[#222]">Default Currency</label>
              <select
                value={currencyCode}
                onChange={(e) => setCurrencyCode(e.target.value)}
                className="w-full px-3 py-2 border rounded"
              >
                <option value="PKR">PKR - Pakistani Rupee (Rs)</option>
                <option value="USD">USD - US Dollar ($)</option>
                <option value="GBP">GBP - British Pound (£)</option>
                <option value="AED">AED - UAE Dirham (AED)</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold mb-1 text-[#222]">Physical Flagship Store Address</label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
          </div>
        </div>

        {/* Shipping Rates */}
        <div className="bg-white border border-[#EAE4DC] rounded-xl p-6 shadow-sm space-y-4">
          <h3 className="font-serif text-base font-bold text-[#222] flex items-center gap-2 border-b border-[#EAE4DC] pb-3">
            <Truck className="w-4 h-4 text-[#9E8055]" /> Shipping & Freight Rates
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold mb-1 text-[#222]">Standard Nationwide Shipping Fee (PKR)</label>
              <input
                type="number"
                required
                value={defaultShippingFee}
                onChange={(e) => setDefaultShippingFee(Number(e.target.value))}
                className="w-full px-3 py-2 border rounded"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1 text-[#222]">Free Shipping Threshold Spend (PKR)</label>
              <input
                type="number"
                required
                value={freeShippingThreshold}
                onChange={(e) => setFreeShippingThreshold(Number(e.target.value))}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-8 py-3 bg-[#222] text-white font-semibold text-xs uppercase tracking-wider rounded hover:bg-[#9E8055] transition flex items-center gap-2"
          >
            <Save className="w-4 h-4" /> Save Configuration
          </button>
        </div>

      </form>

    </div>
  );
};
