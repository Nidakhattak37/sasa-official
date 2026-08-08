import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Product } from '../../types';
import { formatPrice } from '../../utils/currency';
import { Plus, Edit, Trash2, Copy, Search, Sparkles, X, Check, Eye, Upload, Image as ImageIcon, Star, Layers, Watch, Footprints, Tag } from 'lucide-react';

const COLLECTION_TYPES = [
  'Summer Lawn',
  'Winter Velvet & Khaddar',
  'Spring Floral Edit',
  'Autumn Silk & Karandi',
  'Festive / Eid Special',
  'Bridal & Wedding Luxe',
  'Luxury Footwear Edit',
  'Timeless Timepieces',
  'Designer Handbags',
  'Royal Fragrance Bar',
  'All Season Essentials'
];

const PIECE_TYPES = [
  '3 Piece',
  '2 Piece',
  '1 Piece',
  'Pair',
  'Single Item',
  'Set / Single Item',
  'Shirt Dupatta',
  'Shirt Shalwar'
];

export const AdminProducts: React.FC = () => {
  const { products, addProduct, updateProduct, deleteProduct, categories, currency, setCurrentView, setSelectedProductId } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCat, setFilterCat] = useState('all');
  const [filterCollection, setFilterCollection] = useState('all');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState(categories[0]?.name || 'Pret');
  const [department, setDepartment] = useState('Apparel & Clothing');
  const [collectionType, setCollectionType] = useState('Summer Lawn');
  const [season, setSeason] = useState('Summer Collection');
  const [pieceType, setPieceType] = useState('3 Piece');
  const [stitchingStatus, setStitchingStatus] = useState('Unstitched');
  const [price, setPrice] = useState<number>(12000);
  const [originalPrice, setOriginalPrice] = useState<number>(15000);
  const [stock, setStock] = useState<number>(20);
  const [sku, setSku] = useState('');
  const [fabricDetails, setFabricDetails] = useState('');
  const [description, setDescription] = useState('');
  const [productImages, setProductImages] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>(['Unstitched']);
  const [customSizeInput, setCustomSizeInput] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [isNewArrival, setIsNewArrival] = useState(true);
  const [isBestSeller, setIsBestSeller] = useState(false);
  const [isSale, setIsSale] = useState(false);

  // Auto-adapt fields when category changes
  const handleCategoryChange = (catName: string) => {
    setCategory(catName);
    const matchedCategory = categories.find(c => c.name === catName);
    if (matchedCategory) {
      if (matchedCategory.department) setDepartment(matchedCategory.department);
      if (matchedCategory.season) setSeason(matchedCategory.season);
      if (matchedCategory.pieceType) setPieceType(matchedCategory.pieceType);
      if (matchedCategory.stitchingStatus) setStitchingStatus(matchedCategory.stitchingStatus);

      // Adapt sizes
      if (matchedCategory.department?.includes('Footwear') || matchedCategory.department?.includes('Shoes') || catName.toLowerCase().includes('shoe') || catName.toLowerCase().includes('khussa')) {
        setSelectedSizes(['36', '37', '38', '39', '40', '41']);
        setFabricDetails('Handcrafted Leather & Embroidered Velvet with Padded Sole');
      } else if (matchedCategory.department?.includes('Watch') || catName.toLowerCase().includes('watch')) {
        setSelectedSizes(['One Size', '38mm', '40mm']);
        setFabricDetails('Sapphire Crystal Glass, Stainless Steel / Leather Strap');
      } else if (matchedCategory.department?.includes('Bag') || matchedCategory.department?.includes('Jewelry') || matchedCategory.department?.includes('Fragrance')) {
        setSelectedSizes(['Standard / One Size']);
        setFabricDetails('Artisanal Handcrafted Finished Luxury Item');
      }
    }
  };

  const openCreateModal = () => {
    setEditingProduct(null);
    setName('');
    const initialCat = categories[0]?.name || 'Summer Lawn';
    setCategory(initialCat);
    setDepartment(categories[0]?.department || 'Apparel & Clothing');
    setCollectionType('Summer Lawn');
    setSeason(categories[0]?.season || 'Summer Collection');
    setPieceType(categories[0]?.pieceType || '3 Piece');
    setStitchingStatus(categories[0]?.stitchingStatus || 'Unstitched');
    setPrice(12900);
    setOriginalPrice(15900);
    setStock(15);
    setSku(`SASA-ITEM-${Math.floor(1000 + Math.random() * 9000)}`);
    setFabricDetails('Pure Chiffon Dupatta with Embroidered Lawn Shirt');
    setDescription('Intricately crafted luxury piece featuring artisanal craftsmanship and bespoke styling.');
    setProductImages([
      '/images/sky_blue_chikankari.jpg',
      '/images/yellow_mustard_suit.jpg',
      '/images/black_olive_suit.jpg'
    ]);
    setSelectedSizes(['XS', 'S', 'M', 'L', 'XL', 'Unstitched']);
    setUrlInput('');
    setCustomSizeInput('');
    setIsNewArrival(true);
    setIsBestSeller(false);
    setIsSale(false);
    setIsModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setCategory(p.category);
    setDepartment(p.department || 'Apparel & Clothing');
    setCollectionType(p.collectionType || p.collection || 'Summer Lawn');
    setSeason(p.season || 'Summer Collection');
    setPieceType(p.pieceType || '3 Piece');
    setStitchingStatus(p.stitchingStatus || 'Unstitched');
    setPrice(p.price);
    setOriginalPrice(p.originalPrice || p.price);
    setStock(p.stock);
    setSku(p.sku);
    setFabricDetails(p.fabricDetails);
    setDescription(p.description);
    setProductImages(p.images && p.images.length > 0 ? [...p.images] : ['/images/sky_blue_chikankari.jpg']);
    setSelectedSizes(p.sizes && p.sizes.length > 0 ? [...p.sizes] : ['Unstitched']);
    setUrlInput('');
    setCustomSizeInput('');
    setIsNewArrival(p.isNewArrival || false);
    setIsBestSeller(p.isBestSeller || false);
    setIsSale(p.isSale || false);
    setIsModalOpen(true);
  };

  const toggleSize = (sizeOption: string) => {
    setSelectedSizes(prev => 
      prev.includes(sizeOption) 
        ? prev.filter(s => s !== sizeOption)
        : [...prev, sizeOption]
    );
  };

  const addCustomSize = () => {
    if (!customSizeInput.trim()) return;
    const clean = customSizeInput.trim();
    if (!selectedSizes.includes(clean)) {
      setSelectedSizes(prev => [...prev, clean]);
    }
    setCustomSizeInput('');
  };

  // Image Upload File Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    fileArray.forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const result = uploadEvent.target?.result as string;
        if (result) {
          setProductImages(prev => [...prev, result]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleAddUrlImage = () => {
    if (!urlInput.trim()) return;
    setProductImages(prev => [...prev, urlInput.trim()]);
    setUrlInput('');
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setProductImages(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleMakePrimaryImage = (indexToPrimary: number) => {
    setProductImages(prev => {
      const copy = [...prev];
      const [selected] = copy.splice(indexToPrimary, 1);
      return [selected, ...copy];
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price) return;

    const finalImages = productImages.length > 0 
      ? productImages 
      : ['/images/sky_blue_chikankari.jpg'];

    const finalSizes = selectedSizes.length > 0 ? selectedSizes : ['Standard / One Size'];

    const productPayload = {
      name: name.trim(),
      category,
      department,
      collectionType,
      collection: collectionType,
      season,
      pieceType,
      stitchingStatus,
      price: Number(price),
      originalPrice: Number(originalPrice),
      stock: Number(stock),
      sku: sku.trim() || `SASA-${Date.now()}`,
      fabricDetails: fabricDetails.trim(),
      description: description.trim(),
      images: finalImages,
      sizes: finalSizes,
      colors: [{ name: 'Royale Burgundy', hex: '#6b1c28' }],
      isNewArrival,
      isBestSeller,
      isSale,
      isFeatured: true,
      rating: 5.0,
      reviewsCount: 1,
      careInstructions: 'Handle with Care / Specialist Clean Only'
    };

    if (editingProduct) {
      updateProduct({
        ...editingProduct,
        ...productPayload
      });
    } else {
      addProduct(productPayload);
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
    const matchColl = filterCollection === 'all' || (p.collectionType === filterCollection || p.collection === filterCollection);
    return matchSearch && matchCat && matchColl;
  });

  return (
    <div className="space-y-6 animate-in fade-in bg-white min-h-screen">
      
      {/* Header & Create CTA */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-[#EAE4DC] pb-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-[#222]">Product Inventory & Catalog</h2>
          <p className="text-xs text-gray-500">
            Manage catalog items across Clothing, Footwear/Shoes, Watches, Bags, Jewelry, and Fragrances with image gallery uploads and stock management.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-5 py-2.5 bg-[#222222] text-white text-xs font-semibold uppercase tracking-wider rounded-lg hover:bg-[#9E8055] transition flex items-center justify-center gap-2 shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add New Product
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between bg-white p-4 rounded-xl border border-[#EAE4DC] shadow-sm">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search products by title, SKU, category..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-[#EAE4DC] rounded-lg focus:outline-none focus:border-[#9E8055]"
          />
        </div>

        {/* Category Filter */}
        <select
          value={filterCat}
          onChange={(e) => setFilterCat(e.target.value)}
          className="px-3 py-2 text-xs border border-[#EAE4DC] rounded-lg bg-white text-[#222] font-medium focus:outline-none focus:border-[#9E8055]"
        >
          <option value="all">All Categories ({products.length} items)</option>
          {categories.map(c => (
            <option key={c.id} value={c.name}>{c.name}</option>
          ))}
        </select>

        {/* Collection Type Filter */}
        <select
          value={filterCollection}
          onChange={(e) => setFilterCollection(e.target.value)}
          className="px-3 py-2 text-xs border border-[#EAE4DC] rounded-lg bg-white text-[#222] font-medium focus:outline-none focus:border-[#9E8055]"
        >
          <option value="all">All Collection Types</option>
          {COLLECTION_TYPES.map(coll => (
            <option key={coll} value={coll}>{coll}</option>
          ))}
        </select>
      </div>

      {/* Products Table */}
      <div className="bg-white border border-[#EAE4DC] rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-white text-[#222] border-b border-[#EAE4DC] font-bold uppercase tracking-wider text-[11px]">
              <th className="p-3">Product</th>
              <th className="p-3">Category / Department</th>
              <th className="p-3">SKU</th>
              <th className="p-3">Price</th>
              <th className="p-3">Stock</th>
              <th className="p-3">Gallery</th>
              <th className="p-3">Badges</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EAE4DC]">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-12 text-center text-gray-500 bg-white">
                  <div className="max-w-xs mx-auto space-y-3">
                    <p className="font-serif text-base font-bold text-[#222]">No Products In Catalog</p>
                    <p className="text-xs text-gray-400">
                      There are currently no products in the catalog matching filters. Click "+ Add New Product" to create one.
                    </p>
                    <button
                      onClick={openCreateModal}
                      className="px-4 py-2 bg-[#222] text-white text-xs font-semibold rounded-lg hover:bg-[#9E8055] transition inline-block shadow-sm"
                    >
                      + Add First Product
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map(p => (
                <tr key={p.id} className="hover:bg-[#FBF9F5] transition bg-white">
                  <td className="p-3 font-semibold text-[#222] flex items-center space-x-3">
                    <img src={p.images[0] || '/images/sky_blue_chikankari.jpg'} alt="" className="w-10 h-12 object-cover rounded-lg bg-white border border-[#EAE4DC]" />
                    <div>
                      <span className="block font-serif text-sm text-[#222]">{p.name}</span>
                      <span className="text-[10px] text-gray-400">{p.fabricDetails}</span>
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex flex-col gap-1">
                      <span className="px-2 py-0.5 bg-white text-[#8B5E34] text-[10px] font-semibold rounded border border-[#EAE4DC] inline-block shadow-2xs">
                        {p.category}
                      </span>
                      {p.pieceType && (
                        <span className="px-2 py-0.5 bg-[#222] text-white text-[9px] font-bold rounded tracking-wider uppercase inline-block w-fit">
                          {p.pieceType}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-3 text-gray-500 font-mono text-[11px]">{p.sku}</td>
                  <td className="p-3 font-bold text-[#222]">{formatPrice(p.price, currency)}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      p.stock > 10 ? 'bg-green-100 text-green-800' : p.stock > 0 ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {p.stock} in stock
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex -space-x-1 overflow-hidden">
                      {p.images.slice(0, 3).map((img, idx) => (
                        <img key={idx} src={img} alt="" className="inline-block h-6 w-6 rounded-full ring-1 ring-white object-cover shadow-2xs" />
                      ))}
                      {p.images.length > 3 && (
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-gray-200 text-[9px] font-medium text-gray-600">
                          +{p.images.length - 3}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-1">
                      <button
                        onClick={() => updateProduct({ ...p, isNewArrival: !p.isNewArrival })}
                        className={`px-2 py-0.5 text-[10px] font-bold rounded transition border cursor-pointer ${
                          p.isNewArrival ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-2xs' : 'bg-white text-gray-400 border-gray-200 hover:text-gray-700'
                        }`}
                        title="Click to toggle Mark as New Arrival"
                      >
                        {p.isNewArrival ? '✓ NEW' : '+ New'}
                      </button>

                      <button
                        onClick={() => updateProduct({ ...p, isBestSeller: !p.isBestSeller })}
                        className={`px-2 py-0.5 text-[10px] font-bold rounded transition border cursor-pointer ${
                          p.isBestSeller ? 'bg-[#D4AF37]/20 text-[#8B5E34] border-[#D4AF37]/50 shadow-2xs' : 'bg-white text-gray-400 border-gray-200 hover:text-gray-700'
                        }`}
                        title="Click to toggle Best Seller status"
                      >
                        {p.isBestSeller ? '★ BEST' : '+ Best'}
                      </button>

                      <button
                        onClick={() => updateProduct({ ...p, isSale: !p.isSale })}
                        className={`px-2 py-0.5 text-[10px] font-bold rounded transition border cursor-pointer ${
                          p.isSale ? 'bg-red-50 text-red-800 border-red-300 shadow-2xs' : 'bg-white text-gray-400 border-gray-200 hover:text-gray-700'
                        }`}
                        title="Click to toggle On Sale"
                      >
                        {p.isSale ? 'SALE' : '+ Sale'}
                      </button>
                    </div>
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
                      onClick={() => {
                        if (window.confirm(`Delete product "${p.name}"?`)) {
                          deleteProduct(p.id);
                        }
                      }}
                      className="p-1.5 text-gray-500 hover:text-red-600 rounded"
                      title="Delete Product"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl p-6 sm:p-8 max-h-[92vh] overflow-y-auto border border-[#EAE4DC]">
            
            <div className="flex justify-between items-center border-b border-[#EAE4DC] pb-4 mb-6">
              <div>
                <h3 className="font-serif text-xl font-bold text-[#222]">
                  {editingProduct ? 'Edit Product Specifications' : 'Add New Product to Catalog'}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">Configure specs for Clothing, Footwear, Watches, Bags, Jewelry, or Fragrances.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-black p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-5 text-xs">
              
              {/* Product Basic Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-[#222] mb-1">Product Title *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Nayla - Chikankari Lawn / Royal Leather Khussa / Gold Chronograph"
                    className="w-full px-3 py-2 bg-white border border-[#EAE4DC] rounded-lg focus:ring-1 focus:ring-[#9E8055] focus:outline-none font-medium"
                  />
                </div>

                {/* Category Selector with Auto-adaptation */}
                <div>
                  <label className="block font-bold text-[#222] mb-1">Category & Department *</label>
                  <select
                    value={category}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#EAE4DC] rounded-lg focus:ring-1 focus:ring-[#9E8055] focus:outline-none font-semibold text-[#222]"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.name}>
                        {c.name} ({c.department || 'Retail'})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Season Selection */}
                <div>
                  <label className="block font-bold text-[#222] mb-1">Season Tag *</label>
                  <select
                    value={season}
                    onChange={(e) => setSeason(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#EAE4DC] rounded-lg focus:ring-1 focus:ring-[#9E8055] font-semibold text-[#8B5E34]"
                  >
                    <option value="All Season Essentials">All Season Essentials</option>
                    <option value="Non-Seasonal / Timeless Luxury">Non-Seasonal / Timeless Luxury</option>
                    <option value="Summer Collection">Summer Collection</option>
                    <option value="Winter Collection">Winter Collection</option>
                    <option value="Spring / Summer (SS)">Spring / Summer (SS)</option>
                    <option value="Autumn / Winter (AW)">Autumn / Winter (AW)</option>
                    <option value="Festive / Eid Special">Festive / Eid Special</option>
                    <option value="Wedding & Bridal Luxe">Wedding & Bridal Luxe</option>
                  </select>
                </div>

                {/* Collection Type (Summer, Winter, etc.) */}
                <div>
                  <label className="block font-bold text-[#222] mb-1">Collection Edit *</label>
                  <select
                    value={collectionType}
                    onChange={(e) => setCollectionType(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#EAE4DC] rounded-lg focus:ring-1 focus:ring-[#9E8055] focus:outline-none font-medium"
                  >
                    {COLLECTION_TYPES.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                {/* Suit Composition / Piece Type */}
                <div>
                  <label className="block font-bold text-[#222] mb-1">Item Composition / Unit *</label>
                  <select
                    value={pieceType}
                    onChange={(e) => setPieceType(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#EAE4DC] rounded-lg focus:ring-1 focus:ring-[#9E8055] focus:outline-none font-semibold text-[#1E1E24]"
                  >
                    {PIECE_TYPES.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                {/* Stitching Status */}
                <div>
                  <label className="block font-bold text-[#222] mb-1">Stitching & Finish *</label>
                  <select
                    value={stitchingStatus}
                    onChange={(e) => setStitchingStatus(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#EAE4DC] rounded-lg focus:ring-1 focus:ring-[#9E8055] font-semibold text-[#222]"
                  >
                    <option value="Finished Good (N/A)">Finished Good (N/A - Shoes, Watches, Bags, Perfumes)</option>
                    <option value="Unstitched">Unstitched (3M Fabric Cutpiece)</option>
                    <option value="Stitched">Stitched (Ready to Wear Pret)</option>
                    <option value="Both">Both (Available in Stitched & Unstitched)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#222] mb-1">SKU Code *</label>
                  <input
                    type="text"
                    required
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#EAE4DC] rounded-lg focus:ring-1 focus:ring-[#9E8055] focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#222] mb-1">Price (PKR) *</label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-[#EAE4DC] rounded-lg focus:ring-1 focus:ring-[#9E8055] focus:outline-none font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#222] mb-1">Original / Retail Price (PKR)</label>
                  <input
                    type="number"
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-[#EAE4DC] rounded-lg focus:ring-1 focus:ring-[#9E8055] focus:outline-none text-gray-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#222] mb-1">Inventory Stock *</label>
                  <input
                    type="number"
                    required
                    value={stock}
                    onChange={(e) => setStock(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-[#EAE4DC] rounded-lg font-bold"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-[#222] mb-1">Material & Specs Summary *</label>
                  <input
                    type="text"
                    required
                    value={fabricDetails}
                    onChange={(e) => setFabricDetails(e.target.value)}
                    placeholder="e.g. Hand-embroidered Lawn / Genuine Leather & Velvet / 316L Stainless Steel Watch"
                    className="w-full px-3 py-2 bg-white border border-[#EAE4DC] rounded-lg focus:ring-1 focus:ring-[#9E8055] focus:outline-none"
                  />
                </div>
              </div>

              {/* SIZES / VARIANTS SELECTOR */}
              <div className="p-4 bg-white rounded-xl border border-[#EAE4DC] space-y-2">
                <label className="font-bold text-[#222] block">Available Sizes & Variants for Customers</label>
                <div className="flex flex-wrap gap-2">
                  {/* Apparel Sizes */}
                  {['Unstitched', 'XS', 'S', 'M', 'L', 'XL', 'XXL'].map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleSize(s)}
                      className={`px-3 py-1 text-xs rounded-lg font-semibold border transition ${
                        selectedSizes.includes(s)
                          ? 'bg-[#222] text-white border-[#222]'
                          : 'bg-white text-gray-600 border-[#EAE4DC] hover:border-gray-400'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                  {/* Footwear Sizes */}
                  {['36 (EU 36)', '37 (EU 37)', '38 (EU 38)', '39 (EU 39)', '40 (EU 40)', '41 (EU 41)', '42 (EU 42)'].map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleSize(s)}
                      className={`px-3 py-1 text-xs rounded-lg font-semibold border transition ${
                        selectedSizes.includes(s)
                          ? 'bg-[#8B5E34] text-white border-[#8B5E34]'
                          : 'bg-white text-gray-600 border-[#EAE4DC] hover:border-gray-400'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                  {/* Watches / Accessories Sizes */}
                  {['One Size', '38mm', '40mm', '42mm', '50ml', '100ml'].map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleSize(s)}
                      className={`px-3 py-1 text-xs rounded-lg font-semibold border transition ${
                        selectedSizes.includes(s)
                          ? 'bg-[#D4AF37] text-[#222] border-[#D4AF37]'
                          : 'bg-white text-gray-600 border-[#EAE4DC] hover:border-gray-400'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>

                {/* Custom Size Adder */}
                <div className="flex gap-2 pt-2">
                  <input
                    type="text"
                    placeholder="Add custom size variant (e.g. 43, Large Bag, Free Size)..."
                    value={customSizeInput}
                    onChange={(e) => setCustomSizeInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addCustomSize();
                      }
                    }}
                    className="flex-1 px-3 py-1.5 bg-white border border-[#EAE4DC] rounded-lg text-xs"
                  />
                  <button
                    type="button"
                    onClick={addCustomSize}
                    className="px-3 py-1.5 bg-[#222] text-white rounded-lg text-xs font-semibold hover:bg-[#9E8055]"
                  >
                    + Add Size
                  </button>
                </div>
              </div>

              {/* IMAGE UPLOAD & GALLERY SECTION */}
              <div className="bg-white p-4 rounded-xl border border-[#EAE4DC] space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-[#222] text-sm flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-[#8B5E34]" />
                    <span>Product Images Gallery ({productImages.length} attached)</span>
                  </label>
                  <span className="text-[11px] text-gray-500">Upload multiple photos for front/back slider views</span>
                </div>

                {/* Drag and Drop / File Input Box */}
                <div className="border-2 border-dashed border-[#D4AF37]/50 rounded-xl p-4 bg-white text-center hover:border-[#8B5E34] transition cursor-pointer relative group">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="flex flex-col items-center justify-center space-y-2 pointer-events-none">
                    <div className="p-3 bg-white border border-[#EAE4DC] rounded-full text-[#8B5E34] group-hover:scale-110 transition-transform shadow-2xs">
                      <Upload className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-xs text-[#222]">Click or Drag & Drop Images Here to Upload</p>
                      <p className="text-[11px] text-gray-400">Supports JPG, PNG, WEBP from your computer or mobile camera</p>
                    </div>
                  </div>
                </div>

                {/* Alternative: Add Image URL Input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="Or paste image URL (e.g. https://...)"
                    className="flex-1 px-3 py-2 bg-white border border-[#EAE4DC] rounded-lg text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddUrlImage}
                    className="px-4 py-2 bg-[#8B5E34] text-white text-xs font-semibold rounded-lg hover:bg-[#6D4928] transition"
                  >
                    + Add Image Link
                  </button>
                </div>

                {/* Image Thumbnails Gallery Grid */}
                {productImages.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 pt-2">
                    {productImages.map((imgUrl, index) => (
                      <div key={index} className="relative group aspect-[3/4] bg-white rounded-lg border border-[#EAE4DC] overflow-hidden shadow-sm">
                        <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                        
                        {/* Primary Badge */}
                        {index === 0 ? (
                          <span className="absolute top-1 left-1 px-1.5 py-0.5 bg-[#8B5E34] text-white text-[9px] font-bold rounded flex items-center gap-1">
                            <Star className="w-2.5 h-2.5 fill-current" /> Cover
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleMakePrimaryImage(index)}
                            className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 transition px-1.5 py-0.5 bg-black/70 text-white text-[9px] font-semibold rounded"
                          >
                            Set Cover
                          </button>
                        )}

                        {/* Remove Image Button */}
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="absolute top-1 right-1 p-1 bg-red-600/90 hover:bg-red-700 text-white rounded-full opacity-0 group-hover:opacity-100 transition"
                          title="Remove Image"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block font-bold text-[#222] mb-1">Product Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#EAE4DC] rounded-lg focus:ring-1 focus:ring-[#9E8055]"
                />
              </div>

              {/* Toggles */}
              <div className="flex flex-wrap gap-4 pt-2 border-t border-[#EAE4DC]">
                <label className="flex items-center space-x-2 font-semibold text-[#222]">
                  <input type="checkbox" checked={isNewArrival} onChange={(e) => setIsNewArrival(e.target.checked)} className="accent-[#9E8055] w-4 h-4" />
                  <span>Mark as New Arrival</span>
                </label>
                <label className="flex items-center space-x-2 font-semibold text-[#222]">
                  <input type="checkbox" checked={isBestSeller} onChange={(e) => setIsBestSeller(e.target.checked)} className="accent-[#9E8055] w-4 h-4" />
                  <span>Mark as Best Seller</span>
                </label>
                <label className="flex items-center space-x-2 font-semibold text-[#222]">
                  <input type="checkbox" checked={isSale} onChange={(e) => setIsSale(e.target.checked)} className="accent-[#9E8055] w-4 h-4" />
                  <span>Mark on Sale</span>
                </label>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-[#EAE4DC] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 border border-[#EAE4DC] text-[#222] font-semibold rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#222222] text-white font-bold uppercase tracking-wider rounded-lg hover:bg-[#8B5E34] transition shadow-md"
                >
                  {editingProduct ? 'Save Product Specs' : 'Publish Product'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
