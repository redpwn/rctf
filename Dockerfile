FROM node:14.8.0-buster-slim AS prepare
WORKDIR /app

COPY packages ./packages
COPY package.json yarn.lock lerna.json /prepared/

RUN find packages -maxdepth 2 -mindepth 2 -name package.json -exec dirname /prepared/'{}' ';' | xargs mkdir -p && \
    find packages -maxdepth 2 -mindepth 2 -name package.json -exec cp '{}' /prepared/'{}' ';'

FROM node:14.8.0-buster-slim AS build
WORKDIR /build

COPY --from=prepare /prepared ./
RUN yarn install --frozen-lockfile

COPY . .

RUN yarn packall && \
    mkdir -p /app/packages && \
    cp packages/*/*.tgz /app/packages && \
    cp yarn.lock /app && \
    yarn node scripts/make-docker-package-json.js /app/packages /app/package.json && \
    cd /app && \
    yarn install --prod --pure-lockfile

FROM node:14.8.0-buster-slim AS run
WORKDIR /app

COPY --from=build /app/node_modules /app/node_modules
ENV NODE_ENV production

ENV RCTF_CONF_PATH /app/rctf.d
VOLUME /app/rctf.d
ENV PORT 80
EXPOSE 80
CMD ["node", "--enable-source-maps", "--unhandled-rejections=strict", "/app/node_modules/.bin/rctf"]
