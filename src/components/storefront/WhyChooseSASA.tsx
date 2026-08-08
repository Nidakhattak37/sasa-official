import React from 'react';
import { Award, Truck, Banknote, RefreshCw } from 'lucide-react';

export const WhyChooseSASA: React.FC = () => {
  const features = [
    {
      icon: <Award className="w-7 h-7 text-[#9E8055] stroke-[1.5]" />,
      title: 'Premium Fabrics',
      description: 'Handpicked Pima Swiss Lawn, Micro-Velvet & pure raw silks.'
    },
    {
      icon: <Truck className="w-7 h-7 text-[#9E8055] stroke-[1.5]" />,
      title: 'Fast Nationwide Express',
      description: 'Dispatched via top express couriers with live tracking.'
    },
    {
      icon: <Banknote className="w-7 h-7 text-[#9E8055] stroke-[1.5]" />,
      title: 'Cash on Delivery',
      description: 'Pay conveniently at your doorstep across Pakistan.'
    },
    {
      icon: <RefreshCw className="w-7 h-7 text-[#9E8055] stroke-[1.5]" />,
      title: '14-Day Easy Exchange',
      description: 'Hassle-free returns and size exchanges nationwide.'
    }
  ];

  return (
    <section className="py-14 bg-white border-b border-[#EAE4DC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center space-x-4 p-4 bg-white rounded-xl border border-[#EAE4DC] hover:shadow-md transition duration-300"
            >
              <div className="p-3 bg-white rounded-full flex-shrink-0 border border-[#EAE4DC] shadow-sm">
                {item.icon}
              </div>
              <div>
                <h3 className="font-serif text-base font-semibold text-[#222222]">
                  {item.title}
                </h3>
                <p className="text-xs text-[#666666] mt-0.5 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
