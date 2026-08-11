import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { uploadImageFile } from '../../utils/imageStorage';
import {
  Plus, Trash2, Image as ImageIcon, X, Upload, Save, CheckCircle, Sparkles, LayoutGrid, Layers, HardDrive, Database
} from 'lucide-react';
import { InstantClassicsSection, DualEditorialSection } from '../../types';

export const AdminBanners: React.FC = () => {
  const {
    banners, addBanner, deleteBanner, categories,
    instantClassics, updateInstantClassics,
    dualEditorial, updateDualEditorial
  } = useApp();

  const [activeTab, setActiveTab] = useState<'hero' | 'instant' | 'dual'>('instant');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Hero Banner state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [ctaText, setCtaText] = useState('Explore Collection');
  const [ctaLink, setCtaLink] = useState('shop');
  const [imageUrl, setImageUrl] = useState('');

  // Instant Classics local edit state
  const [icData, setIcData] = useState<InstantClassicsSection>({ ...instantClassics });

  // Dual Editorial local edit state
  const [deData, setDeData] = useState<DualEditorialSection>({
    left: { ...dualEditorial.left },
    right: { ...dualEditorial.right }
  });

  const triggerToast = (msg: string) => {
    setSaveSuccessMsg(msg);
    setTimeout(() => setSaveSuccessMsg(null), 3500);
  };

  const handleHeroFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const linkUrl = await uploadImageFile(file, 'banner_hero');
    if (linkUrl) setImageUrl(linkUrl);
  };

  const handleInstantFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const linkUrl = await uploadImageFile(file, 'banner_instant');
    if (linkUrl) setIcData(prev => ({ ...prev, imageUrl: linkUrl }));
  };

  const handleDualLeftFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const linkUrl = await uploadImageFile(file, 'banner_dual_left');
    if (linkUrl) setDeData(prev => ({ ...prev, left: { ...prev.left, imageUrl: linkUrl } }));
  };

  const handleDualRightFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const linkUrl = await uploadImageFile(file, 'banner_dual_right');
    if (linkUrl) setDeData(prev => ({ ...prev, right: { ...prev.right, imageUrl: linkUrl } }));
  };

  const handleCreateHero = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !imageUrl) return;
    addBanner({
      title,
      subtitle,
      ctaText,
      ctaLink,
      imageUrl,
      isActive: true
    });
    setIsModalOpen(false);
    setTitle('');
    setSubtitle('');
    setImageUrl('');
    triggerToast('Hero slide added successfully!');
  };

  const handleSaveInstantClassics = (e: React.FormEvent) => {
    e.preventDefault();
    updateInstantClassics(icData);
    triggerToast('Instant Classics section updated and published live!');
  };

  const handleSaveDualEditorial = (e: React.FormEvent) => {
    e.preventDefault();
    updateDualEditorial(deData);
    triggerToast('2 Big Images section updated and published live!');
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-[#EAE4DC] pb-4 gap-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-[#222]">Homepage Editorial & Banner Manager</h2>
          <p className="text-xs text-gray-500">Edit hero banners, Instant Classics section, and the 2 Big Full-Screen showcase cards.</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex bg-[#EAE4DC]/50 p-1 rounded-xl gap-1">
          <button
            onClick={() => setActiveTab('instant')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition flex items-center gap-1.5 ${
              activeTab === 'instant'
                ? 'bg-[#222222] text-white shadow-sm'
                : 'text-gray-700 hover:text-black'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Instant Classics</span>
          </button>

          <button
            onClick={() => setActiveTab('dual')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition flex items-center gap-1.5 ${
              activeTab === 'dual'
                ? 'bg-[#222222] text-white shadow-sm'
                : 'text-gray-700 hover:text-black'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>2 Big Images Section</span>
          </button>

          <button
            onClick={() => setActiveTab('hero')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition flex items-center gap-1.5 ${
              activeTab === 'hero'
                ? 'bg-[#222222] text-white shadow-sm'
                : 'text-gray-700 hover:text-black'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Hero Slider ({banners.length})</span>
          </button>
        </div>
      </div>

      {/* Global Success Banner */}
      {saveSuccessMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* TAB 1: Instant Classics Editor */}
      {activeTab === 'instant' && (
        <div className="bg-white border border-[#EAE4DC] rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="border-b pb-4 flex justify-between items-center">
            <div>
              <h3 className="font-serif text-lg font-bold text-[#222]">Instant Classics Section Details</h3>
              <p className="text-xs text-gray-500">Update the editorial headline, description paragraph, background photo, and shop link for the Instant Classics section on the homepage.</p>
            </div>
            <span className="px-3 py-1 bg-amber-50 text-[#8B5E34] border border-amber-200 text-[10px] font-bold uppercase tracking-wider rounded-full">
              Homepage Live Section
            </span>
          </div>

          <form onSubmit={handleSaveInstantClassics} className="space-y-6 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Left Column Inputs */}
              <div className="space-y-4">
                <div>
                  <label className="block font-semibold mb-1 text-[#222]">Eyebrow Tag / Badge</label>
                  <input
                    type="text"
                    required
                    value={icData.tag}
                    onChange={(e) => setIcData({ ...icData, tag: e.target.value })}
                    placeholder="e.g. Instant classics"
                    className="w-full px-3.5 py-2.5 border rounded-lg focus:outline-none focus:border-[#9E8055]"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-[#222]">Section Heading Title</label>
                  <input
                    type="text"
                    required
                    value={icData.title}
                    onChange={(e) => setIcData({ ...icData, title: e.target.value })}
                    placeholder="e.g. Pakistan's Favorite Chikankari, Almost Gone"
                    className="w-full px-3.5 py-2.5 border rounded-lg focus:outline-none focus:border-[#9E8055] font-serif text-sm font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-[#222]">Description Paragraph</label>
                  <textarea
                    rows={4}
                    required
                    value={icData.description}
                    onChange={(e) => setIcData({ ...icData, description: e.target.value })}
                    placeholder="Describe the collection or campaign story..."
                    className="w-full px-3.5 py-2.5 border rounded-lg focus:outline-none focus:border-[#9E8055]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1 text-[#222]">Button Text</label>
                    <input
                      type="text"
                      required
                      value={icData.buttonText}
                      onChange={(e) => setIcData({ ...icData, buttonText: e.target.value })}
                      placeholder="e.g. Shop Now"
                      className="w-full px-3.5 py-2.5 border rounded-lg focus:outline-none focus:border-[#9E8055]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-[#222]">Target Category Slug</label>
                    <select
                      value={icData.categorySlug}
                      onChange={(e) => setIcData({ ...icData, categorySlug: e.target.value })}
                      className="w-full px-3.5 py-2.5 border rounded-lg focus:outline-none focus:border-[#9E8055]"
                    >
                      <option value="">All Shop Products</option>
                      {categories.map(c => (
                        <option key={c.id} value={c.slug}>{c.name} ({c.slug})</option>
                      ))}
                      <option value="unstitched">Unstitched</option>
                      <option value="pret">Pret</option>
                      <option value="luxury-pret">Luxury Pret</option>
                      <option value="festive">Festive</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Right Column Image & Live Card Preview */}
              <div className="space-y-4">
                <label className="block font-semibold text-[#222]">Section Image (Upload or URL)</label>
                
                <div className="border-2 border-dashed border-[#8B5E34]/30 bg-[#FAF8F5] rounded-xl p-4 text-center hover:border-[#8B5E34] transition cursor-pointer relative group">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleInstantFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="flex flex-col items-center justify-center gap-1.5 text-gray-600">
                    <Upload className="w-5 h-5 text-[#8B5E34]" />
                    <span className="font-bold text-xs text-[#222]">Click to upload Instant Classics photo from device</span>
                    <span className="text-[10px] text-gray-400">Supports JPG, PNG, WEBP</span>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-gray-500 mb-1">Or Direct Image URL</label>
                  <input
                    type="text"
                    value={icData.imageUrl}
                    onChange={(e) => setIcData({ ...icData, imageUrl: e.target.value })}
                    placeholder="/images/sky_blue_chikankari.jpg"
                    className="w-full px-3.5 py-2 border rounded-lg text-xs"
                  />
                </div>

                {/* Live Card Preview */}
                <div className="border rounded-xl p-4 bg-gray-50 space-y-2">
                  <span className="text-[10px] uppercase font-bold text-gray-400">Live Photo Preview</span>
                  <div className="relative aspect-[4/3] rounded-lg overflow-hidden border bg-gray-200">
                    <img
                      src={icData.imageUrl || "/images/sky_blue_chikankari.jpg"}
                      alt="Instant Classics Preview"
                      className="w-full h-full object-cover object-center"
                    />
                  </div>
                </div>
              </div>

            </div>

            <div className="pt-4 border-t flex justify-end">
              <button
                type="submit"
                className="px-8 py-3 bg-[#222222] hover:bg-[#8B5E34] text-white font-bold text-xs uppercase tracking-widest rounded-xl transition shadow-lg flex items-center gap-2"
              >
                <Save className="w-4 h-4" /> Save Instant Classics Section
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: 2 Big Images Section Editor */}
      {activeTab === 'dual' && (
        <div className="bg-white border border-[#EAE4DC] rounded-2xl p-6 sm:p-8 shadow-sm space-y-8">
          <div className="border-b pb-4 flex justify-between items-center">
            <div>
              <h3 className="font-serif text-lg font-bold text-[#222]">2 Big Images Full-Screen Section Details</h3>
              <p className="text-xs text-gray-500">Edit left and right campaign imagery, badges, title overlays, and button targets for the 2 big split section.</p>
            </div>
            <span className="px-3 py-1 bg-[#1E1E24] text-[#D4AF37] border border-[#D4AF37]/40 text-[10px] font-bold uppercase tracking-wider rounded-full">
              Full-Screen Split View
            </span>
          </div>

          <form onSubmit={handleSaveDualEditorial} className="space-y-8 text-xs">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 divide-y lg:divide-y-0 lg:divide-x divide-gray-200">
              
              {/* Left Image Card Form */}
              <div className="space-y-4 lg:pr-6">
                <div className="flex items-center justify-between">
                  <span className="font-serif font-bold text-sm text-[#8B5E34]">LEFT IMAGE CARD</span>
                  <span className="text-[10px] bg-amber-50 text-amber-800 font-bold px-2 py-0.5 rounded border border-amber-200">Card 1</span>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-[#222]">Top Badge Text</label>
                  <input
                    type="text"
                    value={deData.left.badge}
                    onChange={(e) => setDeData({ ...deData, left: { ...deData.left, badge: e.target.value } })}
                    placeholder="e.g. Summer Lawn Edit"
                    className="w-full px-3.5 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-[#222]">Top Subtitle / Tag</label>
                  <input
                    type="text"
                    value={deData.left.subtitle}
                    onChange={(e) => setDeData({ ...deData, left: { ...deData.left, subtitle: e.target.value } })}
                    placeholder="e.g. New Arrival 2026"
                    className="w-full px-3.5 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-[#222]">Eyebrow Label</label>
                  <input
                    type="text"
                    value={deData.left.eyebrow}
                    onChange={(e) => setDeData({ ...deData, left: { ...deData.left, eyebrow: e.target.value } })}
                    placeholder="e.g. Chikankari Luxury"
                    className="w-full px-3.5 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-[#222]">Main Headline Title</label>
                  <input
                    type="text"
                    required
                    value={deData.left.title}
                    onChange={(e) => setDeData({ ...deData, left: { ...deData.left, title: e.target.value } })}
                    placeholder="e.g. Pure Chikankari Lawn"
                    className="w-full px-3.5 py-2 border rounded-lg font-serif font-bold text-sm"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-[#222]">Description</label>
                  <textarea
                    rows={3}
                    value={deData.left.description}
                    onChange={(e) => setDeData({ ...deData, left: { ...deData.left, description: e.target.value } })}
                    placeholder="Brief detail line..."
                    className="w-full px-3.5 py-2 border rounded-lg"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1 text-[#222]">Button Text</label>
                    <input
                      type="text"
                      value={deData.left.buttonText}
                      onChange={(e) => setDeData({ ...deData, left: { ...deData.left, buttonText: e.target.value } })}
                      placeholder="e.g. Explore Summer Lawn"
                      className="w-full px-3.5 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1 text-[#222]">Category Link</label>
                    <select
                      value={deData.left.categorySlug}
                      onChange={(e) => setDeData({ ...deData, left: { ...deData.left, categorySlug: e.target.value } })}
                      className="w-full px-3.5 py-2 border rounded-lg"
                    >
                      <option value="unstitched">Unstitched</option>
                      <option value="pret">Pret</option>
                      <option value="luxury-pret">Luxury Pret</option>
                      <option value="festive">Festive</option>
                    </select>
                  </div>
                </div>

                {/* Left Card Photo Upload */}
                <div className="space-y-2 pt-2 border-t">
                  <label className="block font-semibold text-[#222]">Left Card Image (Upload or URL)</label>
                  <div className="border border-dashed border-gray-300 rounded-lg p-3 bg-gray-50 text-center hover:border-black transition cursor-pointer relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleDualLeftFileUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="flex items-center justify-center gap-2 text-gray-600">
                      <Upload className="w-4 h-4 text-[#8B5E34]" />
                      <span className="font-semibold text-xs">Upload Left Image</span>
                    </div>
                  </div>
                  <input
                    type="text"
                    value={deData.left.imageUrl}
                    onChange={(e) => setDeData({ ...deData, left: { ...deData.left, imageUrl: e.target.value } })}
                    placeholder="/images/sky_blue_chikankari.jpg"
                    className="w-full px-3 py-1.5 border rounded text-xs"
                  />
                  {deData.left.imageUrl && (
                    <div className="relative aspect-[16/9] rounded border overflow-hidden">
                      <img src={deData.left.imageUrl} alt="Left Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>

              {/* Right Image Card Form */}
              <div className="space-y-4 pt-6 lg:pt-0 lg:pl-6">
                <div className="flex items-center justify-between">
                  <span className="font-serif font-bold text-sm text-[#222]">RIGHT IMAGE CARD</span>
                  <span className="text-[10px] bg-gray-100 text-gray-800 font-bold px-2 py-0.5 rounded border border-gray-300">Card 2</span>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-[#222]">Top Badge Text</label>
                  <input
                    type="text"
                    value={deData.right.badge}
                    onChange={(e) => setDeData({ ...deData, right: { ...deData.right, badge: e.target.value } })}
                    placeholder="e.g. Festive Royale"
                    className="w-full px-3.5 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-[#222]">Top Subtitle / Tag</label>
                  <input
                    type="text"
                    value={deData.right.subtitle}
                    onChange={(e) => setDeData({ ...deData, right: { ...deData.right, subtitle: e.target.value } })}
                    placeholder="e.g. ★ Best Seller Suite"
                    className="w-full px-3.5 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-[#222]">Eyebrow Label</label>
                  <input
                    type="text"
                    value={deData.right.eyebrow}
                    onChange={(e) => setDeData({ ...deData, right: { ...deData.right, eyebrow: e.target.value } })}
                    placeholder="e.g. Royal Evening Wear"
                    className="w-full px-3.5 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-[#222]">Main Headline Title</label>
                  <input
                    type="text"
                    required
                    value={deData.right.title}
                    onChange={(e) => setDeData({ ...deData, right: { ...deData.right, title: e.target.value } })}
                    placeholder="e.g. Embroidered Velvet & Silk"
                    className="w-full px-3.5 py-2 border rounded-lg font-serif font-bold text-sm"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-[#222]">Description</label>
                  <textarea
                    rows={3}
                    value={deData.right.description}
                    onChange={(e) => setDeData({ ...deData, right: { ...deData.right, description: e.target.value } })}
                    placeholder="Brief detail line..."
                    className="w-full px-3.5 py-2 border rounded-lg"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1 text-[#222]">Button Text</label>
                    <input
                      type="text"
                      value={deData.right.buttonText}
                      onChange={(e) => setDeData({ ...deData, right: { ...deData.right, buttonText: e.target.value } })}
                      placeholder="e.g. Explore Festive Velvet"
                      className="w-full px-3.5 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1 text-[#222]">Category Link</label>
                    <select
                      value={deData.right.categorySlug}
                      onChange={(e) => setDeData({ ...deData, right: { ...deData.right, categorySlug: e.target.value } })}
                      className="w-full px-3.5 py-2 border rounded-lg"
                    >
                      <option value="luxury-pret">Luxury Pret</option>
                      <option value="festive">Festive</option>
                      <option value="unstitched">Unstitched</option>
                      <option value="pret">Pret</option>
                    </select>
                  </div>
                </div>

                {/* Right Card Photo Upload */}
                <div className="space-y-2 pt-2 border-t">
                  <label className="block font-semibold text-[#222]">Right Card Image (Upload or URL)</label>
                  <div className="border border-dashed border-gray-300 rounded-lg p-3 bg-gray-50 text-center hover:border-black transition cursor-pointer relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleDualRightFileUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="flex items-center justify-center gap-2 text-gray-600">
                      <Upload className="w-4 h-4 text-[#8B5E34]" />
                      <span className="font-semibold text-xs">Upload Right Image</span>
                    </div>
                  </div>
                  <input
                    type="text"
                    value={deData.right.imageUrl}
                    onChange={(e) => setDeData({ ...deData, right: { ...deData.right, imageUrl: e.target.value } })}
                    placeholder="/images/yellow_mustard_suit.jpg"
                    className="w-full px-3 py-1.5 border rounded text-xs"
                  />
                  {deData.right.imageUrl && (
                    <div className="relative aspect-[16/9] rounded border overflow-hidden">
                      <img src={deData.right.imageUrl} alt="Right Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>

            </div>

            <div className="pt-6 border-t flex justify-end">
              <button
                type="submit"
                className="px-8 py-3 bg-[#222222] hover:bg-[#8B5E34] text-white font-bold text-xs uppercase tracking-widest rounded-xl transition shadow-lg flex items-center gap-2"
              >
                <Save className="w-4 h-4" /> Save 2 Big Images Section
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: Hero Slider Manager */}
      {activeTab === 'hero' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-[#EAE4DC]">
            <div>
              <h3 className="font-serif font-bold text-[#222] text-base">Hero Slider Banners</h3>
              <p className="text-xs text-gray-500">Add or manage main sliding banners at the top of the home view.</p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-5 py-2.5 bg-[#222222] text-white text-xs font-semibold uppercase tracking-wider rounded-lg hover:bg-[#9E8055] transition flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add Hero Slide
            </button>
          </div>

          {banners.length === 0 ? (
            <div className="bg-white border border-[#EAE4DC] rounded-2xl p-12 text-center space-y-4">
              <div className="w-16 h-16 bg-[#F5F1EC] text-[#9E8055] rounded-full flex items-center justify-center mx-auto">
                <ImageIcon className="w-8 h-8" />
              </div>
              <h3 className="font-serif text-lg font-bold text-[#222]">No Active Homepage Hero Slides</h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                There are currently no hero slides in your homepage slider. Click "+ Add Hero Slide" below to publish a banner slide or upload photography.
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-6 py-3 bg-[#222222] text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-[#9E8055] transition shadow-lg inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add First Hero Slide
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {banners.map(b => (
                <div key={b.id} className="bg-white border border-[#EAE4DC] rounded-xl overflow-hidden shadow-sm space-y-3">
                  <div className="relative aspect-[16/9] bg-gray-100">
                    <img src={b.imageUrl} alt={b.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex flex-col justify-end p-6 text-white">
                      <span className="text-[10px] uppercase tracking-widest text-[#D4AF37] font-semibold">{b.subtitle}</span>
                      <h3 className="font-serif text-2xl font-bold">{b.title}</h3>
                      <span className="text-xs bg-white/20 backdrop-blur px-3 py-1 rounded w-max mt-2 uppercase font-semibold">
                        {b.ctaText} → /{b.ctaLink}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-[#FAFAFA] border-t border-[#EAE4DC] flex justify-between items-center text-xs">
                    <span className="text-green-700 font-bold bg-green-50 px-2 py-0.5 rounded">ACTIVE HERO SLIDE</span>
                    <button
                      onClick={() => {
                        deleteBanner(b.id);
                        triggerToast('Hero slide removed');
                      }}
                      className="px-3 py-1 bg-red-50 text-red-600 rounded font-semibold hover:bg-red-100"
                    >
                      Delete Slide
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Hero Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-serif text-lg font-bold text-[#222]">Add New Hero Banner</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateHero} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Banner Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Lawn Royale '26 Edit"
                  className="w-full px-3 py-2 border rounded"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Subtitle / Eyebrow</label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="e.g. Unstitched Festive Collection"
                  className="w-full px-3 py-2 border rounded"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Banner Image Upload or Link *</label>
                <div className="space-y-2">
                  <div className="border-2 border-dashed border-[#D4AF37]/50 rounded-lg p-3 bg-white text-center hover:border-[#8B5E34] transition cursor-pointer relative group">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleHeroFileUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="flex items-center justify-center gap-2 text-gray-600">
                      <Upload className="w-4 h-4 text-[#8B5E34]" />
                      <span className="font-semibold text-xs">Click to upload banner photo from device</span>
                    </div>
                  </div>

                  <input
                    type="text"
                    required
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="Or paste image URL"
                    className="w-full px-3 py-2 border rounded text-xs"
                  />

                  {imageUrl && (
                    <div className="relative aspect-[21/9] rounded-lg overflow-hidden border border-[#EAE4DC]">
                      <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">CTA Label</label>
                  <input
                    type="text"
                    value={ctaText}
                    onChange={(e) => setCtaText(e.target.value)}
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">CTA Link View</label>
                  <input
                    type="text"
                    value={ctaLink}
                    onChange={(e) => setCtaLink(e.target.value)}
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#222] text-white font-semibold rounded hover:bg-[#9E8055]"
                >
                  Save Slide
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
