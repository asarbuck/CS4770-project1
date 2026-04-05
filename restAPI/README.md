
How to run 

Start the Database
docker run -d --name temp_db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres_root \
  -e POSTGRES_DB=postgres \
  -v $(pwd)/../database/init.sql:/docker-entrypoint-initdb.d/init.sql \
  -p 5432:5432 \
  postgres:15-alpine

Start the API:
    npm install
    node index.js

Run Tests:
    npm test

Endpoints

POST /temperature
stores new temp reading

{
  "temperature": 24.5,
  "timestamp": "2026-03-10T14:20:00Z"
}

Response:
{
  "status": "stored",
  "id": 104
}

If missing Fields or database error

{
  "error": "temperature and timestamp are required"
}

{
  "error": "Database error"
}

GET /temperature/id
retrieve a single reading by its ID.
Response:
{
  "id": 104,
  "temperature": "24.50",
  "timestamp": "2026-03-10T14:20:00.000Z"
}

If id not found
{
  "error": "Not found"
}

DataBase Schema
CREATE TABLE temperature_readings (
  id          SERIAL PRIMARY KEY,
  temperature NUMERIC(6, 2) NOT NULL,
  timestamp   TIMESTAMPTZ   NOT NULL
);

