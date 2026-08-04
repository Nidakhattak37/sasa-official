import React, { useRef, useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ChevronLeft, ChevronRight, Heart, Eye, ShoppingBag } from 'lucide-react';
import { Product } from '../../types';
import { formatPrice } from '../../utils/currency';

// Helper to convert string to Title Case (Capitalize Every First Letter)
const toTitleCase = (str: string) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export const EinkaShowcaseSlider: React.FC = () => {
  const { products, setSelectedProductId, setCurrentView, toggleWishlist, wishlist, currency, addToCart } = useApp();
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);

  // Dynamic filter for showcase: includes ALL products marked as new arrival (isNewArrival: true)
  const newArrivalProducts = products.filter(p => p.isNewArrival === true);
  const showcaseProducts = newArrivalProducts.length > 0 ? newArrivalProducts : products.slice(0, 8);

  // Slow-motion auto scroll when not hovered
  useEffect(() => {
    if (isHovered) return;
    const interval = setInterval(() => {
      if (sliderRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
        if (scrollLeft + clientWidth >= scrollWidth - 5) {
          sliderRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          sliderRef.current.scrollBy({ left: 1.5, behavior: 'auto' });
        }
      }
    }, 25);

    return () => clearInterval(interval);
  }, [isHovered]);

  const scroll = (direction: 'left' | 'right') => {
    if (sliderRef.current) {
      const scrollAmount = sliderRef.current.clientWidth * 0.75;
      sliderRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const handleProductClick = (product: Product) => {
    setSelectedProductId(product.id);
    setCurrentView('product-detail');
  };

  return (
    <section className="py-10 bg-[#FAF8F5] border-b border-[#EAE4DC] overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex items-end justify-between mb-6">
          <div>
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.25em] text-[#9E8055]">
              New Editorial Showcase
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl font-normal text-[#1E1E24] tracking-tight mt-1">
              The Festive Collection
            </h2>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => scroll('left')}
              className="p-2.5 rounded-full bg-white border border-[#EAE4DC] text-[#1E1E24] hover:bg-[#1E1E24] hover:text-white transition shadow-sm"
              aria-label="Previous"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="p-2.5 rounded-full bg-white border border-[#EAE4DC] text-[#1E1E24] hover:bg-[#1E1E24] hover:text-white transition shadow-sm"
              aria-label="Next"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Slow Motion Horizontal Slider */}
        <div
          ref={sliderRef}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="flex gap-4 sm:gap-6 overflow-x-auto scrollbar-none scroll-smooth pb-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {showcaseProducts.map((product) => {
            const inWishlist = wishlist.includes(product.id);
            const isCardHovered = hoveredProduct === product.id;
            const primaryImg = product.images[0] || '';
            const secondaryImg = product.images[1] || primaryImg;

            return (
              <div
                key={product.id}
                onMouseEnter={() => setHoveredProduct(product.id)}
                onMouseLeave={() => setHoveredProduct(null)}
                className="flex-none w-[260px] sm:w-[320px] md:w-[340px] group cursor-pointer"
              >
                {/* Image Container */}
                <div 
                  onClick={() => handleProductClick(product)}
                  className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-gray-100 shadow-sm border border-[#EAE4DC] mb-3"
                >
                  {/* Top Badges (No Unstitched text on top) */}
                  <div className="absolute top-3 left-3 z-20 flex flex-col gap-1">
                    {product.isSale && (
                      <span className="px-3 py-1 bg-[#8B5E34] text-white text-[10px] font-bold tracking-wider uppercase rounded-sm shadow-md">
                        Sale
                      </span>
                    )}
                    {product.isBestSeller && (
                      <span className="px-3 py-1 bg-[#222222] text-[#D4AF37] text-[10px] font-bold tracking-wider uppercase rounded-sm shadow-md border border-[#D4AF37]/30">
                        BEST SELLER
                      </span>
                    )}
                    {product.isNewArrival && (
                      <span className="px-3 py-1 bg-[#8A9A86] text-white text-[10px] font-bold tracking-wider uppercase rounded-sm shadow-md">
                        NEW
                      </span>
                    )}
                  </div>

                  {/* Wishlist Icon */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleWishlist(product.id);
                    }}
                    className={`absolute top-3 right-3 z-20 p-2 rounded-full backdrop-blur-md transition shadow ${
                      inWishlist ? 'bg-red-50 text-red-500' : 'bg-white/80 text-[#1E1E24] hover:bg-white'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${inWishlist ? 'fill-current text-red-500' : ''}`} />
                  </button>

                  {/* Image 1 (Primary) */}
                  <img
                    src={primaryImg}
                    alt={product.name}
                    className={`w-full h-full object-cover object-top transition-opacity duration-700 ease-out ${
                      isCardHovered && secondaryImg !== primaryImg ? 'opacity-0' : 'opacity-100'
                    }`}
                  />

                  {/* Image 2 (Secondary on Hover) */}
                  {secondaryImg !== primaryImg && (
                    <img
                      src={secondaryImg}
                      alt={product.name}
                      className={`absolute inset-0 w-full h-full object-cover object-top transition-opacity duration-700 ease-out ${
                        isCardHovered ? 'opacity-100 scale-105' : 'opacity-0 scale-100'
                      }`}
                    />
                  )}

                  {/* Quick View & Add to Cart Action Bar */}
                  <div className="absolute inset-x-2 bottom-2 p-1.5 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-1.5 z-20">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleProductClick(product);
                      }}
                      className="flex-1 py-2 px-2 bg-white text-[#1E1E24] hover:bg-[#8B5E34] hover:text-white font-bold text-[10px] uppercase tracking-wider rounded-lg transition shadow flex items-center justify-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Quick View
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(product, product.sizes[0] || 'M', product.colors[0]?.name || 'Standard', 1);
                      }}
                      className="flex-1 py-2 px-2 bg-[#222222] text-white hover:bg-[#8B5E34] font-bold text-[10px] uppercase tracking-wider rounded-lg transition shadow flex items-center justify-center gap-1"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      Add to Cart
                    </button>
                  </div>
                </div>

                {/* Product Meta Info */}
                <div onClick={() => handleProductClick(product)} className="space-y-1">
                  
                  {/* 1. Name: Bold, Capitalized Every First Letter, Slightly Larger */}
                  <h3 className="font-bold text-base sm:text-lg text-[#1E1E24] tracking-tight line-clamp-2 group-hover:text-[#9E8055] transition-colors leading-snug">
                    {toTitleCase(product.name)}
                  </h3>

                  {/* 2. Collection / Season: Placed strictly BETWEEN Name and Price */}
                  <div className="text-xs font-semibold text-[#8B5E34]">
                    {product.collectionType || product.collection || 'Summer Lawn'}
                  </div>
                  
                  {/* 3. Price: Only cut/strike-through price IF product is explicitly marked on sale */}
                  <div className="flex items-baseline gap-2 text-sm sm:text-base font-bold text-[#1E1E24] pt-0.5">
                    <span>
                      {formatPrice(product.price, currency)}
                    </span>
                    {product.isSale && product.originalPrice && product.originalPrice > product.price && (
                      <span className="text-gray-400 line-through text-xs font-normal">
                        {formatPrice(product.originalPrice, currency)}
                      </span>
                    )}
                  </div>

                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

