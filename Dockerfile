FROM node:12.16.3-buster-slim AS build
WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile && yarn cache clean

COPY . .
RUN yarn build

FROM node:12.16.3-buster-slim AS run
WORKDIR /app

COPY --from=build /app/yarn.lock /app/package.json /app/

ENV NODE_ENV production
RUN yarn install --prod --frozen-lockfile && yarn cache clean

COPY --from=build /app/dist /app/dist

CMD ["node", "/app/dist/server/index.js"]
