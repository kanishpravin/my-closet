import React from 'react';
import { 
  BarChart3, 
  Shirt, 
  Container, 
  Calendar, 
  Sparkles,
  PieChart,
  Grid,
  TrendingUp,
  RotateCcw
} from 'lucide-react';
import { motion } from 'motion/react';
import { ClothingItem, UsageLog } from '../types';

interface StatisticsViewProps {
  clothingItems: ClothingItem[];
  usageLogs: UsageLog[];
}

export default function StatisticsView({ 
  clothingItems, 
  usageLogs 
}: StatisticsViewProps) {
  
  const totalItemsCount = clothingItems.reduce((acc, item) => acc + item.quantity, 0);
  const totalWornCount = clothingItems.reduce((acc, item) => acc + item.usedCount, 0);

  // Group items by category to calculate counts
  const categoryCounts: { [category: string]: number } = {};
  const categoryWearCounts: { [category: string]: number } = {};
  
  clothingItems.forEach(item => {
    categoryCounts[item.category] = (categoryCounts[item.category] || 0) + item.quantity;
    categoryWearCounts[item.category] = (categoryWearCounts[item.category] || 0) + item.usedCount;
  });

  // Sort categories by volume
  const sortedCategories = Object.entries(categoryCounts)
    .map(([name, count]) => ({ name, count, wears: categoryWearCounts[name] || 0 }))
    .sort((a, b) => b.count - a.count);

  // Group items by color
  const colorCounts: { [color: string]: { count: number; hex: string } } = {};
  clothingItems.forEach(item => {
    if (!colorCounts[item.color]) {
      colorCounts[item.color] = { count: 0, hex: item.colorHex };
    }
    colorCounts[item.color].count += item.quantity;
  });

  const sortedColors = Object.entries(colorCounts)
    .map(([name, data]) => ({ name, count: data.count, hex: data.hex }))
    .sort((a, b) => b.count - a.count);

  // Calculate laundry ratios
  const laundryItems = clothingItems.filter(item => item.status !== 'In Wardrobe');
  const laundryCount = laundryItems.reduce((acc, item) => acc + item.quantity, 0);
  const cleanCount = totalItemsCount - laundryCount;
  const laundryPct = totalItemsCount > 0 ? Math.round((laundryCount / totalItemsCount) * 100) : 0;

  // Calculate most worn items
  const sortedByWorn = [...clothingItems]
    .filter(item => item.usedCount > 0)
    .sort((a, b) => b.usedCount - a.usedCount)
    .slice(0, 4);

  return (
    <div className="space-y-8 bg-black">
      
      {/* Header */}
      <div className="flex justify-between items-center border-b border-zinc-900 pb-5">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <span>Closet Analytics</span>
            <BarChart3 size={18} className="text-[#FF3B3B]" />
          </h2>
          <p className="text-xs text-zinc-500 mt-1.5 font-semibold">Real-time charts plotting garment ratios, color splits, and wear rankings.</p>
        </div>
      </div>

      {totalItemsCount > 0 ? (
        <div className="space-y-8">
          
          {/* Top Numeric Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5" id="statistics-numerical-grid">
            
            {/* Metric 1 */}
            <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-5 space-y-3.5">
              <span className="text-[9px] uppercase tracking-wider font-extrabold text-zinc-500">Total Holdings</span>
              <div>
                <h3 className="text-3xl font-black text-white tracking-tight">{totalItemsCount}</h3>
                <p className="text-[10px] text-zinc-500 mt-1 font-semibold">Active garments stored</p>
              </div>
            </div>

            {/* Metric 2 */}
            <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-5 space-y-3.5">
              <span className="text-[9px] uppercase tracking-wider font-extrabold text-[#FF3B3B]">Total Wears</span>
              <div>
                <h3 className="text-3xl font-black text-white tracking-tight">{totalWornCount}</h3>
                <p className="text-[10px] text-zinc-500 mt-1 font-semibold">Cumulative logged events</p>
              </div>
            </div>

            {/* Metric 3 */}
            <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-5 space-y-3.5">
              <span className="text-[9px] uppercase tracking-wider font-extrabold text-zinc-500">Clean Ratio</span>
              <div>
                <h3 className="text-3xl font-black text-white tracking-tight">{totalItemsCount > 0 ? Math.round((cleanCount / totalItemsCount) * 100) : 100}%</h3>
                <p className="text-[10px] text-zinc-500 mt-1 font-semibold">{cleanCount} items ready to wear</p>
              </div>
            </div>

            {/* Metric 4 */}
            <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-5 space-y-3.5">
              <span className="text-[9px] uppercase tracking-wider font-extrabold text-zinc-500">Laundry Quotient</span>
              <div>
                <h3 className="text-3xl font-black text-white tracking-tight">{laundryPct}%</h3>
                <p className="text-[10px] text-zinc-500 mt-1 font-semibold">{laundryCount} items in laundry queue</p>
              </div>
            </div>

          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Category Breakdown list with progress bars */}
            <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-6 space-y-5">
              <h3 className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                <Grid size={13} className="text-[#FF3B3B]" />
                <span>Volume by Category</span>
              </h3>

              <div className="space-y-4">
                {sortedCategories.map((cat) => {
                  const pct = Math.round((cat.count / totalItemsCount) * 100);
                  return (
                    <div key={cat.name} className="space-y-1.5 text-xs">
                      <div className="flex justify-between font-semibold">
                        <span className="text-zinc-300">{cat.name}</span>
                        <span className="text-zinc-500 font-mono">{cat.count} items ({pct}%)</span>
                      </div>
                      <div className="w-full bg-black h-2 rounded-full overflow-hidden border border-zinc-900/65">
                        <div 
                          className="bg-[#FF3B3B] h-full transition-all duration-300"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Color Distribution with color dots */}
            <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-6 space-y-5">
              <h3 className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                <PieChart size={13} className="text-zinc-500" />
                <span>Preferred Colors Split</span>
              </h3>

              <div className="space-y-4">
                {sortedColors.map((color) => {
                  const pct = Math.round((color.count / totalItemsCount) * 100);
                  return (
                    <div key={color.name} className="flex items-center justify-between text-xs font-semibold py-1">
                      <div className="flex items-center gap-3">
                        <span 
                          className="w-3.5 h-3.5 rounded-full border border-zinc-900 shadow"
                          style={{ backgroundColor: color.hex }}
                        />
                        <span className="text-zinc-300">{color.name}</span>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <span className="text-zinc-500 font-mono">{color.count} Items</span>
                        <span className="text-[10px] font-mono text-zinc-500 bg-black border border-zinc-900 px-2 py-0.5 rounded-lg w-12 text-center">
                          {pct}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Leaders section: Most worn garments */}
          <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-6 space-y-4">
            <h3 className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider flex items-center gap-2 border-b border-zinc-900 pb-3">
              <TrendingUp size={13} className="text-[#FF3B3B]" />
              <span>Most Logged Wears (Closet MVP)</span>
            </h3>

            {sortedByWorn.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 pt-1">
                {sortedByWorn.map((item) => (
                  <div 
                    key={item.id} 
                    className="bg-black/40 border border-zinc-900/80 rounded-2xl p-4 flex flex-col justify-between"
                  >
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
                        <h4 className="text-xs font-bold text-white line-clamp-1">{item.name}</h4>
                        <p className="text-[9px] text-zinc-500 mt-1 font-semibold uppercase">{item.brand} • {item.category}</p>
                      </div>
                    </div>

                    <div className="mt-4 pt-3.5 border-t border-zinc-900 flex justify-between items-center">
                      <span className="text-[9px] text-zinc-500 font-bold uppercase">Wears Count</span>
                      <span className="text-xs font-mono font-bold text-[#FF3B3B] bg-[#FF3B3B]/10 border border-[#FF3B3B]/15 px-2 py-0.5 rounded-lg">
                        {item.usedCount} wears
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-zinc-600">
                <p className="text-xs font-bold">No wears registered yet.</p>
                <p className="text-[10px] text-zinc-500 max-w-xs mx-auto mt-1">Log wear events on the Wear Calendar tab to generate MVP wardrobe insights.</p>
              </div>
            )}
          </div>

        </div>
      ) : (
        <div className="bg-zinc-950 border border-dashed border-zinc-900 rounded-3xl py-20 text-center max-w-2xl mx-auto px-4">
          <BarChart3 size={36} className="mx-auto mb-3.5 text-zinc-850 animate-pulse" />
          <h3 className="text-zinc-300 font-extrabold text-sm mb-1.5">No analytics available</h3>
          <p className="text-[11px] max-w-xs mx-auto text-zinc-600 leading-relaxed">
            Analytics are computed automatically in real-time as you populate your wardrobe closet. Create items to unlock full-stack metrics!
          </p>
        </div>
      )}

    </div>
  );
}
