FROM node:20-slim

WORKDIR /app

# Copy root package files for workspace resolution
COPY package*.json ./
COPY apps/web/package*.json ./apps/web/

# Install dependencies
RUN npm ci

# Copy web app source
COPY apps/web ./apps/web

# Build the application
WORKDIR /app/apps/web
RUN npm run build

# Expose port
EXPOSE 8080

# Start server
CMD ["node", "server.js"]
