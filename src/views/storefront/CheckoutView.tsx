import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AnnouncementBar } from '../../components/storefront/AnnouncementBar';
import { Header } from '../../components/storefront/Header';
import { Footer } from '../../components/storefront/Footer';
import { formatPrice } from '../../utils/currency';
import { ShippingAddress, PaymentMethod } from '../../types';
import { ShieldCheck, Lock, CreditCard, Banknote, CheckCircle, ArrowRight } from 'lucide-react';

export const CheckoutView: React.FC = () => {
  const {
    cart, activeCoupon, settings, currency,
    createOrder, setCurrentView, setTrackSearch
  } = useApp();

  const [checkoutMode, setCheckoutMode] = useState<'guest' | 'login'>('guest');

  // Form State
  const [address, setAddress] = useState<ShippingAddress>({
    fullName: '',
    email: '',
    phone: '',
    street: '',
    city: 'Lahore',
    state: 'Punjab',
    postalCode: '',
    country: 'Pakistan'
  });

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('COD');
  const [customerNotes, setCustomerNotes] = useState('');

  // Card details mock
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [placedOrderInfo, setPlacedOrderInfo] = useState<any | null>(null);

  const subtotal = cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);

  let discountAmount = 0;
  if (activeCoupon) {
    if (activeCoupon.discountType === 'percentage') {
      discountAmount = (subtotal * activeCoupon.discountValue) / 100;
    } else if (activeCoupon.discountType === 'flat') {
      discountAmount = activeCoupon.discountValue;
    }
  }

  const isFreeShip = subtotal >= settings.freeShippingThreshold || activeCoupon?.discountType === 'free_shipping';
  const shippingFee = isFreeShip ? 0 : settings.defaultShippingFee;
  const grandTotal = Math.max(0, subtotal - discountAmount + shippingFee);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    setIsSubmitting(true);

    const orderItems = cart.map(item => ({
      productId: item.product.id,
      productName: item.product.name,
      selectedSize: item.selectedSize,
      selectedColor: item.selectedColor,
      quantity: item.quantity,
      price: item.product.price,
      image: item.product.images[0]
    }));

    const newOrder = createOrder({
      customerName: address.fullName,
      email: address.email,
      phone: address.phone,
      shippingAddress: address,
      items: orderItems,
      subtotal,
      discount: discountAmount,
      couponCode: activeCoupon?.code,
      shippingFee,
      tax: 0,
      total: grandTotal,
      paymentMethod,
      paymentStatus: paymentMethod === 'Card' ? 'Paid' : 'Pending',
      orderStatus: 'Confirmed',
      estimatedDeliveryDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      customerNotes
    });

    // Send order notification email to store official email
    try {
      fetch('/api/send-order-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order: newOrder,
          officialEmail: settings.email || 'info@sasaofficial.com'
        })
      }).catch(err => {
        console.warn('Order email notification dispatched with status:', err);
      });
    } catch (err) {
      console.warn('Failed to call send-order-email endpoint:', err);
    }

    setTimeout(() => {
      setTrackSearch({ orderId: newOrder.id, contact: newOrder.phone });
      setPlacedOrderInfo(newOrder);
      setIsSubmitting(false);
      setCurrentView('confirmation');
    }, 800);
  };

  const pakistaniCities = [
    'Lahore', 'Karachi', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan',
    'Peshawar', 'Quetta', 'Sialkot', 'Hyderabad', 'Gujranwala', 'Bahawalpur', 'Abbottabad'
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <AnnouncementBar />
      <Header />

      <main className="flex-1 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="mb-8">
            <span className="text-xs uppercase tracking-[0.25em] font-semibold text-[#9E8055]">
              Checkout Flow
            </span>
            <h1 className="font-serif text-3xl font-normal text-[#222222] mt-1">
              Express Checkout
            </h1>
          </div>

          <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            {/* Left Column: Guest / Login & Address & Payment (7 Cols) */}
            <div className="lg:col-span-7 space-y-8">
              
              {/* Checkout Mode Toggle */}
              <div className="bg-white border border-[#EAE4DC] rounded-xl p-6 shadow-sm space-y-4">
                <div className="flex border-b border-[#EAE4DC] pb-3">
                  <button
                    type="button"
                    onClick={() => setCheckoutMode('guest')}
                    className={`flex-1 py-2 text-xs font-semibold uppercase tracking-wider text-center transition ${
                      checkoutMode === 'guest' ? 'text-[#222] border-b-2 border-[#9E8055]' : 'text-gray-400'
                    }`}
                  >
                    1. Checkout as Guest
                  </button>
                  <button
                    type="button"
                    onClick={() => setCheckoutMode('login')}
                    className={`flex-1 py-2 text-xs font-semibold uppercase tracking-wider text-center transition ${
                      checkoutMode === 'login' ? 'text-[#222] border-b-2 border-[#9E8055]' : 'text-gray-400'
                    }`}
                  >
                    Have an Account? Sign In
                  </button>
                </div>

                <p className="text-xs text-[#666]">
                  {checkoutMode === 'guest'
                    ? 'Fast guest checkout — no password required. You will receive live SMS and Email tracking updates.'
                    : 'Log in to auto-fill your saved addresses and loyalty points.'}
                </p>
              </div>

              {/* Shipping Address Section */}
              <div className="bg-white border border-[#EAE4DC] rounded-xl p-6 shadow-sm space-y-4">
                <h3 className="font-serif text-lg font-bold text-[#222] border-b border-[#EAE4DC] pb-3">
                  2. Shipping & Contact Details
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-semibold mb-1 text-[#222]">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={address.fullName}
                      onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
                      className="w-full px-3 py-2 bg-[#FAFAFA] border border-[#EAE4DC] rounded focus:outline-none focus:border-[#9E8055]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-[#222]">Phone Number (For COD & Rider) *</label>
                    <input
                      type="text"
                      required
                      value={address.phone}
                      onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                      placeholder="+92 300 1234567"
                      className="w-full px-3 py-2 bg-[#FAFAFA] border border-[#EAE4DC] rounded focus:outline-none focus:border-[#9E8055]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-semibold mb-1 text-[#222]">Email Address (For Invoice & Tracking) *</label>
                    <input
                      type="email"
                      required
                      value={address.email}
                      onChange={(e) => setAddress({ ...address, email: e.target.value })}
                      className="w-full px-3 py-2 bg-[#FAFAFA] border border-[#EAE4DC] rounded focus:outline-none focus:border-[#9E8055]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-semibold mb-1 text-[#222]">Street Address & House No. *</label>
                    <input
                      type="text"
                      required
                      value={address.street}
                      onChange={(e) => setAddress({ ...address, street: e.target.value })}
                      className="w-full px-3 py-2 bg-[#FAFAFA] border border-[#EAE4DC] rounded focus:outline-none focus:border-[#9E8055]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-[#222]">City *</label>
                    <select
                      value={address.city}
                      onChange={(e) => setAddress({ ...address, city: e.target.value })}
                      className="w-full px-3 py-2 bg-[#FAFAFA] border border-[#EAE4DC] rounded focus:outline-none focus:border-[#9E8055]"
                    >
                      {pakistaniCities.map(city => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-[#222]">Postal Code</label>
                    <input
                      type="text"
                      value={address.postalCode}
                      onChange={(e) => setAddress({ ...address, postalCode: e.target.value })}
                      className="w-full px-3 py-2 bg-[#FAFAFA] border border-[#EAE4DC] rounded focus:outline-none focus:border-[#9E8055]"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="bg-white border border-[#EAE4DC] rounded-xl p-6 shadow-sm space-y-4">
                <h3 className="font-serif text-lg font-bold text-[#222] border-b border-[#EAE4DC] pb-3">
                  3. Select Payment Option
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('COD')}
                    className={`p-4 border rounded-xl flex items-center space-x-3 text-left transition ${
                      paymentMethod === 'COD' ? 'border-[#9E8055] bg-[#F5F1EC] ring-1 ring-[#9E8055]' : 'border-[#EAE4DC] bg-white'
                    }`}
                  >
                    <Banknote className="w-6 h-6 text-[#9E8055]" />
                    <div>
                      <h4 className="font-semibold text-xs text-[#222]">Cash on Delivery (COD)</h4>
                      <p className="text-[10px] text-[#666]">Pay cash upon package arrival nationwide.</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('Card')}
                    className={`p-4 border rounded-xl flex items-center space-x-3 text-left transition ${
                      paymentMethod === 'Card' ? 'border-[#9E8055] bg-[#F5F1EC] ring-1 ring-[#9E8055]' : 'border-[#EAE4DC] bg-white'
                    }`}
                  >
                    <CreditCard className="w-6 h-6 text-[#9E8055]" />
                    <div>
                      <h4 className="font-semibold text-xs text-[#222]">Debit / Credit Card</h4>
                      <p className="text-[10px] text-[#666]">Visa, Mastercard, & UnionPay supported.</p>
                    </div>
                  </button>
                </div>

                {paymentMethod === 'Card' && (
                  <div className="p-4 bg-[#FAFAFA] rounded-lg border border-[#EAE4DC] space-y-3 text-xs pt-4">
                    <p className="font-semibold text-[#222] flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5 text-green-600" /> Simulated Payment Gateway Demo
                    </p>
                    <div>
                      <label className="block text-[11px] font-medium text-gray-600">Card Number</label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-[#EAE4DC] rounded"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-medium text-gray-600">Expiry (MM/YY)</label>
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          className="w-full px-3 py-1.5 bg-white border border-[#EAE4DC] rounded"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-gray-600">CVV Code</label>
                        <input
                          type="text"
                          value={cardCvc}
                          onChange={(e) => setCardCvc(e.target.value)}
                          className="w-full px-3 py-1.5 bg-white border border-[#EAE4DC] rounded"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold mb-1 text-[#222]">Special Order & Delivery Instructions (Optional)</label>
                  <textarea
                    rows={2}
                    value={customerNotes}
                    onChange={(e) => setCustomerNotes(e.target.value)}
                    placeholder="e.g. Please call before coming, or leave package at gate..."
                    className="w-full px-3 py-2 bg-[#FAFAFA] border border-[#EAE4DC] text-xs rounded focus:outline-none focus:border-[#9E8055]"
                  />
                </div>
              </div>

            </div>

            {/* Right Column: Order Items Summary & Confirm CTA (5 Cols) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white border border-[#EAE4DC] rounded-xl p-6 shadow-sm space-y-4 sticky top-28">
                <h3 className="font-serif text-lg font-bold text-[#222] border-b border-[#EAE4DC] pb-3">
                  Order Review ({cart.length} items)
                </h3>

                {/* Mini items list */}
                <div className="divide-y divide-[#F2F2F2] max-h-60 overflow-y-auto pr-1 space-y-3">
                  {cart.map((item, idx) => (
                    <div key={idx} className="pt-3 first:pt-0 flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-3">
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="w-12 h-14 object-cover rounded bg-[#F5F1EC]"
                        />
                        <div>
                          <h4 className="font-semibold text-[#222] line-clamp-1 max-w-[160px]">{item.product.name}</h4>
                          <span className="text-[10px] text-[#777]">Size: {item.selectedSize} • Qty: {item.quantity}</span>
                        </div>
                      </div>
                      <span className="font-bold text-[#222]">{formatPrice(item.product.price * item.quantity, currency)}</span>
                    </div>
                  ))}
                </div>

                {/* Calculation breakdown */}
                <div className="space-y-2 text-xs text-[#555] pt-4 border-t border-[#EAE4DC]">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-semibold text-[#222]">{formatPrice(subtotal, currency)}</span>
                  </div>

                  {discountAmount > 0 && (
                    <div className="flex justify-between text-green-700 font-semibold">
                      <span>Discount ({activeCoupon?.code})</span>
                      <span>-{formatPrice(discountAmount, currency)}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span>Shipping Charges</span>
                    <span>{isFreeShip ? <strong className="text-green-700 uppercase">FREE</strong> : formatPrice(shippingFee, currency)}</span>
                  </div>

                  <div className="flex justify-between text-base font-bold text-[#222] pt-3 border-t border-[#EAE4DC]">
                    <span>Total Amount Payable</span>
                    <span className="text-[#9E8055]">{formatPrice(grandTotal, currency)}</span>
                  </div>
                </div>

                {/* Final Submit CTA Button */}
                <button
                  type="submit"
                  disabled={isSubmitting || cart.length === 0}
                  className="w-full py-4 bg-[#222222] text-white text-xs font-bold uppercase tracking-widest rounded hover:bg-[#9E8055] transition flex items-center justify-center gap-2 shadow-xl disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Processing Order...</span>
                  ) : (
                    <>
                      <span>Confirm & Place Order ({formatPrice(grandTotal, currency)})</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <p className="text-[10px] text-[#888] text-center">
                  By placing your order, you agree to SASA Official's Terms & 14-Day Return Policy.
                </p>
              </div>
            </div>

          </form>

        </div>
      </main>

      <Footer />
    </div>
  );
};
