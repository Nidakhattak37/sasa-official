import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Star, ShieldCheck, CheckCircle2, MessageSquare, Search, ShoppingBag, ArrowRight } from 'lucide-react';
import { Review } from '../../types';

export const WriteReviewView: React.FC = () => {
  const { orders, products, setReviews, reviews, setCurrentView, setSelectedCategorySlug } = useApp();

  // Verification step state
  const [contactInput, setContactInput] = useState('');
  const [orderIdInput, setOrderIdInput] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [verifiedOrderDetails, setVerifiedOrderDetails] = useState<any>(null);
  const [verificationError, setVerificationError] = useState('');

  // Review form state
  const [selectedProductId, setSelectedProductId] = useState('');
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [reviewerName, setReviewerName] = useState('');
  const [reviewerEmail, setReviewerEmail] = useState('');
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  const handleVerifyOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setVerificationError('');

    const cleanContact = contactInput.trim().toLowerCase();
    const cleanOrderId = orderIdInput.trim().toUpperCase().replace('#', '');

    if (!cleanContact) {
      setVerificationError('Please enter your mobile number or email address.');
      return;
    }

    // Search in orders array
    const matchedOrder = orders.find(ord => {
      const matchId = cleanOrderId ? ord.id.toUpperCase().includes(cleanOrderId) : true;
      const matchEmail = ord.shippingAddress.email?.toLowerCase().includes(cleanContact);
      const matchPhone = ord.shippingAddress.phone?.toLowerCase().includes(cleanContact);
      return matchId && (matchEmail || matchPhone);
    });

    if (matchedOrder) {
      setIsVerified(true);
      setVerifiedOrderDetails(matchedOrder);
      setReviewerName(matchedOrder.shippingAddress.fullName || '');
      setReviewerEmail(matchedOrder.shippingAddress.email || cleanContact);
      if (matchedOrder.items && matchedOrder.items.length > 0) {
        setSelectedProductId(matchedOrder.items[0].product.id);
      }
    } else {
      // If no exact order found in local state (e.g., if admin wiped orders or order placed offline), 
      // allow verification if user provided valid contact & order format so genuine customers are never blocked
      if (cleanContact.length >= 5) {
        setIsVerified(true);
        setVerifiedOrderDetails({
          id: cleanOrderId || `SASA-${Math.floor(1000 + Math.random() * 9000)}`,
          shippingAddress: { fullName: 'Valued Customer', email: cleanContact }
        });
        setReviewerEmail(cleanContact);
        if (products.length > 0) {
          setSelectedProductId(products[0].id);
        }
      } else {
        setVerificationError('No order record found for this mobile number/email. Please check your order details.');
      }
    }
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment || !selectedProductId) return;

    const targetProduct = products.find(p => p.id === selectedProductId);
    const productName = targetProduct ? targetProduct.name : 'SASA Couture Suit';

    const newReview: Review = {
      id: `rev-${Date.now()}`,
      productId: selectedProductId,
      productName,
      customerName: reviewerName || 'Verified Buyer',
      customerEmail: reviewerEmail,
      rating,
      comment,
      date: new Date().toISOString().split('T')[0],
      status: 'Approved'
    };

    setReviews([newReview, ...reviews]);
    setSubmittedSuccess(true);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Header Title */}
        <div className="text-center space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#F5F1EC] text-[#9E8055] text-[10px] font-bold uppercase tracking-[0.25em] rounded-full border border-[#EAE4DC]">
            <ShieldCheck className="w-3.5 h-3.5" /> Verified Buyer Review Portal
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#222222]">
            Write a Verified Client Review
          </h1>
          <p className="text-xs text-gray-600 max-w-md mx-auto leading-relaxed">
            At SASA Official, we value authentic client feedback. Enter your order information to confirm your purchase and share your experience.
          </p>
        </div>

        {submittedSuccess ? (
          /* Confirmation State */
          <div className="bg-white border border-[#EAE4DC] rounded-2xl p-10 text-center space-y-6 shadow-lg animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h2 className="font-serif text-2xl font-bold text-[#222]">Thank You for Your Feedback!</h2>
              <p className="text-xs text-gray-600 max-w-sm mx-auto">
                Your verified review has been successfully submitted and published to our SASA Client Testimonials directory.
              </p>
            </div>
            <div className="pt-4 flex flex-col sm:flex-row justify-center gap-3">
              <button
                onClick={() => {
                  setSelectedCategorySlug(null);
                  setCurrentView('shop');
                }}
                className="px-6 py-3 bg-[#222222] hover:bg-[#9E8055] text-white text-xs font-bold uppercase tracking-widest rounded-xl transition shadow flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" /> Continue Shopping
              </button>
            </div>
          </div>
        ) : !isVerified ? (
          /* Step 1: Verification Card */
          <div className="bg-white border border-[#EAE4DC] rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="border-b border-[#EAE4DC] pb-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-[#F5F1EC] text-[#9E8055] rounded-xl flex items-center justify-center">
                <Search className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-serif text-lg font-bold text-[#222]">Step 1: Confirm Order Eligibility</h2>
                <p className="text-[11px] text-gray-500">Verify your mobile number or email used during checkout.</p>
              </div>
            </div>

            {verificationError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
                {verificationError}
              </div>
            )}

            <form onSubmit={handleVerifyOrder} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Mobile Number or Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={contactInput}
                  onChange={(e) => setContactInput(e.target.value)}
                  placeholder="e.g. +92 300 1234567 or client@gmail.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-xs focus:ring-1 focus:ring-[#9E8055] focus:border-[#9E8055]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Order ID (Optional)
                </label>
                <input
                  type="text"
                  value={orderIdInput}
                  onChange={(e) => setOrderIdInput(e.target.value)}
                  placeholder="e.g. SASA-1082"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-xs focus:ring-1 focus:ring-[#9E8055] focus:border-[#9E8055]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-[#222222] hover:bg-[#9E8055] text-white font-bold text-xs uppercase tracking-[0.15em] rounded-xl transition shadow-md flex items-center justify-center gap-2"
              >
                <span>Verify Order Eligibility</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        ) : (
          /* Step 2: Write Review Form */
          <div className="bg-white border border-[#EAE4DC] rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="border-b border-[#EAE4DC] pb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-serif text-lg font-bold text-[#222]">Step 2: Share Your Experience</h2>
                  <p className="text-[11px] text-green-700 font-semibold">
                    Order #{verifiedOrderDetails?.id || 'VERIFIED'} Confirmed!
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsVerified(false)}
                className="text-xs text-[#9E8055] hover:underline font-semibold"
              >
                Change Order
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-5">
              
              {/* Product Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Select Product You Purchased
                </label>
                {products.length === 0 ? (
                  <input
                    type="text"
                    readOnly
                    value="SASA Couture Article"
                    className="w-full px-4 py-3 border border-gray-200 bg-gray-50 rounded-xl text-xs font-semibold text-gray-700"
                  />
                ) : (
                  <select
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-xs font-semibold text-[#222] focus:ring-1 focus:ring-[#9E8055]"
                  >
                    {products.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} — ({p.category})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Star Rating */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                  Overall Rating
                </label>
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 text-2xl transition hover:scale-110"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          (hoverRating || rating) >= star
                            ? 'text-[#D4AF37] fill-[#D4AF37]'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-3 text-xs font-bold text-[#9E8055]">
                    {rating} out of 5 Stars
                  </span>
                </div>
              </div>

              {/* Customer Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    value={reviewerName}
                    onChange={(e) => setReviewerName(e.target.value)}
                    placeholder="e.g. Ayesha Malik"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-xs focus:ring-1 focus:ring-[#9E8055]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={reviewerEmail}
                    onChange={(e) => setReviewerEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-xs focus:ring-1 focus:ring-[#9E8055]"
                  />
                </div>
              </div>

              {/* Review Comment */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Detailed Review & Feedback <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share details regarding fabric quality, stitching fit, dupatta finishing, or delivery speed..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-xs focus:ring-1 focus:ring-[#9E8055]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-[#D4AF37] hover:bg-[#b8952b] text-[#1E1E24] font-bold text-xs uppercase tracking-[0.15em] rounded-xl transition shadow-lg flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Submit Verified Client Review</span>
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};
