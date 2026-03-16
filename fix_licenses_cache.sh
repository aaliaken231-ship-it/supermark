#!/bin/bash

# Script to fix the Vite cache issue with Licenses.tsx
# This clears all Vite caches and rebuilds the project

set -e

echo "=========================================="
echo "Fixing Licenses.tsx Cache Issue"
echo "=========================================="
echo ""

# Define paths
PROJECT_PATH="/vercel/share/v0-next-shadcn"

if [ ! -d "$PROJECT_PATH" ]; then
    echo "Error: Project directory not found at $PROJECT_PATH"
    exit 1
fi

echo "Step 1: Stopping dev server..."
echo "(If running, please stop it manually with Ctrl+C)"
echo ""

echo "Step 2: Removing Vite cache files..."
rm -rf "$PROJECT_PATH/.vite" && echo "✓ Removed .vite directory"
rm -rf "$PROJECT_PATH/node_modules/.vite" && echo "✓ Removed node_modules/.vite"
rm -rf "$PROJECT_PATH/dist" && echo "✓ Removed dist directory"

echo ""
echo "Step 3: Cleaning package cache..."
rm -rf "$PROJECT_PATH/.next" 2>/dev/null || true && echo "✓ Removed .next directory (if exists)"

echo ""
echo "Step 4: Reinstalling dependencies..."
cd "$PROJECT_PATH"
if [ -f "package-lock.json" ]; then
    npm install --force && echo "✓ npm install completed"
elif [ -f "yarn.lock" ]; then
    yarn install --force && echo "✓ yarn install completed"
fi

echo ""
echo "=========================================="
echo "Cache cleared successfully!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Start your dev server: npm run dev (or yarn dev)"
echo "2. Open your browser and test the application"
echo "3. The Licenses page should now work without errors"
echo ""
echo "If issues persist:"
echo "- Check browser console (F12) for errors"
echo "- Try clearing browser cache (Ctrl+Shift+Delete)"
echo "- Try incognito/private mode"
echo ""
