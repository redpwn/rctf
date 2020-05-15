FROM node:12.16.3-buster-slim AS build
WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn

COPY . .
RUN yarn build

FROM node:12.16.3-buster-slim AS run
WORKDIR /app

COPY --from=build /app/dist /app/dist
COPY --from=build /app/yarn.lock /app/package.json /app/

ENV NODE_ENV production
RUN yarn

CMD ["node", "/app/dist/server/index.js"]
