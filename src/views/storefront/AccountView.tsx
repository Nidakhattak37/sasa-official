import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AnnouncementBar } from '../../components/storefront/AnnouncementBar';
import { Header } from '../../components/storefront/Header';
import { Footer } from '../../components/storefront/Footer';
import { ProductCard } from '../../components/storefront/ProductCard';
import { formatPrice } from '../../utils/currency';
import { normalizeImageUrl, handleImageError, DEFAULT_FALLBACK_IMAGE } from '../../utils/imageUrl';
import { User, Package, Heart, MapPin, RefreshCw, LogOut, CheckCircle2, ChevronRight, Shield } from 'lucide-react';

export const AccountView: React.FC = () => {
  const {
    currentUser, orders, wishlist, products,
    currency, setCurrentView, setTrackSearch,
    isCustomerAuthenticated, setIsCustomerAuthModalOpen, logoutCustomer
  } = useApp();

  const [activeTab, setActiveTab] = useState<'orders' | 'wishlist' | 'addresses' | 'exchange'>('orders');
  const [exchangeReason, setExchangeReason] = useState('Size exchange needed');
  const [exchangeSuccess, setExchangeSuccess] = useState(false);

  if (!isCustomerAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <AnnouncementBar />
        <Header />

        <main className="flex-1 flex flex-col items-center justify-center p-6 text-center py-20">
          <div className="w-16 h-16 bg-white border border-[#EAE4DC] shadow-sm text-[#9E8055] rounded-full flex items-center justify-center mb-4">
            <User className="w-8 h-8" />
          </div>
          <h1 className="font-serif text-3xl font-bold text-[#222] mb-2">Sign In to SASA Privé</h1>
          <p className="text-xs text-gray-500 max-w-md mb-6">
            Access your order history, save addresses, track live courier deliveries, and manage returns effortlessly.
          </p>
          <button
            onClick={() => setIsCustomerAuthModalOpen(true)}
            className="px-8 py-3.5 bg-[#222222] text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-[#9E8055] transition shadow-lg"
          >
            Sign In / Register Account
          </button>
        </main>

        <Footer />
      </div>
    );
  }

  const customerOrders = orders.filter(o => currentUser && (o.email === currentUser.email || o.phone === currentUser.phone));
  const wishlistProducts = products.filter(p => wishlist.includes(p.id));

  const handleExchangeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setExchangeSuccess(true);
    setTimeout(() => setExchangeSuccess(false), 4000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <AnnouncementBar />
      <Header />

      <main className="flex-1 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Top User Greeting Banner */}
          <div className="bg-[#F5F1EC] border border-[#EAE4DC] rounded-xl p-6 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-[#222222] text-[#D4AF37] font-serif font-bold text-xl rounded-full flex items-center justify-center border-2 border-[#D4AF37]">
                {currentUser?.name.charAt(0) || 'S'}
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-widest font-semibold text-[#9E8055]">SASA Privé Member</span>
                <h1 className="font-serif text-2xl font-bold text-[#222]">{currentUser?.name || 'Ayesha Khan'}</h1>
                <p className="text-xs text-gray-500">{currentUser?.email || 'ayesha.khan@gmail.com'} • {currentUser?.phone}</p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setCurrentView('track')}
                className="px-4 py-2 bg-white text-[#222] text-xs font-semibold rounded-lg border border-[#EAE4DC] hover:bg-[#222] hover:text-white transition"
              >
                Track Live Shipment
              </button>

              <button
                onClick={logoutCustomer}
                className="px-4 py-2 bg-red-50 text-red-700 text-xs font-semibold rounded-lg border border-red-200 hover:bg-red-100 transition flex items-center gap-1"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>

          {/* Account Layout: Sidebar Tabs + Active View */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Sidebar Tabs (3 Cols) */}
            <aside className="lg:col-span-3 space-y-2">
              {[
                { id: 'orders', label: 'My Orders & History', icon: <Package className="w-4 h-4" /> },
                { id: 'wishlist', label: `Saved Wishlist (${wishlist.length})`, icon: <Heart className="w-4 h-4" /> },
                { id: 'addresses', label: 'Saved Addresses', icon: <MapPin className="w-4 h-4" /> },
                { id: 'exchange', label: '14-Day Suit Exchange', icon: <RefreshCw className="w-4 h-4" /> }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full text-left px-4 py-3 rounded-xl text-xs font-semibold transition flex items-center justify-between ${
                    activeTab === tab.id
                      ? 'bg-[#222222] text-white shadow'
                      : 'bg-white text-[#444] border border-[#EAE4DC] hover:bg-[#F5F1EC]'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    {tab.icon}
                    {tab.label}
                  </span>
                  <ChevronRight className="w-4 h-4 opacity-50" />
                </button>
              ))}
            </aside>

            {/* Content Area (9 Cols) */}
            <div className="lg:col-span-9">
              
              {/* Orders Tab */}
              {activeTab === 'orders' && (
                <div className="bg-white border border-[#EAE4DC] rounded-xl p-6 shadow-sm space-y-6">
                  <h3 className="font-serif text-xl font-bold text-[#222] border-b border-[#EAE4DC] pb-3">
                    Order History ({customerOrders.length})
                  </h3>

                  {customerOrders.length === 0 ? (
                    <p className="text-xs text-gray-500 py-6">No order records found.</p>
                  ) : (
                    <div className="space-y-4">
                      {customerOrders.map(ord => (
                        <div key={ord.id} className="p-4 bg-[#FAFAFA] border border-[#EAE4DC] rounded-lg space-y-3">
                          <div className="flex flex-col sm:flex-row justify-between sm:items-center text-xs pb-3 border-b border-[#EAE4DC] gap-2">
                            <div>
                              <strong className="text-sm font-bold text-[#222]">Order #{ord.id}</strong>
                              <span className="block text-[10px] text-gray-400">Placed on {ord.createdAt}</span>
                            </div>

                            <div className="flex items-center gap-3">
                              <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                ord.orderStatus === 'Delivered' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                              }`}>
                                {ord.orderStatus}
                              </span>

                              <span className="font-bold text-[#222] text-sm">{formatPrice(ord.total, currency)}</span>
                            </div>
                          </div>

                          {/* Items preview */}
                          <div className="space-y-2">
                            {ord.items.map((item, idx) => (
                              <div key={idx} className="flex justify-between items-center text-xs">
                                <div className="flex items-center space-x-3">
                                  <img
                                    src={normalizeImageUrl(item.image)}
                                    alt=""
                                    referrerPolicy="no-referrer"
                                    onError={(e) => handleImageError(e, DEFAULT_FALLBACK_IMAGE)}
                                    className="w-10 h-12 object-cover rounded bg-[#F5F1EC]"
                                  />
                                  <div>
                                    <span className="font-semibold text-[#222]">{item.productName}</span>
                                    <p className="text-[10px] text-gray-500">Size: {item.selectedSize} • Qty: {item.quantity}</p>
                                  </div>
                                </div>
                                <span>{formatPrice(item.price * item.quantity, currency)}</span>
                              </div>
                            ))}
                          </div>

                          <div className="pt-2 text-right">
                            <button
                              onClick={() => {
                                setTrackSearch({ orderId: ord.id, contact: ord.phone });
                                setCurrentView('track');
                              }}
                              className="text-xs text-[#9E8055] font-semibold hover:underline"
                            >
                              Track Delivery Timeline →
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Wishlist Tab */}
              {activeTab === 'wishlist' && (
                <div className="bg-white border border-[#EAE4DC] rounded-xl p-6 shadow-sm space-y-6">
                  <h3 className="font-serif text-xl font-bold text-[#222] border-b border-[#EAE4DC] pb-3">
                    Saved Wishlist Items ({wishlistProducts.length})
                  </h3>

                  {wishlistProducts.length === 0 ? (
                    <p className="text-xs text-gray-500 py-6">Your wishlist is currently empty.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                      {wishlistProducts.map(prod => (
                        <ProductCard key={prod.id} product={prod} />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Addresses Tab */}
              {activeTab === 'addresses' && (
                <div className="bg-white border border-[#EAE4DC] rounded-xl p-6 shadow-sm space-y-6">
                  <h3 className="font-serif text-xl font-bold text-[#222] border-b border-[#EAE4DC] pb-3">
                    Saved Addresses
                  </h3>

                  <div className="p-4 bg-[#F5F1EC] rounded-lg border border-[#EAE4DC] text-xs space-y-1">
                    <div className="flex justify-between font-bold text-[#222]">
                      <span>Default Delivery Address</span>
                      <span className="text-green-700 bg-green-100 px-2 py-0.5 rounded text-[10px]">Primary</span>
                    </div>
                    <p>House 14, Block C, M.M. Alam Road, Gulberg III</p>
                    <p>Lahore, Punjab - 54000, Pakistan</p>
                    <p>Phone: +92 301 8472910</p>
                  </div>
                </div>
              )}

              {/* Exchange Request Form Tab */}
              {activeTab === 'exchange' && (
                <div className="bg-white border border-[#EAE4DC] rounded-xl p-6 shadow-sm space-y-6">
                  <h3 className="font-serif text-1xl font-bold text-[#222] border-b border-[#EAE4DC] pb-3">
                    14-Day Size & Suit Exchange Request
                  </h3>

                  <p className="text-xs text-gray-600">
                    If your suit fitting isn't perfect, submit an exchange request within 14 days of receipt. Courier pickup will be scheduled.
                  </p>

                  {exchangeSuccess ? (
                    <div className="p-4 bg-green-50 text-green-800 text-xs font-semibold rounded border border-green-200">
                      Exchange request registered! SASA customer care will contact you on WhatsApp within 2 hours.
                    </div>
                  ) : (
                    <form onSubmit={handleExchangeSubmit} className="space-y-4 text-xs max-w-lg">
                      <div>
                        <label className="block font-semibold mb-1 text-[#222]">Order ID *</label>
                        <select className="w-full px-3 py-2 bg-[#FAFAFA] border border-[#EAE4DC] rounded">
                          {customerOrders.map(o => (
                            <option key={o.id} value={o.id}>{o.id} - {o.createdAt}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block font-semibold mb-1 text-[#222]">Reason for Exchange *</label>
                        <select
                          value={exchangeReason}
                          onChange={(e) => setExchangeReason(e.target.value)}
                          className="w-full px-3 py-2 bg-[#FAFAFA] border border-[#EAE4DC] rounded"
                        >
                          <option value="Size exchange needed">Size fitting too small/large</option>
                          <option value="Color variation">Wish to exchange color</option>
                          <option value="Defect or stitching issue">Stitching / Fabric concern</option>
                        </select>
                      </div>

                      <button
                        type="submit"
                        className="px-6 py-3 bg-[#222222] text-white font-semibold uppercase tracking-wider rounded hover:bg-[#9E8055] transition"
                      >
                        Submit Exchange Ticket
                      </button>
                    </form>
                  )}
                </div>
              )}

            </div>

          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};
