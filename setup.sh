#!/bin/bash

# NIMESTREAM Setup Script
# Gunakan: chmod +x setup.sh && ./setup.sh

echo "========================================="
echo "  🎬 NIMESTREAM v2.0 Setup"
echo "========================================="
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js tidak terinstal. Silakan install Node.js terlebih dahulu."
    echo "   Download dari: https://nodejs.org"
    exit 1
fi

echo "✅ Node.js v$(node --version) terdeteksi"
echo "✅ npm v$(npm --version) terdeteksi"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Gagal install dependencies"
    exit 1
fi

echo "✅ Dependencies installed"
echo ""

# Create .env if not exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env 2>/dev/null || cat > .env << 'EOF'
PORT=3000
NODE_ENV=development

# API Configuration
API_BASE=http://localhost:3000/api

# Firebase Configuration
# Dapatkan dari Firebase Console
FIREBASE_API_KEY=
FIREBASE_AUTH_DOMAIN=
FIREBASE_PROJECT_ID=
FIREBASE_STORAGE_BUCKET=
FIREBASE_MESSAGING_SENDER_ID=
FIREBASE_APP_ID=

# Features
ENABLE_COMMENTS=true
ENABLE_FAVORITES=true
ENABLE_WATCHLIST=true
EOF
    echo "✅ .env file created (silakan update dengan Firebase credentials)"
else
    echo "✅ .env file sudah ada"
fi

echo ""
echo "========================================="
echo "  ✨ Setup Selesai!"
echo "========================================="
echo ""
echo "Next steps:"
echo "1. Update .env dengan Firebase credentials Anda"
echo "2. Jalankan: npm start (production) atau npm run dev (development)"
echo "3. Buka: http://localhost:3000"
echo ""
echo "Dokumentasi lengkap ada di README.md"
echo ""
