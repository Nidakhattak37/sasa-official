import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatPrice } from '../../utils/currency';
import { normalizeImageUrl, handleImageError, DEFAULT_FALLBACK_IMAGE } from '../../utils/imageUrl';
import { X, Trash2, ShoppingBag, ArrowRight, Tag, Truck, Check } from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const {
    isCartDrawerOpen, setIsCartDrawerOpen,
    cart, updateCartQuantity, removeFromCart,
    activeCoupon, applyCoupon, removeCoupon,
    currency, settings, setCurrentView
  } = useApp();

  const [couponInput, setCouponInput] = useState('');
  const [couponMessage, setCouponMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isCartDrawerOpen) return null;

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

  const amountNeededForFreeShip = Math.max(0, freeShipThreshold - subtotal);
  const freeShipPercent = Math.min(100, (subtotal / freeShipThreshold) * 100);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput) return;
    const result = applyCoupon(couponInput);
    if (result.success) {
      setCouponMessage({ type: 'success', text: result.message });
      setCouponInput('');
    } else {
      setCouponMessage({ type: 'error', text: result.message });
    }
    setTimeout(() => setCouponMessage(null), 3000);
  };

  const handleGoToCheckout = () => {
    setIsCartDrawerOpen(false);
    setCurrentView('checkout');
  };

  const handleGoToCart = () => {
    setIsCartDrawerOpen(false);
    setCurrentView('cart');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between">
          
          {/* Header */}
          <div className="p-5 border-b border-[#EAE4DC] flex items-center justify-between bg-[#FAFAFA]">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#9E8055]" />
              <h3 className="font-serif text-lg font-bold text-[#222222]">
                Your Shopping Bag ({cart.length})
              </h3>
            </div>
            <button
              onClick={() => setIsCartDrawerOpen(false)}
              className="p-1.5 text-gray-400 hover:text-black rounded-full hover:bg-gray-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Indicator */}
          <div className="bg-[#F5F1EC] px-5 py-3 border-b border-[#EAE4DC] text-xs">
            {isFreeShip ? (
              <div className="flex items-center gap-2 text-green-800 font-semibold">
                <Check className="w-4 h-4 text-green-600" />
                <span>You've unlocked <strong>FREE Shipping!</strong></span>
              </div>
            ) : (
              <div>
                <div className="flex justify-between items-center mb-1 text-[#555]">
                  <span>Free Delivery Threshold</span>
                  <span>Add {formatPrice(amountNeededForFreeShip, currency)} more</span>
                </div>
                <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#9E8055] transition-all duration-500"
                    style={{ width: `${freeShipPercent}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Items Container */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 divide-y divide-[#F2F2F2]">
            {cart.length === 0 ? (
              <div className="py-16 text-center text-[#777777] space-y-4">
                <ShoppingBag className="w-12 h-12 mx-auto text-gray-300 stroke-1" />
                <p className="font-serif text-lg text-[#222]">Your bag is currently empty</p>
                <p className="text-xs">Explore our latest luxury Pret and Unstitched edits.</p>
                <button
                  onClick={() => {
                    setIsCartDrawerOpen(false);
                    setCurrentView('shop');
                  }}
                  className="px-6 py-2.5 bg-[#222222] text-white text-xs font-semibold uppercase tracking-wider rounded hover:bg-[#9E8055] transition inline-block"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              cart.map((item, idx) => (
                <div key={`${item.product.id}-${item.selectedSize}-${item.selectedColor}-${idx}`} className="pt-4 first:pt-0 flex gap-4">
                  
                  {/* Item Image */}
                  <img
                    src={normalizeImageUrl(item.product.images?.[0])}
                    alt={item.product.name}
                    referrerPolicy="no-referrer"
                    onError={(e) => handleImageError(e, DEFAULT_FALLBACK_IMAGE)}
                    className="w-20 h-24 object-cover rounded bg-[#F5F1EC] flex-shrink-0"
                  />

                  {/* Meta & Controls */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <h4 className="font-serif text-sm font-semibold text-[#222222] line-clamp-1">
                          {item.product.name}
                        </h4>
                        <button
                          onClick={() => removeFromCart(item.product.id, item.selectedSize, item.selectedColor)}
                          className="text-gray-400 hover:text-red-500 transition p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="text-[11px] text-[#777777] mt-0.5 space-x-2">
                        <span>Size: <strong className="text-[#222]">{item.selectedSize}</strong></span>
                        <span>•</span>
                        <span>Color: <strong className="text-[#222]">{item.selectedColor}</strong></span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center mt-2">
                      <div className="inline-flex items-center border border-[#EAE4DC] rounded bg-white">
                        <button
                          onClick={() => updateCartQuantity(item.product.id, item.selectedSize, item.selectedColor, item.quantity - 1)}
                          className="px-2 py-0.5 text-xs text-[#555] hover:bg-[#F5F1EC]"
                        >
                          -
                        </button>
                        <span className="px-2 py-0.5 text-xs font-semibold">{item.quantity}</span>
                        <button
                          onClick={() => updateCartQuantity(item.product.id, item.selectedSize, item.selectedColor, item.quantity + 1)}
                          className="px-2 py-0.5 text-xs text-[#555] hover:bg-[#F5F1EC]"
                        >
                          +
                        </button>
                      </div>

                      <span className="text-sm font-bold text-[#222222]">
                        {formatPrice(item.product.price * item.quantity, currency)}
                      </span>
                    </div>
                  </div>

                </div>
              ))
            )}
          </div>

          {/* Footer Calculations & Checkout */}
          {cart.length > 0 && (
            <div className="p-5 border-t border-[#EAE4DC] bg-[#FAFAFA] space-y-3">
              
              {/* Coupon Form */}
              <div>
                {activeCoupon ? (
                  <div className="flex justify-between items-center text-xs bg-green-50 border border-green-200 p-2 rounded text-green-800">
                    <span className="flex items-center gap-1 font-semibold">
                      <Tag className="w-3.5 h-3.5 text-green-600" />
                      Coupon "{activeCoupon.code}" Applied
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
                      placeholder="Coupon code (e.g. SASA10)"
                      className="flex-1 px-3 py-1.5 text-xs border border-[#EAE4DC] rounded bg-white focus:outline-none focus:border-[#9E8055]"
                    />
                    <button
                      type="submit"
                      className="px-3 py-1.5 bg-[#222] text-white text-xs font-semibold rounded hover:bg-[#9E8055] transition"
                    >
                      Apply
                    </button>
                  </form>
                )}

                {couponMessage && (
                  <p className={`text-[11px] mt-1 ${couponMessage.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>
                    {couponMessage.text}
                  </p>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs text-[#555]">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-[#222]">{formatPrice(subtotal, currency)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-green-700">
                    <span>Discount ({activeCoupon?.code})</span>
                    <span>-{formatPrice(discountAmount, currency)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Estimated Delivery</span>
                  <span>{isFreeShip ? <strong className="text-green-700 uppercase">FREE</strong> : formatPrice(shippingFee, currency)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-[#222222] pt-2 border-t border-[#EAE4DC]">
                  <span>Total</span>
                  <span>{formatPrice(grandTotal, currency)}</span>
                </div>
              </div>

              {/* Checkout CTA Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={handleGoToCheckout}
                  className="w-full py-3 bg-[#222222] text-white text-xs font-semibold uppercase tracking-widest rounded hover:bg-[#9E8055] transition flex items-center justify-center gap-2 shadow-lg"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={handleGoToCart}
                  className="w-full py-2 text-center text-xs font-semibold text-[#555] hover:text-[#222] uppercase tracking-wider underline"
                >
                  View Full Cart & Summary
                </button>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};
