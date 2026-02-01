import initSqlJs, { Database } from 'sql.js';
import { Item, ItemCategory, ItemStatus, ItemType } from '@/types/item';

let db: Database | null = null;
const DB_STORAGE_KEY = 'lost-found-sqlite-db';

// Initialize the database
export async function initDatabase(): Promise<Database> {
  if (db) return db;

  const SQL = await initSqlJs({
    locateFile: (file) => `https://sql.js.org/dist/${file}`,
  });

  // Try to load existing database from localStorage
  const savedDb = localStorage.getItem(DB_STORAGE_KEY);
  if (savedDb) {
    const binaryArray = new Uint8Array(
      atob(savedDb)
        .split('')
        .map((char) => char.charCodeAt(0))
    );
    db = new SQL.Database(binaryArray);
  } else {
    db = new SQL.Database();
    createTables(db);
    seedDefaultAdmins(db);
  }

  return db;
}

// Save database to localStorage
export function saveDatabase(): void {
  if (!db) return;
  const data = db.export();
  const base64 = btoa(String.fromCharCode(...data));
  localStorage.setItem(DB_STORAGE_KEY, base64);
}

// Create tables
function createTables(database: Database): void {
  database.run(`
    CREATE TABLE IF NOT EXISTS items (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL CHECK(type IN ('lost', 'found')),
      category TEXT NOT NULL CHECK(category IN ('electronics', 'clothing-bags', 'school-supplies', 'personal-items')),
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
    );
  `);

  database.run(`
    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL
    );
  `);

  database.run(`
    CREATE INDEX IF NOT EXISTS idx_items_type ON items(type);
    CREATE INDEX IF NOT EXISTS idx_items_status ON items(status);
    CREATE INDEX IF NOT EXISTS idx_items_category ON items(category);
  `);
}

// Seed default admin accounts
function seedDefaultAdmins(database: Database): void {
  const admins = [
    { username: 'admin', password: 'admin123' },
    { username: 'security', password: 'security123' },
  ];

  admins.forEach(({ username, password }) => {
    database.run('INSERT OR IGNORE INTO admins (username, password) VALUES (?, ?)', [
      username,
      password,
    ]);
  });

  saveDatabase();
}

// Item operations
export function getAllItems(): Item[] {
  if (!db) return [];

  const results = db.exec(
    'SELECT id, type, category, description, location, date, reporter_name, reporter_email, reporter_phone, status, notes, created_at, updated_at FROM items ORDER BY created_at DESC'
  );

  if (results.length === 0) return [];

  return results[0].values.map((row) => ({
    id: row[0] as string,
    type: row[1] as ItemType,
    category: row[2] as ItemCategory,
    description: row[3] as string,
    location: row[4] as string,
    date: row[5] as string,
    reporterName: row[6] as string,
    reporterEmail: row[7] as string,
    reporterPhone: row[8] as string | undefined,
    status: row[9] as ItemStatus,
    notes: row[10] as string | undefined,
    createdAt: row[11] as string,
    updatedAt: row[12] as string,
  }));
}

export function getItemById(id: string): Item | null {
  if (!db) return null;

  const results = db.exec(
    'SELECT id, type, category, description, location, date, reporter_name, reporter_email, reporter_phone, status, notes, created_at, updated_at FROM items WHERE id = ?',
    [id]
  );

  if (results.length === 0 || results[0].values.length === 0) return null;

  const row = results[0].values[0];
  return {
    id: row[0] as string,
    type: row[1] as ItemType,
    category: row[2] as ItemCategory,
    description: row[3] as string,
    location: row[4] as string,
    date: row[5] as string,
    reporterName: row[6] as string,
    reporterEmail: row[7] as string,
    reporterPhone: row[8] as string | undefined,
    status: row[9] as ItemStatus,
    notes: row[10] as string | undefined,
    createdAt: row[11] as string,
    updatedAt: row[12] as string,
  };
}

export function insertItem(item: Omit<Item, 'id' | 'createdAt' | 'updatedAt'>): Item {
  if (!db) throw new Error('Database not initialized');

  const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const now = new Date().toISOString();

  db.run(
    `INSERT INTO items (id, type, category, description, location, date, reporter_name, reporter_email, reporter_phone, status, notes, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      item.type,
      item.category,
      item.description,
      item.location,
      item.date,
      item.reporterName,
      item.reporterEmail,
      item.reporterPhone || null,
      item.status,
      item.notes || null,
      now,
      now,
    ]
  );

  saveDatabase();

  return {
    ...item,
    id,
    createdAt: now,
    updatedAt: now,
  };
}

export function updateItem(id: string, updates: Partial<Item>): void {
  if (!db) throw new Error('Database not initialized');

  const now = new Date().toISOString();
  const setClauses: string[] = ['updated_at = ?'];
  const values: (string | null)[] = [now];

  if (updates.status !== undefined) {
    setClauses.push('status = ?');
    values.push(updates.status);
  }
  if (updates.notes !== undefined) {
    setClauses.push('notes = ?');
    values.push(updates.notes || null);
  }
  if (updates.description !== undefined) {
    setClauses.push('description = ?');
    values.push(updates.description);
  }
  if (updates.location !== undefined) {
    setClauses.push('location = ?');
    values.push(updates.location);
  }
  if (updates.category !== undefined) {
    setClauses.push('category = ?');
    values.push(updates.category);
  }

  values.push(id);

  db.run(`UPDATE items SET ${setClauses.join(', ')} WHERE id = ?`, values);
  saveDatabase();
}

export function deleteItem(id: string): void {
  if (!db) throw new Error('Database not initialized');
  db.run('DELETE FROM items WHERE id = ?', [id]);
  saveDatabase();
}

export function getItemsByType(type: ItemType): Item[] {
  if (!db) return [];

  const results = db.exec(
    'SELECT id, type, category, description, location, date, reporter_name, reporter_email, reporter_phone, status, notes, created_at, updated_at FROM items WHERE type = ? ORDER BY created_at DESC',
    [type]
  );

  if (results.length === 0) return [];

  return results[0].values.map((row) => ({
    id: row[0] as string,
    type: row[1] as ItemType,
    category: row[2] as ItemCategory,
    description: row[3] as string,
    location: row[4] as string,
    date: row[5] as string,
    reporterName: row[6] as string,
    reporterEmail: row[7] as string,
    reporterPhone: row[8] as string | undefined,
    status: row[9] as ItemStatus,
    notes: row[10] as string | undefined,
    createdAt: row[11] as string,
    updatedAt: row[12] as string,
  }));
}

export function searchItems(query: string, category?: ItemCategory): Item[] {
  if (!db) return [];

  let sql = `SELECT id, type, category, description, location, date, reporter_name, reporter_email, reporter_phone, status, notes, created_at, updated_at 
             FROM items 
             WHERE type = 'found' AND (status = 'held' OR status = 'pending')`;
  const params: string[] = [];

  if (query) {
    sql += ` AND (description LIKE ? OR location LIKE ?)`;
    params.push(`%${query}%`, `%${query}%`);
  }

  if (category) {
    sql += ` AND category = ?`;
    params.push(category);
  }

  sql += ` ORDER BY created_at DESC`;

  const results = db.exec(sql, params);

  if (results.length === 0) return [];

  return results[0].values.map((row) => ({
    id: row[0] as string,
    type: row[1] as ItemType,
    category: row[2] as ItemCategory,
    description: row[3] as string,
    location: row[4] as string,
    date: row[5] as string,
    reporterName: row[6] as string,
    reporterEmail: row[7] as string,
    reporterPhone: row[8] as string | undefined,
    status: row[9] as ItemStatus,
    notes: row[10] as string | undefined,
    createdAt: row[11] as string,
    updatedAt: row[12] as string,
  }));
}

// Admin authentication
export function validateAdmin(username: string, password: string): boolean {
  if (!db) return false;

  const results = db.exec(
    'SELECT id FROM admins WHERE username = ? AND password = ?',
    [username, password]
  );

  return results.length > 0 && results[0].values.length > 0;
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

// Get statistics
export function getStats() {
  if (!db) return { total: 0, pending: 0, held: 0, claimed: 0, disposed: 0 };

  const results = db.exec(`
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
      SUM(CASE WHEN status = 'held' THEN 1 ELSE 0 END) as held,
      SUM(CASE WHEN status = 'claimed' THEN 1 ELSE 0 END) as claimed,
      SUM(CASE WHEN status = 'disposed' THEN 1 ELSE 0 END) as disposed
    FROM items
  `);

  if (results.length === 0) return { total: 0, pending: 0, held: 0, claimed: 0, disposed: 0 };

  const row = results[0].values[0];
  return {
    total: row[0] as number,
    pending: row[1] as number,
    held: row[2] as number,
    claimed: row[3] as number,
    disposed: row[4] as number,
  };
}

// Run raw SQL query (for debugging/admin purposes)
export function runQuery(sql: string, params: (string | number | null)[] = []) {
  if (!db) throw new Error('Database not initialized');
  return db.exec(sql, params);
}
