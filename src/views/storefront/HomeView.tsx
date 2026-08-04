import React from 'react';
import { AnnouncementBar } from '../../components/storefront/AnnouncementBar';
import { Header } from '../../components/storefront/Header';
import { HeroBanner } from '../../components/storefront/HeroBanner';
import { EinkaShowcaseSlider } from '../../components/storefront/EinkaShowcaseSlider';
import { DualEditorialFeature } from '../../components/storefront/DualEditorialFeature';
import { ChikankariEditorial } from '../../components/storefront/ChikankariEditorial';
import { CustomerReviews } from '../../components/storefront/CustomerReviews';
import { Footer } from '../../components/storefront/Footer';
import { CartDrawer } from '../../components/storefront/CartDrawer';
import { SearchOverlay } from '../../components/storefront/SearchOverlay';

export const HomeView: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA]">
      <AnnouncementBar />
      <Header />
      <main className="flex-1">
        <HeroBanner />
        <EinkaShowcaseSlider />
        <DualEditorialFeature />
        <ChikankariEditorial />
        <CustomerReviews />
      </main>
      <Footer />
      <CartDrawer />
      <SearchOverlay />
    </div>
  );
};
