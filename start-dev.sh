#!/bin/bash

# Start development script for YouTrack Frontend
# This script starts both the proxy server and Gatsby development server

echo "🚀 Starting YouTrack Frontend Development Server"
echo "================================================"

# Check if we're in a Python virtual environment (optional for this project)
if [[ "$VIRTUAL_ENV" != "" ]]; then
    echo "✅ Python virtual environment is active: $VIRTUAL_ENV"
else
    echo "ℹ️  No Python virtual environment detected (this is fine for this frontend project)"
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
else
    echo "✅ Dependencies are installed"
fi

echo "🔧 Running type check..."
npm run type-check

if [ $? -eq 0 ]; then
    echo "✅ Type check passed"
    echo "🌟 Starting development servers..."
    echo "🔗 Proxy server: http://localhost:3001"
    echo "📱 Frontend app: http://localhost:8000"
    echo "🔍 GraphiQL explorer: http://localhost:8000/___graphql"
    echo ""
    echo "🚨 CORS SOLUTION: Using proxy server to bypass CORS restrictions"
    echo "💡 The proxy server handles YouTrack API calls to avoid browser CORS issues"
    echo ""
    echo "Press Ctrl+C to stop both servers"
    echo ""
    
    # Start both proxy and development server
    npm run develop
else
    echo "❌ Type check failed. Please fix the errors and try again."
    exit 1
fi
