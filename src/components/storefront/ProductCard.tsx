import React, { useState } from 'react';
import { Product } from '../../types';
import { useApp } from '../../context/AppContext';
import { formatPrice } from '../../utils/currency';
import { normalizeImageUrl, handleImageError, DEFAULT_FALLBACK_IMAGE } from '../../utils/imageUrl';
import { Heart, Eye, ShoppingBag, Star } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
}

const toTitleCase = (str: string) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export const ProductCard: React.FC<ProductCardProps> = ({ product, onQuickView }) => {
  const { currency, toggleWishlist, isInWishlist, addToCart, setCurrentView, setSelectedProductId, getProductPricing } = useApp();
  const [isHovered, setIsHovered] = useState(false);
  const inWishlist = isInWishlist(product.id);

  // Evaluate dynamic active campaign pricing
  const pricing = getProductPricing(product);
  const isOnSale = pricing.isOnSale;
  const effectivePrice = pricing.effectivePrice;
  const originalPrice = pricing.originalPrice;

  const discountPercent = isOnSale && originalPrice > effectivePrice
    ? Math.round(((originalPrice - effectivePrice) / originalPrice) * 100)
    : null;

  const handleCardClick = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
    setSelectedProductId(product.id);
    setCurrentView('product-detail');
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
    setSelectedProductId(product.id);
    setCurrentView('product-detail');
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    const defaultSize = product.sizes[0] || 'M';
    const defaultColor = product.colors[0]?.name || 'Standard';
    addToCart(product, defaultSize, defaultColor, 1);
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
      className="group relative flex flex-col bg-white border border-[#EAE4DC] rounded-xl overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300"
    >
      {/* Image Gallery & Badges Container */}
      <div className="relative w-full aspect-[3/4] overflow-hidden bg-[#F5F1EC]">
        
        {/* Main Image */}
        <img
          src={normalizeImageUrl(isHovered && product.images?.[1] ? product.images[1] : product.images?.[0])}
          alt={product.name}
          referrerPolicy="no-referrer"
          onError={(e) => handleImageError(e, DEFAULT_FALLBACK_IMAGE)}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
        />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
          {isOnSale && (
            <span className="px-2 py-0.5 text-[10px] font-bold bg-[#8B5E34] text-white uppercase tracking-wider rounded shadow-sm">
              {discountPercent ? `${discountPercent}% OFF` : 'SALE'}
            </span>
          )}
          {product.isBestSeller && (
            <span className="px-2 py-0.5 text-[10px] font-bold bg-[#222222] text-[#D4AF37] border border-[#D4AF37]/30 uppercase tracking-wider rounded shadow-sm">
              BEST SELLER
            </span>
          )}
          {product.isNewArrival && (
            <span className="px-2 py-0.5 text-[10px] font-bold bg-[#8A9A86] text-white uppercase tracking-wider rounded shadow-sm">
              NEW
            </span>
          )}
        </div>

        {/* Top Right Wishlist Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className={`absolute top-2.5 right-2.5 p-2 rounded-full z-10 transition-all ${
            inWishlist
              ? 'bg-red-50 text-red-500 shadow'
              : 'bg-white/80 text-[#222] hover:bg-white hover:text-red-500 shadow-sm'
          }`}
          title={inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
        >
          <Heart className={`w-4 h-4 ${inWishlist ? 'fill-current' : ''}`} />
        </button>

        {/* Hover Quick Actions Bar */}
        <div className="absolute inset-x-2 bottom-2 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
          <button
            onClick={handleQuickView}
            className="flex-1 py-2 px-2 bg-white/95 hover:bg-[#8B5E34] hover:text-white text-[#222] text-[11px] font-bold rounded-lg shadow-md backdrop-blur-sm flex items-center justify-center gap-1 transition uppercase tracking-wider"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Quick View</span>
          </button>

          <button
            onClick={handleQuickAdd}
            className="flex-1 py-2 px-2 bg-[#222222] hover:bg-[#8B5E34] text-white text-[11px] font-bold rounded-lg shadow-md flex items-center justify-center gap-1 transition uppercase tracking-wider"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Add to Cart</span>
          </button>
        </div>
      </div>

      {/* Meta Content */}
      <div className="p-4 flex flex-col flex-1 justify-between bg-white space-y-2">
        <div>
          {/* Rating / Reviews */}
          {product.rating > 0 && (
            <div className="flex items-center gap-1 text-[11px] text-[#D4AF37] font-semibold mb-1">
              <Star className="w-3 h-3 fill-current" />
              <span>{product.rating} ({product.reviewsCount})</span>
            </div>
          )}

          {/* 1. Name: Bold, Capitalize Every First Letter, Slightly Larger */}
          <h3 className="font-bold text-base text-[#222222] group-hover:text-[#9E8055] transition line-clamp-2 leading-snug">
            {toTitleCase(product.name)}
          </h3>

          {/* 2. Collection Type / Season & Piece Type */}
          <div className="flex items-center justify-between text-xs font-semibold text-[#8B5E34] mt-1">
            <span>{product.collectionType || product.collection || product.category || ''}</span>
            {product.pieceType && (
              <span className="px-1.5 py-0.5 bg-[#F5F1EC] text-[#222222] text-[10px] font-semibold rounded border border-[#EAE4DC]">
                {product.pieceType}
              </span>
            )}
          </div>
        </div>

        {/* 3. Pricing: Show effective price and cross out original price if on sale */}
        <div className="pt-1 flex items-baseline gap-2">
          <span className="text-sm sm:text-base font-bold text-[#222222]">
            {formatPrice(effectivePrice, currency)}
          </span>
          {isOnSale && originalPrice > effectivePrice && (
            <span className="text-xs text-[#999999] line-through font-normal">
              {formatPrice(originalPrice, currency)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

