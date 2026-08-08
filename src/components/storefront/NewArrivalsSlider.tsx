import React, { useRef, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ProductCard } from './ProductCard';
import { QuickViewModal } from './QuickViewModal';
import { SizeGuideModal } from './SizeGuideModal';
import { Product } from '../../types';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

export const NewArrivalsSlider: React.FC = () => {
  const { products } = useApp();
  const sliderRef = useRef<HTMLDivElement>(null);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);

  const newArrivals = products.filter(p => p.isNewArrival);

  const scroll = (direction: 'left' | 'right') => {
    if (sliderRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      sliderRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section className="py-16 bg-white border-b border-[#EAE4DC] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header with Navigation */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs uppercase tracking-[0.25em] font-semibold text-[#9E8055] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Just Dropped
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-normal text-[#222222] mt-1">
              New Arrivals Slider
            </h2>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => scroll('left')}
              className="p-2.5 rounded-full border border-[#EAE4DC] bg-white hover:bg-[#F5F1EC] text-[#222] shadow-sm transition"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="p-2.5 rounded-full border border-[#EAE4DC] bg-white hover:bg-[#F5F1EC] text-[#222] shadow-sm transition"
              aria-label="Next slide"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Horizontal Slider */}
        <div
          ref={sliderRef}
          className="flex space-x-6 overflow-x-auto no-scrollbar scroll-smooth pb-4"
        >
          {newArrivals.map(product => (
            <div key={product.id} className="w-[280px] sm:w-[320px] flex-shrink-0">
              <ProductCard
                product={product}
                onQuickView={(p) => setQuickViewProduct(p)}
              />
            </div>
          ))}
        </div>

      </div>

      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onOpenSizeGuide={() => setIsSizeGuideOpen(true)}
      />

      <SizeGuideModal
        isOpen={isSizeGuideOpen}
        onClose={() => setIsSizeGuideOpen(false)}
      />
    </section>
  );
};
