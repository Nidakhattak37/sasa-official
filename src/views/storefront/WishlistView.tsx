import React from 'react';
import { useApp } from '../../context/AppContext';
import { Header } from '../../components/storefront/Header';
import { Footer } from '../../components/storefront/Footer';
import { AnnouncementBar } from '../../components/storefront/AnnouncementBar';
import { ProductCard } from '../../components/storefront/ProductCard';
import { CartDrawer } from '../../components/storefront/CartDrawer';
import { SearchOverlay } from '../../components/storefront/SearchOverlay';
import { Heart, Trash2, ShoppingBag, ArrowRight, Sparkles } from 'lucide-react';

export const WishlistView: React.FC = () => {
  const {
    wishlist, clearWishlist, products, setCurrentView,
    setSelectedCategorySlug, addToCart
  } = useApp();

  const wishlistProducts = products.filter(p => wishlist.includes(p.id));

  const handleAddAllToCart = () => {
    wishlistProducts.forEach(product => {
      const defaultSize = product.sizes[0] || 'M';
      const defaultColor = product.colors[0]?.name || 'Standard';
      addToCart(product, defaultSize, defaultColor, 1);
    });
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#222222] flex flex-col font-sans">
      <AnnouncementBar />
      <Header />

      <main className="flex-1 py-10 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-xs text-[#888888] uppercase tracking-wider mb-8">
            <button
              onClick={() => setCurrentView('home')}
              className="hover:text-[#222] transition"
            >
              Home
            </button>
            <span>/</span>
            <span className="text-[#222] font-semibold">Wishlist</span>
          </nav>

          {/* Section Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-[#EAE4DC] mb-10 gap-4">
            <div>
              <span className="text-xs uppercase tracking-[0.25em] font-semibold text-[#8B5E34] flex items-center gap-1.5 mb-1">
                <Sparkles className="w-3.5 h-3.5" /> Saved Items
              </span>
              <h1 className="font-serif text-3xl sm:text-4xl font-normal text-[#1E1E24]">
                My Wishlist
              </h1>
            </div>

            {wishlist.length > 0 && (
              <div className="flex items-center gap-3">
                <button
                  onClick={handleAddAllToCart}
                  className="px-5 py-2.5 bg-[#222222] text-white hover:bg-[#8B5E34] text-xs font-bold uppercase tracking-widest rounded-xl transition flex items-center gap-2 shadow-sm"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Move All To Cart</span>
                </button>

                <button
                  onClick={clearWishlist}
                  className="px-4 py-2.5 border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold uppercase tracking-wider rounded-xl transition flex items-center gap-1.5"
                  title="Clear all wishlist items"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Clear Wishlist</span>
                </button>
              </div>
            )}
          </div>

          {/* Wishlist Items Grid / Empty State */}
          {wishlistProducts.length === 0 ? (
            <div className="bg-white border border-[#EAE4DC] rounded-3xl p-12 sm:p-16 text-center max-w-xl mx-auto shadow-sm space-y-6 my-8">
              <div className="w-20 h-20 bg-[#F5F1EC] text-[#8B5E34] rounded-full flex items-center justify-center mx-auto border border-[#EAE4DC]">
                <Heart className="w-10 h-10 stroke-[1.5]" />
              </div>

              <div className="space-y-2">
                <h3 className="font-serif text-2xl font-bold text-[#1E1E24]">
                  Your Wishlist is Empty
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto leading-relaxed">
                  You have not saved any items to your wishlist yet. Browse our latest collections and click the heart icon on any outfit to save it for later.
                </p>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => {
                    setSelectedCategorySlug(null);
                    setCurrentView('shop');
                  }}
                  className="px-8 py-3.5 bg-[#222222] hover:bg-[#8B5E34] text-white text-xs font-bold uppercase tracking-[0.2em] rounded-xl transition shadow-lg inline-flex items-center gap-3 group"
                >
                  <span>Explore Collection</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {wishlistProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

        </div>
      </main>

      <Footer />
      <CartDrawer />
      <SearchOverlay />
    </div>
  );
};
