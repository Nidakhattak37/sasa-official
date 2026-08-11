import React, { useState } from 'react';
import { Product } from '../../types';
import { useApp } from '../../context/AppContext';
import { formatPrice } from '../../utils/currency';
import { X, Star, ShoppingBag, Heart, Check, Ruler } from 'lucide-react';

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
  onOpenSizeGuide?: () => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({ product, onClose, onOpenSizeGuide }) => {
  if (!product) return null;

  const { currency, addToCart, toggleWishlist, isInWishlist, setCurrentView, setSelectedProductId } = useApp();
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState(product.sizes[0] || 'M');
  const [selectedColor, setSelectedColor] = useState(product.colors[0]?.name || 'Standard');
  const [quantity, setQuantity] = useState(1);
  const [addedSuccess, setAddedSuccess] = useState(false);

  const inWishlist = isInWishlist(product.id);

  const handleAddToCart = () => {
    addToCart(product, selectedSize, selectedColor, quantity);
    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 2000);
  };

  const handleFullDetails = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
    setSelectedProductId(product.id);
    setCurrentView('product-detail');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      
      {/* Modal Container */}
      <div className="relative w-full max-w-4xl bg-white rounded-xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col md:flex-row">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 text-[#222] bg-white/80 hover:bg-white rounded-full shadow transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left: Gallery */}
        <div className="w-full md:w-1/2 bg-[#F5F1EC] p-6 flex flex-col justify-between">
          <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-white">
            <img
              src={product.images[selectedImage] || product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex gap-2 mt-4 overflow-x-auto pb-1">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`w-16 h-20 rounded border-2 overflow-hidden flex-shrink-0 ${
                    selectedImage === idx ? 'border-[#9E8055]' : 'border-transparent opacity-70'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Details & Controls */}
        <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-between overflow-y-auto max-h-[80vh] md:max-h-none">
          <div className="space-y-4">
            
            {/* Category & Rating */}
            <div className="flex items-center justify-between text-xs text-[#888888] font-medium uppercase tracking-wider">
              <span>{product.category} • {product.sku}</span>
              <span className="flex items-center gap-1 text-[#222222]">
                <Star className="w-3.5 h-3.5 fill-[#D4AF37] text-[#D4AF37]" />
                {product.rating} ({product.reviewsCount} reviews)
              </span>
            </div>

            {/* Product Title */}
            <h2 className="font-serif text-2xl font-bold text-[#222222]">
              {product.name}
            </h2>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-xl font-bold text-[#222222]">
                {formatPrice(product.price, currency)}
              </span>
              {product.originalPrice && (
                <span className="text-sm text-[#999999] line-through">
                  {formatPrice(product.originalPrice, currency)}
                </span>
              )}
            </div>

            {/* Short Description */}
            <p className="text-xs text-[#555555] leading-relaxed line-clamp-3">
              {product.description}
            </p>

            {/* Color Selection */}
            {product.colors && product.colors.length > 0 && (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#222] mb-2">
                  Color: <span className="font-normal text-[#666]">{selectedColor}</span>
                </label>
                <div className="flex gap-2">
                  {product.colors.map((c) => (
                    <button
                      key={c.name}
                      onClick={() => setSelectedColor(c.name)}
                      className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition ${
                        selectedColor === c.name ? 'border-[#9E8055] scale-110 shadow-sm' : 'border-gray-200'
                      }`}
                      style={{ backgroundColor: c.hex }}
                      title={c.name}
                    >
                      {selectedColor === c.name && (
                        <Check className="w-3.5 h-3.5 text-white drop-shadow" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Selection */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#222]">
                  Select Size: <span className="font-normal text-[#666]">{selectedSize}</span>
                </label>
                {onOpenSizeGuide && (
                  <button
                    onClick={onOpenSizeGuide}
                    className="text-[11px] text-[#9E8055] hover:underline flex items-center gap-1 font-medium"
                  >
                    <Ruler className="w-3 h-3" /> Size Guide
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((sz) => (
                  <button
                    key={sz}
                    onClick={() => setSelectedSize(sz)}
                    className={`px-3 py-1.5 text-xs font-medium rounded border transition ${
                      selectedSize === sz
                        ? 'bg-[#222222] text-white border-[#222222]'
                        : 'bg-white text-[#333] border-[#EAE4DC] hover:border-[#9E8055]'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="pt-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#222] mb-2">
                Quantity
              </label>
              <div className="inline-flex items-center border border-[#EAE4DC] rounded bg-white">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-1 text-sm text-[#555] hover:bg-[#F5F1EC] transition"
                >
                  -
                </button>
                <span className="px-4 py-1 text-xs font-semibold">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-1 text-sm text-[#555] hover:bg-[#F5F1EC] transition"
                >
                  +
                </button>
              </div>
            </div>

          </div>

          {/* Action Buttons */}
          <div className="pt-6 border-t border-[#EAE4DC] space-y-3 mt-6">
            <div className="flex gap-3">
              <button
                onClick={handleAddToCart}
                className={`flex-1 py-3 px-6 rounded text-xs font-semibold uppercase tracking-widest transition flex items-center justify-center gap-2 ${
                  addedSuccess
                    ? 'bg-green-700 text-white'
                    : 'bg-[#222222] text-white hover:bg-[#9E8055]'
                }`}
              >
                {addedSuccess ? (
                  <>
                    <Check className="w-4 h-4" /> Added to Cart!
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" /> Add to Shopping Cart
                  </>
                )}
              </button>

              <button
                onClick={() => toggleWishlist(product.id)}
                className={`p-3 rounded border transition ${
                  inWishlist ? 'bg-red-50 text-red-500 border-red-200' : 'border-[#EAE4DC] text-[#222] hover:bg-[#F5F1EC]'
                }`}
              >
                <Heart className={`w-5 h-5 ${inWishlist ? 'fill-current' : ''}`} />
              </button>
            </div>

            <button
              onClick={handleFullDetails}
              className="w-full text-center text-xs text-[#777777] hover:text-[#222222] underline font-medium pt-1"
            >
              View Full Product Specifications & Fabric Details →
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
