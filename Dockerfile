# Use Node.js LTS
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy ALL source code first (needed for Monorepo workspaces resolution)
COPY . .

# Install dependencies (using install instead of ci to be more lenient with lockfile changes)
RUN npm install

# Build the app (runs build in all workspaces)
RUN npm run build

# Expose port (adjust if needed, but Railway overrides)
EXPOSE 8080

# Start command (Since this is mainly for Web Static or API, we need a generic start)
# For Web, we usually serve the build. For API, we start the server.
# This Dockerfile seems generic. I will default to starting the API or serve web?
# But wait, this Dockerfile is at ROOT. Railway might use it for BOTH services if detected.
# The user wants to deploy WEB now.
# But `CMD ["node", "server.js"]` refers to a file that was moved to `apps/web/server.js`.
# I should update the CMD to be safe, but Railway allows overriding the Start Command in the UI.
# I will set a safe default.

CMD ["npm", "start"]
