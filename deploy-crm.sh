#!/bin/bash

# Deploy CRM Demo to Netlify
echo "🚀 Preparing CRM Demo for Netlify deployment..."

# Check if netlify CLI is installed
if ! command -v netlify &> /dev/null; then
    echo "❌ Netlify CLI not found. Installing..."
    npm install -g netlify-cli
fi

# Login to Netlify (if not already logged in)
echo "🔐 Checking Netlify authentication..."
netlify status || netlify login

# Deploy the site
echo "📤 Deploying to Netlify..."
netlify deploy --prod --dir=.

echo "✅ Deployment complete!"
echo ""
echo "📋 Next steps:"
echo "1. Copy the Live URL from the output above"
echo "2. In Notion, create an embed block: /embed"
echo "3. Paste the URL and adjust the height to ~800px"
echo "4. Your CRM demo is now embedded in Notion!"
