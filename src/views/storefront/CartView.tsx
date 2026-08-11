import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AnnouncementBar } from '../../components/storefront/AnnouncementBar';
import { Header } from '../../components/storefront/Header';
import { Footer } from '../../components/storefront/Footer';
import { formatPrice } from '../../utils/currency';
import { normalizeImageUrl, handleImageError, DEFAULT_FALLBACK_IMAGE } from '../../utils/imageUrl';
import { ShoppingBag, Trash2, ArrowRight, Tag, ShieldCheck, Check } from 'lucide-react';

export const CartView: React.FC = () => {
  const {
    cart, updateCartQuantity, removeFromCart, clearCart,
    activeCoupon, applyCoupon, removeCoupon,
    currency, settings, setCurrentView
  } = useApp();

  const [couponInput, setCouponInput] = useState('');
  const [couponMsg, setCouponMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const subtotal = cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);

  let discountAmount = 0;
  if (activeCoupon) {
    if (activeCoupon.discountType === 'percentage') {
      discountAmount = (subtotal * activeCoupon.discountValue) / 100;
    } else if (activeCoupon.discountType === 'flat') {
      discountAmount = activeCoupon.discountValue;
    }
  }

  const freeShipThreshold = settings.freeShippingThreshold;
  const isFreeShip = subtotal >= freeShipThreshold || activeCoupon?.discountType === 'free_shipping';
  const shippingFee = isFreeShip ? 0 : settings.defaultShippingFee;
  const grandTotal = Math.max(0, subtotal - discountAmount + shippingFee);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput) return;
    const res = applyCoupon(couponInput);
    if (res.success) {
      setCouponMsg({ type: 'success', text: res.message });
      setCouponInput('');
    } else {
      setCouponMsg({ type: 'error', text: res.message });
    }
    setTimeout(() => setCouponMsg(null), 3000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <AnnouncementBar />
      <Header />

      <main className="flex-1 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="mb-8">
            <span className="text-xs uppercase tracking-[0.25em] font-semibold text-[#9E8055]">
              Shopping Summary
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-normal text-[#222222] mt-1">
              Your Shopping Bag ({cart.length} items)
            </h1>
          </div>

          {cart.length === 0 ? (
            <div className="bg-white border border-[#EAE4DC] rounded-xl p-16 text-center space-y-4 max-w-xl mx-auto">
              <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto stroke-1" />
              <h2 className="font-serif text-2xl text-[#222]">Your bag is currently empty</h2>
              <p className="text-xs text-[#777]">Explore our ready-to-wear pret, luxury formals, and seasonal unstitched suits.</p>
              <button
                onClick={() => setCurrentView('shop')}
                className="px-8 py-3 bg-[#222222] text-white text-xs font-semibold uppercase tracking-[0.2em] rounded hover:bg-[#9E8055] transition inline-block"
              >
                Start Shopping Now
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Items List (8 Cols) */}
              <div className="lg:col-span-8 bg-white border border-[#EAE4DC] rounded-xl overflow-hidden shadow-sm">
                
                <div className="p-4 bg-[#FAFAFA] border-b border-[#EAE4DC] flex justify-between items-center text-xs font-bold uppercase tracking-wider text-[#222]">
                  <span>Product Details</span>
                  <button onClick={clearCart} className="text-red-500 hover:underline text-[11px] font-medium">
                    Clear Bag
                  </button>
                </div>

                <div className="divide-y divide-[#F2F2F2] p-4 sm:p-6 space-y-6">
                  {cart.map((item, idx) => (
                    <div key={`${item.product.id}-${item.selectedSize}-${item.selectedColor}-${idx}`} className="pt-6 first:pt-0 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                      
                      <div className="flex gap-4 items-center">
                        <img
                          src={normalizeImageUrl(item.product.images?.[0])}
                          alt={item.product.name}
                          referrerPolicy="no-referrer"
                          onError={(e) => handleImageError(e, DEFAULT_FALLBACK_IMAGE)}
                          className="w-20 h-24 object-cover rounded bg-[#F5F1EC] border border-[#EAE4DC]"
                        />
                        <div className="space-y-1">
                          <span className="text-[10px] uppercase tracking-wider font-semibold text-[#9E8055]">
                            {item.product.category}
                          </span>
                          <h3 className="font-serif text-base font-semibold text-[#222222]">
                            {item.product.name}
                          </h3>
                          <p className="text-xs text-[#777]">
                            Size: <strong className="text-[#222]">{item.selectedSize}</strong> • Color: <strong className="text-[#222]">{item.selectedColor}</strong>
                          </p>
                          <p className="text-xs font-bold text-[#222]">
                            {formatPrice(item.product.price, currency)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between w-full sm:w-auto gap-6 pt-2 sm:pt-0">
                        {/* Quantity controls */}
                        <div className="inline-flex items-center border border-[#EAE4DC] rounded bg-white">
                          <button
                            onClick={() => updateCartQuantity(item.product.id, item.selectedSize, item.selectedColor, item.quantity - 1)}
                            className="px-3 py-1 text-sm text-[#555] hover:bg-[#F5F1EC]"
                          >
                            -
                          </button>
                          <span className="px-3 py-1 text-xs font-semibold">{item.quantity}</span>
                          <button
                            onClick={() => updateCartQuantity(item.product.id, item.selectedSize, item.selectedColor, item.quantity + 1)}
                            className="px-3 py-1 text-sm text-[#555] hover:bg-[#F5F1EC]"
                          >
                            +
                          </button>
                        </div>

                        {/* Item total */}
                        <span className="text-sm font-bold text-[#222]">
                          {formatPrice(item.product.price * item.quantity, currency)}
                        </span>

                        <button
                          onClick={() => removeFromCart(item.product.id, item.selectedSize, item.selectedColor)}
                          className="text-gray-400 hover:text-red-500 p-1"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                    </div>
                  ))}
                </div>

              </div>

              {/* Order Summary Card (4 Cols) */}
              <div className="lg:col-span-4 space-y-4">
                <div className="bg-white border border-[#EAE4DC] rounded-xl p-6 shadow-sm space-y-4">
                  <h3 className="font-serif text-lg font-bold text-[#222] border-b border-[#EAE4DC] pb-3">
                    Order Summary
                  </h3>

                  {/* Coupon Form */}
                  <div>
                    {activeCoupon ? (
                      <div className="flex justify-between items-center text-xs bg-green-50 border border-green-200 p-2.5 rounded text-green-800">
                        <span className="flex items-center gap-1 font-semibold">
                          <Tag className="w-4 h-4 text-green-600" />
                          Code "{activeCoupon.code}" Active
                        </span>
                        <button onClick={removeCoupon} className="text-red-500 hover:underline font-bold text-[11px]">
                          Remove
                        </button>
                      </div>
                    ) : (
                      <form onSubmit={handleApplyCoupon} className="flex gap-2">
                        <input
                          type="text"
                          value={couponInput}
                          onChange={(e) => setCouponInput(e.target.value)}
                          placeholder="Promo Code (e.g. SASA10)"
                          className="flex-1 px-3 py-2 text-xs border border-[#EAE4DC] rounded focus:outline-none focus:border-[#9E8055]"
                        />
                        <button
                          type="submit"
                          className="px-4 py-2 bg-[#222] text-white text-xs font-semibold rounded hover:bg-[#9E8055] transition"
                        >
                          Apply
                        </button>
                      </form>
                    )}

                    {couponMsg && (
                      <p className={`text-[11px] mt-1 ${couponMsg.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>
                        {couponMsg.text}
                      </p>
                    )}
                  </div>

                  {/* Calculations */}
                  <div className="space-y-2 text-xs text-[#555] pt-2 border-t border-[#EAE4DC]">
                    <div className="flex justify-between">
                      <span>Bag Subtotal</span>
                      <span className="font-semibold text-[#222]">{formatPrice(subtotal, currency)}</span>
                    </div>

                    {discountAmount > 0 && (
                      <div className="flex justify-between text-green-700 font-semibold">
                        <span>Coupon Discount ({activeCoupon?.code})</span>
                        <span>-{formatPrice(discountAmount, currency)}</span>
                      </div>
                    )}

                    <div className="flex justify-between">
                      <span>Shipping Fee</span>
                      <span>{isFreeShip ? <strong className="text-green-700 uppercase">FREE</strong> : formatPrice(shippingFee, currency)}</span>
                    </div>

                    <div className="flex justify-between text-base font-bold text-[#222] pt-3 border-t border-[#EAE4DC]">
                      <span>Grand Total</span>
                      <span>{formatPrice(grandTotal, currency)}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setCurrentView('checkout')}
                    className="w-full py-3.5 bg-[#222222] text-white text-xs font-semibold uppercase tracking-widest rounded hover:bg-[#9E8055] transition flex items-center justify-center gap-2 shadow-lg"
                  >
                    <span>Proceed to Express Checkout</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-4 bg-[#F5F1EC] rounded-xl text-xs text-[#666] flex items-center gap-3">
                  <ShieldCheck className="w-6 h-6 text-[#9E8055] flex-shrink-0" />
                  <span>Secure 256-Bit SSL Encryption. Cash on Delivery available for all orders across Pakistan.</span>
                </div>
              </div>

            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
};
