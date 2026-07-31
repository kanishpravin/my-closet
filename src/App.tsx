import React, { useState, useEffect } from 'react';
import { 
  Menu, 
  User, 
  RotateCcw,
  Sparkles,
  ArrowRight,
  Shirt,
  Lock,
  Heart
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import { ClothingItem, UsageLog, PackingTrip, AppSettings, WishlistItem } from './types';
import { SEED_CLOTHING_ITEMS, SEED_USAGE_LOGS, SEED_TRIPS, SEED_WISHLIST, DEFAULT_SETTINGS } from './data';

import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ClothesList from './components/ClothesList';
import LaundryManager from './components/LaundryManager';
import UsageCalendar from './components/UsageCalendar';
import StatisticsView from './components/StatisticsView';
import PackingAssistant from './components/PackingAssistant';
import SettingsView from './components/SettingsView';
import GalleryView from './components/GalleryView';
import WishlistView from './components/WishlistView';

export default function App() {
  
  // Splash Screen control - true by default for first-time user
  const [showSplash, setShowSplash] = useState<boolean>(() => {
    const cached = localStorage.getItem('mc_v3_splash_seen');
    return cached ? false : true;
  });

  // State managers
  const [clothingItems, setClothingItems] = useState<ClothingItem[]>(() => {
    const cached = localStorage.getItem('mc_v3_clothing_items');
    return cached ? JSON.parse(cached) : SEED_CLOTHING_ITEMS;
  });

  const [usageLogs, setUsageLogs] = useState<UsageLog[]>(() => {
    const cached = localStorage.getItem('mc_v3_usage_logs');
    return cached ? JSON.parse(cached) : SEED_USAGE_LOGS;
  });

  const [trips, setTrips] = useState<PackingTrip[]>(() => {
    const cached = localStorage.getItem('mc_v3_trips');
    return cached ? JSON.parse(cached) : SEED_TRIPS;
  });

  const [wishlist, setWishlist] = useState<WishlistItem[]>(() => {
    const cached = localStorage.getItem('mc_v3_wishlist');
    return cached ? JSON.parse(cached) : SEED_WISHLIST;
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    const cached = localStorage.getItem('mc_v3_settings');
    return cached ? JSON.parse(cached) : DEFAULT_SETTINGS;
  });

  // Layout navigation states
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [activeFilterCategory, setActiveFilterCategory] = useState<string>('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);

  // Synchronize state changes to local storage
  useEffect(() => {
    localStorage.setItem('mc_v3_clothing_items', JSON.stringify(clothingItems));
  }, [clothingItems]);

  useEffect(() => {
    localStorage.setItem('mc_v3_usage_logs', JSON.stringify(usageLogs));
  }, [usageLogs]);

  useEffect(() => {
    localStorage.setItem('mc_v3_trips', JSON.stringify(trips));
  }, [trips]);

  useEffect(() => {
    localStorage.setItem('mc_v3_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem('mc_v3_settings', JSON.stringify(settings));
  }, [settings]);

  // Handle Splash dismiss (Onboarding First launch)
  const handleEnterCloset = () => {
    localStorage.setItem('mc_v3_splash_seen', 'true');
    setShowSplash(false);
  };

  // State modifiers
  const handleAddClothingItem = (newItem: Omit<ClothingItem, 'id' | 'usedCount' | 'lastUsed' | 'lastWashed'>) => {
    const id = `item_${Date.now()}`;
    const formattedItem: ClothingItem = {
      ...newItem,
      id,
      usedCount: 0,
      lastUsed: null,
      lastWashed: null
    };
    setClothingItems(prev => [formattedItem, ...prev]);
  };

  const handleUpdateClothingItem = (id: string, updates: Partial<ClothingItem>) => {
    setClothingItems(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
  };

  const handleDeleteClothingItem = (id: string) => {
    setClothingItems(prev => prev.filter(item => item.id !== id));
    // Purge associated log items to keep consistency
    setUsageLogs(prev => prev.filter(log => log.itemId !== id));
  };

  const handleMarkAsWorn = (id: string) => {
    const today = new Date().toISOString().split('T')[0];
    const item = clothingItems.find(i => i.id === id);
    if (!item) return;

    handleUpdateClothingItem(id, {
      usedCount: item.usedCount + 1,
      lastUsed: today
    });

    const newLog: UsageLog = {
      id: `log_${Date.now()}`,
      itemId: id,
      itemName: item.name,
      itemCategory: item.category,
      colorHex: item.colorHex,
      date: today
    };
    setUsageLogs(prev => [newLog, ...prev]);
  };

  const handleAddLog = (itemId: string, date: string) => {
    const item = clothingItems.find(i => i.id === itemId);
    if (!item) return;

    handleUpdateClothingItem(itemId, {
      usedCount: item.usedCount + 1,
      lastUsed: date
    });

    const newLog: UsageLog = {
      id: `log_${Date.now()}`,
      itemId,
      itemName: item.name,
      itemCategory: item.category,
      colorHex: item.colorHex,
      date
    };
    setUsageLogs(prev => [newLog, ...prev]);
  };

  const handleDeleteLog = (logId: string) => {
    const log = usageLogs.find(l => l.id === logId);
    if (!log) return;

    const item = clothingItems.find(i => i.id === log.itemId);
    if (item) {
      handleUpdateClothingItem(log.itemId, {
        usedCount: Math.max(0, item.usedCount - 1)
      });
    }

    setUsageLogs(prev => prev.filter(l => l.id !== logId));
  };

  // Laundry Status transition
  const handleUpdateStatus = (id: string, newStatus: any) => {
    handleUpdateClothingItem(id, { status: newStatus });
  };

  // Trips actions
  const handleAddTrip = (newTrip: Omit<PackingTrip, 'id' | 'isCompleted'>) => {
    const id = `trip_${Date.now()}`;
    const formattedTrip: PackingTrip = {
      ...newTrip,
      id,
      isCompleted: false
    };
    setTrips(prev => [formattedTrip, ...prev]);
  };

  const handleUpdateTrip = (id: string, updates: Partial<PackingTrip>) => {
    setTrips(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const handleDeleteTrip = (id: string) => {
    setTrips(prev => prev.filter(t => t.id !== id));
  };

  // Wishlist actions
  const handleAddWishlistItem = (newItem: Omit<WishlistItem, 'id'>) => {
    const id = `wish_${Date.now()}`;
    const item: WishlistItem = { ...newItem, id };
    setWishlist(prev => [item, ...prev]);
  };

  const handleDeleteWishlistItem = (id: string) => {
    setWishlist(prev => prev.filter(item => item.id !== id));
  };

  const handleMoveToCloset = (item: WishlistItem) => {
    // Add item to active wardrobe
    handleAddClothingItem({
      name: item.name,
      category: item.category,
      color: item.color,
      brand: item.brand,
      quantity: 1,
      status: 'In Wardrobe',
      colorHex: item.colorHex,
      photoBase64: item.photoBase64
    });

    // Delete item from Wishlist
    handleDeleteWishlistItem(item.id);

    // Redirect to clothes list
    setActiveTab('clothes');
    setActiveFilterCategory('All');
  };

  // Settings
  const handleUpdateSettings = (updates: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  const handleClearAllData = () => {
    localStorage.removeItem('mc_v3_clothing_items');
    localStorage.removeItem('mc_v3_usage_logs');
    localStorage.removeItem('mc_v3_trips');
    localStorage.removeItem('mc_v3_wishlist');
    localStorage.removeItem('mc_v3_settings');
    setClothingItems(SEED_CLOTHING_ITEMS);
    setUsageLogs(SEED_USAGE_LOGS);
    setTrips(SEED_TRIPS);
    setWishlist(SEED_WISHLIST);
    setSettings(DEFAULT_SETTINGS);
  };

  const handleExportData = () => {
    return JSON.stringify({
      clothingItems,
      usageLogs,
      trips,
      wishlist,
      settings
    });
  };

  const handleImportData = (importedString: string) => {
    try {
      const data = JSON.parse(importedString);
      if (data.clothingItems && data.usageLogs) {
        setClothingItems(data.clothingItems);
        setUsageLogs(data.usageLogs);
        if (data.trips) setTrips(data.trips);
        if (data.wishlist) setWishlist(data.wishlist);
        if (data.settings) setSettings(data.settings);
        return true;
      }
    } catch (e) {
      console.error(e);
    }
    return false;
  };

  // Navigation redirection helper
  const handleNavigateToClothes = (categoryFilter?: string) => {
    if (categoryFilter) {
      setActiveFilterCategory(categoryFilter);
    } else {
      setActiveFilterCategory('All');
    }
    setActiveTab('clothes');
  };

  // Render correct panel
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard 
            clothingItems={clothingItems}
            onNavigateToClothes={handleNavigateToClothes}
            onNavigateToTab={setActiveTab}
            onOpenAddModal={() => {
              setActiveFilterCategory('All');
              setActiveTab('clothes');
              setIsAddModalOpen(true);
            }}
          />
        );
      case 'clothes':
        return (
          <ClothesList 
            clothingItems={clothingItems}
            settings={settings}
            activeFilterCategory={activeFilterCategory}
            setActiveFilterCategory={setActiveFilterCategory}
            onAddItem={handleAddClothingItem}
            onUpdateItem={handleUpdateClothingItem}
            onDeleteItem={handleDeleteClothingItem}
            onMarkAsWorn={handleMarkAsWorn}
            isAddModalOpen={isAddModalOpen}
            onCloseAddModal={() => setIsAddModalOpen(false)}
            onOpenAddModal={() => setIsAddModalOpen(true)}
          />
        );
      case 'gallery':
        return (
          <GalleryView 
            clothingItems={clothingItems}
            onUpdateItem={handleUpdateClothingItem}
            onOpenAddModal={() => {
              setActiveFilterCategory('All');
              setActiveTab('clothes');
              setIsAddModalOpen(true);
            }}
          />
        );
      case 'laundry':
        return (
          <LaundryManager 
            clothingItems={clothingItems}
            onUpdateStatus={handleUpdateStatus}
            onUpdateItem={handleUpdateClothingItem}
            settings={settings}
          />
        );
      case 'calendar':
        return (
          <UsageCalendar 
            clothingItems={clothingItems}
            usageLogs={usageLogs}
            onAddLog={handleAddLog}
            onDeleteLog={handleDeleteLog}
          />
        );
      case 'statistics':
        return (
          <StatisticsView 
            clothingItems={clothingItems}
            usageLogs={usageLogs}
          />
        );
      case 'packing':
        return (
          <PackingAssistant 
            trips={trips}
            settings={settings}
            onAddTrip={handleAddTrip}
            onUpdateTrip={handleUpdateTrip}
            onDeleteTrip={handleDeleteTrip}
          />
        );
      case 'wishlist':
        return (
          <WishlistView 
            wishlist={wishlist}
            settings={settings}
            onAddWishlistItem={handleAddWishlistItem}
            onDeleteWishlistItem={handleDeleteWishlistItem}
            onMoveToCloset={handleMoveToCloset}
          />
        );
      case 'settings':
        return (
          <SettingsView 
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            onClearAllData={handleClearAllData}
            onImportData={handleImportData}
            onExportData={handleExportData}
          />
        );
      default:
        return <div className="text-zinc-500 text-xs">Page not found</div>;
    }
  };

  // Render Splash Onboarding screen
  if (showSplash) {
    return (
      <div 
        id="splash-screen-container"
        className="fixed inset-0 bg-[#000000] flex flex-col justify-between p-8 text-white z-50 overflow-y-auto scrollbar-none"
      >
        <div className="flex justify-between items-center max-w-sm mx-auto w-full pt-4">
          <span className="text-[10px] tracking-widest font-mono font-bold text-zinc-700">MY CLOSET v2.0</span>
          <span className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-500 bg-zinc-950 border border-zinc-900 px-3.5 py-1 rounded-full">
            <Lock size={10} className="text-zinc-600" />
            <span>Local Database</span>
          </span>
        </div>

        {/* Welcome screen core details (as requested by user) */}
        <div className="flex-1 flex flex-col items-center justify-center max-w-sm mx-auto w-full my-8 text-center space-y-8">
          
          <div className="w-28 h-28 rounded-[2rem] bg-zinc-950 border-2 border-[#FF3B3B] flex items-center justify-center relative shadow-2xl shadow-[#FF3B3B]/10">
            <svg viewBox="0 0 100 100" className="w-16 h-16 stroke-[#FF3B3B] fill-none" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round">
              {/* Hook */}
              <path d="M50,42 C50,22 62,24 62,18 C62,12 50,11 50,18" />
              {/* Triangular Hanger Body */}
              <path d="M50,42 L15,72 C17,75 22,76 25,76 L75,76 C78,76 83,75 85,72 Z" />
            </svg>
            <div className="absolute inset-0 bg-[#FF3B3B]/5 blur-2xl rounded-full scale-110 animate-pulse" />
          </div>

          <div className="space-y-3">
            <h1 className="text-4xl font-extrabold tracking-tight text-white leading-none" id="splash-title">
              My Closet
            </h1>
            <p className="text-xs font-semibold text-zinc-400 tracking-wide" id="splash-subtitle">
              Your personal wardrobe manager.
            </p>
          </div>

          <div className="w-full text-left bg-zinc-950/40 border border-zinc-900 p-5 rounded-3xl space-y-3 font-semibold text-xs text-zinc-400">
            <div className="flex items-center gap-3">
              <div className="w-5.5 h-5.5 rounded-lg bg-[#FF3B3B]/10 border border-[#FF3B3B]/15 flex items-center justify-center text-[#FF3B3B] shrink-0">
                <Shirt size={11} />
              </div>
              <span>Track Wardrobe Inventory</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5.5 h-5.5 rounded-lg bg-zinc-900 flex items-center justify-center text-zinc-500 shrink-0">
                <Heart size={11} />
              </div>
              <span>Curate Shopping Wishlists</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5.5 h-5.5 rounded-lg bg-zinc-900 flex items-center justify-center text-zinc-500 shrink-0">
                <Sparkles size={11} />
              </div>
              <span>Log Wear Calendar History</span>
            </div>
          </div>

        </div>

        {/* Get Started Button */}
        <div className="max-w-sm mx-auto w-full pb-6 space-y-4 text-center">
          <button
            onClick={handleEnterCloset}
            className="w-full flex items-center justify-center gap-2 bg-[#FF3B3B] hover:bg-[#FF1A1A] text-white font-extrabold py-4 px-6 rounded-2xl transition-all shadow-lg shadow-[#FF3B3B]/15 group cursor-pointer"
            id="splash-get-started-btn"
          >
            <span>Get Started</span>
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col lg:flex-row font-sans">
      
      {/* Sidebar Navigation */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen}
        totalItemsCount={clothingItems.reduce((acc, i) => acc + i.quantity, 0)}
        totalWishlistCount={wishlist.length}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Header */}
        <header className="bg-black border-b border-zinc-900 px-6 py-4 flex items-center justify-between shrink-0">
          
          <div className="flex items-center gap-3">
            {/* Sidebar toggle for mobile */}
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-zinc-400 hover:text-white bg-zinc-950 border border-zinc-900 hover:border-zinc-850 transition-all cursor-pointer"
              id="mobile-menu-toggle"
            >
              <Menu size={18} />
            </button>
            
            <div className="hidden lg:block">
              <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">My Closet Database Vault</span>
            </div>
            <div className="lg:hidden">
              <h2 className="font-extrabold text-sm text-[#FF3B3B] tracking-tight">
                My Closet
              </h2>
            </div>
          </div>

          {/* Splash screen recalibration button */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                localStorage.removeItem('mc_v3_splash_seen');
                setShowSplash(true);
              }}
              className="p-2 rounded-xl text-zinc-500 hover:text-white bg-zinc-950 border border-zinc-900 hover:border-zinc-850 transition-all text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              title="Onboarding splash recall"
              id="splash-recall-btn"
            >
              <RotateCcw size={13} />
              <span className="sm:inline hidden text-[10px]">Onboarding</span>
            </button>

            <div className="w-9 h-9 rounded-xl bg-zinc-950 border border-zinc-900 flex items-center justify-center text-zinc-400 font-bold text-xs shadow-inner">
              <User size={15} />
            </div>
          </div>

        </header>

        {/* Tab contents panel */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          {renderContent()}
        </main>

      </div>
    </div>
  );
}
