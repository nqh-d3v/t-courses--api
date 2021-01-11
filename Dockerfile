FROM node:erbium-slim

WORKDIR /app

COPY package.json .

RUN npm install

COPY . .

CMD ["npm", "start"]
