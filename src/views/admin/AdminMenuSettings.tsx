import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MenuItem } from '../../types';
import {
  Menu as MenuIcon, Plus, Trash2, ArrowUp, ArrowDown, ChevronDown, ChevronUp, Save, CheckCircle2, Link as LinkIcon, Layers, FileText, Globe
} from 'lucide-react';

export const AdminMenuSettings: React.FC = () => {
  const { menuItems, updateMenuItems, categories, cmsPages } = useApp();

  const [menuName, setMenuName] = useState('Primary Header Navigation');
  const [items, setItems] = useState<MenuItem[]>(menuItems);
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Left panel selection state
  const [selectedPages, setSelectedPages] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  
  // Custom link form
  const [customLabel, setCustomLabel] = useState('');
  const [customValue, setCustomValue] = useState('');

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
      return {
        id: `m-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        label: foundCat ? foundCat.name : catSlug,
        targetType: 'category',
        targetValue: catSlug
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
      targetValue: customValue
    };

    setItems(prev => [...prev, newItem]);
    setCustomLabel('');
    setCustomValue('');
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

  const updateItemLabel = (id: string, newLabel: string) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, label: newLabel } : i));
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
            WordPress-style navigation builder. Customize the links, order, and labels displayed in your storefront header.
          </p>
        </div>

        {saveSuccess && (
          <div className="px-4 py-2 bg-green-50 text-green-800 border border-green-200 text-xs font-bold rounded-lg flex items-center gap-2 animate-pulse">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <span>Menu saved & updated on live website!</span>
          </div>
        )}
      </div>

      {/* Main 2-Column WordPress Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Add Menu Items (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <h2 className="font-serif text-base font-bold text-[#222] uppercase tracking-wider pb-2 border-b border-gray-200">
            Add Menu Items
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

          {/* Accordion 3: Custom Links */}
          <div className="bg-white border border-[#EAE4DC] rounded-xl overflow-hidden shadow-sm">
            <button
              onClick={() => setOpenSection(openSection === 'custom' ? '' as any : 'custom')}
              className="w-full px-4 py-3 bg-[#FAFAFA] flex items-center justify-between text-xs font-bold text-[#222] border-b border-[#EAE4DC]"
            >
              <span className="flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-[#9E8055]" />
                Custom Links & Slugs
              </span>
              {openSection === 'custom' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {openSection === 'custom' && (
              <form onSubmit={handleAddCustomLink} className="p-4 space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Link Text</label>
                  <input
                    type="text"
                    value={customLabel}
                    onChange={(e) => setCustomLabel(e.target.value)}
                    placeholder="e.g. Clearance Sale"
                    className="w-full px-3 py-1.5 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-[#9E8055]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Target Category / View</label>
                  <input
                    type="text"
                    value={customValue}
                    onChange={(e) => setCustomValue(e.target.value)}
                    placeholder="e.g. sale or pret"
                    className="w-full px-3 py-1.5 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-[#9E8055]"
                  />
                </div>

                <div className="pt-2 border-t border-gray-100 flex justify-end">
                  <button
                    type="submit"
                    disabled={!customLabel || !customValue}
                    className="px-3.5 py-1.5 bg-[#222] text-white text-xs font-bold uppercase rounded-lg hover:bg-[#9E8055] transition disabled:opacity-40"
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

            <p className="text-xs text-gray-500 italic bg-[#FAFAFA] p-3 rounded-lg border border-gray-100">
              Drag or use arrow controls to arrange items into the order you prefer. Click on any item to edit its display label.
            </p>

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
                  return (
                    <div
                      key={item.id}
                      className="bg-white border border-[#EAE4DC] rounded-xl overflow-hidden shadow-sm hover:border-[#9E8055] transition"
                    >
                      <div className="p-3.5 bg-[#FAFAFA] flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {/* Move Controls */}
                          <div className="flex flex-col gap-0.5">
                            <button
                              onClick={() => moveItem(index, 'up')}
                              disabled={index === 0}
                              className="p-1 hover:bg-gray-200 rounded text-gray-600 disabled:opacity-20"
                              title="Move Up"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => moveItem(index, 'down')}
                              disabled={index === items.length - 1}
                              className="p-1 hover:bg-gray-200 rounded text-gray-600 disabled:opacity-20"
                              title="Move Down"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div>
                            <span className="font-serif text-sm font-bold text-[#222]">{item.label}</span>
                            <span className="ml-3 px-2 py-0.5 bg-gray-200 text-gray-700 text-[10px] font-semibold uppercase rounded">
                              {item.targetType}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setExpandedItemId(isExpanded ? null : item.id)}
                            className="text-xs text-[#9E8055] font-semibold hover:underline flex items-center gap-1"
                          >
                            <span>Edit</span>
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

                      {/* Item Configuration Dropdown */}
                      {isExpanded && (
                        <div className="p-4 bg-white border-t border-gray-100 space-y-3 text-xs">
                          <div>
                            <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">
                              Navigation Label
                            </label>
                            <input
                              type="text"
                              value={item.label}
                              onChange={(e) => updateItemLabel(item.id, e.target.value)}
                              className="w-full px-3 py-1.5 border border-gray-300 rounded text-xs font-semibold text-[#222] focus:ring-1 focus:ring-[#9E8055]"
                            />
                          </div>

                          <div className="text-[11px] text-gray-500">
                            Target Value: <strong className="text-[#222]">{item.targetValue}</strong>
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
          <div className="pt-4 border-t border-gray-200 flex items-center justify-between">
            <button
              onClick={() => {
                if (window.confirm('Reset menu items to default configuration?')) {
                  setItems([
                    { id: 'm-1', label: 'Home', targetType: 'view', targetValue: 'home' },
                    { id: 'm-2', label: 'New Arrivals', targetType: 'category', targetValue: 'new-arrivals' },
                    { id: 'm-3', label: 'Pret', targetType: 'category', targetValue: 'pret' },
                    { id: 'm-4', label: 'Unstitched', targetType: 'category', targetValue: 'unstitched' },
                    { id: 'm-5', label: 'Contact', targetType: 'view', targetValue: 'contact' },
                  ]);
                }
              }}
              className="text-xs text-red-600 hover:underline font-semibold"
            >
              Reset to Clean Default Menu
            </button>

            <button
              onClick={handleSaveMenu}
              className="px-6 py-2.5 bg-[#222222] hover:bg-[#9E8055] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition shadow flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Save Menu</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
