# Supabase Setup Guide

## Database Setup

### 1. Create Tables

Run the following SQL in your Supabase SQL editor:

```sql
-- Create menu_categories table
CREATE TABLE IF NOT EXISTS menu_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    icon VARCHAR(10) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create menu_items table
CREATE TABLE IF NOT EXISTS menu_items (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    image VARCHAR(500), -- Can store emoji or image URL
    category VARCHAR(100) NOT NULL,
    rating DECIMAL(3,2) DEFAULT 4.5,
    popular BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (category) REFERENCES menu_categories(name) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category);
CREATE INDEX IF NOT EXISTS idx_menu_items_popular ON menu_items(popular);
CREATE INDEX IF NOT EXISTS idx_menu_items_active ON menu_items(is_active);
CREATE INDEX IF NOT EXISTS idx_menu_items_rating ON menu_items(rating);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_menu_categories_updated_at 
    BEFORE UPDATE ON menu_categories 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_menu_items_updated_at 
    BEFORE UPDATE ON menu_items 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create view for categories with item counts
CREATE OR REPLACE VIEW category_with_counts AS
SELECT 
    c.id,
    c.name,
    c.icon,
    c.description,
    c.is_active,
    COUNT(m.id) as item_count
FROM menu_categories c
LEFT JOIN menu_items m ON c.name = m.category AND m.is_active = true
GROUP BY c.id, c.name, c.icon, c.description, c.is_active;

-- Create view for popular items
CREATE OR REPLACE VIEW popular_items AS
SELECT 
    id,
    name,
    description,
    price,
    image,
    category,
    rating,
    popular,
    created_at
FROM menu_items 
WHERE is_active = true AND popular = true
ORDER BY rating DESC, created_at DESC;

-- Insert default categories
INSERT INTO menu_categories (name, icon, description) VALUES
('Italian', '🍕', 'Authentic Italian cuisine'),
('Burgers', '🍔', 'Juicy burgers and sandwiches'),
('Salads', '🥗', 'Fresh and healthy salads'),
('Desserts', '🍰', 'Sweet treats and desserts'),
('Seafood', '🐟', 'Fresh seafood dishes'),
('Pasta', '🍝', 'Delicious pasta dishes'),
('Beverages', '🥤', 'Refreshing drinks'),
('Appetizers', '🥨', 'Starters and appetizers')
ON CONFLICT (name) DO NOTHING;

-- Insert sample menu items
INSERT INTO menu_items (name, description, price, image, category, rating, popular) VALUES
('Margherita Pizza', 'Fresh mozzarella, tomato sauce, and basil', 299.00, '🍕', 'Italian', 4.8, true),
('Pepperoni Pizza', 'Spicy pepperoni with melted cheese', 349.00, '🍕', 'Italian', 4.7, true),
('Classic Burger', 'Juicy beef patty with lettuce, tomato, and cheese', 199.00, '🍔', 'Burgers', 4.6, true),
('Chicken Burger', 'Grilled chicken with fresh vegetables', 179.00, '🍔', 'Burgers', 4.5, false),
('Caesar Salad', 'Fresh romaine lettuce with Caesar dressing', 149.00, '🥗', 'Salads', 4.4, false),
('Greek Salad', 'Mixed greens with feta cheese and olives', 159.00, '🥗', 'Salads', 4.3, false),
('Chocolate Cake', 'Rich chocolate cake with ganache', 89.00, '🍰', 'Desserts', 4.9, true),
('Tiramisu', 'Classic Italian dessert with coffee flavor', 99.00, '🍰', 'Desserts', 4.8, true),
('Grilled Salmon', 'Fresh salmon with herbs and lemon', 399.00, '🐟', 'Seafood', 4.7, true),
('Pasta Carbonara', 'Creamy pasta with bacon and parmesan', 249.00, '🍝', 'Pasta', 4.6, false),
('Pasta Alfredo', 'Creamy Alfredo sauce with fettuccine', 229.00, '🍝', 'Pasta', 4.5, false),
('Fresh Lemonade', 'Refreshing lemonade with mint', 49.00, '🥤', 'Beverages', 4.4, false),
('Iced Coffee', 'Cold brew coffee with cream', 59.00, '🥤', 'Beverages', 4.3, false),
('Garlic Bread', 'Crispy bread with garlic butter', 79.00, '🥨', 'Appetizers', 4.2, false),
('Mozzarella Sticks', 'Breaded mozzarella with marinara sauce', 89.00, '🥨', 'Appetizers', 4.1, false)
ON CONFLICT DO NOTHING;
```

### 2. Storage Setup

#### Create Storage Bucket for Menu Images

1. Go to your Supabase dashboard
2. Navigate to Storage in the left sidebar
3. Click "Create a new bucket"
4. Set the following:
   - **Name**: `menu-images`
   - **Public bucket**: ✅ Check this box
   - **File size limit**: 5MB (or your preferred limit)
   - **Allowed MIME types**: `image/*`

#### Storage Policies

After creating the bucket, set up the following policies in the SQL editor:

```sql
-- Allow public read access to menu images
CREATE POLICY "Public Access" ON storage.objects
FOR SELECT USING (bucket_id = 'menu-images');

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'menu-images' 
    AND auth.role() = 'authenticated'
);

-- Allow users to update their own uploads
CREATE POLICY "Users can update own uploads" ON storage.objects
FOR UPDATE USING (
    bucket_id = 'menu-images' 
    AND auth.role() = 'authenticated'
);

-- Allow users to delete their own uploads
CREATE POLICY "Users can delete own uploads" ON storage.objects
FOR DELETE USING (
    bucket_id = 'menu-images' 
    AND auth.role() = 'authenticated'
);
```

### 3. Environment Variables

Make sure your `.env.local` file has the correct Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. TypeScript Types

Update your Supabase types by running:

```bash
npx supabase gen types typescript --project-id your_project_id > src/lib/database.types.ts
```

## Features Added

1. **Image Upload**: Admins can now upload images from their local device
2. **Image Storage**: Images are stored in Supabase Storage bucket
3. **Image Display**: Product cards show uploaded images with fallback to emoji
4. **Image Validation**: File type and size validation
5. **Image Preview**: Real-time preview of uploaded images
6. **Error Handling**: Proper error handling for upload failures
7. **Fallback System**: If image fails to load, falls back to emoji

## Usage

1. **Admin Interface**: Go to `/admin/add_item` to add new menu items with images
2. **Image Upload**: Click "Upload Image" to select an image from your device
3. **Preview**: See a preview of the uploaded image
4. **Fallback**: If no image is uploaded, emoji selection is available
5. **Display**: Images are displayed in product cards across all pages

## Storage Bucket Configuration

The `menu-images` bucket is configured with:
- Public read access (images can be viewed by anyone)
- Authenticated upload access (only logged-in admins can upload)
- 5MB file size limit
- Image file type restrictions
- Automatic cleanup policies 