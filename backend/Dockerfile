FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY backend/tsconfig.json ./backend/
COPY backend/src ./backend/src
RUN npm run build

FROM node:22-alpine
WORKDIR /app
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3000
CMD ["node", "backend/dist/index.js"]
