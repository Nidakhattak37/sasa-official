import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { INITIAL_BANNERS } from '../../data/mockData';

export const HeroBanner: React.FC = () => {
  const { banners, setCurrentView, setSelectedCategorySlug } = useApp();

  // Use admin banners if available, otherwise fall back to INITIAL_BANNERS
  const activeBanners = banners.length > 0
    ? banners.filter(b => b.isActive !== false)
    : INITIAL_BANNERS;

  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-slide every 6 seconds
  useEffect(() => {
    if (activeBanners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [activeBanners.length]);

  if (activeBanners.length === 0) return null;

  const current = activeBanners[currentIndex % activeBanners.length];

  const handleCtaClick = () => {
    if (current.ctaLink && current.ctaLink.includes('category=')) {
      const categorySlug = current.ctaLink.split('category=')[1];
      setSelectedCategorySlug(categorySlug);
      setCurrentView('shop');
    } else {
      setSelectedCategorySlug(null);
      setCurrentView('shop');
    }
  };

  return (
    <section className="relative w-full h-[75vh] min-h-[540px] max-h-[780px] bg-[#111111] overflow-hidden group">
      <AnimatePresence mode="wait">
        <motion.div
          key={current.id || currentIndex}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.1, ease: [0.25, 1, 0.5, 1] }}
          className="absolute inset-0"
        >
          {/* Background Image */}
          <img
            src={current.imageUrl}
            alt={current.title}
            className="w-full h-full object-cover object-top opacity-85"
          />

          {/* Luxury Soft Dark Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/20" />

          {/* Content Overlay */}
          <div className="absolute inset-0 flex items-center justify-center text-center px-6">
            <div className="max-w-3xl mx-auto space-y-6">
              
              {current.subtitle && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.7 }}
                >
                  <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] font-semibold text-[#D4AF37] bg-black/50 backdrop-blur-md px-4 py-1.5 rounded-full border border-[#D4AF37]/40 shadow-lg">
                    <Sparkles className="w-3.5 h-3.5" />
                    {current.subtitle}
                  </span>
                </motion.div>
              )}

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="font-serif text-4xl sm:text-6xl md:text-7xl font-normal text-white tracking-wide leading-tight drop-shadow-md"
              >
                {current.title}
              </motion.h1>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.8 }}
                className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
              >
                <button
                  onClick={handleCtaClick}
                  className="w-full sm:w-auto px-8 py-3.5 bg-[#FFFFFF] text-[#222222] font-semibold text-xs tracking-[0.2em] uppercase rounded-xl hover:bg-[#9E8055] hover:text-white transition-all flex items-center justify-center gap-2 group/btn shadow-xl"
                >
                  <span>{current.ctaText || 'Explore Collection'}</span>
                  <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={() => {
                    setSelectedCategorySlug('luxury-pret');
                    setCurrentView('shop');
                  }}
                  className="w-full sm:w-auto px-8 py-3.5 bg-transparent border border-white/80 text-white font-semibold text-xs tracking-[0.2em] uppercase rounded-xl hover:bg-white/10 transition backdrop-blur-sm"
                >
                  Luxury Pret
                </button>
              </motion.div>

            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Slide Navigation Buttons */}
      {activeBanners.length > 1 && (
        <>
          <button
            onClick={() => setCurrentIndex((prev) => (prev - 1 + activeBanners.length) % activeBanners.length)}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 text-white/80 hover:text-white bg-black/40 hover:bg-black/70 rounded-full backdrop-blur-md transition shadow-lg opacity-80 group-hover:opacity-100"
            aria-label="Previous Slide"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={() => setCurrentIndex((prev) => (prev + 1) % activeBanners.length)}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 text-white/80 hover:text-white bg-black/40 hover:bg-black/70 rounded-full backdrop-blur-md transition shadow-lg opacity-80 group-hover:opacity-100"
            aria-label="Next Slide"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Slide Indicator Dots */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center space-x-2 z-20">
            {activeBanners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  currentIndex % activeBanners.length === idx
                    ? 'w-8 bg-[#D4AF37]'
                    : 'w-2 bg-white/50 hover:bg-white/80'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
};

