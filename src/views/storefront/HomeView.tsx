import React from 'react';
import { AnnouncementBar } from '../../components/storefront/AnnouncementBar';
import { Header } from '../../components/storefront/Header';
import { HeroBanner } from '../../components/storefront/HeroBanner';
import { FeaturedCategories } from '../../components/storefront/FeaturedCategories';
import { BestSellers } from '../../components/storefront/BestSellers';
import { NewArrivalsSlider } from '../../components/storefront/NewArrivalsSlider';
import { WhyChooseSASA } from '../../components/storefront/WhyChooseSASA';
import { CustomerReviews } from '../../components/storefront/CustomerReviews';
import { InstagramGallery } from '../../components/storefront/InstagramGallery';
import { Newsletter } from '../../components/storefront/Newsletter';
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
        <FeaturedCategories />
        <BestSellers />
        <NewArrivalsSlider />
        <WhyChooseSASA />
        <CustomerReviews />
        <InstagramGallery />
        <Newsletter />
      </main>
      <Footer />
      <CartDrawer />
      <SearchOverlay />
    </div>
  );
};
