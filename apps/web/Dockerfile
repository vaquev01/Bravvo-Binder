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

# Set environment variable for production
ENV NODE_ENV=production

# Expose port (Railway will set PORT env var)
EXPOSE 8080

# Start server with explicit port binding
CMD ["sh", "-c", "PORT=${PORT:-8080} node server.js"]
