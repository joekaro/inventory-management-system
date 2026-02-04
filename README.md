# Ì≥¶ Inventory Management System

A modern, full-stack inventory management system built with Next.js, TypeScript, Tailwind CSS, and Supabase.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## Ìºü Features

### Core Features
- ‚úÖ **Product Management** - Full CRUD operations for products
- ‚úÖ **Multi-Location Support** - Track inventory across warehouses and stores
- ‚úÖ **Stock Movement Tracking** - Complete history of all inventory transactions
- ‚úÖ **Low Stock Alerts** - Automatic notifications when stock falls below reorder points
- ‚úÖ **Real-time Dashboard** - Live statistics and key performance indicators

### Advanced Features
- Ì¥ç **Search & Filter** - Advanced search by name, SKU, description with category filters
- Ì≥ä **Analytics & Reports** - Comprehensive reports with category breakdown and profitability analysis
- Ì≥• **CSV Export** - Export product data for external analysis
- Ì≥± **QR Code Generation** - Generate and download QR codes for products (scans open product page)
- ‚ö° **Quick Stock Adjustment** - Modal-based stock updates with movement tracking
- Ì≤∞ **Profit Margin Calculator** - Real-time margin calculations on products
- Ì≥± **Mobile Responsive** - Fully optimized for mobile, tablet, and desktop

---

## Ìª†Ô∏è Tech Stack

- **Frontend:** Next.js 16 (App Router), React 19, TypeScript
- **Styling:** Tailwind CSS v3
- **Database:** Supabase (PostgreSQL)
- **Icons:** Lucide React
- **QR Codes:** qrcode library
- **State Management:** React Hooks

---

## Ì∫Ä Getting Started

### Prerequisites

- Node.js 24.x or higher
- npm or yarn
- Supabase account (free tier available)

### Installation

1. **Clone the repository**
```bash
   git clone https://github.com/yourusername/inventory-management-system.git
   cd inventory-management-system
```

2. **Install dependencies**
```bash
   npm install
```

3. **Set up Supabase**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Copy your project URL and anon key

4. **Configure environment variables**
   
   Create a `.env.local` file in the root directory:
```env
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

5. **Set up database**
   
   Go to Supabase SQL Editor and run the schema from the Database Setup section below

6. **Run the development server**
```bash
   npm run dev
```

7. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## Ì∑ÑÔ∏è Database Setup

### Database Schema

Run this SQL in your Supabase SQL Editor:
```sql
-- Create Products Table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  sku VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  category VARCHAR(100),
  cost_price DECIMAL(10, 2) DEFAULT 0,
  selling_price DECIMAL(10, 2) DEFAULT 0,
  reorder_point INTEGER DEFAULT 10,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Locations Table
CREATE TABLE locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  address TEXT,
  type VARCHAR(50) DEFAULT 'warehouse',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Inventory Table
CREATE TABLE inventory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  location_id UUID REFERENCES locations(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 0,
  reserved_quantity INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(product_id, location_id)
);

-- Create Stock Movements Table
CREATE TABLE stock_movements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  location_id UUID REFERENCES locations(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL,
  quantity INTEGER NOT NULL,
  reference_number VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by VARCHAR(255)
);

-- Create Indexes
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_inventory_product ON inventory(product_id);
CREATE INDEX idx_inventory_location ON inventory(location_id);
CREATE INDEX idx_movements_product ON stock_movements(product_id);
CREATE INDEX idx_movements_created ON stock_movements(created_at DESC);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inventory_updated_at
  BEFORE UPDATE ON inventory
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### Sample Data
```sql
-- Insert sample locations
INSERT INTO locations (name, address, type) VALUES
  ('Main Warehouse', '123 Storage St, Lagos', 'warehouse'),
  ('Downtown Store', '456 Retail Ave, Lagos', 'store'),
  ('Airport Branch', '789 Terminal Rd, Lagos', 'store');

-- Insert sample products
INSERT INTO products (name, sku, description, category, cost_price, selling_price, reorder_point) VALUES
  ('Laptop HP 15', 'LAP-HP-001', 'HP 15 inch laptop, 8GB RAM', 'Electronics', 45000, 65000, 5),
  ('Office Chair', 'FUR-CHR-001', 'Ergonomic office chair', 'Furniture', 15000, 25000, 10),
  ('Wireless Mouse', 'ACC-MSE-001', 'Logitech wireless mouse', 'Accessories', 2000, 3500, 20);
```

---

## Ì≥ñ Usage Guide

### QR Code Scanning

1. Edit any product
2. Scroll to "Product QR Code" section
3. Click "Show QR Code"
4. Scan with your phone camera - **it will open the product page in your browser**
5. You can also download and print the QR code for product labels

**Use Cases:**
- Stick QR codes on product shelves
- Print on product packaging
- Quick mobile access to product details
- Share product info with team members

### Managing Products

1. **Add Product:** Click "+ Add Product" button
2. **Edit Product:** Click pencil icon on any product
3. **Delete Product:** Click trash icon (with confirmation)
4. **Search Products:** Use search bar to filter by name, SKU, or description
5. **Filter by Category:** Select category from dropdown
6. **Export Data:** Click "Export CSV" to download product list

### Stock Management

1. **View Inventory:** Navigate to Inventory page
2. **Adjust Stock:** Click "Adjust Stock" on any item
3. **Choose Type:**
   - **Add:** Increase stock (e.g., new shipment)
   - **Remove:** Decrease stock (e.g., sale, damage)
   - **Set To:** Override with exact quantity (e.g., after physical count)
4. **Add Notes:** Document reason for adjustment
5. **Submit:** Changes are recorded in stock movements

### Reports

- View comprehensive analytics
- Category breakdown
- Top products by value
- Low stock alerts
- Profitability metrics

---

## Ì∫Ä Deployment

### Deploy to Vercel

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your GitHub repository
4. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Deploy!

---

## Ì≥± Screenshots

*Add screenshots of your app here after deployment*

---

## Ì¥ù Contributing

Contributions are welcome! Please fork and submit a PR.

---

## Ì≥Ñ License

MIT License - feel free to use for your projects!

---

## Ì±®‚ÄçÌ≤ª Author

Built with ‚ù§Ô∏è using Next.js and Supabase

---

## Ì≥û Support

For issues, open a GitHub issue or contact support.
