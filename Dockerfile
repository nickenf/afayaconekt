# This is a convenience Dockerfile for the entire application
# It builds all services in a single container for simple deployments

FROM node:18-alpine AS base

# Install system dependencies
RUN apk add --no-cache postgresql-client

# Set working directory
WORKDIR /app

# Copy package files for all services
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

# Install dependencies for all services
RUN cd backend && npm ci --only=production && cd ../frontend && npm ci && cd ..

# Copy source code
COPY . .

# Build frontend
RUN cd frontend && npm run build

# Create uploads directory
RUN mkdir -p backend/uploads

# Expose ports
EXPOSE 5000 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD pg_isready -h db -U afyaconnect_user -d afyaconnect || exit 1

# Start script
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

ENTRYPOINT ["docker-entrypoint.sh"]