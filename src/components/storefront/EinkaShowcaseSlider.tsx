import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { ChevronLeft, ChevronRight, Heart, Eye, ShoppingBag, Check } from 'lucide-react';
import { Product } from '../../types';
import { formatPrice } from '../../utils/currency';
import { QuickViewModal } from './QuickViewModal';
import { SizeGuideModal } from './SizeGuideModal';

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
  const { products, setSelectedProductId, setCurrentView, toggleWishlist, isInWishlist, currency, addToCart, setIsCartDrawerOpen } = useApp();
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [addedProductId, setAddedProductId] = useState<string | null>(null);

  // 1. MECHANISM: Exactly 12 dresses. Best Sellers slide first. If < 12 best sellers, fill with other dresses.
  const showcase12Dresses = useMemo(() => {
    if (!products || products.length === 0) return [];

    const bestSellers = products.filter(p => Boolean(p.isBestSeller));
    const nonBestSellers = products.filter(p => !p.isBestSeller);

    let selected: Product[] = [];

    if (bestSellers.length >= 12) {
      // If 12 or more best sellers, take the first 12 best sellers
      selected = bestSellers.slice(0, 12);
    } else {
      // Showcase all best sellers first, then fill remainder from other products
      selected = [...bestSellers];
      const needed = 12 - selected.length;
      selected.push(...nonBestSellers.slice(0, needed));

      // In case the entire store has fewer than 12 unique items, cycle through catalog
      if (selected.length < 12 && products.length > 0) {
        let idx = 0;
        while (selected.length < 12) {
          selected.push(products[idx % products.length]);
          idx++;
        }
      }
    }

    return selected.slice(0, 12);
  }, [products]);

  // 2. INFINITE REPEATING MECHANISM:
  // Render 3 identical sets of the 12 dresses so the track seamlessly wraps forever
  const repeatedSets = [0, 1, 2];

  // Initialize scroll position to the middle set so users can scroll left and right smoothly
  useEffect(() => {
    const timer = setTimeout(() => {
      if (sliderRef.current) {
        const singleSetWidth = sliderRef.current.scrollWidth / 3;
        if (singleSetWidth > 0) {
          sliderRef.current.scrollLeft = singleSetWidth;
        }
      }
    }, 60);

    return () => clearTimeout(timer);
  }, [showcase12Dresses]);

  // Continuous auto-sliding with boundary wrap-around
  useEffect(() => {
    let animationId: number;
    let lastTimestamp = performance.now();

    const animate = (currentTimestamp: number) => {
      const delta = currentTimestamp - lastTimestamp;
      lastTimestamp = currentTimestamp;

      if (!isHovered && sliderRef.current) {
        const el = sliderRef.current;
        const singleSetWidth = el.scrollWidth / 3;

        if (singleSetWidth > 0) {
          // Slow, serene, luxury showcase glide speed (~16 pixels per second)
          const stepPx = (16 * delta) / 1000;
          el.scrollLeft += stepPx;

          // Seamless wrap: when entering the 3rd set, reset back to middle set
          if (el.scrollLeft >= 2 * singleSetWidth) {
            el.scrollLeft -= singleSetWidth;
          }
        }
      }

      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [isHovered, showcase12Dresses]);

  // Normalization on manual scrolling / swipe
  const handleScroll = () => {
    if (!sliderRef.current) return;
    const el = sliderRef.current;
    const singleSetWidth = el.scrollWidth / 3;
    if (singleSetWidth <= 0) return;

    if (el.scrollLeft >= 2 * singleSetWidth) {
      el.scrollLeft -= singleSetWidth;
    } else if (el.scrollLeft <= 10) {
      el.scrollLeft += singleSetWidth;
    }
  };

  // Left & Right Arrow Navigation with infinite wrap-around
  const scroll = (direction: 'left' | 'right') => {
    if (!sliderRef.current) return;
    const el = sliderRef.current;
    const singleSetWidth = el.scrollWidth / 3;
    const scrollAmount = Math.min(el.clientWidth * 0.75, 420);

    if (direction === 'left') {
      if (el.scrollLeft - scrollAmount < 20) {
        el.scrollLeft += singleSetWidth;
      }
      el.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    } else {
      if (el.scrollLeft + scrollAmount >= 2 * singleSetWidth) {
        el.scrollLeft -= singleSetWidth;
      }
      el.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleProductClick = (product: Product) => {
    setSelectedProductId(product.id);
    setCurrentView('product-detail');
  };

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    const size = product.sizes[0] || 'M';
    const color = product.colors[0]?.name || 'Standard';
    addToCart(product, size, color, 1);
    setAddedProductId(product.id);
    setIsCartDrawerOpen(true);
    setTimeout(() => {
      setAddedProductId(null);
    }, 2000);
  };

  const handleQuickView = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    setQuickViewProduct(product);
  };

  if (showcase12Dresses.length === 0) return null;

  return (
    <section className="py-12 bg-white border-b border-[#EAE4DC] overflow-hidden select-none">
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
              className="p-2.5 rounded-full bg-white border border-[#EAE4DC] text-[#1E1E24] hover:bg-[#1E1E24] hover:text-white transition shadow-sm cursor-pointer"
              aria-label="Previous dresses"
              title="Previous"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="p-2.5 rounded-full bg-white border border-[#EAE4DC] text-[#1E1E24] hover:bg-[#1E1E24] hover:text-white transition shadow-sm cursor-pointer"
              aria-label="Next dresses"
              title="Next"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Light Fast Horizontal Slider (Continuous Repeating Looping) */}
        <div
          ref={sliderRef}
          onScroll={handleScroll}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="flex gap-4 sm:gap-6 overflow-x-auto scrollbar-none pb-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {repeatedSets.map((setIndex) =>
            showcase12Dresses.map((product, pIdx) => {
              const inWishlist = isInWishlist(product.id);
              const cardKey = `festive-set-${setIndex}-${product.id}-${pIdx}`;
              const isCardHovered = hoveredProduct === cardKey;
              const primaryImg = product.images[0] || '/images/sky_blue_chikankari.jpg';
              const secondaryImg = product.images[1] || primaryImg;
              const isJustAdded = addedProductId === product.id;

              return (
                <div
                  key={cardKey}
                  onMouseEnter={() => setHoveredProduct(cardKey)}
                  onMouseLeave={() => setHoveredProduct(null)}
                  className="flex-none w-[260px] sm:w-[320px] md:w-[340px] group cursor-pointer"
                >
                  {/* Image Container */}
                  <div 
                    onClick={() => handleProductClick(product)}
                    className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-[#FBF9F5] shadow-sm border border-[#EAE4DC] mb-3"
                  >
                    {/* Top Badges */}
                    <div className="absolute top-3 left-3 z-20 flex flex-col gap-1.5 pointer-events-none">
                      {product.isBestSeller && (
                        <span className="px-2.5 py-1 bg-[#1E1E24] text-[#D4AF37] text-[10px] font-bold tracking-wider uppercase rounded-sm shadow-md border border-[#D4AF37]/40 flex items-center gap-1">
                          ★ BEST SELLER
                        </span>
                      )}
                      {product.isSale && (
                        <span className="px-2.5 py-1 bg-[#8B5E34] text-white text-[10px] font-bold tracking-wider uppercase rounded-sm shadow-md">
                          SALE
                        </span>
                      )}
                      {product.isNewArrival && !product.isBestSeller && (
                        <span className="px-2.5 py-1 bg-[#8A9A86] text-white text-[10px] font-bold tracking-wider uppercase rounded-sm shadow-md">
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
                      className={`absolute top-3 right-3 z-20 p-2 rounded-full backdrop-blur-md transition shadow cursor-pointer ${
                        inWishlist ? 'bg-red-50 text-red-500' : 'bg-white/85 text-[#1E1E24] hover:bg-white'
                      }`}
                      title={inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
                    >
                      <Heart className={`w-4 h-4 ${inWishlist ? 'fill-current text-red-500' : ''}`} />
                    </button>

                    {/* Image 1 (Primary) */}
                    <img
                      src={primaryImg}
                      alt={product.name}
                      loading="lazy"
                      className={`w-full h-full object-cover object-top transition-opacity duration-700 ease-out ${
                        isCardHovered && secondaryImg !== primaryImg ? 'opacity-0' : 'opacity-100'
                      }`}
                    />

                    {/* Image 2 (Secondary on Hover) */}
                    {secondaryImg !== primaryImg && (
                      <img
                        src={secondaryImg}
                        alt={product.name}
                        loading="lazy"
                        className={`absolute inset-0 w-full h-full object-cover object-top transition-opacity duration-700 ease-out ${
                          isCardHovered ? 'opacity-100 scale-105' : 'opacity-0 scale-100'
                        }`}
                      />
                    )}

                    {/* Quick View & Add to Cart Action Bar */}
                    <div className="absolute inset-x-2 bottom-2 p-1.5 bg-gradient-to-t from-black/80 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-1.5 z-20">
                      <button
                        onClick={(e) => handleQuickView(e, product)}
                        className="flex-1 py-2 px-2 bg-white text-[#1E1E24] hover:bg-[#8B5E34] hover:text-white font-bold text-[10px] uppercase tracking-wider rounded-lg transition shadow flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Quick View
                      </button>
                      <button
                        onClick={(e) => handleAddToCart(e, product)}
                        className={`flex-1 py-2 px-2 font-bold text-[10px] uppercase tracking-wider rounded-lg transition shadow flex items-center justify-center gap-1 cursor-pointer ${
                          isJustAdded
                            ? 'bg-emerald-600 text-white'
                            : 'bg-[#222222] text-white hover:bg-[#8B5E34]'
                        }`}
                      >
                        {isJustAdded ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            Added
                          </>
                        ) : (
                          <>
                            <ShoppingBag className="w-3.5 h-3.5" />
                            Add to Cart
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Product Meta Info */}
                  <div onClick={() => handleProductClick(product)} className="space-y-1">
                    
                    {/* 1. Name: Bold, Capitalized Every First Letter */}
                    <h3 className="font-bold text-base sm:text-lg text-[#1E1E24] tracking-tight line-clamp-2 group-hover:text-[#9E8055] transition-colors leading-snug">
                      {toTitleCase(product.name)}
                    </h3>

                    {/* 2. Collection / Season: Placed strictly BETWEEN Name and Price */}
                    <div className="text-xs font-semibold text-[#8B5E34]">
                      {product.collectionType || product.collection || 'Festive / Eid Special'}
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
            })
          )}
        </div>

      </div>

      {/* Quick View Modal */}
      {quickViewProduct && (
        <QuickViewModal
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
          onOpenSizeGuide={() => {
            setQuickViewProduct(null);
            setIsSizeGuideOpen(true);
          }}
        />
      )}

      {/* Size Guide Modal */}
      {isSizeGuideOpen && (
        <SizeGuideModal onClose={() => setIsSizeGuideOpen(false)} />
      )}
    </section>
  );
};


