import React from 'react';
import { useApp } from '../../context/AppContext';
import { ArrowRight, Sparkles } from 'lucide-react';
import { normalizeImageUrl, handleImageError, DEFAULT_FALLBACK_IMAGE } from '../../utils/imageUrl';

export const DualEditorialFeature: React.FC = () => {
  const { setCurrentView, setSelectedCategorySlug, dualEditorial } = useApp();

  const handleShopClick = (categorySlug?: string) => {
    if (categorySlug) {
      setSelectedCategorySlug(categorySlug);
    }
    setCurrentView('shop');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const left = dualEditorial?.left || {
    badge: "Summer Lawn Edit",
    subtitle: "New Arrival 2026",
    eyebrow: "Chikankari Luxury",
    title: "Pure Chikankari Lawn",
    description: "",
    imageUrl: "/images/sky_blue_chikankari.jpg",
    buttonText: "Show Now",
    categorySlug: "unstitched",
  };

  const right = dualEditorial?.right || {
    badge: "Festive Royale",
    subtitle: "★ Best Seller Suite",
    eyebrow: "Royal Evening Wear",
    title: "Embroidered Velvet & Silk",
    description: "",
    imageUrl: "/images/yellow_mustard_suit.jpg",
    buttonText: "Shop Now",
    categorySlug: "luxury-pret",
  };

  return (
    <section className="w-full relative bg-[#1E1E24] overflow-hidden">
      
      {/* Edge-to-Edge Full Screen Split Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 w-full min-h-[85vh] lg:min-h-screen gap-0 divide-y md:divide-y-0 md:divide-x divide-white/10">
        
        {/* Left Full-Bleed Image Half */}
        <div 
          onClick={() => handleShopClick(left.categorySlug)}
          className="group relative w-full h-[75vh] md:h-auto min-h-[550px] overflow-hidden cursor-pointer flex flex-col justify-between p-6 sm:p-10 lg:p-14"
        >
          {/* Background Image */}
          <img 
            src={normalizeImageUrl(left.imageUrl || "/images/sky_blue_chikankari.jpg", 0)} 
            alt={left.title} 
            referrerPolicy="no-referrer"
            onError={(e) => handleImageError(e, DEFAULT_FALLBACK_IMAGE)}
            className="absolute inset-0 w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-1000 ease-out"
          />
          
          {/* Subtle Dark Gradient Overlay for Readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20 group-hover:from-black/95 transition-colors duration-500" />

          {/* Top Floating Badge */}
          <div className="relative z-10 flex items-center justify-between">
            <span className="px-3.5 py-1.5 bg-[#8B5E34] text-white text-xs font-bold uppercase tracking-widest rounded-full shadow-lg border border-white/20 backdrop-blur-md">
              {left.badge || 'Summer Lawn Edit'}
            </span>
            {left.subtitle && (
              <span className="text-[11px] font-semibold uppercase tracking-widest text-white/80 bg-black/40 px-3 py-1 rounded-full border border-white/10 backdrop-blur-md">
                {left.subtitle}
              </span>
            )}
          </div>

          {/* Bottom Banner Content */}
          <div className="relative z-10 space-y-3 sm:space-y-4 max-w-xl">
            {left.eyebrow && (
              <div className="inline-flex items-center gap-1.5 text-amber-300 text-xs font-semibold uppercase tracking-widest">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{left.eyebrow}</span>
              </div>
            )}

            <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight drop-shadow-md">
              {left.title}
            </h2>

            <div className="pt-2">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleShopClick(left.categorySlug);
                }}
                className="px-7 py-3.5 bg-white text-[#1E1E24] hover:bg-[#8B5E34] hover:text-white font-bold text-xs uppercase tracking-widest rounded-xl shadow-2xl transition-all duration-300 flex items-center gap-3 group/btn"
              >
                <span>{left.buttonText || 'Shop Now'}</span>
                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1.5 transition-transform" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Full-Bleed Image Half */}
        <div 
          onClick={() => handleShopClick(right.categorySlug)}
          className="group relative w-full h-[75vh] md:h-auto min-h-[550px] overflow-hidden cursor-pointer flex flex-col justify-between p-6 sm:p-10 lg:p-14"
        >
          {/* Background Image */}
          <img 
            src={normalizeImageUrl(right.imageUrl || "/images/yellow_mustard_suit.jpg", 1)} 
            alt={right.title} 
            referrerPolicy="no-referrer"
            onError={(e) => handleImageError(e, DEFAULT_FALLBACK_IMAGE)}
            className="absolute inset-0 w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-1000 ease-out"
          />

          {/* Subtle Dark Gradient Overlay for Readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20 group-hover:from-black/95 transition-colors duration-500" />

          {/* Top Floating Badge */}
          <div className="relative z-10 flex items-center justify-between">
            <span className="px-3.5 py-1.5 bg-[#222222] text-[#D4AF37] border border-[#D4AF37]/50 text-xs font-bold uppercase tracking-widest rounded-full shadow-lg backdrop-blur-md">
              {right.badge || 'Festive Royale'}
            </span>
            {right.subtitle && (
              <span className="text-[11px] font-semibold uppercase tracking-widest text-amber-200/90 bg-black/40 px-3 py-1 rounded-full border border-white/10 backdrop-blur-md">
                {right.subtitle}
              </span>
            )}
          </div>

          {/* Bottom Banner Content */}
          <div className="relative z-10 space-y-3 sm:space-y-4 max-w-xl">
            {right.eyebrow && (
              <div className="inline-flex items-center gap-1.5 text-amber-300 text-xs font-semibold uppercase tracking-widest">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{right.eyebrow}</span>
              </div>
            )}

            <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight drop-shadow-md">
              {right.title}
            </h2>

            <div className="pt-2">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleShopClick(right.categorySlug);
                }}
                className="px-7 py-3.5 bg-white text-[#1E1E24] hover:bg-[#8B5E34] hover:text-white font-bold text-xs uppercase tracking-widest rounded-xl shadow-2xl transition-all duration-300 flex items-center gap-3 group/btn"
              >
                <span>{right.buttonText || 'Shop Now'}</span>
                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1.5 transition-transform" />
              </button>
            </div>
          </div>
        </div>

      </div>

    </section>
  );
};

