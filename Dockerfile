FROM node:18

WORKDIR /app    

COPY package*.json ./

RUN npm install

COPY . .

COPY .env .

RUN npx prisma generate

ENV PORT=3000

EXPOSE 3000

CMD ["npm", "start"]