import React from 'react';
import { useApp } from '../../context/AppContext';
import { AnnouncementBar } from '../../components/storefront/AnnouncementBar';
import { Header } from '../../components/storefront/Header';
import { Footer } from '../../components/storefront/Footer';
import { formatPrice } from '../../utils/currency';
import { CheckCircle2, Truck, Package, ArrowRight, Printer } from 'lucide-react';

export const OrderConfirmationView: React.FC = () => {
  const { orders, trackSearch, setCurrentView, setTrackSearch, currency } = useApp();

  const lastOrder = orders.find(o => o.id === trackSearch.orderId) || orders[0];

  if (!lastOrder) return null;

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <AnnouncementBar />
      <Header />

      <main className="flex-1 py-12">
        <div className="max-w-3xl mx-auto px-4">
          
          {/* Success Banner Card */}
          <div className="bg-white border border-[#EAE4DC] rounded-xl p-8 text-center space-y-4 shadow-md">
            
            <div className="w-16 h-16 bg-green-100 text-green-700 rounded-full flex items-center justify-center mx-auto border-2 border-green-300">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <span className="text-xs uppercase tracking-[0.25em] font-semibold text-[#9E8055]">
              Order Placed Successfully
            </span>

            <h1 className="font-serif text-3xl font-bold text-[#222222]">
              Thank You for Shopping with SASA Official!
            </h1>

            <p className="text-xs text-[#666666] max-w-lg mx-auto leading-relaxed">
              We have received your order <strong>#{lastOrder.id}</strong>. A confirmation email and SMS dispatch link have been sent to <strong>{lastOrder.email}</strong>.
            </p>

            {/* Quick Spec Card */}
            <div className="p-4 bg-white rounded-lg border border-[#EAE4DC] grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-left my-6 shadow-sm">
              <div>
                <span className="block text-[10px] text-gray-500 uppercase font-semibold">Order ID</span>
                <strong className="text-[#222]">{lastOrder.id}</strong>
              </div>

              <div>
                <span className="block text-[10px] text-gray-500 uppercase font-semibold">Tracking Code</span>
                <strong className="text-[#9E8055]">{lastOrder.trackingCode}</strong>
              </div>

              <div>
                <span className="block text-[10px] text-gray-500 uppercase font-semibold">Payment Method</span>
                <strong className="text-[#222]">{lastOrder.paymentMethod} ({lastOrder.paymentStatus})</strong>
              </div>

              <div>
                <span className="block text-[10px] text-gray-500 uppercase font-semibold">Est. Delivery</span>
                <strong className="text-green-700">{lastOrder.estimatedDeliveryDate}</strong>
              </div>
            </div>

            {/* Purchased Items List */}
            <div className="text-left border-t border-[#EAE4DC] pt-4 space-y-3">
              <h4 className="font-serif text-sm font-bold text-[#222]">Items Ordered:</h4>
              <div className="divide-y divide-[#F2F2F2]">
                {lastOrder.items.map((item, idx) => (
                  <div key={idx} className="py-2 flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-3">
                      <img src={item.image} alt={item.productName} className="w-10 h-12 object-cover rounded bg-[#F5F1EC]" />
                      <div>
                        <strong className="text-[#222]">{item.productName}</strong>
                        <p className="text-[10px] text-[#777]">Size: {item.selectedSize} • Color: {item.selectedColor} • Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <span className="font-bold text-[#222]">{formatPrice(item.price * item.quantity, currency)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Summary */}
            <div className="text-left pt-4 border-t border-[#EAE4DC] text-xs text-[#555]">
              <strong className="block text-[#222] mb-1">Delivering To:</strong>
              <p>{lastOrder.shippingAddress.fullName}</p>
              <p>{lastOrder.shippingAddress.street}, {lastOrder.shippingAddress.city}, {lastOrder.shippingAddress.postalCode}</p>
              <p>Phone: {lastOrder.shippingAddress.phone}</p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6 border-t border-[#EAE4DC]">
              <button
                onClick={() => {
                  setTrackSearch({ orderId: lastOrder.id, contact: lastOrder.phone });
                  setCurrentView('track');
                }}
                className="w-full sm:w-auto px-8 py-3 bg-[#222222] text-white font-semibold text-xs tracking-wider uppercase rounded hover:bg-[#9E8055] transition flex items-center justify-center gap-2"
              >
                <Truck className="w-4 h-4" />
                <span>Track Live Delivery Progress</span>
              </button>

              <button
                onClick={() => setCurrentView('home')}
                className="w-full sm:w-auto px-8 py-3 bg-white border border-[#EAE4DC] text-[#222] font-semibold text-xs tracking-wider uppercase rounded hover:bg-[#F5F1EC] transition"
              >
                Back to Homepage
              </button>
            </div>

          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};
