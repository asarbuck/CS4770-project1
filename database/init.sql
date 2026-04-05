-- Database initialisation script
-- Runs automatically when the PostgreSQL container first starts.

CREATE DATABASE temperatures;

\connect temperatures;

-- Create application user with limited privileges
CREATE USER api_user WITH PASSWORD 'secret';
GRANT CONNECT ON DATABASE temperatures TO api_user;
GRANT USAGE ON SCHEMA public TO api_user;

-- The API creates the table itself on startup via initDB(),
-- but we grant future table permissions here so it works seamlessly.
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO api_user;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO api_user;