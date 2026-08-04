import React from 'react';
import { useApp } from '../../context/AppContext';
import { ArrowRight, Sparkles } from 'lucide-react';

export const FeaturedCategories: React.FC = () => {
  const { categories, setCurrentView, setSelectedCategorySlug } = useApp();
  
  // Filter out sale if desired, or show all non-sale categories for a clean, curated showcase
  const displayCategories = categories.filter(c => c.slug !== 'sale' && c.isFeatured !== false);

  return (
    <section className="py-20 bg-[#FAF8F5] border-b border-[#EAE4DC] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-[#F5F1EC] border border-[#D4AF37]/30 rounded-full">
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span className="text-[11px] uppercase tracking-[0.25em] font-semibold text-[#9E8055]">
              Signature Catalogue
            </span>
          </div>
          <h2 className="font-serif text-3xl sm:text-5xl font-normal text-[#1E1E24] tracking-tight">
            Explore Categories
          </h2>
          <p className="text-xs text-gray-500 tracking-wide font-sans max-w-md mx-auto">
            Immerse yourself in authentic Pakistani luxury hand-craftsmanship, fine fabrics, and timeless silhouettes.
          </p>
          <div className="w-16 h-0.5 bg-[#D4AF37] mx-auto mt-4 rounded-full" />
        </div>

        {/* Categories Grid - Luxury Portrait Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {displayCategories.map((cat, index) => (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategorySlug(cat.slug);
                setCurrentView('shop');
              }}
              className="group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-[#111111] aspect-[3/4] shadow-md hover:shadow-2xl border border-[#EAE4DC]/80 hover:border-[#D4AF37] transition-all duration-500 text-left"
            >
              {/* Background Image with Smooth Hover Scale */}
              <img
                src={cat.image}
                alt={cat.name}
                className="absolute inset-0 w-full h-full object-cover object-top group-hover:scale-108 transition-transform duration-700 ease-out opacity-85 group-hover:opacity-95"
              />

              {/* Luxury Multi-layer Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10 group-hover:from-black/95 group-hover:via-black/50 transition-colors duration-500" />

              {/* Top Meta Tag */}
              <div className="relative z-10 p-5 flex justify-between items-start">
                <span className="text-[10px] uppercase tracking-[0.25em] font-mono text-[#D4AF37] font-semibold bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-[#D4AF37]/30">
                  0{index + 1} / CATALOGUE
                </span>
              </div>

              {/* Bottom Text Content */}
              <div className="relative z-10 p-6 space-y-2 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                <p className="text-[11px] uppercase tracking-[0.2em] font-medium text-[#D4AF37]/90">
                  {cat.subcategories?.[0] || 'Exclusive Edit'}
                </p>
                <h3 className="font-serif text-2xl font-semibold text-white tracking-wide group-hover:text-[#D4AF37] transition-colors">
                  {cat.name}
                </h3>
                <p className="text-xs text-gray-300 line-clamp-2 leading-relaxed opacity-90 group-hover:opacity-100 transition-opacity">
                  {cat.description}
                </p>

                {/* Interactive CTA Link */}
                <div className="pt-3 flex items-center text-xs font-bold uppercase tracking-wider text-white group-hover:text-[#D4AF37] transition-colors gap-2">
                  <span>Shop Collection</span>
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1.5 transition-transform duration-300" />
                </div>
              </div>
            </button>
          ))}
        </div>

      </div>
    </section>
  );
};

