-- =============================
-- ALL SQL QUERIES FOR FOODHUB PROJECT
-- =============================

-- ========== customization_crud.sql ==========

-- Customization CRUD Operations for FoodHub Admin

-- =============================================
-- CUSTOMIZATION CATEGORIES CRUD OPERATIONS
-- =============================================

-- 1. CREATE new customization category
-- INSERT INTO customization_categories (name, display_name, description, is_active) 
-- VALUES ('new_category', 'New Category', 'Description for new category', true);

-- 2. READ all customization categories
-- SELECT * FROM customization_categories WHERE is_active = true ORDER BY name;

-- 3. UPDATE customization category
-- UPDATE customization_categories 
-- SET display_name = 'Updated Name', description = 'Updated description', is_active = true 
-- WHERE id = 1;

-- 4. DELETE customization category (soft delete)
-- UPDATE customization_categories SET is_active = false WHERE id = 1;

-- =============================================
-- CUSTOMIZATION OPTIONS CRUD OPERATIONS
-- =============================================

-- 1. CREATE new customization option
-- INSERT INTO customization_options (category_id, name, display_name, price_adjustment, is_default, is_active, sort_order) 
-- VALUES (1, 'new_option', 'New Option', 10.00, false, true, 5);

-- 2. READ options for a specific category
-- SELECT * FROM customization_options 
-- WHERE category_id = 1 AND is_active = true 
-- ORDER BY sort_order;

-- 3. UPDATE customization option
-- UPDATE customization_options 
-- SET display_name = 'Updated Option', price_adjustment = 15.00, is_default = false, sort_order = 3 
-- WHERE id = 1;

-- 4. DELETE customization option (soft delete)
-- UPDATE customization_options SET is_active = false WHERE id = 1;

-- =============================================
-- CATEGORY CUSTOMIZATIONS CRUD OPERATIONS
-- =============================================

-- 1. CREATE new category customization link
-- INSERT INTO category_customizations (menu_category, customization_category_id, is_required, max_selections, sort_order) 
-- VALUES ('Italian', 1, true, 1, 1);

-- 2. READ customizations for a menu category
-- SELECT cc.*, ccat.display_name, ccat.description 
-- FROM category_customizations cc
-- JOIN customization_categories ccat ON cc.customization_category_id = ccat.id
-- WHERE cc.menu_category = 'Italian'
-- ORDER BY cc.sort_order;

-- 3. UPDATE category customization
-- UPDATE category_customizations 
-- SET is_required = false, max_selections = 3, sort_order = 2 
-- WHERE id = 1;

-- 4. DELETE category customization
-- DELETE FROM category_customizations WHERE id = 1;

-- =============================================
-- ADMIN MANAGEMENT VIEWS
-- =============================================

-- View for admin to see all customizations with their options
CREATE OR REPLACE VIEW admin_customization_overview AS
SELECT 
    cc.id as category_customization_id,
    cc.menu_category,
    cc.is_required,
    cc.max_selections,
    cc.sort_order as category_sort_order,
    ccat.id as customization_category_id,
    ccat.name as customization_category_name,
    ccat.display_name as customization_display_name,
    ccat.description as customization_description,
    ccat.is_active as category_active,
    COUNT(co.id) as option_count,
    SUM(CASE WHEN co.is_default THEN 1 ELSE 0 END) as default_options_count
FROM category_customizations cc
JOIN customization_categories ccat ON cc.customization_category_id = ccat.id
LEFT JOIN customization_options co ON ccat.id = co.category_id AND co.is_active = true
GROUP BY cc.id, cc.menu_category, cc.is_required, cc.max_selections, cc.sort_order, 
         ccat.id, ccat.name, ccat.display_name, ccat.description, ccat.is_active;

-- View for admin to see all options with their categories
CREATE OR REPLACE VIEW admin_options_overview AS
SELECT 
    co.id,
    co.name,
    co.display_name,
    co.price_adjustment,
    co.is_default,
    co.is_active,
    co.sort_order,
    co.category_id,
    ccat.name as category_name,
    ccat.display_name as category_display_name,
    ccat.is_active as category_active
FROM customization_options co
JOIN customization_categories ccat ON co.category_id = ccat.id
ORDER BY ccat.name, co.sort_order;

-- =============================================
-- HELPER FUNCTIONS FOR ADMIN
-- =============================================

-- Function to get all customizations for a menu category with options
CREATE OR REPLACE FUNCTION get_customizations_with_options(p_menu_category TEXT)
RETURNS TABLE (
    category_customization_id INTEGER,
    menu_category TEXT,
    is_required BOOLEAN,
    max_selections INTEGER,
    sort_order INTEGER,
    customization_category_id INTEGER,
    customization_category_name TEXT,
    customization_display_name TEXT,
    customization_description TEXT,
    options JSON
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        cc.id,
        cc.menu_category,
        cc.is_required,
        cc.max_selections,
        cc.sort_order,
        ccat.id,
        ccat.name,
        ccat.display_name,
        ccat.description,
        COALESCE(
            (SELECT json_agg(
                json_build_object(
                    'id', co.id,
                    'name', co.name,
                    'display_name', co.display_name,
                    'price_adjustment', co.price_adjustment,
                    'is_default', co.is_default,
                    'is_active', co.is_active,
                    'sort_order', co.sort_order
                ) ORDER BY co.sort_order
            )
            FROM customization_options co 
            WHERE co.category_id = ccat.id AND co.is_active = true
            ), '[]'::json
        ) as options
    FROM category_customizations cc
    JOIN customization_categories ccat ON cc.customization_category_id = ccat.id
    WHERE cc.menu_category = p_menu_category
    ORDER BY cc.sort_order;
END;
$$ LANGUAGE plpgsql;

-- Function to add a new customization option
CREATE OR REPLACE FUNCTION add_customization_option(
    p_category_id INTEGER,
    p_name TEXT,
    p_display_name TEXT,
    p_price_adjustment DECIMAL DEFAULT 0.00,
    p_is_default BOOLEAN DEFAULT false,
    p_sort_order INTEGER DEFAULT 0
)
RETURNS INTEGER AS $$
DECLARE
    new_option_id INTEGER;
BEGIN
    INSERT INTO customization_options (
        category_id, name, display_name, price_adjustment, 
        is_default, is_active, sort_order
    ) VALUES (
        p_category_id, p_name, p_display_name, p_price_adjustment,
        p_is_default, true, p_sort_order
    ) RETURNING id INTO new_option_id;
    
    RETURN new_option_id;
END;
$$ LANGUAGE plpgsql;

-- Function to update a customization option
CREATE OR REPLACE FUNCTION update_customization_option(
    p_option_id INTEGER,
    p_display_name TEXT,
    p_price_adjustment DECIMAL,
    p_is_default BOOLEAN,
    p_sort_order INTEGER
)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE customization_options 
    SET 
        display_name = p_display_name,
        price_adjustment = p_price_adjustment,
        is_default = p_is_default,
        sort_order = p_sort_order,
        updated_at = NOW()
    WHERE id = p_option_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Function to toggle option active status
CREATE OR REPLACE FUNCTION toggle_option_active(p_option_id INTEGER)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE customization_options 
    SET is_active = NOT is_active, updated_at = NOW()
    WHERE id = p_option_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- INDEXES FOR BETTER PERFORMANCE
-- =============================================

-- Indexes for customization_categories
CREATE INDEX IF NOT EXISTS idx_customization_categories_name ON customization_categories(name);
CREATE INDEX IF NOT EXISTS idx_customization_categories_active ON customization_categories(is_active);

-- Indexes for customization_options
CREATE INDEX IF NOT EXISTS idx_customization_options_category_id ON customization_options(category_id);
CREATE INDEX IF NOT EXISTS idx_customization_options_active ON customization_options(is_active);
CREATE INDEX IF NOT EXISTS idx_customization_options_sort_order ON customization_options(sort_order);

-- Indexes for category_customizations
CREATE INDEX IF NOT EXISTS idx_category_customizations_menu_category ON category_customizations(menu_category);
CREATE INDEX IF NOT EXISTS idx_category_customizations_sort_order ON category_customizations(sort_order);

-- =============================================
-- TRIGGERS FOR AUDIT TRAIL
-- =============================================

-- Trigger function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_customization_categories_updated_at 
    BEFORE UPDATE ON customization_categories 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customization_options_updated_at 
    BEFORE UPDATE ON customization_options 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_category_customizations_updated_at 
    BEFORE UPDATE ON category_customizations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========== customization_schema.sql ==========

-- (Paste full contents of customization_schema.sql here)

-- ========== menu_table.sql ==========

-- (Paste full contents of menu_table.sql here)

-- ========== user_table.sql ==========

-- (Paste full contents of user_table.sql here) 