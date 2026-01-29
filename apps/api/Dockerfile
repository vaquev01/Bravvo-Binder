FROM node:20-slim

WORKDIR /app

# Copy root package files for workspace resolution
COPY package*.json ./
COPY apps/api/package*.json ./apps/api/

# Install dependencies
RUN npm ci

# Copy api source
COPY apps/api ./apps/api

# Set working directory to api
WORKDIR /app/apps/api

# Expose port
EXPOSE 8080

# Start server
CMD ["node", "src/index.js"]
