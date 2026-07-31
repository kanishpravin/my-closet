import React, { useState } from 'react';
import { 
  Heart, 
  Plus, 
  Trash2, 
  X, 
  ShoppingBag, 
  ExternalLink, 
  DollarSign, 
  Sparkles,
  ArrowUpRight,
  HelpCircle,
  Tag
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { WishlistItem, AppSettings, ClothingItem } from '../types';

interface WishlistViewProps {
  wishlist: WishlistItem[];
  settings: AppSettings;
  onAddWishlistItem: (item: Omit<WishlistItem, 'id'>) => void;
  onDeleteWishlistItem: (id: string) => void;
  onMoveToCloset: (item: WishlistItem) => void;
}

export default function WishlistView({ 
  wishlist, 
  settings, 
  onAddWishlistItem, 
  onDeleteWishlistItem,
  onMoveToCloset
}: WishlistViewProps) {
  
  const [isAddWishlistOpen, setIsAddWishlistOpen] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState(settings.categories[0] || 'T-Shirts');
  const [color, setColor] = useState(settings.colors[0]?.name || 'Black');
  const [brand, setBrand] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [url, setUrl] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const matchedColor = settings.colors.find(c => c.name === color);
    const colorHex = matchedColor ? matchedColor.hex : '#FF3B3B';

    onAddWishlistItem({
      name,
      category,
      color,
      colorHex,
      brand: brand || 'Generic',
      price: price === '' ? undefined : Number(price),
      url: url || undefined,
      notes: notes || undefined
    });

    // Reset
    setName('');
    setBrand('');
    setPrice('');
    setUrl('');
    setNotes('');
    setIsAddWishlistOpen(false);
  };

  return (
    <div className="space-y-6 bg-black">
      
      {/* Header */}
      <div className="flex justify-between items-center border-b border-zinc-900 pb-5">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <span>My Wishlist</span>
            <Heart size={18} className="text-[#FF3B3B]" />
          </h2>
          <p className="text-xs text-zinc-500 mt-1.5">Garments and accessories you plan to acquire. Transfer them directly to your closet.</p>
        </div>

        <button
          onClick={() => setIsAddWishlistOpen(true)}
          className="bg-[#FF3B3B] hover:bg-[#FF1A1A] text-white font-bold text-xs px-4 py-3 rounded-2xl flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-[#FF3B3B]/10"
          id="wishlist-add-btn"
        >
          <Plus size={15} />
          <span>Add Wishlist Item</span>
        </button>
      </div>

      {/* Wishlist Items List */}
      {wishlist.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5" id="wishlist-items-grid">
          {wishlist.map((item) => (
            <motion.div
              layoutId={`wishlist-card-${item.id}`}
              whileHover={{ y: -3 }}
              key={item.id}
              className="bg-zinc-950 border border-zinc-900 hover:border-zinc-800 rounded-3xl p-5 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center border border-zinc-900 shrink-0"
                      style={{ backgroundColor: `${item.colorHex}12` }}
                    >
                      <Heart size={16} className="text-[#FF3B3B]" />
                    </div>
                    <div>
                      <h3 className="text-xs font-extrabold text-white line-clamp-1">{item.name}</h3>
                      <p className="text-[10px] text-zinc-500 mt-1 font-bold uppercase">{item.brand} • {item.category}</p>
                    </div>
                  </div>

                  {item.price !== undefined && (
                    <span className="text-xs font-mono font-bold text-[#FF3B3B] bg-[#FF3B3B]/10 px-2.5 py-1 rounded-lg border border-[#FF3B3B]/15">
                      ${item.price}
                    </span>
                  )}
                </div>

                {item.notes && (
                  <p className="text-[11px] text-zinc-400 bg-black/40 border border-zinc-900/65 rounded-xl p-3 leading-relaxed font-medium">
                    {item.notes}
                  </p>
                )}
              </div>

              {/* Action operations */}
              <div className="mt-5 pt-4 border-t border-zinc-900 flex items-center justify-between gap-3 text-xs">
                {/* Delete and link */}
                <div className="flex gap-1.5">
                  <button
                    onClick={() => onDeleteWishlistItem(item.id)}
                    className="p-2.5 rounded-xl text-zinc-500 hover:text-[#FF3B3B] hover:bg-[#FF3B3B]/10 border border-zinc-900 hover:border-transparent transition-all cursor-pointer"
                    title="Remove from wishlist"
                  >
                    <Trash2 size={13} />
                  </button>

                  {item.url && (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-xl text-zinc-500 hover:text-white hover:bg-zinc-900 border border-zinc-900 hover:border-zinc-800 transition-all flex items-center justify-center"
                      title="Visit purchase page"
                    >
                      <ExternalLink size={13} />
                    </a>
                  )}
                </div>

                {/* Move to closet */}
                <button
                  onClick={() => onMoveToCloset(item)}
                  className="flex items-center gap-1.5 bg-[#FF3B3B]/10 hover:bg-[#FF3B3B] text-[#FF3B3B] hover:text-white border border-[#FF3B3B]/15 px-3.5 py-2 rounded-xl font-bold text-[10px] uppercase tracking-wide transition-all cursor-pointer"
                >
                  <ShoppingBag size={11} />
                  <span>Move to Closet</span>
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-zinc-950 border border-dashed border-zinc-900 rounded-3xl py-16 text-center max-w-2xl mx-auto px-4">
          <Heart size={36} className="mx-auto mb-3 text-zinc-850 animate-pulse" />
          <h3 className="text-zinc-300 font-extrabold text-sm mb-1.5">Your Wishlist is empty</h3>
          <p className="text-[11px] max-w-xs mx-auto text-zinc-600 leading-relaxed mb-6">
            Keep list entries of clothing items, shoes, or outfits you want to buy next. Add them here first and move them to your wardrobe in one click!
          </p>
          <button
            onClick={() => setIsAddWishlistOpen(true)}
            className="bg-[#FF3B3B]/10 hover:bg-[#FF3B3B] text-[#FF3B3B] hover:text-white border border-[#FF3B3B]/15 font-bold text-xs px-5 py-3 rounded-2xl transition-all cursor-pointer"
          >
            Add First Item
          </button>
        </div>
      )}

      {/* ADD WISHLIST ITEM MODAL */}
      <AnimatePresence>
        {isAddWishlistOpen && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-zinc-950 border border-zinc-900 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl"
            >
              
              <div className="p-5 border-b border-zinc-900 flex items-center justify-between">
                <h3 className="font-extrabold text-white text-sm tracking-tight flex items-center gap-2">
                  <Heart size={16} className="text-[#FF3B3B]" />
                  <span>Add Wishlist Item</span>
                </h3>
                <button 
                  onClick={() => setIsAddWishlistOpen(false)}
                  className="p-2 rounded-xl text-zinc-400 hover:text-white bg-black border border-zinc-900 hover:border-zinc-800 transition-colors cursor-pointer"
                >
                  <X size={15} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                
                {/* Item Name */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-extrabold text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                    <Tag size={11} className="text-[#FF3B3B]" />
                    <span>Item Name</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Slim Fit White Denim Jacket"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-black border border-zinc-900 focus:border-[#FF3B3B]/55 rounded-2xl py-2.5 px-4 text-xs font-semibold text-white placeholder-zinc-700 outline-none transition-all"
                  />
                </div>

                {/* Category & Color */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-extrabold text-zinc-500 uppercase tracking-widest">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-black border border-zinc-900 focus:border-[#FF3B3B]/55 rounded-2xl py-2.5 px-3 text-xs font-bold text-white outline-none transition-all"
                    >
                      {settings.categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-extrabold text-zinc-500 uppercase tracking-widest">Color</label>
                    <select
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="w-full bg-black border border-zinc-900 focus:border-[#FF3B3B]/55 rounded-2xl py-2.5 px-3 text-xs font-bold text-white outline-none transition-all"
                    >
                      {settings.colors.map(c => (
                        <option key={c.name} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Brand & Price */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-extrabold text-zinc-500 uppercase tracking-widest">Brand (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g., Uniqlo"
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                      className="w-full bg-black border border-zinc-900 focus:border-[#FF3B3B]/55 rounded-2xl py-2.5 px-4 text-xs font-semibold text-white placeholder-zinc-700 outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-extrabold text-zinc-500 uppercase tracking-widest flex items-center gap-1">
                      <DollarSign size={10} />
                      <span>Approx Price ($)</span>
                    </label>
                    <input
                      type="number"
                      min={0}
                      placeholder="79"
                      value={price}
                      onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full bg-black border border-zinc-900 focus:border-[#FF3B3B]/55 rounded-2xl py-2.5 px-4 text-xs font-bold text-white outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Purchase URL */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-extrabold text-zinc-500 uppercase tracking-widest">Purchase Link / URL (Optional)</label>
                  <input
                    type="url"
                    placeholder="https://example.com/item"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="w-full bg-black border border-zinc-900 focus:border-[#FF3B3B]/55 rounded-2xl py-2.5 px-4 text-xs font-semibold text-white placeholder-zinc-750 outline-none transition-all"
                  />
                </div>

                {/* Notes */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-extrabold text-zinc-500 uppercase tracking-widest">Custom Notes</label>
                  <textarea
                    rows={2}
                    placeholder="Wanna buy during the summer discount sales..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full bg-black border border-zinc-900 focus:border-[#FF3B3B]/55 rounded-2xl p-3 text-xs font-semibold text-white placeholder-zinc-700 outline-none transition-all resize-none"
                  />
                </div>

                {/* Submit button */}
                <div className="pt-4 border-t border-zinc-900">
                  <button
                    type="submit"
                    className="w-full bg-[#FF3B3B] hover:bg-[#FF1A1A] text-white font-extrabold text-xs py-3.5 px-4 rounded-2xl transition-all cursor-pointer shadow-md shadow-[#FF3B3B]/10 uppercase tracking-wider"
                  >
                    Save to Wishlist
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
