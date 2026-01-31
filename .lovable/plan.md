

# Lost and Found Management System

A clean, professional web application for your school security department to manage lost and found items efficiently.

---

## Phase 1: Core System (Initial Build)

### 🏠 Public Interface
- **Homepage** with clear options to report a lost item or report a found item
- **Report Lost Item Form** - Students/staff enter: their name, contact info (email/phone), item category, description, where they last saw it, and when
- **Report Found Item Form** - Similar form for items someone has found and turned in
- **Search Page** - Browse currently held found items to check if their lost item has been turned in

### 👤 Admin Dashboard (Login Required)
- **Secure admin login** with multiple admin accounts for security staff
- **Item Management Table** - View all lost and found reports with filtering and search
- **Item Details** - View full details, update status (claimed/unclaimed/disposed), add notes
- **Quick Actions** - Mark items as matched, claimed, or disposed

### 📦 Item Categories
- Electronics (phones, laptops, tablets, chargers, earbuds)
- Clothing & Bags (bags, jackets, hats, scarves)
- School Supplies (textbooks, notebooks, ID cards, stationery)
- Personal Items (watches, jewelry, glasses, wallets, keys)

---

## Phase 2: Advanced Features (Future Additions)

### ⏰ Time-Based Flagging
- Items unclaimed for 30 days get automatically flagged
- Visual indicators for items approaching disposal date
- Bulk actions for flagged items

### 🔍 Duplicate Detection
- Alerts when similar items are reported
- Help admins identify potential matches between lost and found reports

### 📋 Audit Log
- Track all admin actions (who edited what, when)
- Maintain accountability and transparency

### 📊 Reports & Statistics
- Monthly/weekly reports on items received and claimed
- Success rate metrics
- Category-based insights

---

## Technical Approach

- **Database**: Will use Lovable Cloud (Supabase) to store all item records, admin accounts, and logs
- **Authentication**: Secure admin-only login with role-based access
- **Design**: Clean, professional interface with neutral colors suitable for an official school system

