function initializeChat(user) {
  const userId = user.uid;
  if (!userId) {
    console.error("Chat not initialized: No user ID provided.");
    return;
  }

  // Prevent re-initialization
  if (window.chatInitialized) {
    console.warn("Chat already initialized.");
    return;
  }
  window.chatInitialized = true;

  console.log("🚀 Initializing chat for user:", userId);

  const calendarEl = document.getElementById("calendar");
  let calendar;

  // Function to fetch and render events
  async function fetchAndRenderEvents() {
    if (!calendar) return;
    try {
      const events = await apiCall(`/api/get-events?user_id=${userId}`);
      calendar.removeAllEvents();
      const calendarEvents = events.map(event => ({
        id: event.id,
        title: event.title,
        start: event.start,
        allDay: event.allDay || false
      }));
      calendar.addEventSource(calendarEvents);
      console.log("✅ Calendar updated with the latest events.");
    } catch (error) {
      console.error("❌ Error fetching or rendering events:", error);
    }
  }

  if (calendarEl) {
    calendar = new FullCalendar.Calendar(calendarEl, {
      initialView: "dayGridMonth",
      headerToolbar: {
        left: "prev,next today",
        center: "title",
        right: "dayGridMonth,timeGridWeek,timeGridDay",
      },
      editable: true,
      events: fetchAndRenderEvents,
    });
    calendar.render();
  } else {
    console.warn("⚠️ Calendar element not found on this page.");
  }

  const chatBox = document.getElementById("chat");
  const chatForm = document.getElementById("chatForm");
  const input = document.getElementById("input");

  function addMessage(sender, message) {
    const messageDiv = document.createElement("div");
    messageDiv.className = `message ${sender}`;
    const senderDiv = document.createElement("div");
    senderDiv.className = "sender";
    senderDiv.textContent = sender === "user" ? "You" : "HomeOps";
    const bubbleDiv = document.createElement("div");
    bubbleDiv.className = "message-bubble";
    bubbleDiv.textContent = message;
    messageDiv.appendChild(senderDiv);
    messageDiv.appendChild(bubbleDiv);
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
  }

  chatForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const message = input.value.trim();
    if (!message) return;
    addMessage("user", message);
    input.value = "";

    const typingIndicatorContainer = document.createElement("div");
    typingIndicatorContainer.className = "message agent";
    typingIndicatorContainer.id = "typing-indicator-container";
    const senderDiv = document.createElement("div");
    senderDiv.className = "sender";
    senderDiv.textContent = "HomeOps";
    const bubbleDiv = document.createElement("div");
    bubbleDiv.className = "message-bubble";
    bubbleDiv.innerHTML = `<div class="typing-indicator"><img src="img/logo.svg" alt="Thinking..."><span>is thinking...</span></div>`;
    typingIndicatorContainer.appendChild(senderDiv);
    typingIndicatorContainer.appendChild(bubbleDiv);
    chatBox.appendChild(typingIndicatorContainer);
    chatBox.scrollTop = chatBox.scrollHeight;

    try {
      const data = await apiCall("/chat", {
        method: "POST",
        body: JSON.stringify({ message, userId: userId })
      });
      const indicator = document.getElementById("typing-indicator-container");
      if (indicator) {
        chatBox.removeChild(indicator);
      }
      if (data.reply) {
        addMessage("agent", data.reply);
      }
      if (data.events && data.events.length > 0) {
        console.log(`✅ ${data.events.length} calendar event(s) detected. Saving to calendar...`);
        for (const event of data.events) {
          try {
            await apiCall("/api/save-event", {
              method: "POST",
              body: JSON.stringify({ event, user_id: userId })
            });
            console.log(`✅ Event saved: ${event.title}`);
          } catch (saveError) {
            console.error(`❌ Failed to save event ${event.title}:`, saveError);
          }
        }
        fetchAndRenderEvents();
      }
    } catch (err) {
      console.error("Chat error:", err);
      const indicator = document.getElementById("typing-indicator-container");
      if (indicator) {
        chatBox.removeChild(indicator);
      }
      addMessage("agent", "Sorry, I'm having trouble connecting. Please try again later.");
    }
  });

  setTimeout(() => {
    addMessage("agent", "Hi. I'm your personal chief of staff. What can I help you with today?");
  }, 500);
}
