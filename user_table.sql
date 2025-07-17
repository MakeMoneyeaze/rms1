-- User table with user type support for admin and customer roles
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    user_type VARCHAR(20) NOT NULL DEFAULT 'customer' CHECK (user_type IN ('admin', 'customer')),
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE,
    profile_image_url TEXT,
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'India'
);

-- Index for better query performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_user_type ON users(user_type);
CREATE INDEX idx_users_created_at ON users(created_at);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample admin user
INSERT INTO users (
    email, 
    password_hash, 
    first_name, 
    last_name, 
    user_type, 
    email_verified,
    phone
) VALUES (
    'admin@foodhub.com',
    '$2b$10$your_hashed_password_here', -- Replace with actual hashed password
    'Admin',
    'User',
    'admin',
    true,
    '+91-9876543210'
);

-- Insert sample customer users
INSERT INTO users (
    email, 
    password_hash, 
    first_name, 
    last_name, 
    user_type, 
    email_verified,
    phone,
    address,
    city,
    state,
    postal_code
) VALUES 
(
    'john.doe@example.com',
    '$2b$10$your_hashed_password_here', -- Replace with actual hashed password
    'John',
    'Doe',
    'customer',
    true,
    '+91-9876543211',
    '123 Main Street',
    'Mumbai',
    'Maharashtra',
    '400001'
),
(
    'jane.smith@example.com',
    '$2b$10$your_hashed_password_here', -- Replace with actual hashed password
    'Jane',
    'Smith',
    'customer',
    true,
    '+91-9876543212',
    '456 Park Avenue',
    'Delhi',
    'Delhi',
    '110001'
);

-- Create a view for admin users only
CREATE VIEW admin_users AS
SELECT id, email, first_name, last_name, created_at, last_login
FROM users 
WHERE user_type = 'admin' AND is_active = true;

-- Create a view for customer users only
CREATE VIEW customer_users AS
SELECT id, email, first_name, last_name, phone, address, city, state, created_at, last_login
FROM users 
WHERE user_type = 'customer' AND is_active = true;

-- Function to get user by email and type
CREATE OR REPLACE FUNCTION get_user_by_email_and_type(user_email VARCHAR, user_type_filter VARCHAR)
RETURNS TABLE (
    id UUID,
    email VARCHAR,
    first_name VARCHAR,
    last_name VARCHAR,
    user_type VARCHAR,
    is_active BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT u.id, u.email, u.first_name, u.last_name, u.user_type, u.is_active, u.created_at
    FROM users u
    WHERE u.email = user_email 
    AND u.user_type = user_type_filter
    AND u.is_active = true;
END;
$$ LANGUAGE plpgsql;

-- Example usage:
-- SELECT * FROM get_user_by_email_and_type('admin@foodhub.com', 'admin');
-- SELECT * FROM get_user_by_email_and_type('john.doe@example.com', 'customer'); 