import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatPrice } from '../../utils/currency';
import { normalizeImageUrl, handleImageError, DEFAULT_FALLBACK_IMAGE } from '../../utils/imageUrl';
import { SaleCampaign } from '../../types';
import { isCampaignActive, calculateCampaignPricePreview, getProductEffectivePricing } from '../../utils/campaignUtils';
import {
  Percent, Tag, Plus, CheckCircle2, AlertCircle, Trash2, Play, Pause,
  RotateCcw, Sparkles, Calendar, Layers, Search, ArrowRight, Eye, Image as ImageIcon,
  DollarSign, Download, Clock, BarChart3, TrendingUp, Check
} from 'lucide-react';

const CAMPAIGN_PRESETS = [
  'Eid Sale',
  'Summer Sale',
  'Independence Day Sale',
  'Winter Sale',
  'Clearance Sale',
  'Flat 20% Off',
  'End of Season Sale'
];

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
    products, categories, currency, orders,
    saleCampaigns, addSaleCampaign, updateSaleCampaign, deleteSaleCampaign,
    setSelectedProductId, setCurrentView
  } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<SaleCampaign | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState<number>(20);
  const [targetType, setTargetType] = useState<'year' | 'pieceType' | 'category' | 'all'>('all');
  const [targetValue, setTargetValue] = useState<string>('All Items');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');
  const [bannerUrl, setBannerUrl] = useState<string>('');
  const [bannerPreview, setBannerPreview] = useState<string>('');

  // Search & Filter
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedCampaignReport, setSelectedCampaignReport] = useState<SaleCampaign | null>(null);

  const openCreateModal = () => {
    const now = new Date();
    const end = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000); // 14 days later

    const nowStr = now.toISOString().slice(0, 16);
    const endStr = end.toISOString().slice(0, 16);

    setEditingCampaign(null);
    setName('Summer Sale');
    setDiscountType('percentage');
    setDiscountValue(20);
    setTargetType('all');
    setTargetValue('All Items');
    setStartDate(nowStr);
    setEndDate(endStr);
    setStatus('Active');
    setBannerUrl('');
    setBannerPreview('');
    setIsModalOpen(true);
  };

  const openEditModal = (campaign: SaleCampaign) => {
    setEditingCampaign(campaign);
    setName(campaign.name);
    setDiscountType(campaign.discountType || 'percentage');
    setDiscountValue(campaign.discountValue ?? campaign.discountPercentage ?? 20);
    setTargetType(campaign.targetType || 'all');
    setTargetValue(campaign.targetValue || 'All Items');

    // Format dates for datetime-local
    let sDate = campaign.startDate || '';
    if (sDate && !sDate.includes('T')) sDate = `${sDate}T00:00`;
    let eDate = campaign.endDate || '';
    if (eDate && !eDate.includes('T')) eDate = `${eDate}T23:59`;

    setStartDate(sDate);
    setEndDate(eDate);
    setStatus(campaign.status || (campaign.isActive ? 'Active' : 'Inactive'));
    setBannerUrl(campaign.bannerUrl || '');
    setBannerPreview(campaign.bannerUrl || '');
    setIsModalOpen(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setBannerUrl(result);
        setBannerPreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const isActiveFlag = status === 'Active';
    const payload = {
      name: name.trim(),
      discountType,
      discountValue: Number(discountValue),
      discountPercentage: discountType === 'percentage' ? Number(discountValue) : 0,
      targetType,
      targetValue: targetType === 'all' ? 'All Catalog Items' : targetValue,
      startDate: startDate ? startDate.replace('T', ' ') : '',
      endDate: endDate ? endDate.replace('T', ' ') : '',
      status,
      isActive: isActiveFlag,
      bannerUrl
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

  // Calculate matching products for campaign
  const getMatchingProducts = (campaign: Partial<SaleCampaign>) => {
    return products.filter(p => {
      // Direct assignment check first
      if (p.campaignId && campaign.id && p.campaignId === campaign.id) return true;
      if (p.isOnSale && p.campaignId === campaign.id) return true;

      const type = campaign.targetType || 'all';
      const val = campaign.targetValue || '';

      if (type === 'year') return String(p.year) === String(val);
      if (type === 'pieceType') return (p.pieceType || '').toLowerCase() === val.toLowerCase();
      if (type === 'category') {
        const pCat = (p.category || '').toLowerCase();
        const tCat = val.toLowerCase();
        return pCat.includes(tCat) || tCat.includes(pCat);
      }
      if (type === 'all') return true;
      return false;
    });
  };

  const activeSalesCount = saleCampaigns.filter(c => isCampaignActive(c)).length;
  
  // Collect all products currently on active sale
  const productsOnSale = products.filter(p => {
    const pricing = getProductEffectivePricing(p, saleCampaigns);
    return pricing.isOnSale;
  });

  // Calculate campaign analytics from orders
  const getCampaignAnalytics = (campaign: SaleCampaign) => {
    let unitsSold = 0;
    let totalRevenue = 0;
    const matchingProds = getMatchingProducts(campaign);
    const matchingIds = new Set(matchingProds.map(p => p.id));

    orders.forEach(ord => {
      ord.items.forEach(item => {
        if (item.campaignId === campaign.id || matchingIds.has(item.productId)) {
          unitsSold += item.quantity;
          totalRevenue += (item.price || item.product?.price || 0) * item.quantity;
        }
      });
    });

    return {
      matchingCount: matchingProds.length,
      unitsSold,
      totalRevenue
    };
  };

  // Export Sales Report to CSV
  const handleExportCSV = (campaign?: SaleCampaign) => {
    const reportData = (campaign ? [campaign] : saleCampaigns).map(c => {
      const stats = getCampaignAnalytics(c);
      return {
        'Campaign ID': c.id,
        'Campaign Name': c.name,
        'Discount Type': c.discountType || 'percentage',
        'Discount Value': c.discountValue ?? c.discountPercentage ?? 0,
        'Start Date': c.startDate || 'Immediate',
        'End Date': c.endDate || 'No Expiry',
        'Status': isCampaignActive(c) ? 'Active' : 'Inactive',
        'Products Count': stats.matchingCount,
        'Units Sold': stats.unitsSold,
        'Total Revenue (PKR)': stats.totalRevenue
      };
    });

    if (reportData.length === 0) return;

    const headers = Object.keys(reportData[0]).join(',');
    const rows = reportData.map(r => Object.values(r).map(v => `"${v}"`).join(',')).join('\n');
    const csvContent = `data:text/csv;charset=utf-8,${headers}\n${rows}`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SASA_Sale_Campaign_Report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 animate-in fade-in bg-white min-h-screen pb-12">
      
      {/* Header & Main Actions */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-[#EAE4DC] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-serif text-2xl font-bold text-[#222]">Sale & Discount Campaigns</h2>
            <span className="px-2.5 py-0.5 bg-[#8B5E34] text-white text-[10px] font-bold uppercase tracking-wider rounded-full shadow-2xs">
              {activeSalesCount} Active Live
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Create date-based promotional campaigns (Eid, Summer, Clearance) with percentage or fixed amount discounts.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => handleExportCSV()}
            className="px-3.5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold rounded-lg transition flex items-center gap-1.5 border border-gray-300"
            title="Export Sale Report to CSV"
          >
            <Download className="w-3.5 h-3.5 text-gray-600" />
            <span>Export Campaign Report</span>
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
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
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
            <span className="text-[11px] text-gray-500 font-medium block">Total Campaign Rules</span>
            <span className="text-2xl font-bold text-[#222]">{saleCampaigns.length}</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-gray-50 text-gray-700 flex items-center justify-center border border-gray-200">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white border border-[#EAE4DC] rounded-xl shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] text-gray-500 font-medium block">Catalog Total</span>
            <span className="text-2xl font-bold text-gray-800">{products.length}</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Campaigns Grid */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-serif text-lg font-bold text-[#222]">Configured Sale & Discount Campaigns</h3>
          <span className="text-xs text-gray-500">{saleCampaigns.length} Total Campaigns</span>
        </div>

        {saleCampaigns.length === 0 ? (
          <div className="p-12 text-center bg-white border border-dashed border-[#EAE4DC] rounded-2xl space-y-3">
            <Percent className="w-12 h-12 text-gray-300 mx-auto" />
            <h4 className="font-bold text-gray-700">No Sale Campaigns Created Yet</h4>
            <p className="text-xs text-gray-500 max-w-md mx-auto">
              Create campaigns like Summer Sale, Eid Promo, or Flat 20% Off to dynamically offer discounts across products.
            </p>
            <button
              onClick={openCreateModal}
              className="px-4 py-2 bg-[#222] text-white text-xs font-semibold rounded-lg hover:bg-[#8B5E34] transition"
            >
              + Create First Campaign
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {saleCampaigns.map(camp => {
              const activeNow = isCampaignActive(camp);
              const stats = getCampaignAnalytics(camp);

              return (
                <div
                  key={camp.id}
                  className={`relative p-5 rounded-xl border transition-all flex flex-col justify-between ${
                    activeNow
                      ? 'bg-white border-[#8B5E34] shadow-md ring-1 ring-[#8B5E34]/20'
                      : 'bg-[#FAFAF9] border-[#EAE4DC] opacity-90'
                  }`}
                >
                  {/* Banner Image Preview Header */}
                  {camp.bannerUrl && (
                    <div className="mb-3 rounded-lg overflow-hidden h-24 bg-gray-100 relative border border-[#EAE4DC]">
                      <img
                        src={normalizeImageUrl(camp.bannerUrl)}
                        alt={camp.name}
                        referrerPolicy="no-referrer"
                        onError={(e) => handleImageError(e, DEFAULT_FALLBACK_IMAGE)}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-2.5">
                        <span className="text-white text-xs font-bold drop-shadow">{camp.name}</span>
                      </div>
                    </div>
                  )}

                  <div>
                    {/* Status & Discount Tags */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-1.5">
                        <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded ${
                          activeNow
                            ? 'bg-green-100 text-green-800 border border-green-200'
                            : 'bg-gray-200 text-gray-600'
                        }`}>
                          {activeNow ? '● ACTIVE SALE' : 'INACTIVE / EXPIRED'}
                        </span>

                        <span className="px-2 py-0.5 bg-[#8B5E34] text-white text-[10px] font-bold rounded">
                          {camp.discountType === 'fixed'
                            ? `PKR ${camp.discountValue?.toLocaleString()} OFF`
                            : `${camp.discountValue ?? camp.discountPercentage}% OFF`}
                        </span>
                      </div>

                      {/* Quick Toggle Button */}
                      <button
                        onClick={() => {
                          const nextStatus = activeNow ? 'Inactive' : 'Active';
                          updateSaleCampaign({
                            ...camp,
                            status: nextStatus,
                            isActive: nextStatus === 'Active'
                          });
                        }}
                        className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
                          activeNow
                            ? 'bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100'
                            : 'bg-green-600 text-white hover:bg-green-700 shadow-xs'
                        }`}
                        title={activeNow ? 'Pause Campaign' : 'Activate Campaign'}
                      >
                        {activeNow ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                        <span>{activeNow ? 'Pause' : 'Activate'}</span>
                      </button>
                    </div>

                    {!camp.bannerUrl && (
                      <h4 className="font-serif font-bold text-base text-[#222] pt-1 mb-1">{camp.name}</h4>
                    )}

                    {/* Validity Schedule */}
                    <div className="text-[11px] text-gray-500 space-y-1 my-2 bg-[#F5F1EC] p-2.5 rounded-lg border border-[#EAE4DC]">
                      <div className="flex items-center gap-1.5 text-[#222] font-semibold">
                        <Clock className="w-3.5 h-3.5 text-[#8B5E34]" />
                        <span>Validity Schedule:</span>
                      </div>
                      <div className="grid grid-cols-2 gap-1 text-[10px] text-gray-600 pt-0.5">
                        <div>Start: <strong>{camp.startDate || 'Immediate'}</strong></div>
                        <div>End: <strong>{camp.endDate || 'No Expiry'}</strong></div>
                      </div>
                    </div>

                    {/* Scope & Performance Stats */}
                    <div className="grid grid-cols-2 gap-2 text-xs py-2 border-t border-[#EAE4DC] mt-2">
                      <div>
                        <span className="text-gray-400 block text-[10px] uppercase font-medium">Target Scope</span>
                        <span className="font-semibold text-[#222] truncate block">
                          {camp.targetType === 'year' ? `Year ${camp.targetValue}` :
                           camp.targetType === 'pieceType' ? `${camp.targetValue}` :
                           camp.targetType === 'category' ? `${camp.targetValue}` : 'Entire Catalog'}
                        </span>
                      </div>

                      <div>
                        <span className="text-gray-400 block text-[10px] uppercase font-medium">Products Included</span>
                        <span className="font-bold text-[#8B5E34]">
                          {stats.matchingCount} items
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer Actions */}
                  <div className="mt-3 pt-3 border-t border-[#EAE4DC] flex justify-between items-center text-xs">
                    <button
                      onClick={() => setSelectedCampaignReport(camp)}
                      className="text-[11px] font-semibold text-[#8B5E34] hover:underline flex items-center gap-1"
                    >
                      <BarChart3 className="w-3.5 h-3.5" />
                      <span>View Performance Report</span>
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(camp)}
                        className="px-2.5 py-1 text-gray-700 hover:text-black hover:bg-gray-200 rounded font-semibold transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Delete campaign "${camp.name}"?`)) {
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

      {/* Campaign Detailed Performance Modal */}
      {selectedCampaignReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl p-6 sm:p-8 border border-[#EAE4DC] max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-[#EAE4DC] pb-4 mb-5">
              <div>
                <h3 className="font-serif text-xl font-bold text-[#222]">
                  Campaign Performance Report: {selectedCampaignReport.name}
                </h3>
                <p className="text-xs text-gray-500">Live analytics on sales, units ordered, and product coverage.</p>
              </div>
              <button onClick={() => setSelectedCampaignReport(null)} className="text-gray-400 hover:text-black p-1 text-lg font-bold">
                ✕
              </button>
            </div>

            {(() => {
              const stats = getCampaignAnalytics(selectedCampaignReport);
              const matchingProds = getMatchingProducts(selectedCampaignReport);

              return (
                <div className="space-y-6 text-xs">
                  {/* KPI Summary */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3.5 bg-[#F5F1EC] rounded-xl border border-[#EAE4DC]">
                      <span className="text-[10px] text-gray-500 uppercase font-bold block">Items Included</span>
                      <span className="text-xl font-bold text-[#222]">{stats.matchingCount}</span>
                    </div>

                    <div className="p-3.5 bg-green-50 rounded-xl border border-green-200">
                      <span className="text-[10px] text-green-700 uppercase font-bold block">Units Sold</span>
                      <span className="text-xl font-bold text-green-800">{stats.unitsSold}</span>
                    </div>

                    <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200">
                      <span className="text-[10px] text-amber-800 uppercase font-bold block">Gross Revenue</span>
                      <span className="text-xl font-bold text-amber-900">
                        {formatPrice(stats.totalRevenue, currency)}
                      </span>
                    </div>
                  </div>

                  {/* Included Products Listing */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-bold text-[#222] text-sm">Products Included in Campaign ({matchingProds.length})</h4>
                      <button
                        onClick={() => handleExportCSV(selectedCampaignReport)}
                        className="px-2.5 py-1 bg-[#222] text-white text-[11px] font-bold rounded hover:bg-[#8B5E34] transition flex items-center gap-1"
                      >
                        <Download className="w-3 h-3" />
                        <span>Export CSV</span>
                      </button>
                    </div>

                    <div className="max-h-60 overflow-y-auto border border-[#EAE4DC] rounded-xl divide-y divide-[#EAE4DC]">
                      {matchingProds.map(p => {
                        const pricing = getProductEffectivePricing(p, [selectedCampaignReport]);
                        return (
                          <div key={p.id} className="p-3 flex items-center justify-between hover:bg-gray-50">
                            <div className="flex items-center gap-3">
                              <img
                                src={normalizeImageUrl(p.images?.[0])}
                                alt=""
                                className="w-9 h-11 object-cover rounded border border-[#EAE4DC]"
                              />
                              <div>
                                <span className="font-bold text-[#222] block">{p.name}</span>
                                <span className="text-[10px] text-gray-400 font-mono">{p.sku} • {p.category}</span>
                              </div>
                            </div>

                            <div className="text-right">
                              <span className="text-xs text-gray-400 line-through block">
                                {formatPrice(pricing.originalPrice, currency)}
                              </span>
                              <span className="text-xs font-bold text-[#8B5E34]">
                                {formatPrice(pricing.effectivePrice, currency)}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex justify-end pt-3 border-t border-[#EAE4DC]">
                    <button
                      onClick={() => setSelectedCampaignReport(null)}
                      className="px-5 py-2 bg-[#222] text-white font-semibold rounded-lg hover:bg-[#8B5E34]"
                    >
                      Close Report
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* On-Sale Products Table */}
      <div className="space-y-3 pt-6 border-t border-[#EAE4DC]">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
          <div>
            <h3 className="font-serif text-lg font-bold text-[#222]">Live Discounted Products</h3>
            <p className="text-xs text-gray-500">Products displaying active campaign sale pricing on storefront.</p>
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
                <th className="p-3">Applied Campaign</th>
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
                    No products are currently on sale. Activate a campaign or mark products on sale during product creation.
                  </td>
                </tr>
              ) : (
                productsOnSale
                  .filter(p => p.name.toLowerCase().includes(searchFilter.toLowerCase()) || p.sku.toLowerCase().includes(searchFilter.toLowerCase()))
                  .map(p => {
                    const pricing = getProductEffectivePricing(p, saleCampaigns);

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
                          <span className="px-2 py-0.5 bg-[#F5F1EC] text-[#8B5E34] text-[11px] font-bold rounded border border-[#EAE4DC]">
                            {pricing.campaign?.name || 'Direct On-Sale'}
                          </span>
                        </td>

                        <td className="p-3 text-gray-400 line-through">
                          {formatPrice(pricing.originalPrice, currency)}
                        </td>

                        <td className="p-3 font-bold text-[#222] text-sm">
                          {formatPrice(pricing.effectivePrice, currency)}
                        </td>

                        <td className="p-3">
                          <span className="px-2 py-0.5 bg-[#8B5E34] text-white font-bold text-[10px] rounded">
                            {pricing.discountAmount > 0 ? `PKR ${pricing.discountAmount.toLocaleString()} OFF` : 'ON SALE'}
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
                <p className="text-xs text-gray-500 mt-0.5">Configure campaign details, percentage/fixed discounts, start/end dates, and optional banner.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-black p-1 text-lg font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-5 text-xs">
              
              {/* Campaign Presets */}
              <div>
                <label className="block font-bold text-gray-600 mb-1">Quick Campaign Presets</label>
                <div className="flex flex-wrap gap-1.5">
                  {CAMPAIGN_PRESETS.map(preset => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setName(preset)}
                      className={`px-2.5 py-1 text-[11px] font-semibold rounded-md border transition ${
                        name === preset
                          ? 'bg-[#8B5E34] text-white border-[#8B5E34]'
                          : 'bg-gray-50 text-gray-700 border-[#EAE4DC] hover:border-gray-400'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Campaign Name */}
              <div>
                <label className="block font-bold text-[#222] mb-1">Campaign Title *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Summer Sale / Eid Special"
                  className="w-full px-3 py-2.5 bg-white border border-[#EAE4DC] rounded-lg focus:ring-1 focus:ring-[#8B5E34] font-medium text-sm"
                />
              </div>

              {/* Discount Type & Value */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-[#222] mb-1">Discount Type *</label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as any)}
                    className="w-full px-3 py-2.5 bg-white border border-[#EAE4DC] rounded-lg font-bold text-[#222]"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (PKR)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#222] mb-1">
                    Discount Value ({discountType === 'percentage' ? '%' : 'PKR'}) *
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={discountValue}
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                    className="w-full px-3 py-2.5 bg-white border border-[#EAE4DC] rounded-lg font-bold text-[#222]"
                  />
                </div>
              </div>

              {/* Validity Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-[#222] mb-1">Start Date & Time *</label>
                  <input
                    type="datetime-local"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#EAE4DC] rounded-lg font-medium text-[#222]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#222] mb-1">End Date & Time *</label>
                  <input
                    type="datetime-local"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#EAE4DC] rounded-lg font-medium text-[#222]"
                  />
                </div>
              </div>

              {/* Target Type Selection */}
              <div>
                <label className="block font-bold text-[#222] mb-1.5">Target Criteria *</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'all', label: 'All Catalog', icon: <Sparkles className="w-3.5 h-3.5" /> },
                    { id: 'category', label: 'By Category', icon: <Tag className="w-3.5 h-3.5" /> },
                    { id: 'pieceType', label: 'Item / Piece', icon: <Layers className="w-3.5 h-3.5" /> },
                    { id: 'year', label: 'By Year', icon: <Calendar className="w-3.5 h-3.5" /> }
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

              {/* Target Value Dropdown */}
              {targetType === 'category' && (
                <div>
                  <label className="block font-bold text-[#222] mb-1">Select Target Category</label>
                  <select
                    value={targetValue}
                    onChange={(e) => setTargetValue(e.target.value)}
                    className="w-full px-3 py-2.5 bg-white border border-[#EAE4DC] rounded-lg font-bold text-[#222]"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {targetType === 'pieceType' && (
                <div>
                  <label className="block font-bold text-[#222] mb-1">Select Item Composition</label>
                  <select
                    value={targetValue}
                    onChange={(e) => setTargetValue(e.target.value)}
                    className="w-full px-3 py-2.5 bg-white border border-[#EAE4DC] rounded-lg font-bold text-[#222]"
                  >
                    {PIECE_OPTIONS.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              )}

              {targetType === 'year' && (
                <div>
                  <label className="block font-bold text-[#222] mb-1">Select Collection Year</label>
                  <select
                    value={targetValue}
                    onChange={(e) => setTargetValue(e.target.value)}
                    className="w-full px-3 py-2.5 bg-white border border-[#EAE4DC] rounded-lg font-bold text-[#222]"
                  >
                    {YEAR_OPTIONS.map(yr => (
                      <option key={yr} value={yr}>Year {yr}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Campaign Banner Upload */}
              <div>
                <label className="block font-bold text-[#222] mb-1">Campaign Banner Image (Optional)</label>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    placeholder="Image URL or upload below..."
                    value={bannerUrl}
                    onChange={(e) => {
                      setBannerUrl(e.target.value);
                      setBannerPreview(e.target.value);
                    }}
                    className="flex-1 px-3 py-2 bg-white border border-[#EAE4DC] rounded-lg text-xs"
                  />
                  <label className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg cursor-pointer text-xs font-semibold flex items-center gap-1 border border-gray-300">
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Upload</span>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                </div>
                {bannerPreview && (
                  <div className="mt-2 h-20 rounded-lg overflow-hidden border border-[#EAE4DC] bg-gray-50">
                    <img src={normalizeImageUrl(bannerPreview)} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              {/* Status Selector */}
              <div>
                <label className="block font-bold text-[#222] mb-1">Campaign Status *</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="campaignStatus"
                      value="Active"
                      checked={status === 'Active'}
                      onChange={() => setStatus('Active')}
                      className="text-[#8B5E34] focus:ring-[#8B5E34]"
                    />
                    <span className="font-semibold text-green-800">Active</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="campaignStatus"
                      value="Inactive"
                      checked={status === 'Inactive'}
                      onChange={() => setStatus('Inactive')}
                      className="text-[#8B5E34] focus:ring-[#8B5E34]"
                    />
                    <span className="font-semibold text-gray-600">Inactive</span>
                  </label>
                </div>
              </div>

              {/* Price Calculation Simulation */}
              <div className="p-4 bg-[#F5F1EC] rounded-xl border border-[#EAE4DC] space-y-2">
                <div className="flex items-center gap-1.5 text-[#8B5E34] font-bold">
                  <Sparkles className="w-4 h-4" />
                  <span>Price Calculation Preview</span>
                </div>
                <div className="text-xs text-[#222] space-y-1">
                  <p>
                    • Sample Product Retail Price: <strong>PKR 15,000</strong>
                  </p>
                  <p>
                    • Calculated Sale Price: <strong className="text-[#8B5E34]">
                      PKR {calculateCampaignPricePreview(15000, { discountType, discountValue }).salePrice.toLocaleString()}
                    </strong>
                  </p>
                </div>
              </div>

              {/* Submit Actions */}
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
                  {editingCampaign ? 'Save Campaign' : 'Create Campaign'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
