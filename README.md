# CS4770-project1
This repo is for the completion of MTU CS4770's project where the team will be emulating how a weather station works.



To Run the entire System local

## First start the PostgreSQL (Docker)
docker run -d --name temp_db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres_root \
  -e POSTGRES_DB=postgres \
  -v $(pwd)/database/init.sql:/docker-entrypoint-initdb.d/init.sql \
  -p 5432:5432 \
  postgres:15-alpine

## Secondly run the REST API server (port 4000)
cd restAPI

npm install

PORT=4000 DB_HOST=localhost DB_PORT=5432 DB_NAME=temperatures \
DB_USER=api_user DB_PASSWORD=secret \
node index.js

## Thirdly run The trasformer (Port 5000)

cd transformer
pip install flask 

pytest requests
python app.py

## Next make the Sampler (port 3000)

cd sampler

npm install

node server.js

## Lastly run  Java Sensor (Docker)

docker build -t java-docker-demo .

docker run --add-host=host.docker.internal:host-gateway \
  -e SAMPLER_URL=http://host.docker.internal:3000/sample \
  java-docker-demo
