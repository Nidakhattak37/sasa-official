import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AnnouncementBar } from '../../components/storefront/AnnouncementBar';
import { Header } from '../../components/storefront/Header';
import { Footer } from '../../components/storefront/Footer';
import { ProductCard } from '../../components/storefront/ProductCard';
import { SizeGuideModal } from '../../components/storefront/SizeGuideModal';
import { CartDrawer } from '../../components/storefront/CartDrawer';
import { SearchOverlay } from '../../components/storefront/SearchOverlay';
import { formatPrice } from '../../utils/currency';
import {
  Star, Heart, ShoppingBag, Truck, ShieldCheck, Ruler, Check, ChevronRight, Share2, ZoomIn, MessageSquarePlus, RefreshCw
} from 'lucide-react';

export const ProductDetailView: React.FC = () => {
  const {
    products, selectedProductId, setSelectedProductId,
    currency, addToCart, toggleWishlist, isInWishlist,
    reviews, addReview, setCurrentView, settings
  } = useApp();

  const product = products.find(p => p.id === selectedProductId) || products[0];

  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [selectedSize, setSelectedSize] = useState(product?.sizes[0] || 'M');
  const [selectedColor, setSelectedColor] = useState(product?.colors[0]?.name || 'Standard');
  const [quantity, setQuantity] = useState(1);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);

  // Review form state
  const [reviewName, setReviewName] = useState('');
  const [reviewEmail, setReviewEmail] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  if (!product) return null;

  const inWishlist = isInWishlist(product.id);
  const productReviews = reviews.filter(r => r.productId === product.id && r.status === 'Approved');

  const discountPercent = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  const relatedProducts = products.filter(p => p.id !== product.id && p.category === product.category).slice(0, 4);

  const handleAddToCart = () => {
    addToCart(product, selectedSize, selectedColor, quantity);
    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 2500);
  };

  const handleBuyNow = () => {
    addToCart(product, selectedSize, selectedColor, quantity);
    setCurrentView('checkout');
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewName || !reviewComment) return;
    addReview(product.id, product.name, reviewName, reviewEmail, reviewRating, reviewComment);
    setReviewSubmitted(true);
    setReviewName('');
    setReviewEmail('');
    setReviewComment('');
    setTimeout(() => setReviewSubmitted(false), 4000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <AnnouncementBar />
      <Header />

      <main className="flex-1 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Breadcrumbs */}
          <div className="flex items-center space-x-2 text-xs text-[#777777] mb-6">
            <button onClick={() => setCurrentView('home')} className="hover:text-[#222]">Home</button>
            <span>/</span>
            <button onClick={() => setCurrentView('shop')} className="hover:text-[#222]">{product.category}</button>
            <span>/</span>
            <span className="text-[#222] font-semibold truncate">{product.name}</span>
          </div>

          {/* Product Layout: Gallery + Specs */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
            
            {/* Left: Gallery (7 Cols) - Vertical Thumbnails + Main Image */}
            <div className="lg:col-span-7 flex flex-col-reverse md:flex-row gap-4">
              
              {/* Vertical Stacked Thumbnails */}
              {product.images.length > 1 && (
                <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto md:max-h-[620px] scrollbar-none pb-2 md:pb-0 md:w-24 shrink-0">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIdx(idx)}
                      className={`w-16 h-20 md:w-20 md:h-24 rounded-lg overflow-hidden border-2 transition shrink-0 ${
                        selectedImageIdx === idx ? 'border-[#222222] ring-2 ring-[#222222]/20 scale-95 shadow-md' : 'border-[#EAE4DC] opacity-75 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Main Display Image */}
              <div className="relative flex-1 aspect-[3/4] bg-white rounded-xl overflow-hidden border border-[#EAE4DC] group">
                <img
                  src={product.images[selectedImageIdx] || product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover object-top transition-all duration-300"
                />

                {/* Carousel Arrows */}
                {product.images.length > 1 && (
                  <>
                    <button
                      onClick={() => setSelectedImageIdx(prev => (prev === 0 ? product.images.length - 1 : prev - 1))}
                      className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/80 hover:bg-white text-[#222] shadow-md backdrop-blur-sm transition z-20"
                      aria-label="Previous image"
                    >
                      <ChevronRight className="w-5 h-5 rotate-180" />
                    </button>
                    <button
                      onClick={() => setSelectedImageIdx(prev => (prev === product.images.length - 1 ? 0 : prev + 1))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/80 hover:bg-white text-[#222] shadow-md backdrop-blur-sm transition z-20"
                      aria-label="Next image"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}

                <button
                  onClick={() => setIsZoomOpen(true)}
                  className="absolute bottom-4 right-4 p-3 bg-white/90 hover:bg-white text-[#222] rounded-full shadow-lg backdrop-blur-sm transition flex items-center gap-1.5 text-xs font-semibold z-10"
                >
                  <ZoomIn className="w-4 h-4 text-[#9E8055]" /> Zoom Image
                </button>

                <div className="absolute top-4 left-4 flex flex-col gap-1.5 z-10">
                  {product.isSale && discountPercent && (
                    <span className="px-3 py-1 bg-[#8B5E34] text-white text-xs font-bold uppercase tracking-wider rounded shadow-sm">
                      {discountPercent}% OFF
                    </span>
                  )}
                  {product.isBestSeller && (
                    <span className="px-3 py-1 bg-[#222222] text-[#D4AF37] border border-[#D4AF37]/40 text-xs font-bold uppercase tracking-wider rounded shadow-sm">
                      BEST SELLER
                    </span>
                  )}
                  {product.isNewArrival && (
                    <span className="px-3 py-1 bg-[#8A9A86] text-white text-xs font-bold uppercase tracking-wider rounded shadow-sm">
                      NEW
                    </span>
                  )}
                </div>
              </div>

            </div>

            {/* Right: Product Purchase Details (5 Cols) - Matching Einka Screenshot */}
            <div className="lg:col-span-5 space-y-6 bg-white p-6 sm:p-8 border border-[#EAE4DC] rounded-xl shadow-sm">
              
              {/* Product Title & Metadata */}
              <div className="space-y-2 border-b border-[#EAE4DC] pb-4">
                {product.sku && (
                  <span className="text-[10px] uppercase font-mono tracking-widest text-gray-400 block">
                    SKU: {product.sku}
                  </span>
                )}

                <h1 className="font-serif text-2xl sm:text-3xl font-normal text-[#1E1E24] tracking-tight leading-snug">
                  {product.name}
                </h1>

                {/* Price Display */}
                <div className="flex items-baseline gap-3 pt-1">
                  <span className="text-2xl font-bold text-[#1E1E24]">
                    {formatPrice(product.price, currency)}
                  </span>
                  {product.isSale && product.originalPrice && product.originalPrice > product.price && (
                    <span className="text-sm text-gray-400 line-through font-normal">
                      {formatPrice(product.originalPrice, currency)}
                    </span>
                  )}
                  {discountPercent && (
                    <span className="text-xs font-bold text-[#8B5E34] bg-[#F5F1EC] px-2 py-0.5 rounded border border-[#EAE4DC]">
                      Save {discountPercent}%
                    </span>
                  )}
                </div>

                {/* Badges Bar: Season, Piece Type, Stitching Status */}
                <div className="flex flex-wrap items-center gap-2 pt-2">
                  {product.season && (
                    <span className="inline-block text-[10px] text-[#8B5E34] font-bold uppercase tracking-wider bg-[#F5F1EC] px-2.5 py-1 rounded border border-[#EAE4DC]">
                      {product.season}
                    </span>
                  )}
                  {(product.collectionType || product.collection) && !product.season && (
                    <span className="inline-block text-[10px] text-[#8B5E34] font-semibold uppercase tracking-widest bg-[#F5F1EC] px-2.5 py-1 rounded border border-[#EAE4DC]">
                      {product.collectionType || product.collection}
                    </span>
                  )}
                  {product.pieceType && (
                    <span className="inline-block text-[10px] text-white font-bold uppercase tracking-widest bg-[#222222] px-2.5 py-1 rounded shadow-sm">
                      {product.pieceType}
                    </span>
                  )}
                  {product.stitchingStatus && (
                    <span className="inline-block text-[10px] text-gray-700 font-semibold uppercase tracking-wider bg-gray-100 px-2.5 py-1 rounded border border-gray-200">
                      {product.stitchingStatus}
                    </span>
                  )}
                </div>
              </div>

              {/* Size Selector */}
              <div className="space-y-2 pt-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-[#222]">Size</label>
                  <button
                    onClick={() => setIsSizeGuideOpen(true)}
                    className="text-[11px] text-[#8B5E34] hover:underline flex items-center gap-1 font-medium"
                  >
                    <Ruler className="w-3.5 h-3.5" /> Size Guide
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map(sz => (
                    <button
                      key={sz}
                      onClick={() => setSelectedSize(sz)}
                      className={`min-w-[44px] h-10 px-3 text-xs font-medium border transition flex items-center justify-center ${
                        selectedSize === sz
                          ? 'bg-[#000000] text-white border-[#000000] font-bold'
                          : 'bg-white text-[#333333] border-[#E5E5E5] hover:border-[#000000]'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity Stepper + Add to Cart Row (As per attached screenshot) */}
              <div className="flex items-center gap-3 pt-2">
                {/* Quantity box [- 1 +] */}
                <div className="flex items-center border border-[#E5E5E5] h-12 bg-white rounded-none">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-full text-base text-[#555] hover:bg-gray-100 flex items-center justify-center transition"
                  >
                    −
                  </button>
                  <span className="w-10 text-center text-xs font-bold text-[#1E1E24]">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-full text-base text-[#555] hover:bg-gray-100 flex items-center justify-center transition"
                  >
                    +
                  </button>
                </div>

                {/* Black Add to Cart Button */}
                <button
                  onClick={handleAddToCart}
                  className={`flex-1 h-12 px-6 text-xs font-bold uppercase tracking-wider transition flex items-center justify-center gap-2 ${
                    addedSuccess
                      ? 'bg-green-700 text-white'
                      : 'bg-[#000000] text-white hover:bg-[#222222]'
                  }`}
                >
                  {addedSuccess ? (
                    <>
                      <Check className="w-4 h-4" /> Added to cart
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" /> Add to cart
                    </>
                  )}
                </button>
              </div>

              {/* Full Width Buy It Now Button */}
              <button
                onClick={handleBuyNow}
                className="w-full h-12 bg-[#000000] hover:bg-[#222222] text-white text-xs font-bold uppercase tracking-wider transition flex items-center justify-center"
              >
                Buy it now
              </button>

              {/* Accordions Section: DETAILS, MATERIALS + CARE, SHIPPING + RETURNS */}
              <div className="border-t border-[#EAE4DC] pt-4 space-y-3">
                {/* DETAILS ACCORDION */}
                <div className="border-b border-[#EAE4DC] pb-3">
                  <details className="group" open>
                    <summary className="flex items-center justify-between cursor-pointer list-none text-xs font-bold uppercase tracking-wider text-[#1E1E24]">
                      <span>DETAILS</span>
                      <span className="text-sm font-light transition group-open:rotate-180">−</span>
                    </summary>
                    <div className="mt-3 text-xs text-gray-600 leading-relaxed space-y-1.5">
                      <p>{product.description}</p>
                      {product.fabricDetails && (
                        <p className="font-semibold text-[#8B5E34] pt-1">• {product.fabricDetails}</p>
                      )}
                    </div>
                  </details>
                </div>

                {/* MATERIALS + CARE ACCORDION */}
                <div className="border-b border-[#EAE4DC] pb-3">
                  <details className="group">
                    <summary className="flex items-center justify-between cursor-pointer list-none text-xs font-bold uppercase tracking-wider text-[#1E1E24]">
                      <span>MATERIALS + CARE</span>
                      <span className="text-sm font-light transition group-open:rotate-180">+</span>
                    </summary>
                    <div className="mt-3 text-xs text-gray-600 leading-relaxed space-y-1.5">
                      <p>{product.careInstructions || 'Dry Clean Only recommended to preserve fine threadwork embroidery and scalloped organza borders.'}</p>
                      <p className="text-[11px] text-gray-500">Fabric: {product.fabricDetails}</p>
                    </div>
                  </details>
                </div>

                {/* SHIPPING + RETURNS ACCORDION */}
                <div className="border-b border-[#EAE4DC] pb-3">
                  <details className="group">
                    <summary className="flex items-center justify-between cursor-pointer list-none text-xs font-bold uppercase tracking-wider text-[#1E1E24]">
                      <span>SHIPPING + RETURNS</span>
                      <span className="text-sm font-light transition group-open:rotate-180">+</span>
                    </summary>
                    <div className="mt-3 text-xs text-gray-600 leading-relaxed space-y-1.5">
                      <p>Fast nationwide express delivery via TCS within 3 to 5 business days.</p>
                      <p>Hassle-free 14-day exchange policy for unstitched suits & sizing updates.</p>
                    </div>
                  </details>
                </div>
              </div>

            </div>

          </div>

          {/* Product Specifications & Details Accordions */}
          <div className="mt-14 bg-white border border-[#EAE4DC] rounded-xl p-6 sm:p-10 space-y-8">
            <div className="border-b border-[#EAE4DC] pb-4">
              <h2 className="font-serif text-2xl font-bold text-[#222222]">
                Fabric Specifications & Craftsmanship
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs text-[#444444] leading-relaxed">
              <div className="space-y-3">
                <h3 className="font-semibold text-sm uppercase tracking-wider text-[#222]">Description</h3>
                <p>{product.description}</p>
                <div className="p-4 bg-[#F5F1EC] rounded-lg border border-[#EAE4DC]">
                  <strong className="block font-semibold text-[#222] mb-1">Fabric Details:</strong>
                  <span>{product.fabricDetails}</span>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-sm uppercase tracking-wider text-[#222]">Care & Washing Instructions</h3>
                <p>{product.careInstructions || 'Dry Clean Only recommended. Handle hand embroidery with extreme care. Steam iron on reverse.'}</p>
                
                <h3 className="font-semibold text-sm uppercase tracking-wider text-[#222] pt-2">Shipping & Returns</h3>
                <p>Delivery nationwide via TCS Express within 3-5 business days. 14-day hassle-free size exchange policy applies.</p>
              </div>
            </div>
          </div>

          {/* Verified Customer Reviews Section */}
          <div className="mt-14 bg-white border border-[#EAE4DC] rounded-xl p-6 sm:p-10">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center pb-6 border-b border-[#EAE4DC] gap-4">
              <div>
                <h2 className="font-serif text-2xl font-bold text-[#222222]">
                  Customer Reviews ({productReviews.length})
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex text-[#D4AF37]">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <span className="text-xs font-semibold text-[#222]">{product.rating} out of 5</span>
                </div>
              </div>
            </div>

            {/* Existing Reviews List */}
            <div className="divide-y divide-[#F2F2F2] my-6 space-y-4">
              {productReviews.length === 0 ? (
                <p className="py-6 text-xs text-[#777] italic">No reviews yet for this product. Be the first to leave feedback below!</p>
              ) : (
                productReviews.map(rev => (
                  <div key={rev.id} className="pt-4 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#222]">{rev.customerName}</span>
                        <span className="text-[10px] bg-green-50 text-green-700 px-2 py-0.5 rounded font-semibold">Verified Buyer</span>
                      </div>
                      <span className="text-[10px] text-gray-400">{rev.date}</span>
                    </div>

                    <div className="flex text-[#D4AF37]">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-current' : 'text-gray-300'}`} />
                      ))}
                    </div>

                    <p className="text-xs text-[#555] italic">{rev.comment}</p>

                    {rev.adminReply && (
                      <div className="ml-4 p-3 bg-[#F5F1EC] rounded text-xs border-l-2 border-[#9E8055]">
                        <strong className="block text-[#222] font-semibold">SASA Official Response:</strong>
                        <span className="text-[#555]">{rev.adminReply}</span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Write a Review Form */}
            <div className="pt-6 border-t border-[#EAE4DC] bg-[#FAFAFA] p-6 rounded-lg space-y-4">
              <h3 className="font-serif text-lg font-bold text-[#222] flex items-center gap-2">
                <MessageSquarePlus className="w-5 h-5 text-[#9E8055]" /> Leave a Verified Patron Review
              </h3>

              {reviewSubmitted ? (
                <div className="p-4 bg-green-50 text-green-800 text-xs font-semibold rounded border border-green-200">
                  Thank you! Your review has been submitted and published.
                </div>
              ) : (
                <form onSubmit={handleSubmitReview} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold mb-1 text-[#222]">Your Name *</label>
                      <input
                        type="text"
                        required
                        value={reviewName}
                        onChange={(e) => setReviewName(e.target.value)}
                        placeholder="e.g. Ayesha Khan"
                        className="w-full px-3 py-2 bg-white border border-[#EAE4DC] rounded focus:outline-none focus:border-[#9E8055]"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1 text-[#222]">Your Email (Optional)</label>
                      <input
                        type="email"
                        value={reviewEmail}
                        onChange={(e) => setReviewEmail(e.target.value)}
                        placeholder="ayesha@gmail.com"
                        className="w-full px-3 py-2 bg-white border border-[#EAE4DC] rounded focus:outline-none focus:border-[#9E8055]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-[#222]">Overall Rating</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                          className="p-1 text-[#D4AF37]"
                        >
                          <Star className={`w-6 h-6 ${star <= reviewRating ? 'fill-current' : 'text-gray-300'}`} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-[#222]">Your Review & Feedback *</label>
                    <textarea
                      rows={3}
                      required
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Share your experience regarding fabric quality, stitching fit, and delivery..."
                      className="w-full px-3 py-2 bg-white border border-[#EAE4DC] rounded focus:outline-none focus:border-[#9E8055]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-[#222222] text-white font-semibold uppercase tracking-wider rounded hover:bg-[#9E8055] transition"
                  >
                    Submit Review
                  </button>
                </form>
              )}
            </div>

          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="mt-16">
              <h2 className="font-serif text-2xl font-bold text-[#222222] mb-6">
                You May Also Like
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                {relatedProducts.map(rel => (
                  <ProductCard key={rel.id} product={rel} />
                ))}
              </div>
            </div>
          )}

        </div>
      </main>

      <Footer />

      {/* Full Image Zoom Modal */}
      {isZoomOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <button
            onClick={() => setIsZoomOpen(false)}
            className="absolute top-6 right-6 text-white p-3 bg-white/20 hover:bg-white/40 rounded-full"
          >
            ✕
          </button>
          <img
            src={product.images[selectedImageIdx] || product.images[0]}
            alt={product.name}
            className="max-w-full max-h-[90vh] object-contain rounded"
          />
        </div>
      )}

      <SizeGuideModal
        isOpen={isSizeGuideOpen}
        onClose={() => setIsSizeGuideOpen(false)}
      />

      <CartDrawer />
      <SearchOverlay />
    </div>
  );
};
