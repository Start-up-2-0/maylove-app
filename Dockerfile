FROM node:20-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ARG VITE_API_BASE_URL
ARG VITE_AUTH_TOKEN_HEADER=x-maylove-token
ARG VITE_STORAGE_UPLOAD_URL

ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_AUTH_TOKEN_HEADER=$VITE_AUTH_TOKEN_HEADER
ENV VITE_STORAGE_UPLOAD_URL=$VITE_STORAGE_UPLOAD_URL

RUN npm run build

FROM nginx:alpine

RUN apk add --no-cache gettext

COPY docker/nginx.conf.template /etc/nginx/templates/default.conf.template
COPY docker/entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

COPY --from=build /app/dist /usr/share/nginx/html

ENV PORT=8080
ENV MAYLOVE_API_ORIGIN=http://maylove-api.railway.internal:8080
EXPOSE 8080

ENTRYPOINT ["/docker-entrypoint.sh"]
