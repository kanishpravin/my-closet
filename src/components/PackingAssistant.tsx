import React, { useState } from 'react';
import { 
  Briefcase, 
  Plus, 
  Trash2, 
  X, 
  Check, 
  Sparkles, 
  Calendar, 
  MapPin, 
  Luggage,
  AlertCircle,
  FolderPlus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PackingTrip, AppSettings } from '../types';

interface PackingAssistantProps {
  trips: PackingTrip[];
  settings: AppSettings;
  onAddTrip: (trip: Omit<PackingTrip, 'id' | 'isCompleted'>) => void;
  onDeleteTrip: (id: string) => void;
  onUpdateTrip: (id: string, updates: Partial<PackingTrip>) => void;
}

export default function PackingAssistant({ 
  trips, 
  settings, 
  onAddTrip, 
  onDeleteTrip, 
  onUpdateTrip 
}: PackingAssistantProps) {
  
  const [isNewTripOpen, setIsNewTripOpen] = useState(false);
  
  // New Trip form state
  const [destination, setDestination] = useState('');
  const [duration, setDuration] = useState(3);
  
  // Key-value store of categories and their required packed counts
  const [requirements, setRequirements] = useState<{ [category: string]: number }>({});

  const handleRequirementChange = (cat: string, val: number) => {
    setRequirements(prev => ({
      ...prev,
      [cat]: Math.max(0, val)
    }));
  };

  const handleCreateTrip = (e: React.FormEvent) => {
    e.preventDefault();
    if (!destination.trim()) return;

    // Filter and build packing category requirements
    const finalRequirements: { [category: string]: { needed: number; packed: number } } = {};
    
    settings.categories.forEach(cat => {
      const count = requirements[cat] || 0;
      if (count > 0) {
        finalRequirements[cat] = { needed: count, packed: 0 };
      }
    });

    onAddTrip({
      destination: destination,
      durationDays: duration,
      requirements: finalRequirements
    });

    // Reset Form
    setDestination('');
    setDuration(3);
    setRequirements({});
    setIsNewTripOpen(false);
  };

  const handleIncrementPacked = (tripId: string, category: string) => {
    const trip = trips.find(t => t.id === tripId);
    if (!trip) return;

    const currentReq = trip.requirements[category];
    if (!currentReq) return;

    const updatedRequirements = {
      ...trip.requirements,
      [category]: {
        ...currentReq,
        packed: Math.min(currentReq.needed, currentReq.packed + 1)
      }
    };

    onUpdateTrip(tripId, { requirements: updatedRequirements });
  };

  const handleDecrementPacked = (tripId: string, category: string) => {
    const trip = trips.find(t => t.id === tripId);
    if (!trip) return;

    const currentReq = trip.requirements[category];
    if (!currentReq) return;

    const updatedRequirements = {
      ...trip.requirements,
      [category]: {
        ...currentReq,
        packed: Math.max(0, currentReq.packed - 1)
      }
    };

    onUpdateTrip(tripId, { requirements: updatedRequirements });
  };

  const handleToggleComplete = (trip: PackingTrip) => {
    onUpdateTrip(trip.id, { isCompleted: !trip.isCompleted });
  };

  return (
    <div className="space-y-6 bg-black">
      
      {/* Header Title */}
      <div className="flex justify-between items-center border-b border-zinc-900 pb-5">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <span>Packing Planner</span>
            <Briefcase size={18} className="text-[#FF3B3B]" />
          </h2>
          <p className="text-xs text-zinc-500 mt-1.5 font-semibold">Plan checklists for upcoming travels and monitor packed quotas dynamically.</p>
        </div>

        <button
          onClick={() => setIsNewTripOpen(true)}
          className="bg-[#FF3B3B] hover:bg-[#FF1A1A] text-white font-bold text-xs px-4 py-3 rounded-2xl flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-[#FF3B3B]/10"
          id="packing-add-trip-btn"
        >
          <Plus size={15} />
          <span>Plan Trip</span>
        </button>
      </div>

      {/* Trips list */}
      {trips.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="packing-trips-grid">
          {trips.map((trip) => {
            
            // Calculate total requirements vs. total packed
            const totalNeeded = Object.values(trip.requirements).reduce((acc, r) => acc + r.needed, 0);
            const totalPacked = Object.values(trip.requirements).reduce((acc, r) => acc + r.packed, 0);
            const progressPct = totalNeeded > 0 ? Math.round((totalPacked / totalNeeded) * 100) : 100;

            return (
              <motion.div
                layoutId={`trip-card-${trip.id}`}
                whileHover={{ y: -3 }}
                key={trip.id}
                className={`bg-zinc-950 border rounded-3xl p-6 flex flex-col justify-between transition-all ${
                  trip.isCompleted ? 'border-zinc-900 opacity-60' : 'border-zinc-900 hover:border-zinc-850'
                }`}
              >
                <div className="space-y-5">
                  {/* Trip destination metadata */}
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex gap-3">
                      <div className="p-3 bg-zinc-900 rounded-xl text-[#FF3B3B] border border-zinc-850">
                        <MapPin size={18} />
                      </div>
                      <div>
                        <h3 className={`text-sm font-black text-white leading-tight ${trip.isCompleted ? 'line-through text-zinc-500' : ''}`}>
                          {trip.destination}
                        </h3>
                        <p className="text-[10px] text-zinc-500 font-bold mt-1.5 flex items-center gap-1.5">
                          <Calendar size={10} />
                          <span>{trip.durationDays} Days Travel</span>
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        if (window.confirm('Delete this trip planner?')) {
                          onDeleteTrip(trip.id);
                        }
                      }}
                      className="p-2 text-zinc-500 hover:text-[#FF3B3B] bg-black hover:bg-[#FF3B3B]/10 border border-zinc-900 hover:border-transparent rounded-xl transition-all cursor-pointer"
                      title="Delete trip checklist"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>

                  {/* Progress Line */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-bold">
                      <span className="text-zinc-400">Total Packed</span>
                      <span className="text-white">{progressPct}% ({totalPacked}/{totalNeeded})</span>
                    </div>
                    <div className="w-full bg-zinc-900 h-2.5 rounded-full overflow-hidden border border-zinc-850">
                      <div 
                        className="bg-[#FF3B3B] h-full transition-all duration-300"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>

                  {/* Packing Category list */}
                  <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                    {Object.entries(trip.requirements).map(([category, req]) => {
                      const isCatDone = req.packed >= req.needed;
                      return (
                        <div 
                          key={category} 
                          className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                            isCatDone 
                              ? 'bg-zinc-900/30 border-zinc-900 text-zinc-500' 
                              : 'bg-black border-zinc-900/70 text-zinc-200'
                          }`}
                        >
                          <span className="text-xs font-bold pl-1">{category}</span>
                          
                          <div className="flex items-center gap-3">
                            {/* Packed counter buttons */}
                            <div className="flex items-center gap-1 bg-zinc-950/50 border border-zinc-900 rounded-xl px-1 py-0.5">
                              <button
                                disabled={req.packed <= 0 || trip.isCompleted}
                                onClick={() => handleDecrementPacked(trip.id, category)}
                                className="w-6 h-6 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-900 flex items-center justify-center font-bold text-xs disabled:opacity-20 cursor-pointer"
                              >
                                -
                              </button>
                              <span className="text-xs font-mono font-bold text-center w-8">
                                {req.packed} / {req.needed}
                              </span>
                              <button
                                disabled={req.packed >= req.needed || trip.isCompleted}
                                onClick={() => handleIncrementPacked(trip.id, category)}
                                className="w-6 h-6 rounded-lg text-[#FF3B3B] hover:text-white hover:bg-[#FF3B3B] flex items-center justify-center font-bold text-xs disabled:opacity-20 cursor-pointer"
                              >
                                +
                              </button>
                            </div>
                            
                            {isCatDone && <Check size={14} className="text-emerald-500" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Mark as completed bottom button */}
                <div className="mt-6 pt-4 border-t border-zinc-900">
                  <button
                    onClick={() => handleToggleComplete(trip)}
                    className={`w-full py-2.5 rounded-2xl font-bold text-[10px] uppercase tracking-wider transition-all border cursor-pointer ${
                      trip.isCompleted 
                        ? 'bg-zinc-900 border-zinc-800 text-zinc-500' 
                        : 'bg-[#FF3B3B]/10 hover:bg-[#FF3B3B] text-[#FF3B3B] hover:text-white border-[#FF3B3B]/15 shadow-sm'
                    }`}
                  >
                    {trip.isCompleted ? 'Re-open Trip checklist' : 'Mark Trip as Packed'}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="bg-zinc-950 border border-dashed border-zinc-900 rounded-3xl py-20 text-center max-w-2xl mx-auto px-4">
          <Briefcase size={36} className="mx-auto mb-3.5 text-zinc-850 animate-pulse" />
          <h3 className="text-zinc-300 font-extrabold text-sm mb-1.5">No planned trips</h3>
          <p className="text-[11px] max-w-xs mx-auto text-zinc-600 leading-relaxed mb-6">
            Configure dynamic packing checklists before you travel. Select how many items per category you'll need, and check them off securely as you pack!
          </p>
          <button
            onClick={() => setIsNewTripOpen(true)}
            className="bg-[#FF3B3B]/10 hover:bg-[#FF3B3B] text-[#FF3B3B] hover:text-white border border-[#FF3B3B]/15 font-bold text-xs px-5 py-3 rounded-2xl transition-all cursor-pointer"
          >
            Plan First Trip
          </button>
        </div>
      )}

      {/* CREATE NEW TRIP DIALOG */}
      <AnimatePresence>
        {isNewTripOpen && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-zinc-950 border border-zinc-900 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl"
            >
              
              <div className="p-5 border-b border-zinc-900 flex items-center justify-between">
                <h3 className="font-extrabold text-white text-sm tracking-tight flex items-center gap-2">
                  <Luggage size={16} className="text-[#FF3B3B]" />
                  <span>Plan upcoming journey</span>
                </h3>
                <button 
                  onClick={() => setIsNewTripOpen(false)}
                  className="p-2 rounded-xl text-zinc-400 hover:text-white bg-black border border-zinc-900 hover:border-zinc-800 transition-colors cursor-pointer"
                >
                  <X size={15} />
                </button>
              </div>

              <form onSubmit={handleCreateTrip} className="p-6 space-y-4">
                
                {/* Destination */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-extrabold text-zinc-500 uppercase tracking-widest block">Destination</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Paris Summer Getaway"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="w-full bg-black border border-zinc-900 focus:border-[#FF3B3B]/50 rounded-2xl py-2.5 px-4 text-xs font-semibold text-white placeholder-zinc-700 outline-none transition-all"
                  />
                </div>

                {/* Duration */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-extrabold text-zinc-500 uppercase tracking-widest block">Duration (Days)</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value) || 1)}
                    className="w-full bg-black border border-zinc-900 focus:border-[#FF3B3B]/50 rounded-2xl py-2.5 px-4 text-xs font-bold text-white outline-none transition-all"
                  />
                </div>

                {/* Categories Check quota selector */}
                <div className="space-y-2">
                  <label className="text-[9px] font-extrabold text-zinc-500 uppercase tracking-widest block">Required Categories Packed</label>
                  
                  <div className="space-y-2 max-h-52 overflow-y-auto bg-black p-3 rounded-2xl border border-zinc-900 scrollbar-none">
                    {settings.categories.map(cat => {
                      const count = requirements[cat] || 0;
                      return (
                        <div key={cat} className="flex items-center justify-between py-1 text-xs">
                          <span className="text-zinc-400 font-bold">{cat}</span>
                          
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleRequirementChange(cat, count - 1)}
                              className="w-6 h-6 rounded bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 flex items-center justify-center font-bold cursor-pointer"
                            >
                              -
                            </button>
                            <span className="w-8 text-center font-mono font-bold text-zinc-200">
                              {count}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRequirementChange(cat, count + 1)}
                              className="w-6 h-6 rounded bg-zinc-900 text-[#FF3B3B] hover:bg-zinc-800 flex items-center justify-center font-bold cursor-pointer"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Submit save button */}
                <div className="pt-4 border-t border-zinc-900">
                  <button
                    type="submit"
                    className="w-full bg-[#FF3B3B] hover:bg-[#FF1A1A] text-white font-extrabold text-xs py-3.5 px-4 rounded-2xl transition-all cursor-pointer shadow-md shadow-[#FF3B3B]/10 uppercase tracking-wider"
                  >
                    Generate Checklist
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
