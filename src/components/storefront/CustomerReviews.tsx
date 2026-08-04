import React from 'react';
import { useApp } from '../../context/AppContext';
import { Star, Quote, CheckCircle2 } from 'lucide-react';

export const CustomerReviews: React.FC = () => {
  const { reviews } = useApp();
  const approvedReviews = reviews.filter(r => r.status === 'Approved');

  return (
    <section className="py-16 bg-white border-b border-[#EAE4DC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Title */}
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="text-xs uppercase tracking-[0.25em] font-semibold text-[#9E8055]">
            Verified Feedback
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-normal text-[#222222] mt-1">
            What Our Patrons Say
          </h2>
          <div className="w-12 h-0.5 bg-[#9E8055] mx-auto mt-4" />
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {approvedReviews.slice(0, 3).map((rev) => (
            <div
              key={rev.id}
              className="p-6 bg-[#FAFAFA] border border-[#EAE4DC] rounded-xl flex flex-col justify-between hover:shadow-lg transition duration-300"
            >
              <div className="space-y-3">
                
                {/* Rating Stars & Quote Icon */}
                <div className="flex justify-between items-center">
                  <div className="flex text-[#D4AF37]">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < rev.rating ? 'fill-current' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                  <Quote className="w-6 h-6 text-[#9E8055]/30 stroke-1" />
                </div>

                {/* Comment */}
                <p className="text-xs text-[#444444] italic leading-relaxed">
                  "{rev.comment}"
                </p>
              </div>

              {/* Author & Product */}
              <div className="mt-6 pt-4 border-t border-[#EAE4DC] flex items-center justify-between text-xs">
                <div>
                  <h4 className="font-semibold text-[#222222] flex items-center gap-1">
                    {rev.customerName}
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-600 inline" title="Verified Buyer" />
                  </h4>
                  <p className="text-[10px] text-[#888888]">{rev.date}</p>
                </div>
                <span className="text-[10px] bg-white border border-[#EAE4DC] text-[#777] px-2 py-0.5 rounded line-clamp-1 max-w-[120px]">
                  {rev.productName}
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
