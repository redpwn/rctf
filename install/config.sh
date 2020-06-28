#!/bin/sh

set -e

echo "RCTF_DATABASE_PASSWORD=$(head -c 32 /dev/urandom | base64 -w0)" >> .env
echo "RCTF_TOKEN_KEY=$(head -c 32 /dev/urandom | base64 -w0)" >> .env

cp -nR .rdeploy.example .rdeploy
cp -nR config/yml.example config/yml

mkdir -p data/rctf-postgres data/rctf-redis

chown -R 999 data
chmod 600 .env

docker-compose build
