FROM node:10

RUN mkdir /app
WORKDIR /app

COPY package.json ./
COPY yarn.lock ./

ENV NODE_ENV production
RUN yarn --production

COPY . .

USER node

CMD ["node", "index.js"]
