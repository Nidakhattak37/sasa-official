import React from 'react';
import { useApp } from '../../context/AppContext';
import { Instagram, ShoppingBag, ExternalLink } from 'lucide-react';
import { normalizeImageUrl, handleImageError, DEFAULT_FALLBACK_IMAGE } from '../../utils/imageUrl';

export const InstagramGallery: React.FC = () => {
  const { setCurrentView, setSelectedCategorySlug, settings } = useApp();

  const instagramUrl = settings.instagramUrl || 'https://www.instagram.com/sasaofficial.pk?igsh=MXhhZmJwNzR1M3FucA==';

  const handleShopLook = () => {
    setSelectedCategorySlug(null);
    setCurrentView('shop');
  };
  const instaPosts = [
    {
      img: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=800',
      tag: 'Velvet Royale'
    },
    {
      img: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=800',
      tag: 'Summer Gardenia'
    },
    {
      img: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=80&w=800',
      tag: 'Festive Pret'
    },
    {
      img: 'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?auto=format&fit=crop&q=80&w=800',
      tag: 'Unstitched Lawn'
    },
    {
      img: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&q=80&w=800',
      tag: 'Couture Organza'
    }
  ];

  return (
    <section className="py-16 bg-white border-b border-[#EAE4DC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-xl mx-auto mb-10">
          <a
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.25em] font-semibold text-[#9E8055] hover:text-[#222] transition-colors py-1 px-3.5 rounded-full bg-[#FAF8F5] border border-[#EAE4DC] hover:border-[#9E8055] group shadow-2xs"
            id="instagram-gallery-follow-link"
          >
            <Instagram className="w-4 h-4 text-[#D4AF37] group-hover:scale-110 transition-transform" />
            <span>Follow @sasaofficial.pk</span>
            <ExternalLink className="w-3 h-3 ml-0.5 opacity-70" />
          </a>
          <h2 className="font-serif text-3xl font-normal text-[#222222] mt-3">
            Styled By You On Instagram
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Tag <span className="font-semibold text-[#222]">@sasaofficial.pk</span> in your SASA outfits to be featured
          </p>
        </div>

        {/* 5-Column Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {instaPosts.map((post, idx) => (
            <div
              key={idx}
              onClick={handleShopLook}
              className="group relative aspect-[3/4] overflow-hidden rounded-lg bg-black/5 cursor-pointer"
            >
              <img
                src={normalizeImageUrl(post.img, idx)}
                alt={post.tag}
                referrerPolicy="no-referrer"
                onError={(e) => handleImageError(e, DEFAULT_FALLBACK_IMAGE)}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-center p-4">
                <Instagram className="w-6 h-6 mb-2 text-[#D4AF37]" />
                <span className="text-xs font-serif font-semibold">{post.tag}</span>
                <span className="text-[10px] text-gray-200 mt-1 uppercase tracking-wider flex items-center gap-1 bg-white/20 backdrop-blur px-2 py-0.5 rounded-full">
                  <ShoppingBag className="w-3 h-3" /> Shop Look
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Call to Action */}
        <div className="mt-8 text-center">
          <a
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#1E1E24] hover:bg-[#9E8055] text-white text-xs font-semibold uppercase tracking-wider rounded-lg transition-all shadow-sm hover:shadow group"
            id="instagram-gallery-view-feed-btn"
          >
            <Instagram className="w-4 h-4 text-[#D4AF37] group-hover:scale-110 transition-transform" />
            <span>Visit @sasaofficial.pk on Instagram</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-80" />
          </a>
        </div>

      </div>
    </section>
  );
};
