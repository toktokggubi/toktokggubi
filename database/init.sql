-- database/init.sql

-- Connect to the specified database (defined by POSTGRES_DB in .env, e.g., 'mydatabase')
-- \connect mydatabase; -- This command might not work directly in all Docker entrypoints,
                    -- but the user is already set up to connect to the DB.

-- Create a table for users
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    user_id VARCHAR(50) NOT NULL UNIQUE
);

-- Create an index on the user_id column for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_user_id ON users (user_id);

-- Insert initial user data based on available CSV files for testing
INSERT INTO users (username, user_id) VALUES
   ('kwonjaheun', 'kwonjaheun'),
   ('yang', 'yang'),
   ('lee', 'lee')
ON CONFLICT (user_id) DO NOTHING;
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
