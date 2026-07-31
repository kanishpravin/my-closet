import React from 'react';
import { 
  Shirt, 
  Container, 
  Plus, 
  Briefcase, 
  Sparkles,
  Heart,
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';
import { motion } from 'motion/react';
import { ClothingItem } from '../types';

interface DashboardProps {
  clothingItems: ClothingItem[];
  onNavigateToClothes: (categoryFilter?: string) => void;
  onNavigateToTab: (tab: string) => void;
  onOpenAddModal: () => void;
}

export default function Dashboard({ 
  clothingItems, 
  onNavigateToClothes, 
  onNavigateToTab,
  onOpenAddModal 
}: DashboardProps) {

  const totalItemsCount = clothingItems.reduce((acc, item) => acc + item.quantity, 0);

  // Group items by category to get counts
  const getCategoryCount = (cat: string) => {
    return clothingItems
      .filter(item => item.category === cat)
      .reduce((acc, item) => acc + item.quantity, 0);
  };

  const mainCategories = [
    { name: 'T-Shirts', count: getCategoryCount('T-Shirts'), icon: Shirt },
    { name: 'Shirts', count: getCategoryCount('Shirts'), icon: Shirt },
    { name: 'Jeans', count: getCategoryCount('Jeans'), icon: Shirt },
    { name: 'Inners', count: getCategoryCount('Inners'), icon: Shirt },
    { name: 'Socks', count: getCategoryCount('Socks'), icon: Shirt },
    { name: 'Hoodies', count: getCategoryCount('Hoodies'), icon: Shirt },
  ];

  // Count items in laundry
  const laundryItems = clothingItems.filter(item => item.status !== 'In Wardrobe');
  const laundryCount = laundryItems.reduce((acc, item) => acc + item.quantity, 0);

  const washingCount = clothingItems.filter(item => item.status === 'Washing').reduce((acc, item) => acc + item.quantity, 0);
  const dryingCount = clothingItems.filter(item => item.status === 'Drying').reduce((acc, item) => acc + item.quantity, 0);
  const foldingCount = clothingItems.filter(item => item.status === 'Folding').reduce((acc, item) => acc + item.quantity, 0);

  // Get most used items
  const mostUsedItems = [...clothingItems]
    .sort((a, b) => b.usedCount - a.usedCount)
    .filter(item => item.usedCount > 0)
    .slice(0, 3);

  // Empty State View as requested
  if (clothingItems.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 bg-black">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-md w-full flex flex-col items-center space-y-8"
        >
          {/* Central Pulsating Plus Button */}
          <div className="relative">
            <motion.div 
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              className="absolute inset-0 bg-[#FF3B3B]/10 rounded-full blur-2xl scale-125"
            />
            
            <button
              onClick={onOpenAddModal}
              className="w-28 h-28 rounded-full bg-black border-2 border-[#FF3B3B] hover:bg-[#FF3B3B] text-[#FF3B3B] hover:text-white flex items-center justify-center transition-all duration-300 shadow-2xl shadow-[#FF3B3B]/20 relative z-10 cursor-pointer group"
              title="Add clothing item"
              id="dashboard-central-add-btn"
            >
              <Plus size={44} className="transition-transform duration-300 group-hover:rotate-90" />
            </button>
          </div>

          <div className="space-y-3">
            <h3 className="text-2xl font-extrabold text-white tracking-tight" id="dashboard-empty-title">
              No clothes added yet.
            </h3>
            <p className="text-sm text-zinc-500 max-w-xs mx-auto leading-relaxed">
              Tap the large Add button above to catalog your very first wardrobe garment and unlock automatic laundry tracking.
            </p>
          </div>

          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-2 bg-[#FF3B3B] hover:bg-[#FF1A1A] text-white font-bold text-xs py-3 px-6 rounded-full tracking-wider uppercase transition-all duration-300 shadow-lg shadow-[#FF3B3B]/15 cursor-pointer"
          >
            <span>Add Clothes Now</span>
            <ArrowRight size={14} />
          </button>
        </motion.div>
      </div>
    );
  }

  // Active Dashboard
  return (
    <div className="space-y-8 bg-black">
      
      {/* Top Welcome Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-900 pb-5">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight leading-none">Dashboard</h2>
          <p className="text-xs text-zinc-500 mt-2">Browse active counts, laundry stages, and frequently logged wears.</p>
        </div>
        
        <div className="flex items-center gap-2 bg-zinc-950 border border-zinc-900 px-4 py-1.5 rounded-full text-[10px] font-mono text-zinc-400">
          <span className="w-2 h-2 rounded-full bg-[#FF3B3B] animate-pulse" />
          <span>LOCAL VAULT ACTIVE</span>
        </div>
      </div>

      {/* Hero Bento Statistics Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Total Clothes Hero Card */}
        <motion.div 
          whileHover={{ y: -3 }}
          onClick={() => onNavigateToClothes()}
          className="col-span-1 md:col-span-2 overflow-hidden rounded-3xl bg-zinc-950 border border-zinc-900 p-6 flex flex-col justify-between cursor-pointer hover:border-[#FF3B3B]/40 transition-all duration-300 group relative"
          id="total-items-hero-card"
        >
          <div className="absolute top-0 right-0 -mt-12 -mr-12 w-48 h-48 bg-[#FF3B3B]/5 rounded-full blur-2xl group-hover:scale-110 transition-transform" />
          
          <div className="flex justify-between items-start">
            <div className="space-y-4">
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-[#FF3B3B] bg-[#FF3B3B]/10 border border-[#FF3B3B]/10 px-2.5 py-1 rounded-full">
                My Wardrobe Count
              </span>
              <div>
                <h3 className="text-6xl font-black text-white tracking-tight" id="dashboard-total-items-count">
                  {totalItemsCount}
                </h3>
                <p className="text-xs text-zinc-500 mt-1.5">Garments currently cataloged in your active vault</p>
              </div>
            </div>
            
            <div className="bg-zinc-900/80 p-3 rounded-2xl border border-zinc-800 text-[#FF3B3B] group-hover:rotate-6 transition-all shadow-md">
              <Shirt size={22} />
            </div>
          </div>
          
          <div className="mt-8 pt-4 border-t border-zinc-900 flex items-center justify-between text-xs text-zinc-400 font-semibold group-hover:text-white transition-colors">
            <span>Tap to explore wardrobe catalog</span>
            <ArrowRight size={14} className="text-[#FF3B3B] group-hover:translate-x-1 transition-transform" />
          </div>
        </motion.div>

        {/* Quick Laundry Status Bento Card */}
        <motion.div 
          whileHover={{ y: -3 }}
          onClick={() => onNavigateToTab('laundry')}
          className="rounded-3xl bg-zinc-950 border border-zinc-900 p-6 flex flex-col justify-between cursor-pointer hover:border-[#FF3B3B]/30 transition-all duration-300 group"
        >
          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-500">Laundry Status</span>
              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${laundryCount > 0 ? 'bg-[#FF3B3B]/10 text-[#FF3B3B] border border-[#FF3B3B]/20' : 'bg-zinc-900 text-zinc-500 border border-zinc-800'}`}>
                {laundryCount} items
              </span>
            </div>
            
            {laundryCount > 0 ? (
              <div className="space-y-3 my-2 font-semibold">
                <div className="flex items-center justify-between text-xs text-zinc-400">
                  <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Washing</span>
                  <span className="font-bold text-white">{washingCount}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-zinc-400">
                  <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Drying</span>
                  <span className="font-bold text-white">{dryingCount}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-zinc-400">
                  <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-purple-500" /> Folding</span>
                  <span className="font-bold text-white">{foldingCount}</span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-zinc-600 text-center">
                <Container size={20} className="mb-2 text-zinc-700" />
                <p className="text-[11px] font-medium">All items are clean & ready!</p>
              </div>
            )}
          </div>

          <div className="text-xs text-zinc-500 border-t border-zinc-900 pt-4 flex items-center justify-between group-hover:text-white transition-colors">
            <span>Manage cleaning queues</span>
            <Container size={14} className="text-zinc-600 group-hover:text-[#FF3B3B]" />
          </div>
        </motion.div>

      </div>

      {/* Browse categories list */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-extrabold text-white tracking-tight uppercase flex items-center gap-2">
            <Layers size={14} className="text-[#FF3B3B]" />
            <span>Garment Categories</span>
          </h3>
          <button 
            onClick={() => onNavigateToClothes()}
            className="text-xs text-[#FF3B3B] hover:text-[#FF1A1A] font-bold"
          >
            View All
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4" id="dashboard-category-grid">
          {mainCategories.map((cat) => {
            const CatIcon = cat.icon;
            return (
              <motion.div
                whileHover={{ scale: 1.02 }}
                key={cat.name}
                id={`category-card-${cat.name}`}
                onClick={() => onNavigateToClothes(cat.name)}
                className="bg-zinc-950/40 hover:bg-zinc-950 border border-zinc-900 hover:border-[#FF3B3B]/20 p-5 rounded-3xl flex flex-col items-center justify-center gap-3.5 cursor-pointer transition-all duration-200 text-center group"
              >
                <div className="w-12 h-12 rounded-2xl bg-zinc-900 flex items-center justify-center text-zinc-400 group-hover:scale-105 group-hover:bg-[#FF3B3B]/10 group-hover:text-[#FF3B3B] transition-all border border-zinc-850">
                  <CatIcon size={18} />
                </div>
                <div>
                  <h4 className="font-extrabold text-xs text-zinc-200 group-hover:text-white transition-colors">{cat.name}</h4>
                  <p className="text-[10px] text-zinc-500 mt-1 font-mono">{cat.count} Items</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Spotlight and Actions panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Quick actions box */}
        <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider mb-5">Quick Actions</h3>
            
            <div className="space-y-2.5">
              <button
                onClick={onOpenAddModal}
                className="w-full flex items-center justify-center gap-2 bg-[#FF3B3B] hover:bg-[#FF1A1A] text-white font-bold text-xs py-3.5 px-4 rounded-2xl transition-all shadow-md shadow-[#FF3B3B]/10 cursor-pointer"
                id="quick-action-add-cloth"
              >
                <Plus size={15} />
                <span>Add Clothes</span>
              </button>
              
              <button
                onClick={() => onNavigateToTab('packing')}
                className="w-full flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-850 text-white font-bold text-xs py-3.5 px-4 rounded-2xl border border-zinc-800 hover:border-zinc-700 transition-all cursor-pointer"
                id="quick-action-packing-assistant"
              >
                <Briefcase size={14} className="text-zinc-500" />
                <span>Plan Packing Trip</span>
              </button>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-zinc-900 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
            <span>Offline Database</span>
            <span>v2.0</span>
          </div>
        </div>

        {/* Most worn wardrobe items */}
        <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-6 lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
            <h3 className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider">Frequently Worn</h3>
            <button 
              onClick={() => onNavigateToTab('statistics')}
              className="text-xs text-zinc-500 hover:text-white font-bold"
            >
              Analytics
            </button>
          </div>

          {mostUsedItems.length > 0 ? (
            <div className="divide-y divide-zinc-900 space-y-1">
              {mostUsedItems.map((item) => (
                <div 
                  key={item.id} 
                  onClick={() => onNavigateToClothes(item.category)}
                  className="flex items-center justify-between py-3 cursor-pointer group"
                >
                  <div className="flex items-center gap-3.5">
                    {item.photoBase64 ? (
                      <img 
                        src={item.photoBase64} 
                        alt={item.name}
                        className="w-11 h-11 rounded-xl object-cover border border-zinc-800"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div 
                        className="w-11 h-11 rounded-xl flex items-center justify-center border border-zinc-800"
                        style={{ backgroundColor: `${item.colorHex}15` }}
                      >
                        <Shirt 
                          size={18} 
                          style={{ color: item.colorHex === '#ffffff' || item.colorHex === '#f9fafb' ? '#d1d5db' : item.colorHex }} 
                        />
                      </div>
                    )}
                    <div>
                      <h4 className="text-xs font-bold text-zinc-200 group-hover:text-[#FF3B3B] transition-colors">{item.name}</h4>
                      <p className="text-[10px] text-zinc-500 mt-1 font-semibold">{item.brand} • {item.color}</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <span className="text-[10px] font-mono font-extrabold text-[#FF3B3B] bg-[#FF3B3B]/10 border border-[#FF3B3B]/10 px-2.5 py-1 rounded-lg">
                      {item.usedCount} wears
                    </span>
                    <p className="text-[10px] text-zinc-500 mt-1.5 font-semibold">
                      {item.lastUsed ? new Date(item.lastUsed).toLocaleDateString(undefined, {month: 'short', day: 'numeric'}) : 'Never'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-zinc-600 text-center space-y-2">
              <Sparkles size={20} className="text-zinc-700" />
              <p className="text-xs font-semibold">Log wears on the Wear Calendar to see analytics here!</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
