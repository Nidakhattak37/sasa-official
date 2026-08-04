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
    currentUser
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const cartItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const navLinks = [
    { label: 'Home', view: 'home', categorySlug: null },
    { label: 'New Arrivals', view: 'shop', categorySlug: 'new-arrivals' },
    { label: 'Pret', view: 'shop', categorySlug: 'pret' },
    { label: 'Luxury Pret', view: 'shop', categorySlug: 'luxury-pret' },
    { label: 'Unstitched', view: 'shop', categorySlug: 'unstitched' },
    { label: 'Sale', view: 'shop', categorySlug: 'sale', badge: 'UP TO 40% OFF' },
    { label: 'Track Order', view: 'track', categorySlug: null },
    { label: 'Contact', view: 'contact', categorySlug: null },
  ];

  const handleNavClick = (view: string, categorySlug: string | null) => {
    setSelectedCategorySlug(categorySlug);
    setCurrentView(view);
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-[#222] hover:text-[#9E8055] transition"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Logo */}
          <div className="flex-1 lg:flex-none text-center lg:text-left">
            <button
              onClick={() => handleNavClick('home', null)}
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
            {navLinks.map((link) => {
              const isActive = currentView === link.view && (link.categorySlug === null || true);
              return (
                <button
                  key={link.label}
                  onClick={() => handleNavClick(link.view, link.categorySlug)}
                  className={`relative text-xs font-medium uppercase tracking-[0.12em] transition-colors py-1 ${
                    isActive ? 'text-[#222222] font-semibold' : 'text-[#555555] hover:text-[#9E8055]'
                  }`}
                >
                  {link.label}
                  {link.badge && (
                    <span className="ml-1.5 px-1.5 py-0.5 text-[9px] font-bold bg-[#D8A48F] text-white rounded-full">
                      {link.badge}
                    </span>
                  )}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 w-full h-[1.5px] bg-[#9E8055] rounded-full" />
                  )}
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

            {/* Switch to Admin Control Panel */}
            <button
              onClick={() => setUserRole('admin')}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-[#222222] hover:bg-[#9E8055] text-white text-[11px] font-bold uppercase tracking-wider rounded-lg transition shadow-sm"
              title="Open Admin Control Panel"
            >
              <Shield className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Admin</span>
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-[#EAE4DC] px-6 py-6 space-y-4 shadow-lg animate-in slide-in-from-top-4 duration-200">
          <div className="flex flex-col space-y-3">
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => handleNavClick(link.view, link.categorySlug)}
                className="text-left text-sm font-medium uppercase tracking-wider py-2 text-[#222222] border-b border-[#F2F2F2] flex items-center justify-between"
              >
                <span>{link.label}</span>
                {link.badge && (
                  <span className="text-[10px] bg-[#D8A48F] text-white font-bold px-2 py-0.5 rounded-full">
                    {link.badge}
                  </span>
                )}
              </button>
            ))}
            
            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={() => {
                  setUserRole('admin');
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2.5 bg-[#222] text-white text-xs font-semibold rounded uppercase tracking-wider text-center flex items-center justify-center gap-2"
              >
                <Shield className="w-4 h-4 text-[#D4AF37]" />
                <span>Admin Sign In / Control Panel</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
