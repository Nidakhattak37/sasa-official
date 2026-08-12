import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { MenuItem, MenuType, Product } from '../../types';
import {
  Menu as MenuIcon, Plus, Trash2, Edit3, ArrowUp, ArrowDown, Save, CheckCircle2,
  Layers, FileText, Globe, Bold, Tag, Sparkles, Eye, Check, X,
  ToggleLeft, ToggleRight, Search, ShoppingBag, Sparkle, ExternalLink
} from 'lucide-react';

const COLOR_PRESETS = [
  { label: 'Default Charcoal', value: '', hex: '#222222', bg: 'bg-[#222222]' },
  { label: 'Active Sale Red', value: '#DC2626', hex: '#DC2626', bg: 'bg-[#DC2626]' },
  { label: 'Luxury Gold', value: '#D4AF37', hex: '#D4AF37', bg: 'bg-[#D4AF37]' },
  { label: 'Royal Emerald', value: '#059669', hex: '#059669', bg: 'bg-[#059669]' },
  { label: 'Warm Bronze', value: '#8B5E34', hex: '#8B5E34', bg: 'bg-[#8B5E34]' },
  { label: 'Rose Crimson', value: '#E11D48', hex: '#E11D48', bg: 'bg-[#E11D48]' },
  { label: 'Deep Burgundy', value: '#881337', hex: '#881337', bg: 'bg-[#881337]' }
];

const PREDEFINED_COLLECTIONS = [
  'Summer Lawn',
  'Winter Velvet & Khaddar',
  'Spring Floral Edit',
  'Autumn Silk & Karandi',
  'Festive / Eid Special',
  'Timeless Classics',
  'Luxury Pret Edit'
];

const STATIC_PAGES = [
  { slug: 'about', title: 'About Us' },
  { slug: 'contact', title: 'Contact Us' },
  { slug: 'privacy-policy', title: 'Privacy Policy' },
  { slug: 'terms', title: 'Terms & Conditions' },
  { slug: 'shipping-policy', title: 'Shipping Policy' },
  { slug: 'faqs', title: 'Frequently Asked Questions (FAQs)' }
];

export const AdminMenuSettings: React.FC = () => {
  const { menuItems, updateMenuItems, categories, cmsPages, products } = useApp();

  const [items, setItems] = useState<MenuItem[]>(() => {
    return (menuItems && menuItems.length > 0) ? menuItems : [];
  });
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sync with global context state when updated from MongoDB API
  useEffect(() => {
    if (menuItems && menuItems.length > 0) {
      setItems(menuItems);
    }
  }, [menuItems]);

  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState<MenuType>('category');
  const [formCategorySlug, setFormCategorySlug] = useState('');
  const [formSubcategoryName, setFormSubcategoryName] = useState('');
  const [formCollectionName, setFormCollectionName] = useState('Summer Lawn');
  const [formProductIds, setFormProductIds] = useState<string[]>([]);
  const [formPageSlug, setFormPageSlug] = useState('about');
  const [formUrl, setFormUrl] = useState('');
  const [formIsActive, setFormIsActive] = useState(true);
  const [formSortOrder, setFormSortOrder] = useState<number>(1);
  const [formIsBold, setFormIsBold] = useState(false);
  const [formColor, setFormColor] = useState('');
  const [formBadgeText, setFormBadgeText] = useState('');
  const [formBadgeColor, setFormBadgeColor] = useState('#DC2626');

  // Product Selection Modal inside Collection picker
  const [productSearch, setProductSearch] = useState('');
  const [collectionPickerTab, setCollectionPickerTab] = useState<'type' | 'custom'>('type');

  // Open modal for Adding new item
  const handleOpenAddModal = () => {
    setEditingItemId(null);
    setFormName('');
    setFormType('category');
    const defaultCat = categories[0]?.slug || 'unstitched';
    setFormCategorySlug(defaultCat);
    const catObj = categories.find(c => c.slug === defaultCat);
    setFormName(catObj ? catObj.name : 'Unstitched');
    setFormSubcategoryName('');
    setFormCollectionName('Summer Lawn');
    setFormProductIds([]);
    setFormPageSlug('about');
    setFormUrl('');
    setFormIsActive(true);
    setFormSortOrder(items.length + 1);
    setFormIsBold(false);
    setFormColor('');
    setFormBadgeText('');
    setFormBadgeColor('#DC2626');
    setIsModalOpen(true);
  };

  // Open modal for Editing item
  const handleOpenEditModal = (item: MenuItem) => {
    setEditingItemId(item.id);
    setFormName(item.name || item.label || '');
    setFormType(item.targetType || 'category');
    setFormCategorySlug(item.categorySlug || item.targetSlug || item.targetValue || '');
    setFormSubcategoryName(item.subcategoryName || '');
    setFormCollectionName(item.collectionName || item.targetValue || 'Summer Lawn');
    setFormProductIds(item.productIds || []);
    setFormPageSlug(item.pageSlug || item.targetValue || 'about');
    setFormUrl(item.url || item.targetValue || '');
    setFormIsActive(item.isActive !== false);
    setFormSortOrder(item.sortOrder || 1);
    setFormIsBold(!!item.isBold);
    setFormColor(item.color || '');
    setFormBadgeText(item.badgeText || '');
    setFormBadgeColor(item.badgeColor || '#DC2626');
    setCollectionPickerTab(item.productIds && item.productIds.length > 0 ? 'custom' : 'type');
    setIsModalOpen(true);
  };

  // Handle Form Submission (Add or Update)
  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();

    let computedLabel = formName.trim();
    let computedTargetSlug = '';
    let computedTargetValue = '';
    let computedUrl = '';

    if (formType === 'category') {
      const selectedCat = categories.find(c => c.slug === formCategorySlug);
      if (!computedLabel) computedLabel = selectedCat ? selectedCat.name : formCategorySlug;
      computedTargetSlug = formCategorySlug;
      computedTargetValue = formCategorySlug;
      computedUrl = `/category/${formCategorySlug}`;
    } else if (formType === 'subcategory') {
      if (!computedLabel) computedLabel = formSubcategoryName || 'Subcategory';
      computedTargetSlug = formSubcategoryName;
      computedTargetValue = formSubcategoryName;
      computedUrl = `/category/${formCategorySlug || 'all'}?sub=${encodeURIComponent(formSubcategoryName)}`;
    } else if (formType === 'sale') {
      if (!computedLabel) computedLabel = 'Sale';
      computedTargetSlug = 'sale';
      computedTargetValue = 'sale';
      computedUrl = '/sale';
    } else if (formType === 'collection') {
      if (collectionPickerTab === 'custom' && formProductIds.length > 0) {
        if (!computedLabel) computedLabel = `Custom Collection (${formProductIds.length} Items)`;
        computedTargetSlug = 'custom-collection';
        computedTargetValue = 'custom-collection';
      } else {
        if (!computedLabel) computedLabel = formCollectionName;
        computedTargetSlug = formCollectionName;
        computedTargetValue = formCollectionName;
      }
      computedUrl = `/collection/${encodeURIComponent(computedTargetSlug)}`;
    } else if (formType === 'page') {
      const cms = cmsPages.find(p => p.slug === formPageSlug);
      const staticP = STATIC_PAGES.find(p => p.slug === formPageSlug);
      if (!computedLabel) computedLabel = cms ? cms.title : (staticP ? staticP.title : formPageSlug);
      computedTargetSlug = formPageSlug;
      computedTargetValue = formPageSlug;
      computedUrl = `/page/${formPageSlug}`;
    } else if (formType === 'custom') {
      if (!computedLabel) computedLabel = 'Custom Link';
      computedTargetValue = formUrl;
      computedUrl = formUrl;
    } else if (formType === 'view') {
      if (!computedLabel) computedLabel = formUrl || 'Home';
      computedTargetValue = formUrl || 'home';
      computedUrl = `/${formUrl}`;
    }

    const itemData: MenuItem = {
      id: editingItemId || `m-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: computedLabel,
      label: computedLabel,
      targetType: formType,
      targetValue: computedTargetValue,
      targetSlug: computedTargetSlug,
      url: computedUrl,
      categorySlug: formCategorySlug,
      subcategoryName: formSubcategoryName,
      collectionName: formCollectionName,
      productIds: collectionPickerTab === 'custom' ? formProductIds : undefined,
      pageSlug: formPageSlug,
      isActive: formIsActive,
      sortOrder: formSortOrder,
      isBold: formIsBold,
      color: formColor || undefined,
      badgeText: formBadgeText || undefined,
      badgeColor: formBadgeText ? (formBadgeColor || '#DC2626') : undefined,
      updatedAt: new Date().toISOString()
    };

    let updatedItems: MenuItem[];
    if (editingItemId) {
      updatedItems = items.map(i => i.id === editingItemId ? itemData : i);
    } else {
      updatedItems = [...items, itemData];
    }

    // Re-index sortOrder
    updatedItems = updatedItems.map((item, idx) => ({ ...item, sortOrder: item.sortOrder || (idx + 1) }));
    updatedItems.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

    setItems(updatedItems);
    setIsModalOpen(false);
  };

  // Save all items to AppContext and backend API / MongoDB Atlas
  const handleSaveMenu = () => {
    // Normalize sort orders
    const normalized = items.map((item, idx) => ({
      ...item,
      sortOrder: idx + 1
    }));
    updateMenuItems(normalized);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Toggle Active/Inactive status
  const handleToggleActive = (id: string) => {
    const updated = items.map(item => {
      if (item.id === id) {
        return { ...item, isActive: item.isActive === false ? true : false };
      }
      return item;
    });
    setItems(updated);
  };

  // Move item position
  const moveItem = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    const newItems = [...items];
    const temp = newItems[index];
    newItems[index] = newItems[targetIndex];
    newItems[targetIndex] = temp;

    // Reassign sort orders
    const reordered = newItems.map((item, idx) => ({
      ...item,
      sortOrder: idx + 1
    }));
    setItems(reordered);
  };

  // Delete item
  const handleDeleteItem = (id: string) => {
    if (window.confirm('Are you sure you want to delete this menu item?')) {
      const updated = items.filter(i => i.id !== id).map((item, idx) => ({ ...item, sortOrder: idx + 1 }));
      setItems(updated);
    }
  };

  // Filtered products for custom collection picker
  const filteredProductsForPicker = products.filter(p =>
    p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.category.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.sku.toLowerCase().includes(productSearch.toLowerCase())
  );

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#EAE4DC] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-[#9E8055]/10 text-[#9E8055] text-[10px] font-extrabold uppercase tracking-widest rounded-full">
              ADMIN CONTROL PANEL
            </span>
            <span className="text-xs text-gray-400">• Dynamic Navigation Engine</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#222222] mt-1 flex items-center gap-2.5">
            <MenuIcon className="w-7 h-7 text-[#9E8055]" />
            Website Menu Management
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Create, edit, reorder, activate/deactivate, and dynamically link menu items. Changes reflect instantly on the storefront navigation header.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {saveSuccess && (
            <div className="px-4 py-2 bg-green-50 text-green-800 border border-green-200 text-xs font-bold rounded-xl flex items-center gap-2 animate-pulse shadow-2xs">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span>Menu saved to MongoDB & live website!</span>
            </div>
          )}

          <button
            onClick={handleOpenAddModal}
            className="px-5 py-2.5 bg-[#222222] hover:bg-[#333333] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition shadow flex items-center gap-2"
          >
            <Plus className="w-4 h-4 text-[#D4AF37]" />
            <span>Add Menu Item</span>
          </button>

          <button
            onClick={handleSaveMenu}
            className="px-6 py-2.5 bg-[#D4AF37] hover:bg-[#b8952b] text-[#1E1E24] text-xs font-bold uppercase tracking-wider rounded-xl transition shadow-md flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Save All Changes</span>
          </button>
        </div>
      </div>

      {/* Interactive Live Navbar Preview */}
      <div className="bg-[#FAF8F5] border border-[#EAE4DC] rounded-2xl p-5 shadow-2xs space-y-3">
        <div className="flex items-center justify-between border-b border-[#EAE4DC] pb-2.5">
          <span className="text-xs font-bold uppercase tracking-widest text-[#9E8055] flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Live Header Navigation Preview (Visitor View)
          </span>
          <span className="text-[11px] text-gray-500 font-medium">
            Active Items: {items.filter(i => i.isActive !== false).length} / {items.length} Total
          </span>
        </div>

        <div className="bg-white border border-[#EAE4DC] rounded-xl p-4 flex items-center justify-between shadow-xs overflow-x-auto">
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="font-serif text-lg font-bold tracking-widest text-[#222]">SASA</span>
            <span className="text-[9px] tracking-widest text-gray-400 font-medium border-l border-gray-200 pl-2">OFFICIAL</span>
          </div>

          <div className="flex items-center space-x-6 px-4">
            {items.filter(i => i.isActive !== false).length === 0 ? (
              <span className="text-xs text-gray-400 italic">No active menu items configured. Add items below.</span>
            ) : (
              items.filter(i => i.isActive !== false).sort((a,b) => (a.sortOrder||0) - (b.sortOrder||0)).map((item) => {
                const isBold = !!item.isBold;
                const hasColor = !!item.color && item.color.trim() !== '';
                return (
                  <div
                    key={item.id}
                    className={`text-xs uppercase tracking-wider flex items-center gap-1.5 transition ${
                      isBold ? 'font-bold' : 'font-medium'
                    }`}
                    style={hasColor ? { color: item.color } : { color: '#444444' }}
                  >
                    <span>{item.name || item.label}</span>
                    {item.badgeText && (
                      <span
                        className="px-1.5 py-0.5 text-[8.5px] font-extrabold rounded leading-none text-white shadow-2xs"
                        style={{ backgroundColor: item.badgeColor || (hasColor ? item.color : '#DC2626') }}
                      >
                        {item.badgeText}
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>

          <div className="flex items-center gap-3 text-xs text-gray-400 flex-shrink-0">
            <Search className="w-4 h-4" />
            <ShoppingBag className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Menu Management Table */}
      <div className="bg-white border border-[#EAE4DC] rounded-2xl overflow-hidden shadow-xs space-y-0">
        <div className="p-5 bg-[#FAFAFA] border-b border-[#EAE4DC] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-serif text-lg font-bold text-[#222] flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#9E8055]" />
              Website Menu Items
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Drag or use Up/Down controls to set navigation sequence. Active items display on storefront.
            </p>
          </div>

          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2 bg-[#222] text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-[#9E8055] transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Item</span>
          </button>
        </div>

        {items.length === 0 ? (
          <div className="p-16 text-center space-y-4">
            <Globe className="w-12 h-12 text-gray-300 mx-auto" />
            <h3 className="font-serif text-lg font-bold text-[#222]">No Menu Items Added Yet</h3>
            <p className="text-xs text-gray-500 max-w-md mx-auto">
              Click <strong>Add Menu Item</strong> above to create dynamic links for Categories, Sale products, Collections, Custom Pages, or URLs.
            </p>
            <button
              onClick={handleOpenAddModal}
              className="px-5 py-2.5 bg-[#D4AF37] text-[#1E1E24] text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-[#b8952b] transition"
            >
              Add First Menu Item
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FBF9F6] text-[#222] uppercase tracking-wider border-b border-[#EAE4DC] font-bold text-[11px]">
                <tr>
                  <th className="py-3.5 px-4 w-16 text-center">Order</th>
                  <th className="py-3.5 px-4">Menu Name</th>
                  <th className="py-3.5 px-4">Menu Type</th>
                  <th className="py-3.5 px-4">Target / Dynamic Link</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-center">Styling</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAE4DC]">
                {items.map((item, index) => {
                  const isActive = item.isActive !== false;
                  const isBold = !!item.isBold;
                  const hasColor = !!item.color && item.color.trim() !== '';

                  let typeBadgeBg = 'bg-gray-100 text-gray-800';
                  if (item.targetType === 'category') typeBadgeBg = 'bg-blue-50 text-blue-700 border-blue-200';
                  if (item.targetType === 'subcategory') typeBadgeBg = 'bg-indigo-50 text-indigo-700 border-indigo-200';
                  if (item.targetType === 'sale') typeBadgeBg = 'bg-red-50 text-red-700 border-red-200';
                  if (item.targetType === 'collection') typeBadgeBg = 'bg-amber-50 text-amber-800 border-amber-200';
                  if (item.targetType === 'page') typeBadgeBg = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                  if (item.targetType === 'custom') typeBadgeBg = 'bg-purple-50 text-purple-700 border-purple-200';

                  let displayTarget = item.targetValue || item.url || 'Home';
                  if (item.targetType === 'category') {
                    const catObj = categories.find(c => c.slug === (item.categorySlug || item.targetValue));
                    displayTarget = `Category: ${catObj ? catObj.name : item.targetValue}`;
                  } else if (item.targetType === 'subcategory') {
                    displayTarget = `Subcategory: ${item.subcategoryName || item.targetValue}`;
                  } else if (item.targetType === 'sale') {
                    displayTarget = `Sale Page (/sale) • Active Discount Items Only`;
                  } else if (item.targetType === 'collection') {
                    if (item.productIds && item.productIds.length > 0) {
                      displayTarget = `Custom Collection (${item.productIds.length} Picked Products)`;
                    } else {
                      displayTarget = `Collection: ${item.collectionName || item.targetValue}`;
                    }
                  } else if (item.targetType === 'page') {
                    displayTarget = `CMS Page: ${item.pageSlug || item.targetValue}`;
                  } else if (item.targetType === 'custom') {
                    displayTarget = `URL: ${item.url || item.targetValue}`;
                  }

                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-[#FAF8F5] transition ${!isActive ? 'opacity-60 bg-gray-50/50' : ''}`}
                    >
                      {/* Sequence Order */}
                      <td className="py-3 px-4 text-center font-bold text-gray-500">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => moveItem(index, 'up')}
                            disabled={index === 0}
                            className="p-1 hover:bg-gray-200 rounded text-gray-600 disabled:opacity-20 transition"
                            title="Move Up"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-5 text-center">{index + 1}</span>
                          <button
                            onClick={() => moveItem(index, 'down')}
                            disabled={index === items.length - 1}
                            className="p-1 hover:bg-gray-200 rounded text-gray-600 disabled:opacity-20 transition"
                            title="Move Down"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                      {/* Menu Name */}
                      <td className="py-3 px-4 font-semibold text-[#222]">
                        <div className="flex items-center gap-2">
                          <span
                            className={isBold ? 'font-extrabold' : 'font-medium'}
                            style={hasColor ? { color: item.color } : undefined}
                          >
                            {item.name || item.label}
                          </span>
                          {item.badgeText && (
                            <span
                              className="px-1.5 py-0.5 text-[9px] font-extrabold rounded leading-none text-white shadow-2xs"
                              style={{ backgroundColor: item.badgeColor || (hasColor ? item.color : '#DC2626') }}
                            >
                              {item.badgeText}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Type Badge */}
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-md border ${typeBadgeBg}`}>
                          {item.targetType}
                        </span>
                      </td>

                      {/* Target / Link */}
                      <td className="py-3 px-4 text-gray-600 max-w-xs truncate font-mono text-[11px]">
                        {displayTarget}
                      </td>

                      {/* Status Toggle */}
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleToggleActive(item.id)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition ${
                            isActive
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          {isActive ? (
                            <>
                              <ToggleRight className="w-4 h-4 text-emerald-600" />
                              <span>Active</span>
                            </>
                          ) : (
                            <>
                              <ToggleLeft className="w-4 h-4 text-gray-500" />
                              <span>Inactive</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Styling Badges */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {isBold && (
                            <span className="p-1 bg-gray-100 text-gray-800 rounded text-[10px] font-extrabold" title="Bold Text">
                              <Bold className="w-3 h-3" />
                            </span>
                          )}
                          {hasColor && (
                            <span
                              className="w-4 h-4 rounded-full border border-gray-300 shadow-2xs"
                              style={{ backgroundColor: item.color }}
                              title={`Custom Color: ${item.color}`}
                            />
                          )}
                          {!isBold && !hasColor && !item.badgeText && (
                            <span className="text-gray-300 text-[10px]">—</span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEditModal(item)}
                            className="p-1.5 bg-gray-100 hover:bg-[#9E8055] hover:text-white text-gray-700 rounded-lg transition"
                            title="Edit Menu Item"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="p-1.5 bg-red-50 hover:bg-red-600 hover:text-white text-red-600 rounded-lg transition"
                            title="Delete Menu Item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ADD / EDIT MENU ITEM MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-[#EAE4DC] rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl my-8 animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="p-5 bg-[#FAFAFA] border-b border-[#EAE4DC] flex items-center justify-between">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#222] flex items-center gap-2">
                  <MenuIcon className="w-5 h-5 text-[#9E8055]" />
                  {editingItemId ? 'Edit Website Menu Item' : 'Add New Website Menu Item'}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Configure menu label, target page type, dynamic linking rules, status, and styling.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 hover:bg-gray-200 rounded-full text-gray-500 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSubmitForm} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
              
              {/* 1. Menu Name */}
              <div>
                <label className="block text-xs font-bold text-[#222] uppercase tracking-wider mb-1">
                  Menu Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Sale, Unstitched, New Arrivals, Dresses, Contact"
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-xs font-semibold text-[#222] focus:ring-2 focus:ring-[#9E8055] outline-none"
                />
                <span className="text-[10px] text-gray-400 mt-1 block">
                  This text will display in the website navigation bar for store visitors.
                </span>
              </div>

              {/* 2. Menu Type Selection */}
              <div>
                <label className="block text-xs font-bold text-[#222] uppercase tracking-wider mb-1">
                  Menu Type <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { type: 'category', label: '1. Category', desc: 'Link to Category' },
                    { type: 'subcategory', label: '2. Subcategory', desc: 'Link to Subcategory' },
                    { type: 'sale', label: '3. Sale', desc: 'Active Discounts Only' },
                    { type: 'collection', label: '4. Collection', desc: 'Product Collection' },
                    { type: 'page', label: '5. Custom Page', desc: 'About/Contact/CMS' },
                    { type: 'custom', label: '6. Custom URL', desc: 'Custom Link/URL' },
                  ].map((option) => (
                    <button
                      type="button"
                      key={option.type}
                      onClick={() => {
                        const newT = option.type as MenuType;
                        setFormType(newT);
                        // Auto populate default name if blank
                        if (!formName || formName.trim() === '') {
                          if (newT === 'sale') setFormName('Sale');
                          else if (newT === 'category' && categories[0]) setFormName(categories[0].name);
                          else if (newT === 'collection') setFormName('Summer Collection');
                        }
                      }}
                      className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                        formType === option.type
                          ? 'border-[#9E8055] bg-[#FAF8F5] ring-2 ring-[#9E8055]/20'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <span className="text-xs font-bold text-[#222]">{option.label}</span>
                      <span className="text-[10px] text-gray-500">{option.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. DYNAMIC TARGET CONFIGURATION BASED ON MENU TYPE */}
              <div className="p-4 bg-[#FAF8F5] border border-[#EAE4DC] rounded-xl space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[#9E8055] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Target / Dynamic Link Configuration
                </span>

                {/* CATEGORY TARGET */}
                {formType === 'category' && (
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-gray-700">Select Existing Category:</label>
                    <select
                      value={formCategorySlug}
                      onChange={(e) => {
                        setFormCategorySlug(e.target.value);
                        const foundCat = categories.find(c => c.slug === e.target.value);
                        if (foundCat && (!formName || formName.trim() === '' || categories.some(c => c.name === formName))) {
                          setFormName(foundCat.name);
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs font-semibold text-[#222]"
                    >
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.slug}>
                          {cat.name} ({cat.slug})
                        </option>
                      ))}
                    </select>
                    <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-lg text-[11px] text-blue-900">
                      💡 <strong>Automatic Route:</strong> `/category/${formCategorySlug || 'slug'}` — Frontend will display <strong>only products belonging to {formName || formCategorySlug}</strong>.
                    </div>
                  </div>
                )}

                {/* SUBCATEGORY TARGET */}
                {formType === 'subcategory' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Parent Category:</label>
                      <select
                        value={formCategorySlug}
                        onChange={(e) => setFormCategorySlug(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs font-semibold text-[#222]"
                      >
                        <option value="all">All Categories</option>
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.slug}>{cat.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Select Subcategory:</label>
                      <input
                        type="text"
                        value={formSubcategoryName}
                        onChange={(e) => setFormSubcategoryName(e.target.value)}
                        placeholder="e.g. 3 Piece Lawn, Kurti, Chiffon Dupatta, Trouser"
                        className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs font-semibold text-[#222]"
                      />
                    </div>
                    <div className="p-2.5 bg-indigo-50 border border-indigo-200 rounded-lg text-[11px] text-indigo-900">
                      💡 <strong>Automatic Filter:</strong> Frontend will display <strong>only products in subcategory "{formSubcategoryName || 'Subcategory'}"</strong>.
                    </div>
                  </div>
                )}

                {/* SALE TARGET */}
                {formType === 'sale' && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl space-y-1.5 text-xs text-red-900">
                    <p className="font-bold flex items-center gap-1.5">
                      <Tag className="w-4 h-4 text-red-600" />
                      Automatic Sale Target System (/sale)
                    </p>
                    <p className="text-[11px]">
                      No manual URL setup required! Clicking this menu item automatically fetches and displays <strong>ONLY products with active discounts or sale prices (`isSale = true` or `salePrice &lt; originalPrice`)</strong>.
                    </p>
                    <p className="text-[10px] text-red-700 font-semibold italic">
                      Products without active discounts will automatically be excluded from the Sale page.
                    </p>
                  </div>
                )}

                {/* PRODUCT COLLECTION TARGET */}
                {formType === 'collection' && (
                  <div className="space-y-3">
                    <div className="flex border-b border-gray-200 gap-4 text-xs font-bold">
                      <button
                        type="button"
                        onClick={() => setCollectionPickerTab('type')}
                        className={`pb-2 transition ${collectionPickerTab === 'type' ? 'border-b-2 border-[#9E8055] text-[#222]' : 'text-gray-400'}`}
                      >
                        Option A: Predefined Collection
                      </button>
                      <button
                        type="button"
                        onClick={() => setCollectionPickerTab('custom')}
                        className={`pb-2 transition ${collectionPickerTab === 'custom' ? 'border-b-2 border-[#9E8055] text-[#222]' : 'text-gray-400'}`}
                      >
                        Option B: Hand-Pick Specific Products ({formProductIds.length})
                      </button>
                    </div>

                    {collectionPickerTab === 'type' ? (
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-gray-700">Select Collection Name:</label>
                        <select
                          value={formCollectionName}
                          onChange={(e) => {
                            setFormCollectionName(e.target.value);
                            if (!formName || PREDEFINED_COLLECTIONS.includes(formName)) {
                              setFormName(e.target.value);
                            }
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs font-semibold text-[#222]"
                        >
                          {PREDEFINED_COLLECTIONS.map(coll => (
                            <option key={coll} value={coll}>{coll}</option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-gray-700">Pick Products for Collection:</label>
                          <span className="text-[11px] font-bold text-[#9E8055]">{formProductIds.length} Selected</span>
                        </div>

                        <div className="relative">
                          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
                          <input
                            type="text"
                            value={productSearch}
                            onChange={(e) => setProductSearch(e.target.value)}
                            placeholder="Filter products by title or SKU..."
                            className="w-full pl-8 pr-3 py-1.5 border border-gray-300 rounded-lg text-xs"
                          />
                        </div>

                        <div className="max-h-40 overflow-y-auto border border-gray-200 bg-white rounded-lg p-2 space-y-1">
                          {filteredProductsForPicker.map(p => {
                            const isChecked = formProductIds.includes(p.id);
                            return (
                              <label key={p.id} className="flex items-center justify-between p-1.5 hover:bg-gray-50 rounded cursor-pointer text-xs">
                                <div className="flex items-center gap-2 min-w-0">
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={(e) => {
                                      if (e.target.checked) setFormProductIds([...formProductIds, p.id]);
                                      else setFormProductIds(formProductIds.filter(id => id !== p.id));
                                    }}
                                    className="rounded border-gray-300 text-[#9E8055] focus:ring-[#9E8055]"
                                  />
                                  <img src={p.images[0]} alt={p.name} className="w-6 h-6 rounded object-cover flex-shrink-0" />
                                  <span className="truncate font-medium text-[#222]">{p.name}</span>
                                </div>
                                <span className="font-bold text-gray-600 flex-shrink-0 ml-2">PKR {p.price.toLocaleString()}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* CUSTOM PAGE TARGET */}
                {formType === 'page' && (
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-gray-700">Select CMS / Information Page:</label>
                    <select
                      value={formPageSlug}
                      onChange={(e) => {
                        setFormPageSlug(e.target.value);
                        const staticP = STATIC_PAGES.find(p => p.slug === e.target.value);
                        const cmsP = cmsPages.find(p => p.slug === e.target.value);
                        if (staticP) setFormName(staticP.title);
                        else if (cmsP) setFormName(cmsP.title);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs font-semibold text-[#222]"
                    >
                      <optgroup label="Standard Store Pages">
                        {STATIC_PAGES.map(sp => (
                          <option key={sp.slug} value={sp.slug}>{sp.title}</option>
                        ))}
                      </optgroup>
                      {cmsPages.length > 0 && (
                        <optgroup label="CMS Pages">
                          {cmsPages.map(p => (
                            <option key={p.id} value={p.slug}>{p.title}</option>
                          ))}
                        </optgroup>
                      )}
                    </select>
                  </div>
                )}

                {/* CUSTOM URL TARGET */}
                {formType === 'custom' && (
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-gray-700">Enter Custom Path or External URL:</label>
                    <input
                      type="text"
                      value={formUrl}
                      onChange={(e) => setFormUrl(e.target.value)}
                      placeholder="e.g. /new-arrivals or https://instagram.com/sasaofficial"
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs font-semibold text-[#222]"
                    />
                  </div>
                )}
              </div>

              {/* 4. MENU STATUS & ORDER */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-200">
                <div>
                  <label className="block text-xs font-bold text-[#222] uppercase tracking-wider mb-1">
                    Menu Status
                  </label>
                  <button
                    type="button"
                    onClick={() => setFormIsActive(!formIsActive)}
                    className={`w-full py-2 px-3 rounded-xl border flex items-center justify-between text-xs font-bold transition ${
                      formIsActive
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                        : 'bg-gray-100 border-gray-300 text-gray-600'
                    }`}
                  >
                    <span>{formIsActive ? 'Active (Visible on Header)' : 'Inactive (Hidden on Header)'}</span>
                    {formIsActive ? <ToggleRight className="w-5 h-5 text-emerald-600" /> : <ToggleLeft className="w-5 h-5 text-gray-400" />}
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#222] uppercase tracking-wider mb-1">
                    Order Sequence (#)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="99"
                    value={formSortOrder}
                    onChange={(e) => setFormSortOrder(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs font-semibold text-[#222]"
                  />
                </div>
              </div>

              {/* 5. STYLING & HIGHLIGHT CONTROLS */}
              <div className="p-4 bg-[#FBF9F6] border border-[#EAE4DC] rounded-xl space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[#9E8055] flex items-center gap-1.5">
                  <Bold className="w-3.5 h-3.5" />
                  Styling & Campaign Highlights
                </span>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-xs font-bold text-[#222] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formIsBold}
                      onChange={(e) => setFormIsBold(e.target.checked)}
                      className="rounded border-gray-300 text-[#9E8055] focus:ring-[#9E8055]"
                    />
                    <span>Bold Typography (font-bold)</span>
                  </label>

                  {/* 1-Click Sale Preset */}
                  <button
                    type="button"
                    onClick={() => {
                      setFormIsBold(true);
                      setFormColor('#DC2626');
                      setFormBadgeText('SALE');
                      setFormBadgeColor('#DC2626');
                    }}
                    className="px-2.5 py-1 bg-red-100 hover:bg-red-200 text-red-800 text-[10px] font-extrabold rounded-lg transition"
                  >
                    Preset: Sale Highlight
                  </button>
                </div>

                {/* Color Palette & Custom Hex */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Custom Text Color:</label>
                  <div className="flex flex-wrap items-center gap-2">
                    {COLOR_PRESETS.map((p) => (
                      <button
                        type="button"
                        key={p.label}
                        onClick={() => setFormColor(p.value)}
                        className={`w-6 h-6 rounded-full border border-gray-300 ${p.bg} ${
                          formColor === p.value ? 'ring-2 ring-offset-1 ring-[#9E8055]' : ''
                        }`}
                        title={p.label}
                      />
                    ))}
                    <input
                      type="color"
                      value={formColor || '#222222'}
                      onChange={(e) => setFormColor(e.target.value)}
                      className="w-7 h-7 p-0.5 border border-gray-300 rounded cursor-pointer ml-1"
                    />
                    <input
                      type="text"
                      value={formColor}
                      onChange={(e) => setFormColor(e.target.value)}
                      placeholder="#DC2626 or blank for default"
                      className="flex-1 min-w-[120px] px-2.5 py-1 border border-gray-300 rounded text-xs font-mono"
                    />
                  </div>
                </div>

                {/* Badge Tag Input */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Badge Tag (e.g. SALE, NEW):</label>
                    <input
                      type="text"
                      value={formBadgeText}
                      onChange={(e) => setFormBadgeText(e.target.value)}
                      placeholder="e.g. SALE, HOT, 50% OFF"
                      className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Badge Color:</label>
                    <input
                      type="color"
                      value={formBadgeColor}
                      onChange={(e) => setFormBadgeColor(e.target.value)}
                      className="w-full h-8 p-0.5 border border-gray-300 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="pt-4 border-t border-gray-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold uppercase rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#D4AF37] hover:bg-[#b8952b] text-[#1E1E24] text-xs font-bold uppercase tracking-wider rounded-xl transition shadow-md"
                >
                  {editingItemId ? 'Update Menu Item' : 'Add to Menu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
