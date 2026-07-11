FROM node:22-alpine
WORKDIR /app
COPY backend/dist ./backend/dist
COPY node_modules ./node_modules
EXPOSE 3000
CMD ["node", "backend/dist/index.js"]
