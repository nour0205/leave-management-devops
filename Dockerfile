#frontend build 

FROM node:18 AS frontend-build

WORKDIR /app/frontend

COPY frontend/package*.json ./

RUN npm install

COPY frontend ./

RUN npm run build


#backend build

FROM node:18 AS backend-build

WORKDIR /app    

COPY package*.json ./

RUN npm install

COPY . .


# Copy frontend build to backend's public folder

COPY --from=frontend-build /app/frontend/dist ./public

#prisma generation

COPY .env .

RUN npx prisma generate

ENV PORT=3000

EXPOSE 3000

CMD ["npm", "start"]