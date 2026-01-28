# Bravvo OS - Monorepo

This repository uses a Monorepo architecture managed by NPM Workspaces, ready for scalability and separate deployments.

## Structure

- **`apps/web`**: The Frontend application (React + Vite + Tailwind).
  - Contains the SPA, dashboards, and UI components.
  - **Dev**: `npm run dev -w @bravvo/web`
  - **Build**: `npm run build -w @bravvo/web`

- **`apps/api`**: The Backend API (Node + Express).
  - Foundation for server-side logic and secure integrations.
  - **Dev**: `npm run dev -w @bravvo/api`
  - **Port**: Defaults to 3001 (configurable via `PORT`).

## 🚀 Railway Deployment Guide

This project is configured to deploy as two separate services on Railway: one for the Frontend (Static) and one for the Backend (Node.js).

### 1. Prerequisites
- A Railway account.
- This repository connected to Railway.

### 2. Global Config (Optional but Recommended)
- Set `NPM_CONFIG_PRODUCTION=false` if you run into missing devDependencies issues during strict installs.

### 3. Service: `bravvo-api` (Backend)
Create a new service from the repo and configure:

- **Root Directory**: `apps/api`
- **Build Command**: `npm ci`
- **Start Command**: `npm run start`
- **Networking**: Railway will assign a public URL (e.g., `https://bravvo-api-production.up.railway.app`).
- **Environment Variables**:
  - `PORT`: (Railway injects this automatically)
  - `NODE_ENV`: `production`
  - `ALLOWED_ORIGINS`: Your frontend URL (e.g., `https://bravvo-web-production.up.railway.app`). *Add multiple comma-separated if needed.*
  - `OPENAI_API_KEY`: (If you implement backend proxying later).

*Validation*: Visit the public URL + `/health` (e.g., `.../health`) and expect `{"status":"ok"}`.

### 4. Service: `bravvo-web` (Frontend)
Create a new service from the repo and configure:

- **Root Directory**: `apps/web`
- **Build Command**: `npm ci && npm run build`
- **Output Directory**: `dist`
- **Environment Variables**:
  - `VITE_API_URL`: The public URL of your **bravvo-api** service (e.g., `https://bravvo-api-production.up.railway.app`).

*Validation*: The app should load the Landing Page correctly.

### 5. Troubleshooting
- **CORS Errors**: Check if the `bravvo-web` URL is exactly listed in `ALLOWED_ORIGINS` in the API service.
- **Port Binding**: Ensure `bravvo-api` isn't crashing. It must listen on `0.0.0.0` or `::` (standard Express app.listen(PORT) usually handles this).
- **Modules Not Found**: Ensure you are using `npm ci` in the root directory context or Workspace support is active. If Railway fails to see workspaces, ensure the Root Directory is set correctly for each service.

## Local Development

1.  **Install**: `npm install` (Root)
2.  **Run All**:
    - Term 1: `npm run dev -w @bravvo/api`
    - Term 2: `npm run dev -w @bravvo/web`
3.  **Env**: Copy `.env.example` to `.env` in both `apps/web` and `apps/api` and adjust values.
