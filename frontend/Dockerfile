FROM node:22-alpine AS builder
ARG NGINX_CONF=nginx.conf
WORKDIR /app
COPY frontend/package.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

FROM nginx:alpine
ARG NGINX_CONF=nginx.conf
COPY --from=builder /app/dist /usr/share/nginx/html
COPY frontend/${NGINX_CONF} /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
