FROM node:22

WORKDIR /app

COPY package*.json ./
RUN npm install
COPY docker.env .env
COPY . .
RUN npm run build

EXPOSE 3002

CMD ["npm", "start"]
