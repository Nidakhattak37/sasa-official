import React from 'react';
import { useApp } from '../../context/AppContext';
import { ArrowRight, Sparkles } from 'lucide-react';

export const LargeBannersSection: React.FC = () => {
  const { setCurrentView, setSelectedCategorySlug } = useApp();

  const handleNavigate = (slug: string) => {
    setSelectedCategorySlug(slug);
    setCurrentView('shop');
  };

  return (
    <section className="py-12 bg-[#FAF8F5]">
      {/* Two-Column Large Side-by-Side Editorial Banners */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          
          {/* Card 1: Ready to Wear Pret */}
          <div 
            onClick={() => handleNavigate('pret')}
            className="relative h-[440px] sm:h-[520px] rounded-3xl overflow-hidden shadow-xl border border-[#EAE4DC] group cursor-pointer"
          >
            <img
              src="https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&q=80&w=1200"
              alt="Ready to Wear Pret"
              className="w-full h-full object-cover object-top group-hover:scale-108 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent group-hover:from-black/90 transition-colors" />

            <div className="absolute bottom-0 inset-x-0 p-8 sm:p-10 space-y-2 text-white">
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#D4AF37] font-semibold">
                Casual & Formal Pret
              </span>
              <h3 className="font-serif text-2xl sm:text-4xl font-normal text-white">
                Ready to Wear Pret
              </h3>
              <p className="text-xs text-gray-300 font-sans line-clamp-2">
                Tailored 2-piece and 3-piece ready wear in breathable cott-net, lawn, and raw silk.
              </p>
              <div className="pt-3">
                <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#D4AF37] group-hover:translate-x-1.5 transition-transform">
                  Shop Pret Edit <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Luxury Couture & Unstitched */}
          <div 
            onClick={() => handleNavigate('unstitched')}
            className="relative h-[440px] sm:h-[520px] rounded-3xl overflow-hidden shadow-xl border border-[#EAE4DC] group cursor-pointer"
          >
            <img
              src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=1200"
              alt="Unstitched Luxury Suits"
              className="w-full h-full object-cover object-top group-hover:scale-108 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent group-hover:from-black/90 transition-colors" />

            <div className="absolute bottom-0 inset-x-0 p-8 sm:p-10 space-y-2 text-white">
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#D4AF37] font-semibold">
                Unstitched Lawn '26
              </span>
              <h3 className="font-serif text-2xl sm:text-4xl font-normal text-white">
                Hand-Embroidered Unstitched
              </h3>
              <p className="text-xs text-gray-300 font-sans line-clamp-2">
                Heavy dabka, tillawork, and resham hand-embroidered festive 3-piece suits with organza dupattas.
              </p>
              <div className="pt-3">
                <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#D4AF37] group-hover:translate-x-1.5 transition-transform">
                  Explore Unstitched Lawn <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
