#!/bin/bash

echo "🚀 Deploying HomeOps to Render..."

# Check if we're on the correct branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "calendar-rebuild-safe" ]; then
    echo "❌ You're not on the calendar-rebuild-safe branch. Please switch to it first."
    echo "   git checkout calendar-rebuild-safe"
    exit 1
fi

# Check if there are uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    echo "📝 Committing recent changes..."
    git add .
    git commit -m "🚀 Deploy HomeOps with calendar navigation and dashboard fixes"
fi

# Push to GitHub (this will trigger Render deployment)
echo "📤 Pushing to GitHub..."
git push origin calendar-rebuild-safe

echo "✅ Deployment triggered!"
echo "🌐 Your app will be available at: https://homeops-backend.onrender.com"
echo "📱 Mobile app: https://homeops-backend.onrender.com/app"
echo "📊 Monitor deployment at: https://dashboard.render.com"
echo ""
echo "⚠️  Don't forget to set up your environment variables in Render dashboard:"
echo "   - OPENAI_API_KEY"
echo "   - GMAIL_CLIENT_ID"
echo "   - GMAIL_CLIENT_SECRET"
echo "   - GOOGLE_CLIENT_ID"
echo "   - GOOGLE_CLIENT_SECRET"
echo "   - FIREBASE_PRIVATE_KEY"
echo "   - FIREBASE_CLIENT_EMAIL"
echo "   - FIREBASE_PROJECT_ID (already set to: homeops-web)" 
echo "   - FIREBASE_PROJECT_ID"
echo "   - FIREBASE_STORAGE_BUCKET"
echo "   - FIREBASE_MESSAGING_SENDER_ID"
echo "   - FIREBASE_APP_ID"
echo "   - FIREBASE_MEASUREMENT_ID"
echo "   - FIREBASE_PRIVATE_KEY"
echo "   - FIREBASE_CLIENT_EMAIL"
echo "   - OPENAI_API_KEY"
echo "   - GMAIL_CLIENT_ID"
echo "   - GMAIL_CLIENT_SECRET" 