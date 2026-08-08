import React from 'react';
import { useApp } from '../../context/AppContext';
import { ArrowRight } from 'lucide-react';

export const ChikankariEditorial: React.FC = () => {
  const { setCurrentView, setSelectedCategorySlug, instantClassics } = useApp();

  const handleShopNow = () => {
    if (instantClassics.categorySlug) {
      setSelectedCategorySlug(instantClassics.categorySlug);
    }
    setCurrentView('shop');
  };

  return (
    <section className="w-full bg-white py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center bg-white rounded-3xl overflow-hidden shadow-xl border border-[#EAE4DC]">
          
          {/* Left Column: Full Portrait Photo */}
          <div className="relative w-full h-[460px] sm:h-[560px] lg:h-[620px] overflow-hidden group bg-gray-100">
            <img
              src={instantClassics.imageUrl || "/images/sky_blue_chikankari.jpg"}
              alt={instantClassics.title}
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
            />
          </div>

          {/* Right Column: Clean Editorial Copy */}
          <div className="p-8 sm:p-12 lg:p-16 flex flex-col justify-center space-y-6">
            <span className="text-xs sm:text-sm font-sans text-[#8B5E34] font-semibold uppercase tracking-widest">
              {instantClassics.tag || 'Instant classics'}
            </span>

            <h2 className="font-serif text-3xl sm:text-5xl font-normal text-[#1E1E24] tracking-tight leading-tight">
              {instantClassics.title}
            </h2>

            <p className="text-sm sm:text-base text-gray-600 font-sans leading-relaxed max-w-lg">
              {instantClassics.description}
            </p>

            <div className="pt-4">
              <button
                onClick={handleShopNow}
                className="px-9 py-4 bg-[#111111] hover:bg-[#D4AF37] text-white hover:text-[#111111] text-xs font-bold uppercase tracking-[0.2em] rounded-xl transition-all duration-300 shadow-lg inline-flex items-center gap-3 group"
              >
                <span>{instantClassics.buttonText || 'Shop Now'}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
