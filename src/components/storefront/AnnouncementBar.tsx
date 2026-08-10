import React from 'react';
import { useApp } from '../../context/AppContext';
import { Currency } from '../../types';
import { Truck, Sparkles, UserCheck, ShieldCheck } from 'lucide-react';

export const AnnouncementBar: React.FC = () => {
  const { settings, currency, setCurrency, userRole, setUserRole, setCurrentView } = useApp();

  const announcementText = settings.announcementBarText || '✨ FREE EXPRESS DELIVERY ON ORDERS OVER PKR 10,000 | CASH ON DELIVERY AVAILABLE NATIONWIDE';

  // Create an array of repeating announcements for seamless continuous scrolling
  const tickerItems = [
    announcementText,
    '🚚 FAST NATIONWIDE DISPATCH WITHIN 24-48 HOURS',
    announcementText,
    '✦ 100% AUTHENTIC PAKISTANI DESIGNER LAWN & FESTIVE WEAR',
  ];

  return (
    <div className="bg-[#1E1E24] text-[#F5F1EC] border-b border-[#333333] select-none relative overflow-hidden z-30">
      <div className="max-w-[1440px] mx-auto flex items-center justify-between h-9 sm:h-10 px-2 sm:px-4">
        
        {/* Continuous Moving Marquee Track (Mobile & Desktop) */}
        <div className="flex-1 overflow-hidden relative mr-2 sm:mr-4 mask-fade-edges">
          {/* Subtle gradient fades at the edges for smooth entrance/exit */}
          <div className="absolute left-0 inset-y-0 w-4 sm:w-8 bg-gradient-to-r from-[#1E1E24] to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 inset-y-0 w-4 sm:w-8 bg-gradient-to-l from-[#1E1E24] to-transparent z-10 pointer-events-none" />

          <div className="animate-announcement-marquee flex items-center whitespace-nowrap cursor-default py-1">
            {/* First Set of Ticker Items */}
            <div className="flex items-center space-x-8 sm:space-x-12 pr-8 sm:pr-12">
              {tickerItems.map((item, idx) => (
                <span
                  key={`ticker-1-${idx}`}
                  className="inline-flex items-center gap-2 text-[11px] sm:text-xs font-semibold tracking-wider uppercase text-[#F5F1EC]"
                >
                  <span className="text-[#D4AF37] flex-shrink-0">★</span>
                  <span>{item}</span>
                </span>
              ))}
            </div>

            {/* Duplicate Set for Seamless 100% Infinite Wrap */}
            <div className="flex items-center space-x-8 sm:space-x-12 pr-8 sm:pr-12" aria-hidden="true">
              {tickerItems.map((item, idx) => (
                <span
                  key={`ticker-2-${idx}`}
                  className="inline-flex items-center gap-2 text-[11px] sm:text-xs font-semibold tracking-wider uppercase text-[#F5F1EC]"
                >
                  <span className="text-[#D4AF37] flex-shrink-0">★</span>
                  <span>{item}</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Currency Selector */}
        <div className="flex items-center space-x-1.5 sm:space-x-3 flex-shrink-0 z-20 pl-2 bg-[#1E1E24] shadow-[-8px_0_12px_#1E1E24]">
          {/* Currency Switcher */}
          <div className="flex items-center space-x-1 text-[10px] sm:text-[11px] bg-[#2A2A30] px-2 py-0.5 sm:py-1 rounded-md border border-[#444] shadow-xs">
            <span className="text-gray-400 font-medium hidden sm:inline">Currency:</span>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as Currency)}
              className="bg-transparent text-[#F5F1EC] font-bold cursor-pointer focus:outline-none"
              title="Change Currency"
            >
              <option value="PKR" className="bg-[#222]">PKR (Rs)</option>
              <option value="USD" className="bg-[#222]">USD ($)</option>
              <option value="AED" className="bg-[#222]">AED (AED)</option>
              <option value="GBP" className="bg-[#222]">GBP (£)</option>
            </select>
          </div>
        </div>

      </div>
    </div>
  );
};

