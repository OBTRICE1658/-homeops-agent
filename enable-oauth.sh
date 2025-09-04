#!/bin/bash
echo "🔄 Re-enabling HomeOps OAuth..."
echo ""

# Kill the disabled server
pkill -f "server-disabled" 2>/dev/null || true

# Start the normal server
echo "✅ Starting normal HomeOps server with OAuth enabled..."
node server-v2.js

echo "🔄 HomeOps OAuth re-enabled"
