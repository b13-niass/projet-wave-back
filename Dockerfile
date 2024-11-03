FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 8140:8140

CMD ["sh", "-c", "npx prisma generate && npm start"]

