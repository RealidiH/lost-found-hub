// Lost & Found Database Module - Uses localStorage for persistence

const DB_KEY = 'lost-found-db';
const ADMIN_SESSION_KEY = 'admin-logged-in';

// Categories and labels
const CATEGORY_LABELS = {
  'electronics': 'Electronics',
  'clothing-bags': 'Clothing & Bags',
  'school-supplies': 'School Supplies',
  'personal-items': 'Personal Items',
};

const STATUS_LABELS = {
  'pending': 'Pending',
  'held': 'Held',
  'claimed': 'Claimed',
  'disposed': 'Disposed',
};

const CATEGORY_EXAMPLES = {
  'electronics': 'Phones, laptops, tablets, chargers, earbuds',
  'clothing-bags': 'Bags, jackets, hats, scarves',
  'school-supplies': 'Textbooks, notebooks, ID cards, stationery',
  'personal-items': 'Watches, jewelry, glasses, wallets, keys',
};

// Default admins
const DEFAULT_ADMINS = [
  { username: 'admin', password: 'admin123' },
  { username: 'security', password: 'security123' },
];

// Initialize database
function initDatabase() {
  const existing = localStorage.getItem(DB_KEY);
  if (!existing) {
    const db = {
      items: [],
      admins: DEFAULT_ADMINS
    };
    localStorage.setItem(DB_KEY, JSON.stringify(db));
    return db;
  }
  return JSON.parse(existing);
}

// Save database
function saveDatabase(db) {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
}

// Get all items
function getAllItems() {
  const db = initDatabase();
  return db.items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

// Get item by ID
function getItemById(id) {
  const db = initDatabase();
  return db.items.find(item => item.id === id) || null;
}

// Insert item
function insertItem(item) {
  const db = initDatabase();
  const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const now = new Date().toISOString();
  
  const newItem = {
    ...item,
    id,
    createdAt: now,
    updatedAt: now
  };
  
  db.items.push(newItem);
  saveDatabase(db);
  return newItem;
}

// Update item
function updateItem(id, updates) {
  const db = initDatabase();
  const index = db.items.findIndex(item => item.id === id);
  
  if (index !== -1) {
    db.items[index] = {
      ...db.items[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    saveDatabase(db);
    return db.items[index];
  }
  return null;
}

// Delete item
function deleteItem(id) {
  const db = initDatabase();
  db.items = db.items.filter(item => item.id !== id);
  saveDatabase(db);
}

// Search items (found items only, held or pending)
function searchItems(query = '', category = null) {
  const db = initDatabase();
  
  return db.items.filter(item => {
    if (item.type !== 'found') return false;
    if (item.status !== 'held' && item.status !== 'pending') return false;
    
    if (query) {
      const q = query.toLowerCase();
      if (!item.description.toLowerCase().includes(q) && 
          !item.location.toLowerCase().includes(q)) {
        return false;
      }
    }
    
    if (category && item.category !== category) return false;
    
    return true;
  }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

// Validate admin credentials
function validateAdmin(username, password) {
  const db = initDatabase();
  return db.admins.some(admin => 
    admin.username === username && admin.password === password
  );
}

// Admin session management
function isAdminLoggedIn() {
  return sessionStorage.getItem(ADMIN_SESSION_KEY) === 'true';
}

function setAdminLoggedIn(value) {
  if (value) {
    sessionStorage.setItem(ADMIN_SESSION_KEY, 'true');
  } else {
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
  }
}

// Get statistics
function getStats() {
  const items = getAllItems();
  return {
    total: items.length,
    pending: items.filter(i => i.status === 'pending').length,
    held: items.filter(i => i.status === 'held').length,
    claimed: items.filter(i => i.status === 'claimed').length,
    disposed: items.filter(i => i.status === 'disposed').length,
  };
}

// Format date for display
function formatDate(dateString) {
  const date = new Date(dateString);
  const options = { month: 'short', day: 'numeric', year: 'numeric' };
  return date.toLocaleDateString('en-US', options);
}

function formatDateShort(dateString) {
  const date = new Date(dateString);
  const options = { month: 'short', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
}

// Toast notification
function showToast(title, description) {
  const container = document.getElementById('toast-container');
  if (!container) return;
  
  const toast = document.getElementById('toast');
  if (!toast) return;
  
  document.getElementById('toast-title').textContent = title;
  document.getElementById('toast-description').textContent = description;
  toast.classList.add('show');
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}
