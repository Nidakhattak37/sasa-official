import React, { useRef, useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Star, Quote, CheckCircle2, ShieldCheck, ChevronLeft, ChevronRight, MessageSquarePlus, Sparkles } from 'lucide-react';

export const CustomerReviews: React.FC = () => {
  const { reviews, setCurrentView } = useApp();
  const approvedReviews = reviews.filter(r => r.status === 'Approved');
  const sliderRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const displayReviews = approvedReviews.length > 0 ? approvedReviews : [
    {
      id: 'rev-def-1',
      productId: 'prod-1',
      productName: 'Mah-e-Noor Velvet Kurta Set',
      customerName: 'Sadaf R.',
      rating: 5,
      comment: 'The velvet fabric is so plush and high quality! Stitching fits like a dream. SASA never disappoints with packing either.',
      date: '2026-07-28',
      status: 'Approved'
    },
    {
      id: 'rev-def-2',
      productId: 'prod-2',
      productName: 'Zaria Chiffon Floral 3-Piece',
      customerName: 'Hira Tariq',
      rating: 5,
      comment: 'Wore this to a mehendi function in Islamabad and received so many compliments! True to picture and color vibrancy.',
      date: '2026-07-29',
      status: 'Approved'
    },
    {
      id: 'rev-def-3',
      productId: 'prod-4',
      productName: 'Gulzar Silk Organza Jacket',
      customerName: 'Mariam Ali',
      rating: 5,
      comment: 'Breathtaking embroidery and finish. Worth every single penny. The tilla work has a subtle royal sheen.',
      date: '2026-07-31',
      status: 'Approved'
    }
  ];

  // Update active index on scroll (for mobile indicator dots)
  const handleScroll = () => {
    if (!sliderRef.current) return;
    const { scrollLeft, clientWidth } = sliderRef.current;
    if (clientWidth > 0) {
      const idx = Math.round(scrollLeft / (clientWidth * 0.85));
      setActiveIndex(Math.min(Math.max(0, idx), displayReviews.length - 1));
    }
  };

  const scrollToIndex = (index: number) => {
    if (!sliderRef.current) return;
    const cardWidth = sliderRef.current.clientWidth * 0.85;
    sliderRef.current.scrollTo({
      left: index * (cardWidth + 16),
      behavior: 'smooth'
    });
    setActiveIndex(index);
  };

  const scroll = (direction: 'left' | 'right') => {
    if (!sliderRef.current) return;
    const nextIdx = direction === 'left' ? Math.max(0, activeIndex - 1) : Math.min(displayReviews.length - 1, activeIndex + 1);
    scrollToIndex(nextIdx);
  };

  return (
    <section className="py-14 sm:py-16 bg-white border-b border-[#EAE4DC] overflow-hidden select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Title & Header with Controls */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-12 gap-4">
          <div className="text-left">
            <span className="text-xs uppercase tracking-[0.25em] font-bold text-[#9E8055] flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 inline" />
              Verified Feedback
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl font-normal text-[#222222] mt-1.5">
              What Our Patrons Say
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-lg">
              Authentic reviews from verified buyers across Pakistan & worldwide.
            </p>
          </div>

          {/* Desktop & Mobile Navigation Buttons + Write Review CTA */}
          <div className="flex items-center gap-3 self-end sm:self-auto">
            <button
              onClick={() => setCurrentView('write-review')}
              className="px-3.5 py-2 bg-[#FAF8F5] border border-[#EAE4DC] text-[#1E1E24] hover:bg-[#1E1E24] hover:text-white rounded-lg text-xs font-semibold tracking-wider uppercase transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <MessageSquarePlus className="w-3.5 h-3.5 text-[#9E8055]" />
              <span className="hidden sm:inline">Write a Review</span>
              <span className="sm:hidden">Review</span>
            </button>

            {/* Arrow Controls */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => scroll('left')}
                disabled={activeIndex === 0}
                className={`p-2 rounded-full border border-[#EAE4DC] transition shadow-2xs cursor-pointer ${
                  activeIndex === 0 ? 'opacity-40 cursor-not-allowed bg-gray-50 text-gray-400' : 'bg-white text-[#1E1E24] hover:bg-[#1E1E24] hover:text-white'
                }`}
                aria-label="Previous review"
                title="Previous Review"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => scroll('right')}
                disabled={activeIndex === displayReviews.length - 1}
                className={`p-2 rounded-full border border-[#EAE4DC] transition shadow-2xs cursor-pointer ${
                  activeIndex === displayReviews.length - 1 ? 'opacity-40 cursor-not-allowed bg-gray-50 text-gray-400' : 'bg-white text-[#1E1E24] hover:bg-[#1E1E24] hover:text-white'
                }`}
                aria-label="Next review"
                title="Next Review"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* MOBILE SLIDER VIEW (< md) & DESKTOP GRID / SLIDER (md+) */}
        {/* On Mobile: Horizontal Touch Snap Slider */}
        <div className="md:hidden">
          <div
            ref={sliderRef}
            onScroll={handleScroll}
            className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-none pb-4 px-1"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {displayReviews.map((rev, idx) => (
              <div
                key={rev.id || idx}
                className="w-[85vw] max-w-[340px] flex-none snap-center p-5 bg-[#FAF8F5] border border-[#EAE4DC] rounded-2xl flex flex-col justify-between shadow-xs hover:shadow-md transition duration-300"
              >
                <div className="space-y-3">
                  
                  {/* Rating Stars, Verified Badge & Quote Icon */}
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1">
                      <div className="flex text-[#D4AF37]">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${i < rev.rating ? 'fill-current' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                      <span className="text-[10px] font-bold text-[#8B5E34] ml-1 bg-amber-50 border border-amber-200/60 px-1.5 py-0.5 rounded">
                        5.0
                      </span>
                    </div>
                    <Quote className="w-5 h-5 text-[#9E8055]/30 stroke-1" />
                  </div>

                  {/* Comment Text */}
                  <p className="text-xs text-[#333333] italic leading-relaxed min-h-[58px]">
                    "{rev.comment}"
                  </p>

                  {/* Admin Reply if present */}
                  {rev.adminReply && (
                    <div className="p-2.5 bg-white border border-[#EAE4DC] rounded-lg text-[10px] text-gray-600 mt-2 space-y-0.5">
                      <span className="font-bold text-[#9E8055] block flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-[#9E8055]" /> SASA Official Response:
                      </span>
                      <p className="italic text-gray-500">"{rev.adminReply}"</p>
                    </div>
                  )}
                </div>

                {/* Author & Verified Buyer Tag */}
                <div className="mt-4 pt-3 border-t border-[#EAE4DC] flex items-center justify-between text-xs">
                  <div>
                    <h4 className="font-bold text-[#222222] flex items-center gap-1 text-xs">
                      {rev.customerName}
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 inline flex-shrink-0" title="Verified Buyer" />
                    </h4>
                    <p className="text-[10px] text-[#888888]">{rev.date || 'Recent Purchase'}</p>
                  </div>
                  {rev.productName && (
                    <span className="text-[10px] bg-white border border-[#EAE4DC] text-[#777] px-2 py-0.5 rounded-md line-clamp-1 max-w-[130px] font-medium shadow-2xs">
                      {rev.productName}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Mobile Pagination Dots Indicator */}
          <div className="flex justify-center items-center gap-1.5 mt-4">
            {displayReviews.map((_, dotIdx) => (
              <button
                key={dotIdx}
                onClick={() => scrollToIndex(dotIdx)}
                className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                  activeIndex === dotIdx
                    ? 'w-6 bg-[#9E8055]'
                    : 'w-1.5 bg-[#EAE4DC] hover:bg-gray-400'
                }`}
                aria-label={`Go to slide ${dotIdx + 1}`}
              />
            ))}
          </div>
        </div>

        {/* DESKTOP VIEW (md+): Multi-Card Grid / Carousel Layout */}
        <div className="hidden md:grid md:grid-cols-3 gap-6">
          {displayReviews.slice(0, 6).map((rev, idx) => (
            <div
              key={rev.id || idx}
              className="p-6 bg-white border border-[#EAE4DC] rounded-2xl flex flex-col justify-between hover:shadow-md transition duration-300 group hover:border-[#9E8055]/50"
            >
              <div className="space-y-3">
                
                {/* Rating Stars & Quote Icon */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1">
                    <div className="flex text-[#D4AF37]">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${i < rev.rating ? 'fill-current' : 'text-gray-300'}`}
                        />
                      ))}
                    </div>
                    <span className="text-[10px] font-bold text-[#8B5E34] ml-1 bg-amber-50 border border-amber-200/60 px-1.5 py-0.5 rounded">
                      5.0
                    </span>
                  </div>
                  <Quote className="w-6 h-6 text-[#9E8055]/30 stroke-1 group-hover:text-[#9E8055] transition-colors" />
                </div>

                {/* Comment */}
                <p className="text-xs sm:text-sm text-[#444444] italic leading-relaxed min-h-[64px]">
                  "{rev.comment}"
                </p>

                {/* Admin Reply */}
                {rev.adminReply && (
                  <div className="p-2.5 bg-[#FAF8F5] border border-[#EAE4DC] rounded-lg text-[11px] text-gray-600 mt-2 space-y-0.5">
                    <span className="font-bold text-[#9E8055] block flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-[#9E8055]" /> SASA Official Response:
                    </span>
                    <p className="italic text-gray-500">"{rev.adminReply}"</p>
                  </div>
                )}
              </div>

              {/* Author & Product */}
              <div className="mt-6 pt-4 border-t border-[#EAE4DC] flex items-center justify-between text-xs">
                <div>
                  <h4 className="font-bold text-[#222222] flex items-center gap-1">
                    {rev.customerName}
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 inline" title="Verified Buyer" />
                  </h4>
                  <p className="text-[10px] text-[#888888]">{rev.date || 'Recent Purchase'}</p>
                </div>
                {rev.productName && (
                  <span className="text-[10px] bg-white border border-[#EAE4DC] text-[#777] px-2 py-0.5 rounded line-clamp-1 max-w-[140px] font-medium shadow-2xs">
                    {rev.productName}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

