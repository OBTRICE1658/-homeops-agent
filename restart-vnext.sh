#!/bin/bash
echo "🔄 Restarting HomeOps vNext Server..."

# Kill existing processes
pkill -f "node quick-server.js" || echo "No existing process found"
pkill -f "node.*quick-server" || echo "No existing process found"

# Wait a moment
sleep 2

# Start fresh
echo "🚀 Starting fresh server..."
node quick-server.js
