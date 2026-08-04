import React from 'react';
import { useApp } from '../../context/AppContext';
import { Currency } from '../../types';
import { Truck, ShieldCheck, Sparkles, UserCheck } from 'lucide-react';

export const AnnouncementBar: React.FC = () => {
  const { settings, currency, setCurrency, userRole, setUserRole, setCurrentView } = useApp();

  return (
    <div className="bg-[#222222] text-[#F5F1EC] text-xs py-2 px-4 border-b border-[#333333] transition-all">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
        
        {/* Left Side: Delivery & COD info */}
        <div className="flex items-center space-x-4 overflow-hidden text-center sm:text-left">
          <span className="flex items-center gap-1.5 font-medium tracking-wide">
            <Truck className="w-3.5 h-3.5 text-[#D4AF37]" />
            {settings.announcementBarText}
          </span>
        </div>

        {/* Right Side: Currency & Admin Switcher */}
        <div className="flex items-center space-x-4">
          {/* Currency Switcher */}
          <div className="flex items-center space-x-1 text-[11px] bg-[#2E2E2E] px-2 py-0.5 rounded border border-[#444]">
            <span className="text-gray-400 font-medium">Currency:</span>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as Currency)}
              className="bg-transparent text-[#F5F1EC] font-semibold cursor-pointer focus:outline-none"
            >
              <option value="PKR" className="bg-[#222]">PKR (Rs)</option>
              <option value="USD" className="bg-[#222]">USD ($)</option>
              <option value="AED" className="bg-[#222]">AED (AED)</option>
              <option value="GBP" className="bg-[#222]">GBP (£)</option>
            </select>
          </div>

          {/* Role Switcher Button */}
          <button
            onClick={() => {
              if (userRole === 'admin') {
                setUserRole('customer');
                setCurrentView('home');
              } else {
                setUserRole('admin');
                setCurrentView('admin');
              }
            }}
            className="flex items-center gap-1 text-[11px] bg-[#D4AF37] text-[#222] font-semibold px-2.5 py-0.5 rounded hover:bg-[#c39e2e] transition"
          >
            <UserCheck className="w-3 h-3" />
            {userRole === 'admin' ? 'Switch to Storefront' : 'Go to Admin Panel'}
          </button>
        </div>

      </div>
    </div>
  );
};
