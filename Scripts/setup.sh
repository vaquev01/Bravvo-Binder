#!/bin/bash
# ===================================================
# Bravvo OS - Setup Local
# ===================================================

set -e

echo "🚀 Bravvo OS — Setup Local"
echo "=========================="

# 1. Subir PostgreSQL via Docker
echo "🐳 Subindo PostgreSQL..."
docker-compose up -d

# 2. Instalar dependências
echo "📦 Instalando dependências..."
npm install

# 3. Gerar Prisma Client
echo "🔧 Gerando Prisma Client..."
cd Database
npx prisma generate
npx prisma db push
cd ..

# 4. Seed do banco
echo "🌱 Populando banco com dados de teste..."
cd Database
npx tsx seed.ts
cd ..

echo ""
echo "✅ Setup completo!"
echo "   → Frontend: npm run dev (porta 5173)"
echo "   → Backend:  cd Backend && npm run dev (porta 3001)"
echo "   → DB Studio: cd Database && npx prisma studio"
