console.log('🚀 Starting Clean HomeOps Server...');

const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// WORKING ROUTES FIRST
app.get('/vnext', (req, res) => {
  console.log('✅ VNEXT route hit');
  const filePath = path.join(__dirname, 'public', 'index-vnext.html');
  
  if (!fs.existsSync(filePath)) {
    return res.status(404).send(`
      <h1 style="color: red; text-align: center; margin-top: 200px;">
        ❌ File not found: ${filePath}
      </h1>
    `);
  }
  
  res.sendFile(filePath);
});

app.get('/vnext-test', (req, res) => {
  console.log('✅ VNEXT TEST route hit');
  res.send('<h1 style="color: green; font-size: 48px; text-align: center; margin-top: 200px;">✅ VNEXT TEST WORKS!</h1>');
});

app.get('/test', (req, res) => {
  console.log('✅ TEST route hit');
  res.send('<h1 style="color: blue; font-size: 48px; text-align: center; margin-top: 200px;">✅ BASIC ROUTING WORKS!</h1>');
});

app.get('/debug', (req, res) => {
  console.log('✅ DEBUG route hit');
  res.json({
    message: 'Server is working',
    timestamp: new Date().toISOString(),
    routes: ['/vnext', '/vnext-test', '/test', '/debug'],
    port: PORT
  });
});

// Serve static files AFTER custom routes
app.use(express.static('public'));

// Catch-all for debugging
app.get('*', (req, res) => {
  console.log(`❓ Unknown route: ${req.path}`);
  res.status(404).send(`
    <h1 style="color: orange; text-align: center; margin-top: 200px;">
      🤔 Route not found: ${req.path}<br>
      <a href="/test" style="color: blue;">Test basic routing</a> | 
      <a href="/vnext-test" style="color: green;">Test vnext</a> | 
      <a href="/debug" style="color: purple;">Debug info</a>
    </h1>
  `);
});

app.listen(PORT, () => {
  console.log(`🎯 CLEAN SERVER RUNNING on http://localhost:${PORT}`);
  console.log('📍 Test routes:');
  console.log(`   ✅ Basic: http://localhost:${PORT}/test`);
  console.log(`   ✅ VNext Test: http://localhost:${PORT}/vnext-test`);
  console.log(`   ✅ VNext: http://localhost:${PORT}/vnext`);
  console.log(`   ✅ Debug: http://localhost:${PORT}/debug`);
  console.log('');
  console.log('🧹 Clean server with no technical debt');
});
