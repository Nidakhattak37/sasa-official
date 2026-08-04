import React from 'react';
import { useApp } from '../../context/AppContext';
import { ArrowUpRight } from 'lucide-react';

export const FeaturedCategories: React.FC = () => {
  const { categories, setCurrentView, setSelectedCategorySlug } = useApp();
  const featured = categories.filter(c => c.isFeatured !== false);

  return (
    <section className="py-16 bg-[#FAFAFA] border-b border-[#EAE4DC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs uppercase tracking-[0.25em] font-semibold text-[#9E8055]">
            Curated Collections
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-normal text-[#222222] mt-2">
            Explore Categories
          </h2>
          <div className="w-12 h-0.5 bg-[#9E8055] mx-auto mt-4" />
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
          {featured.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategorySlug(cat.slug);
                setCurrentView('shop');
              }}
              className="group relative flex flex-col items-center text-center overflow-hidden rounded-lg bg-white border border-[#EAE4DC] hover:shadow-xl transition-all duration-300"
            >
              {/* Image Container */}
              <div className="relative w-full aspect-[3/4] overflow-hidden bg-[#F5F1EC]">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                
                <div className="absolute top-3 right-3 p-1.5 bg-white/90 rounded-full text-[#222] opacity-0 group-hover:opacity-100 transition-opacity shadow">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Text Meta */}
              <div className="p-3.5 w-full bg-white text-center">
                <h3 className="font-serif text-base font-semibold text-[#222222] group-hover:text-[#9E8055] transition">
                  {cat.name}
                </h3>
                <p className="text-[11px] text-[#777777] mt-0.5 font-medium truncate">
                  {cat.subcategories?.[0] || 'Explore Edit'}
                </p>
              </div>
            </button>
          ))}
        </div>

      </div>
    </section>
  );
};
