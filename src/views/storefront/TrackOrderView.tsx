import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { AnnouncementBar } from '../../components/storefront/AnnouncementBar';
import { Header } from '../../components/storefront/Header';
import { Footer } from '../../components/storefront/Footer';
import { formatPrice } from '../../utils/currency';
import { OrderStatus } from '../../types';
import { Search, Truck, CheckCircle2, Clock, PackageCheck, MapPin, AlertCircle } from 'lucide-react';

export const TrackOrderView: React.FC = () => {
  const { orders, trackSearch, setTrackSearch, currency, setCurrentView } = useApp();

  const [orderIdInput, setOrderIdInput] = useState(trackSearch.orderId || 'SASA-9842');
  const [contactInput, setContactInput] = useState(trackSearch.contact || 'ayesha.khan@gmail.com');
  const [searchedOrder, setSearchedOrder] = useState<any | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (trackSearch.orderId) {
      const found = orders.find(o => o.id.toLowerCase() === trackSearch.orderId.toLowerCase());
      if (found) {
        setSearchedOrder(found);
        setHasSearched(true);
      }
    }
  }, [trackSearch.orderId, orders]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setHasSearched(true);
    const found = orders.find(o =>
      o.id.toLowerCase() === orderIdInput.trim().toLowerCase() &&
      (o.email.toLowerCase().includes(contactInput.trim().toLowerCase()) || o.phone.includes(contactInput.trim()))
    );

    if (!found) {
      // Fallback search by ID only if contact matches partial
      const foundById = orders.find(o => o.id.toLowerCase() === orderIdInput.trim().toLowerCase());
      setSearchedOrder(foundById || null);
    } else {
      setSearchedOrder(found);
    }
  };

  const steps: OrderStatus[] = ['Confirmed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered'];

  const getStepIndex = (status: OrderStatus) => {
    return steps.indexOf(status);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <AnnouncementBar />
      <Header />

      <main className="flex-1 py-12">
        <div className="max-w-4xl mx-auto px-4">
          
          {/* Header */}
          <div className="text-center max-w-xl mx-auto mb-10 space-y-2">
            <span className="text-xs uppercase tracking-[0.25em] font-semibold text-[#9E8055]">
              Real-Time Tracking Portal
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-normal text-[#222222]">
              Track Your Order
            </h1>
            <p className="text-xs text-[#666]">
              Enter your SASA Order ID (e.g. SASA-9842) along with your Phone Number or Email address to view live dispatch milestones.
            </p>
          </div>

          {/* Search Form Card */}
          <div className="bg-white border border-[#EAE4DC] rounded-xl p-6 shadow-sm mb-10">
            <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-12 gap-4">
              <div className="sm:col-span-5">
                <label className="block text-xs font-semibold text-[#222] mb-1">Order Number *</label>
                <input
                  type="text"
                  required
                  value={orderIdInput}
                  onChange={(e) => setOrderIdInput(e.target.value)}
                  placeholder="e.g. SASA-9842"
                  className="w-full px-3 py-2 text-xs border border-[#EAE4DC] rounded focus:outline-none focus:border-[#9E8055]"
                />
              </div>

              <div className="sm:col-span-5">
                <label className="block text-xs font-semibold text-[#222]">Email or Phone Number *</label>
                <input
                  type="text"
                  required
                  value={contactInput}
                  onChange={(e) => setContactInput(e.target.value)}
                  placeholder="e.g. ayesha.khan@gmail.com or 0301..."
                  className="w-full px-3 py-2 text-xs border border-[#EAE4DC] rounded focus:outline-none focus:border-[#9E8055]"
                />
              </div>

              <div className="sm:col-span-2 flex items-end">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#222222] text-white text-xs font-semibold uppercase tracking-wider rounded hover:bg-[#9E8055] transition flex items-center justify-center gap-1.5"
                >
                  <Search className="w-4 h-4" />
                  <span>Track</span>
                </button>
              </div>
            </form>
          </div>

          {/* Search Results Display */}
          {hasSearched && (
            searchedOrder ? (
              <div className="bg-white border border-[#EAE4DC] rounded-xl p-6 sm:p-8 shadow-md space-y-8 animate-in fade-in">
                
                {/* Meta Header */}
                <div className="flex flex-col sm:flex-row justify-between sm:items-center pb-6 border-b border-[#EAE4DC] gap-4 text-xs">
                  <div>
                    <span className="text-[10px] text-gray-500 uppercase font-semibold">Active Order</span>
                    <h3 className="font-serif text-2xl font-bold text-[#222]">{searchedOrder.id}</h3>
                    <p className="text-[#666]">Placed on {searchedOrder.createdAt} • Courier: TCS Express Air</p>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-gray-500 uppercase font-semibold">Tracking Number</span>
                    <p className="font-bold text-[#9E8055] text-sm">{searchedOrder.trackingCode}</p>
                    <p className="text-xs text-green-700 font-semibold mt-0.5">
                      Est. Delivery: {searchedOrder.estimatedDeliveryDate}
                    </p>
                  </div>
                </div>

                {/* Progress Timeline Bar */}
                <div className="py-4">
                  <h4 className="text-xs font-semibold uppercase tracking-widest text-[#222] mb-6">
                    Live Dispatch Progress
                  </h4>

                  <div className="relative flex justify-between items-center">
                    {/* Background Bar */}
                    <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -translate-y-1/2 z-0" />
                    
                    {/* Active Progress Line */}
                    <div
                      className="absolute top-1/2 left-0 h-1 bg-[#9E8055] -translate-y-1/2 z-0 transition-all duration-700"
                      style={{
                        width: `${(getStepIndex(searchedOrder.orderStatus) / (steps.length - 1)) * 100}%`
                      }}
                    />

                    {steps.map((step, idx) => {
                      const isCompleted = getStepIndex(searchedOrder.orderStatus) >= idx;
                      const isCurrent = searchedOrder.orderStatus === step;

                      return (
                        <div key={step} className="relative z-10 flex flex-col items-center">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                            isCompleted
                              ? 'bg-[#9E8055] text-white ring-4 ring-[#9E8055]/20 shadow'
                              : 'bg-white border-2 border-gray-300 text-gray-400'
                          }`}>
                            {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                          </div>

                          <span className={`text-[11px] mt-2 font-semibold text-center ${
                            isCurrent ? 'text-[#9E8055]' : isCompleted ? 'text-[#222]' : 'text-gray-400'
                          }`}>
                            {step}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Detailed Timeline Events */}
                <div className="pt-6 border-t border-[#EAE4DC] space-y-3">
                  <h4 className="font-serif text-sm font-bold text-[#222]">Milestone Updates:</h4>
                  <div className="space-y-2">
                    {searchedOrder.timeline.map((event: any, idx: number) => (
                      <div key={idx} className="flex items-start space-x-3 text-xs p-3 bg-[#FAFAFA] rounded border border-[#EAE4DC]">
                        <Clock className={`w-4 h-4 mt-0.5 ${event.completed ? 'text-[#9E8055]' : 'text-gray-300'}`} />
                        <div className="flex-1">
                          <div className="flex justify-between font-semibold">
                            <span className="text-[#222]">{event.status}</span>
                            <span className="text-[10px] text-gray-400">{event.timestamp || 'Pending'}</span>
                          </div>
                          <p className="text-gray-600 mt-0.5">{event.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Items in Package */}
                <div className="pt-6 border-t border-[#EAE4DC] text-xs">
                  <h4 className="font-serif text-sm font-bold text-[#222] mb-3">Contents in Shipment:</h4>
                  <div className="divide-y divide-[#F2F2F2]">
                    {searchedOrder.items.map((item: any, idx: number) => (
                      <div key={idx} className="py-2 flex justify-between items-center">
                        <div className="flex items-center space-x-3">
                          <img src={item.image} alt={item.productName} className="w-10 h-12 object-cover rounded bg-[#F5F1EC]" />
                          <div>
                            <strong className="text-[#222]">{item.productName}</strong>
                            <p className="text-[10px] text-gray-500">Size: {item.selectedSize} • Qty: {item.quantity}</p>
                          </div>
                        </div>
                        <span className="font-bold">{formatPrice(item.price * item.quantity, currency)}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            ) : (
              <div className="bg-white border border-[#EAE4DC] rounded-xl p-12 text-center space-y-3 text-xs">
                <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
                <h3 className="font-serif text-lg font-bold text-[#222]">No Matching Order Found</h3>
                <p className="text-gray-600">Please double check your Order ID (e.g. SASA-9842) and Phone/Email. Or contact our WhatsApp helpline (+92 42 111 727 200).</p>
              </div>
            )
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
};
