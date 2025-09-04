-- database/init.sql

-- Connect to the specified database (defined by POSTGRES_DB in .env, e.g., 'mydatabase')
-- \connect mydatabase; -- This command might not work directly in all Docker entrypoints,
                    -- but the user is already set up to connect to the DB.

-- Create a table for users
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert some initial data into the users table
INSERT INTO users (username, email, password_hash) VALUES
    ('admin', 'admin@example.com', 'hashed_admin_password_123'), -- Replace with actual hashed passwords in production
    ('john.doe', 'john.doe@example.com', 'hashed_john_password_456')
ON CONFLICT (username) DO NOTHING; -- Avoid inserting duplicates on subsequent runs

-- Create an index on the email column for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);

-- Optional: Create a table for products (as an example of another entity)
-- CREATE TABLE IF NOT EXISTS products (
--    product_id SERIAL PRIMARY KEY,
--    name VARCHAR(255) NOT NULL,
--    description TEXT,
--    price DECIMAL(10, 2) NOT NULL,
--    stock_quantity INT NOT NULL DEFAULT 0,
--    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
-- );

-- Optional: Insert some initial product data
-- INSERT INTO products (name, description, price, stock_quantity) VALUES
--    ('Laptop', 'High performance laptop', 1200.00, 50),
--    ('Mouse', 'Wireless ergonomic mouse', 25.50, 200)
-- ON CONFLICT (product_id) DO NOTHING;
