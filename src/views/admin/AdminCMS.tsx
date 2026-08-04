import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Edit, Save, CheckCircle } from 'lucide-react';

export const AdminCMS: React.FC = () => {
  const { cmsPages, updateCMSPage } = useApp();

  const [selectedSlug, setSelectedSlug] = useState(cmsPages[0]?.slug || 'about');
  const selectedPage = cmsPages.find(p => p.slug === selectedSlug) || cmsPages[0];

  const [title, setTitle] = useState(selectedPage?.title || '');
  const [content, setContent] = useState(selectedPage?.content || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSelectPage = (slug: string) => {
    setSelectedSlug(slug);
    const p = cmsPages.find(item => item.slug === slug);
    if (p) {
      setTitle(p.title);
      setContent(p.content);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateCMSPage(selectedSlug, { title, content });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      
      <div className="border-b border-[#EAE4DC] pb-4">
        <h2 className="font-serif text-2xl font-bold text-[#222]">Content Management System (CMS)</h2>
        <p className="text-xs text-gray-500">Edit legal terms, shipping policies, about brand stories, and FAQs.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Page selector (4 Cols) */}
        <div className="lg:col-span-4 space-y-2">
          {cmsPages.map(p => (
            <button
              key={p.slug}
              onClick={() => handleSelectPage(p.slug)}
              className={`w-full text-left p-4 rounded-xl text-xs font-semibold transition flex justify-between items-center ${
                selectedSlug === p.slug
                  ? 'bg-[#222222] text-white shadow'
                  : 'bg-white text-[#444] border border-[#EAE4DC] hover:bg-[#F5F1EC]'
              }`}
            >
              <div>
                <span className="block">{p.title}</span>
                <span className="text-[10px] opacity-70 font-mono">/{p.slug}</span>
              </div>
              <Edit className="w-4 h-4 opacity-70" />
            </button>
          ))}
        </div>

        {/* Editor (8 Cols) */}
        <div className="lg:col-span-8 bg-white border border-[#EAE4DC] rounded-xl p-6 shadow-sm space-y-4">
          <form onSubmit={handleSave} className="space-y-4 text-xs">
            {savedSuccess && (
              <div className="p-3 bg-green-50 text-green-800 text-xs font-semibold rounded border border-green-200 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                Page content updated live on storefront!
              </div>
            )}

            <div>
              <label className="block font-semibold mb-1 text-[#222]">Page Heading Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:border-[#9E8055]"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1 text-[#222]">Page Markdown / Text Content</label>
              <textarea
                rows={12}
                required
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full px-3 py-2 border rounded font-mono text-xs leading-relaxed focus:outline-none focus:border-[#9E8055]"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 bg-[#222] text-white font-semibold text-xs uppercase tracking-wider rounded hover:bg-[#9E8055] transition flex items-center gap-2"
              >
                <Save className="w-4 h-4" /> Save & Publish Page
              </button>
            </div>
          </form>
        </div>

      </div>

    </div>
  );
};
