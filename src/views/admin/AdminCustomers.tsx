import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatPrice } from '../../utils/currency';
import { Search, UserCheck, Shield, Mail, Phone, MapPin } from 'lucide-react';

export const AdminCustomers: React.FC = () => {
  const { customers, orders, currency } = useApp();
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm)
  );

  return (
    <div className="space-y-6 animate-in fade-in">
      
      <div className="border-b border-[#EAE4DC] pb-4">
        <h2 className="font-serif text-2xl font-bold text-[#222]">Customer CRM & Loyalty Directory</h2>
        <p className="text-xs text-gray-500">Track client order history, total lifetime spend, and SASA Privé status.</p>
      </div>

      <div className="bg-white p-4 rounded-xl border border-[#EAE4DC] flex items-center">
        <Search className="w-4 h-4 text-gray-400 mr-2" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search clients by name, email, or phone number..."
          className="w-full text-xs outline-none"
        />
      </div>

      <div className="bg-white border border-[#EAE4DC] rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-[#FAFAFA] text-[#222] border-b border-[#EAE4DC] font-bold uppercase tracking-wider text-[11px]">
              <th className="p-3">Patron Name</th>
              <th className="p-3">Contact</th>
              <th className="p-3">Joined Date</th>
              <th className="p-3">Total Orders</th>
              <th className="p-3">Lifetime Spend</th>
              <th className="p-3 text-right">Loyalty Tier</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F2F2F2]">
            {filtered.map(c => (
              <tr key={c.id} className="hover:bg-[#FAFAFA]">
                <td className="p-3 font-semibold text-[#222]">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-[#222] text-[#D4AF37] font-serif font-bold flex items-center justify-center">
                      {c.name.charAt(0)}
                    </div>
                    <span>{c.name}</span>
                  </div>
                </td>
                <td className="p-3 text-gray-600">
                  <p>{c.email}</p>
                  <p className="text-[10px] text-gray-400">{c.phone}</p>
                </td>
                <td className="p-3 text-gray-500">{c.createdAt}</td>
                <td className="p-3 font-bold text-[#222]">{c.totalOrders} order(s)</td>
                <td className="p-3 font-bold text-[#9E8055]">{formatPrice(c.totalSpent, currency)}</td>
                <td className="p-3 text-right">
                  <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase ${
                    c.totalSpent > 100000
                      ? 'bg-amber-100 text-amber-900 border border-amber-300'
                      : 'bg-[#F5F1EC] text-[#222]'
                  }`}>
                    {c.totalSpent > 100000 ? '👑 PRIVÉ GOLD' : 'VIP CLIENT'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
};
