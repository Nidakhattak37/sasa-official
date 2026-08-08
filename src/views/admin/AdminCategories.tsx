import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Plus, Edit, Trash2, X, Sparkles, Image as ImageIcon, Layers, Check, Watch, Footprints, ShoppingBag, Gem, Flower2, Shirt } from 'lucide-react';

interface CategoryPreset {
  name: string;
  department: string;
  pieceType: string;
  stitchingStatus: string;
  season: string;
  image: string;
  description: string;
  subcategories: string[];
}

const CATEGORY_PRESETS: { label: string; icon: string; data: CategoryPreset }[] = [
  {
    label: 'Shoes & Luxury Footwear',
    icon: '👠',
    data: {
      name: 'Luxury Footwear & Shoes',
      department: 'Footwear & Shoes',
      pieceType: 'Pair',
      stitchingStatus: 'Finished Good (N/A)',
      season: 'All Season Essentials',
      image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&q=80&w=800',
      description: 'Handcrafted traditional embroidered khussas, evening stilettos, block heels, and artisanal flats.',
      subcategories: ['Handcrafted Khussa', 'Block Heels', 'Evening Stilettos', 'Mules & Slides', 'Bridal Footwear', 'Leather Loafers']
    }
  },
  {
    label: 'Watches & Timepieces',
    icon: '⌚',
    data: {
      name: 'Luxury Watches & Timepieces',
      department: 'Watches & Timepieces',
      pieceType: 'Single Item',
      stitchingStatus: 'Finished Good (N/A)',
      season: 'Non-Seasonal / Timeless Luxury',
      image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=800',
      description: 'Sophisticated horology, luxury chronographs, diamond-bezel dress watches, and leather strap timepieces.',
      subcategories: ['Chronograph Watches', 'Diamond Bezel Dress Watches', 'Automatic Mechanical', 'Rose Gold Mesh Band', 'Classic Leather Strap', 'Men\'s Executive Watches']
    }
  },
  {
    label: 'Handbags & Clutches',
    icon: '👜',
    data: {
      name: 'Designer Handbags & Clutches',
      department: 'Handbags & Clutches',
      pieceType: 'Single Item',
      stitchingStatus: 'Finished Good (N/A)',
      season: 'All Season Essentials',
      image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=800',
      description: 'Artisanal embellished potlis, bridal clutches, premium leather totes, and shoulder bags.',
      subcategories: ['Bridal Potli Bags', 'Evening Clutches', 'Structured Totes', 'Crossbody Bags', 'Raw Silk Envelope Bags']
    }
  },
  {
    label: 'Fine Jewelry & Ornaments',
    icon: '💎',
    data: {
      name: 'Fine Jewelry & Ornaments',
      department: 'Jewelry & Ornaments',
      pieceType: 'Set / Single Item',
      stitchingStatus: 'Finished Good (N/A)',
      season: 'All Season Essentials',
      image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=800',
      description: 'Handcrafted Polki, Kundan choker sets, Jhumkas, Chandbalis, and gold-plated statement jewelry.',
      subcategories: ['Kundan Choker Sets', 'Polki Bridal Sets', 'Jhumkas & Chandbalis', 'Bangles & Kadas', 'Maang Tikka & Passa', 'Cocktail Rings']
    }
  },
  {
    label: 'Fragrances & Royal Attars',
    icon: '🌸',
    data: {
      name: 'Royal Fragrances & Attars',
      department: 'Fragrances & Beauty',
      pieceType: 'Single Item',
      stitchingStatus: 'Finished Good (N/A)',
      season: 'All Season Essentials',
      image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=800',
      description: 'Opulent Eau de Parfum, pure Dehn Al Oudh, French floral body mists, and luxury roll-on attars.',
      subcategories: ['Eau de Parfum (100ml)', 'Pure Dehn Al Oudh', 'French Floral Perfumes', 'Artisanal Attar', 'Scented Hair Mist']
    }
  },
  {
    label: 'Summer Lawn Collection',
    icon: '☀️',
    data: {
      name: 'Summer Lawn Collection',
      department: 'Apparel & Clothing',
      pieceType: '3 Piece',
      stitchingStatus: 'Unstitched',
      season: 'Summer Collection',
      image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=800',
      description: 'Premium Swiss Lawn featuring intricate threadwork, organza borders, and pure chiffon dupattas.',
      subcategories: ['Embroidered Lawn', 'Chikankari Edit', 'Printed Swiss Lawn', 'Chiffon Dupatta 3-Piece', 'Jacquard Lawn']
    }
  },
  {
    label: 'Winter Velvet & Khaddar',
    icon: '❄️',
    data: {
      name: 'Winter Velvet & Khaddar',
      department: 'Apparel & Clothing',
      pieceType: '3 Piece',
      stitchingStatus: 'Unstitched',
      season: 'Winter Collection',
      image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=800',
      description: 'Micro-velvet ensembles, heavy tilla embroidered neckline, Karandi, and warm woolen pashmina suits.',
      subcategories: ['Micro Velvet 9000', 'Embroidered Khaddar', 'Karandi Shawl Suit', 'Velvet Embroidered Kurti']
    }
  },
  {
    label: 'Ready-to-Wear Pret',
    icon: '👗',
    data: {
      name: 'Luxury Pret / Ready-to-Wear',
      department: 'Apparel & Clothing',
      pieceType: '2 Piece',
      stitchingStatus: 'Stitched',
      season: 'All Season Essentials',
      image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&q=80&w=800',
      description: 'Pret-a-porter tailored silhouettes with minimal embellishments, lace trimmings, and modern cuts.',
      subcategories: ['Casual Pret', 'Festive Ready-to-Wear', 'Embroidered Kurtis', 'Raw Silk Co-ords', 'Kaftans & Tunics']
    }
  },
  {
    label: 'Pashmina & Velvet Shawls',
    icon: '🧣',
    data: {
      name: 'Pashmina & Velvet Shawls',
      department: 'Shawls, Stoles & Wraps',
      pieceType: '1 Piece',
      stitchingStatus: 'Finished Good (N/A)',
      season: 'Winter Collection',
      image: 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?auto=format&fit=crop&q=80&w=800',
      description: 'Heritage Kashmiri tilla shawls, pure woven pashmina, and embroidered royal micro-velvet wraps.',
      subcategories: ['Pure Pashmina Shawls', 'Embroidered Velvet Shawls', 'Kashmiri Tilla Wraps', 'Silk Stoles']
    }
  },
  {
    label: 'Men\'s Eastern & Formal',
    icon: '👔',
    data: {
      name: 'Men\'s Eastern & Formal',
      department: 'Men\'s Collection',
      pieceType: '2 Piece',
      stitchingStatus: 'Stitched',
      season: 'All Season Essentials',
      image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=800',
      description: 'Luxury cotton latha kurta shalwar, embroidered festive waistcoats, and tailored prince coats.',
      subcategories: ['Kurta Shalwar Suits', 'Festive Waistcoats', 'Sherwanis & Prince Coats', 'Unstitched Men\'s Latha']
    }
  }
];

export const AdminCategories: React.FC = () => {
  const { categories, addCategory, updateCategory, deleteCategory } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [department, setDepartment] = useState('Apparel & Clothing');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [season, setSeason] = useState('Summer Collection');
  const [pieceType, setPieceType] = useState('3 Piece');
  const [stitchingStatus, setStitchingStatus] = useState('Unstitched');
  const [subcategories, setSubcategories] = useState<string[]>([]);
  const [subcatInput, setSubcatInput] = useState('');
  const [customPieceType, setCustomPieceType] = useState('');
  const [customDepartment, setCustomDepartment] = useState('');

  const openCreate = () => {
    setEditingId(null);
    setName('');
    setSlug('');
    setDepartment('Apparel & Clothing');
    setDescription('');
    setImage('https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=800');
    setSeason('Summer Collection');
    setPieceType('3 Piece');
    setStitchingStatus('Unstitched');
    setSubcategories(['Embroidered Lawn', 'Printed Lawn', 'Chikankari']);
    setSubcatInput('');
    setCustomPieceType('');
    setCustomDepartment('');
    setIsModalOpen(true);
  };

  const applyPreset = (preset: CategoryPreset) => {
    setName(preset.name);
    setSlug(preset.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
    setDepartment(preset.department);
    setPieceType(preset.pieceType);
    setStitchingStatus(preset.stitchingStatus);
    setSeason(preset.season);
    setImage(preset.image);
    setDescription(preset.description);
    setSubcategories(preset.subcategories || []);
    setCustomPieceType('');
    setCustomDepartment('');
  };

  const openEdit = (cat: any) => {
    setEditingId(cat.id);
    setName(cat.name);
    setSlug(cat.slug);
    setDepartment(cat.department || 'Apparel & Clothing');
    setDescription(cat.description || '');
    setImage(cat.image || '');
    setSeason(cat.season || 'All Season Essentials');
    setPieceType(cat.pieceType || '3 Piece');
    setStitchingStatus(cat.stitchingStatus || 'Unstitched');
    setSubcategories(cat.subcategories || []);
    setSubcatInput('');
    setCustomPieceType('');
    setCustomDepartment('');
    setIsModalOpen(true);
  };

  const handleAddSubcategory = () => {
    if (!subcatInput.trim()) return;
    const clean = subcatInput.trim();
    if (!subcategories.includes(clean)) {
      setSubcategories(prev => [...prev, clean]);
    }
    setSubcatInput('');
  };

  const handleRemoveSubcategory = (itemToRemove: string) => {
    setSubcategories(prev => prev.filter(item => item !== itemToRemove));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const generatedSlug = slug.trim() || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const finalDepartment = department === 'Custom' ? (customDepartment.trim() || 'Custom') : department;
    const finalPieceType = pieceType === 'Custom' ? (customPieceType.trim() || 'Single Item') : pieceType;

    const categoryData = {
      name: name.trim(),
      slug: generatedSlug,
      department: finalDepartment,
      description: description.trim(),
      image: image.trim() || 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=800',
      season,
      pieceType: finalPieceType,
      stitchingStatus,
      subcategories
    };

    if (editingId) {
      updateCategory({ id: editingId, ...categoryData });
    } else {
      addCategory(categoryData);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in bg-white min-h-screen">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-[#EAE4DC] pb-4 gap-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-[#222]">Category & Vertical Architecture</h2>
          <p className="text-xs text-gray-500">
            Create and organize collections across Clothing, Footwear/Shoes, Watches, Handbags, Fine Jewelry, Fragrances, and Accessories.
          </p>
        </div>

        <button
          onClick={openCreate}
          className="px-5 py-2.5 bg-[#222222] text-white text-xs font-semibold uppercase tracking-wider rounded-lg hover:bg-[#9E8055] transition flex items-center gap-2 shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      {/* Quick Category Templates Banner */}
      <div className="p-4 bg-white border border-[#EAE4DC] rounded-xl shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-[#9E8055] flex items-center gap-1.5">
            <Sparkles className="w-4 h-4" /> Quick Add by Retail Department (Click to Instant Setup)
          </span>
          <span className="text-[11px] text-gray-400">Supports Clothing, Shoes, Watches, Bags, Jewelry & More</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {CATEGORY_PRESETS.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => {
                openCreate();
                applyPreset(preset.data);
              }}
              className="px-3 py-1.5 bg-white border border-[#EAE4DC] hover:border-[#9E8055] hover:bg-[#FBF9F5] text-[#333] text-xs font-medium rounded-lg transition flex items-center gap-1.5 shadow-2xs group"
            >
              <span>{preset.icon}</span>
              <span className="group-hover:text-[#9E8055]">{preset.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map(cat => (
          <div key={cat.id} className="bg-white border border-[#EAE4DC] rounded-xl overflow-hidden shadow-sm flex flex-col justify-between hover:shadow-md transition">
            <div className="relative aspect-[16/9] bg-white">
              <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <div className="absolute bottom-3 left-4 right-4 text-white">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#D4AF37] block">
                  {cat.department || 'Retail Category'}
                </span>
                <h3 className="font-serif text-xl font-bold drop-shadow">
                  {cat.name}
                </h3>
              </div>
            </div>

            <div className="p-4 space-y-2.5 text-xs flex-1">
              <div className="flex items-center justify-between text-[10px] font-mono text-gray-400">
                <span>Slug: /{cat.slug}</span>
                <span className="text-gray-500 font-sans font-semibold">{cat.subcategories?.length || 0} Sub-types</span>
              </div>
              
              {/* Category Taxonomies */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {cat.season && (
                  <span className="px-2 py-0.5 bg-white text-[#8B5E34] text-[10px] font-bold rounded border border-[#EAE4DC] shadow-2xs">
                    {cat.season}
                  </span>
                )}
                {cat.pieceType && (
                  <span className="px-2 py-0.5 bg-[#222] text-white text-[10px] font-bold rounded">
                    {cat.pieceType}
                  </span>
                )}
                {cat.stitchingStatus && (
                  <span className="px-2 py-0.5 bg-white text-gray-700 text-[10px] font-semibold rounded border border-[#EAE4DC]">
                    {cat.stitchingStatus}
                  </span>
                )}
              </div>

              {cat.subcategories && cat.subcategories.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {cat.subcategories.slice(0, 4).map((sub, sIdx) => (
                    <span key={sIdx} className="px-2 py-0.5 bg-white text-[9px] text-gray-600 rounded border border-gray-200">
                      {sub}
                    </span>
                  ))}
                  {cat.subcategories.length > 4 && (
                    <span className="text-[9px] text-gray-400 self-center">+{cat.subcategories.length - 4} more</span>
                  )}
                </div>
              )}

              <p className="text-gray-600 leading-relaxed pt-1 line-clamp-2">{cat.description}</p>
            </div>

            <div className="p-3 bg-white border-t border-[#EAE4DC] flex justify-end gap-2 text-xs">
              <button
                onClick={() => openEdit(cat)}
                className="px-3.5 py-1.5 bg-white border border-[#EAE4DC] rounded-lg font-semibold text-[#222] hover:border-[#9E8055] hover:text-[#9E8055] transition shadow-2xs"
              >
                Edit
              </button>
              <button
                onClick={() => {
                  if (window.confirm(`Are you sure you want to delete category "${cat.name}"?`)) {
                    deleteCategory(cat.id);
                  }
                }}
                className="px-3.5 py-1.5 bg-white border border-red-200 text-red-600 rounded-lg font-semibold hover:bg-red-50 transition"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal for Add / Edit Category */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-2xl space-y-5 max-h-[90vh] overflow-y-auto border border-[#EAE4DC]">
            
            {/* Header */}
            <div className="flex justify-between items-center border-b border-[#EAE4DC] pb-4">
              <div>
                <h3 className="font-serif text-xl font-bold text-[#222]">
                  {editingId ? 'Edit Category Architecture' : 'Add New Category / Department'}
                </h3>
                <p className="text-[11px] text-gray-500">Configure retail parameters for Clothing, Footwear, Watches, Bags, Jewelry, or Fragrances.</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="p-1 rounded-lg text-gray-400 hover:text-black hover:bg-gray-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Template Selector Inside Modal */}
            <div className="p-3 bg-white border border-[#EAE4DC] rounded-xl space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#9E8055] block">
                Load Preset Template (Optional)
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                {CATEGORY_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => applyPreset(preset.data)}
                    className="p-2 text-left bg-white border border-[#EAE4DC] hover:border-[#9E8055] hover:bg-[#FBF9F5] rounded-lg transition text-xs flex items-center gap-1.5"
                  >
                    <span>{preset.icon}</span>
                    <span className="truncate font-medium">{preset.data.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              
              {/* Category Name & Department */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold mb-1 text-[#222]">
                    Category Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Luxury Footwear, Watches, Velvet Collection"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (!slug || slug === name.toLowerCase().replace(/[^a-z0-9]+/g, '-')) {
                        setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
                      }
                    }}
                    className="w-full px-3 py-2 bg-white border border-[#EAE4DC] rounded-lg focus:ring-1 focus:ring-[#9E8055] focus:outline-none font-medium"
                  />
                </div>

                {/* Retail Department / Vertical Dropdown */}
                <div>
                  <label className="block font-bold mb-1 text-[#222]">
                    Retail Vertical / Department <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#EAE4DC] rounded-lg font-semibold text-[#222] focus:ring-1 focus:ring-[#9E8055] focus:outline-none"
                  >
                    <option value="Apparel & Clothing">👗 Apparel & Clothing (Lawn, Pret, Velvet, Formals)</option>
                    <option value="Footwear & Shoes">👠 Footwear & Shoes (Khussa, Heels, Flats, Mules, Loafers)</option>
                    <option value="Watches & Timepieces">⌚ Watches & Timepieces (Chronographs, Dress, Mesh, Luxury)</option>
                    <option value="Handbags & Clutches">👜 Handbags & Clutches (Totes, Bridal Potlis, Crossbody)</option>
                    <option value="Jewelry & Ornaments">💎 Jewelry & Ornaments (Polki, Kundan, Jhumkas, Rings)</option>
                    <option value="Fragrances & Beauty">🌸 Fragrances & Beauty (Perfumes, Attars, Body Mist, Oudh)</option>
                    <option value="Shawls, Stoles & Wraps">🧣 Shawls, Stoles & Wraps (Pashmina, Velvet, Kashmiri)</option>
                    <option value="Men's Collection">👔 Men's Collection (Kurta Shalwar, Waistcoat, Latha)</option>
                    <option value="Kids & Junior">👶 Kids & Junior (Festive Junior, Kurti, Sherwani)</option>
                    <option value="Accessories & Gifting">🎁 Accessories & Gifting (Belts, Sunglasses, Gift Boxes)</option>
                    <option value="Custom">✨ Other / Custom Department...</option>
                  </select>
                  {department === 'Custom' && (
                    <input
                      type="text"
                      placeholder="Type custom department..."
                      value={customDepartment}
                      onChange={(e) => setCustomDepartment(e.target.value)}
                      className="mt-2 w-full px-3 py-2 bg-white border border-[#EAE4DC] rounded-lg focus:ring-1 focus:ring-[#9E8055] text-xs"
                    />
                  )}
                </div>
              </div>

              {/* Composition (Piece Type) & Stitching / Finished Status */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Piece Type */}
                <div>
                  <label className="block font-bold mb-1 text-[#222]">Item Composition / Packaging</label>
                  <select
                    value={pieceType}
                    onChange={(e) => setPieceType(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#EAE4DC] rounded-lg font-semibold text-[#222] focus:ring-1 focus:ring-[#9E8055]"
                  >
                    <option value="3 Piece">3 Piece (Shirt + Dupatta + Trouser/Shalwar)</option>
                    <option value="2 Piece">2 Piece (Shirt + Dupatta / Shirt + Trouser)</option>
                    <option value="1 Piece">1 Piece (Single Shirt / Kurti / Kaftan / Shawl)</option>
                    <option value="Pair">Pair (Shoes / Footwear / Earrings / Cufflinks)</option>
                    <option value="Single Item">Single Item (Watch / Bag / Perfume / Accessory)</option>
                    <option value="Set / Single Item">Set / Single Item (Jewelry Set / Gift Set)</option>
                    <option value="Shirt Dupatta">Shirt Dupatta</option>
                    <option value="Shirt Shalwar">Shirt Shalwar</option>
                    <option value="Custom">Custom Unit Type...</option>
                  </select>
                  {pieceType === 'Custom' && (
                    <input
                      type="text"
                      placeholder="e.g. 4 Piece Set or Box of 3"
                      value={customPieceType}
                      onChange={(e) => setCustomPieceType(e.target.value)}
                      className="mt-2 w-full px-3 py-2 bg-white border border-[#EAE4DC] rounded-lg focus:ring-1 focus:ring-[#9E8055] text-xs"
                    />
                  )}
                </div>

                {/* Stitching / Finished Status */}
                <div>
                  <label className="block font-bold mb-1 text-[#222]">Stitching & Finish Status</label>
                  <select
                    value={stitchingStatus}
                    onChange={(e) => setStitchingStatus(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#EAE4DC] rounded-lg font-semibold text-[#222] focus:ring-1 focus:ring-[#9E8055]"
                  >
                    <option value="Finished Good (N/A)">Finished Good (N/A - Shoes, Watches, Bags, Perfumes)</option>
                    <option value="Unstitched">Unstitched (3M / 2.5M Fabric Cutpiece)</option>
                    <option value="Stitched">Stitched (Ready to Wear / Tailored Pret)</option>
                    <option value="Both">Both (Available in Stitched & Unstitched)</option>
                    <option value="Custom Tailoring">Custom Tailoring Available</option>
                  </select>
                </div>

                {/* Season Selection */}
                <div>
                  <label className="block font-bold mb-1 text-[#222]">Collection Season</label>
                  <select
                    value={season}
                    onChange={(e) => setSeason(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#EAE4DC] rounded-lg font-semibold text-[#8B5E34] focus:ring-1 focus:ring-[#9E8055]"
                  >
                    <option value="All Season Essentials">All Season Essentials</option>
                    <option value="Non-Seasonal / Timeless Luxury">Non-Seasonal / Timeless (Shoes, Watches, Bags)</option>
                    <option value="Summer Collection">Summer Collection</option>
                    <option value="Winter Collection">Winter Collection</option>
                    <option value="Spring / Summer (SS)">Spring / Summer (SS)</option>
                    <option value="Autumn / Winter (AW)">Autumn / Winter (AW)</option>
                    <option value="Festive / Eid Special">Festive / Eid Special</option>
                    <option value="Wedding & Bridal Luxe">Wedding & Bridal Luxe</option>
                    <option value="Limited Edition Drop">Limited Edition Drop</option>
                  </select>
                </div>
              </div>

              {/* Subcategories Tags Manager */}
              <div className="space-y-2 p-3 bg-white border border-[#EAE4DC] rounded-xl">
                <label className="block font-bold text-[#222]">
                  Subcategory Filters & Tags
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. Khussa, Chronograph, Velvet, Kundan, 38mm..."
                    value={subcatInput}
                    onChange={(e) => setSubcatInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSubcategory();
                      }
                    }}
                    className="flex-1 px-3 py-2 bg-white border border-[#EAE4DC] rounded-lg text-xs focus:ring-1 focus:ring-[#9E8055]"
                  />
                  <button
                    type="button"
                    onClick={handleAddSubcategory}
                    className="px-4 py-2 bg-[#222] text-white font-semibold rounded-lg hover:bg-[#9E8055] transition text-xs"
                  >
                    + Add Tag
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {subcategories.map((sub, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 bg-white text-[#222] border border-[#EAE4DC] rounded-md text-[11px] font-medium flex items-center gap-1.5 shadow-2xs"
                    >
                      {sub}
                      <button
                        type="button"
                        onClick={() => handleRemoveSubcategory(sub)}
                        className="text-gray-400 hover:text-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  {subcategories.length === 0 && (
                    <span className="text-gray-400 italic text-[11px]">No subcategory tags added yet.</span>
                  )}
                </div>
              </div>

              {/* Slug & Banner Image URL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold mb-1 text-[#222]">Slug URL</label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="e.g. luxury-footwear or watches"
                    className="w-full px-3 py-2 bg-white border border-[#EAE4DC] rounded-lg font-mono focus:ring-1 focus:ring-[#9E8055]"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1 text-[#222]">Banner Image URL</label>
                  <input
                    type="text"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3 py-2 bg-white border border-[#EAE4DC] rounded-lg focus:ring-1 focus:ring-[#9E8055]"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block font-bold mb-1 text-[#222]">Category Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe this collection for storefront visitors..."
                  className="w-full px-3 py-2 bg-white border border-[#EAE4DC] rounded-lg focus:ring-1 focus:ring-[#9E8055]"
                />
              </div>

              {/* Form Buttons */}
              <div className="pt-4 border-t border-[#EAE4DC] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 border border-[#EAE4DC] rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#222] text-white font-bold rounded-lg hover:bg-[#9E8055] transition shadow-md flex items-center gap-2"
                >
                  <Check className="w-4 h-4" /> Save Category Architecture
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
