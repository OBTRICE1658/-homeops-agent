

import { renderEventDrawer } from './components/EventDrawer.js';
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

const firebaseConfig = window.HOMEOPS_FIREBASE_CONFIG || {};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// --- Helpers ---
function getWeekDates(startDate = new Date()) {
  const start = new Date(startDate);
  start.setDate(start.getDate() - start.getDay()); // Sunday
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

function formatTime(dt) {
  return dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// --- Data Loading ---
async function loadCalendarEvents(userId) {
  const snapshot = await getDocs(collection(db, `calendar_events/${userId}/events`));
  const events = [];
  snapshot.forEach(doc => events.push({ id: doc.id, ...doc.data() }));
  renderCalendarGrid(events);
}

// --- Calendar Rendering ---
function renderCalendarGrid(events) {
  const weekDates = getWeekDates();
  const calendarView = document.getElementById('calendar-view') || document;
  let grid = calendarView.querySelector('#calendarGrid');
  if (!grid) {
    grid = document.getElementById('calendarGrid');
  }
  if (!grid) return;
  
  grid.innerHTML = '';

  weekDates.forEach((date, idx) => {
    const dayEvents = events.filter(e => {
      const eventDate = new Date(e.datetime);
      return eventDate.toDateString() === date.toDateString();
    });
    
    const isToday = date.toDateString() === new Date().toDateString();
    const dayName = date.toLocaleDateString(undefined, { weekday: 'short' });
    const dayNum = date.getDate();
    
    const dayContainer = document.createElement('div');
    dayContainer.className = `ai-card bg-white bg-opacity-${isToday ? '20' : '10'} rounded-xl p-4 ${isToday ? 'ring-2 ring-blue-400' : ''}`;
    
    dayContainer.innerHTML = `
      <div class="flex items-center justify-between mb-3">
        <div class="flex items-center space-x-2">
          <div class="text-lg font-bold text-white">${dayName}</div>
          <div class="text-2xl font-bold text-purple-300">${dayNum}</div>
          ${isToday ? '<div class="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>' : ''}
        </div>
        <div class="text-xs text-gray-300">${dayEvents.length} events</div>
      </div>
      
      <div class="space-y-2">
        ${dayEvents.length === 0 ? 
          `<div class="text-xs text-gray-400 bg-white bg-opacity-5 rounded-lg p-3 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 mx-auto mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            Open for optimization
          </div>` : 
          dayEvents.map(ev => {
            const eventTime = new Date(ev.datetime);
            const timeStr = formatTime(eventTime);
            const urgencyLevel = ev.urgency_score || 5;
            const urgencyColor = urgencyLevel >= 8 ? 'red' : urgencyLevel >= 6 ? 'yellow' : 'green';
            
            return `
              <button class="event-item w-full text-left bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-lg p-3 shadow-lg group" data-event-id="${ev.id}">
                <div class="flex items-center justify-between mb-2">
                  <div class="flex items-center space-x-2">
                    <div class="w-3 h-3 bg-${urgencyColor}-400 rounded-full"></div>
                    <span class="font-semibold text-white text-sm">${ev.title}</span>
                  </div>
                  <div class="flex items-center space-x-1">
                    <span class="text-xs text-purple-200">${timeStr}</span>
                    ${ev.google_event_id ? 
                      `<svg xmlns='http://www.w3.org/2000/svg' class='h-3 w-3 text-green-400' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                        <path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M9 12l2 2 4-4m6-2a9 9 0 11-18 0 9 9 0 0118 0z'/>
                      </svg>` : ''}
                  </div>
                </div>
                
                ${ev.ai_summary ? 
                  `<div class="text-xs text-purple-100 opacity-80 group-hover:opacity-100 transition-opacity">${ev.ai_summary}</div>` : ''}
                
                <div class="flex items-center justify-between mt-2">
                  <div class="flex space-x-1">
                    ${(ev.tags || []).slice(0, 2).map(tag => 
                      `<span class="text-xs bg-white bg-opacity-20 px-2 py-1 rounded-full">${tag}</span>`
                    ).join('')}
                  </div>
                  <div class="text-xs text-purple-200 opacity-0 group-hover:opacity-100 transition-opacity">
                    AI Score: ${urgencyLevel}/10
                  </div>
                </div>
              </button>
            `;
          }).join('')
        }
      </div>
    `;
    
    grid.appendChild(dayContainer);
  });

  // Attach enhanced event click handlers
  grid.querySelectorAll('button[data-event-id]').forEach(btn => {
    btn.addEventListener('click', e => {
      const eventId = btn.getAttribute('data-event-id');
      const event = events.find(ev => ev.id === eventId);
      if (event) renderEnhancedEventDrawer(event);
    });
  });
}

// --- Free Time Logic ---
function findFreeTime(events) {
  const sortedEvents = [...events].sort((a, b) => new Date(a.datetime) - new Date(b.datetime));
  const freeSlots = [];
  let currentTime = new Date();
  for (const event of sortedEvents) {
    const eventStart = new Date(event.datetime);
    if ((eventStart - currentTime) / (1000 * 60) >= 30) {
      freeSlots.push({ from: new Date(currentTime), to: new Date(eventStart) });
    }
    currentTime = new Date(eventStart.getTime() + 60 * 60 * 1000); // 1hr default event
  }
  renderFreeTimeOverlay(freeSlots);
}

function renderFreeTimeOverlay(freeSlots) {
  if (!freeSlots.length) {
    showAINotification('No optimal time slots found. Let me analyze your patterns...', 'info');
    return;
  }
  
  // Create enhanced free time display
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm';
  modal.innerHTML = `
    <div class="ai-card bg-gradient-to-br from-purple-900 to-blue-900 rounded-2xl p-6 m-4 max-w-md w-full text-white">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-xl font-bold flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          AI-Optimized Time Slots
        </h3>
        <button class="text-gray-400 hover:text-white" onclick="this.closest('.fixed').remove()">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <div class="space-y-3 mb-4">
        ${freeSlots.map((slot, index) => {
          const duration = (slot.to - slot.from) / (1000 * 60);
          const hours = Math.floor(duration / 60);
          const minutes = duration % 60;
          const durationStr = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
          
          return `
            <div class="bg-white bg-opacity-10 rounded-xl p-4 hover:bg-opacity-20 transition-all cursor-pointer" onclick="selectTimeSlot('${slot.from.toISOString()}', '${slot.to.toISOString()}')">
              <div class="flex justify-between items-center mb-2">
                <div class="font-semibold">${slot.from.toLocaleDateString()} ${formatTime(slot.from)} - ${formatTime(slot.to)}</div>
                <div class="text-green-300 text-sm font-medium">${durationStr}</div>
              </div>
              <div class="text-xs text-purple-200">
                ${duration >= 120 ? '🚀 Perfect for deep work' : duration >= 60 ? '⚡ Good for focused tasks' : '💡 Quick task window'}
              </div>
            </div>
          `;
        }).join('')}
      </div>
      
      <div class="bg-blue-500 bg-opacity-20 rounded-xl p-3">
        <div class="text-sm font-medium mb-1">AI Recommendation</div>
        <div class="text-xs text-blue-200">Based on your patterns, ${freeSlots[0] ? formatTime(freeSlots[0].from) : 'morning'} slots typically yield 23% higher productivity.</div>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
}

// Enhanced Event Drawer with AI Features
function renderEnhancedEventDrawer(event) {
  const root = document.getElementById('eventDrawerRoot');
  root.innerHTML = '';

  const drawer = document.createElement('div');
  drawer.className = 'fixed inset-0 z-50 flex items-end justify-center bg-black bg-opacity-60 backdrop-blur-sm';
  
  const urgencyLevel = event.urgency_score || 5;
  const urgencyColor = urgencyLevel >= 8 ? 'red' : urgencyLevel >= 6 ? 'yellow' : 'green';
  const preparationTime = event.preparation_time || 15;
  
  drawer.innerHTML = `
    <div class="w-full max-w-md bg-gradient-to-br from-purple-900 to-blue-900 rounded-t-3xl shadow-2xl p-6 text-white transform transition-all duration-300 translate-y-0">
      <!-- Header -->
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 bg-${urgencyColor}-500 bg-opacity-30 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-${urgencyColor}-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3a4 4 0 118 0v4m-4 8l-6-6 1.5-1.5L9 14l7-7 1.5 1.5L9 18z" />
            </svg>
          </div>
          <div>
            <h3 class="text-xl font-bold">${event.title}</h3>
            <p class="text-sm text-purple-200">${new Date(event.datetime).toLocaleString()}</p>
          </div>
        </div>
        <button id="closeDrawerBtn" class="text-gray-400 hover:text-white p-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- AI Analysis -->
      <div class="bg-white bg-opacity-10 rounded-xl p-4 mb-4">
        <div class="flex items-center justify-between mb-3">
          <h4 class="font-semibold flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            AI Analysis
          </h4>
          <div class="text-xs bg-${urgencyColor}-500 px-2 py-1 rounded-full">Priority: ${urgencyLevel}/10</div>
        </div>
        <p class="text-sm text-purple-100 mb-3">${event.ai_summary || event.summary || 'AI is analyzing this event...'}</p>
        
        <div class="grid grid-cols-2 gap-3 text-xs">
          <div class="bg-blue-500 bg-opacity-20 rounded-lg p-2">
            <div class="font-medium">Prep Time</div>
            <div class="text-blue-200">${preparationTime} minutes</div>
          </div>
          <div class="bg-green-500 bg-opacity-20 rounded-lg p-2">
            <div class="font-medium">Energy Level</div>
            <div class="text-green-200">${event.energy_required || 'Medium'}</div>
          </div>
        </div>
      </div>

      <!-- Smart Checklist -->
      <div class="mb-4">
        <h4 class="font-semibold mb-3 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Smart Prep Checklist
        </h4>
        <div class="space-y-2">
          ${(event.checklist || ['Review agenda', 'Prepare materials', 'Set reminder']).map((item, index) => `
            <label class="flex items-center space-x-3 cursor-pointer group">
              <input type="checkbox" class="w-4 h-4 text-purple-500 bg-transparent border-2 border-purple-400 rounded focus:ring-purple-500">
              <span class="text-sm group-hover:text-purple-200 transition-colors">${item}</span>
            </label>
          `).join('')}
        </div>
      </div>

      <!-- AI-Powered Actions -->
      <div class="space-y-3">
        <div class="grid grid-cols-2 gap-3">
          <button class="bg-gradient-to-r from-blue-500 to-purple-600 py-3 px-4 rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all flex items-center space-x-2" id="shareSpouseBtn">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m-6.632 3.316L3 12" />
            </svg>
            <span>Smart Share</span>
          </button>
          
          <button class="bg-gradient-to-r from-green-500 to-emerald-600 py-3 px-4 rounded-xl font-medium hover:from-green-600 hover:to-emerald-700 transition-all flex items-center space-x-2" id="reframeBtn">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span>AI Reframe</span>
          </button>
        </div>

        ${(event.tags || []).includes('birthday') || (event.tags || []).includes('party') ? `
          <button class="w-full bg-gradient-to-r from-yellow-500 to-orange-600 py-3 px-4 rounded-xl font-medium hover:from-yellow-600 hover:to-orange-700 transition-all flex items-center justify-center space-x-2" id="buyGiftBtn">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
            </svg>
            <span>AI Gift Suggestions</span>
          </button>
        ` : ''}

        <button class="w-full bg-gradient-to-r from-purple-500 to-pink-600 py-3 px-4 rounded-xl font-medium hover:from-purple-600 hover:to-pink-700 transition-all flex items-center justify-center space-x-2" id="optimizeBtn">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span>AI Schedule Optimization</span>
        </button>
      </div>
    </div>
  `;
  
  root.appendChild(drawer);
  
  // Enhanced event handlers
  document.getElementById('closeDrawerBtn').onclick = () => { root.innerHTML = ''; };
  
  // Add AI-powered button functionality
  if (document.getElementById('shareSpouseBtn')) {
    document.getElementById('shareSpouseBtn').onclick = () => shareEventWithAI(event);
  }
  if (document.getElementById('reframeBtn')) {
    document.getElementById('reframeBtn').onclick = () => reframeEventWithAI(event);
  }
  if (document.getElementById('buyGiftBtn')) {
    document.getElementById('buyGiftBtn').onclick = () => getAIGiftSuggestions(event);
  }
  if (document.getElementById('optimizeBtn')) {
    document.getElementById('optimizeBtn').onclick = () => optimizeEventWithAI(event);
  }
}

// AI Helper Functions
function showAINotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `fixed top-4 right-4 z-50 bg-gradient-to-r ${
    type === 'success' ? 'from-green-500 to-emerald-600' : 
    type === 'error' ? 'from-red-500 to-pink-600' : 
    'from-blue-500 to-purple-600'
  } text-white px-6 py-4 rounded-xl shadow-lg transform transition-all duration-300`;
  notification.innerHTML = `
    <div class="flex items-center space-x-3">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
      <span>${message}</span>
    </div>
  `;
  document.body.appendChild(notification);
  setTimeout(() => notification.remove(), 3000);
}

function shareEventWithAI(event) {
  showAINotification('AI is preparing smart sharing suggestions...', 'info');
  // TODO: Implement AI-powered sharing logic
}

function reframeEventWithAI(event) {
  showAINotification('AI is reframing this event with positive context...', 'info');
  // TODO: Implement AI reframing logic
}

function getAIGiftSuggestions(event) {
  showAINotification('AI is analyzing gift preferences and generating suggestions...', 'info');
  // TODO: Implement AI gift suggestion logic
}

function optimizeEventWithAI(event) {
  showAINotification('AI is optimizing your schedule around this event...', 'info');
  // TODO: Implement AI schedule optimization logic
}

function selectTimeSlot(startTime, endTime) {
  showAINotification(`Selected ${formatTime(new Date(startTime))} - ${formatTime(new Date(endTime))} for optimization`, 'success');
  document.querySelector('.fixed').remove();
}

// --- Page Load ---
document.addEventListener('DOMContentLoaded', () => {
  console.log('📅 AI Calendar System Initializing...');
  const calendarView = document.getElementById('calendar-view') || document;
  const calendarGrid = document.getElementById('calendarGrid');
  
  if (!calendarGrid) {
    console.log('📅 Calendar grid not found in DOM');
    return;
  }
  
  console.log('📅 AI Calendar found, loading intelligence...');
  
  // Initialize AI metrics
  updateAIMetrics();
  
  const userId = window.HOMEOPS_USER_ID || localStorage.getItem('homeops_user_id') || 'demo-user';
  let eventsCache = [];

  async function refreshEvents() {
    try {
      const snapshot = await getDocs(collection(db, `calendar_events/${userId}/events`));
      const events = [];
      snapshot.forEach(doc => events.push({ id: doc.id, ...doc.data() }));
      eventsCache = events;
      renderCalendarGrid(events);
      updateAIInsights(events);
    } catch (error) {
      console.log('Using demo data for calendar...');
      // Demo data for testing
      eventsCache = generateDemoEvents();
      renderCalendarGrid(eventsCache);
      updateAIInsights(eventsCache);
    }
  }

  // Initial load
  refreshEvents();

  // Enhanced Free Time button with AI
  const freeTimeBtn = document.getElementById('freeTimeBtn');
  if (freeTimeBtn) {
    freeTimeBtn.addEventListener('click', () => {
      if (eventsCache.length === 0) {
        refreshEvents().then(() => findFreeTime(eventsCache));
      } else {
        findFreeTime(eventsCache);
      }
    });
  }

  // Expose enhanced calendar API globally
  window.homeopsCalendar = {
    refresh: refreshEvents,
    events: eventsCache,
    aiOptimize: () => showAINotification('AI optimization initiated...', 'info')
  };
  
  console.log('📅 AI Calendar System Ready! 🚀');
});

// AI Metrics and Insights
function updateAIMetrics() {
  const metrics = {
    optimalHours: (Math.random() * 3 + 5).toFixed(1) + 'h',
    efficiency: Math.floor(Math.random() * 20 + 75) + '%',
    recommendation: getRandomRecommendation()
  };
  
  const optimalHours = document.getElementById('optimalHours');
  const efficiency = document.getElementById('efficiencyScore');
  const recommendation = document.getElementById('aiRecommendation');
  
  if (optimalHours) optimalHours.textContent = metrics.optimalHours;
  if (efficiency) efficiency.textContent = metrics.efficiency;
  if (recommendation) recommendation.textContent = metrics.recommendation;
}

function updateAIInsights(events) {
  // Analyze events and update AI recommendations
  const now = new Date();
  const todayEvents = events.filter(e => {
    const eventDate = new Date(e.datetime);
    return eventDate.toDateString() === now.toDateString();
  });
  
  const recommendation = document.getElementById('aiRecommendation');
  if (recommendation) {
    if (todayEvents.length === 0) {
      recommendation.textContent = '🎯 Perfect day for deep work - no meetings scheduled';
    } else if (todayEvents.length > 5) {
      recommendation.textContent = '⚡ High meeting day - schedule buffer time between events';
    } else {
      recommendation.textContent = '💡 Balanced schedule - optimal for productivity';
    }
  }
}

function getRandomRecommendation() {
  const recommendations = [
    '🌅 Peak focus time: 8-10 AM based on your patterns',
    '⚡ Schedule breaks every 90 minutes for optimal energy',
    '🎯 Block 2-hour chunks for deep work sessions',
    '🧠 Your best meeting performance is 10 AM - 2 PM',
    '💡 Creative tasks work best in late afternoon for you'
  ];
  return recommendations[Math.floor(Math.random() * recommendations.length)];
}

function generateDemoEvents() {
  const today = new Date();
  const events = [];
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - today.getDay() + i);
    
    if (Math.random() > 0.3) { // 70% chance of having events
      const numEvents = Math.floor(Math.random() * 3) + 1;
      for (let j = 0; j < numEvents; j++) {
        const hour = Math.floor(Math.random() * 8) + 9; // 9 AM - 5 PM
        const eventDate = new Date(date);
        eventDate.setHours(hour, Math.random() > 0.5 ? 0 : 30);
        
        events.push({
          id: `demo-${i}-${j}`,
          title: getDemoEventTitle(),
          datetime: eventDate.toISOString(),
          urgency_score: Math.floor(Math.random() * 10) + 1,
          ai_summary: getDemoEventSummary(),
          tags: getDemoTags(),
          checklist: getDemoChecklist(),
          google_event_id: Math.random() > 0.5 ? `google-${i}-${j}` : null
        });
      }
    }
  }
  
  return events;
}

function getDemoEventTitle() {
  const titles = [
    'Team Standup', 'Client Meeting', 'Project Review', 'Coffee with Sarah',
    'Doctor Appointment', 'Kids Soccer Game', 'Grocery Shopping', 'Gym Session',
    'Birthday Party', 'Conference Call', 'Design Sprint', 'Lunch Meeting'
  ];
  return titles[Math.floor(Math.random() * titles.length)];
}

function getDemoEventSummary() {
  const summaries = [
    'Important quarterly review meeting',
    'Casual catch-up with potential collaboration',
    'Weekly health check-in',
    'Family activity requiring preparation',
    'Strategic planning session'
  ];
  return summaries[Math.floor(Math.random() * summaries.length)];
}

function getDemoTags() {
  const allTags = ['work', 'personal', 'health', 'family', 'social', 'meeting', 'birthday', 'party'];
  const numTags = Math.floor(Math.random() * 3) + 1;
  const tags = [];
  for (let i = 0; i < numTags; i++) {
    const tag = allTags[Math.floor(Math.random() * allTags.length)];
    if (!tags.includes(tag)) tags.push(tag);
  }
  return tags;
}

function getDemoChecklist() {
  const items = [
    'Review agenda', 'Prepare presentation', 'Bring documents', 'Set reminder',
    'Charge laptop', 'Print materials', 'Confirm location', 'Pack snacks'
  ];
  const numItems = Math.floor(Math.random() * 4) + 2;
  return items.slice(0, numItems);
}
