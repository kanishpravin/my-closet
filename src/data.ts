import { AppSettings, ClothingItem, UsageLog, PackingTrip, WishlistItem } from './types';

export const DEFAULT_SETTINGS: AppSettings = {
  categories: ['T-Shirts', 'Shirts', 'Jeans', 'Inners', 'Socks', 'Hoodies', 'Accessories', 'Others'],
  colors: [
    { name: 'Black', hex: '#0a0a0a' },
    { name: 'White', hex: '#f9fafb' },
    { name: 'Red', hex: '#FF3B3B' },
    { name: 'Blue', hex: '#2563eb' },
    { name: 'Green', hex: '#16a34a' },
    { name: 'Grey', hex: '#6b7280' },
    { name: 'Navy', hex: '#1e3a8a' },
    { name: 'Yellow', hex: '#eab308' },
    { name: 'Purple', hex: '#7c3aed' },
    { name: 'Brown', hex: '#78350f' },
  ],
  brands: ['H&M', 'Zara', 'Uniqlo', 'Puma', 'Nike', 'Adidas', 'Levi\'s', 'Tommy Hilfiger', 'Calvin Klein'],
  laundryReminder: 'Every 3 days',
  lowStockReminder: true,
};

// All initial user records are strictly empty for a clean first launch
export const SEED_CLOTHING_ITEMS: ClothingItem[] = [];
export const SEED_USAGE_LOGS: UsageLog[] = [];
export const SEED_TRIPS: PackingTrip[] = [];
export const SEED_WISHLIST: WishlistItem[] = [];
