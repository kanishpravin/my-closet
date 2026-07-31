export type ClothingStatus = 'In Wardrobe' | 'Washing' | 'Drying' | 'Folding';

export interface ClothingItem {
  id: string;
  name: string;
  category: string;
  color: string;
  brand: string;
  quantity: number;
  status: ClothingStatus;
  usedCount: number;
  lastUsed: string | null; // YYYY-MM-DD
  lastWashed: string | null; // YYYY-MM-DD
  colorHex: string; // The hex code for rendering the garment's main color
  photoBase64?: string; // Storing local offline-first pictures
}

export interface UsageLog {
  id: string;
  itemId: string;
  itemName: string;
  itemCategory: string;
  colorHex: string;
  date: string; // YYYY-MM-DD
}

export interface PackingCategoryRequirement {
  needed: number;
  packed: number;
}

export interface PackingTrip {
  id: string;
  destination: string;
  durationDays: number;
  requirements: {
    [category: string]: PackingCategoryRequirement;
  };
  isCompleted: boolean;
}

export interface WishlistItem {
  id: string;
  name: string;
  category: string;
  color: string;
  colorHex: string;
  brand: string;
  price?: number;
  url?: string;
  notes?: string;
  photoBase64?: string;
}

export interface AppSettings {
  categories: string[];
  colors: { name: string; hex: string }[];
  brands: string[];
  laundryReminder: string; // e.g., "Every 3 days"
  lowStockReminder: boolean;
}
