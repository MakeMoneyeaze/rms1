-- Customization Schema for FoodHub

-- Table for customization categories (e.g., Spice Level, Toppings, etc.)
CREATE TABLE IF NOT EXISTS customization_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Table for customization options (e.g., Mild, Medium, Hot for Spice Level)
CREATE TABLE IF NOT EXISTS customization_options (
    id SERIAL PRIMARY KEY,
    category_id INTEGER REFERENCES customization_categories(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    price_adjustment DECIMAL(10,2) DEFAULT 0.00,
    is_default BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Table linking menu categories to customization categories
CREATE TABLE IF NOT EXISTS category_customizations (
    id SERIAL PRIMARY KEY,
    menu_category VARCHAR(100) NOT NULL,
    customization_category_id INTEGER REFERENCES customization_categories(id) ON DELETE CASCADE,
    is_required BOOLEAN DEFAULT false,
    max_selections INTEGER DEFAULT 1,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(menu_category, customization_category_id)
);

-- Insert default customization categories
INSERT INTO customization_categories (name, display_name, description) VALUES
('spice_level', 'Spice Level', 'Choose your preferred spice level'),
('toppings', 'Extra Toppings', 'Add extra toppings to your order'),
('size', 'Size', 'Choose your preferred size'),
('cooking_preference', 'Cooking Preference', 'How would you like your food cooked?'),
('sauce', 'Sauce Selection', 'Choose your preferred sauce'),
('cheese', 'Cheese Type', 'Select your preferred cheese'),
('crust', 'Crust Type', 'Choose your preferred crust type'),
('dressing', 'Dressing', 'Select your preferred dressing'),
('ice_cream_flavor', 'Ice Cream Flavor', 'Choose your ice cream flavor'),
('beverage_type', 'Beverage Type', 'Select your beverage type');

-- Insert default customization options
INSERT INTO customization_options (category_id, name, display_name, price_adjustment, is_default, sort_order) VALUES
-- Spice Level Options
(1, 'mild', 'Mild', 0.00, true, 1),
(1, 'medium', 'Medium', 0.00, false, 2),
(1, 'hot', 'Hot', 0.00, false, 3),
(1, 'extra_hot', 'Extra Hot', 0.00, false, 4),

-- Toppings Options
(2, 'extra_cheese', 'Extra Cheese', 20.00, false, 1),
(2, 'mushrooms', 'Mushrooms', 20.00, false, 2),
(2, 'bell_peppers', 'Bell Peppers', 20.00, false, 3),
(2, 'olives', 'Olives', 20.00, false, 4),
(2, 'jalapenos', 'Jalapeños', 20.00, false, 5),
(2, 'bacon', 'Bacon', 30.00, false, 6),
(2, 'chicken', 'Chicken', 40.00, false, 7),
(2, 'pepperoni', 'Pepperoni', 30.00, false, 8),

-- Size Options
(3, 'small', 'Small', -50.00, false, 1),
(3, 'medium', 'Medium', 0.00, true, 2),
(3, 'large', 'Large', 50.00, false, 3),
(3, 'extra_large', 'Extra Large', 100.00, false, 4),

-- Cooking Preference Options
(4, 'rare', 'Rare', 0.00, false, 1),
(4, 'medium_rare', 'Medium Rare', 0.00, true, 2),
(4, 'medium', 'Medium', 0.00, false, 3),
(4, 'well_done', 'Well Done', 0.00, false, 4),

-- Sauce Options
(5, 'tomato', 'Tomato Sauce', 0.00, true, 1),
(5, 'white', 'White Sauce', 0.00, false, 2),
(5, 'pesto', 'Pesto', 0.00, false, 3),
(5, 'bbq', 'BBQ Sauce', 0.00, false, 4),

-- Cheese Options
(6, 'mozzarella', 'Mozzarella', 0.00, true, 1),
(6, 'cheddar', 'Cheddar', 0.00, false, 2),
(6, 'parmesan', 'Parmesan', 10.00, false, 3),
(6, 'blue_cheese', 'Blue Cheese', 15.00, false, 4),

-- Crust Options
(7, 'thin', 'Thin Crust', 0.00, true, 1),
(7, 'thick', 'Thick Crust', 0.00, false, 2),
(7, 'stuffed', 'Stuffed Crust', 30.00, false, 3),
(7, 'gluten_free', 'Gluten Free', 20.00, false, 4),

-- Dressing Options
(8, 'ranch', 'Ranch', 0.00, true, 1),
(8, 'caesar', 'Caesar', 0.00, false, 2),
(8, 'italian', 'Italian', 0.00, false, 3),
(8, 'balsamic', 'Balsamic', 0.00, false, 4),

-- Ice Cream Flavor Options
(9, 'vanilla', 'Vanilla', 0.00, true, 1),
(9, 'chocolate', 'Chocolate', 0.00, false, 2),
(9, 'strawberry', 'Strawberry', 0.00, false, 3),
(9, 'mint_chocolate', 'Mint Chocolate', 0.00, false, 4),

-- Beverage Type Options
(10, 'hot', 'Hot', 0.00, true, 1),
(10, 'cold', 'Cold', 0.00, false, 2),
(10, 'frozen', 'Frozen', 10.00, false, 3);

-- Link categories to customization categories
INSERT INTO category_customizations (menu_category, customization_category_id, is_required, max_selections, sort_order) VALUES
-- Italian (Pizza, Pasta)
('Italian', 1, true, 1, 1),   -- Spice Level
('Italian', 2, false, 5, 2),   -- Toppings
('Italian', 3, true, 1, 3),    -- Size
('Italian', 5, true, 1, 4),    -- Sauce
('Italian', 6, true, 1, 5),    -- Cheese
('Italian', 7, true, 1, 6),    -- Crust

-- Burgers
('Burgers', 1, true, 1, 1),    -- Spice Level
('Burgers', 2, false, 3, 2),   -- Toppings
('Burgers', 3, true, 1, 3),    -- Size
('Burgers', 4, true, 1, 4),    -- Cooking Preference

-- Salads
('Salads', 1, true, 1, 1),     -- Spice Level
('Salads', 2, false, 3, 2),    -- Toppings
('Salads', 3, true, 1, 3),     -- Size
('Salads', 8, true, 1, 4),     -- Dressing

-- Desserts
('Desserts', 9, true, 1, 1),   -- Ice Cream Flavor
('Desserts', 3, true, 1, 2),   -- Size

-- Seafood
('Seafood', 1, true, 1, 1),    -- Spice Level
('Seafood', 4, true, 1, 2),    -- Cooking Preference
('Seafood', 3, true, 1, 3),    -- Size

-- Beverages
('Beverages', 10, true, 1, 1), -- Beverage Type
('Beverages', 3, true, 1, 2);  -- Size

-- Create indexes for better performance
CREATE INDEX idx_customization_options_category_id ON customization_options(category_id);
CREATE INDEX idx_category_customizations_menu_category ON category_customizations(menu_category);
CREATE INDEX idx_category_customizations_customization_category_id ON category_customizations(customization_category_id); 