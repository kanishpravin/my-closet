import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Trash2, 
  X, 
  Shirt, 
  Sparkles,
  HelpCircle,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ClothingItem, UsageLog } from '../types';

interface UsageCalendarProps {
  clothingItems: ClothingItem[];
  usageLogs: UsageLog[];
  onAddLog: (itemId: string, date: string) => void;
  onDeleteLog: (id: string) => void;
}

export default function UsageCalendar({ 
  clothingItems, 
  usageLogs, 
  onAddLog, 
  onDeleteLog 
}: UsageCalendarProps) {
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);
  const [isLogOpen, setIsLogOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState('');

  // Get days in current month
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  // Navigation helpers
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Format date as YYYY-MM-DD
  const formatDateString = (day: number) => {
    const d = new Date(year, month, day);
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${mm}-${dd}`;
  };

  const handleDayClick = (day: number) => {
    const dateStr = formatDateString(day);
    setSelectedDateStr(dateStr);
    setIsLogOpen(true);
  };

  const handleSaveLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemId || !selectedDateStr) return;

    onAddLog(selectedItemId, selectedDateStr);
    setSelectedItemId('');
    setIsLogOpen(false);
    setSelectedDateStr(null);
  };

  // Filter logs for a specific day
  const getLogsForDay = (day: number) => {
    const dateStr = formatDateString(day);
    return usageLogs.filter(log => log.date === dateStr);
  };

  const availableItems = clothingItems.filter(item => item.status === 'In Wardrobe');

  return (
    <div className="space-y-6 bg-black">
      
      {/* Title */}
      <div className="flex justify-between items-center border-b border-zinc-900 pb-5">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <span>Wear Calendar</span>
            <CalendarIcon size={18} className="text-[#FF3B3B]" />
          </h2>
          <p className="text-xs text-zinc-500 mt-1.5 font-semibold">Log daily wear events, track individual clothing usage, and map trends offline.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns - Calendar Grid */}
        <div className="lg:col-span-2 bg-zinc-950 border border-zinc-900 rounded-3xl p-5 md:p-6 space-y-6">
          {/* Month Header selector */}
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-black text-white tracking-tight flex items-center gap-2">
              <Clock size={14} className="text-[#FF3B3B]" />
              <span>{monthNames[month]} {year}</span>
            </h3>

            <div className="flex gap-1.5">
              <button 
                onClick={handlePrevMonth}
                className="p-2 bg-black hover:bg-zinc-900 border border-zinc-900 hover:border-zinc-800 text-zinc-400 hover:text-white rounded-xl transition-all cursor-pointer"
              >
                <ChevronLeft size={15} />
              </button>
              <button 
                onClick={handleNextMonth}
                className="p-2 bg-black hover:bg-zinc-900 border border-zinc-900 hover:border-zinc-800 text-zinc-400 hover:text-white rounded-xl transition-all cursor-pointer"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>

          {/* Day Names Row */}
          <div className="grid grid-cols-7 gap-1 md:gap-2 text-center text-[10px] font-black text-zinc-500 uppercase tracking-wider pb-2 border-b border-zinc-900/60">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Calendar Squares Grid */}
          <div className="grid grid-cols-7 gap-1 md:gap-2">
            {/* Empty squares for offsets */}
            {Array.from({ length: firstDayIndex }).map((_, idx) => (
              <div key={`offset-${idx}`} className="aspect-square bg-transparent rounded-2xl" />
            ))}

            {/* Actual Month Days */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const day = idx + 1;
              const logs = getLogsForDay(day);
              const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();

              return (
                <div
                  key={`day-${day}`}
                  onClick={() => handleDayClick(day)}
                  className={`aspect-square rounded-xl md:rounded-2xl border p-1 md:p-2 flex flex-col justify-between cursor-pointer transition-all relative group overflow-hidden ${
                    isToday 
                      ? 'bg-zinc-900 border-[#FF3B3B]/40 shadow' 
                      : 'bg-black/40 border-zinc-900/70 hover:border-[#FF3B3B]/30 hover:bg-zinc-950/80'
                  }`}
                >
                  {/* Day Number */}
                  <span className={`text-[10px] md:text-xs font-bold font-mono ${isToday ? 'text-[#FF3B3B]' : 'text-zinc-500 group-hover:text-zinc-300'}`}>
                    {day}
                  </span>

                  {/* Logs inside calendar square */}
                  <div className="flex gap-1 overflow-x-auto scrollbar-none pt-1">
                    {logs.map((log) => (
                      <span 
                        key={log.id} 
                        className="w-2 h-2 rounded-full border border-black shadow shrink-0"
                        style={{ backgroundColor: log.colorHex }}
                        title={log.itemName}
                      />
                    ))}
                  </div>

                  {/* Tiny plus on hover */}
                  <div className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity text-[#FF3B3B]">
                    <Plus size={10} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column - Today's wear logs list */}
        <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-6 flex flex-col justify-between h-full">
          <div className="space-y-5">
            <div className="border-b border-zinc-900 pb-3">
              <h3 className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider">All History Logs</h3>
              <p className="text-[10px] text-zinc-500 mt-1">Scroll to view all tracked wear history chronologically.</p>
            </div>

            {usageLogs.length > 0 ? (
              <div className="space-y-3.5 max-h-[420px] overflow-y-auto pr-1">
                {[...usageLogs].reverse().map((log) => (
                  <div 
                    key={log.id}
                    className="flex items-center justify-between p-3 bg-black/60 border border-zinc-900 rounded-2xl group transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-8 h-8 rounded-lg flex items-center justify-center border border-zinc-900 shrink-0"
                        style={{ backgroundColor: `${log.colorHex}12` }}
                      >
                        <Shirt 
                          size={13} 
                          style={{ color: log.colorHex === '#ffffff' || log.colorHex === '#f9fafb' ? '#d1d5db' : log.colorHex }} 
                        />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white group-hover:text-[#FF3B3B] transition-colors line-clamp-1">{log.itemName}</h4>
                        <p className="text-[9px] text-zinc-500 mt-1 font-semibold">{log.itemCategory} • {new Date(log.date).toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: 'numeric'})}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => onDeleteLog(log.id)}
                      className="p-1.5 rounded-lg text-zinc-600 hover:text-[#FF3B3B] hover:bg-[#FF3B3B]/10 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                      title="Delete wear event log"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 text-zinc-600 space-y-2">
                <Sparkles size={20} className="mx-auto text-zinc-700" />
                <p className="text-xs font-bold">No wear logs cataloged yet.</p>
                <p className="text-[10px] text-zinc-500 max-w-xs mx-auto">Tap any calendar day to choose an item and track its wear history.</p>
              </div>
            )}
          </div>

          <div className="text-[10px] text-zinc-500 font-mono mt-6 border-t border-zinc-900 pt-4 flex justify-between">
            <span>Wears Logged</span>
            <span className="font-bold text-white">{usageLogs.length} Events</span>
          </div>
        </div>

      </div>

      {/* LOG WEAR MODAL */}
      <AnimatePresence>
        {isLogOpen && selectedDateStr && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-zinc-950 border border-zinc-900 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl"
            >
              
              <div className="p-5 border-b border-zinc-900 flex items-center justify-between">
                <h3 className="font-extrabold text-white text-sm tracking-tight flex items-center gap-2">
                  <CalendarIcon size={16} className="text-[#FF3B3B]" />
                  <span>Log Wear on {new Date(selectedDateStr).toLocaleDateString(undefined, {month: 'long', day: 'numeric', year: 'numeric'})}</span>
                </h3>
                <button 
                  onClick={() => {
                    setIsLogOpen(false);
                    setSelectedDateStr(null);
                  }}
                  className="p-2 rounded-xl text-zinc-400 hover:text-white bg-black border border-zinc-900 hover:border-zinc-800 transition-colors cursor-pointer"
                >
                  <X size={15} />
                </button>
              </div>

              <form onSubmit={handleSaveLog} className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-[9px] font-extrabold text-zinc-500 uppercase tracking-widest block">Choose Garment Worn</label>
                  
                  {availableItems.length > 0 ? (
                    <select
                      required
                      value={selectedItemId}
                      onChange={(e) => setSelectedItemId(e.target.value)}
                      className="w-full bg-black border border-zinc-900 focus:border-[#FF3B3B]/50 rounded-2xl py-3 px-4 text-xs font-bold text-white outline-none transition-all"
                      id="log-wear-item-select"
                    >
                      <option value="">Select a garment...</option>
                      {availableItems.map(item => (
                        <option key={item.id} value={item.id}>{item.name} ({item.brand} • {item.color})</option>
                      ))}
                    </select>
                  ) : (
                    <div className="text-center p-5 bg-black rounded-2xl border border-zinc-900 text-zinc-600 text-xs">
                      No clean clothes available in your wardrobe closet. Wash or add garments first!
                    </div>
                  )}
                </div>

                {/* Save button */}
                <div className="pt-4 border-t border-zinc-900">
                  <button
                    type="submit"
                    disabled={!selectedItemId}
                    className="w-full bg-[#FF3B3B] hover:bg-[#FF1A1A] text-white font-extrabold text-xs py-3.5 px-4 rounded-2xl transition-all cursor-pointer shadow-md shadow-[#FF3B3B]/10 uppercase tracking-wider disabled:opacity-45"
                    id="log-wear-save-btn"
                  >
                    Log wear event
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
