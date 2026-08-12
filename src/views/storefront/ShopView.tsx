import React, { useState, useMemo, useEffect, useRef } from 'react';
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
import { 
  SlidersHorizontal, ChevronDown, RefreshCw, Sparkles, 
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  LayoutGrid, Grid2X2, RectangleVertical, Columns4
} from 'lucide-react';

export const ShopView: React.FC = () => {
  const {
    products,
    categories,
    selectedCategorySlug,
    setSelectedCategorySlug,
    selectedSubcategory,
    selectedCollectionName,
    selectedCustomProductIds,
    activeMenuFilterTitle,
    setCurrentView
  } = useApp();

  const [selectedFabric, setSelectedFabric] = useState<string>('all');
  const [selectedCollectionType, setSelectedCollectionType] = useState<string>('all');
  const [selectedPieceType, setSelectedPieceType] = useState<string>('all');
  const [selectedSize, setSelectedSize] = useState<string>('all');
  const [maxPrice, setMaxPrice] = useState<number>(40000);
  const [sortBy, setSortBy] = useState<'featured' | 'newest' | 'price-low' | 'price-high' | 'rating'>('featured');
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // View Layout State (1 Image, 2 Images, 4 Images per row)
  const [gridColumns, setGridColumns] = useState<1 | 2 | 3 | 4>(4);

  // Pagination & Items Per Page State (12, 24, 36, 48, All)
  const [itemsPerPage, setItemsPerPage] = useState<number | 'all'>(12);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const productGridTopRef = useRef<HTMLDivElement>(null);

  const collectionTypes = ['Summer Lawn', 'Winter Velvet & Khaddar', 'Spring Floral Edit', 'Autumn Silk & Karandi', 'Festive / Eid Special'];
  const pieceTypes = ['3 Piece', '2 Piece', '1 Piece', 'Shirt Dupatta', 'Shirt Shalwar'];
  const fabrics = ['Lawn', 'Velvet', 'Silk', 'Chiffon', 'Organza', 'Cotton Net', 'Jacquard'];
  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'Unstitched'];

  const selectedCategoryObj = categories.find(c => c.slug === selectedCategorySlug);

  // Universal scroll to top on any option/view change
  const scrollToTop = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    }
  };

  // Scroll to top on mount and whenever category changes
  useEffect(() => {
    scrollToTop();
    setCurrentPage(1);
  }, [selectedCategorySlug]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      // 1. Sale Menu Filtering - ONLY show products that are actively on sale/discounted
      if (selectedCategorySlug === 'sale') {
        const isOnSale = p.isSale === true || (typeof p.originalPrice === 'number' && p.originalPrice > p.price);
        if (!isOnSale) return false;
      }

      // 2. Collection Menu Filtering
      else if (selectedCategorySlug === 'collection') {
        if (selectedCustomProductIds && selectedCustomProductIds.length > 0) {
          if (!selectedCustomProductIds.includes(p.id)) return false;
        } else if (selectedCollectionName && selectedCollectionName !== 'all') {
          const targetColl = selectedCollectionName.toLowerCase();
          const pColl = (p.collectionType || p.collection || '').toLowerCase();
          const pSeason = (p.season || '').toLowerCase();
          const pName = p.name.toLowerCase();
          const isMatch = pColl.includes(targetColl.slice(0, 5)) || pSeason.includes(targetColl.slice(0, 5)) || pName.includes(targetColl);
          if (!isMatch) return false;
        }
      }

      // 3. Regular Category Filtering
      else if (selectedCategorySlug && selectedCategorySlug !== 'all') {
        if (selectedCategorySlug === 'new-arrivals') {
          if (!p.isNewArrival) return false;
        } else {
          const catSlug = selectedCategorySlug.toLowerCase();
          const pCatSlug = p.category.toLowerCase().replace(/\s+/g, '-');
          const pCatName = p.category.toLowerCase();
          const matchCat = pCatSlug === catSlug || pCatName === catSlug || pCatSlug.includes(catSlug) || catSlug.includes(pCatSlug);
          if (!matchCat) return false;
        }
      }

      // 4. Subcategory Filter (if specified)
      if (selectedSubcategory && selectedSubcategory !== 'all') {
        const pSub = (p.subcategory || '').toLowerCase();
        const pSubSlug = pSub.replace(/\s+/g, '-');
        const pName = p.name.toLowerCase();
        const targetSub = selectedSubcategory.toLowerCase();
        const targetSubSlug = targetSub.replace(/\s+/g, '-');
        
        const isSubMatch = pSub === targetSub || pSubSlug === targetSubSlug || pSub.includes(targetSub) || pName.includes(targetSub);
        if (!isSubMatch) return false;
      }

      // Collection Type (Season) filter dropdown
      if (selectedCollectionType !== 'all') {
        const pColl = (p.collectionType || p.collection || '').toLowerCase();
        if (!pColl.includes(selectedCollectionType.toLowerCase().slice(0, 6))) return false;
      }

      // Suit Composition / Piece Type filter
      if (selectedPieceType !== 'all') {
        const pPiece = (p.pieceType || '').toLowerCase();
        const pName = p.name.toLowerCase();
        const pSub = (p.subcategory || '').toLowerCase();
        const pDesc = p.description.toLowerCase();
        const target = selectedPieceType.toLowerCase();

        let isMatch = pPiece === target;
        if (!isMatch) {
          if (target === '3 piece') isMatch = pPiece.includes('3') || pName.includes('3-piece') || pName.includes('3 piece') || pSub.includes('3-piece');
          else if (target === '2 piece') isMatch = pPiece.includes('2') || pName.includes('2-piece') || pName.includes('2 piece') || pDesc.includes('2-piece');
          else if (target === '1 piece') isMatch = pPiece.includes('1') || pName.includes('1-piece') || pName.includes('1 piece') || pName.includes('kurti') || pName.includes('kaftan');
          else if (target === 'shirt dupatta') isMatch = pPiece.includes('dupatta') || (pName.includes('dupatta') && !pName.includes('3'));
          else if (target === 'shirt shalwar') isMatch = pPiece.includes('shalwar') || pPiece.includes('trouser') || pDesc.includes('shalwar') || pDesc.includes('pants');
        }
        if (!isMatch) return false;
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
  }, [
    products,
    selectedCategorySlug,
    selectedSubcategory,
    selectedCollectionName,
    selectedCustomProductIds,
    selectedCollectionType,
    selectedPieceType,
    selectedFabric,
    selectedSize,
    maxPrice,
    sortBy
  ]);

  // Total pages and Paginated Products slice
  const totalPages = useMemo(() => {
    if (itemsPerPage === 'all' || filteredProducts.length === 0) return 1;
    return Math.ceil(filteredProducts.length / (itemsPerPage as number));
  }, [filteredProducts.length, itemsPerPage]);

  // Keep currentPage valid if filters reduce page count
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  const paginatedProducts = useMemo(() => {
    if (itemsPerPage === 'all') return filteredProducts;
    const startIndex = (currentPage - 1) * (itemsPerPage as number);
    return filteredProducts.slice(startIndex, startIndex + (itemsPerPage as number));
  }, [filteredProducts, currentPage, itemsPerPage]);

  const resetFilters = () => {
    scrollToTop();
    setSelectedCategorySlug(null);
    setSelectedCollectionType('all');
    setSelectedPieceType('all');
    setSelectedFabric('all');
    setSelectedSize('all');
    setMaxPrice(40000);
    setSortBy('featured');
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    scrollToTop();
  };

  const handleItemsPerPageChange = (val: number | 'all') => {
    setItemsPerPage(val);
    setCurrentPage(1);
    scrollToTop();
  };

  const handleLayoutChange = (cols: 1 | 2 | 3 | 4) => {
    setGridColumns(cols);
  };

  // Generate numbered page array (e.g. 1, 2, 3, ...)
  const pageNumbers = useMemo(() => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 4) {
        pages.push(1, 2, 3, 4, 5, '...', totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  }, [totalPages, currentPage]);

  // Determine grid container class based on selected layout
  const getGridClass = () => {
    switch (gridColumns) {
      case 1:
        return 'grid grid-cols-1 gap-8 max-w-xl mx-auto';
      case 2:
        return 'grid grid-cols-1 sm:grid-cols-2 gap-6';
      case 3:
        return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6';
      case 4:
      default:
        return 'grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6';
    }
  };

  const startItemIndex = filteredProducts.length === 0 ? 0 : itemsPerPage === 'all' ? 1 : (currentPage - 1) * (itemsPerPage as number) + 1;
  const endItemIndex = itemsPerPage === 'all' ? filteredProducts.length : Math.min(currentPage * (itemsPerPage as number), filteredProducts.length);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <AnnouncementBar />
      <Header />

      <main className="flex-1 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Breadcrumb & Header Banner */}
          <div className="mb-8" ref={productGridTopRef}>
            <div className="flex items-center space-x-2 text-xs text-[#777777] mb-2">
              <button 
                onClick={() => {
                  scrollToTop();
                  setCurrentView('home');
                }} 
                className="hover:text-[#222] transition"
              >
                Home
              </button>
              <span>/</span>
              <span className="text-[#222] font-semibold">
                {selectedCategoryObj ? selectedCategoryObj.name : 'All Products'}
              </span>
            </div>

            <div className="bg-white border border-[#EAE4DC] rounded-xl p-6 sm:p-8 text-center space-y-2 shadow-sm">
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

          {/* Top Controls Toolbar: Filters, Layout Switcher, Items Per Page, and Sort */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 pb-6 mb-8 border-b border-[#EAE4DC]">
            
            {/* Left: Mobile Filters Button & Summary */}
            <div className="flex items-center space-x-4 justify-between lg:justify-start">
              <button
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="lg:hidden px-4 py-2 bg-white border border-[#EAE4DC] rounded-lg text-xs font-semibold text-[#222] flex items-center gap-2 hover:bg-[#FAF8F5] transition"
              >
                <SlidersHorizontal className="w-4 h-4 text-[#9E8055]" />
                <span>Filters</span>
              </button>

              <span className="text-xs text-[#777777] font-medium">
                Showing <strong className="text-[#222]">{startItemIndex}-{endItemIndex}</strong> of <strong className="text-[#222]">{filteredProducts.length}</strong> Products
              </span>
            </div>

            {/* Right: Layout Switcher, Items Per Page, and Sort By */}
            <div className="flex flex-wrap items-center justify-between sm:justify-end gap-3 sm:gap-5 text-xs">
              
              {/* 1. VIEW LAYOUT SWITCHER (1 Image, 2 Images, 4 Images) */}
              <div className="flex items-center gap-1.5 bg-[#FAF8F5] p-1 rounded-lg border border-[#EAE4DC]">
                <span className="text-[11px] font-semibold text-[#777] px-1.5 hidden sm:inline">View:</span>
                
                {/* 1 Image / Column */}
                <button
                  onClick={() => handleLayoutChange(1)}
                  className={`p-1.5 sm:px-2 sm:py-1 rounded flex items-center gap-1 font-semibold text-[11px] transition cursor-pointer ${
                    gridColumns === 1
                      ? 'bg-[#1E1E24] text-white shadow-xs'
                      : 'text-[#666] hover:bg-white hover:text-[#1E1E24]'
                  }`}
                  title="View 1 image per row (Full view)"
                >
                  <RectangleVertical className="w-4 h-4" />
                  <span className="hidden sm:inline">1</span>
                </button>

                {/* 2 Images / Columns */}
                <button
                  onClick={() => handleLayoutChange(2)}
                  className={`p-1.5 sm:px-2 sm:py-1 rounded flex items-center gap-1 font-semibold text-[11px] transition cursor-pointer ${
                    gridColumns === 2
                      ? 'bg-[#1E1E24] text-white shadow-xs'
                      : 'text-[#666] hover:bg-white hover:text-[#1E1E24]'
                  }`}
                  title="View 2 images per row"
                >
                  <Grid2X2 className="w-4 h-4" />
                  <span className="hidden sm:inline">2</span>
                </button>

                {/* 4 Images / Columns */}
                <button
                  onClick={() => handleLayoutChange(4)}
                  className={`p-1.5 sm:px-2 sm:py-1 rounded flex items-center gap-1 font-semibold text-[11px] transition cursor-pointer ${
                    gridColumns === 4
                      ? 'bg-[#1E1E24] text-white shadow-xs'
                      : 'text-[#666] hover:bg-white hover:text-[#1E1E24]'
                  }`}
                  title="View 4 images per row (Compact catalogue)"
                >
                  <Columns4 className="w-4 h-4" />
                  <span className="hidden sm:inline">4</span>
                </button>
              </div>

              {/* 2. ITEMS PER PAGE (12, 24, 36, 48, All) */}
              <div className="flex items-center space-x-1.5">
                <span className="text-[#777777] font-medium hidden sm:inline">Show:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    const val = e.target.value === 'all' ? 'all' : Number(e.target.value);
                    handleItemsPerPageChange(val as any);
                  }}
                  className="bg-white border border-[#EAE4DC] text-[#222222] font-semibold rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#9E8055] cursor-pointer shadow-2xs"
                  aria-label="Select items per page"
                >
                  <option value={12}>12 / page</option>
                  <option value={24}>24 / page</option>
                  <option value={36}>36 / page</option>
                  <option value={48}>48 / page</option>
                  <option value="all">View All</option>
                </select>
              </div>

              {/* 3. SORT DROPDOWN */}
              <div className="flex items-center space-x-1.5">
                <span className="text-[#777777] font-medium hidden sm:inline">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value as any);
                    scrollToTop();
                  }}
                  className="bg-white border border-[#EAE4DC] text-[#222222] font-semibold rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#9E8055] cursor-pointer shadow-2xs"
                >
                  <option value="featured">Featured & Best Sellers</option>
                  <option value="newest">Newest Arrivals</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>

            </div>

          </div>

          {/* Main Content Layout */}
          <div className="flex flex-col lg:flex-row gap-8">
            
            {/* Left Sidebar Filters (Desktop & Mobile drawer) */}
            <aside className={`w-full lg:w-64 space-y-6 shrink-0 ${showMobileFilters ? 'block' : 'hidden lg:block'}`}>
              
              <div className="flex items-center justify-between pb-3 border-b border-[#EAE4DC]">
                <h3 className="font-serif text-base font-bold text-[#222222] flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-[#9E8055]" /> Filter Products
                </h3>
                <button
                  onClick={resetFilters}
                  className="text-[11px] text-[#9E8055] hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" /> Reset
                </button>
              </div>

              {/* Categories Filter */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[#222]">Categories</h4>
                <div className="space-y-1">
                  <button
                    onClick={() => {
                      setSelectedCategorySlug(null);
                      scrollToTop();
                    }}
                    className={`w-full text-left text-xs py-1.5 px-2 rounded-lg transition cursor-pointer ${
                      selectedCategorySlug === null ? 'bg-[#222222] text-white font-semibold shadow-xs' : 'text-[#555] hover:bg-[#F5F1EC]'
                    }`}
                  >
                    All Categories ({products.length})
                  </button>
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setSelectedCategorySlug(cat.slug);
                        scrollToTop();
                      }}
                      className={`w-full text-left text-xs py-1.5 px-2 rounded-lg transition flex justify-between items-center cursor-pointer ${
                        selectedCategorySlug === cat.slug ? 'bg-[#222222] text-white font-semibold shadow-xs' : 'text-[#555] hover:bg-[#F5F1EC]'
                      }`}
                    >
                      <span>{cat.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Suit Composition / Piece Type Filter */}
              <div className="space-y-2 pt-4 border-t border-[#EAE4DC]">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[#222]">Suit Composition (Pieces)</h4>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => {
                      setSelectedPieceType('all');
                      scrollToTop();
                    }}
                    className={`px-2.5 py-1 text-[11px] font-medium rounded-lg border transition cursor-pointer ${
                      selectedPieceType === 'all' ? 'bg-[#222222] text-white border-[#222222]' : 'bg-white text-[#555] border-[#EAE4DC] hover:bg-[#F5F1EC]'
                    }`}
                  >
                    All Options
                  </button>
                  {pieceTypes.map(piece => (
                    <button
                      key={piece}
                      onClick={() => {
                        setSelectedPieceType(piece);
                        scrollToTop();
                      }}
                      className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg border transition cursor-pointer ${
                        selectedPieceType === piece ? 'bg-[#8B5E34] text-white border-[#8B5E34] shadow-sm' : 'bg-white text-[#444] border-[#EAE4DC] hover:border-[#8B5E34]'
                      }`}
                    >
                      {piece}
                    </button>
                  ))}
                </div>
              </div>

              {/* Seasonal Collection Type Filter */}
              <div className="space-y-2 pt-4 border-t border-[#EAE4DC]">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[#222]">Collection Type (Season)</h4>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => {
                      setSelectedCollectionType('all');
                      scrollToTop();
                    }}
                    className={`px-2.5 py-1 text-[11px] rounded-lg border transition cursor-pointer ${
                      selectedCollectionType === 'all' ? 'bg-[#1E1E24] text-white border-[#1E1E24]' : 'bg-white text-[#555] border-[#EAE4DC] hover:bg-[#F5F1EC]'
                    }`}
                  >
                    All Seasons
                  </button>
                  {collectionTypes.map(type => (
                    <button
                      key={type}
                      onClick={() => {
                        setSelectedCollectionType(type);
                        scrollToTop();
                      }}
                      className={`px-2.5 py-1 text-[11px] rounded-lg border transition cursor-pointer ${
                        selectedCollectionType === type ? 'bg-[#8B5E34] text-white border-[#8B5E34]' : 'bg-white text-[#555] border-[#EAE4DC] hover:bg-[#F5F1EC]'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Fabric Filter */}
              <div className="space-y-2 pt-4 border-t border-[#EAE4DC]">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[#222]">Fabric Type</h4>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => {
                      setSelectedFabric('all');
                      scrollToTop();
                    }}
                    className={`px-2.5 py-1 text-[11px] rounded-lg border transition cursor-pointer ${
                      selectedFabric === 'all' ? 'bg-[#9E8055] text-white border-[#9E8055]' : 'bg-white text-[#555] border-[#EAE4DC]'
                    }`}
                  >
                    All Fabrics
                  </button>
                  {fabrics.map(fab => (
                    <button
                      key={fab}
                      onClick={() => {
                        setSelectedFabric(fab);
                        scrollToTop();
                      }}
                      className={`px-2.5 py-1 text-[11px] rounded-lg border transition cursor-pointer ${
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
                    onClick={() => {
                      setSelectedSize('all');
                      scrollToTop();
                    }}
                    className={`px-2.5 py-1 text-[11px] rounded-lg border transition cursor-pointer ${
                      selectedSize === 'all' ? 'bg-[#222] text-white border-[#222]' : 'bg-white text-[#555] border-[#EAE4DC]'
                    }`}
                  >
                    All Sizes
                  </button>
                  {sizes.map(sz => (
                    <button
                      key={sz}
                      onClick={() => {
                        setSelectedSize(sz);
                        scrollToTop();
                      }}
                      className={`px-2.5 py-1 text-[11px] rounded-lg border transition cursor-pointer ${
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
                  onChange={(e) => {
                    setMaxPrice(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="w-full accent-[#9E8055] cursor-pointer"
                />
              </div>

            </aside>

            {/* Right Products Grid & Pagination */}
            <div className="flex-1">
              {filteredProducts.length === 0 ? (
                <div className="bg-white border border-[#EAE4DC] rounded-xl p-16 text-center space-y-4">
                  <Sparkles className="w-10 h-10 text-gray-300 mx-auto" />
                  <h3 className="font-serif text-xl font-semibold text-[#222]">No Products Match Filters</h3>
                  <p className="text-xs text-[#777]">Try clearing your fabric, size, or category filters to view more items.</p>
                  <button
                    onClick={resetFilters}
                    className="px-6 py-2.5 bg-[#222222] text-white text-xs font-semibold uppercase tracking-wider rounded-lg hover:bg-[#9E8055] transition cursor-pointer shadow-sm"
                  >
                    Clear All Filters
                  </button>
                </div>
              ) : (
                <>
                  {/* Dynamic Product Grid */}
                  <div className={getGridClass()}>
                    {paginatedProducts.map(product => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onQuickView={(p) => setQuickViewProduct(p)}
                      />
                    ))}
                  </div>

                  {/* 3. PAGE NUMBERS PAGINATION BAR */}
                  {totalPages > 1 && (
                    <div className="mt-12 pt-8 border-t border-[#EAE4DC] flex flex-col sm:flex-row items-center justify-between gap-4">
                      
                      {/* Summary Text */}
                      <div className="text-xs text-gray-500 font-medium order-2 sm:order-1">
                        Page <strong className="text-[#1E1E24]">{currentPage}</strong> of <strong className="text-[#1E1E24]">{totalPages}</strong> ({filteredProducts.length} total products)
                      </div>

                      {/* Numbered Page Buttons */}
                      <nav className="flex items-center gap-1.5 order-1 sm:order-2" aria-label="Pagination">
                        
                        {/* First Page */}
                        <button
                          onClick={() => handlePageChange(1)}
                          disabled={currentPage === 1}
                          className="p-2 rounded-lg border border-[#EAE4DC] text-[#222] hover:bg-[#F5F1EC] disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
                          aria-label="First page"
                          title="First page"
                        >
                          <ChevronsLeft className="w-4 h-4" />
                        </button>

                        {/* Previous Page */}
                        <button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="p-2 rounded-lg border border-[#EAE4DC] text-[#222] hover:bg-[#F5F1EC] disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
                          aria-label="Previous page"
                          title="Previous page"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>

                        {/* Numbered Buttons */}
                        {pageNumbers.map((page, pIdx) => {
                          if (page === '...') {
                            return (
                              <span key={`ellipsis-${pIdx}`} className="px-2 text-xs text-gray-400 font-bold select-none">
                                ...
                              </span>
                            );
                          }

                          const pageNum = Number(page);
                          const isActive = pageNum === currentPage;

                          return (
                            <button
                              key={`page-${pageNum}`}
                              onClick={() => handlePageChange(pageNum)}
                              className={`min-w-[36px] h-9 px-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                isActive
                                  ? 'bg-[#1E1E24] text-white shadow-sm border border-[#1E1E24]'
                                  : 'bg-white text-[#444] border border-[#EAE4DC] hover:bg-[#FAF8F5] hover:border-[#8B5E34] hover:text-[#1E1E24]'
                              }`}
                              aria-current={isActive ? 'page' : undefined}
                            >
                              {pageNum}
                            </button>
                          );
                        })}

                        {/* Next Page */}
                        <button
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="p-2 rounded-lg border border-[#EAE4DC] text-[#222] hover:bg-[#F5F1EC] disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
                          aria-label="Next page"
                          title="Next page"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>

                        {/* Last Page */}
                        <button
                          onClick={() => handlePageChange(totalPages)}
                          disabled={currentPage === totalPages}
                          className="p-2 rounded-lg border border-[#EAE4DC] text-[#222] hover:bg-[#F5F1EC] disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
                          aria-label="Last page"
                          title="Last page"
                        >
                          <ChevronsRight className="w-4 h-4" />
                        </button>

                      </nav>

                    </div>
                  )}
                </>
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
