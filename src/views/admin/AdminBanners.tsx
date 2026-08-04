import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Plus, Edit, Trash2, Image as ImageIcon, X } from 'lucide-react';

export const AdminBanners: React.FC = () => {
  const { banners, addBanner, deleteBanner } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [ctaText, setCtaText] = useState('Explore Collection');
  const [ctaLink, setCtaLink] = useState('shop');
  const [imageUrl, setImageUrl] = useState('');

  const handleCreate = (e: React.FormEvent) => {
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
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      
      <div className="flex justify-between items-center border-b border-[#EAE4DC] pb-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-[#222]">Homepage Banner Manager</h2>
          <p className="text-xs text-gray-500">Manage promotional slides, hero photography, and call-to-action links.</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2.5 bg-[#222222] text-white text-xs font-semibold uppercase tracking-wider rounded hover:bg-[#9E8055] transition flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Hero Slide
        </button>
      </div>

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
                onClick={() => deleteBanner(b.id)}
                className="px-3 py-1 bg-red-50 text-red-600 rounded font-semibold hover:bg-red-100"
              >
                Delete Slide
              </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-serif text-lg font-bold text-[#222]">Add New Hero Banner</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
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
                <label className="block font-semibold mb-1">Image URL *</label>
                <input
                  type="text"
                  required
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                />
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
