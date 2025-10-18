#!/bin/bash

# 🔄 NOTION QUICK SETUP - Developer Alignment System

echo "🎯 SETTING UP NOTION ALIGNMENT SYSTEM"
echo "======================================"

# Check if we're in a git repo
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "❌ Not in a git repository"
    exit 1
fi

# Get current context
BRANCH=$(git branch --show-current)
COMMIT=$(git rev-parse HEAD 2>/dev/null || echo "No commits")
REPO_URL=$(git remote get-url origin 2>/dev/null || echo "No origin")

echo "📍 CURRENT CONTEXT:"
echo "Repository: $REPO_URL"
echo "Branch: $BRANCH"
echo "Latest Commit: $COMMIT"
echo ""

echo "📋 NOTION SETUP CHECKLIST:"
echo "[ ] 1. Create 'HomeOps Development Hub' workspace in Notion"
echo "[ ] 2. Add 'Change Log' database with properties:"
echo "       - Change Title (Title)"
echo "       - Date (Date)" 
echo "       - Status (Select: Draft/Review/Approved/Merged)"
echo "       - Impact Level (Select: Low/Medium/High/Critical)"
echo "       - Files Modified (Multi-select)"
echo "       - Branch Name (Text)"
echo "       - Git Commit (URL)"
echo "[ ] 3. Add 'Feature Tracker' database"
echo "[ ] 4. Create page templates for change requests"
echo "[ ] 5. Invite developer to workspace"
echo ""

echo "🔗 QUICK ACTIONS:"
echo "📝 Create first change log entry:"
echo "   Title: Initial setup for developer integration"
echo "   Branch: $BRANCH"
echo "   Status: In Progress"
echo "   Commit: $COMMIT"
echo ""

echo "💡 NEXT STEPS:"
echo "1. Copy this info to your new chat"
echo "2. Set up Notion databases"
echo "3. Start logging all changes"
echo "4. Keep developer in the loop"

# Auto-generate Notion entry template
cat << EOF > notion-entry-template.md
# 🔄 Change Log Entry

**Title:** [Your change description]
**Date:** $(date +%Y-%m-%d)
**Branch:** $BRANCH
**Status:** Draft
**Impact Level:** [Low/Medium/High/Critical]
**Files Modified:** [List files]
**Git Commit:** $REPO_URL/commit/$COMMIT

## Summary
[What changed and why]

## Technical Details
[Code changes, dependencies, etc.]

## Developer Review
@[developer] please review when ready

## Screenshots
[Add before/after images if UI changes]
EOF

echo ""
echo "✅ Created notion-entry-template.md for easy copy-paste"
echo "🚀 Ready to start tracking changes with full alignment!"
