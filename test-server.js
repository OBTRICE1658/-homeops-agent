const express = require("express");
const path = require("path");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 3000;

// Add CORS support
app.use(cors());

// Parse JSON bodies
app.use(express.json());

// Serve static files
app.use(express.static("public"));

// Simple health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    message: 'Test server running without Firebase',
    timestamp: new Date().toISOString()
  });
});

// SPA catch-all route
app.get('*', (req, res) => {
  // For the root path, serve auth.html (login page)
  if (req.path === '/' || req.path === '/index.html') {
    res.redirect('/auth.html');
    return;
  }
  // Serve auth.html for authentication
  if (req.path === '/auth' || req.path === '/auth.html') {
    res.sendFile(path.join(__dirname, 'public', 'auth.html'));
    return;
  }
  // Serve dashboard.html for dashboard
  if (req.path === '/dashboard' || req.path === '/dashboard.html') {
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
    return;
  }
  // Serve dashboard.html for all other non-API routes
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
    return;
  }
  // Fallback for any other routes
  res.status(404).send('Not Found');
});

// Start server
app.listen(port, () => {
  console.log(`✅ Test server listening on port ${port}`);
  console.log(`🌐 Access your app at: http://localhost:${port}`);
  console.log(`📱 Dashboard: http://localhost:${port}/dashboard`);
}); 