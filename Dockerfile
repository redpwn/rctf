FROM node:12-slim

WORKDIR /app

ARG rctf_name
ENV RCTF_NAME=${rctf_name}

COPY package.json yarn.lock ./
RUN yarn
COPY . .
RUN yarn build && rm -r node_modules

ENV NODE_ENV production
ENV PORT 8000
RUN yarn

EXPOSE 8000

CMD ["node", "index.js"]
