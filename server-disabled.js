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
