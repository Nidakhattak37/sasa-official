import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Product } from '../../types';
import { formatPrice } from '../../utils/currency';
import { Plus, Edit, Trash2, Copy, Search, Sparkles, X, Check, Eye } from 'lucide-react';

export const AdminProducts: React.FC = () => {
  const { products, addProduct, updateProduct, deleteProduct, categories, currency, setCurrentView, setSelectedProductId } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCat, setFilterCat] = useState('all');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState(categories[0]?.name || 'Pret');
  const [price, setPrice] = useState<number>(12000);
  const [originalPrice, setOriginalPrice] = useState<number>(15000);
  const [stock, setStock] = useState<number>(20);
  const [sku, setSku] = useState('');
  const [fabricDetails, setFabricDetails] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isNewArrival, setIsNewArrival] = useState(true);
  const [isBestSeller, setIsBestSeller] = useState(false);
  const [isSale, setIsSale] = useState(false);

  const openCreateModal = () => {
    setEditingProduct(null);
    setName('');
    setCategory(categories[0]?.name || 'Pret');
    setPrice(12900);
    setOriginalPrice(15900);
    setStock(15);
    setSku(`SASA-PRET-${Math.floor(1000 + Math.random() * 9000)}`);
    setFabricDetails('Pure Chiffon Dupatta with Embroidered Lawn Shirt');
    setDescription('Intricately crafted festive wear featuring organza borders and tilla embroidery.');
    setImageUrl('https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=800');
    setIsNewArrival(true);
    setIsBestSeller(false);
    setIsSale(false);
    setIsModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setCategory(p.category);
    setPrice(p.price);
    setOriginalPrice(p.originalPrice || p.price);
    setStock(p.stock);
    setSku(p.sku);
    setFabricDetails(p.fabricDetails);
    setDescription(p.description);
    setImageUrl(p.images[0] || '');
    setIsNewArrival(p.isNewArrival);
    setIsBestSeller(p.isBestSeller);
    setIsSale(p.isSale);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price) return;

    if (editingProduct) {
      updateProduct({
        ...editingProduct,
        name,
        category,
        price: Number(price),
        originalPrice: Number(originalPrice),
        stock: Number(stock),
        sku,
        fabricDetails,
        description,
        images: [imageUrl],
        isNewArrival,
        isBestSeller,
        isSale
      });
    } else {
      addProduct({
        name,
        category,
        price: Number(price),
        originalPrice: Number(originalPrice),
        stock: Number(stock),
        sku,
        fabricDetails,
        description,
        images: [imageUrl, imageUrl],
        sizes: ['XS', 'S', 'M', 'L', 'XL'],
        colors: [{ name: 'Royale Burgundy', hex: '#6b1c28' }],
        isNewArrival,
        isBestSeller,
        isSale,
        isFeatured: true,
        rating: 5.0,
        reviewsCount: 1,
        careInstructions: 'Dry Clean Only'
      });
    }
    setIsModalOpen(false);
  };

  const handleDuplicate = (p: Product) => {
    addProduct({
      ...p,
      name: `${p.name} (Copy)`,
      sku: `${p.sku}-COPY`
    });
  };

  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat = filterCat === 'all' || p.category === filterCat;
    return matchSearch && matchCat;
  });

  return (
    <div className="space-y-6 animate-in fade-in">
      
      {/* Header & Create CTA */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-[#EAE4DC] pb-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-[#222]">Product Inventory Management</h2>
          <p className="text-xs text-gray-500">Manage catalog suits, price tiers, fabrics, stock levels, and SKUs.</p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-5 py-2.5 bg-[#222222] text-white text-xs font-semibold uppercase tracking-wider rounded hover:bg-[#9E8055] transition flex items-center justify-center gap-2 shadow"
        >
          <Plus className="w-4 h-4" /> Add New Product
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between bg-white p-4 rounded-xl border border-[#EAE4DC]">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search products by title or SKU..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-[#EAE4DC] rounded focus:outline-none focus:border-[#9E8055]"
          />
        </div>

        <select
          value={filterCat}
          onChange={(e) => setFilterCat(e.target.value)}
          className="px-3 py-2 text-xs border border-[#EAE4DC] rounded bg-white text-[#222] focus:outline-none"
        >
          <option value="all">All Categories ({products.length})</option>
          {categories.map(c => (
            <option key={c.id} value={c.name}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Products Table */}
      <div className="bg-white border border-[#EAE4DC] rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-[#FAFAFA] text-[#222] border-b border-[#EAE4DC] font-bold uppercase tracking-wider text-[11px]">
              <th className="p-3">Product</th>
              <th className="p-3">Category</th>
              <th className="p-3">SKU</th>
              <th className="p-3">Price</th>
              <th className="p-3">Stock</th>
              <th className="p-3">Badges</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F2F2F2]">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-12 text-center text-gray-500">
                  <div className="max-w-xs mx-auto space-y-3">
                    <p className="font-serif text-base font-bold text-[#222]">No Products In Catalog</p>
                    <p className="text-xs text-gray-400">
                      There are currently no products in the catalog. Click "+ Add New Product" to create one.
                    </p>
                    <button
                      onClick={openCreateModal}
                      className="px-4 py-2 bg-[#222] text-white text-xs font-semibold rounded hover:bg-[#9E8055] transition inline-block"
                    >
                      + Add First Product
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map(p => (
                <tr key={p.id} className="hover:bg-[#FAFAFA]">
                <td className="p-3 font-semibold text-[#222] flex items-center space-x-3">
                  <img src={p.images[0]} alt="" className="w-10 h-12 object-cover rounded bg-[#F5F1EC]" />
                  <div>
                    <span className="block font-serif text-sm text-[#222]">{p.name}</span>
                    <span className="text-[10px] text-gray-400">{p.fabricDetails}</span>
                  </div>
                </td>
                <td className="p-3 text-gray-600 font-medium">{p.category}</td>
                <td className="p-3 text-gray-500 font-mono text-[11px]">{p.sku}</td>
                <td className="p-3 font-bold text-[#222]">{formatPrice(p.price, currency)}</td>
                <td className="p-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    p.stock > 10 ? 'bg-green-100 text-green-800' : p.stock > 0 ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {p.stock} in stock
                  </span>
                </td>
                <td className="p-3 space-x-1">
                  {p.isNewArrival && <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 text-[9px] font-bold rounded">NEW</span>}
                  {p.isBestSeller && <span className="px-1.5 py-0.5 bg-[#D4AF37]/20 text-[#9E8055] text-[9px] font-bold rounded">BEST</span>}
                  {p.isSale && <span className="px-1.5 py-0.5 bg-red-50 text-red-700 text-[9px] font-bold rounded">SALE</span>}
                </td>
                <td className="p-3 text-right space-x-1">
                  <button
                    onClick={() => {
                      setSelectedProductId(p.id);
                      setCurrentView('product-detail');
                    }}
                    className="p-1.5 text-gray-500 hover:text-black rounded"
                    title="View Product Page"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDuplicate(p)}
                    className="p-1.5 text-gray-500 hover:text-[#9E8055] rounded"
                    title="Duplicate Product"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => openEditModal(p)}
                    className="p-1.5 text-gray-500 hover:text-blue-600 rounded"
                    title="Edit Product"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteProduct(p.id)}
                    className="p-1.5 text-gray-500 hover:text-red-600 rounded"
                    title="Delete Product"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            )))}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
            
            <div className="flex justify-between items-center border-b border-[#EAE4DC] pb-4 mb-6">
              <h3 className="font-serif text-xl font-bold text-[#222]">
                {editingProduct ? 'Edit Product Specs' : 'Add New SASA Product'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-[#222] mb-1">Product Title *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAFAFA] border border-[#EAE4DC] rounded"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#222] mb-1">Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAFAFA] border border-[#EAE4DC] rounded"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#222] mb-1">Price (PKR) *</label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#FAFAFA] border border-[#EAE4DC] rounded"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#222] mb-1">Original Price (PKR)</label>
                  <input
                    type="number"
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#FAFAFA] border border-[#EAE4DC] rounded"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#222] mb-1">Inventory Stock *</label>
                  <input
                    type="number"
                    required
                    value={stock}
                    onChange={(e) => setStock(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#FAFAFA] border border-[#EAE4DC] rounded"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#222] mb-1">SKU Code *</label>
                  <input
                    type="text"
                    required
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAFAFA] border border-[#EAE4DC] rounded"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#222] mb-1">Fabric Details *</label>
                <input
                  type="text"
                  required
                  value={fabricDetails}
                  onChange={(e) => setFabricDetails(e.target.value)}
                  placeholder="e.g. Pure Velvet Shirt with Organza Embroidered Dupatta"
                  className="w-full px-3 py-2 bg-[#FAFAFA] border border-[#EAE4DC] rounded"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#222] mb-1">Image URL *</label>
                <input
                  type="text"
                  required
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAFAFA] border border-[#EAE4DC] rounded"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#222] mb-1">Product Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAFAFA] border border-[#EAE4DC] rounded"
                />
              </div>

              {/* Toggles */}
              <div className="flex flex-wrap gap-4 pt-2">
                <label className="flex items-center space-x-2 font-semibold text-[#222]">
                  <input type="checkbox" checked={isNewArrival} onChange={(e) => setIsNewArrival(e.target.checked)} className="accent-[#9E8055]" />
                  <span>Mark as New Arrival</span>
                </label>
                <label className="flex items-center space-x-2 font-semibold text-[#222]">
                  <input type="checkbox" checked={isBestSeller} onChange={(e) => setIsBestSeller(e.target.checked)} className="accent-[#9E8055]" />
                  <span>Mark as Best Seller</span>
                </label>
                <label className="flex items-center space-x-2 font-semibold text-[#222]">
                  <input type="checkbox" checked={isSale} onChange={(e) => setIsSale(e.target.checked)} className="accent-[#9E8055]" />
                  <span>Mark on Sale</span>
                </label>
              </div>

              <div className="pt-4 border-t border-[#EAE4DC] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-[#EAE4DC] text-[#222] font-semibold rounded hover:bg-[#FAFAFA]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#222222] text-white font-semibold uppercase tracking-wider rounded hover:bg-[#9E8055]"
                >
                  {editingProduct ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
