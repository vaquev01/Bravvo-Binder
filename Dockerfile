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
COPY --from=builder /app/apps/web/package.json ./package.json

# Install only production dependencies for serving
RUN npm install --omit=dev express serve

# Expose port
EXPOSE 8080
ENV PORT=8080

# Start server
CMD ["node", "server.js"]
