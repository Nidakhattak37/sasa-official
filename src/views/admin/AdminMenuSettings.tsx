import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { MenuItem } from '../../types';
import {
  Menu as MenuIcon, Plus, Trash2, ArrowUp, ArrowDown, ChevronDown, ChevronUp, Save, CheckCircle2, Link as LinkIcon, Layers, FileText, Globe,
  Bold, Palette, Tag, Sparkles, RefreshCw, Eye
} from 'lucide-react';

const COLOR_PRESETS = [
  { label: 'Default Theme', value: '', hex: '#222222', bg: 'bg-[#222222]' },
  { label: 'Sale Red', value: '#DC2626', hex: '#DC2626', bg: 'bg-[#DC2626]' },
  { label: 'Luxury Gold', value: '#D4AF37', hex: '#D4AF37', bg: 'bg-[#D4AF37]' },
  { label: 'Royal Emerald', value: '#059669', hex: '#059669', bg: 'bg-[#059669]' },
  { label: 'Warm Bronze', value: '#8B5E34', hex: '#8B5E34', bg: 'bg-[#8B5E34]' },
  { label: 'Rose Crimson', value: '#E11D48', hex: '#E11D48', bg: 'bg-[#E11D48]' },
  { label: 'Deep Burgundy', value: '#881337', hex: '#881337', bg: 'bg-[#881337]' },
  { label: 'Sapphire Blue', value: '#2563EB', hex: '#2563EB', bg: 'bg-[#2563EB]' }
];

export const AdminMenuSettings: React.FC = () => {
  const { menuItems, updateMenuItems, categories, cmsPages } = useApp();

  const [menuName, setMenuName] = useState('Primary Header Navigation');
  const [items, setItems] = useState<MenuItem[]>(menuItems);
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sync with global menu items when loaded from MongoDB Atlas / API
  useEffect(() => {
    if (menuItems && menuItems.length > 0) {
      setItems(menuItems);
    }
  }, [menuItems]);

  // Left panel selection state
  const [selectedPages, setSelectedPages] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  
  // Custom link form state
  const [customLabel, setCustomLabel] = useState('');
  const [customValue, setCustomValue] = useState('');
  const [customIsBold, setCustomIsBold] = useState(false);
  const [customColor, setCustomColor] = useState('');
  const [customBadge, setCustomBadge] = useState('');

  // Accordion toggle state
  const [openSection, setOpenSection] = useState<'pages' | 'categories' | 'custom'>('pages');

  const handleSaveMenu = () => {
    updateMenuItems(items);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleAddPagesToMenu = () => {
    if (selectedPages.length === 0) return;
    const newItems: MenuItem[] = selectedPages.map(pageVal => {
      let label = pageVal.toUpperCase();
      if (pageVal === 'home') label = 'Home';
      if (pageVal === 'shop') label = 'All Shop';
      if (pageVal === 'contact') label = 'Contact Us';
      if (pageVal === 'about') label = 'About SASA';

      const foundCMS = cmsPages.find(p => p.slug === pageVal);
      if (foundCMS) label = foundCMS.title;

      return {
        id: `m-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        label,
        targetType: pageVal === 'home' || pageVal === 'contact' || pageVal === 'shop' ? 'view' : 'page',
        targetValue: pageVal
      };
    });

    setItems(prev => [...prev, ...newItems]);
    setSelectedPages([]);
  };

  const handleAddCategoriesToMenu = () => {
    if (selectedCategories.length === 0) return;
    const newItems: MenuItem[] = selectedCategories.map(catSlug => {
      const foundCat = categories.find(c => c.slug === catSlug);
      const isSale = catSlug.toLowerCase().includes('sale');
      return {
        id: `m-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        label: foundCat ? foundCat.name : catSlug,
        targetType: 'category',
        targetValue: catSlug,
        isBold: isSale,
        color: isSale ? '#DC2626' : undefined,
        badgeText: isSale ? 'SALE' : undefined,
        badgeColor: isSale ? '#DC2626' : undefined
      };
    });

    setItems(prev => [...prev, ...newItems]);
    setSelectedCategories([]);
  };

  const handleAddCustomLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customLabel || !customValue) return;

    const newItem: MenuItem = {
      id: `m-${Date.now()}`,
      label: customLabel,
      targetType: 'custom',
      targetValue: customValue,
      isBold: customIsBold,
      color: customColor || undefined,
      badgeText: customBadge || undefined,
      badgeColor: customBadge ? (customColor || '#DC2626') : undefined
    };

    setItems(prev => [...prev, newItem]);
    setCustomLabel('');
    setCustomValue('');
    setCustomIsBold(false);
    setCustomColor('');
    setCustomBadge('');
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const newItems = [...items];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newItems.length) return;

    const temp = newItems[index];
    newItems[index] = newItems[targetIndex];
    newItems[targetIndex] = temp;
    setItems(newItems);
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const updateItemProperty = (id: string, updates: Partial<MenuItem>) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i));
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Page Title & Notification */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EAE4DC] pb-6">
        <div>
          <h1 className="font-serif text-2xl font-bold text-[#222222] flex items-center gap-2">
            <MenuIcon className="w-6 h-6 text-[#9E8055]" />
            Header Navigation Menu Settings
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Customize header navigation items, re-order links, apply <strong>Bold typography</strong>, and assign <strong>custom colors & sale badges</strong> (e.g. Red for Active Sales, Gold for Luxury Collections).
          </p>
        </div>

        <div className="flex items-center gap-3">
          {saveSuccess && (
            <div className="px-4 py-2 bg-green-50 text-green-800 border border-green-200 text-xs font-bold rounded-lg flex items-center gap-2 animate-pulse">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span>Menu saved & updated on live website!</span>
            </div>
          )}

          <button
            onClick={handleSaveMenu}
            className="px-6 py-2.5 bg-[#D4AF37] hover:bg-[#b8952b] text-[#1E1E24] text-xs font-bold uppercase tracking-wider rounded-xl transition shadow flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Save Menu</span>
          </button>
        </div>
      </div>

      {/* Main 2-Column WordPress Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Add Menu Items (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <h2 className="font-serif text-base font-bold text-[#222] uppercase tracking-wider pb-2 border-b border-gray-200 flex items-center justify-between">
            <span>Add Menu Items</span>
            <Sparkles className="w-4 h-4 text-[#9E8055]" />
          </h2>

          {/* Accordion 1: Pages */}
          <div className="bg-white border border-[#EAE4DC] rounded-xl overflow-hidden shadow-sm">
            <button
              onClick={() => setOpenSection(openSection === 'pages' ? '' as any : 'pages')}
              className="w-full px-4 py-3 bg-[#FAFAFA] flex items-center justify-between text-xs font-bold text-[#222] border-b border-[#EAE4DC]"
            >
              <span className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#9E8055]" />
                Pages & Views
              </span>
              {openSection === 'pages' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {openSection === 'pages' && (
              <div className="p-4 space-y-3">
                <div className="max-h-48 overflow-y-auto space-y-2 pr-2 text-xs">
                  <label className="flex items-center gap-2 p-1.5 hover:bg-gray-50 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedPages.includes('home')}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedPages([...selectedPages, 'home']);
                        else setSelectedPages(selectedPages.filter(p => p !== 'home'));
                      }}
                      className="rounded border-gray-300 text-[#9E8055] focus:ring-[#9E8055]"
                    />
                    <span className="font-semibold text-[#222]">Home Page</span>
                  </label>

                  <label className="flex items-center gap-2 p-1.5 hover:bg-gray-50 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedPages.includes('shop')}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedPages([...selectedPages, 'shop']);
                        else setSelectedPages(selectedPages.filter(p => p !== 'shop'));
                      }}
                      className="rounded border-gray-300 text-[#9E8055] focus:ring-[#9E8055]"
                    />
                    <span className="font-semibold text-[#222]">All Shop (Catalog)</span>
                  </label>

                  <label className="flex items-center gap-2 p-1.5 hover:bg-gray-50 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedPages.includes('contact')}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedPages([...selectedPages, 'contact']);
                        else setSelectedPages(selectedPages.filter(p => p !== 'contact'));
                      }}
                      className="rounded border-gray-300 text-[#9E8055] focus:ring-[#9E8055]"
                    />
                    <span className="font-semibold text-[#222]">Contact Us</span>
                  </label>

                  {cmsPages.map(page => (
                    <label key={page.id} className="flex items-center gap-2 p-1.5 hover:bg-gray-50 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedPages.includes(page.slug)}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedPages([...selectedPages, page.slug]);
                          else setSelectedPages(selectedPages.filter(p => p !== page.slug));
                        }}
                        className="rounded border-gray-300 text-[#9E8055] focus:ring-[#9E8055]"
                      />
                      <span className="text-[#333]">{page.title}</span>
                    </label>
                  ))}
                </div>

                <div className="pt-2 border-t border-gray-100 flex justify-end">
                  <button
                    onClick={handleAddPagesToMenu}
                    disabled={selectedPages.length === 0}
                    className="px-3.5 py-1.5 bg-[#222] text-white text-xs font-bold uppercase rounded-lg hover:bg-[#9E8055] transition disabled:opacity-40"
                  >
                    Add to Menu
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Accordion 2: Categories */}
          <div className="bg-white border border-[#EAE4DC] rounded-xl overflow-hidden shadow-sm">
            <button
              onClick={() => setOpenSection(openSection === 'categories' ? '' as any : 'categories')}
              className="w-full px-4 py-3 bg-[#FAFAFA] flex items-center justify-between text-xs font-bold text-[#222] border-b border-[#EAE4DC]"
            >
              <span className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#9E8055]" />
                Product Categories
              </span>
              {openSection === 'categories' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {openSection === 'categories' && (
              <div className="p-4 space-y-3">
                <div className="max-h-48 overflow-y-auto space-y-2 pr-2 text-xs">
                  {categories.map(cat => (
                    <label key={cat.id} className="flex items-center gap-2 p-1.5 hover:bg-gray-50 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(cat.slug)}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedCategories([...selectedCategories, cat.slug]);
                          else setSelectedCategories(selectedCategories.filter(c => c !== cat.slug));
                        }}
                        className="rounded border-gray-300 text-[#9E8055] focus:ring-[#9E8055]"
                      />
                      <span className="font-medium text-[#222]">{cat.name}</span>
                      {cat.slug.toLowerCase().includes('sale') && (
                        <span className="ml-auto px-1.5 py-0.5 bg-red-100 text-red-700 text-[9px] font-bold rounded">
                          Sale
                        </span>
                      )}
                    </label>
                  ))}
                </div>

                <div className="pt-2 border-t border-gray-100 flex justify-end">
                  <button
                    onClick={handleAddCategoriesToMenu}
                    disabled={selectedCategories.length === 0}
                    className="px-3.5 py-1.5 bg-[#222] text-white text-xs font-bold uppercase rounded-lg hover:bg-[#9E8055] transition disabled:opacity-40"
                  >
                    Add to Menu
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Accordion 3: Custom Links & Sale Highlights */}
          <div className="bg-white border border-[#EAE4DC] rounded-xl overflow-hidden shadow-sm">
            <button
              onClick={() => setOpenSection(openSection === 'custom' ? '' as any : 'custom')}
              className="w-full px-4 py-3 bg-[#FAFAFA] flex items-center justify-between text-xs font-bold text-[#222] border-b border-[#EAE4DC]"
            >
              <span className="flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-[#9E8055]" />
                Custom Link / Sale Highlight
              </span>
              {openSection === 'custom' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {openSection === 'custom' && (
              <form onSubmit={handleAddCustomLink} className="p-4 space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Link Text / Label</label>
                  <input
                    type="text"
                    value={customLabel}
                    onChange={(e) => setCustomLabel(e.target.value)}
                    placeholder="e.g. SALE or Festive 2026"
                    className="w-full px-3 py-1.5 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-[#9E8055]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Target Category / View</label>
                  <input
                    type="text"
                    value={customValue}
                    onChange={(e) => setCustomValue(e.target.value)}
                    placeholder="e.g. sale, pret, unstitched, or shop"
                    className="w-full px-3 py-1.5 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-[#9E8055]"
                  />
                </div>

                {/* Styling Options in Add Form */}
                <div className="p-3 bg-[#FBF9F6] border border-[#EAE4DC] rounded-lg space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-xs font-bold text-[#222] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={customIsBold}
                        onChange={(e) => setCustomIsBold(e.target.checked)}
                        className="rounded border-gray-300 text-[#9E8055] focus:ring-[#9E8055]"
                      />
                      <span className="flex items-center gap-1">
                        <Bold className="w-3.5 h-3.5 text-gray-700" />
                        Make Text Bold
                      </span>
                    </label>

                    <button
                      type="button"
                      onClick={() => {
                        setCustomIsBold(true);
                        setCustomColor('#DC2626');
                        setCustomBadge('SALE');
                      }}
                      className="px-2 py-0.5 bg-red-100 hover:bg-red-200 text-red-800 text-[10px] font-bold rounded transition"
                    >
                      Preset: Sale Red
                    </button>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Custom Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={customColor || '#222222'}
                        onChange={(e) => setCustomColor(e.target.value)}
                        className="w-7 h-7 p-0.5 border border-gray-300 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={customColor}
                        onChange={(e) => setCustomColor(e.target.value)}
                        placeholder="#DC2626 or leave empty for default"
                        className="flex-1 px-2.5 py-1 border border-gray-300 rounded text-[11px] font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Optional Badge Tag (e.g. SALE)</label>
                    <input
                      type="text"
                      value={customBadge}
                      onChange={(e) => setCustomBadge(e.target.value)}
                      placeholder="e.g. SALE, NEW, 50% OFF"
                      className="w-full px-2.5 py-1 border border-gray-300 rounded text-[11px]"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-100 flex justify-end">
                  <button
                    type="submit"
                    disabled={!customLabel || !customValue}
                    className="px-4 py-2 bg-[#222] text-white text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-[#9E8055] transition disabled:opacity-40"
                  >
                    Add to Menu
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Right Column: Menu Structure Canvas (8 cols) */}
        <div className="lg:col-span-8 bg-white border border-[#EAE4DC] rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-6">
          
          <div className="space-y-4">
            {/* Menu Header Input */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <label className="text-xs font-bold text-[#222] uppercase tracking-wider">Menu Name:</label>
                <input
                  type="text"
                  value={menuName}
                  onChange={(e) => setMenuName(e.target.value)}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-semibold text-[#222] focus:ring-1 focus:ring-[#9E8055]"
                />
              </div>

              <button
                onClick={handleSaveMenu}
                className="px-6 py-2.5 bg-[#D4AF37] hover:bg-[#b8952b] text-[#1E1E24] text-xs font-bold uppercase tracking-wider rounded-xl transition shadow flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>Save Menu</span>
              </button>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-[#FAFAFA] p-3.5 rounded-xl border border-gray-100 text-xs text-gray-600 gap-2">
              <span>
                💡 <strong>Tip:</strong> Click <strong>Edit</strong> on any menu item below to toggle <strong>Bold text</strong>, choose a <strong>Color (e.g. Red for Sale)</strong>, or add a <strong>Highlight Badge</strong>.
              </span>
            </div>

            {/* Menu Items List */}
            {items.length === 0 ? (
              <div className="py-16 text-center border-2 border-dashed border-gray-200 rounded-xl space-y-3">
                <Globe className="w-10 h-10 text-gray-300 mx-auto" />
                <p className="font-serif text-base font-bold text-[#222]">Menu Structure Is Empty</p>
                <p className="text-xs text-gray-400 max-w-sm mx-auto">
                  Select pages or categories from the left panel and click "Add to Menu" to build your custom header navigation.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {items.map((item, index) => {
                  const isExpanded = expandedItemId === item.id;
                  const isItemBold = !!item.isBold;
                  const itemColor = item.color;
                  const hasCustomColor = !!itemColor && itemColor.trim() !== '';

                  return (
                    <div
                      key={item.id}
                      className={`bg-white border rounded-xl overflow-hidden shadow-2xs transition-all ${
                        isExpanded ? 'border-[#9E8055] ring-2 ring-[#9E8055]/10' : 'border-[#EAE4DC] hover:border-[#9E8055]'
                      }`}
                    >
                      {/* Item Row Header */}
                      <div className="p-3.5 bg-[#FAFAFA] flex items-center justify-between">
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Move Controls */}
                          <div className="flex flex-col gap-0.5 flex-shrink-0">
                            <button
                              onClick={() => moveItem(index, 'up')}
                              disabled={index === 0}
                              className="p-1 hover:bg-gray-200 rounded text-gray-600 disabled:opacity-20 transition"
                              title="Move Up"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => moveItem(index, 'down')}
                              disabled={index === items.length - 1}
                              className="p-1 hover:bg-gray-200 rounded text-gray-600 disabled:opacity-20 transition"
                              title="Move Down"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Item Label with live styling preview */}
                          <div className="flex items-center gap-2.5 flex-wrap min-w-0">
                            <span
                              className={`text-sm tracking-wide ${isItemBold ? 'font-bold' : 'font-medium'}`}
                              style={{ color: hasCustomColor ? itemColor : '#222222' }}
                            >
                              {item.label}
                            </span>

                            {item.badgeText && (
                              <span
                                className="px-1.5 py-0.5 text-[9px] font-extrabold rounded uppercase tracking-wider text-white shadow-2xs"
                                style={{ backgroundColor: item.badgeColor || (hasCustomColor ? itemColor : '#DC2626') }}
                              >
                                {item.badgeText}
                              </span>
                            )}

                            {/* Tags */}
                            <span className="px-2 py-0.5 bg-gray-200/80 text-gray-600 text-[10px] font-semibold uppercase rounded">
                              {item.targetType}
                            </span>

                            {isItemBold && (
                              <span className="px-1.5 py-0.5 bg-amber-100 text-amber-900 font-bold text-[9px] rounded flex items-center gap-0.5">
                                <Bold className="w-2.5 h-2.5" /> Bold
                              </span>
                            )}

                            {hasCustomColor && (
                              <span className="px-1.5 py-0.5 bg-gray-100 text-gray-700 text-[9px] font-mono rounded flex items-center gap-1 border border-gray-200">
                                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: itemColor }} />
                                {itemColor}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                          <button
                            onClick={() => setExpandedItemId(isExpanded ? null : item.id)}
                            className="px-2.5 py-1 text-xs text-[#9E8055] font-bold hover:bg-[#9E8055]/10 rounded-md transition flex items-center gap-1"
                          >
                            <span>{isExpanded ? 'Close' : 'Style & Edit'}</span>
                            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </button>

                          <button
                            onClick={() => removeItem(item.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition"
                            title="Remove"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Item Configuration & Styling Dropdown */}
                      {isExpanded && (
                        <div className="p-5 bg-white border-t border-gray-100 space-y-5 text-xs">
                          {/* Navigation Label & Target */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">
                                Navigation Label
                              </label>
                              <input
                                type="text"
                                value={item.label}
                                onChange={(e) => updateItemProperty(item.id, { label: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs font-semibold text-[#222] focus:ring-1 focus:ring-[#9E8055]"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">
                                Target Value / Destination
                              </label>
                              <input
                                type="text"
                                value={item.targetValue}
                                onChange={(e) => updateItemProperty(item.id, { targetValue: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs font-semibold text-[#222] focus:ring-1 focus:ring-[#9E8055]"
                              />
                            </div>
                          </div>

                          {/* Quick 1-Click Stylers */}
                          <div className="p-3 bg-[#FBF9F6] border border-[#EAE4DC] rounded-xl space-y-2">
                            <label className="block text-[10px] font-bold text-[#8B5E34] uppercase tracking-wider">
                              ⚡ Quick 1-Click Styling Presets
                            </label>
                            <div className="flex items-center gap-2 flex-wrap">
                              <button
                                type="button"
                                onClick={() => updateItemProperty(item.id, {
                                  isBold: true,
                                  color: '#DC2626',
                                  badgeText: 'SALE',
                                  badgeColor: '#DC2626'
                                })}
                                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-[11px] rounded-lg shadow-2xs transition flex items-center gap-1.5"
                              >
                                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                                <span>Active Sale (Red + Bold + SALE Tag)</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => updateItemProperty(item.id, {
                                  isBold: true,
                                  color: '#D4AF37',
                                  badgeText: ''
                                })}
                                className="px-3 py-1.5 bg-[#D4AF37] hover:bg-[#c49f2e] text-[#1E1E24] font-bold text-[11px] rounded-lg shadow-2xs transition flex items-center gap-1.5"
                              >
                                <span>Luxury Gold (Gold + Bold)</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => updateItemProperty(item.id, {
                                  isBold: true,
                                  color: '#059669',
                                  badgeText: 'NEW',
                                  badgeColor: '#059669'
                                })}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-lg shadow-2xs transition flex items-center gap-1.5"
                              >
                                <span>New Arrival (Emerald + NEW)</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => updateItemProperty(item.id, {
                                  isBold: false,
                                  color: undefined,
                                  badgeText: undefined,
                                  badgeColor: undefined
                                })}
                                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-[11px] rounded-lg transition flex items-center gap-1"
                              >
                                <RefreshCw className="w-3 h-3" />
                                <span>Reset to Default</span>
                              </button>
                            </div>
                          </div>

                          {/* Detailed Typography & Color Controls */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
                            
                            {/* Bold Toggle */}
                            <div className="space-y-2">
                              <label className="block text-[10px] font-bold text-gray-600 uppercase">
                                Typography Weight
                              </label>
                              <button
                                type="button"
                                onClick={() => updateItemProperty(item.id, { isBold: !isItemBold })}
                                className={`w-full py-2.5 px-3 rounded-lg border font-bold text-xs flex items-center justify-center gap-2 transition ${
                                  isItemBold
                                    ? 'bg-[#222222] text-white border-[#222222] shadow-sm'
                                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                }`}
                              >
                                <Bold className="w-4 h-4" />
                                <span>{isItemBold ? 'Bold Active (font-bold)' : 'Normal Weight (Click to Bold)'}</span>
                              </button>
                            </div>

                            {/* Color Selector */}
                            <div className="space-y-2 md:col-span-2">
                              <label className="block text-[10px] font-bold text-gray-600 uppercase">
                                Text Color
                              </label>

                              {/* Color Swatch Row */}
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {COLOR_PRESETS.map((preset) => {
                                  const isSelected = (preset.value === '' && !hasCustomColor) || itemColor === preset.value;
                                  return (
                                    <button
                                      key={preset.label}
                                      type="button"
                                      onClick={() => updateItemProperty(item.id, { color: preset.value || undefined })}
                                      className={`px-2.5 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1.5 border transition ${
                                        isSelected
                                          ? 'border-[#9E8055] bg-[#F9F7F4] text-[#222] ring-1 ring-[#9E8055]'
                                          : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                                      }`}
                                    >
                                      <span
                                        className="w-3 h-3 rounded-full border border-black/10 flex-shrink-0"
                                        style={{ backgroundColor: preset.hex }}
                                      />
                                      <span>{preset.label}</span>
                                    </button>
                                  );
                                })}
                              </div>

                              {/* Custom Hex / Color Picker input */}
                              <div className="flex items-center gap-2 pt-1">
                                <span className="text-[11px] text-gray-500 font-medium">Custom Color:</span>
                                <input
                                  type="color"
                                  value={itemColor || '#222222'}
                                  onChange={(e) => updateItemProperty(item.id, { color: e.target.value })}
                                  className="w-8 h-8 p-0.5 border border-gray-300 rounded cursor-pointer"
                                  title="Pick custom color"
                                />
                                <input
                                  type="text"
                                  value={itemColor || ''}
                                  onChange={(e) => updateItemProperty(item.id, { color: e.target.value || undefined })}
                                  placeholder="#DC2626 (Hex code)"
                                  className="w-36 px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs font-mono"
                                />
                                {hasCustomColor && (
                                  <button
                                    type="button"
                                    onClick={() => updateItemProperty(item.id, { color: undefined })}
                                    className="text-xs text-red-600 hover:underline"
                                  >
                                    Clear Color
                                  </button>
                                )}
                              </div>
                            </div>

                          </div>

                          {/* Optional Highlight Badge Tag */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                            <div>
                              <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">
                                Optional Badge Tag (e.g. SALE / HOT / NEW / 20% OFF)
                              </label>
                              <input
                                type="text"
                                value={item.badgeText || ''}
                                onChange={(e) => updateItemProperty(item.id, { badgeText: e.target.value || undefined })}
                                placeholder="Leave empty for no badge pill"
                                className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">
                                Badge Pill Background Color
                              </label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="color"
                                  value={item.badgeColor || itemColor || '#DC2626'}
                                  onChange={(e) => updateItemProperty(item.id, { badgeColor: e.target.value })}
                                  className="w-8 h-8 p-0.5 border border-gray-300 rounded cursor-pointer"
                                />
                                <input
                                  type="text"
                                  value={item.badgeColor || ''}
                                  onChange={(e) => updateItemProperty(item.id, { badgeColor: e.target.value || undefined })}
                                  placeholder="Default matches text color"
                                  className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-mono"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Live Interactive Storefront Preview Bar */}
                          <div className="p-4 bg-[#F8F8F8] border border-gray-200 rounded-xl space-y-1.5">
                            <div className="flex items-center justify-between text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                              <span className="flex items-center gap-1">
                                <Eye className="w-3.5 h-3.5 text-[#9E8055]" />
                                Storefront Navbar Live Preview
                              </span>
                              <span className="text-[10px] text-gray-400 font-normal">
                                How visitors will see this in the header
                              </span>
                            </div>

                            <div className="h-14 bg-white border border-gray-200 rounded-lg px-6 flex items-center">
                              <div
                                className={`inline-flex items-center gap-1.5 uppercase text-xs tracking-[0.12em] ${
                                  isItemBold ? 'font-bold' : 'font-medium'
                                }`}
                                style={{ color: hasCustomColor ? itemColor : '#444444' }}
                              >
                                <span>{item.label}</span>
                                {item.badgeText && (
                                  <span
                                    className="px-1.5 py-0.5 text-[8.5px] font-extrabold rounded tracking-wider leading-none shadow-2xs text-white"
                                    style={{
                                      backgroundColor: item.badgeColor || (hasCustomColor ? itemColor : '#DC2626')
                                    }}
                                  >
                                    {item.badgeText}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              onClick={() => {
                if (window.confirm('Reset menu items to clean default navigation?')) {
                  setItems([
                    { id: 'm-1', label: 'Home', targetType: 'view', targetValue: 'home' },
                    { id: 'm-2', label: 'New Arrivals', targetType: 'category', targetValue: 'new-arrivals' },
                    { id: 'm-3', label: 'Pret', targetType: 'category', targetValue: 'pret' },
                    { id: 'm-4', label: 'Unstitched', targetType: 'category', targetValue: 'unstitched' },
                    { id: 'm-5', label: 'Sale', targetType: 'category', targetValue: 'sale', isBold: true, color: '#DC2626', badgeText: 'SALE', badgeColor: '#DC2626' },
                    { id: 'm-6', label: 'Contact', targetType: 'view', targetValue: 'contact' },
                  ]);
                }
              }}
              className="text-xs text-red-600 hover:underline font-semibold"
            >
              Reset to Clean Default Menu (with Sale Highlight)
            </button>

            <button
              onClick={handleSaveMenu}
              className="px-8 py-3 bg-[#222222] hover:bg-[#9E8055] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition shadow flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Save Menu Changes</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
