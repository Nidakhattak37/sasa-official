import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ProductCard } from './ProductCard';
import { QuickViewModal } from './QuickViewModal';
import { SizeGuideModal } from './SizeGuideModal';
import { Product } from '../../types';

export const BestSellers: React.FC = () => {
  const { products, setCurrentView, setSelectedCategorySlug } = useApp();
  const [activeTab, setActiveTab] = useState<'all' | 'pret' | 'luxury-pret' | 'unstitched'>('all');
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);

  const bestSellers = products.filter(p => p.isBestSeller || p.isFeatured);

  const filtered = bestSellers.filter(p => {
    if (activeTab === 'all') return true;
    if (activeTab === 'pret') return p.category.toLowerCase().includes('pret') && !p.category.toLowerCase().includes('luxury');
    if (activeTab === 'luxury-pret') return p.category.toLowerCase().includes('luxury');
    if (activeTab === 'unstitched') return p.category.toLowerCase().includes('unstitched');
    return true;
  });

  return (
    <section className="py-16 bg-white border-b border-[#EAE4DC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-xs uppercase tracking-[0.25em] font-semibold text-[#9E8055]">
              Most Loved Fits
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-normal text-[#222222] mt-1">
              Best Sellers
            </h2>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-2 border-b border-[#EAE4DC] pb-2">
            {[
              { id: 'all', label: 'All Collection' },
              { id: 'pret', label: 'Pret' },
              { id: 'luxury-pret', label: 'Luxury Pret' },
              { id: 'unstitched', label: 'Unstitched' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all border-b-2 ${
                  activeTab === tab.id
                    ? 'border-[#9E8055] text-[#222222]'
                    : 'border-transparent text-[#777777] hover:text-[#222222]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filtered.slice(0, 8).map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onQuickView={(p) => setQuickViewProduct(p)}
            />
          ))}
        </div>

        {/* View All Button */}
        <div className="mt-12 text-center">
          <button
            onClick={() => {
              setSelectedCategorySlug(null);
              setCurrentView('shop');
            }}
            className="px-8 py-3 bg-transparent border border-[#222222] text-[#222222] hover:bg-[#222222] hover:text-white text-xs font-semibold uppercase tracking-[0.2em] rounded transition"
          >
            Explore Complete Catalogue
          </button>
        </div>

      </div>

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onOpenSizeGuide={() => setIsSizeGuideOpen(true)}
      />

      {/* Size Guide Modal */}
      <SizeGuideModal
        isOpen={isSizeGuideOpen}
        onClose={() => setIsSizeGuideOpen(false)}
      />
    </section>
  );
};
