// Lost & Found Database Module - Uses sql.js (SQLite in browser) for persistence

const DB_STORAGE_KEY = 'lost-found-sqljs-db';
const ADMIN_SESSION_KEY = 'admin-logged-in';

// Global database instance
let db = null;
let dbReady = false;
let dbReadyCallbacks = [];

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

// Initialize sql.js and database
async function initDatabase() {
  if (dbReady) return db;
  
  try {
    // Load sql.js from CDN
    const SQL = await initSqlJs({
      locateFile: file => `https://sql.js.org/dist/${file}`
    });
    
    // Try to load existing database from localStorage
    const savedData = localStorage.getItem(DB_STORAGE_KEY);
    if (savedData) {
      const binaryArray = new Uint8Array(atob(savedData).split('').map(c => c.charCodeAt(0)));
      db = new SQL.Database(binaryArray);
    } else {
      db = new SQL.Database();
      createSchema();
    }
    
    dbReady = true;
    
    // Call all waiting callbacks
    dbReadyCallbacks.forEach(cb => cb(db));
    dbReadyCallbacks = [];
    
    return db;
  } catch (error) {
    console.error('Failed to initialize sql.js:', error);
    throw error;
  }
}

// Create database schema
function createSchema() {
  db.run(`
    CREATE TABLE IF NOT EXISTS items (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL CHECK(type IN ('lost', 'found')),
      category TEXT NOT NULL,
      description TEXT NOT NULL,
      location TEXT NOT NULL,
      date TEXT NOT NULL,
      reporter_name TEXT NOT NULL,
      reporter_email TEXT NOT NULL,
      reporter_phone TEXT,
      status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'held', 'claimed', 'disposed')),
      notes TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);
  
  db.run(`
    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL
    )
  `);
  
  // Create indexes
  db.run('CREATE INDEX IF NOT EXISTS idx_items_type ON items(type)');
  db.run('CREATE INDEX IF NOT EXISTS idx_items_status ON items(status)');
  db.run('CREATE INDEX IF NOT EXISTS idx_items_category ON items(category)');
  db.run('CREATE INDEX IF NOT EXISTS idx_items_created_at ON items(created_at)');
  
  // Insert default admins
  DEFAULT_ADMINS.forEach(admin => {
    db.run('INSERT OR IGNORE INTO admins (username, password) VALUES (?, ?)', 
      [admin.username, admin.password]);
  });
  
  saveDatabase();
}

// Save database to localStorage
function saveDatabase() {
  if (!db) return;
  const data = db.export();
  const base64 = btoa(String.fromCharCode.apply(null, data));
  localStorage.setItem(DB_STORAGE_KEY, base64);
}

// Wait for database to be ready
function onDatabaseReady(callback) {
  if (dbReady) {
    callback(db);
  } else {
    dbReadyCallbacks.push(callback);
  }
}

// Generate unique ID
function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Get all items
function getAllItems() {
  if (!db) return [];
  
  const results = db.exec(`
    SELECT id, type, category, description, location, date, 
           reporter_name as reporterName, reporter_email as reporterEmail, 
           reporter_phone as reporterPhone, status, notes, 
           created_at as createdAt, updated_at as updatedAt
    FROM items 
    ORDER BY created_at DESC
  `);
  
  if (results.length === 0) return [];
  
  return results[0].values.map(row => {
    const columns = results[0].columns;
    const item = {};
    columns.forEach((col, i) => {
      item[col] = row[i];
    });
    return item;
  });
}

// Get item by ID
function getItemById(id) {
  if (!db) return null;
  
  const results = db.exec(`
    SELECT id, type, category, description, location, date, 
           reporter_name as reporterName, reporter_email as reporterEmail, 
           reporter_phone as reporterPhone, status, notes, 
           created_at as createdAt, updated_at as updatedAt
    FROM items 
    WHERE id = ?
  `, [id]);
  
  if (results.length === 0 || results[0].values.length === 0) return null;
  
  const columns = results[0].columns;
  const row = results[0].values[0];
  const item = {};
  columns.forEach((col, i) => {
    item[col] = row[i];
  });
  return item;
}

// Insert item
function insertItem(item) {
  if (!db) return null;
  
  const id = generateId();
  const now = new Date().toISOString();
  
  db.run(`
    INSERT INTO items (id, type, category, description, location, date, 
                       reporter_name, reporter_email, reporter_phone, status, notes, 
                       created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    id,
    item.type,
    item.category,
    item.description,
    item.location,
    item.date,
    item.reporterName,
    item.reporterEmail,
    item.reporterPhone || null,
    item.status || 'pending',
    item.notes || null,
    now,
    now
  ]);
  
  saveDatabase();
  
  return {
    ...item,
    id,
    createdAt: now,
    updatedAt: now
  };
}

// Update item
function updateItem(id, updates) {
  if (!db) return null;
  
  const now = new Date().toISOString();
  const setClauses = [];
  const values = [];
  
  const fieldMap = {
    type: 'type',
    category: 'category',
    description: 'description',
    location: 'location',
    date: 'date',
    reporterName: 'reporter_name',
    reporterEmail: 'reporter_email',
    reporterPhone: 'reporter_phone',
    status: 'status',
    notes: 'notes'
  };
  
  Object.entries(updates).forEach(([key, value]) => {
    if (fieldMap[key]) {
      setClauses.push(`${fieldMap[key]} = ?`);
      values.push(value);
    }
  });
  
  if (setClauses.length === 0) return getItemById(id);
  
  setClauses.push('updated_at = ?');
  values.push(now);
  values.push(id);
  
  db.run(`UPDATE items SET ${setClauses.join(', ')} WHERE id = ?`, values);
  saveDatabase();
  
  return getItemById(id);
}

// Delete item
function deleteItem(id) {
  if (!db) return;
  db.run('DELETE FROM items WHERE id = ?', [id]);
  saveDatabase();
}

// Search items (found items only, held or pending)
function searchItems(query = '', category = null) {
  if (!db) return [];
  
  let sql = `
    SELECT id, type, category, description, location, date, 
           reporter_name as reporterName, reporter_email as reporterEmail, 
           reporter_phone as reporterPhone, status, notes, 
           created_at as createdAt, updated_at as updatedAt
    FROM items 
    WHERE type = 'found' AND (status = 'held' OR status = 'pending')
  `;
  
  const params = [];
  
  if (query) {
    sql += ` AND (LOWER(description) LIKE ? OR LOWER(location) LIKE ?)`;
    const searchTerm = `%${query.toLowerCase()}%`;
    params.push(searchTerm, searchTerm);
  }
  
  if (category) {
    sql += ` AND category = ?`;
    params.push(category);
  }
  
  sql += ` ORDER BY created_at DESC`;
  
  const results = db.exec(sql, params);
  
  if (results.length === 0) return [];
  
  return results[0].values.map(row => {
    const columns = results[0].columns;
    const item = {};
    columns.forEach((col, i) => {
      item[col] = row[i];
    });
    return item;
  });
}

// Validate admin credentials
function validateAdmin(username, password) {
  if (!db) return false;
  
  const results = db.exec(
    'SELECT COUNT(*) as count FROM admins WHERE username = ? AND password = ?',
    [username, password]
  );
  
  if (results.length === 0) return false;
  return results[0].values[0][0] > 0;
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
  if (!db) return { total: 0, pending: 0, held: 0, claimed: 0, disposed: 0 };
  
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
