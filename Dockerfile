FROM node:alpine AS builder

WORKDIR /app

COPY package.json .
COPY package-lock.json .

RUN npm ci

COPY . .

RUN npm run build

FROM node:alpine

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/build ./build

CMD [ "node", "build/index.js" ]