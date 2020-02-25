FROM node:12-slim

WORKDIR /app

ARG rctf_name
ENV RCTF_NAME=${rctf_name}

RUN groupmod -g 999 node && usermod -u 999 -g 999 node

COPY package.json yarn.lock ./
RUN yarn

COPY client ./client
COPY config ./config
COPY public ./public
COPY preact.config.js .
RUN yarn build && rm -r node_modules

ENV NODE_ENV production
RUN yarn

ENV PORT 8000
EXPOSE 8000

COPY . .


CMD ["node", "index.js"]
