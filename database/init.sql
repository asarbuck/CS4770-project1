-- Database initialisation script
-- Runs automatically when the PostgreSQL container first starts.

CREATE DATABASE temperatures;

\connect temperatures;

-- Create application user with limited privileges
CREATE USER api_user WITH PASSWORD 'secret';
GRANT CONNECT ON DATABASE temperatures TO api_user;
GRANT USAGE ON SCHEMA public TO api_user;

-- Create the table as superuser so api_user does not need CREATE privilege
CREATE TABLE IF NOT EXISTS temperature_readings (
  id          SERIAL PRIMARY KEY,
  temperature NUMERIC(6, 2) NOT NULL,
  timestamp   TIMESTAMPTZ   NOT NULL
);

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE temperature_readings TO api_user;
GRANT USAGE, SELECT ON SEQUENCE temperature_readings_id_seq TO api_user;