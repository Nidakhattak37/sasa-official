import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Plus, Edit, Trash2, X, FolderPlus } from 'lucide-react';

export const AdminCategories: React.FC = () => {
  const { categories, addCategory, updateCategory, deleteCategory } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [season, setSeason] = useState<'Summer Collection' | 'Winter Collection' | 'All Season'>('Summer Collection');
  const [pieceType, setPieceType] = useState('3 Piece');
  const [stitchingStatus, setStitchingStatus] = useState<'Stitched' | 'Unstitched' | 'Both'>('Unstitched');

  const openCreate = () => {
    setEditingId(null);
    setName('');
    setSlug('');
    setDescription('');
    setImage('https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=800');
    setSeason('Summer Collection');
    setPieceType('3 Piece');
    setStitchingStatus('Unstitched');
    setIsModalOpen(true);
  };

  const openEdit = (cat: any) => {
    setEditingId(cat.id);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description);
    setImage(cat.image);
    setSeason(cat.season || 'Summer Collection');
    setPieceType(cat.pieceType || '3 Piece');
    setStitchingStatus(cat.stitchingStatus || 'Unstitched');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    const generatedSlug = slug || name.toLowerCase().replace(/\s+/g, '-');

    if (editingId) {
      updateCategory(editingId, { name, slug: generatedSlug, description, image, season, pieceType, stitchingStatus });
    } else {
      addCategory({ name, slug: generatedSlug, description, image, season, pieceType, stitchingStatus });
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      
      <div className="flex justify-between items-center border-b border-[#EAE4DC] pb-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-[#222]">Category Architecture</h2>
          <p className="text-xs text-gray-500">Organize storefront collections, lawn edits, winter velvet, and pret categories with seasonal and piece rules.</p>
        </div>

        <button
          onClick={openCreate}
          className="px-5 py-2.5 bg-[#222222] text-white text-xs font-semibold uppercase tracking-wider rounded hover:bg-[#9E8055] transition flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map(cat => (
          <div key={cat.id} className="bg-white border border-[#EAE4DC] rounded-xl overflow-hidden shadow-sm flex flex-col justify-between">
            <div className="relative aspect-[16/9] bg-gray-100">
              <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/30" />
              <h3 className="absolute bottom-3 left-4 font-serif text-xl font-bold text-white drop-shadow">
                {cat.name}
              </h3>
            </div>

            <div className="p-4 space-y-2 text-xs flex-1">
              <span className="text-[10px] font-mono text-gray-400 block">Slug: /{cat.slug}</span>
              
              {/* Category Taxonomies */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {cat.season && (
                  <span className="px-2 py-0.5 bg-[#F5F1EC] text-[#8B5E34] text-[10px] font-bold rounded border border-[#EAE4DC]">
                    {cat.season}
                  </span>
                )}
                {cat.pieceType && (
                  <span className="px-2 py-0.5 bg-[#1E1E24] text-white text-[10px] font-bold rounded">
                    {cat.pieceType}
                  </span>
                )}
                {cat.stitchingStatus && (
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-[10px] font-semibold rounded border border-gray-200">
                    {cat.stitchingStatus}
                  </span>
                )}
              </div>

              <p className="text-gray-600 leading-relaxed pt-1">{cat.description}</p>
            </div>

            <div className="p-3 bg-[#FAFAFA] border-t border-[#EAE4DC] flex justify-end gap-2 text-xs">
              <button
                onClick={() => openEdit(cat)}
                className="px-3 py-1 bg-white border border-gray-300 rounded font-semibold text-[#222] hover:bg-[#F5F1EC]"
              >
                Edit
              </button>
              <button
                onClick={() => deleteCategory(cat.id)}
                className="px-3 py-1 bg-red-50 text-red-600 rounded font-semibold hover:bg-red-100"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-[#EAE4DC] pb-3">
              <h3 className="font-serif text-lg font-bold text-[#222]">
                {editingId ? 'Edit Category' : 'Create New Category'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-[#222]">Category Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Velvet Collection or Unstitched Lawn"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border rounded focus:ring-1 focus:ring-[#8B5E34]"
                />
              </div>

              {/* Season Selection (Summer Collection vs Winter Collection) */}
              <div>
                <label className="block font-semibold mb-1 text-[#222]">Collection Season *</label>
                <select
                  value={season}
                  onChange={(e) => setSeason(e.target.value as any)}
                  className="w-full px-3 py-2 border rounded font-semibold text-[#8B5E34] bg-[#FAFAFA]"
                >
                  <option value="Summer Collection">Summer Collection</option>
                  <option value="Winter Collection">Winter Collection</option>
                  <option value="All Season">All Season Essentials</option>
                </select>
              </div>

              {/* Piece Type Selection (3 Piece, 2 Piece, 1 Piece, etc) */}
              <div>
                <label className="block font-semibold mb-1 text-[#222]">Suit Composition (Piece Type) *</label>
                <select
                  value={pieceType}
                  onChange={(e) => setPieceType(e.target.value)}
                  className="w-full px-3 py-2 border rounded font-semibold text-[#222] bg-[#FAFAFA]"
                >
                  <option value="3 Piece">3 Piece (Shirt + Dupatta + Trouser/Shalwar)</option>
                  <option value="2 Piece">2 Piece (Shirt + Dupatta / Shirt + Trouser)</option>
                  <option value="1 Piece">1 Piece (Shirt / Kurti / Kaftan)</option>
                  <option value="Shirt Dupatta">Shirt Dupatta</option>
                  <option value="Shirt Shalwar">Shirt Shalwar</option>
                </select>
              </div>

              {/* Stitching Selection (Stitched vs Unstitched) */}
              <div>
                <label className="block font-semibold mb-1 text-[#222]">Stitching Type *</label>
                <select
                  value={stitchingStatus}
                  onChange={(e) => setStitchingStatus(e.target.value as any)}
                  className="w-full px-3 py-2 border rounded font-semibold text-[#222] bg-[#FAFAFA]"
                >
                  <option value="Unstitched">Unstitched (3M Fabric Roll / Cutpiece)</option>
                  <option value="Stitched">Stitched (Ready to Wear Pret / Tailored)</option>
                  <option value="Both">Both (Available in Stitched & Unstitched)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-[#222]">Slug URL</label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="e.g. winter-velvet"
                  className="w-full px-3 py-2 border rounded"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-[#222]">Banner Image URL</label>
                <input
                  type="text"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-[#222]">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                />
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
                  className="px-5 py-2 bg-[#222] text-white font-semibold rounded hover:bg-[#8B5E34]"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
