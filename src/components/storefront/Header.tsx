import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Search, Heart, ShoppingBag, User, Menu, X, Shield } from 'lucide-react';

export const Header: React.FC = () => {
  const {
    currentView, setCurrentView,
    setSelectedCategorySlug,
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

  // Dynamic menu items from database / admin configuration
  const activeMenuItems = (menuItems && menuItems.length > 0) ? menuItems : [
    { id: 'm-1', label: 'Home', targetType: 'view', targetValue: 'home' },
    { id: 'm-2', label: 'New Arrivals', targetType: 'category', targetValue: 'new-arrivals' },
    { id: 'm-3', label: 'Pret', targetType: 'category', targetValue: 'pret' },
    { id: 'm-4', label: 'Unstitched', targetType: 'category', targetValue: 'unstitched' },
    { id: 'm-5', label: 'Contact', targetType: 'view', targetValue: 'contact' },
  ];

  const handleMenuItemClick = (item: { targetType: string; targetValue: string }) => {
    if (item.targetType === 'category') {
      setSelectedCategorySlug(item.targetValue);
      setCurrentView('shop');
    } else if (item.targetType === 'view') {
      setSelectedCategorySlug(null);
      setCurrentView(item.targetValue);
    } else if (item.targetType === 'page') {
      setSelectedCategorySlug(null);
      setCurrentView('cms-page');
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
              return (
                <button
                  key={item.id}
                  onClick={() => handleMenuItemClick(item)}
                  className="relative text-xs font-medium uppercase tracking-[0.12em] text-[#444444] hover:text-[#9E8055] transition-colors py-1 group"
                >
                  {item.label}
                  <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-[#9E8055] transition-all duration-300 group-hover:w-full" />
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
            {activeMenuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleMenuItemClick(item)}
                className="text-left text-sm font-medium uppercase tracking-wider py-2.5 text-[#222222] border-b border-[#F2F2F2] flex items-center justify-between hover:text-[#9E8055] transition"
              >
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};
