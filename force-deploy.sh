#!/bin/bash

echo "🔄 FORCE DEPLOY TO RENDER"
echo "========================="

# Add a timestamp to force a new deployment
TIMESTAMP=$(date +%s)
echo "⏰ Adding deployment timestamp: $TIMESTAMP"

# Create a simple deployment marker
echo "DEPLOYMENT_TIMESTAMP=$TIMESTAMP" > DEPLOY_TIMESTAMP.txt
echo "BRANCH=enhanced-chat-overlay-restored" >> DEPLOY_TIMESTAMP.txt
echo "HOMEOPS_AGENT=enabled" >> DEPLOY_TIMESTAMP.txt
echo "AGENT_INTERFACE=live" >> DEPLOY_TIMESTAMP.txt

# Commit the change
git add DEPLOY_TIMESTAMP.txt
git commit -m "🚀 HOMEOPS AGENT LIVE: $TIMESTAMP - Agent interface deployed"

# Push to trigger deployment
git push origin enhanced-chat-overlay-restored

echo ""
echo "✅ Force deployment triggered!"
echo "🕐 Wait 2-3 minutes for Render to rebuild"
echo ""
echo "🎯 TEST ONBOARDING FLOW:"
echo "   1. https://homeops-backend.onrender.com/ (should redirect to onboarding)"
echo "   2. https://homeops-backend.onrender.com/onboard (direct onboarding page)"
echo "   3. After OAuth: https://homeops-backend.onrender.com/app"
echo ""
echo "🔍 DEBUG URLs:"
echo "   • Health: https://homeops-backend.onrender.com/api/test"
echo "   • Status: https://homeops-backend.onrender.com/api/status"
