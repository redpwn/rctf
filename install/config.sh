cp .env.example .env
cp -r .rdeploy.example .rdeploy
cp config/client.js.example config/client.js

mkdir -p data
mkdir -p data/rctf-postgres
mkdir -p data/rctf-redis

chown -R 999 data

docker-compose run rctf yarn migrate up
