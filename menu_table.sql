-- Create menu table for FoodHub restaurant management system
-- This table stores all menu items that can be added through the admin interface

CREATE TABLE menu_items (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL CHECK (price > 0),
    image VARCHAR(10) DEFAULT '🍕', -- Emoji or image URL
    category VARCHAR(100) NOT NULL,
    rating DECIMAL(3,2) DEFAULT 4.5 CHECK (rating >= 0 AND rating <= 5),
    popular BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for better performance on category filtering
CREATE INDEX idx_menu_items_category ON menu_items(category);

-- Create index for popular items
CREATE INDEX idx_menu_items_popular ON menu_items(popular) WHERE popular = TRUE;

-- Create index for active items
CREATE INDEX idx_menu_items_active ON menu_items(is_active) WHERE is_active = TRUE;

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_menu_items_updated_at 
    BEFORE UPDATE ON menu_items 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data (optional)
INSERT INTO menu_items (name, description, price, image, category, rating, popular) VALUES
('Margherita Pizza', 'Fresh mozzarella, tomato sauce, and basil', 299.00, '🍕', 'Italian', 4.8, TRUE),
('Chicken Burger', 'Grilled chicken with lettuce, tomato, and special sauce', 199.00, '🍔', 'Burgers', 4.6, TRUE),
('Caesar Salad', 'Fresh romaine lettuce, parmesan cheese, and croutons', 149.00, '🥗', 'Salads', 4.5, FALSE),
('Pasta Carbonara', 'Spaghetti with eggs, cheese, and pancetta', 249.00, '🍝', 'Italian', 4.7, TRUE),
('Chocolate Cake', 'Rich chocolate cake with vanilla ice cream', 129.00, '🍰', 'Desserts', 4.9, FALSE),
('Grilled Salmon', 'Fresh salmon with herbs and lemon butter sauce', 399.00, '🐟', 'Seafood', 4.8, TRUE);

-- Create categories table for better category management
CREATE TABLE menu_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    icon VARCHAR(10) DEFAULT '🍽️',
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default categories
INSERT INTO menu_categories (name, icon, display_order) VALUES
('Italian', '🍕', 1),
('Burgers', '🍔', 2),
('Salads', '🥗', 3),
('Desserts', '🍰', 4),
('Seafood', '🐟', 5),
('Pasta', '🍝', 6),
('Beverages', '🥤', 7),
('Appetizers', '🥨', 8);

-- Add foreign key constraint to menu_items table
ALTER TABLE menu_items 
ADD CONSTRAINT fk_menu_items_category 
FOREIGN KEY (category) REFERENCES menu_categories(name) ON DELETE RESTRICT;

-- Create view for active menu items with category info
CREATE VIEW active_menu_items AS
SELECT 
    mi.id,
    mi.name,
    mi.description,
    mi.price,
    mi.image,
    mi.category,
    mi.rating,
    mi.popular,
    mc.icon as category_icon,
    mi.created_at,
    mi.updated_at
FROM menu_items mi
JOIN menu_categories mc ON mi.category = mc.name
WHERE mi.is_active = TRUE AND mc.is_active = TRUE
ORDER BY mc.display_order, mi.name;

-- Create function to get menu items by category
CREATE OR REPLACE FUNCTION get_menu_items_by_category(category_name VARCHAR(100))
RETURNS TABLE (
    id INTEGER,
    name VARCHAR(255),
    description TEXT,
    price DECIMAL(10,2),
    image VARCHAR(10),
    category VARCHAR(100),
    rating DECIMAL(3,2),
    popular BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        mi.id,
        mi.name,
        mi.description,
        mi.price,
        mi.image,
        mi.category,
        mi.rating,
        mi.popular
    FROM menu_items mi
    WHERE mi.category = category_name AND mi.is_active = TRUE
    ORDER BY mi.popular DESC, mi.name;
END;
$$ LANGUAGE plpgsql;

-- Create function to get popular menu items
CREATE OR REPLACE FUNCTION get_popular_menu_items(limit_count INTEGER DEFAULT 6)
RETURNS TABLE (
    id INTEGER,
    name VARCHAR(255),
    description TEXT,
    price DECIMAL(10,2),
    image VARCHAR(10),
    category VARCHAR(100),
    rating DECIMAL(3,2),
    popular BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        mi.id,
        mi.name,
        mi.description,
        mi.price,
        mi.image,
        mi.category,
        mi.rating,
        mi.popular
    FROM menu_items mi
    WHERE mi.popular = TRUE AND mi.is_active = TRUE
    ORDER BY mi.rating DESC, mi.name
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Example queries for the admin interface:

-- 1. Get all menu items
-- SELECT * FROM active_menu_items ORDER BY category, name;

-- 2. Get menu items by category
-- SELECT * FROM get_menu_items_by_category('Italian');

-- 3. Get popular items
-- SELECT * FROM get_popular_menu_items(6);

-- 4. Add new menu item (example)
-- INSERT INTO menu_items (name, description, price, image, category, rating, popular) 
-- VALUES ('New Pizza', 'Delicious new pizza', 350.00, '🍕', 'Italian', 4.5, FALSE);

-- 5. Update menu item
-- UPDATE menu_items SET price = 320.00, popular = TRUE WHERE id = 1;

-- 6. Soft delete menu item
-- UPDATE menu_items SET is_active = FALSE WHERE id = 1;

-- 7. Get category statistics
-- SELECT 
--     category,
--     COUNT(*) as item_count,
--     AVG(price) as avg_price,
--     AVG(rating) as avg_rating
-- FROM menu_items 
-- WHERE is_active = TRUE 
-- GROUP BY category 
-- ORDER BY item_count DESC; 