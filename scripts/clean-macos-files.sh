#!/bin/bash

echo "🧹 Cleaning macOS metadata files from server..."

APP="${1:-abc-8bad}"

# Remove all ._ files from /data/images
echo "Removing ._ files..."
flyctl ssh console -a "$APP" -C "find /data/images -name '._*' -type f -delete" 2>/dev/null

# Also remove .DS_Store files if any
echo "Removing .DS_Store files..."
flyctl ssh console -a "$APP" -C "find /data/images -name '.DS_Store' -type f -delete" 2>/dev/null

echo "✅ Cleanup complete!"

# Show current structure
echo ""
echo "📁 Current directory structure:"
flyctl ssh console -a "$APP" -C "ls -la /data/images/" 2>/dev/null | head -20