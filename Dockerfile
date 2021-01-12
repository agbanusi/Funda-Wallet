FROM node:10.15.0-alphine

WORKDIR /app

COPY ./package.json .
COPY ./package-lock.json .

RUN npm install

COPY . .

EXPOSE 5000

RUN npm run build

