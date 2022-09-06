FROM node

WORKDIR /app

COPY package.json .
COPY package-lock.json .

RUN npm ci

COPY . .

RUN npm run build

RUN rm -rf src package-lock.json tsconfig.json README.md

CMD [ "npm", "start" ]