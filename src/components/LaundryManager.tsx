import React, { useState } from 'react';
import { 
  Container, 
  Check, 
  ArrowRight, 
  Trash2, 
  Shirt, 
  CheckCircle, 
  HelpCircle,
  Clock,
  Waves
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ClothingItem, ClothingStatus, AppSettings } from '../types';

interface LaundryManagerProps {
  clothingItems: ClothingItem[];
  onUpdateStatus: (id: string, newStatus: ClothingStatus) => void;
  onUpdateItem: (id: string, updates: Partial<ClothingItem>) => void;
  settings: AppSettings;
}

export default function LaundryManager({ 
  clothingItems, 
  onUpdateStatus, 
  onUpdateItem,
  settings 
}: LaundryManagerProps) {
  
  const [activeTab, setActiveTab] = useState<'All' | 'Washing' | 'Drying' | 'Folding'>('All');

  // Filter laundry items
  const laundryItems = clothingItems.filter(item => item.status !== 'In Wardrobe');

  const filteredLaundry = laundryItems.filter(item => {
    if (activeTab === 'All') return true;
    return item.status === activeTab;
  });

  const getStatusColor = (status: ClothingStatus) => {
    switch (status) {
      case 'Washing': return 'border-blue-500/25 bg-blue-950/20 text-blue-400';
      case 'Drying': return 'border-amber-500/25 bg-amber-950/20 text-amber-400';
      case 'Folding': return 'border-purple-500/25 bg-purple-950/20 text-purple-400';
      default: return 'border-zinc-800 bg-zinc-900 text-zinc-400';
    }
  };

  const handleNextStatus = (item: ClothingItem) => {
    if (item.status === 'Washing') {
      onUpdateStatus(item.id, 'Drying');
    } else if (item.status === 'Drying') {
      onUpdateStatus(item.id, 'Folding');
    } else if (item.status === 'Folding') {
      const now = new Date().toISOString().split('T')[0];
      onUpdateItem(item.id, { status: 'In Wardrobe', lastWashed: now });
    }
  };

  const handleSkipToClean = (item: ClothingItem) => {
    const now = new Date().toISOString().split('T')[0];
    onUpdateItem(item.id, { status: 'In Wardrobe', lastWashed: now });
  };

  const laundryCounts = {
    All: laundryItems.reduce((acc, item) => acc + item.quantity, 0),
    Washing: clothingItems.filter(i => i.status === 'Washing').reduce((acc, item) => acc + item.quantity, 0),
    Drying: clothingItems.filter(i => i.status === 'Drying').reduce((acc, item) => acc + item.quantity, 0),
    Folding: clothingItems.filter(i => i.status === 'Folding').reduce((acc, item) => acc + item.quantity, 0),
  };

  return (
    <div className="space-y-6 bg-black">
      
      {/* Title Header */}
      <div className="flex items-center justify-between border-b border-zinc-900 pb-5">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <span>Laundry Stream</span>
            <Container size={18} className="text-[#FF3B3B]" />
          </h2>
          <p className="text-xs text-zinc-500 mt-1.5">Track wash cycles and transition clothes from laundry buckets back into the closet.</p>
        </div>
        
        {laundryItems.length > 0 && (
          <button
            onClick={() => {
              if (window.confirm('Mark all active laundry items as clean and return them to the closet?')) {
                const now = new Date().toISOString().split('T')[0];
                laundryItems.forEach(item => {
                  onUpdateItem(item.id, { status: 'In Wardrobe', lastWashed: now });
                });
              }
            }}
            className="bg-zinc-950 hover:bg-zinc-900 border border-zinc-900 hover:border-zinc-800 text-zinc-300 font-bold text-xs py-2.5 px-4 rounded-xl cursor-pointer transition-all"
            id="laundry-clear-all-btn"
          >
            Clear All Laundry
          </button>
        )}
      </div>

      {/* Laundry Tabs navigation (Material style capsules) */}
      <div className="flex gap-2 border-b border-zinc-900/60 pb-3 overflow-x-auto scrollbar-none">
        {(['All', 'Washing', 'Drying', 'Folding'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border whitespace-nowrap cursor-pointer flex items-center gap-2 ${
              activeTab === tab
                ? 'bg-white text-black border-white'
                : 'bg-zinc-950 text-zinc-400 border-zinc-900 hover:text-white'
            }`}
          >
            <span>{tab === 'All' ? 'All Laundry' : tab}</span>
            <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full ${
              activeTab === tab ? 'bg-black text-white' : 'bg-zinc-900 text-zinc-500'
            }`}>
              {laundryCounts[tab]}
            </span>
          </button>
        ))}
      </div>

      {/* Laundry Items Grid */}
      {filteredLaundry.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" id="laundry-items-grid">
          {filteredLaundry.map((item) => (
            <motion.div
              layoutId={`laundry-card-${item.id}`}
              whileHover={{ y: -3 }}
              key={item.id}
              className="bg-zinc-950 border border-zinc-900 hover:border-zinc-800 rounded-3xl p-5 flex flex-col justify-between"
            >
              <div className="space-y-4">
                
                {/* Garment details with status tag */}
                <div className="flex justify-between items-start gap-4">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center border border-zinc-900 shrink-0"
                      style={{ backgroundColor: `${item.colorHex}12` }}
                    >
                      {item.photoBase64 ? (
                        <img 
                          src={item.photoBase64} 
                          alt={item.name} 
                          className="w-full h-full object-cover rounded-xl"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <Shirt 
                          size={16} 
                          style={{ color: item.colorHex === '#ffffff' || item.colorHex === '#f9fafb' ? '#d1d5db' : item.colorHex }} 
                        />
                      )}
                    </div>
                    <div>
                      <h3 className="text-xs font-extrabold text-white line-clamp-1">{item.name}</h3>
                      <p className="text-[10px] text-zinc-500 mt-1 font-bold uppercase">{item.brand} • {item.color}</p>
                    </div>
                  </div>

                  <span className={`px-2.5 py-1 rounded-lg text-[9px] font-extrabold border tracking-wide uppercase ${getStatusColor(item.status)}`}>
                    {item.status}
                  </span>
                </div>

                {/* Additional metadata */}
                <div className="grid grid-cols-2 gap-2 text-[10px] bg-black/50 p-3 rounded-2xl border border-zinc-900">
                  <div>
                    <span className="text-zinc-500 font-semibold block">Quantity</span>
                    <span className="font-bold text-zinc-200 mt-0.5 block">{item.quantity} items</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 font-semibold block">Last Worn</span>
                    <span className="font-mono text-zinc-200 mt-0.5 block">
                      {item.lastUsed ? new Date(item.lastUsed).toLocaleDateString(undefined, {month: 'short', day: 'numeric'}) : 'Never'}
                    </span>
                  </div>
                </div>

              </div>

              {/* Status progression triggers */}
              <div className="mt-5 pt-4 border-t border-zinc-900 flex gap-3">
                <button
                  onClick={() => handleSkipToClean(item)}
                  className="flex-1 bg-black hover:bg-zinc-900 border border-zinc-900 text-zinc-400 hover:text-white font-bold py-2.5 px-3 rounded-xl transition-all cursor-pointer text-[10px] uppercase tracking-wide flex items-center justify-center gap-1.5"
                  id={`laundry-clean-${item.id}`}
                >
                  <CheckCircle size={12} className="text-emerald-500" />
                  <span>Set Clean</span>
                </button>

                <button
                  onClick={() => handleNextStatus(item)}
                  className="flex-1 bg-[#FF3B3B] hover:bg-[#FF1A1A] text-white font-bold py-2.5 px-3 rounded-xl transition-all cursor-pointer text-[10px] uppercase tracking-wide flex items-center justify-center gap-1.5 shadow-md shadow-[#FF3B3B]/10"
                  id={`laundry-next-${item.id}`}
                >
                  <span>{item.status === 'Folding' ? 'To Closet' : 'Next Stage'}</span>
                  <ArrowRight size={12} />
                </button>
              </div>

            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-zinc-950 border border-dashed border-zinc-900 rounded-3xl py-20 text-center max-w-2xl mx-auto px-4">
          <Waves size={36} className="mx-auto mb-3.5 text-zinc-800 animate-pulse" />
          <h3 className="text-zinc-300 font-extrabold text-sm mb-1.5">No laundry items</h3>
          <p className="text-[11px] max-w-xs mx-auto text-zinc-600 leading-relaxed">
            All your clothes are neat, folded, and clean inside your wardrobe! To send items here, tap any cloth card in your closet and set its laundry cycle status.
          </p>
        </div>
      )}

    </div>
  );
}
