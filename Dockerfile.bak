# Simple Single-Stage Dockerfile to avoid build issues
FROM node:20-slim

WORKDIR /app

# Copy entire repository
COPY . .

# Install all dependencies (including dev deps for building)
RUN npm ci

# Build the web application
RUN npm run build -w @bravvo/web

# Prune dev dependencies to save space (optional, but good practice)
# Keeping simple for now - skip pruning to ensure everything is there

# Expose port (Railway will override)
EXPOSE 8080

# Start the server
CMD ["node", "apps/web/server.js"]
