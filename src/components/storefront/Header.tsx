import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Search, Heart, ShoppingBag, User, Menu, X, Shield } from 'lucide-react';

export const Header: React.FC = () => {
  const {
    currentView, setCurrentView,
    setSelectedCategorySlug,
    setSelectedSubcategory,
    setSelectedCollectionName,
    setSelectedCustomProductIds,
    setSelectedCMSPageSlug,
    setActiveMenuFilterTitle,
    setIsSearchOpen,
    setIsCartDrawerOpen,
    cart, wishlist,
    userRole, setUserRole,
    isCustomerAuthenticated, setIsCustomerAuthModalOpen,
    currentUser,
    menuItems
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const cartItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Dynamic menu items sorted by sortOrder, filtering out inactive items
  const activeMenuItems = (menuItems && menuItems.length > 0) 
    ? menuItems.filter(i => i.isActive !== false).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
    : [
        { id: 'm-1', label: 'Home', targetType: 'view', targetValue: 'home', isActive: true, sortOrder: 1 },
        { id: 'm-2', label: 'New Arrivals', targetType: 'category', targetValue: 'new-arrivals', categorySlug: 'new-arrivals', isActive: true, sortOrder: 2 },
        { id: 'm-3', label: 'Pret', targetType: 'category', targetValue: 'pret', categorySlug: 'pret', isActive: true, sortOrder: 3 },
        { id: 'm-4', label: 'Unstitched', targetType: 'category', targetValue: 'unstitched', categorySlug: 'unstitched', isActive: true, sortOrder: 4 },
        { id: 'm-5', label: 'Sale', targetType: 'sale', targetValue: 'sale', isActive: true, sortOrder: 5, isBold: true, color: '#DC2626', badgeText: 'SALE', badgeColor: '#DC2626' },
        { id: 'm-6', label: 'Contact', targetType: 'view', targetValue: 'contact', isActive: true, sortOrder: 6 },
      ];

  const handleMenuItemClick = (item: any) => {
    // Clear previous specific filters
    setSelectedSubcategory(null);
    setSelectedCollectionName(null);
    setSelectedCustomProductIds(null);
    setSelectedCMSPageSlug(null);
    setActiveMenuFilterTitle(item.label || item.name || null);

    const type = item.targetType;

    if (type === 'category') {
      const slug = item.categorySlug || item.targetSlug || item.targetValue || 'all';
      setSelectedCategorySlug(slug);
      setCurrentView('shop');
    } else if (type === 'subcategory') {
      const catSlug = item.categorySlug || 'all';
      const subName = item.subcategoryName || item.targetSlug || item.targetValue;
      setSelectedCategorySlug(catSlug);
      setSelectedSubcategory(subName);
      setCurrentView('shop');
    } else if (type === 'sale') {
      setSelectedCategorySlug('sale');
      setCurrentView('shop');
    } else if (type === 'collection') {
      setSelectedCategorySlug('collection');
      setSelectedCollectionName(item.collectionName || item.targetSlug || item.targetValue);
      if (item.productIds && item.productIds.length > 0) {
        setSelectedCustomProductIds(item.productIds);
      }
      setCurrentView('shop');
    } else if (type === 'page') {
      const pageSlug = item.pageSlug || item.targetSlug || item.targetValue;
      setSelectedCMSPageSlug(pageSlug);
      setCurrentView('cms-page');
    } else if (type === 'custom') {
      const target = item.url || item.targetValue;
      if (target && (target.startsWith('http://') || target.startsWith('https://'))) {
        window.open(target, item.isNewTab ? '_blank' : '_self');
      } else if (target && (target.startsWith('/') || target.includes('-'))) {
        const cleanSlug = target.replace(/^\//, '');
        if (['contact', 'about', 'faqs', 'privacy-policy', 'terms', 'shipping-policy', 'refund-policy'].includes(cleanSlug)) {
          setSelectedCMSPageSlug(cleanSlug);
          setCurrentView(cleanSlug === 'contact' ? 'contact' : 'cms-page');
        } else {
          setSelectedCategorySlug(cleanSlug);
          setCurrentView('shop');
        }
      } else {
        setSelectedCategorySlug(null);
        setCurrentView('shop');
      }
    } else if (type === 'view') {
      setSelectedCategorySlug(null);
      setCurrentView(item.targetValue || 'home');
    } else {
      setSelectedCategorySlug(null);
      setCurrentView('shop');
    }

    setMobileMenuOpen(false);
  };

  const handleUserIconClick = () => {
    if (isCustomerAuthenticated) {
      setCurrentView('account');
    } else {
      setIsCustomerAuthModalOpen(true);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#EAE4DC] transition-all">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-[#222] hover:text-[#9E8055] transition rounded-lg"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Logo */}
          <div className="flex-1 lg:flex-none text-center lg:text-left">
            <button
              onClick={() => { setSelectedCategorySlug(null); setCurrentView('home'); }}
              className="inline-block group text-left"
            >
              <span className="font-serif text-2xl sm:text-3xl tracking-[0.2em] font-bold text-[#222222] uppercase group-hover:text-[#9E8055] transition">
                SASA
              </span>
              <span className="block text-[9px] tracking-[0.35em] text-[#888888] font-sans font-medium uppercase -mt-1">
                OFFICIAL
              </span>
            </button>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-7">
            {activeMenuItems.map((item) => {
              const isItemBold = !!item.isBold;
              const customColor = item.color;
              const hasCustomColor = !!customColor && customColor.trim() !== '';

              return (
                <button
                  key={item.id}
                  onClick={() => handleMenuItemClick(item)}
                  style={hasCustomColor ? { color: customColor } : undefined}
                  className={`relative text-xs uppercase tracking-[0.12em] transition-all py-1 group inline-flex items-center gap-1.5 ${
                    isItemBold ? 'font-bold' : 'font-medium'
                  } ${!hasCustomColor ? 'text-[#444444] hover:text-[#9E8055]' : 'hover:opacity-80'}`}
                >
                  <span>{item.label}</span>
                  {item.badgeText && (
                    <span
                      className="px-1.5 py-0.5 text-[8.5px] font-extrabold rounded tracking-wider leading-none shadow-2xs"
                      style={{
                        backgroundColor: item.badgeColor || (hasCustomColor ? customColor : '#E53E3E'),
                        color: '#FFFFFF'
                      }}
                    >
                      {item.badgeText}
                    </span>
                  )}
                  <span
                    className="absolute bottom-0 left-0 w-0 h-[1.5px] transition-all duration-300 group-hover:w-full"
                    style={{ backgroundColor: hasCustomColor ? customColor : '#9E8055' }}
                  />
                </button>
              );
            })}
          </nav>

          {/* Right Icons */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Search Icon */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2 text-[#222222] hover:text-[#9E8055] transition rounded-full hover:bg-[#F5F1EC]"
              title="Search Products"
            >
              <Search className="w-5 h-5 stroke-[1.75]" />
            </button>

            {/* Wishlist Icon */}
            <button
              onClick={() => setCurrentView('wishlist')}
              className="relative p-2 text-[#222222] hover:text-[#9E8055] transition rounded-full hover:bg-[#F5F1EC]"
              title="Wishlist"
            >
              <Heart className="w-5 h-5 stroke-[1.75]" />
              {wishlist.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 text-[10px] font-bold bg-[#D8A48F] text-white rounded-full flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Customer Account / Sign In Icon */}
            <button
              onClick={handleUserIconClick}
              className="p-2 text-[#222222] hover:text-[#9E8055] transition rounded-full hover:bg-[#F5F1EC] flex items-center gap-1.5"
              title={isCustomerAuthenticated ? `Signed in as ${currentUser?.name || 'Customer'}` : 'Customer Sign In'}
            >
              <User className="w-5 h-5 stroke-[1.75]" />
              {isCustomerAuthenticated && (
                <span className="text-[10px] font-bold text-[#222] hidden md:inline max-w-[80px] truncate">
                  {currentUser?.name?.split(' ')[0]}
                </span>
              )}
            </button>

            {/* Cart Icon */}
            <button
              onClick={() => setIsCartDrawerOpen(true)}
              className="relative p-2 text-[#222222] hover:text-[#9E8055] transition rounded-full hover:bg-[#F5F1EC]"
              title="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5 stroke-[1.75]" />
              {cartItemsCount > 0 && (
                <span className="absolute top-1 right-1 w-4.5 h-4.5 text-[10px] font-bold bg-[#222222] text-[#F5F1EC] rounded-full flex items-center justify-center animate-pulse">
                  {cartItemsCount}
                </span>
              )}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-[#EAE4DC] px-6 py-6 space-y-4 shadow-lg">
          <div className="flex flex-col space-y-2">
            {activeMenuItems.map((item) => {
              const isItemBold = !!item.isBold;
              const customColor = item.color;
              const hasCustomColor = !!customColor && customColor.trim() !== '';

              return (
                <button
                  key={item.id}
                  onClick={() => handleMenuItemClick(item)}
                  style={hasCustomColor ? { color: customColor } : undefined}
                  className={`text-left text-sm uppercase tracking-wider py-2.5 border-b border-[#F2F2F2] flex items-center justify-between transition ${
                    isItemBold ? 'font-bold' : 'font-medium'
                  } ${!hasCustomColor ? 'text-[#222222] hover:text-[#9E8055]' : 'hover:opacity-80'}`}
                >
                  <span className="flex items-center gap-2">
                    <span>{item.label}</span>
                    {item.badgeText && (
                      <span
                        className="px-1.5 py-0.5 text-[9px] font-extrabold rounded tracking-wider leading-none"
                        style={{
                          backgroundColor: item.badgeColor || (hasCustomColor ? customColor : '#E53E3E'),
                          color: '#FFFFFF'
                        }}
                      >
                        {item.badgeText}
                      </span>
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
};
