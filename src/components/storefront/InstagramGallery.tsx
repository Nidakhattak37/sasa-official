import React from 'react';
import { Instagram, ShoppingBag } from 'lucide-react';

export const InstagramGallery: React.FC = () => {
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
    <section className="py-16 bg-[#FAFAFA] border-b border-[#EAE4DC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-xs uppercase tracking-[0.25em] font-semibold text-[#9E8055] flex items-center justify-center gap-1.5">
            <Instagram className="w-4 h-4" /> Follow @sasa.official
          </span>
          <h2 className="font-serif text-3xl font-normal text-[#222222] mt-1">
            Styled By You On Instagram
          </h2>
        </div>

        {/* 5-Column Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {instaPosts.map((post, idx) => (
            <div
              key={idx}
              className="group relative aspect-[3/4] overflow-hidden rounded-lg bg-black/5 cursor-pointer"
            >
              <img
                src={post.img}
                alt={post.tag}
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

      </div>
    </section>
  );
};
