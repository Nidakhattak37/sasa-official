import React from 'react';
import { useApp } from '../../context/AppContext';
import { Phone, Mail, MapPin, ShieldCheck, Heart, Instagram } from 'lucide-react';

export const Footer: React.FC = () => {
  const { setCurrentView, setSelectedCategorySlug, settings, userRole, setUserRole } = useApp();

  const instagramUrl = settings.instagramUrl || 'https://www.instagram.com/sasaofficial.pk?igsh=MXhhZmJwNzR1M3FucA==';

  const handleNav = (view: string, catSlug: string | null = null) => {
    setSelectedCategorySlug(catSlug);
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#181818] text-[#D5D5D5] text-xs pt-16 pb-8 border-t border-[#2A2A2A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-[#2A2A2A]">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <button onClick={() => handleNav('home')} className="text-left group">
              <span className="font-serif text-3xl font-bold tracking-[0.2em] text-white uppercase group-hover:text-[#D4AF37] transition">
                SASA
              </span>
              <span className="block text-[9px] tracking-[0.35em] text-[#888888] font-sans font-medium uppercase -mt-1">
                OFFICIAL
              </span>
            </button>
            <p className="text-[#999999] leading-relaxed max-w-sm text-xs">
              SASA Official is a premier Pakistani luxury fashion brand celebrating heritage hand craftsmanship, intricate embroideries, and refined minimal silhouettes.
            </p>
            <div className="pt-2 flex items-center space-x-3 text-[#BBB]">
              <MapPin className="w-4 h-4 text-[#D4AF37] flex-shrink-0" />
              <span className="text-[11px]">{settings.address}</span>
            </div>
            <div className="flex items-center space-x-3 text-[#BBB]">
              <Phone className="w-4 h-4 text-[#D4AF37] flex-shrink-0" />
              <span className="text-[11px]">{settings.phone}</span>
            </div>
            <div className="flex items-center space-x-3 text-[#BBB]">
              <Mail className="w-4 h-4 text-[#D4AF37] flex-shrink-0" />
              <span className="text-[11px]">{settings.email}</span>
            </div>
            <div className="pt-1">
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 text-[#D4AF37] hover:text-white bg-[#222222] hover:bg-[#2A2A2A] border border-[#333333] px-3 py-1.5 rounded-md transition-all group"
                id="footer-instagram-link"
              >
                <Instagram className="w-4 h-4 text-[#D4AF37] flex-shrink-0 group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-semibold tracking-wide">@sasaofficial.pk on Instagram</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-serif text-sm font-semibold uppercase tracking-widest text-white mb-4">
              Collections
            </h4>
            <ul className="space-y-2.5 text-[#AAA]">
              <li><button onClick={() => handleNav('shop', 'new-arrivals')} className="hover:text-white transition">New Arrivals</button></li>
              <li><button onClick={() => handleNav('shop', 'pret')} className="hover:text-white transition">Ready to Wear Pret</button></li>
              <li><button onClick={() => handleNav('shop', 'unstitched')} className="hover:text-white transition">Unstitched Lawn Suits</button></li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h4 className="font-serif text-sm font-semibold uppercase tracking-widest text-white mb-4">
              Customer Care
            </h4>
            <ul className="space-y-2.5 text-[#AAA]">
              <li><button onClick={() => handleNav('track')} className="hover:text-white transition flex items-center gap-1 font-semibold text-[#D4AF37]">Order Tracking →</button></li>
              <li><button onClick={() => handleNav('write-review')} className="hover:text-white transition flex items-center gap-1 text-[#D4AF37] font-semibold">★ Write a Client Review</button></li>
              <li><button onClick={() => handleNav('account')} className="hover:text-white transition">My Account</button></li>
              <li><button onClick={() => handleNav('shipping-policy')} className="hover:text-white transition">Shipping & Delivery</button></li>
              <li><button onClick={() => handleNav('refund-policy')} className="hover:text-white transition">Returns & Exchanges</button></li>
              <li><button onClick={() => handleNav('faqs')} className="hover:text-white transition">FAQs</button></li>
            </ul>
          </div>

          {/* Brand Story & Policies */}
          <div>
            <h4 className="font-serif text-sm font-semibold uppercase tracking-widest text-white mb-4">
              About & Legal
            </h4>
            <ul className="space-y-2.5 text-[#AAA]">
              <li><button onClick={() => handleNav('about')} className="hover:text-white transition">About SASA</button></li>
              <li><button onClick={() => handleNav('contact')} className="hover:text-white transition">Contact Us</button></li>
              <li><button onClick={() => handleNav('privacy-policy')} className="hover:text-white transition">Privacy Policy</button></li>
              <li><button onClick={() => handleNav('terms')} className="hover:text-white transition">Terms of Service</button></li>
              <li>
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#D4AF37] transition inline-flex items-center gap-1 text-[#AAA]"
                >
                  <Instagram className="w-3.5 h-3.5 text-[#D4AF37]" /> Official Instagram
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Sub Footer */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[#777777] text-[11px]">
          <p>© {new Date().getFullYear()} SASA Official. All Rights Reserved. Crafted with Elegance.</p>
          <div className="flex items-center space-x-4">
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#999] hover:text-[#D4AF37] transition flex items-center gap-1 font-medium"
              id="subfooter-instagram-link"
            >
              <Instagram className="w-3.5 h-3.5 text-[#D4AF37]" /> instagram.com/sasaofficial.pk
            </a>
            <span>•</span>
            <span>COD Available Nationwide</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
