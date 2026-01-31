import { Item } from '@/types/item';

const ITEMS_KEY = 'lost-found-items';
const ADMIN_KEY = 'lost-found-admins';

// Default admin credentials (in production, this would be in a database)
const DEFAULT_ADMINS = [
  { username: 'admin', password: 'admin123' },
  { username: 'security', password: 'security123' },
];

export function getItems(): Item[] {
  const stored = localStorage.getItem(ITEMS_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

export function saveItem(item: Item): void {
  const items = getItems();
  const existingIndex = items.findIndex(i => i.id === item.id);
  
  if (existingIndex >= 0) {
    items[existingIndex] = { ...item, updatedAt: new Date().toISOString() };
  } else {
    items.push(item);
  }
  
  localStorage.setItem(ITEMS_KEY, JSON.stringify(items));
}

export function deleteItem(id: string): void {
  const items = getItems().filter(item => item.id !== id);
  localStorage.setItem(ITEMS_KEY, JSON.stringify(items));
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Admin authentication
export function initializeAdmins(): void {
  const stored = localStorage.getItem(ADMIN_KEY);
  if (!stored) {
    localStorage.setItem(ADMIN_KEY, JSON.stringify(DEFAULT_ADMINS));
  }
}

export function validateAdmin(username: string, password: string): boolean {
  initializeAdmins();
  const admins = JSON.parse(localStorage.getItem(ADMIN_KEY) || '[]');
  return admins.some(
    (admin: { username: string; password: string }) => 
      admin.username === username && admin.password === password
  );
}

export function isAdminLoggedIn(): boolean {
  return sessionStorage.getItem('admin-logged-in') === 'true';
}

export function setAdminLoggedIn(value: boolean): void {
  if (value) {
    sessionStorage.setItem('admin-logged-in', 'true');
  } else {
    sessionStorage.removeItem('admin-logged-in');
  }
}
