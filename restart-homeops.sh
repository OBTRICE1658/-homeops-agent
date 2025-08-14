#!/bin/bash

echo "🔄 Restarting HomeOps Server..."

# Kill existing server
echo "Stopping existing server..."
pkill -f "node.*quick-server.js"
sleep 2

# Start new server
echo "Starting fresh server..."
cd /Users/oliverbaron/-homeops-agent
node quick-server.js &

echo "✅ HomeOps Server restarted!"
echo "🎯 Your command center: http://localhost:3000/command-center"
echo "📱 Onboarding flow: http://localhost:3000/signup"
