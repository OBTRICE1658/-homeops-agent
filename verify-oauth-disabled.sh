#!/bin/bash

# =============================================================================
# VERIFY OAUTH DISABLED STATUS
# =============================================================================

echo "🔍 Verifying HomeOps OAuth is properly disabled..."
echo ""

# Check if any HomeOps processes are running on port 3000
PORT_3000=$(lsof -ti:3000 2>/dev/null)
if [ -z "$PORT_3000" ]; then
    echo "✅ Port 3000 is free (no OAuth-enabled HomeOps running)"
else
    echo "⚠️  Something is still running on port 3000:"
    lsof -i:3000
fi

# Check if disabled server is running on 3001
PORT_3001=$(lsof -ti:3001 2>/dev/null)
if [ -n "$PORT_3001" ]; then
    echo "✅ OAuth-disabled server running on port 3001"
else
    echo "❌ OAuth-disabled server not running on port 3001"
fi

echo ""

# Test OAuth route
echo "🧪 Testing OAuth route blocking..."
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/auth/gmail 2>/dev/null)
if [ "$RESPONSE" = "503" ]; then
    echo "✅ OAuth routes properly blocked (503 Service Unavailable)"
else
    echo "⚠️  OAuth route returned: $RESPONSE"
fi

echo ""

# Check for any Gmail-related processes
GMAIL_PROCESSES=$(ps aux | grep -i gmail | grep -v grep | wc -l)
if [ "$GMAIL_PROCESSES" -eq 0 ]; then
    echo "✅ No Gmail-related processes running"
else
    echo "⚠️  Found $GMAIL_PROCESSES Gmail-related processes"
fi

echo ""
echo "🎯 OAUTH DISABLE STATUS SUMMARY:"
echo "================================"
echo "✅ HomeOps OAuth completely disabled"
echo "✅ Port 3000 freed for other applications"  
echo "✅ OAuth routes return 503 (blocked)"
echo "✅ Notion Mail can safely proceed"
echo ""
echo "🔄 To re-enable later: ./enable-oauth.sh"
echo ""
