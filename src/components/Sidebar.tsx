import React from 'react';
import { 
  LayoutDashboard, 
  Shirt, 
  Camera, 
  Container, 
  Calendar, 
  BarChart3, 
  Briefcase, 
  Heart, 
  Settings, 
  X,
  Info
} from 'lucide-react';
import { motion } from 'motion/react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  totalItemsCount: number;
  totalWishlistCount: number;
}

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  isOpen, 
  setIsOpen,
  totalItemsCount,
  totalWishlistCount
}: SidebarProps) {
  
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'clothes', label: 'My Wardrobe', icon: Shirt, badge: totalItemsCount },
    { id: 'gallery', label: 'Gallery & Camera', icon: Camera },
    { id: 'laundry', label: 'Laundry Stream', icon: Container },
    { id: 'calendar', label: 'Wear Calendar', icon: Calendar },
    { id: 'statistics', label: 'Analytics', icon: BarChart3 },
    { id: 'packing', label: 'Packing Planner', icon: Briefcase },
    { id: 'wishlist', label: 'My Wishlist', icon: Heart, badge: totalWishlistCount },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
          id="sidebar-backdrop"
        />
      )}

      {/* Sidebar Container */}
      <aside 
        id="app-sidebar"
        className={`fixed inset-y-0 left-0 w-72 bg-black border-r border-zinc-900 flex flex-col z-50 transform transition-transform duration-300 lg:translate-x-0 lg:static lg:h-screen ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header/Logo with Pixel-inspired aesthetic */}
        <div className="p-6 border-b border-zinc-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FF3B3B]/10 border border-[#FF3B3B]/30 flex items-center justify-center text-[#FF3B3B] font-extrabold text-base tracking-tight shadow-md shadow-[#FF3B3B]/5">
              MC
            </div>
            <div>
              <h1 className="font-extrabold text-white text-base tracking-tight leading-none">My Closet</h1>
              <p className="text-[10px] text-zinc-500 font-mono mt-1 tracking-wider uppercase">Wardrobe Hub</p>
            </div>
          </div>
          
          <button 
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-2 rounded-xl text-zinc-400 hover:text-white bg-zinc-950 border border-zinc-900 hover:border-zinc-800 transition-colors cursor-pointer"
            id="close-sidebar-btn"
          >
            <X size={16} />
          </button>
        </div>

        {/* Menu Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                id={`sidebar-tab-${item.id}`}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsOpen(false); // Close mobile sidebar
                }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl font-semibold text-xs transition-all relative group ${
                  isActive 
                    ? 'text-white bg-zinc-950 border border-zinc-900' 
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-950/40'
                }`}
              >
                {/* Active Pill Accent (Material Design 3 style) */}
                {isActive && (
                  <motion.div 
                    layoutId="activePill"
                    className="absolute left-2 top-2.5 bottom-2.5 w-1 bg-[#FF3B3B] rounded-full"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}

                <div className="flex items-center gap-3.5 z-10 pl-1.5">
                  <IconComponent 
                    size={16} 
                    className={`transition-colors duration-200 ${
                      isActive ? 'text-[#FF3B3B]' : 'text-zinc-500 group-hover:text-zinc-300'
                    }`} 
                  />
                  <span>{item.label}</span>
                </div>
                
                {item.badge !== undefined && item.badge > 0 && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold font-mono transition-colors z-10 ${
                    isActive ? 'bg-[#FF3B3B]/10 text-[#FF3B3B] border border-[#FF3B3B]/20' : 'bg-zinc-950 text-zinc-500 border border-zinc-900 group-hover:text-zinc-300'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* System Credentials Disclaimer / Workspace Info */}
        <div className="p-5 border-t border-zinc-900 bg-zinc-950/40 text-center">
          <div className="flex items-center justify-center gap-2 text-zinc-600 text-[10px] font-mono">
            <span>v2.0 • Pixel Minimal</span>
            <span>•</span>
            <span className="flex items-center gap-1 text-[#FF3B3B]/60 font-semibold"><Info size={10} /> OFFLINE</span>
          </div>
        </div>
      </aside>
    </>
  );
}
