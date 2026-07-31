import React, { useState, useRef } from 'react';
import { 
  Search, 
  Plus, 
  Shirt, 
  X, 
  Trash2, 
  Sparkles, 
  Camera, 
  Tag, 
  Hash, 
  CheckCircle,
  HelpCircle,
  Upload,
  Layers,
  CircleDot
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ClothingItem, ClothingStatus, AppSettings } from '../types';
import InstantCameraModal from './InstantCameraModal';

interface ClothesListProps {
  clothingItems: ClothingItem[];
  settings: AppSettings;
  activeFilterCategory: string;
  setActiveFilterCategory: (category: string) => void;
  onAddItem: (item: Omit<ClothingItem, 'id' | 'usedCount' | 'lastUsed' | 'lastWashed'>) => void;
  onUpdateItem: (id: string, updates: Partial<ClothingItem>) => void;
  onDeleteItem: (id: string) => void;
  onMarkAsWorn: (id: string) => void;
  isAddModalOpen: boolean;
  onCloseAddModal: () => void;
  onOpenAddModal: () => void;
}

export default function ClothesList({
  clothingItems,
  settings,
  activeFilterCategory,
  setActiveFilterCategory,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
  onMarkAsWorn,
  isAddModalOpen,
  onCloseAddModal,
  onOpenAddModal
}: ClothesListProps) {
  
  // Local state for search & filtering
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [filterColor, setFilterColor] = useState<string>('All');
  
  // Selected item for detail view modal
  const [selectedItem, setSelectedItem] = useState<ClothingItem | null>(null);

  // Form State for Add New Clothing
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState(settings.categories[0] || 'T-Shirts');
  const [newColor, setNewColor] = useState(settings.colors[0]?.name || 'Black');
  const [newBrand, setNewBrand] = useState('');
  const [newQuantity, setNewQuantity] = useState(1);
  const [newStatus, setNewStatus] = useState<ClothingStatus>('In Wardrobe');
  const [newPhotoBase64, setNewPhotoBase64] = useState<string>('');

  // Instant Camera State
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraTarget, setCameraTarget] = useState<'new' | 'edit'>('new');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCameraCapture = (base64: string) => {
    if (cameraTarget === 'new') {
      setNewPhotoBase64(base64);
    } else if (cameraTarget === 'edit' && selectedItem) {
      onUpdateItem(selectedItem.id, { photoBase64: base64 });
      setSelectedItem({ ...selectedItem, photoBase64: base64 });
    }
  };

  // Filter logic
  const filteredItems = clothingItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.brand.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeFilterCategory === 'All' || item.category === activeFilterCategory;
    const matchesStatus = filterStatus === 'All' || item.status === filterStatus;
    const matchesColor = filterColor === 'All' || item.color === filterColor;
    return matchesSearch && matchesCategory && matchesStatus && matchesColor;
  });

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setNewPhotoBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveCloth = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    // Find hex code for chosen color
    const matchedColor = settings.colors.find(c => c.name === newColor);
    const colorHex = matchedColor ? matchedColor.hex : '#FF3B3B';

    onAddItem({
      name: newName,
      category: newCategory,
      color: newColor,
      brand: newBrand || 'Generic',
      quantity: Math.max(1, newQuantity),
      status: newStatus,
      colorHex: colorHex,
      photoBase64: newPhotoBase64 || undefined
    });

    // Reset Form
    setNewName('');
    setNewBrand('');
    setNewQuantity(1);
    setNewStatus('In Wardrobe');
    setNewPhotoBase64('');
    onCloseAddModal();
  };

  // Helper to get status pill styling
  const getStatusBadge = (status: ClothingStatus) => {
    switch (status) {
      case 'In Wardrobe':
        return { text: 'In Closet', bg: 'bg-emerald-950/20 text-emerald-400 border-emerald-900/30' };
      case 'Washing':
        return { text: 'Laundry - Washing', bg: 'bg-blue-950/20 text-blue-400 border-blue-900/30' };
      case 'Drying':
        return { text: 'Laundry - Drying', bg: 'bg-amber-950/20 text-amber-400 border-amber-900/30' };
      case 'Folding':
        return { text: 'Laundry - Folding', bg: 'bg-purple-950/20 text-purple-400 border-purple-900/30' };
    }
  };

  return (
    <div className="space-y-6 bg-black">
      
      {/* Header and Add Button */}
      <div className="flex items-center justify-between border-b border-zinc-900 pb-5">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <span>{activeFilterCategory === 'All' ? 'My Wardrobe' : activeFilterCategory}</span>
            <span className="text-[10px] font-mono font-bold bg-[#FF3B3B]/10 text-[#FF3B3B] border border-[#FF3B3B]/15 px-2.5 py-0.5 rounded-full">
              {filteredItems.length}
            </span>
          </h2>
          <p className="text-xs text-zinc-500 mt-1.5">Catalog new garments or tap existing clothes to log status changes.</p>
        </div>
        
        <button
          onClick={onOpenAddModal}
          className="bg-[#FF3B3B] hover:bg-[#FF1A1A] text-white font-bold text-xs px-4 py-3 rounded-2xl flex items-center gap-2 transition-all cursor-pointer shadow-md shadow-[#FF3B3B]/10"
          id="clothes-add-btn"
        >
          <Plus size={15} />
          <span>Add Cloth</span>
        </button>
      </div>

      {/* Search and Filters panel */}
      <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-5 space-y-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-3 text-zinc-500" size={16} />
            <input
              type="text"
              placeholder="Search by name, brand..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black border border-zinc-900 focus:border-[#FF3B3B]/55 rounded-2xl py-2.5 pl-11 pr-4 text-xs font-semibold text-white placeholder-zinc-600 outline-none transition-all"
              id="clothes-search-input"
            />
          </div>

          {/* Quick Category filter tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
            <button
              onClick={() => setActiveFilterCategory('All')}
              className={`px-3.5 py-2 rounded-xl text-[10px] font-extrabold uppercase tracking-wider whitespace-nowrap transition-all border ${
                activeFilterCategory === 'All'
                  ? 'bg-[#FF3B3B] text-white border-[#FF3B3B]'
                  : 'bg-black text-zinc-400 border-zinc-900 hover:text-white'
              }`}
            >
              All
            </button>
            {settings.categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveFilterCategory(cat)}
                className={`px-3.5 py-2 rounded-xl text-[10px] font-extrabold uppercase tracking-wider whitespace-nowrap transition-all border ${
                  activeFilterCategory === cat
                    ? 'bg-[#FF3B3B] text-white border-[#FF3B3B]'
                    : 'bg-black text-zinc-400 border-zinc-900 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Detailed Secondary Filters */}
        <div className="flex flex-wrap gap-4 pt-4 border-t border-zinc-900 text-[11px] font-semibold text-zinc-500">
          {/* Status filter */}
          <div className="flex items-center gap-2">
            <span>Status:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-black border border-zinc-900 rounded-xl px-3 py-1.5 text-zinc-300 outline-none focus:border-[#FF3B3B]/50 font-bold"
            >
              <option value="All">All Statuses</option>
              <option value="In Wardrobe">In Closet</option>
              <option value="Washing">Washing</option>
              <option value="Drying">Drying</option>
              <option value="Folding">Folding</option>
            </select>
          </div>

          {/* Color filter */}
          <div className="flex items-center gap-2">
            <span>Color:</span>
            <select
              value={filterColor}
              onChange={(e) => setFilterColor(e.target.value)}
              className="bg-black border border-zinc-900 rounded-xl px-3 py-1.5 text-zinc-300 outline-none focus:border-[#FF3B3B]/50 font-bold"
            >
              <option value="All">All Colors</option>
              {settings.colors.map(c => (
                <option key={c.name} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Clear filters trigger */}
          {(searchQuery || filterStatus !== 'All' || filterColor !== 'All' || activeFilterCategory !== 'All') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setFilterStatus('All');
                setFilterColor('All');
                setActiveFilterCategory('All');
              }}
              className="ml-auto text-[#FF3B3B] hover:text-[#FF1A1A] font-extrabold uppercase tracking-wider text-[10px] cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Clothes Grid list */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5" id="clothes-items-grid">
          {filteredItems.map((item) => {
            const badge = getStatusBadge(item.status);
            return (
              <motion.div
                whileHover={{ y: -4 }}
                key={item.id}
                id={`clothing-item-card-${item.id}`}
                onClick={() => setSelectedItem(item)}
                className="bg-zinc-950 border border-zinc-900 hover:border-zinc-800 rounded-3xl p-4 flex flex-col justify-between cursor-pointer transition-all group"
              >
                <div>
                  {/* Photo or Visual Placeholder */}
                  <div className="aspect-square w-full rounded-2xl flex items-center justify-center mb-4 relative overflow-hidden bg-black border border-zinc-900">
                    {item.photoBase64 ? (
                      <img 
                        src={item.photoBase64} 
                        alt={item.name} 
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div 
                        className="w-full h-full flex items-center justify-center transition-transform duration-300 group-hover:scale-102"
                        style={{ backgroundColor: `${item.colorHex}08` }}
                      >
                        <Shirt 
                          size={40} 
                          style={{ color: item.colorHex === '#ffffff' || item.colorHex === '#f9fafb' ? '#52525b' : item.colorHex }}
                          className="drop-shadow"
                        />
                      </div>
                    )}
                    
                    {/* Small Color Hex indicator circle */}
                    <span 
                      className="absolute bottom-3 right-3 w-3.5 h-3.5 rounded-full border border-zinc-900 shadow"
                      style={{ backgroundColor: item.colorHex }}
                    />
                  </div>

                  {/* Garment details */}
                  <h3 className="font-extrabold text-xs text-white group-hover:text-[#FF3B3B] transition-colors line-clamp-1 pl-1">
                    {item.name}
                  </h3>
                  <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 font-bold mt-1 pl-1">
                    <span>{item.brand}</span>
                    <span>•</span>
                    <span>{item.color}</span>
                  </div>
                </div>

                <div className="mt-4 pt-3.5 border-t border-zinc-900 space-y-2.5">
                  <div className="flex justify-between text-[9px] text-zinc-500 font-mono pl-1">
                    <span>Worn count</span>
                    <span className="font-bold text-zinc-300">{item.usedCount} times</span>
                  </div>

                  {/* Status Indicator pill */}
                  <span className={`inline-block w-full text-center text-[9px] font-extrabold py-1.5 rounded-xl border tracking-wide uppercase ${badge.bg}`}>
                    {badge.text}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="bg-zinc-950 border border-dashed border-zinc-900 rounded-3xl py-16 text-center text-zinc-500">
          <Shirt size={40} className="mx-auto mb-3 text-zinc-800" />
          <h3 className="text-zinc-300 font-extrabold text-sm mb-1">No garments found</h3>
          <p className="text-[11px] max-w-xs mx-auto text-zinc-600 leading-relaxed">
            There are no clothes matches in this filter. Tap 'Add Cloth' to add a custom clothing record.
          </p>
        </div>
      )}

      {/* CLOTH DETAIL MODAL (Material 3 style) */}
      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-zinc-950 border border-zinc-900 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl relative"
            >
              
              {/* Modal header */}
              <div className="p-5 border-b border-zinc-900 flex items-center justify-between">
                <h3 className="font-extrabold text-white text-sm tracking-tight flex items-center gap-2">
                  <CircleDot size={14} className="text-[#FF3B3B]" />
                  <span>Cloth Detail Card</span>
                </h3>
                <button 
                  onClick={() => setSelectedItem(null)}
                  className="p-2 rounded-xl text-zinc-400 hover:text-white bg-black border border-zinc-900 hover:border-zinc-800 transition-colors cursor-pointer"
                  id="cloth-detail-close-btn"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Modal content */}
              <div className="p-6 space-y-6">
                
                {/* Main Visual Representation */}
                <div className="flex gap-4 items-center bg-black p-4 rounded-2xl border border-zinc-900">
                  <div className="w-24 h-24 rounded-xl flex items-center justify-center relative border border-zinc-900 bg-zinc-950 overflow-hidden shrink-0 group">
                    {selectedItem.photoBase64 ? (
                      <img 
                        src={selectedItem.photoBase64} 
                        alt={selectedItem.name} 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <Shirt 
                        size={36} 
                        style={{ color: selectedItem.colorHex === '#ffffff' || selectedItem.colorHex === '#f9fafb' ? '#d1d5db' : selectedItem.colorHex }}
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setCameraTarget('edit');
                        setIsCameraOpen(true);
                      }}
                      className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[9px] font-bold gap-1 cursor-pointer"
                      title="Open Instant Camera"
                    >
                      <Camera size={16} className="text-[#FF3B3B]" />
                      <span>Instant Camera</span>
                    </button>
                    <span 
                      className="absolute bottom-2 right-2 w-3.5 h-3.5 rounded-full border border-black shadow pointer-events-none"
                      style={{ backgroundColor: selectedItem.colorHex }}
                    />
                  </div>
                  <div>
                    <h4 className="text-base font-extrabold text-white leading-tight">{selectedItem.name}</h4>
                    <p className="text-[10px] text-zinc-500 font-mono mt-1.5 uppercase">ID: {selectedItem.id.split('_')[1] || selectedItem.id}</p>
                    
                    <div className="flex flex-wrap items-center gap-2 mt-3">
                      <span className={`text-[9px] font-extrabold px-2.5 py-1 rounded-lg border tracking-wide uppercase ${getStatusBadge(selectedItem.status).bg}`}>
                        {getStatusBadge(selectedItem.status).text}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setCameraTarget('edit');
                          setIsCameraOpen(true);
                        }}
                        className="text-[9px] font-extrabold px-2.5 py-1 rounded-lg bg-[#FF3B3B]/10 text-[#FF3B3B] hover:bg-[#FF3B3B] hover:text-white border border-[#FF3B3B]/20 transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <Camera size={11} />
                        <span>{selectedItem.photoBase64 ? 'Retake Photo' : 'Open Instant Camera'}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Clothes Info Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-black p-3.5 rounded-2xl border border-zinc-900">
                    <span className="text-[9px] uppercase font-extrabold text-zinc-500 tracking-wider">Category</span>
                    <p className="text-white font-extrabold text-xs mt-1">{selectedItem.category}</p>
                  </div>
                  <div className="bg-black p-3.5 rounded-2xl border border-zinc-900">
                    <span className="text-[9px] uppercase font-extrabold text-zinc-500 tracking-wider">Color</span>
                    <p className="text-white font-extrabold text-xs mt-1">{selectedItem.color}</p>
                  </div>
                  <div className="bg-black p-3.5 rounded-2xl border border-zinc-900">
                    <span className="text-[9px] uppercase font-extrabold text-zinc-500 tracking-wider">Brand</span>
                    <p className="text-white font-extrabold text-xs mt-1">{selectedItem.brand || 'Generic'}</p>
                  </div>
                  <div className="bg-black p-3.5 rounded-2xl border border-zinc-900">
                    <span className="text-[9px] uppercase font-extrabold text-zinc-500 tracking-wider">Quantity</span>
                    <p className="text-white font-extrabold text-xs mt-1">{selectedItem.quantity}</p>
                  </div>
                </div>

                {/* Usage & Wash statistics */}
                <div className="grid grid-cols-3 gap-3 bg-black/60 p-4 rounded-2xl border border-zinc-900 text-center">
                  <div>
                    <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Worn</span>
                    <p className="text-[#FF3B3B] font-extrabold text-sm mt-1">{selectedItem.usedCount} times</p>
                  </div>
                  <div>
                    <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Last Worn</span>
                    <p className="text-zinc-300 font-extrabold text-[10px] mt-1.5 font-mono">
                      {selectedItem.lastUsed 
                        ? new Date(selectedItem.lastUsed).toLocaleDateString(undefined, {month: 'short', day: 'numeric'}) 
                        : 'Never'}
                    </p>
                  </div>
                  <div>
                    <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Last Washed</span>
                    <p className="text-zinc-300 font-extrabold text-[10px] mt-1.5 font-mono">
                      {selectedItem.lastWashed 
                        ? new Date(selectedItem.lastWashed).toLocaleDateString(undefined, {month: 'short', day: 'numeric'}) 
                        : 'Never'}
                    </p>
                  </div>
                </div>

                {/* Action buttons (Screen 5 style) */}
                <div className="space-y-3 pt-2">
                  <button
                    onClick={() => {
                      onMarkAsWorn(selectedItem.id);
                      // Refresh local modal selection reference
                      const updated = clothingItems.find(i => i.id === selectedItem.id);
                      if (updated) {
                        setSelectedItem({ 
                          ...selectedItem, 
                          usedCount: selectedItem.usedCount + 1, 
                          lastUsed: new Date().toISOString().split('T')[0] 
                        });
                      }
                    }}
                    className="w-full flex items-center justify-center gap-2 bg-[#FF3B3B] hover:bg-[#FF1A1A] text-white font-bold py-3.5 px-4 rounded-2xl transition-all cursor-pointer text-xs"
                    id="cloth-detail-mark-worn"
                  >
                    <Sparkles size={14} />
                    <span>Mark as Worn Today</span>
                  </button>

                  {/* Status cycle helper */}
                  {selectedItem.status === 'In Wardrobe' ? (
                    <button
                      onClick={() => {
                        onUpdateItem(selectedItem.id, { status: 'Washing' });
                        setSelectedItem({ ...selectedItem, status: 'Washing' });
                      }}
                      className="w-full flex items-center justify-center gap-2 bg-black hover:bg-zinc-900 text-zinc-200 border border-zinc-900 font-bold py-3.5 px-4 rounded-2xl transition-all cursor-pointer text-xs"
                      id="cloth-detail-send-laundry"
                    >
                      <CircleDot size={14} className="text-zinc-500" />
                      <span>Send to Laundry Cycle</span>
                    </button>
                  ) : (
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => {
                          onUpdateItem(selectedItem.id, { status: 'Washing' });
                          setSelectedItem({ ...selectedItem, status: 'Washing' });
                        }}
                        className={`text-[10px] font-extrabold uppercase py-3 rounded-2xl border transition-all cursor-pointer ${
                          selectedItem.status === 'Washing' 
                            ? 'bg-blue-600 border-blue-500 text-white shadow-sm shadow-blue-500/10' 
                            : 'bg-black border-zinc-900 text-zinc-500 hover:text-white'
                        }`}
                      >
                        Washing
                      </button>
                      <button
                        onClick={() => {
                          onUpdateItem(selectedItem.id, { status: 'Drying' });
                          setSelectedItem({ ...selectedItem, status: 'Drying' });
                        }}
                        className={`text-[10px] font-extrabold uppercase py-3 rounded-2xl border transition-all cursor-pointer ${
                          selectedItem.status === 'Drying' 
                            ? 'bg-amber-600 border-amber-500 text-white shadow-sm shadow-amber-500/10' 
                            : 'bg-black border-zinc-900 text-zinc-500 hover:text-white'
                        }`}
                      >
                        Drying
                      </button>
                      <button
                        onClick={() => {
                          const now = new Date().toISOString().split('T')[0];
                          onUpdateItem(selectedItem.id, { status: 'In Wardrobe', lastWashed: now });
                          setSelectedItem({ ...selectedItem, status: 'In Wardrobe', lastWashed: now });
                        }}
                        className="text-[10px] font-extrabold uppercase py-3 rounded-2xl border bg-emerald-600 border-emerald-500 text-white hover:bg-emerald-700 transition-all cursor-pointer"
                      >
                        Clean Closet
                      </button>
                    </div>
                  )}

                  <button
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete this clothing item?')) {
                        onDeleteItem(selectedItem.id);
                        setSelectedItem(null);
                      }
                    }}
                    className="w-full flex items-center justify-center gap-2 text-zinc-600 hover:text-[#FF3B3B] hover:bg-[#FF3B3B]/10 py-2.5 px-4 rounded-2xl font-bold text-xs transition-all cursor-pointer"
                    id="cloth-detail-delete"
                  >
                    <Trash2 size={13} />
                    <span>Delete Cloth Entry</span>
                  </button>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ADD NEW CLOTH MODAL (Screen 4) */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-zinc-950 border border-zinc-900 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl"
            >
              
              {/* Modal header */}
              <div className="p-5 border-b border-zinc-900 flex items-center justify-between">
                <h3 className="font-extrabold text-white text-sm tracking-tight flex items-center gap-2">
                  <Plus size={18} className="text-[#FF3B3B]" />
                  <span>Add New Clothing Entry</span>
                </h3>
                <button 
                  onClick={() => {
                    setNewPhotoBase64('');
                    onCloseAddModal();
                  }}
                  className="p-2 rounded-xl text-zinc-400 hover:text-white bg-black border border-zinc-900 hover:border-zinc-800 transition-all cursor-pointer"
                  id="cloth-add-close-btn"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSaveCloth} className="p-6 space-y-4">
                
                {/* Photo Upload Options */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[9px] font-extrabold text-zinc-500 uppercase tracking-widest block">Garment Photo</label>
                    {newPhotoBase64 && (
                      <button
                        type="button"
                        onClick={() => setNewPhotoBase64('')}
                        className="text-[9px] font-bold text-[#FF3B3B] hover:underline cursor-pointer"
                      >
                        Remove Photo
                      </button>
                    )}
                  </div>
                  
                  {newPhotoBase64 ? (
                    <div className="relative w-full h-36 rounded-2xl overflow-hidden border border-zinc-900 group">
                      <img 
                        src={newPhotoBase64} 
                        alt="Preview" 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setCameraTarget('new');
                            setIsCameraOpen(true);
                          }}
                          className="bg-black/80 hover:bg-black text-white px-3 py-1.5 rounded-xl text-xs font-bold border border-zinc-700 flex items-center gap-1.5 cursor-pointer"
                        >
                          <Camera size={13} className="text-[#FF3B3B]" />
                          <span>Retake</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setNewPhotoBase64('')}
                          className="bg-black/80 hover:bg-black text-white p-2 rounded-xl text-xs font-bold border border-zinc-700 hover:text-[#FF3B3B] cursor-pointer"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      {/* Option 1: Open Instant Camera */}
                      <button
                        type="button"
                        onClick={() => {
                          setCameraTarget('new');
                          setIsCameraOpen(true);
                        }}
                        className="border border-zinc-850 hover:border-[#FF3B3B]/60 rounded-2xl p-4 flex flex-col items-center justify-center text-zinc-400 hover:text-white bg-black hover:bg-zinc-950 cursor-pointer transition-all space-y-2 group"
                        id="add-cloth-instant-camera-btn"
                      >
                        <div className="p-3 bg-zinc-900/80 rounded-2xl group-hover:bg-[#FF3B3B]/10 text-[#FF3B3B] transition-all border border-zinc-800">
                          <Camera size={18} />
                        </div>
                        <div className="text-center">
                          <p className="text-xs font-extrabold text-white">Open Instant Camera</p>
                          <p className="text-[9px] text-zinc-500 mt-0.5 font-semibold">Live viewfinder photo</p>
                        </div>
                      </button>

                      {/* Option 2: Upload File */}
                      <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="border border-zinc-850 hover:border-zinc-700 rounded-2xl p-4 flex flex-col items-center justify-center text-zinc-400 hover:text-white bg-black hover:bg-zinc-950 cursor-pointer transition-all space-y-2 group"
                        id="add-cloth-upload-file-btn"
                      >
                        <div className="p-3 bg-zinc-900/80 rounded-2xl group-hover:bg-zinc-800 text-zinc-400 group-hover:text-white transition-all border border-zinc-800">
                          <Upload size={18} />
                        </div>
                        <div className="text-center">
                          <p className="text-xs font-extrabold text-white">Upload Photo File</p>
                          <p className="text-[9px] text-zinc-500 mt-0.5 font-semibold">Select image from device</p>
                        </div>
                        <input 
                          type="file" 
                          ref={fileInputRef} 
                          onChange={handleImageFileChange} 
                          accept="image/*" 
                          className="hidden" 
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Name */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-extrabold text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                    <Tag size={11} className="text-[#FF3B3B]" />
                    <span>Garment Name</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Casual Linen Red Shirt"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full bg-black border border-zinc-900 focus:border-[#FF3B3B]/50 rounded-2xl py-2.5 px-4 text-xs font-semibold text-white placeholder-zinc-700 outline-none transition-all"
                    id="add-cloth-name"
                  />
                </div>

                {/* Category & Color */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-extrabold text-zinc-500 uppercase tracking-widest">Category</label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="w-full bg-black border border-zinc-900 focus:border-[#FF3B3B]/50 rounded-2xl py-2.5 px-3 text-xs font-bold text-white outline-none transition-all"
                      id="add-cloth-category"
                    >
                      {settings.categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-extrabold text-zinc-500 uppercase tracking-widest">Color</label>
                    <select
                      value={newColor}
                      onChange={(e) => setNewColor(e.target.value)}
                      className="w-full bg-black border border-zinc-900 focus:border-[#FF3B3B]/50 rounded-2xl py-2.5 px-3 text-xs font-bold text-white outline-none transition-all"
                      id="add-cloth-color"
                    >
                      {settings.colors.map(c => (
                        <option key={c.name} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Brand and Quantity */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-extrabold text-zinc-500 uppercase tracking-widest">Brand (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g., Nike"
                      value={newBrand}
                      onChange={(e) => setNewBrand(e.target.value)}
                      className="w-full bg-black border border-zinc-900 focus:border-[#FF3B3B]/50 rounded-2xl py-2.5 px-4 text-xs font-semibold text-white placeholder-zinc-700 outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-extrabold text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                      <Hash size={11} />
                      <span>Quantity</span>
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={newQuantity}
                      onChange={(e) => setNewQuantity(parseInt(e.target.value) || 1)}
                      className="w-full bg-black border border-zinc-900 focus:border-[#FF3B3B]/50 rounded-2xl py-2.5 px-4 text-xs font-bold text-white outline-none transition-all"
                      id="add-cloth-quantity"
                    />
                  </div>
                </div>

                {/* Initial Status checkboxes */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-extrabold text-zinc-500 uppercase tracking-widest">Initial Status</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['In Wardrobe', 'Washing', 'Drying'] as const).map(status => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => setNewStatus(status === 'Washing' ? 'Washing' : status === 'Drying' ? 'Drying' : 'In Wardrobe')}
                        className={`text-[10px] font-extrabold uppercase py-2.5 rounded-2xl border transition-all cursor-pointer ${
                          newStatus === status 
                            ? 'bg-[#FF3B3B]/10 text-[#FF3B3B] border-[#FF3B3B]' 
                            : 'bg-black border-zinc-900 text-zinc-500 hover:text-white'
                        }`}
                      >
                        {status === 'In Wardrobe' ? 'In Closet' : status === 'Washing' ? 'Laundry' : 'Drying'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Submit Save */}
                <div className="pt-4 border-t border-zinc-900">
                  <button
                    type="submit"
                    className="w-full bg-[#FF3B3B] hover:bg-[#FF1A1A] text-white font-extrabold text-xs py-3.5 px-4 rounded-2xl transition-all cursor-pointer shadow-md shadow-[#FF3B3B]/10 uppercase tracking-wider"
                    id="add-cloth-save-btn"
                  >
                    Save to Wardrobe
                  </button>
                </div>

              </form>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* INSTANT CAMERA MODAL */}
      <InstantCameraModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleCameraCapture}
      />
    </div>
  );
}
