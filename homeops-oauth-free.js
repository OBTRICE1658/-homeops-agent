const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Simple in-memory storage for demo purposes
let homeOpsData = {
  users: {},
  tasks: [],
  emails: [],
  calendar: [],
  intelligence: []
};

// Initialize with some demo data
homeOpsData.tasks = [
  {
    id: '1',
    title: 'Check home security system',
    priority: 'high',
    category: 'security',
    completed: false,
    dueDate: new Date().toISOString()
  },
  {
    id: '2',
    title: 'Review energy usage',
    priority: 'medium',
    category: 'energy',
    completed: false,
    dueDate: new Date(Date.now() + 86400000).toISOString()
  },
  {
    id: '3',
    title: 'Schedule maintenance',
    priority: 'low',
    category: 'maintenance',
    completed: true,
    dueDate: new Date(Date.now() - 86400000).toISOString()
  }
];

// API Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'HomeOps Server Running',
    mode: 'OAuth-Free',
    timestamp: new Date().toISOString()
  });
});

// Get user profile (mock data)
app.get('/api/user/profile', (req, res) => {
  res.json({
    id: 'demo-user',
    name: 'HomeOps User',
    email: 'user@example.com',
    preferences: {
      theme: 'light',
      notifications: true
    },
    stats: {
      totalTasks: homeOpsData.tasks.length,
      completedTasks: homeOpsData.tasks.filter(t => t.completed).length,
      pendingTasks: homeOpsData.tasks.filter(t => !t.completed).length
    }
  });
});

// Tasks API
app.get('/api/tasks', (req, res) => {
  res.json(homeOpsData.tasks);
});

app.post('/api/tasks', (req, res) => {
  const newTask = {
    id: Date.now().toString(),
    title: req.body.title || 'New Task',
    priority: req.body.priority || 'medium',
    category: req.body.category || 'general',
    completed: false,
    dueDate: req.body.dueDate || new Date().toISOString()
  };
  
  homeOpsData.tasks.push(newTask);
  res.json(newTask);
});

app.put('/api/tasks/:id', (req, res) => {
  const taskId = req.params.id;
  const taskIndex = homeOpsData.tasks.findIndex(t => t.id === taskId);
  
  if (taskIndex === -1) {
    return res.status(404).json({ error: 'Task not found' });
  }
  
  homeOpsData.tasks[taskIndex] = {
    ...homeOpsData.tasks[taskIndex],
    ...req.body
  };
  
  res.json(homeOpsData.tasks[taskIndex]);
});

app.delete('/api/tasks/:id', (req, res) => {
  const taskId = req.params.id;
  const taskIndex = homeOpsData.tasks.findIndex(t => t.id === taskId);
  
  if (taskIndex === -1) {
    return res.status(404).json({ error: 'Task not found' });
  }
  
  homeOpsData.tasks.splice(taskIndex, 1);
  res.json({ message: 'Task deleted successfully' });
});

// Analytics API (mock data)
app.get('/api/analytics', (req, res) => {
  res.json({
    overview: {
      totalTasks: homeOpsData.tasks.length,
      completedToday: 2,
      upcomingDeadlines: 3,
      overdueTasks: 1
    },
    categories: {
      security: homeOpsData.tasks.filter(t => t.category === 'security').length,
      energy: homeOpsData.tasks.filter(t => t.category === 'energy').length,
      maintenance: homeOpsData.tasks.filter(t => t.category === 'maintenance').length,
      general: homeOpsData.tasks.filter(t => t.category === 'general').length
    },
    trends: {
      week: [3, 5, 2, 8, 6, 4, 7],
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    }
  });
});

// Home intelligence API (mock data without Gmail)
app.get('/api/intelligence', (req, res) => {
  res.json({
    insights: [
      {
        type: 'energy',
        title: 'Energy Usage Alert',
        message: 'Your energy consumption is 15% higher than last month',
        priority: 'medium',
        timestamp: new Date().toISOString()
      },
      {
        type: 'security',
        title: 'Security Check',
        message: 'All security systems operational',
        priority: 'low',
        timestamp: new Date().toISOString()
      },
      {
        type: 'maintenance',
        title: 'Upcoming Maintenance',
        message: 'HVAC filter needs replacement next week',
        priority: 'high',
        timestamp: new Date().toISOString()
      }
    ],
    status: 'active',
    lastUpdate: new Date().toISOString()
  });
});

// Calendar API (mock data)
app.get('/api/calendar', (req, res) => {
  res.json({
    events: [
      {
        id: '1',
        title: 'Home Security Check',
        start: new Date().toISOString(),
        end: new Date(Date.now() + 3600000).toISOString(),
        type: 'maintenance'
      },
      {
        id: '2',
        title: 'Energy Meter Reading',
        start: new Date(Date.now() + 86400000).toISOString(),
        end: new Date(Date.now() + 86400000 + 1800000).toISOString(),
        type: 'monitoring'
      }
    ]
  });
});

// Static file serving
app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HomeOps - OAuth-Free Mode</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; background: #f5f7fa; }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 2rem; border-radius: 10px; margin-bottom: 2rem; }
        .card { background: white; padding: 1.5rem; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); margin-bottom: 1rem; }
        .btn { background: #667eea; color: white; padding: 0.5rem 1rem; border: none; border-radius: 5px; cursor: pointer; text-decoration: none; display: inline-block; }
        .btn:hover { background: #5a67d8; }
        .status { display: inline-block; padding: 0.25rem 0.5rem; border-radius: 3px; font-size: 0.8rem; }
        .status.active { background: #48bb78; color: white; }
        .status.disabled { background: #f56565; color: white; }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1rem; }
        .task { padding: 1rem; border-left: 4px solid #667eea; background: #f7fafc; margin-bottom: 0.5rem; border-radius: 0 5px 5px 0; }
        .task.completed { opacity: 0.6; border-left-color: #48bb78; }
        .priority-high { border-left-color: #f56565; }
        .priority-medium { border-left-color: #ed8936; }
        .priority-low { border-left-color: #48bb78; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏠 HomeOps Dashboard</h1>
            <p>Smart Home Operations Management</p>
            <div style="margin-top: 1rem;">
                <span class="status active">OAuth-Free Mode</span>
                <span class="status active">Notion Mail Compatible</span>
            </div>
        </div>

        <div class="grid">
            <div class="card">
                <h3>📊 System Status</h3>
                <div id="systemStatus">Loading...</div>
            </div>
            
            <div class="card">
                <h3>📋 Recent Tasks</h3>
                <div id="tasksList">Loading...</div>
                <button class="btn" onclick="addSampleTask()">+ Add Task</button>
            </div>
            
            <div class="card">
                <h3>🧠 Home Intelligence</h3>
                <div id="intelligenceList">Loading...</div>
            </div>
        </div>

        <div class="card">
            <h3>⚡ Quick Actions</h3>
            <button class="btn" onclick="refreshData()">🔄 Refresh Data</button>
            <button class="btn" onclick="viewAnalytics()">📈 View Analytics</button>
            <button class="btn" onclick="checkCalendar()">📅 Check Calendar</button>
        </div>
    </div>

    <script>
        // Load initial data
        loadSystemStatus();
        loadTasks();
        loadIntelligence();

        async function loadSystemStatus() {
            try {
                const response = await fetch('/api/user/profile');
                const data = await response.json();
                document.getElementById('systemStatus').innerHTML = \`
                    <p><strong>User:</strong> \${data.name}</p>
                    <p><strong>Total Tasks:</strong> \${data.stats.totalTasks}</p>
                    <p><strong>Completed:</strong> \${data.stats.completedTasks}</p>
                    <p><strong>Pending:</strong> \${data.stats.pendingTasks}</p>
                \`;
            } catch (error) {
                document.getElementById('systemStatus').innerHTML = '<p>Error loading status</p>';
            }
        }

        async function loadTasks() {
            try {
                const response = await fetch('/api/tasks');
                const tasks = await response.json();
                const tasksList = document.getElementById('tasksList');
                
                if (tasks.length === 0) {
                    tasksList.innerHTML = '<p>No tasks available</p>';
                    return;
                }

                tasksList.innerHTML = tasks.slice(0, 5).map(task => \`
                    <div class="task \${task.completed ? 'completed' : ''} priority-\${task.priority}">
                        <strong>\${task.title}</strong><br>
                        <small>Priority: \${task.priority} | Category: \${task.category}</small>
                        <br><button class="btn" style="margin-top: 0.5rem;" onclick="toggleTask('\${task.id}', \${!task.completed})">\${task.completed ? '↶ Undo' : '✓ Complete'}</button>
                    </div>
                \`).join('');
            } catch (error) {
                document.getElementById('tasksList').innerHTML = '<p>Error loading tasks</p>';
            }
        }

        async function loadIntelligence() {
            try {
                const response = await fetch('/api/intelligence');
                const data = await response.json();
                document.getElementById('intelligenceList').innerHTML = data.insights.map(insight => \`
                    <div class="task priority-\${insight.priority}">
                        <strong>\${insight.title}</strong><br>
                        <small>\${insight.message}</small>
                    </div>
                \`).join('');
            } catch (error) {
                document.getElementById('intelligenceList').innerHTML = '<p>Error loading intelligence</p>';
            }
        }

        async function toggleTask(taskId, completed) {
            try {
                await fetch(\`/api/tasks/\${taskId}\`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ completed })
                });
                loadTasks();
                loadSystemStatus();
            } catch (error) {
                alert('Error updating task');
            }
        }

        async function addSampleTask() {
            const title = prompt('Enter task title:');
            if (!title) return;
            
            try {
                await fetch('/api/tasks', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        title,
                        priority: 'medium',
                        category: 'general'
                    })
                });
                loadTasks();
                loadSystemStatus();
            } catch (error) {
                alert('Error adding task');
            }
        }

        function refreshData() {
            loadSystemStatus();
            loadTasks();
            loadIntelligence();
            alert('Data refreshed!');
        }

        async function viewAnalytics() {
            try {
                const response = await fetch('/api/analytics');
                const data = await response.json();
                alert(\`Analytics Summary:
                
Total Tasks: \${data.overview.totalTasks}
Completed Today: \${data.overview.completedToday}
Upcoming Deadlines: \${data.overview.upcomingDeadlines}
Overdue Tasks: \${data.overview.overdueTasks}\`);
            } catch (error) {
                alert('Error loading analytics');
            }
        }

        async function checkCalendar() {
            try {
                const response = await fetch('/api/calendar');
                const data = await response.json();
                const events = data.events.map(e => \`• \${e.title} (\${new Date(e.start).toLocaleDateString()})\`).join('\\n');
                alert(\`Upcoming Events:\\n\\n\${events}\`);
            } catch (error) {
                alert('Error loading calendar');
            }
        }
    </script>
</body>
</html>
  `);
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log('🚀 ================================');
  console.log('🚀 HOMEOPS SERVER STARTED');
  console.log('🚀 ================================');
  console.log(`📍 Server running on: http://localhost:${PORT}`);
  console.log('✅ Mode: OAuth-Free (Notion Mail Compatible)');
  console.log('✅ Gmail OAuth: Disabled');
  console.log('✅ Basic functionality: Available');
  console.log('🌐 Open http://localhost:3000 to view dashboard');
  console.log('🚀 ================================');
});

module.exports = app;
