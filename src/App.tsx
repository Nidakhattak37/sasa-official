import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { HomeView } from './views/storefront/HomeView';
import { ShopView } from './views/storefront/ShopView';
import { ProductDetailView } from './views/storefront/ProductDetailView';
import { CartView } from './views/storefront/CartView';
import { CheckoutView } from './views/storefront/CheckoutView';
import { OrderConfirmationView } from './views/storefront/OrderConfirmationView';
import { TrackOrderView } from './views/storefront/TrackOrderView';
import { AccountView } from './views/storefront/AccountView';
import { CMSPageView } from './views/storefront/CMSPageView';
import { AdminLayout } from './views/admin/AdminLayout';
import { AdminAuthView } from './views/admin/AdminAuthView';
import { CustomerAuthModal } from './components/storefront/CustomerAuthModal';

const AppContent: React.FC = () => {
  const { userRole, isAdminAuthenticated, currentView } = useApp();

  if (userRole === 'admin') {
    if (!isAdminAuthenticated) {
      return <AdminAuthView />;
    }
    return <AdminLayout />;
  }

  const renderView = () => {
    switch (currentView) {
      case 'home':
        return <HomeView />;
      case 'shop':
        return <ShopView />;
      case 'product-detail':
        return <ProductDetailView />;
      case 'cart':
        return <CartView />;
      case 'checkout':
        return <CheckoutView />;
      case 'confirmation':
        return <OrderConfirmationView />;
      case 'track':
        return <TrackOrderView />;
      case 'account':
        return <AccountView />;
      case 'about':
      case 'shipping-policy':
      case 'refund-policy':
      case 'faqs':
      case 'contact':
      case 'privacy-policy':
      case 'terms':
        return <CMSPageView />;
      default:
        return <HomeView />;
    }
  };

  return (
    <>
      {renderView()}
      <CustomerAuthModal />
    </>
  );
};

export function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
