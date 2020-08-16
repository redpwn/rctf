FROM alpine AS prepare
WORKDIR /app

COPY packages ./packages
COPY package.json yarn.lock lerna.json /prepared/

RUN find packages -maxdepth 2 -mindepth 2 -name package.json -exec dirname /prepared/'{}' ';' | xargs mkdir -p
RUN find packages -maxdepth 2 -mindepth 2 -name package.json -exec cp '{}' /prepared/'{}' ';'

FROM node:12.18.3-buster-slim AS build
WORKDIR /app

COPY --from=prepare /prepared ./
RUN yarn install --frozen-lockfile && yarn cache clean

COPY . .
RUN yarn packall

RUN mkdir /packages
RUN cp packages/*/*.tgz /packages

RUN yarn node scripts/makeDockerPackageJson.js /packages /package.json

FROM node:12.18.3-buster-slim AS run
WORKDIR /app

COPY --from=build /package.json /app/yarn.lock ./
COPY --from=build /packages /packages/

ENV NODE_ENV production
RUN yarn install --prod --pure-lockfile && yarn cache clean

ENV RCTF_CONF_PATH /app/rctf.d

CMD ["node", "--enable-source-maps", "--unhandled-rejections=strict", "/app/node_modules/.bin/rctf"]
