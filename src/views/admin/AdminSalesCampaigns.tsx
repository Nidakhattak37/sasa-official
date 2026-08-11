import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatPrice } from '../../utils/currency';
import { normalizeImageUrl, handleImageError, DEFAULT_FALLBACK_IMAGE } from '../../utils/imageUrl';
import { SaleCampaign } from '../../types';
import {
  Percent, Tag, Plus, CheckCircle2, AlertCircle, Trash2, Play, Pause,
  RotateCcw, Sparkles, Calendar, Layers, Search, ArrowRight, Eye
} from 'lucide-react';

const PIECE_OPTIONS = [
  '3 Piece',
  '2 Piece',
  '1 Piece / Kurti',
  'Footwear / Shoes',
  'Watches',
  'Handbags & Clutches',
  'Jewelry',
  'Fragrance / Perfume'
];

const YEAR_OPTIONS = ['2026', '2025', '2024', '2023', '2022', '2021', '2020'];

export const AdminSalesCampaigns: React.FC = () => {
  const {
    products, categories, currency,
    saleCampaigns, addSaleCampaign, updateSaleCampaign, deleteSaleCampaign,
    applySaleCampaign, revertSaleCampaign, restoreAllOriginalPrices,
    setSelectedProductId, setCurrentView
  } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<SaleCampaign | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [targetType, setTargetType] = useState<'year' | 'pieceType' | 'category' | 'all'>('year');
  const [targetValue, setTargetValue] = useState<string>('2024');
  const [discountPercentage, setDiscountPercentage] = useState<number>(25);
  const [isActive, setIsActive] = useState<boolean>(true);

  // Search & Filter
  const [searchFilter, setSearchFilter] = useState('');

  const openCreateModal = () => {
    setEditingCampaign(null);
    setName('');
    setTargetType('year');
    setTargetValue('2024');
    setDiscountPercentage(20);
    setIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (campaign: SaleCampaign) => {
    setEditingCampaign(campaign);
    setName(campaign.name);
    setTargetType(campaign.targetType);
    setTargetValue(campaign.targetValue || '');
    setDiscountPercentage(campaign.discountPercentage);
    setIsActive(campaign.isActive);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const payload = {
      name: name.trim(),
      targetType,
      targetValue: targetType === 'all' ? 'All Catalog Items' : targetValue,
      discountPercentage: Number(discountPercentage),
      isActive
    };

    if (editingCampaign) {
      updateSaleCampaign({
        ...editingCampaign,
        ...payload
      });
    } else {
      addSaleCampaign(payload);
    }
    setIsModalOpen(false);
  };

  // Calculate matching products for simulation preview
  const getMatchingCount = (type: string, val: string) => {
    return products.filter(p => {
      if (type === 'year') {
        return String(p.year) === String(val);
      }
      if (type === 'pieceType') {
        return (p.pieceType || '').toLowerCase() === val.toLowerCase();
      }
      if (type === 'category') {
        const pCat = (p.category || '').toLowerCase();
        const tCat = val.toLowerCase();
        return pCat.includes(tCat) || tCat.includes(pCat);
      }
      if (type === 'all') return true;
      return false;
    }).length;
  };

  const previewMatchingCount = getMatchingCount(targetType, targetValue);
  const activeSalesCount = saleCampaigns.filter(c => c.isActive).length;
  const productsOnSale = products.filter(p => p.isSale);

  return (
    <div className="space-y-8 animate-in fade-in bg-white min-h-screen">
      
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-[#EAE4DC] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-serif text-2xl font-bold text-[#222]">Sale & Discount Campaigns</h2>
            <span className="px-2.5 py-0.5 bg-[#8B5E34] text-white text-[10px] font-bold uppercase tracking-wider rounded-full shadow-2xs">
              {activeSalesCount} Active
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Configure automated sales campaigns targeted by <strong>Collection Year</strong> (e.g. 2024 archive), <strong>Item / Piece Type</strong> (3-Piece, Footwear, etc.), or <strong>Category</strong> with custom percentage discounts.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => {
              if (window.confirm('Reset all product prices back to their original retail amounts and deactivate active sales?')) {
                restoreAllOriginalPrices();
              }
            }}
            className="px-3.5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg transition flex items-center gap-1.5 border border-gray-300"
            title="Revert all products to original prices"
          >
            <RotateCcw className="w-3.5 h-3.5 text-gray-600" />
            <span>Reset All Prices</span>
          </button>

          <button
            onClick={openCreateModal}
            className="px-5 py-2.5 bg-[#222222] hover:bg-[#8B5E34] text-white text-xs font-semibold uppercase tracking-wider rounded-lg transition flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>+ Create Sale Campaign</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white border border-[#EAE4DC] rounded-xl shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] text-gray-500 font-medium block">Active Campaigns</span>
            <span className="text-2xl font-bold text-[#222]">{activeSalesCount}</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-green-50 text-green-700 flex items-center justify-center border border-green-200">
            <Percent className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white border border-[#EAE4DC] rounded-xl shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] text-gray-500 font-medium block">Products Currently on Sale</span>
            <span className="text-2xl font-bold text-[#8B5E34]">{productsOnSale.length}</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-[#F5F1EC] text-[#8B5E34] flex items-center justify-center border border-[#EAE4DC]">
            <Tag className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white border border-[#EAE4DC] rounded-xl shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] text-gray-500 font-medium block">Total Catalog Items</span>
            <span className="text-2xl font-bold text-[#222]">{products.length}</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-gray-50 text-gray-700 flex items-center justify-center border border-gray-200">
            <Layers className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Campaigns List */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-serif text-lg font-bold text-[#222]">Configured Sale Rules</h3>
          <span className="text-xs text-gray-500">{saleCampaigns.length} Campaign Rules</span>
        </div>

        {saleCampaigns.length === 0 ? (
          <div className="p-12 text-center bg-white border border-dashed border-[#EAE4DC] rounded-2xl space-y-3">
            <Percent className="w-12 h-12 text-gray-300 mx-auto" />
            <h4 className="font-bold text-gray-700">No Sale Campaigns Created</h4>
            <p className="text-xs text-gray-500 max-w-md mx-auto">
              Create your first sale campaign to put specific collection years (e.g. 2024 items), piece types (e.g. 3-Piece), or categories on discount.
            </p>
            <button
              onClick={openCreateModal}
              className="px-4 py-2 bg-[#222] text-white text-xs font-semibold rounded-lg hover:bg-[#8B5E34] transition"
            >
              + Create First Campaign
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {saleCampaigns.map(camp => {
              const matchedCount = getMatchingCount(camp.targetType, camp.targetValue || '');

              return (
                <div
                  key={camp.id}
                  className={`p-5 rounded-xl border transition-all ${
                    camp.isActive
                      ? 'bg-white border-[#8B5E34] shadow-md ring-1 ring-[#8B5E34]/20'
                      : 'bg-[#FAFAF9] border-[#EAE4DC] opacity-80'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded ${
                          camp.isActive
                            ? 'bg-green-100 text-green-800 border border-green-200'
                            : 'bg-gray-200 text-gray-600'
                        }`}>
                          {camp.isActive ? '● ACTIVE SALE' : 'PAUSED'}
                        </span>

                        <span className="px-2 py-0.5 bg-[#8B5E34] text-white text-[10px] font-bold rounded">
                          {camp.discountPercentage}% OFF
                        </span>
                      </div>

                      <h4 className="font-bold text-base text-[#222] pt-1">{camp.name}</h4>
                    </div>

                    {/* Quick Toggle Button */}
                    <button
                      onClick={() => {
                        if (camp.isActive) {
                          revertSaleCampaign(camp.id);
                        } else {
                          applySaleCampaign(camp.id);
                        }
                      }}
                      className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                        camp.isActive
                          ? 'bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100'
                          : 'bg-green-600 text-white hover:bg-green-700 shadow-xs'
                      }`}
                      title={camp.isActive ? 'Pause & revert prices' : 'Activate & apply discount'}
                    >
                      {camp.isActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                      <span>{camp.isActive ? 'Pause Sale' : 'Activate'}</span>
                    </button>
                  </div>

                  {/* Target Scope Details */}
                  <div className="mt-4 pt-3 border-t border-[#EAE4DC] grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-gray-400 block text-[10px] uppercase font-medium">Target Criteria</span>
                      <span className="font-semibold text-[#222] capitalize">
                        {camp.targetType === 'year' ? `Collection Year: ${camp.targetValue}` :
                         camp.targetType === 'pieceType' ? `Item Type: ${camp.targetValue}` :
                         camp.targetType === 'category' ? `Category: ${camp.targetValue}` : 'Entire Catalog'}
                      </span>
                    </div>

                    <div>
                      <span className="text-gray-400 block text-[10px] uppercase font-medium">Matching Items</span>
                      <span className="font-bold text-[#8B5E34]">
                        {matchedCount} products in stock
                      </span>
                    </div>
                  </div>

                  {/* Footer Actions */}
                  <div className="mt-4 pt-3 border-t border-[#EAE4DC] flex justify-between items-center text-xs">
                    <span className="text-[11px] text-gray-400">Created: {camp.createdAt}</span>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => openEditModal(camp)}
                        className="px-2.5 py-1 text-gray-600 hover:text-black hover:bg-gray-100 rounded font-medium transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Delete sale campaign "${camp.name}"?`)) {
                            deleteSaleCampaign(camp.id);
                          }
                        }}
                        className="p-1 text-gray-400 hover:text-red-600 rounded transition"
                        title="Delete Campaign"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Products Currently on Sale Table */}
      <div className="space-y-3 pt-4 border-t border-[#EAE4DC]">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
          <div>
            <h3 className="font-serif text-lg font-bold text-[#222]">Live Discounted Inventory</h3>
            <p className="text-xs text-gray-500">All products currently reflecting discounted prices on the storefront.</p>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Filter on-sale items..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs bg-white border border-[#EAE4DC] rounded-lg focus:outline-none focus:border-[#8B5E34]"
            />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#EAE4DC] overflow-hidden shadow-xs">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#1E1E24] text-[#D5D5D5] uppercase text-[10px] tracking-wider border-b border-[#2E2E38]">
                <th className="p-3">Product Name</th>
                <th className="p-3">Target Specs</th>
                <th className="p-3">Original Price</th>
                <th className="p-3">Sale Price</th>
                <th className="p-3">Discount</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAE4DC]">
              {productsOnSale.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-400">
                    No products are currently on sale. Activate a campaign or create one above.
                  </td>
                </tr>
              ) : (
                productsOnSale
                  .filter(p => p.name.toLowerCase().includes(searchFilter.toLowerCase()) || p.sku.toLowerCase().includes(searchFilter.toLowerCase()))
                  .map(p => {
                    const discount = p.originalPrice && p.originalPrice > p.price
                      ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)
                      : null;

                    return (
                      <tr key={p.id} className="hover:bg-amber-50/30 transition">
                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={normalizeImageUrl(p.images?.[0])}
                              alt=""
                              referrerPolicy="no-referrer"
                              onError={(e) => handleImageError(e, DEFAULT_FALLBACK_IMAGE)}
                              className="w-10 h-12 object-cover rounded border border-[#EAE4DC]"
                            />
                            <div>
                              <span className="font-bold text-[#222] block">{p.name}</span>
                              <span className="text-[10px] text-gray-400 font-mono">{p.sku}</span>
                            </div>
                          </div>
                        </td>

                        <td className="p-3">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-xs font-semibold text-[#8B5E34]">{p.category}</span>
                            <div className="flex items-center gap-1">
                              {p.pieceType && (
                                <span className="px-1.5 py-0.2 bg-[#222] text-white text-[9px] font-bold rounded">
                                  {p.pieceType}
                                </span>
                              )}
                              {p.year && (
                                <span className="px-1.5 py-0.2 bg-[#F5F1EC] text-[#9E8055] text-[9px] font-bold rounded border border-[#EAE4DC]">
                                  Year: {p.year}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="p-3 text-gray-400 line-through">
                          {formatPrice(p.originalPrice || p.price, currency)}
                        </td>

                        <td className="p-3 font-bold text-[#222] text-sm">
                          {formatPrice(p.price, currency)}
                        </td>

                        <td className="p-3">
                          <span className="px-2 py-0.5 bg-[#8B5E34] text-white font-bold text-[10px] rounded">
                            {discount || 0}% OFF
                          </span>
                        </td>

                        <td className="p-3 text-right">
                          <button
                            onClick={() => {
                              setSelectedProductId(p.id);
                              setCurrentView('product-detail');
                            }}
                            className="p-1.5 text-gray-500 hover:text-black rounded"
                            title="View Storefront Page"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Campaign Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl p-6 sm:p-8 border border-[#EAE4DC] max-h-[90vh] overflow-y-auto">
            
            <div className="flex justify-between items-center border-b border-[#EAE4DC] pb-4 mb-5">
              <div>
                <h3 className="font-serif text-xl font-bold text-[#222]">
                  {editingCampaign ? 'Edit Sale Campaign' : 'Create New Sale Campaign'}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">Define target criteria (year, item type, category) and sale percentage.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-black p-1">
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-5 text-xs">
              
              {/* Campaign Name */}
              <div>
                <label className="block font-bold text-[#222] mb-1">Campaign Title *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. 2024 Archive Lawn Sale (30% Off)"
                  className="w-full px-3 py-2.5 bg-white border border-[#EAE4DC] rounded-lg focus:ring-1 focus:ring-[#8B5E34] font-medium"
                />
              </div>

              {/* Target Type Selection */}
              <div>
                <label className="block font-bold text-[#222] mb-1.5">Discount Target Criteria *</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'year', label: 'By Year', icon: <Calendar className="w-3.5 h-3.5" /> },
                    { id: 'pieceType', label: 'Item / Piece Type', icon: <Layers className="w-3.5 h-3.5" /> },
                    { id: 'category', label: 'By Category', icon: <Tag className="w-3.5 h-3.5" /> },
                    { id: 'all', label: 'All Catalog', icon: <Sparkles className="w-3.5 h-3.5" /> }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => {
                        setTargetType(tab.id as any);
                        if (tab.id === 'year') setTargetValue('2024');
                        if (tab.id === 'pieceType') setTargetValue(PIECE_OPTIONS[0]);
                        if (tab.id === 'category') setTargetValue(categories[0]?.name || 'Summer Lawn');
                        if (tab.id === 'all') setTargetValue('All Items');
                      }}
                      className={`p-2.5 rounded-lg border text-center flex flex-col items-center gap-1 font-semibold transition ${
                        targetType === tab.id
                          ? 'bg-[#222] text-white border-[#222] shadow-sm'
                          : 'bg-white text-gray-600 border-[#EAE4DC] hover:border-gray-400'
                      }`}
                    >
                      {tab.icon}
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Target Value Input / Select based on Target Type */}
              {targetType === 'year' && (
                <div>
                  <label className="block font-bold text-[#222] mb-1">Select Collection Year *</label>
                  <select
                    value={targetValue}
                    onChange={(e) => setTargetValue(e.target.value)}
                    className="w-full px-3 py-2.5 bg-white border border-[#EAE4DC] rounded-lg font-bold text-[#222] focus:ring-1 focus:ring-[#8B5E34]"
                  >
                    {YEAR_OPTIONS.map(yr => (
                      <option key={yr} value={yr}>Year {yr} ({getMatchingCount('year', yr)} items in inventory)</option>
                    ))}
                  </select>
                </div>
              )}

              {targetType === 'pieceType' && (
                <div>
                  <label className="block font-bold text-[#222] mb-1">Select Item / Piece Composition *</label>
                  <select
                    value={targetValue}
                    onChange={(e) => setTargetValue(e.target.value)}
                    className="w-full px-3 py-2.5 bg-white border border-[#EAE4DC] rounded-lg font-bold text-[#222] focus:ring-1 focus:ring-[#8B5E34]"
                  >
                    {PIECE_OPTIONS.map(opt => (
                      <option key={opt} value={opt}>{opt} ({getMatchingCount('pieceType', opt)} items)</option>
                    ))}
                  </select>
                </div>
              )}

              {targetType === 'category' && (
                <div>
                  <label className="block font-bold text-[#222] mb-1">Select Category to Discount *</label>
                  <select
                    value={targetValue}
                    onChange={(e) => setTargetValue(e.target.value)}
                    className="w-full px-3 py-2.5 bg-white border border-[#EAE4DC] rounded-lg font-bold text-[#222] focus:ring-1 focus:ring-[#8B5E34]"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.name}>{c.name} ({getMatchingCount('category', c.name)} items)</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Discount Percentage */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block font-bold text-[#222]">Discount Percentage (%) *</label>
                  <span className="font-bold text-[#8B5E34] text-sm">{discountPercentage}% OFF</span>
                </div>
                
                {/* Presets */}
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {[10, 15, 20, 25, 30, 40, 50, 70].map(pct => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setDiscountPercentage(pct)}
                      className={`px-2.5 py-1 rounded text-xs font-bold border transition ${
                        discountPercentage === pct
                          ? 'bg-[#8B5E34] text-white border-[#8B5E34]'
                          : 'bg-white text-gray-700 border-[#EAE4DC] hover:border-gray-400'
                      }`}
                    >
                      {pct}%
                    </button>
                  ))}
                </div>

                <input
                  type="number"
                  min={1}
                  max={99}
                  required
                  value={discountPercentage}
                  onChange={(e) => setDiscountPercentage(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-[#EAE4DC] rounded-lg font-bold"
                />
              </div>

              {/* Live Preview Simulation Box */}
              <div className="p-4 bg-[#F5F1EC] rounded-xl border border-[#EAE4DC] space-y-2">
                <div className="flex items-center gap-1.5 text-[#8B5E34] font-bold">
                  <Sparkles className="w-4 h-4" />
                  <span>Campaign Impact Simulation</span>
                </div>

                <div className="text-xs text-[#222] space-y-1">
                  <p>
                    • Will apply to <strong>{previewMatchingCount} products</strong> matching target: <em>{targetValue}</em>
                  </p>
                  <p>
                    • Example Price: PKR 15,000 → <strong className="text-[#8B5E34]">PKR {Math.round(15000 * ((100 - discountPercentage) / 100)).toLocaleString()}</strong> ({discountPercentage}% OFF)
                  </p>
                </div>
              </div>

              {/* Active Toggle */}
              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 rounded text-[#8B5E34] focus:ring-[#8B5E34]"
                />
                <span className="font-semibold text-gray-700">Activate and apply discounts immediately on save</span>
              </label>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-3 border-t border-[#EAE4DC]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 text-gray-600 font-semibold hover:bg-gray-100 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#222222] hover:bg-[#8B5E34] text-white font-semibold rounded-lg uppercase tracking-wider transition shadow-sm"
                >
                  {editingCampaign ? 'Save Changes' : 'Launch Sale Campaign'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
