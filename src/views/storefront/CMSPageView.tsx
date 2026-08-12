import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AnnouncementBar } from '../../components/storefront/AnnouncementBar';
import { Header } from '../../components/storefront/Header';
import { Footer } from '../../components/storefront/Footer';
import { Mail, Phone, MapPin, CheckCircle, Instagram, ExternalLink } from 'lucide-react';

export const CMSPageView: React.FC = () => {
  const { currentView, selectedCMSPageSlug, cmsPages, settings } = useApp();

  const instagramUrl = settings.instagramUrl || 'https://www.instagram.com/sasaofficial.pk?igsh=MXhhZmJwNzR1M3FucA==';

  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMsg, setContactMsg] = useState('');
  const [sentSuccess, setSentSuccess] = useState(false);

  const activeSlug = selectedCMSPageSlug || (currentView === 'contact' ? 'contact' : currentView);
  const foundPage = cmsPages.find(p => p.slug === activeSlug);

  const pageData = foundPage || {
    title: activeSlug === 'contact' ? 'Contact SASA Official' : activeSlug === 'about' ? 'About SASA Official' : activeSlug === 'privacy-policy' ? 'Privacy Policy' : activeSlug === 'terms' ? 'Terms & Conditions' : activeSlug === 'shipping-policy' ? 'Shipping Policy' : 'Store Information',
    content: 'Welcome to SASA Official luxury fashion portal. Handcrafted haute couture, unstitched lawn, and luxury formals.'
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSentSuccess(true);
    setContactName('');
    setContactEmail('');
    setContactMsg('');
    setTimeout(() => setSentSuccess(false), 4000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <AnnouncementBar />
      <Header />

      <main className="flex-1 py-12">
        <div className="max-w-4xl mx-auto px-4">
          
          <div className="bg-white border border-[#EAE4DC] rounded-xl p-8 sm:p-12 shadow-sm space-y-8">
            
            {/* Title Header */}
            <div className="border-b border-[#EAE4DC] pb-6">
              <span className="text-xs uppercase tracking-[0.25em] font-semibold text-[#9E8055]">
                SASA Privé Information
              </span>
              <h1 className="font-serif text-3xl sm:text-4xl font-normal text-[#222222] mt-1">
                {pageData.title}
              </h1>
            </div>

            {/* Content Body */}
            <div className="text-xs sm:text-sm text-[#444444] leading-relaxed space-y-4 whitespace-pre-line">
              {pageData.content}
            </div>

            {/* Special Contact Form & Flagship Store Info if on Contact page */}
            {currentView === 'contact' && (
              <div className="pt-8 border-t border-[#EAE4DC] space-y-8">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 text-xs bg-[#FAF8F5] p-6 rounded-xl border border-[#EAE4DC] shadow-2xs">
                  <div className="space-y-1">
                    <MapPin className="w-5 h-5 text-[#9E8055]" />
                    <strong className="block text-[#222]">Flagship Boutique:</strong>
                    <p className="text-gray-600">{settings.address}</p>
                  </div>

                  <div className="space-y-1">
                    <Phone className="w-5 h-5 text-[#9E8055]" />
                    <strong className="block text-[#222]">Helpline & WhatsApp:</strong>
                    <p className="text-gray-600">{settings.phone}</p>
                  </div>

                  <div className="space-y-1">
                    <Mail className="w-5 h-5 text-[#9E8055]" />
                    <strong className="block text-[#222]">Customer Care Email:</strong>
                    <p className="text-gray-600">{settings.email}</p>
                  </div>

                  <div className="space-y-1">
                    <Instagram className="w-5 h-5 text-[#D4AF37]" />
                    <strong className="block text-[#222]">Official Instagram:</strong>
                    <a
                      href={instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#9E8055] hover:text-[#222] font-semibold flex items-center gap-1 transition-colors"
                      id="contact-instagram-link"
                    >
                      @sasaofficial.pk
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                {/* Contact Form */}
                <div className="space-y-4">
                  <h3 className="font-serif text-xl font-bold text-[#222]">Send Us a Direct Message</h3>

                  {sentSuccess ? (
                    <div className="p-4 bg-green-50 text-green-800 text-xs font-semibold rounded border border-green-200 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Message sent successfully! Our client desk will reply to your email within 2 hours.
                    </div>
                  ) : (
                    <form onSubmit={handleContactSubmit} className="space-y-4 text-xs">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block font-semibold mb-1 text-[#222]">Your Name *</label>
                          <input
                            type="text"
                            required
                            value={contactName}
                            onChange={(e) => setContactName(e.target.value)}
                            className="w-full px-3 py-2 bg-[#FAFAFA] border border-[#EAE4DC] rounded"
                          />
                        </div>
                        <div>
                          <label className="block font-semibold mb-1 text-[#222]">Email Address *</label>
                          <input
                            type="email"
                            required
                            value={contactEmail}
                            onChange={(e) => setContactEmail(e.target.value)}
                            className="w-full px-3 py-2 bg-[#FAFAFA] border border-[#EAE4DC] rounded"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block font-semibold mb-1 text-[#222]">Message / Inquiry Details *</label>
                        <textarea
                          rows={4}
                          required
                          value={contactMsg}
                          onChange={(e) => setContactMsg(e.target.value)}
                          placeholder="How can SASA Customer Care assist you today?"
                          className="w-full px-3 py-2 bg-[#FAFAFA] border border-[#EAE4DC] rounded"
                        />
                      </div>

                      <button
                        type="submit"
                        className="px-8 py-3 bg-[#222222] text-white font-semibold uppercase tracking-wider rounded hover:bg-[#9E8055] transition"
                      >
                        Submit Inquiry
                      </button>
                    </form>
                  )}
                </div>

              </div>
            )}

          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};
