#!/bin/bash

# =============================================================================
# HOMEOPS OAUTH DISABLE SCRIPT
# =============================================================================
# This script temporarily disables HomeOps OAuth to prevent Gmail conflicts
# with Notion Mail setup
# =============================================================================

echo "🚫 Disabling HomeOps OAuth functionality..."
echo ""

# Kill any running HomeOps servers
echo "1. Stopping all HomeOps servers..."
pkill -f "node.*server" 2>/dev/null || true
pkill -f "quick-server" 2>/dev/null || true
pkill -f "server-v2" 2>/dev/null || true

# Kill processes on common ports
lsof -ti:3000 2>/dev/null | xargs kill -9 2>/dev/null || true
lsof -ti:8080 2>/dev/null | xargs kill -9 2>/dev/null || true

echo "✅ All HomeOps servers stopped"
echo ""

# Create a disabled server that serves only static content
echo "2. Creating OAuth-disabled server..."

cat > server-disabled.js << 'EOF'
// =============================================================================
// HOMEOPS SERVER - OAUTH DISABLED FOR NOTION MAIL SETUP
// =============================================================================

console.log('🚫 HomeOps OAuth DISABLED - Notion Mail Safe Mode');

const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3001; // Use different port

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// DISABLED NOTICE for OAuth routes
app.get('/auth/gmail*', (req, res) => {
  console.log('🚫 OAuth route blocked - Notion Mail safe mode');
  res.status(503).send(`
    <h1 style="color: red; text-align: center; margin-top: 100px;">
      🚫 HomeOps OAuth Temporarily Disabled
    </h1>
    <div style="text-align: center; margin-top: 20px;">
      <p>OAuth is disabled to prevent conflicts with Notion Mail setup.</p>
      <p>This is temporary - will be re-enabled after Notion Mail is configured.</p>
    </div>
  `);
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'oauth-disabled',
    message: 'HomeOps OAuth temporarily disabled for Notion Mail setup',
    timestamp: new Date().toISOString()
  });
});

// Serve static files only
app.use(express.static('public'));

// Catch-all
app.get('*', (req, res) => {
  res.status(503).send(`
    <h1 style="color: orange; text-align: center; margin-top: 100px;">
      🚫 HomeOps OAuth Disabled
    </h1>
    <div style="text-align: center; margin-top: 20px;">
      <p>HomeOps OAuth is temporarily disabled to prevent Gmail conflicts.</p>
      <p>Setting up Notion Mail? This keeps your Gmail permissions clean.</p>
      <p>Check back later once Notion Mail setup is complete.</p>
    </div>
  `);
});

app.listen(PORT, () => {
  console.log('');
  console.log('🚫 ========================================');
  console.log('🚫 HOMEOPS OAUTH DISABLED');
  console.log('🚫 ========================================');
  console.log(`📍 Server: http://localhost:${PORT}`);
  console.log(`🏥 Health: http://localhost:${PORT}/health`);
  console.log('');
  console.log('🚫 All OAuth routes blocked');
  console.log('✅ Notion Mail setup can proceed safely');
  console.log('🔄 Run ./enable-oauth.sh to re-enable later');
  console.log('');
});
EOF

echo "✅ OAuth-disabled server created"
echo ""

# Create enable script for later
echo "3. Creating re-enable script..."

cat > enable-oauth.sh << 'EOF'
#!/bin/bash
echo "🔄 Re-enabling HomeOps OAuth..."
echo ""

# Kill the disabled server
pkill -f "server-disabled" 2>/dev/null || true

# Start the normal server
echo "✅ Starting normal HomeOps server with OAuth enabled..."
node server-v2.js

echo "🔄 HomeOps OAuth re-enabled"
EOF

chmod +x enable-oauth.sh

echo "✅ Re-enable script created (./enable-oauth.sh)"
echo ""

# Start the disabled server
echo "4. Starting OAuth-disabled server..."
node server-disabled.js &

echo ""
echo "🎯 ========================================"
echo "🎯 HOMEOPS OAUTH SUCCESSFULLY DISABLED"
echo "🎯 ========================================"
echo ""
echo "✅ HomeOps OAuth is now completely disabled"
echo "✅ Notion Mail can safely access Gmail without conflicts"
echo "✅ Disabled server running on port 3001 (not 3000)"
echo ""
echo "📋 Next Steps:"
echo "   1. Complete your Notion Mail setup"
echo "   2. Run './enable-oauth.sh' when ready to re-enable HomeOps"
echo ""
echo "🔍 Check status: http://localhost:3001/health"
echo ""
