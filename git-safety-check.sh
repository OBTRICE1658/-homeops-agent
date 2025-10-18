#!/bin/bash

echo "🔒 GIT SAFETY CHECK - Preventing Developer Code Override"
echo "=================================================="

# Check current remote
echo "📍 Current Git Remote:"
git remote -v

echo ""
echo "🌿 Current Branch:"
git branch --show-current

echo ""
echo "⚠️  SAFETY VERIFICATION:"

# Check if we're on developer's repo
REMOTE_URL=$(git remote get-url origin 2>/dev/null || echo "No origin set")
if [[ "$REMOTE_URL" == *"OBTRICE1658"* ]]; then
    echo "✅ SAFE: You're on YOUR repository"
else
    echo "🚨 WARNING: You might be on developer's repository!"
    echo "   Remote: $REMOTE_URL"
    echo "   RECOMMENDATION: Use fork or separate directory"
fi

# Check branch name
BRANCH=$(git branch --show-current)
if [[ "$BRANCH" == "main" ]] || [[ "$BRANCH" == "master" ]]; then
    echo "⚠️  CAUTION: You're on main branch"
    echo "   RECOMMENDATION: Create feature branch with your name"
else
    echo "✅ GOOD: You're on feature branch: $BRANCH"
fi

echo ""
echo "🛡️  RECOMMENDED COMMANDS FOR SAFETY:"
echo "git checkout -b ollie-enhanced-$(date +%Y%m%d)"
echo "git remote -v  # Always verify before pushing"
echo "git push origin ollie-enhanced-$(date +%Y%m%d)  # Push to YOUR branch"

echo ""
echo "🚫 NEVER RUN THESE ON DEVELOPER'S REPO:"
echo "git push origin main"
echo "git push origin master" 
echo "git push upstream [anything]"

echo ""
echo "📋 NOTION SYNC REMINDERS:"
echo "1. 📝 Update Notion Change Log with commit details"
echo "2. 🏷️  Tag developer for review: @[developer name]"
echo "3. 🔗 Add commit hash: $(git rev-parse HEAD 2>/dev/null || echo 'No commits yet')"
echo "4. 📸 Add screenshots if UI changes made"
echo "5. 📅 Update status: Draft → Review → Approved"
echo ""
echo "🔗 GITHUB NOTION INTEGRATION:"
echo "Primary (YOUR): https://github.com/OBTRICE1658/-homeops-agent"
echo "Monitor (DEV): https://github.com/wtnelso/-homeops-agent"
echo "PR Template: ollie-enhanced-$(date +%Y%m%d) → main"
