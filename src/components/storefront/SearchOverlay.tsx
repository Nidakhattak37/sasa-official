import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { formatPrice } from '../../utils/currency';
import { Search, X, ArrowRight, Tag } from 'lucide-react';

export const SearchOverlay: React.FC = () => {
  const { isSearchOpen, setIsSearchOpen, products, currency, setCurrentView, setSelectedProductId } = useApp();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery('');
    }
  }, [isSearchOpen]);

  if (!isSearchOpen) return null;

  const filteredProducts = query.trim() === '' ? [] : products.filter(p =>
    p.name.toLowerCase().includes(query.toLowerCase()) ||
    p.category.toLowerCase().includes(query.toLowerCase()) ||
    p.fabricDetails.toLowerCase().includes(query.toLowerCase()) ||
    p.sku.toLowerCase().includes(query.toLowerCase()) ||
    p.tags?.some(t => t.toLowerCase().includes(query.toLowerCase()))
  );

  const popularTags = ['Velvet', 'Pret', 'Lawn', 'Chiffon', 'Unstitched', 'Sale', 'Silk', 'Organza'];

  const handleSelectProduct = (productId: string) => {
    setSelectedProductId(productId);
    setCurrentView('product-detail');
    setIsSearchOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="max-w-4xl mx-auto pt-16 px-4">
        
        {/* Search Input Bar */}
        <div className="relative bg-white rounded-xl shadow-2xl p-4 flex items-center gap-3">
          <Search className="w-6 h-6 text-[#9E8055] flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by collection, fabric (e.g., Velvet, Lawn, Silk), SKU, or title..."
            className="w-full text-base sm:text-lg text-[#222222] font-medium placeholder-gray-400 bg-transparent focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-gray-400 hover:text-black"
            >
              <X className="w-5 h-5" />
            </button>
          )}
          <button
            onClick={() => setIsSearchOpen(false)}
            className="p-2 text-xs font-semibold uppercase tracking-wider bg-[#F5F1EC] text-[#222] hover:bg-[#EAE4DC] rounded-lg transition ml-2"
          >
            Esc
          </button>
        </div>

        {/* Popular Tags */}
        {query.trim() === '' && (
          <div className="mt-8 bg-white/95 backdrop-blur rounded-xl p-6 shadow-xl border border-white/20">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-[#888888] mb-3 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5" /> Popular Searches
            </h4>
            <div className="flex flex-wrap gap-2">
              {popularTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => setQuery(tag)}
                  className="px-3.5 py-1.5 bg-[#F5F1EC] hover:bg-[#9E8055] hover:text-white text-[#222] text-xs font-medium rounded-full transition"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results Container */}
        {query.trim() !== '' && (
          <div className="mt-4 bg-white rounded-xl shadow-2xl overflow-hidden max-h-[60vh] overflow-y-auto border border-[#EAE4DC]">
            <div className="p-3 bg-[#FAFAFA] border-b border-[#EAE4DC] text-xs text-[#777777] font-medium flex justify-between items-center">
              <span>Matching Products ({filteredProducts.length})</span>
              <span>Press item to view</span>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="p-12 text-center text-[#777777] space-y-2">
                <p className="font-serif text-lg font-semibold text-[#222]">No products found</p>
                <p className="text-xs">Try searching for "Velvet", "Chiffon", "Lawn", or "Luxury Pret"</p>
              </div>
            ) : (
              <div className="divide-y divide-[#F2F2F2]">
                {filteredProducts.map(product => (
                  <button
                    key={product.id}
                    onClick={() => handleSelectProduct(product.id)}
                    className="w-full p-4 flex items-center justify-between hover:bg-[#F5F1EC] transition text-left group"
                  >
                    <div className="flex items-center space-x-4">
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-14 h-16 object-cover rounded bg-[#F5F1EC]"
                      />
                      <div>
                        <span className="text-[10px] uppercase tracking-wider font-semibold text-[#9E8055]">
                          {product.category}
                        </span>
                        <h4 className="font-serif text-sm font-semibold text-[#222222] group-hover:text-[#9E8055] transition">
                          {product.name}
                        </h4>
                        <p className="text-xs text-[#777777] mt-0.5 truncate max-w-md">
                          {product.fabricDetails}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <span className="text-xs font-bold text-[#222222]">
                        {formatPrice(product.price, currency)}
                      </span>
                      <ArrowRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 group-hover:text-[#9E8055] transition-all" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
