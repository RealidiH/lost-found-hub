export type ItemCategory = 
  | 'electronics'
  | 'clothing-bags'
  | 'school-supplies'
  | 'personal-items';

export type ItemStatus = 
  | 'pending'      // Newly reported, not yet processed
  | 'held'         // Item is being held at lost & found
  | 'claimed'      // Item has been claimed by owner
  | 'disposed';    // Item has been disposed after retention period

export type ItemType = 'lost' | 'found';

export interface Item {
  id: string;
  type: ItemType;
  category: ItemCategory;
  description: string;
  location: string;
  date: string;           // Date item was lost/found
  reporterName: string;
  reporterEmail: string;
  reporterPhone?: string;
  status: ItemStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export const CATEGORY_LABELS: Record<ItemCategory, string> = {
  'electronics': 'Electronics',
  'clothing-bags': 'Clothing & Bags',
  'school-supplies': 'School Supplies',
  'personal-items': 'Personal Items',
};

export const STATUS_LABELS: Record<ItemStatus, string> = {
  'pending': 'Pending',
  'held': 'Held',
  'claimed': 'Claimed',
  'disposed': 'Disposed',
};

export const CATEGORY_EXAMPLES: Record<ItemCategory, string> = {
  'electronics': 'Phones, laptops, tablets, chargers, earbuds',
  'clothing-bags': 'Bags, jackets, hats, scarves',
  'school-supplies': 'Textbooks, notebooks, ID cards, stationery',
  'personal-items': 'Watches, jewelry, glasses, wallets, keys',
};
