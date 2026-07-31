import React, { useState } from 'react';
import { 
  Settings, 
  Trash2, 
  Download, 
  Upload, 
  Sliders, 
  Bell, 
  Database,
  Info,
  Check,
  Plus,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AppSettings } from '../types';

interface SettingsViewProps {
  settings: AppSettings;
  onUpdateSettings: (updates: Partial<AppSettings>) => void;
  onClearAllData: () => void;
  onImportData: (importedString: string) => boolean;
  onExportData: () => string;
}

export default function SettingsView({ 
  settings, 
  onUpdateSettings, 
  onClearAllData,
  onImportData,
  onExportData 
}: SettingsViewProps) {
  
  const [newCat, setNewCat] = useState('');
  const [newBrand, setNewBrand] = useState('');
  const [importText, setImportText] = useState('');
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleAddCategory = () => {
    if (!newCat.trim()) return;
    if (settings.categories.includes(newCat.trim())) return;
    onUpdateSettings({
      categories: [...settings.categories, newCat.trim()]
    });
    setNewCat('');
  };

  const handleAddBrand = () => {
    if (!newBrand.trim()) return;
    if (settings.brands.includes(newBrand.trim())) return;
    onUpdateSettings({
      brands: [...settings.brands, newBrand.trim()]
    });
    setNewBrand('');
  };

  const handleRemoveCategory = (cat: string) => {
    onUpdateSettings({
      categories: settings.categories.filter(c => c !== cat)
    });
  };

  const handleRemoveBrand = (brand: string) => {
    onUpdateSettings({
      brands: settings.brands.filter(b => b !== brand)
    });
  };

  const handleExport = () => {
    try {
      const jsonStr = onExportData();
      navigator.clipboard.writeText(jsonStr);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      alert('Error copying database string: ' + err);
    }
  };

  const handleImportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!importText.trim()) return;
    
    const success = onImportData(importText);
    if (success) {
      alert('Wardrobe data imported successfully!');
      setImportText('');
      setIsImportOpen(false);
    } else {
      alert('Failed to parse wardrobe data. Please ensure it is a valid backup string.');
    }
  };

  return (
    <div className="space-y-6 bg-black max-w-4xl">
      
      {/* Header */}
      <div className="border-b border-zinc-900 pb-5">
        <h2 className="text-2xl font-black text-white flex items-center gap-2">
          <span>Settings</span>
          <Settings size={18} className="text-[#FF3B3B]" />
        </h2>
        <p className="text-xs text-zinc-500 mt-1.5 font-semibold">Customize wardrobe configurations, toggles, and manage backup restores.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Left Column - Reminders & Preferences */}
        <div className="space-y-6">
          
          {/* Reminders Block */}
          <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-6 space-y-5">
            <h3 className="text-[10px] uppercase font-extrabold text-zinc-400 tracking-wider flex items-center gap-2 border-b border-zinc-900/60 pb-3">
              <Bell size={13} className="text-[#FF3B3B]" />
              <span>Reminders & Alerts</span>
            </h3>

            <div className="space-y-5">
              {/* Laundry reminder toggle */}
              <div className="flex items-center justify-between text-xs py-1">
                <div>
                  <h4 className="font-extrabold text-zinc-200">Laundry Reminder</h4>
                  <p className="text-[10px] text-zinc-500 mt-1 font-semibold">Send alerts when dirty queues build up</p>
                </div>
                <select
                  value={settings.laundryReminder}
                  onChange={(e) => onUpdateSettings({ laundryReminder: e.target.value })}
                  className="bg-black border border-zinc-900 focus:border-[#FF3B3B]/40 rounded-xl px-3 py-2 text-zinc-300 outline-none font-bold"
                >
                  <option value="Off">Off</option>
                  <option value="Every 3 days">Every 3 days</option>
                  <option value="Weekly">Weekly</option>
                </select>
              </div>

              {/* Low stock reminder toggle switch */}
              <div className="flex items-center justify-between text-xs py-1">
                <div>
                  <h4 className="font-extrabold text-zinc-200">Low Stock Alert</h4>
                  <p className="text-[10px] text-zinc-500 mt-1 font-semibold">Warn if active categories drop below 3 clean items</p>
                </div>
                
                {/* Switch toggle (Material 3 style) */}
                <button
                  type="button"
                  onClick={() => onUpdateSettings({ lowStockReminder: !settings.lowStockReminder })}
                  className={`w-12 h-6.5 rounded-full transition-all relative border outline-none cursor-pointer ${
                    settings.lowStockReminder 
                      ? 'bg-[#FF3B3B] border-[#FF3B3B]' 
                      : 'bg-zinc-900 border-zinc-800'
                  }`}
                  id="settings-low-stock-toggle"
                >
                  <span className={`absolute top-[3px] w-4.5 h-4.5 rounded-full bg-white transition-all shadow-sm ${
                    settings.lowStockReminder ? 'left-6.5' : 'left-[3px]'
                  }`} />
                </button>
              </div>
            </div>
          </div>

          {/* Backup & Data Administration */}
          <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-6 space-y-5">
            <h3 className="text-[10px] uppercase font-extrabold text-zinc-400 tracking-wider flex items-center gap-2 border-b border-zinc-900/60 pb-3">
              <Database size={13} className="text-zinc-500" />
              <span>Backups & Local Storage</span>
            </h3>

            <div className="grid grid-cols-2 gap-3">
              {/* Export Button */}
              <button
                onClick={handleExport}
                className="flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-850 border border-zinc-850 rounded-2xl py-3 px-4 font-bold text-xs text-zinc-200 cursor-pointer transition-colors"
                id="settings-export-btn"
              >
                {copied ? <Check size={14} className="text-emerald-500" /> : <Download size={14} className="text-zinc-500" />}
                <span>{copied ? 'Copied!' : 'Copy Backup'}</span>
              </button>

              {/* Import Button */}
              <button
                onClick={() => setIsImportOpen(true)}
                className="flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-850 border border-zinc-850 rounded-2xl py-3 px-4 font-bold text-xs text-zinc-200 cursor-pointer transition-colors"
                id="settings-import-btn"
              >
                <Upload size={14} className="text-zinc-500" />
                <span>Import Backup</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                if (window.confirm('CRITICAL ACTION: This will completely erase your entire custom wardrobe closet holding, wear calendar logging lists, and travel checklists. You will be reset to a pristine first-time empty slate. Continue?')) {
                  onClearAllData();
                }
              }}
              className="w-full bg-[#FF3B3B]/10 hover:bg-[#FF3B3B]/15 text-[#FF3B3B] border border-[#FF3B3B]/15 font-bold text-xs py-3.5 px-4 rounded-2xl transition-all cursor-pointer uppercase tracking-wider"
              id="settings-clear-all-btn"
            >
              Purge All Closet Data
            </button>
          </div>

        </div>

        {/* Right Column - Clothes Variable Modifiers */}
        <div className="space-y-6">
          
          {/* Categories Manager */}
          <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-6 space-y-5">
            <h3 className="text-[10px] uppercase font-extrabold text-zinc-400 tracking-wider flex items-center gap-2 border-b border-zinc-900/60 pb-3">
              <Sliders size={13} className="text-[#FF3B3B]" />
              <span>Garment Categories</span>
            </h3>

            <div className="space-y-4">
              {/* Category list tags */}
              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pb-1 scrollbar-none">
                {settings.categories.map(cat => (
                  <span 
                    key={cat}
                    className="flex items-center gap-1.5 bg-black border border-zinc-900 text-zinc-300 rounded-xl pl-3 pr-2 py-1.5 text-xs font-semibold"
                  >
                    <span>{cat}</span>
                    <button 
                      onClick={() => handleRemoveCategory(cat)}
                      disabled={settings.categories.length <= 1}
                      className="text-zinc-600 hover:text-[#FF3B3B] p-0.5 rounded transition-colors disabled:opacity-30 cursor-pointer"
                    >
                      <Trash2 size={11} />
                    </button>
                  </span>
                ))}
              </div>

              {/* Add category text field */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="New Category..."
                  value={newCat}
                  onChange={(e) => setNewCat(e.target.value)}
                  className="bg-black border border-zinc-900 focus:border-[#FF3B3B]/50 rounded-2xl py-2.5 px-3.5 text-xs font-semibold text-zinc-200 outline-none flex-1 placeholder-zinc-700"
                />
                <button
                  onClick={handleAddCategory}
                  className="bg-zinc-900 hover:bg-zinc-850 text-white px-3.5 rounded-2xl border border-zinc-800 flex items-center justify-center cursor-pointer"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* Brands Manager */}
          <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-6 space-y-5">
            <h3 className="text-[10px] uppercase font-extrabold text-zinc-400 tracking-wider flex items-center gap-2 border-b border-zinc-900/60 pb-3">
              <Sliders size={13} className="text-zinc-500" />
              <span>Preferred Brands</span>
            </h3>

            <div className="space-y-4">
              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pb-1 scrollbar-none">
                {settings.brands.map(brand => (
                  <span 
                    key={brand}
                    className="flex items-center gap-1.5 bg-black border border-zinc-900 text-zinc-300 rounded-xl pl-3 pr-2 py-1.5 text-xs font-semibold"
                  >
                    <span>{brand}</span>
                    <button 
                      onClick={() => handleRemoveBrand(brand)}
                      disabled={settings.brands.length <= 1}
                      className="text-zinc-600 hover:text-[#FF3B3B] p-0.5 rounded transition-colors disabled:opacity-30 cursor-pointer"
                    >
                      <Trash2 size={11} />
                    </button>
                  </span>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="New Brand..."
                  value={newBrand}
                  onChange={(e) => setNewBrand(e.target.value)}
                  className="bg-black border border-zinc-900 focus:border-[#FF3B3B]/50 rounded-2xl py-2.5 px-3.5 text-xs font-semibold text-zinc-200 outline-none flex-1 placeholder-zinc-700"
                />
                <button
                  onClick={handleAddBrand}
                  className="bg-zinc-900 hover:bg-zinc-850 text-white px-3.5 rounded-2xl border border-zinc-800 flex items-center justify-center cursor-pointer"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* About Box */}
      <div className="bg-zinc-950/40 border border-zinc-900 rounded-3xl p-6 flex items-start gap-4">
        <div className="p-3 bg-[#FF3B3B]/10 text-[#FF3B3B] rounded-2xl border border-[#FF3B3B]/15 shrink-0">
          <Info size={16} />
        </div>
        <div className="space-y-1.5 text-xs leading-relaxed">
          <h4 className="font-extrabold text-zinc-200">About My Closet</h4>
          <p className="text-zinc-500 font-semibold max-w-2xl">
            My Closet is a high-fidelity client-side local database manager representing your personal closet holdings, wash cycle states, and wear trends. All statistics are updated in real-time. Styled in material design accents, built on React + Vite.
          </p>
        </div>
      </div>

      {/* IMPORT BACKUP DIALOG MODAL */}
      <AnimatePresence>
        {isImportOpen && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-zinc-950 border border-zinc-900 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl"
            >
              
              <div className="p-5 border-b border-zinc-900 flex items-center justify-between">
                <h3 className="font-extrabold text-white text-sm tracking-tight flex items-center gap-2">
                  <Upload size={18} className="text-[#FF3B3B]" />
                  <span>Import Backup</span>
                </h3>
                <button 
                  onClick={() => setIsImportOpen(false)}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleImportSubmit} className="p-6 space-y-4">
                <p className="text-xs text-zinc-500 font-semibold">Paste the JSON backup string copied during export to overwrite current closet state:</p>
                
                <textarea
                  required
                  rows={5}
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  placeholder='{"clothingItems":[],"usageLogs":[],"trips":[],"wishlist":[]}'
                  className="w-full bg-black border border-zinc-900 focus:border-[#FF3B3B]/55 rounded-2xl p-4 text-xs text-zinc-200 placeholder-zinc-800 outline-none font-mono"
                />

                <div className="flex gap-2 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setIsImportOpen(false)}
                    className="bg-black hover:bg-zinc-900 border border-zinc-900 text-zinc-500 hover:text-white text-xs py-2.5 px-4 rounded-xl font-bold cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-[#FF3B3B] hover:bg-[#FF1A1A] text-white font-bold text-xs py-2.5 px-4 rounded-xl cursor-pointer transition-colors shadow-md"
                  >
                    Restore Backup
                  </button>
                </div>
              </form>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
