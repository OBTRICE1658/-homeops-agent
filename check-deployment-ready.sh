#!/bin/bash

echo "🔍 HomeOps Deployment Readiness Check"
echo "======================================"

# Check if we're on the right branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" = "calendar-rebuild-safe" ]; then
    echo "✅ Branch: calendar-rebuild-safe (correct)"
else
    echo "❌ Branch: $CURRENT_BRANCH (should be calendar-rebuild-safe)"
fi

# Check if files exist
if [ -f "quick-server.js" ]; then
    echo "✅ Server file: quick-server.js exists"
else
    echo "❌ Server file: quick-server.js missing"
fi

if [ -f "package.json" ]; then
    echo "✅ Package file: package.json exists"
else
    echo "❌ Package file: package.json missing"
fi

if [ -f "render.yaml" ]; then
    echo "✅ Config file: render.yaml exists"
else
    echo "❌ Config file: render.yaml missing"
fi

# Check package.json start command
START_CMD=$(grep -o '"start":[^,]*' package.json | cut -d'"' -f4)
if [ "$START_CMD" = "node quick-server.js" ]; then
    echo "✅ Start command: node quick-server.js (correct)"
else
    echo "❌ Start command: $START_CMD (should be 'node quick-server.js')"
fi

# Check render.yaml branch
RENDER_BRANCH=$(grep "branch:" render.yaml | awk '{print $2}')
if [ "$RENDER_BRANCH" = "calendar-rebuild-safe" ]; then
    echo "✅ Render branch: calendar-rebuild-safe (correct)"
else
    echo "❌ Render branch: $RENDER_BRANCH (should be calendar-rebuild-safe)"
fi

# Check if everything is committed
if [ -z "$(git status --porcelain)" ]; then
    echo "✅ Git status: All changes committed"
else
    echo "⚠️  Git status: Uncommitted changes detected"
    echo "   Run: git add . && git commit -m 'Pre-deployment commit'"
fi

# Check if branch is pushed
LOCAL_COMMIT=$(git rev-parse HEAD)
REMOTE_COMMIT=$(git rev-parse origin/calendar-rebuild-safe 2>/dev/null || echo "no-remote")

if [ "$LOCAL_COMMIT" = "$REMOTE_COMMIT" ]; then
    echo "✅ Git sync: Local and remote branches are in sync"
else
    echo "⚠️  Git sync: Local branch needs to be pushed"
    echo "   Run: git push origin calendar-rebuild-safe"
fi

echo ""
echo "🚀 DEPLOYMENT READINESS:"

# Count checks
TOTAL_CHECKS=6
PASSED_CHECKS=0

[ "$CURRENT_BRANCH" = "calendar-rebuild-safe" ] && ((PASSED_CHECKS++))
[ -f "quick-server.js" ] && ((PASSED_CHECKS++))
[ -f "package.json" ] && ((PASSED_CHECKS++))
[ -f "render.yaml" ] && ((PASSED_CHECKS++))
[ "$START_CMD" = "node quick-server.js" ] && ((PASSED_CHECKS++))
[ "$RENDER_BRANCH" = "calendar-rebuild-safe" ] && ((PASSED_CHECKS++))

if [ $PASSED_CHECKS -eq $TOTAL_CHECKS ]; then
    echo "🎉 READY TO DEPLOY! ($PASSED_CHECKS/$TOTAL_CHECKS checks passed)"
    echo ""
    echo "Next steps:"
    echo "1. Go to https://dashboard.render.com"
    echo "2. Follow instructions in DEPLOY_INSTRUCTIONS.md"
    echo "3. Share onboarding URL with friends"
else
    echo "⚠️  NOT READY ($PASSED_CHECKS/$TOTAL_CHECKS checks passed)"
    echo "   Please fix the issues above before deploying"
fi

echo ""
echo "📖 Full instructions: cat DEPLOY_INSTRUCTIONS.md"
