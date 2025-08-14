const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Test route
app.get('/test', (req, res) => {
    res.send('<h1>Server is working!</h1><p><a href="/agent">Go to Agent App</a></p>');
});

// Routes
app.get('/agent', (req, res) => {
    console.log('🤖 Agent route accessed');
    const filePath = path.join(__dirname, 'public', 'homeops-agent-app.html');
    console.log('📁 Serving file:', filePath);
    res.sendFile(filePath);
});

app.get('/', (req, res) => {
    res.redirect('/agent');
});

app.listen(PORT, () => {
    console.log(`🚀 HomeOps Agent Server running on http://localhost:${PORT}`);
    console.log(`🤖 Agent App: http://localhost:${PORT}/agent`);
});
