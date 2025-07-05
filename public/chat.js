// Chat initialization is now handled by layout.js calling window.initializeChat
// This prevents race conditions with Firebase initialization

// Refactored chat.js to export initializeChat
window.initializeChat = function(auth, user, retryCount = 0) {
  console.log("💬 Initializing chat for user:", user ? user.uid : "test_user");
  
  // Always use #chat-root as the target
  const chatRoot = document.getElementById("chat-root");
  if (!chatRoot) {
    if (retryCount < 10) {
      console.log(`💬 chat-root element not found, retrying in 100ms... (attempt ${retryCount + 1}/10)`);
      setTimeout(() => window.initializeChat(auth, user, retryCount + 1), 100);
    } else {
      console.error("💬 chat-root element not found after 10 retries, giving up");
    }
    return;
  }
  chatRoot.innerHTML = '';

  // Add HomeOps label at the top
  const label = document.createElement('div');
  label.className = 'homeops-label';
  label.textContent = 'HomeOps';
  chatRoot.appendChild(label);

  // Create chat card container
  const chatCard = document.createElement("div");
  chatCard.className = "chat-card";

  // Chat box
  const chatBox = document.createElement("div");
  chatBox.className = "chat-box";
  chatBox.id = "chat";
  chatCard.appendChild(chatBox);

  // Chat form
  const chatForm = document.createElement("form");
  chatForm.className = "chat-form";
  chatForm.id = "chatForm";
  const input = document.createElement("input");
  input.type = "text";
  input.id = "input";
  input.placeholder = "Ask HomeOps anything...";
  chatForm.appendChild(input);
  const sendBtn = document.createElement("button");
  sendBtn.type = "submit";
  sendBtn.innerHTML = '<i class="send-icon"></i>';
  chatForm.appendChild(sendBtn);
  chatCard.appendChild(chatForm);

  chatRoot.appendChild(chatCard);
  
  // Helper function to convert natural language dates to ISO format
  function parseNaturalDate(dateString) {
    if (!dateString || typeof dateString !== 'string') {
      console.warn("📅 parseNaturalDate called with invalid input:", dateString);
      return '';
    }
    console.log("📅 Parsing date:", dateString);
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Handle "Tomorrow at Xpm" format
    if (dateString.toLowerCase().includes('tomorrow')) {
      const timeMatch = dateString.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i);
      if (timeMatch) {
        let hours = parseInt(timeMatch[1]);
        const minutes = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
        const period = timeMatch[3].toLowerCase();
        
        if (period === 'pm' && hours !== 12) hours += 12;
        if (period === 'am' && hours === 12) hours = 0;
        
        tomorrow.setHours(hours, minutes, 0, 0);
        const iso = tomorrow.toISOString();
        console.log("📅 Parsed ISO date:", iso);
        return iso;
      }
    }
    
    // Handle "Today at Xpm" format
    if (dateString.toLowerCase().includes('today')) {
      const timeMatch = dateString.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i);
      if (timeMatch) {
        let hours = parseInt(timeMatch[1]);
        const minutes = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
        const period = timeMatch[3].toLowerCase();
        
        if (period === 'pm' && hours !== 12) hours += 12;
        if (period === 'am' && hours === 12) hours = 0;
        
        now.setHours(hours, minutes, 0, 0);
        const result = now.toISOString();
        console.log("📅 Parsed today date:", result);
        return result;
      }
    }
    
    // If we can't parse it, return the original string
    console.warn("📅 Could not parse date:", dateString);
    return '';
  }
  
  // Fun, brand-aligned opening lines
  const openingLines = [
    "Hi, I'm HomeOps — your mental load operating system. What's on your plate today?",
    "Hey there! HomeOps here. What can I help you clear off your list?",
    "Welcome to HomeOps — your family's chief of staff. What's top of mind?",
    "Hi! I'm HomeOps. Ready to help you decode, plan, and conquer your day.",
    "Hello! HomeOps at your service. What's the first thing you want to tackle?"
  ];
  function getOpeningLine() {
    return openingLines[Math.floor(Math.random() * openingLines.length)];
  }
  
  function addMessage(sender, message, opts = {}) {
    const messageDiv = document.createElement("div");
    messageDiv.className = `message ${sender}`;
    
    // Assistant avatar
    if (sender === "agent") {
      const avatar = document.createElement("div");
      avatar.className = "agent-avatar";
      const logoImg = document.createElement("img");
      logoImg.src = "img/homeops-logo.svg";
      logoImg.alt = "HomeOps";
      logoImg.width = 24;
      logoImg.height = 24;
      avatar.appendChild(logoImg);
      messageDiv.appendChild(avatar);
    }
    
    // Bubble and chips wrapper
    let bubbleAndChips = null;
    if (sender === "agent") {
      bubbleAndChips = document.createElement("div");
      bubbleAndChips.className = "bubble-and-chips";
    }
    
    const messageBubble = document.createElement("div");
    messageBubble.className = "message-bubble fade-in-bubble";
    messageBubble.textContent = message;
    
    if (bubbleAndChips) {
      bubbleAndChips.appendChild(messageBubble);
    } else {
      messageDiv.appendChild(messageBubble);
    }
    
    // Quick-start chips
    if (sender === "agent" && opts.showChips) {
      const chips = document.createElement("div");
      chips.className = "quick-start-chips fade-in-chips";
      [
        "Remind me about something",
        "Check what is on my calendar",
        "Review my recent emails",
        "Help me unblock a problem"
      ].forEach(text => {
        const chip = document.createElement("button");
        chip.className = "quick-start-chip";
        chip.type = "button";
        chip.textContent = text;
        chip.onclick = () => {
          input.value = text;
          input.focus();
        };
        chips.appendChild(chip);
      });
      if (bubbleAndChips) {
        bubbleAndChips.appendChild(chips);
      } else {
        messageDiv.appendChild(chips);
      }
      // Animate chips fade-in
      setTimeout(() => chips.classList.add('visible'), 300);
    }
    
    if (bubbleAndChips) {
      messageDiv.appendChild(bubbleAndChips);
    }
    
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
    
    // Show scroll-to-bottom button if needed
    checkScrollButton();
  }

  // Typing indicator
  function showTypingIndicator() {
    let typing = document.querySelector('.typing-indicator');
    if (!typing) {
      typing = document.createElement('div');
      typing.className = 'typing-indicator';
      typing.innerHTML = '<span>HomeOps is thinking...</span>';
      chatBox.appendChild(typing);
      chatBox.scrollTop = chatBox.scrollHeight;
    }
  }
  function hideTypingIndicator() {
    const typing = document.querySelector('.typing-indicator');
    if (typing) typing.remove();
  }

  // Scroll-to-bottom button logic (show only if overflow)
  function checkScrollButton() {
    let btn = document.querySelector('.scroll-to-bottom');
    if (chatBox.scrollHeight > chatBox.clientHeight + 40) {
      if (!btn) {
        btn = document.createElement('button');
        btn.className = 'scroll-to-bottom';
        btn.onclick = () => {
          chatBox.scrollTop = chatBox.scrollHeight;
        };
        chatRoot.appendChild(btn);
      }
      btn.classList.add('visible');
    } else if (btn) {
      btn.classList.remove('visible');
    }
  }

  // Listen for scroll events
  chatBox.addEventListener('scroll', checkScrollButton);

  // Add initial greeting (with chips)
  addMessage("agent", "Welcome to HomeOps — your mental load operating system. What is top of mind?", { showChips: true });
  
  // Handle form submission
  chatForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const message = input.value.trim();
    if (!message) return;
    
    // Add user message
    addMessage("user", message);
    input.value = "";
    
    // Show typing indicator
    showTypingIndicator();
    
    try {
      // Use the user ID from window.userId (set by Firebase auth) or fallback to test_user
      const userId = window.userId || (user ? user.uid : "test_user");
      
      const response = await fetch("/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, user_id: userId })
      });
      
      if (!response.ok) {
        throw new Error(`API call failed: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Remove typing indicator
      hideTypingIndicator();
      
      // Add agent message (use data.reply, not data.response)
      if (data.reply && data.reply.trim()) {
        addMessage("agent", data.reply);
      } else {
        addMessage("agent", "Sorry, I didn't get a response. Please try again.");
      }
      
      // Inject events into calendar if present (moved outside try-catch)
      console.log("📅 Checking for events in response:", data);
      if (data.events && data.events.length > 0) {
        console.log("📅 Chat returned events:", data.events);
        console.log("📅 Events array length:", data.events.length);
        
        // For each event, POST to backend
        data.events.forEach((event, index) => {
          console.log(`📅 Processing event ${index + 1}:`, event);
          console.log(`📅 Event keys:`, Object.keys(event));
          console.log(`📅 Event when field:`, event.when);
          console.log(`📅 Event start field:`, event.start);
          console.log(`📅 Event title field:`, event.title);
          console.log(`📅 Event allDay field:`, event.allDay);
          console.log(`📅 All event fields:`, JSON.stringify(event, null, 2));
          
          // Check if event already exists in calendar by content (title and start time)
          // Since AI-generated IDs are not real database IDs, we check by content instead
          if (event.title && event.start) {
            console.log(`📅 Checking for duplicate event with title: "${event.title}" and start: "${event.start}"`);
            
            // Get all events from the calendar
            const allEvents = window.calendar.getEvents();
            const duplicateEvent = allEvents.find(existingEvent => {
              return existingEvent.title === event.title && 
                     existingEvent.start.toISOString() === event.start;
            });
            
            if (duplicateEvent) {
              console.log(`📅 Duplicate event found with ID: ${duplicateEvent.id} - skipping creation`);
              addMessage("agent", `✅ Event "${event.title}" already exists in your calendar.`);
              return; // Skip this event
            } else {
              console.log(`📅 No duplicate found - will create new event`);
            }
          }
          
          // Parse the date if it's in natural language format
          let startDate = event.start;
          if (event.when && !event.start) {
            startDate = parseNaturalDate(event.when);
          }
          
          // Prepare event data for backend
          const eventData = {
            user_id: userId,
            title: event.title,
            start: startDate,
            allDay: event.allDay || false
          };
          
          console.log(`📅 Sending event to backend:`, eventData);
          
          // Send to backend
          fetch('/api/add-event', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(eventData)
          })
          .then(response => {
            console.log(`📅 Backend response status:`, response.status);
            return response.json();
          })
          .then(result => {
            console.log(`📅 Backend response result:`, result);
            if (result.success) {
              addMessage("agent", `✅ Event "${event.title}" added to your calendar.`);
              // Refresh calendar events
              console.log(`📅 Refreshing calendar events`);
              if (window.calendar) {
                window.calendar.refetchEvents();
              }
            } else if (result.duplicate) {
              addMessage("agent", `✅ Event "${event.title}" already exists in your calendar.`);
              if (window.calendar) {
                window.calendar.refetchEvents();
              }
            } else {
              addMessage("agent", `❌ Failed to add event "${event.title}". ${result.message ? result.message : ''}`);
            }
          })
          .catch(error => {
            console.error('Error adding event:', error);
            addMessage("agent", `❌ Error adding event "${event.title}".`);
          });
        });
      } else {
        console.log("📅 No events found in response or events array is empty");
      }
    } catch (error) {
      console.error("💬 Chat error:", error);
      // Remove typing indicator
      hideTypingIndicator();
      // Add error message
      addMessage("agent", "Sorry, I'm having trouble connecting right now. Please try again.");
    }
  });
};
