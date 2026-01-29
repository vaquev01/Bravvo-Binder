# Stage 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

# Copy root package files FIRST
COPY package.json package-lock.json ./

# Copy ALL workspace package.json files (critical for monorepo)
COPY apps/web/package.json ./apps/web/
COPY apps/api/package.json ./apps/api/
COPY packages/shared/package.json ./packages/shared/

# Install ALL dependencies (workspaces included)
RUN npm ci

# Copy ALL source code
COPY . .

# Build the web app
RUN npm run build -w @bravvo/web

# Stage 2: Production
FROM node:18-alpine AS runner

WORKDIR /app

# Copy built assets and server
COPY --from=builder /app/apps/web/dist ./dist
COPY --from=builder /app/apps/web/server.js ./server.js

# Install express
RUN npm init -y && npm install express@4

# Create startup script for debugging
RUN echo '#!/bin/sh' > /app/start.sh && \
    echo 'echo "=== CONTAINER STARTING ===" ' >> /app/start.sh && \
    echo 'echo "PWD: $(pwd)"' >> /app/start.sh && \
    echo 'echo "PORT: $PORT"' >> /app/start.sh && \
    echo 'echo "Files in /app:"' >> /app/start.sh && \
    echo 'ls -la /app' >> /app/start.sh && \
    echo 'echo "=== Starting Node ===" ' >> /app/start.sh && \
    echo 'exec node server.js' >> /app/start.sh && \
    chmod +x /app/start.sh

# Expose port
EXPOSE 8080

# Use shell script as entrypoint
CMD ["/bin/sh", "/app/start.sh"]
