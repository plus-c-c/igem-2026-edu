FROM node:22-alpine AS backend-builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY tsconfig.json ./
COPY backend/ ./backend/
RUN npm run build

FROM node:22-alpine AS frontend-builder
WORKDIR /app
COPY frontend/package*.json ./frontend/
RUN npm ci --prefix frontend
COPY frontend/ ./frontend/
RUN npm run build --prefix frontend

FROM node:22-alpine
WORKDIR /app
COPY --from=backend-builder /app/backend/dist ./backend/dist
COPY --from=backend-builder /app/node_modules ./node_modules
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist
RUN mkdir -p /app/uploads
EXPOSE 3000
ENV NODE_ENV=production
CMD ["node", "backend/dist/index.js"]
