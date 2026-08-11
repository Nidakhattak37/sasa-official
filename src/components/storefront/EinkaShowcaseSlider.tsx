import React, { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { ChevronLeft, ChevronRight, Heart, Eye, ShoppingBag, Check, Sparkles } from 'lucide-react';
import { Product } from '../../types';
import { formatPrice } from '../../utils/currency';
import { INITIAL_PRODUCTS } from '../../data/mockData';
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
  const [isHovered, setIsHovered] = useState(false);
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [addedProductId, setAddedProductId] = useState<string | null>(null);

  // Mouse drag-to-scroll state
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftStart, setScrollLeftStart] = useState(0);
  const [dragDistance, setDragDistance] = useState(0);

  // Pause timer for auto-slide when user interacts manually
  const pauseUntilRef = useRef<number>(0);

  // 1. Curate Festive Collection (Fallback to INITIAL_PRODUCTS if empty)
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

    // Ensure we have at least 8-12 dresses for a rich looping showcase
    let selected: Product[] = [...combined];
    if (selected.length < 8 && sourceProducts.length > 0) {
      let idx = 0;
      while (selected.length < 8) {
        selected.push(sourceProducts[idx % sourceProducts.length]);
        idx++;
      }
    }

    return selected.slice(0, 12);
  }, [products]);

  // 2. Render 3 identical sets of dresses so track seamlessly loops indefinitely
  const repeatedSets = useMemo(() => [0, 1, 2], []);

  // Initialize scroll position to the middle set on load or resize
  useEffect(() => {
    const timer = setTimeout(() => {
      if (sliderRef.current) {
        const el = sliderRef.current;
        const singleSetWidth = el.scrollWidth / 3;
        if (singleSetWidth > 0) {
          el.scrollLeft = singleSetWidth;
        }
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [showcaseDresses]);

  // Continuous subtle auto-glide with seamless loop
  useEffect(() => {
    let animationId: number;
    let lastTime = performance.now();

    const step = (now: number) => {
      const delta = now - lastTime;
      lastTime = now;

      const isPaused = isHovered || isMouseDown || now < pauseUntilRef.current;

      if (!isPaused && sliderRef.current) {
        const el = sliderRef.current;
        const singleSetWidth = el.scrollWidth / 3;

        if (singleSetWidth > 0) {
          // Serene, luxury showcase glide (~18px per second)
          const px = (18 * delta) / 1000;
          el.scrollLeft += px;

          // Infinite boundary wrap
          if (el.scrollLeft >= 2 * singleSetWidth) {
            el.scrollLeft -= singleSetWidth;
          }
        }
      }

      animationId = requestAnimationFrame(step);
    };

    animationId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationId);
  }, [isHovered, isMouseDown, showcaseDresses]);

  // Infinite wrap-around check on scroll
  const handleScroll = useCallback(() => {
    if (!sliderRef.current) return;
    const el = sliderRef.current;
    const singleSetWidth = el.scrollWidth / 3;
    if (singleSetWidth <= 0) return;

    if (el.scrollLeft >= 2 * singleSetWidth + 100) {
      el.scrollLeft -= singleSetWidth;
    } else if (el.scrollLeft <= 50) {
      el.scrollLeft += singleSetWidth;
    }
  }, []);

  // Left & Right Arrow Navigation
  const scroll = (direction: 'left' | 'right') => {
    if (!sliderRef.current) return;
    // Pause auto-sliding for 3.5 seconds after manual button click
    pauseUntilRef.current = performance.now() + 3500;

    const el = sliderRef.current;
    const singleSetWidth = el.scrollWidth / 3;
    const cardWidth = Math.min(el.clientWidth * 0.8, 360);

    if (direction === 'left') {
      if (el.scrollLeft - cardWidth < 50) {
        el.scrollLeft += singleSetWidth;
      }
      el.scrollBy({ left: -cardWidth, behavior: 'smooth' });
    } else {
      if (el.scrollLeft + cardWidth >= 2 * singleSetWidth) {
        el.scrollLeft -= singleSetWidth;
      }
      el.scrollBy({ left: cardWidth, behavior: 'smooth' });
    }
  };

  // Mouse Drag-to-Scroll handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!sliderRef.current) return;
    setIsMouseDown(true);
    setStartX(e.pageX - sliderRef.current.offsetLeft);
    setScrollLeftStart(sliderRef.current.scrollLeft);
    setDragDistance(0);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDown || !sliderRef.current) return;
    e.preventDefault();
    const x = e.pageX - sliderRef.current.offsetLeft;
    const walk = (x - startX) * 1.3;
    sliderRef.current.scrollLeft = scrollLeftStart - walk;
    setDragDistance(Math.abs(walk));
  };

  const handleMouseUpOrLeave = () => {
    setIsMouseDown(false);
  };

  const handleProductClick = (product: Product) => {
    // If the user was dragging the slider, do not trigger navigation
    if (dragDistance > 6) return;
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

  if (showcaseDresses.length === 0) return null;

  return (
    <section className="py-12 sm:py-16 bg-white border-b border-[#EAE4DC] overflow-hidden select-none">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-bold uppercase tracking-[0.25em] text-[#9E8055]">
              <Sparkles className="w-3 h-3 text-[#D4AF37]" />
              <span>New Editorial Showcase</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-4xl font-normal text-[#1E1E24] tracking-tight mt-1">
              The Festive Collection
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-md hidden sm:block">
              Handcrafted zardozi, sequined tillawork, and luxury organza dupattas.
            </p>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => scroll('left')}
              className="p-2.5 sm:p-3 rounded-full bg-white border border-[#EAE4DC] text-[#1E1E24] hover:bg-[#1E1E24] hover:text-white transition-all shadow-sm cursor-pointer active:scale-95"
              aria-label="Previous Festive Dresses"
              title="Previous"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="p-2.5 sm:p-3 rounded-full bg-white border border-[#EAE4DC] text-[#1E1E24] hover:bg-[#1E1E24] hover:text-white transition-all shadow-sm cursor-pointer active:scale-95"
              aria-label="Next Festive Dresses"
              title="Next"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Horizontal Infinite Slider Track */}
        <div
          ref={sliderRef}
          onScroll={handleScroll}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => {
            setIsHovered(false);
            handleMouseUpOrLeave();
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          className={`flex gap-4 sm:gap-6 overflow-x-auto scrollbar-none pb-4 ${
            isMouseDown ? 'cursor-grabbing' : 'cursor-grab'
          }`}
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {repeatedSets.map((setIndex) =>
            showcaseDresses.map((product, pIdx) => {
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
                  className="flex-none w-[260px] sm:w-[310px] md:w-[340px] group cursor-pointer"
                >
                  {/* Image Container */}
                  <div 
                    onClick={() => handleProductClick(product)}
                    className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-[#FBF9F5] shadow-sm border border-[#EAE4DC] mb-3.5 transition-transform duration-300 group-hover:shadow-md"
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
                      <span className="px-2 py-0.5 bg-[#FAF8F5]/90 backdrop-blur-sm text-[#8B5E34] text-[9px] font-semibold tracking-wider uppercase rounded border border-[#EAE4DC]">
                        Festive
                      </span>
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
                    <div className="absolute inset-x-2 bottom-2 p-1.5 bg-gradient-to-t from-black/80 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-1.5 z-20 rounded-xl">
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
                    {/* 1. Name */}
                    <h3 className="font-bold text-base sm:text-lg text-[#1E1E24] tracking-tight line-clamp-1 group-hover:text-[#9E8055] transition-colors leading-snug">
                      {toTitleCase(product.name)}
                    </h3>

                    {/* 2. Collection / Season */}
                    <div className="text-xs font-semibold text-[#8B5E34]">
                      {product.collectionType || product.collection || 'Festive / Eid Special'}
                    </div>
                    
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
