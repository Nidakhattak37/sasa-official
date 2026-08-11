import React, { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { ChevronLeft, ChevronRight, Heart, Eye, ShoppingBag, Check, Sparkles, ArrowRight } from 'lucide-react';
import { Product } from '../../types';
import { formatPrice } from '../../utils/currency';
import { INITIAL_PRODUCTS } from '../../data/mockData';
import { normalizeImageUrl, handleImageError, DEFAULT_FALLBACK_IMAGE } from '../../utils/imageUrl';
import { QuickViewModal } from './QuickViewModal';
import { SizeGuideModal } from './SizeGuideModal';

// Helper to convert string to Title Case
const toTitleCase = (str: string) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export const EinkaShowcaseSlider: React.FC = () => {
  const { 
    products, 
    setSelectedProductId, 
    setCurrentView, 
    toggleWishlist, 
    isInWishlist, 
    currency, 
    addToCart, 
    setIsCartDrawerOpen 
  } = useApp();

  const sliderRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [addedProductId, setAddedProductId] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // 1. Curate Festive Collection (Always guarantee rich high-quality festive items)
  const showcaseDresses = useMemo(() => {
    const sourceProducts = (products && products.length > 0) ? products : INITIAL_PRODUCTS;
    if (!sourceProducts || sourceProducts.length === 0) return [];

    // Filter festive / eid / luxury pret items
    const festiveList = sourceProducts.filter(p => 
      (p.collectionType && p.collectionType.toLowerCase().includes('festive')) ||
      (p.collection && p.collection.toLowerCase().includes('festive')) ||
      (p.category && p.category.toLowerCase().includes('festive')) ||
      (p.season && p.season.toLowerCase().includes('festive')) ||
      (p.tags && p.tags.some(t => t.toLowerCase().includes('festive'))) ||
      Boolean(p.isBestSeller)
    );

    const nonFestive = sourceProducts.filter(p => !festiveList.some(fp => fp.id === p.id));
    const combined = [...festiveList, ...nonFestive];

    // Ensure we have at least 8 dresses for a rich showcase
    const result: Product[] = [];
    const seenIds = new Set<string>();
    
    for (const prod of combined) {
      if (!seenIds.has(prod.id)) {
        seenIds.add(prod.id);
        result.push(prod);
      }
      if (result.length >= 10) break;
    }

    return result.length > 0 ? result : sourceProducts.slice(0, 8);
  }, [products]);

  // Update scroll bounds and active index on scroll
  const handleScroll = useCallback(() => {
    if (!sliderRef.current) return;
    const el = sliderRef.current;
    
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 10);

    // Calculate approximate active card index
    const cardWidth = el.clientWidth < 640 ? el.clientWidth * 0.78 : 340;
    const newIdx = Math.min(
      Math.max(0, Math.round(el.scrollLeft / (cardWidth + 16))),
      showcaseDresses.length - 1
    );
    setActiveIndex(newIdx);
  }, [showcaseDresses.length]);

  useEffect(() => {
    handleScroll();
  }, [handleScroll, showcaseDresses]);

  // Navigation handlers
  const scrollPrev = () => {
    if (!sliderRef.current) return;
    const el = sliderRef.current;
    const scrollAmount = el.clientWidth < 640 ? el.clientWidth * 0.82 : 360;

    if (el.scrollLeft <= 15) {
      // Loop to end
      el.scrollTo({ left: el.scrollWidth - el.clientWidth, behavior: 'smooth' });
    } else {
      el.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    }
  };

  const scrollNext = () => {
    if (!sliderRef.current) return;
    const el = sliderRef.current;
    const scrollAmount = el.clientWidth < 640 ? el.clientWidth * 0.82 : 360;

    if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 20) {
      // Loop back to start
      el.scrollTo({ left: 0, behavior: 'smooth' });
    } else {
      el.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const scrollToIndex = (index: number) => {
    if (!sliderRef.current) return;
    const el = sliderRef.current;
    const cardWidth = el.clientWidth < 640 ? el.clientWidth * 0.78 : 340;
    el.scrollTo({ left: index * (cardWidth + 16), behavior: 'smooth' });
  };

  // Reliable Autoplay Carousel (every 4.5 seconds when not hovered/touched)
  useEffect(() => {
    if (isPaused || showcaseDresses.length <= 1) return;

    const timer = setInterval(() => {
      scrollNext();
    }, 4500);

    return () => clearInterval(timer);
  }, [isPaused, showcaseDresses.length]);

  const handleProductClick = (product: Product) => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
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

  const handleViewAllFestive = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
    setCurrentView('shop');
  };

  if (showcaseDresses.length === 0) return null;

  return (
    <section 
      className="py-12 sm:py-16 bg-white border-b border-[#EAE4DC] overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-bold uppercase tracking-[0.25em] text-[#9E8055]">
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Editorial Spotlight</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-4xl font-normal text-[#1E1E24] tracking-tight mt-1">
              The Festive Collection
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-md">
              Handcrafted zardozi, tillawork motifs, and pure organza dupattas for celebratory elegance.
            </p>
          </div>

          {/* Navigation Controls & View All CTA */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleViewAllFestive}
              className="hidden md:inline-flex items-center gap-1.5 text-xs font-bold text-[#8B5E34] hover:text-[#1E1E24] transition-colors py-2 px-3 rounded-lg hover:bg-[#FAF8F5] mr-2"
            >
              <span>Explore All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={scrollPrev}
              className="p-2.5 sm:p-3 rounded-full bg-white border border-[#EAE4DC] text-[#1E1E24] hover:bg-[#1E1E24] hover:text-white transition-all shadow-sm cursor-pointer active:scale-95 disabled:opacity-40"
              aria-label="Previous Festive Dresses"
              title="Previous"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button
              onClick={scrollNext}
              className="p-2.5 sm:p-3 rounded-full bg-white border border-[#EAE4DC] text-[#1E1E24] hover:bg-[#1E1E24] hover:text-white transition-all shadow-sm cursor-pointer active:scale-95 disabled:opacity-40"
              aria-label="Next Festive Dresses"
              title="Next"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Horizontal Smooth Scrollable Carousel Track */}
        <div
          ref={sliderRef}
          onScroll={handleScroll}
          className="flex gap-4 sm:gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-none pb-4 pt-1"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {showcaseDresses.map((product, pIdx) => {
            const inWishlist = isInWishlist(product.id);
            const isCardHovered = hoveredCardId === product.id;
            const primaryImg = normalizeImageUrl(product.images?.[0], pIdx);
            const secondaryImg = normalizeImageUrl(product.images?.[1] || product.images?.[0], pIdx + 1);
            const isJustAdded = addedProductId === product.id;

            return (
              <div
                key={product.id || pIdx}
                onMouseEnter={() => setHoveredCardId(product.id)}
                onMouseLeave={() => setHoveredCardId(null)}
                className="flex-none w-[270px] sm:w-[310px] md:w-[340px] snap-start group cursor-pointer"
              >
                {/* Image Container */}
                <div 
                  onClick={() => handleProductClick(product)}
                  className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-[#FBF9F5] shadow-sm border border-[#EAE4DC] mb-3.5 transition-all duration-300 group-hover:shadow-lg group-hover:border-[#D4AF37]/50"
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
                    className={`absolute top-3 right-3 z-20 p-2.5 rounded-full backdrop-blur-md transition-all duration-200 shadow cursor-pointer ${
                      inWishlist 
                        ? 'bg-red-50 text-red-500 scale-105' 
                        : 'bg-white/85 text-[#1E1E24] hover:bg-white hover:scale-110 hover:text-red-500'
                    }`}
                    title={inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
                  >
                    <Heart className={`w-4 h-4 ${inWishlist ? 'fill-current text-red-500' : ''}`} />
                  </button>

                  {/* Primary Image */}
                  <img
                    src={primaryImg}
                    alt={product.name}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    onError={(e) => handleImageError(e, DEFAULT_FALLBACK_IMAGE)}
                    className={`w-full h-full object-cover object-top transition-opacity duration-700 ease-out ${
                      isCardHovered && secondaryImg !== primaryImg ? 'opacity-0' : 'opacity-100'
                    }`}
                  />

                  {/* Secondary Image on Hover */}
                  {secondaryImg !== primaryImg && (
                    <img
                      src={secondaryImg}
                      alt={product.name}
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      onError={(e) => handleImageError(e, DEFAULT_FALLBACK_IMAGE)}
                      className={`absolute inset-0 w-full h-full object-cover object-top transition-all duration-700 ease-out ${
                        isCardHovered ? 'opacity-100 scale-105' : 'opacity-0 scale-100'
                      }`}
                    />
                  )}

                  {/* Quick Actions Hover Drawer */}
                  <div className="absolute inset-x-2 bottom-2 p-1.5 bg-gradient-to-t from-black/85 via-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-1.5 z-20 rounded-xl">
                    <button
                      onClick={(e) => handleQuickView(e, product)}
                      className="flex-1 py-2 px-2 bg-white text-[#1E1E24] hover:bg-[#8B5E34] hover:text-white font-bold text-[10px] uppercase tracking-wider rounded-lg transition-all shadow flex items-center justify-center gap-1 cursor-pointer active:scale-95"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Quick View
                    </button>
                    <button
                      onClick={(e) => handleAddToCart(e, product)}
                      className={`flex-1 py-2 px-2 font-bold text-[10px] uppercase tracking-wider rounded-lg transition-all shadow flex items-center justify-center gap-1 cursor-pointer active:scale-95 ${
                        isJustAdded
                          ? 'bg-emerald-600 text-white'
                          : 'bg-[#1E1E24] text-white hover:bg-[#8B5E34]'
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
                  {/* 1. Name */}
                  <h3 className="font-bold text-base sm:text-lg text-[#1E1E24] tracking-tight line-clamp-1 group-hover:text-[#9E8055] transition-colors leading-snug">
                    {toTitleCase(product.name)}
                  </h3>

                  {/* 2. Collection / Season */}
                  {(product.collectionType || product.collection || product.category) && (
                    <div className="text-xs font-semibold text-[#8B5E34]">
                      {product.collectionType || product.collection || product.category}
                    </div>
                  )}
                  
                  {/* 3. Price */}
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

        {/* Carousel Pagination Dots */}
        {showcaseDresses.length > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            {showcaseDresses.map((_, dotIdx) => (
              <button
                key={dotIdx}
                onClick={() => scrollToIndex(dotIdx)}
                className={`transition-all duration-300 rounded-full cursor-pointer ${
                  dotIdx === activeIndex
                    ? 'w-6 h-2 bg-[#8B5E34]'
                    : 'w-2 h-2 bg-[#EAE4DC] hover:bg-gray-400'
                }`}
                aria-label={`Go to slide ${dotIdx + 1}`}
              />
            ))}
          </div>
        )}

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
