#!/bin/bash

while ! curl -s $RCTF_DATABASE_URL > /dev/null
do
  echo "$(date) - waiting for postgres at $RCTF_DATABASE_URL"
  sleep 1
done
echo "$(date) - connected to postgres"

yarn migrate up