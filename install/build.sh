#!/bin/sh

mkdir -p build
cp _headers _redirects build
sed -e "s/{{git_commit}}/$(git rev-parse HEAD)/" install.sh > build/install.sh
