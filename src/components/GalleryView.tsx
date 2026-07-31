import React, { useState, useRef } from 'react';
import { 
  Camera, 
  Upload, 
  Shirt, 
  Trash2, 
  X, 
  Layers, 
  ZoomIn, 
  Plus, 
  Sparkles,
  Link2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ClothingItem } from '../types';
import InstantCameraModal from './InstantCameraModal';

interface GalleryViewProps {
  clothingItems: ClothingItem[];
  onUpdateItem: (id: string, updates: Partial<ClothingItem>) => void;
  onOpenAddModal: () => void;
}

export default function GalleryView({ 
  clothingItems, 
  onUpdateItem,
  onOpenAddModal 
}: GalleryViewProps) {
  
  const [selectedPhoto, setSelectedPhoto] = useState<ClothingItem | null>(null);
  const [isLinkingOpen, setIsLinkingOpen] = useState(false);
  const [linkingItemId, setLinkingItemId] = useState('');
  const [newPhotoBase64, setNewPhotoBase64] = useState('');
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCameraCapture = (base64: string) => {
    setNewPhotoBase64(base64);
    setIsLinkingOpen(true);
  };

  // Filter items that have photos
  const photoItems = clothingItems.filter(item => !!item.photoBase64);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setNewPhotoBase64(reader.result as string);
      setIsLinkingOpen(true);
    };
    reader.readAsDataURL(file);
  };

  const handleLinkToItem = () => {
    if (!linkingItemId || !newPhotoBase64) return;
    onUpdateItem(linkingItemId, { photoBase64: newPhotoBase64 });
    
    // Reset
    setLinkingItemId('');
    setNewPhotoBase64('');
    setIsLinkingOpen(false);
  };

  const handleRemovePhoto = (itemId: string) => {
    if (window.confirm('Remove photo from this item? The item will remain in your wardrobe.')) {
      onUpdateItem(itemId, { photoBase64: undefined });
      if (selectedPhoto && selectedPhoto.id === itemId) {
        setSelectedPhoto(null);
      }
    }
  };

  const unphotographedItems = clothingItems.filter(item => !item.photoBase64);

  return (
    <div className="space-y-6 bg-black">
      
      {/* Title Header */}
      <div className="flex justify-between items-center border-b border-zinc-900 pb-5">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <span>Wardrobe Gallery</span>
            <Camera size={18} className="text-[#FF3B3B]" />
          </h2>
          <p className="text-xs text-zinc-500 mt-1.5">Offline local directory of your garments photos. Snapshot or upload images.</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Instant Camera Button */}
          <button
            onClick={() => setIsCameraOpen(true)}
            className="bg-[#FF3B3B] hover:bg-[#FF1A1A] text-white font-bold text-xs px-4 py-3 rounded-2xl flex items-center gap-2 transition-all cursor-pointer shadow-md shadow-[#FF3B3B]/10"
            id="gallery-instant-camera-btn"
          >
            <Camera size={15} />
            <span>Open Instant Camera</span>
          </button>

          {/* Upload Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-zinc-950 border border-zinc-900 hover:border-zinc-800 text-white font-bold text-xs px-4 py-3 rounded-2xl flex items-center gap-2 transition-all cursor-pointer"
            id="gallery-upload-photo-btn"
          >
            <Upload size={14} className="text-zinc-500" />
            <span>Upload Photo</span>
          </button>
          
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="image/*" 
            className="hidden" 
          />
        </div>
      </div>

      {/* Main Photo Matrix Grid */}
      {photoItems.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5" id="gallery-photo-grid">
          {photoItems.map((item) => (
            <motion.div
              layoutId={`gallery-card-${item.id}`}
              whileHover={{ y: -4 }}
              key={item.id}
              onClick={() => setSelectedPhoto(item)}
              className="bg-zinc-950 border border-zinc-900 hover:border-zinc-800 rounded-3xl p-3 cursor-pointer group flex flex-col justify-between"
            >
              <div className="aspect-square rounded-2xl overflow-hidden relative border border-zinc-900 bg-black">
                <img 
                  src={item.photoBase64} 
                  alt={item.name} 
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                
                {/* Floating overlay zoom button */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="p-2.5 rounded-full bg-black/80 text-white border border-zinc-800">
                    <ZoomIn size={16} />
                  </span>
                </div>
              </div>

              <div className="mt-3.5 px-1 pb-1">
                <h4 className="font-extrabold text-[11px] text-white tracking-tight line-clamp-1 group-hover:text-[#FF3B3B] transition-colors">
                  {item.name}
                </h4>
                <p className="text-[9px] text-zinc-500 mt-1 font-semibold uppercase">{item.brand} • {item.category}</p>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-zinc-950 border border-dashed border-zinc-900 rounded-3xl py-20 text-center max-w-2xl mx-auto flex flex-col items-center justify-center px-6">
          <div className="p-4 bg-zinc-900 rounded-3xl mb-4 border border-zinc-850 text-zinc-500 animate-pulse">
            <Camera size={36} />
          </div>
          <h3 className="text-zinc-300 font-extrabold text-sm mb-1.5">No wardrobe photographs yet</h3>
          <p className="text-[11px] text-zinc-600 max-w-sm mb-8 leading-relaxed">
            Attach local photographs of your garments to view a rich visual closet gallery. Everything remains 100% private offline inside your web browser.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-[#FF3B3B] hover:bg-[#FF1A1A] text-white font-bold text-xs py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-[#FF3B3B]/10"
            >
              <Upload size={14} />
              <span>Upload Closet Photo</span>
            </button>
            <button
              onClick={onOpenAddModal}
              className="bg-black hover:bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white font-bold text-xs py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Plus size={14} />
              <span>Catalog New Item</span>
            </button>
          </div>
        </div>
      )}

      {/* FULL PHOTO INSPECT MODAL */}
      <AnimatePresence>
        {selectedPhoto && (
          <div className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-zinc-950 border border-zinc-900 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl relative"
            >
              {/* Image box */}
              <div className="aspect-square w-full bg-black relative border-b border-zinc-900">
                <img 
                  src={selectedPhoto.photoBase64} 
                  alt={selectedPhoto.name} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <button
                  onClick={() => setSelectedPhoto(null)}
                  className="absolute top-4 right-4 p-2 rounded-full bg-black/80 hover:bg-black text-white hover:text-[#FF3B3B] border border-zinc-800 transition-colors cursor-pointer"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Text metadata and actions */}
              <div className="p-6 space-y-4">
                <div>
                  <h3 className="font-extrabold text-white text-base leading-tight">{selectedPhoto.name}</h3>
                  <p className="text-xs text-[#FF3B3B] font-extrabold mt-1 uppercase tracking-wider">{selectedPhoto.brand} • {selectedPhoto.category}</p>
                </div>

                <div className="pt-4 border-t border-zinc-900 flex justify-between gap-3">
                  <button
                    onClick={() => handleRemovePhoto(selectedPhoto.id)}
                    className="flex-1 flex items-center justify-center gap-2 bg-black hover:bg-red-950/20 border border-zinc-900 hover:border-red-900/30 text-zinc-500 hover:text-[#FF3B3B] font-bold text-xs py-3 rounded-xl transition-all cursor-pointer"
                  >
                    <Trash2 size={13} />
                    <span>Delete Photo</span>
                  </button>
                  <button
                    onClick={() => setSelectedPhoto(null)}
                    className="flex-1 bg-[#FF3B3B] hover:bg-[#FF1A1A] text-white font-bold text-xs py-3 rounded-xl transition-all cursor-pointer"
                  >
                    Close Inspect
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* NEW UPLOADED IMAGE LINKING MODAL */}
      <AnimatePresence>
        {isLinkingOpen && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-zinc-950 border border-zinc-900 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl"
            >
              
              <div className="p-5 border-b border-zinc-900 flex items-center justify-between">
                <h3 className="font-extrabold text-white text-sm tracking-tight flex items-center gap-2">
                  <Link2 size={16} className="text-[#FF3B3B]" />
                  <span>Link Photo to Item</span>
                </h3>
                <button 
                  onClick={() => {
                    setNewPhotoBase64('');
                    setIsLinkingOpen(false);
                  }}
                  className="p-2 rounded-xl text-zinc-400 hover:text-white bg-black border border-zinc-900 hover:border-zinc-800 transition-colors cursor-pointer"
                >
                  <X size={15} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="aspect-video w-full rounded-2xl overflow-hidden border border-zinc-900 bg-black">
                  <img 
                    src={newPhotoBase64} 
                    alt="Uploaded source" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-extrabold text-zinc-500 uppercase tracking-widest block">Choose Closet Garment to Link</label>
                  
                  {unphotographedItems.length > 0 ? (
                    <select
                      value={linkingItemId}
                      onChange={(e) => setLinkingItemId(e.target.value)}
                      className="w-full bg-black border border-zinc-900 focus:border-[#FF3B3B]/50 rounded-2xl py-3 px-4 text-xs font-bold text-white outline-none transition-all"
                    >
                      <option value="">Select a garment...</option>
                      {unphotographedItems.map(item => (
                        <option key={item.id} value={item.id}>{item.name} ({item.brand})</option>
                      ))}
                    </select>
                  ) : (
                    <div className="text-center p-4 bg-black rounded-2xl border border-zinc-900 text-zinc-600 text-xs">
                      No unphotographed garments exist in your wardrobe. Catalog a new garment first!
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-zinc-900 flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setNewPhotoBase64('');
                      setIsLinkingOpen(false);
                    }}
                    className="flex-1 bg-black hover:bg-zinc-900 border border-zinc-900 text-zinc-500 hover:text-white font-bold text-xs py-3 rounded-2xl transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={!linkingItemId}
                    onClick={handleLinkToItem}
                    className="flex-1 bg-[#FF3B3B] hover:bg-[#FF1A1A] text-white font-bold text-xs py-3 rounded-2xl transition-all disabled:opacity-40 cursor-pointer shadow-md"
                  >
                    Link Photo
                  </button>
                </div>
              </div>

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
