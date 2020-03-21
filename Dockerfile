FROM node:12-slim

WORKDIR /app

ARG rctf_name
ENV RCTF_NAME=${rctf_name}

RUN groupmod -g 999 node && usermod -u 999 -g 999 node

COPY package.json yarn.lock ./
COPY config ./config

COPY client ./client
COPY public ./public
COPY preact.config.js ./

COPY server ./server
COPY tsconfig.json ./

RUN yarn && yarn build && rm -rf node_modules && yarn cache clean

ENV NODE_ENV production
RUN yarn && yarn cache clean

ENV PORT 8000
EXPOSE 8000

COPY . .


CMD ["node", "dist/server/index.js"]
