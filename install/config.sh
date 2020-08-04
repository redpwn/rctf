#!/bin/sh

set -e

echo "RCTF_DATABASE_PASSWORD=$(head -c 32 /dev/urandom | base64 -w0)" >> .env

echo "ctfName: rCTF
divisions:
  open: Open
origin: http://127.0.0.1:8000
meta: 
  description: 'A description of your CTF'
  imageUrl: 'https://example.com'
homeContent: 'A description of your CTF. Markdown supported.'
tokenKey: '$(head -c 32 /dev/urandom | base64 -w0)'
startTime: $(date +%s)000
endTime: $(date -d +1week +%s)000" >> conf.d/00-install.yaml

mkdir -p data/rctf-postgres data/rctf-redis

chown -R 999 data
chmod 600 .env

docker-compose build
