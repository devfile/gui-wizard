# Multi-stage build for production

# Stage 1: Build the application
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Serve with nginx
FROM nginx:alpine

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Create nginx cache directories with world-writable permissions for OpenShift
# OpenShift will assign a random UID, so we make directories writable by any user
RUN mkdir -p /var/cache/nginx/client_temp \
    && mkdir -p /var/cache/nginx/proxy_temp \
    && mkdir -p /var/cache/nginx/fastcgi_temp \
    && mkdir -p /var/cache/nginx/uwsgi_temp \
    && mkdir -p /var/cache/nginx/scgi_temp \
    && chmod -R 777 /var/cache/nginx \
    && chmod -R 777 /var/log/nginx \
    && chmod -R 755 /etc/nginx/conf.d \
    && chmod -R 755 /usr/share/nginx/html \
    && touch /var/run/nginx.pid \
    && chmod 777 /var/run/nginx.pid

# Don't set USER - let OpenShift assign the UID
# OpenShift will enforce runAsNonRoot via security context

# Expose port 8080 (non-root)
EXPOSE 8080

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
