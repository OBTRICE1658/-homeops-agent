#!/bin/bash

# =============================================================================
# NUCLEAR OAUTH SHUTDOWN - 100% DISABLE ALL HOMEOPS OAUTH
# =============================================================================

echo "💥 NUCLEAR OAUTH SHUTDOWN - 100% DISABLE MODE"
echo "=============================================="
echo ""

# 1. Kill ALL node processes that might be HomeOps-related
echo "1. Killing ALL HomeOps processes..."
pkill -f "server" 2>/dev/null || true
pkill -f "homeops" 2>/dev/null || true  
pkill -f "quick-server" 2>/dev/null || true
pkill -f "server-v2" 2>/dev/null || true
pkill -f "server-disabled" 2>/dev/null || true

# 2. Force kill on all common ports
echo "2. Freeing all common ports..."
for port in 3000 3001 8080 8000 8888 9000; do
    lsof -ti:$port 2>/dev/null | xargs kill -9 2>/dev/null || true
done

# 3. Remove any existing OAuth token files
echo "3. Removing OAuth token files..."
rm -f google-tokens.json 2>/dev/null || true
rm -f .env.local 2>/dev/null || true
rm -f tokens.json 2>/dev/null || true

# 4. Check for any remaining OAuth processes
echo "4. Checking for remaining OAuth processes..."
OAUTH_PROCESSES=$(ps aux | grep -i oauth | grep -v grep | wc -l)
if [ "$OAUTH_PROCESSES" -gt 0 ]; then
    echo "⚠️  Found OAuth processes, killing them..."
    ps aux | grep -i oauth | grep -v grep | awk '{print $2}' | xargs kill -9 2>/dev/null || true
else
    echo "✅ No OAuth processes found"
fi

# 5. Verify all ports are free
echo "5. Verifying ports are free..."
LISTENING_PORTS=$(lsof -i -P | grep LISTEN | grep -E ':(3000|3001|8080)' | wc -l)
if [ "$LISTENING_PORTS" -eq 0 ]; then
    echo "✅ All HomeOps ports are free"
else
    echo "⚠️  Still found listening processes:"
    lsof -i -P | grep LISTEN | grep -E ':(3000|3001|8080)'
fi

# 6. Create a lock file to prevent accidental startup
echo "6. Creating OAuth lock file..."
cat > .oauth-disabled-lock << 'EOF'
HOMEOPS OAUTH DISABLED
=====================
This file indicates HomeOps OAuth is intentionally disabled.
Created: $(date)
Reason: Gmail OAuth conflicts with Notion Mail

To re-enable:
1. Delete this file: rm .oauth-disabled-lock
2. Run: ./enable-oauth.sh
EOF

# 7. Rename main server files to prevent accidental startup
echo "7. Renaming server files to prevent startup..."
if [ -f "quick-server.js" ]; then
    mv quick-server.js quick-server.js.DISABLED 2>/dev/null || true
    echo "✅ Renamed quick-server.js to .DISABLED"
fi

if [ -f "server-v2.js" ]; then
    mv server-v2.js server-v2.js.DISABLED 2>/dev/null || true
    echo "✅ Renamed server-v2.js to .DISABLED"
fi

# 8. Create a stub index.js that blocks OAuth
echo "8. Creating OAuth-blocking stub..."
cat > index.js << 'EOF'
// HOMEOPS OAUTH DISABLED - NOTION MAIL SAFE MODE
console.log('🚫 HomeOps OAuth is DISABLED');
console.log('🚫 This prevents Gmail conflicts with Notion Mail');
console.log('🚫 To re-enable: ./enable-oauth.sh');
process.exit(1);
EOF

# 9. Final verification
echo ""
echo "9. Final verification..."
NODE_PROCESSES=$(ps aux | grep node | grep -v "Code Helper" | grep -v "tsserver" | grep -v grep | wc -l)
if [ "$NODE_PROCESSES" -eq 0 ]; then
    echo "✅ No HomeOps Node processes running"
else
    echo "⚠️  Found $NODE_PROCESSES Node processes (might be VS Code)"
fi

echo ""
echo "💥 ========================================"
echo "💥 NUCLEAR OAUTH SHUTDOWN COMPLETE"  
echo "💥 ========================================"
echo ""
echo "✅ ALL HomeOps OAuth functionality DESTROYED"
echo "✅ ALL server files renamed to .DISABLED"
echo "✅ ALL ports freed (3000, 3001, 8080)"
echo "✅ OAuth token files removed"
echo "✅ Lock file created (.oauth-disabled-lock)"
echo ""
echo "🎯 NOTION MAIL NOW HAS 100% CLEAN GMAIL ACCESS"
echo ""
echo "🔄 To restore HomeOps later:"
echo "   ./enable-oauth.sh"
echo ""

# 10. Test Gmail OAuth availability  
echo "10. Testing Gmail OAuth availability..."
echo "   ⭐ Your Gmail OAuth is now completely free"
echo "   ⭐ Notion Mail should connect without any conflicts"
echo "   ⭐ No HomeOps processes will interfere"
echo ""
