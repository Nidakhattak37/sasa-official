import React, { useState } from 'react';
import { Product } from '../../types';
import { useApp } from '../../context/AppContext';
import { formatPrice } from '../../utils/currency';
import { Heart, Eye, ShoppingBag, Star } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onQuickView }) => {
  const { currency, toggleWishlist, isInWishlist, addToCart, setCurrentView, setSelectedProductId } = useApp();
  const [isHovered, setIsHovered] = useState(false);
  const inWishlist = isInWishlist(product.id);

  const discountPercent = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  const handleCardClick = () => {
    setSelectedProductId(product.id);
    setCurrentView('product');
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
      className="group relative flex flex-col bg-white border border-[#EAE4DC] rounded-lg overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300"
    >
      {/* Image Gallery & Badges Container */}
      <div className="relative w-full aspect-[3/4] overflow-hidden bg-[#F5F1EC]">
        
        {/* Main Image */}
        <img
          src={isHovered && product.images[1] ? product.images[1] : product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
        />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
          {product.isSale && discountPercent && (
            <span className="px-2 py-0.5 text-[10px] font-bold bg-[#D8A48F] text-white uppercase tracking-wider rounded">
              {discountPercent}% OFF
            </span>
          )}
          {product.isBestSeller && (
            <span className="px-2 py-0.5 text-[10px] font-bold bg-[#222222] text-[#D4AF37] uppercase tracking-wider rounded">
              Best Seller
            </span>
          )}
          {product.isNewArrival && !product.isSale && (
            <span className="px-2 py-0.5 text-[10px] font-bold bg-[#8A9A86] text-white uppercase tracking-wider rounded">
              New
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
        <div className="absolute inset-x-3 bottom-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
          {onQuickView && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onQuickView(product);
              }}
              className="flex-1 py-2 px-3 bg-white/90 hover:bg-white text-[#222] text-xs font-semibold rounded shadow-md backdrop-blur-sm flex items-center justify-center gap-1.5 transition"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Quick View</span>
            </button>
          )}

          <button
            onClick={handleQuickAdd}
            className="p-2 bg-[#222222] hover:bg-[#9E8055] text-white rounded shadow-md transition"
            title="Add to Cart"
          >
            <ShoppingBag className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Meta Content */}
      <div className="p-4 flex flex-col flex-1 justify-between bg-white">
        <div>
          <div className="flex items-center justify-between text-[11px] text-[#888888] font-medium uppercase tracking-wider mb-1">
            <span>{product.category}</span>
            {product.rating > 0 && (
              <span className="flex items-center gap-1 text-[#222222] font-semibold">
                <Star className="w-3 h-3 fill-[#D4AF37] text-[#D4AF37]" />
                {product.rating} ({product.reviewsCount})
              </span>
            )}
          </div>

          <h3 className="font-serif text-base font-semibold text-[#222222] group-hover:text-[#9E8055] transition line-clamp-1">
            {product.name}
          </h3>
        </div>

        {/* Pricing */}
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-sm font-bold text-[#222222]">
            {formatPrice(product.price, currency)}
          </span>
          {product.originalPrice && (
            <span className="text-xs text-[#999999] line-through font-medium">
              {formatPrice(product.originalPrice, currency)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
