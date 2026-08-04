import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { AnnouncementBar } from '../../components/storefront/AnnouncementBar';
import { Header } from '../../components/storefront/Header';
import { Footer } from '../../components/storefront/Footer';
import { ProductCard } from '../../components/storefront/ProductCard';
import { QuickViewModal } from '../../components/storefront/QuickViewModal';
import { SizeGuideModal } from '../../components/storefront/SizeGuideModal';
import { CartDrawer } from '../../components/storefront/CartDrawer';
import { SearchOverlay } from '../../components/storefront/SearchOverlay';
import { Product } from '../../types';
import { SlidersHorizontal, ChevronDown, RefreshCw, Sparkles } from 'lucide-react';

export const ShopView: React.FC = () => {
  const { products, categories, selectedCategorySlug, setSelectedCategorySlug, setCurrentView } = useApp();

  const [selectedFabric, setSelectedFabric] = useState<string>('all');
  const [selectedSize, setSelectedSize] = useState<string>('all');
  const [maxPrice, setMaxPrice] = useState<number>(40000);
  const [sortBy, setSortBy] = useState<'featured' | 'newest' | 'price-low' | 'price-high' | 'rating'>('featured');
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const fabrics = ['Lawn', 'Velvet', 'Silk', 'Chiffon', 'Organza', 'Cotton Net', 'Jacquard'];
  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'Unstitched'];

  const selectedCategoryObj = categories.find(c => c.slug === selectedCategorySlug);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      // Category filter
      if (selectedCategorySlug && selectedCategorySlug !== 'all') {
        if (selectedCategorySlug === 'new-arrivals' && !p.isNewArrival) return false;
        if (selectedCategorySlug === 'sale' && !p.isSale) return false;
        if (selectedCategorySlug !== 'new-arrivals' && selectedCategorySlug !== 'sale') {
          const matchCat = p.category.toLowerCase().replace(/\s+/g, '-') === selectedCategorySlug;
          if (!matchCat) return false;
        }
      }

      // Fabric filter
      if (selectedFabric !== 'all') {
        if (!p.fabricDetails.toLowerCase().includes(selectedFabric.toLowerCase())) return false;
      }

      // Size filter
      if (selectedSize !== 'all') {
        if (!p.sizes.includes(selectedSize)) return false;
      }

      // Max price
      if (p.price > maxPrice) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
    });
  }, [products, selectedCategorySlug, selectedFabric, selectedSize, maxPrice, sortBy]);

  const resetFilters = () => {
    setSelectedCategorySlug(null);
    setSelectedFabric('all');
    setSelectedSize('all');
    setMaxPrice(40000);
    setSortBy('featured');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA]">
      <AnnouncementBar />
      <Header />

      <main className="flex-1 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Breadcrumb & Header Banner */}
          <div className="mb-8">
            <div className="flex items-center space-x-2 text-xs text-[#777777] mb-2">
              <button onClick={() => setCurrentView('home')} className="hover:text-[#222]">Home</button>
              <span>/</span>
              <span className="text-[#222] font-semibold">
                {selectedCategoryObj ? selectedCategoryObj.name : 'All Products'}
              </span>
            </div>

            <div className="bg-[#F5F1EC] border border-[#EAE4DC] rounded-xl p-6 sm:p-8 text-center space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.25em] text-[#9E8055]">
                SASA Official Collection
              </span>
              <h1 className="font-serif text-3xl sm:text-4xl font-normal text-[#222222]">
                {selectedCategoryObj ? selectedCategoryObj.name : 'Complete Luxury Catalogue'}
              </h1>
              <p className="text-xs text-[#666666] max-w-xl mx-auto">
                {selectedCategoryObj ? selectedCategoryObj.description : 'Explore our handcrafted pret, luxury formals, velvet royale, and unstitched lawn collections.'}
              </p>
            </div>
          </div>

          {/* Top Bar: Filter Toggles & Sort */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 mb-8 border-b border-[#EAE4DC]">
            
            <div className="flex items-center space-x-4 w-full sm:w-auto justify-between sm:justify-start">
              <button
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="lg:hidden px-4 py-2 bg-white border border-[#EAE4DC] rounded text-xs font-semibold text-[#222] flex items-center gap-2"
              >
                <SlidersHorizontal className="w-4 h-4 text-[#9E8055]" />
                <span>Filters</span>
              </button>

              <span className="text-xs text-[#777777] font-medium">
                Showing <strong className="text-[#222]">{filteredProducts.length}</strong> Products
              </span>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center space-x-2 w-full sm:w-auto justify-end text-xs">
              <span className="text-[#777777] font-medium">Sort By:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-white border border-[#EAE4DC] text-[#222222] font-semibold rounded px-3 py-1.5 focus:outline-none focus:border-[#9E8055] cursor-pointer"
              >
                <option value="featured">Featured & Best Sellers</option>
                <option value="newest">Newest Arrivals</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>

          </div>

          {/* Main Content Layout */}
          <div className="flex flex-col lg:flex-row gap-8">
            
            {/* Left Sidebar Filters (Desktop & Mobile drawer) */}
            <aside className={`w-full lg:w-64 space-y-6 ${showMobileFilters ? 'block' : 'hidden lg:block'}`}>
              
              <div className="flex items-center justify-between pb-3 border-b border-[#EAE4DC]">
                <h3 className="font-serif text-base font-bold text-[#222222] flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-[#9E8055]" /> Filter Products
                </h3>
                <button
                  onClick={resetFilters}
                  className="text-[11px] text-[#9E8055] hover:underline flex items-center gap-1 font-semibold"
                >
                  <RefreshCw className="w-3 h-3" /> Reset
                </button>
              </div>

              {/* Categories Filter */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[#222]">Categories</h4>
                <div className="space-y-1">
                  <button
                    onClick={() => setSelectedCategorySlug(null)}
                    className={`w-full text-left text-xs py-1.5 px-2 rounded transition ${
                      selectedCategorySlug === null ? 'bg-[#222222] text-white font-semibold' : 'text-[#555] hover:bg-[#F5F1EC]'
                    }`}
                  >
                    All Categories ({products.length})
                  </button>
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategorySlug(cat.slug)}
                      className={`w-full text-left text-xs py-1.5 px-2 rounded transition flex justify-between items-center ${
                        selectedCategorySlug === cat.slug ? 'bg-[#222222] text-white font-semibold' : 'text-[#555] hover:bg-[#F5F1EC]'
                      }`}
                    >
                      <span>{cat.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Fabric Filter */}
              <div className="space-y-2 pt-4 border-t border-[#EAE4DC]">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[#222]">Fabric Type</h4>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => setSelectedFabric('all')}
                    className={`px-2.5 py-1 text-[11px] rounded border transition ${
                      selectedFabric === 'all' ? 'bg-[#9E8055] text-white border-[#9E8055]' : 'bg-white text-[#555] border-[#EAE4DC]'
                    }`}
                  >
                    All Fabrics
                  </button>
                  {fabrics.map(fab => (
                    <button
                      key={fab}
                      onClick={() => setSelectedFabric(fab)}
                      className={`px-2.5 py-1 text-[11px] rounded border transition ${
                        selectedFabric === fab ? 'bg-[#9E8055] text-white border-[#9E8055]' : 'bg-white text-[#555] border-[#EAE4DC]'
                      }`}
                    >
                      {fab}
                    </button>
                  ))}
                </div>
              </div>

              {/* Size Filter */}
              <div className="space-y-2 pt-4 border-t border-[#EAE4DC]">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[#222]">Size Options</h4>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => setSelectedSize('all')}
                    className={`px-2.5 py-1 text-[11px] rounded border transition ${
                      selectedSize === 'all' ? 'bg-[#222] text-white border-[#222]' : 'bg-white text-[#555] border-[#EAE4DC]'
                    }`}
                  >
                    All Sizes
                  </button>
                  {sizes.map(sz => (
                    <button
                      key={sz}
                      onClick={() => setSelectedSize(sz)}
                      className={`px-2.5 py-1 text-[11px] rounded border transition ${
                        selectedSize === sz ? 'bg-[#222] text-white border-[#222]' : 'bg-white text-[#555] border-[#EAE4DC]'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Filter Slider */}
              <div className="space-y-2 pt-4 border-t border-[#EAE4DC]">
                <div className="flex justify-between text-xs font-semibold text-[#222]">
                  <span>Max Price:</span>
                  <span>PKR {maxPrice.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min="5000"
                  max="40000"
                  step="1000"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-[#9E8055]"
                />
              </div>

            </aside>

            {/* Right Products Grid */}
            <div className="flex-1">
              {filteredProducts.length === 0 ? (
                <div className="bg-white border border-[#EAE4DC] rounded-xl p-16 text-center space-y-4">
                  <Sparkles className="w-10 h-10 text-gray-300 mx-auto" />
                  <h3 className="font-serif text-xl font-semibold text-[#222]">No Products Match Filters</h3>
                  <p className="text-xs text-[#777]">Try clearing your fabric, size, or category filters to view more items.</p>
                  <button
                    onClick={resetFilters}
                    className="px-6 py-2.5 bg-[#222222] text-white text-xs font-semibold uppercase tracking-wider rounded hover:bg-[#9E8055] transition"
                  >
                    Clear All Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {filteredProducts.map(product => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onQuickView={(p) => setQuickViewProduct(p)}
                    />
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>
      </main>

      <Footer />

      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onOpenSizeGuide={() => setIsSizeGuideOpen(true)}
      />

      <SizeGuideModal
        isOpen={isSizeGuideOpen}
        onClose={() => setIsSizeGuideOpen(false)}
      />

      <CartDrawer />
      <SearchOverlay />
    </div>
  );
};
