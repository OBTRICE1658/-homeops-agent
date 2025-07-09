// GLOBAL CLICK DEBUGGER
window.addEventListener('click', function(e) {
  console.log('[DEBUG] Global click:', e.target, 'Class:', e.target.className);
});
// HomeOps Modern Chat UI - ChatGPT-Inspired
// Built with HomeOps Design System from Figma Mockup

window.initializeChat = function(auth, user, retryCount = 0) {
  let messages = [];
  let isTyping = false;

  console.log("💬 Initializing modern HomeOps chat for user:", user ? user.uid : "test_user");
  
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
  
  // Render sidebar and chat shell
  chatRoot.innerHTML = `
    <aside class="sidebar">
      <img src="img/homeops-logo.svg" class="sidebar-logo" alt="HomeOps logo" />
      <button class="nav-icon active" title="Chat"><i data-lucide="message-circle"></i></button>
      <button class="nav-icon" title="Calendar"><i data-lucide="calendar"></i></button>
      <button class="nav-icon" title="Dashboard"><i data-lucide="layout-dashboard"></i></button>
    </aside>
    <div class="chat-shell">
      <div class="chat-main">
        <div class="chat-thread" id="chatThread"></div>
      </div>
      <div class="chat-input-bar">
        <form class="chat-input-form compact" onsubmit="return false;">
          <textarea class="chat-input" placeholder="Ask HomeOps anything..." autocomplete="off" maxlength="1000" rows="1" style="resize: none;"></textarea>
          <button type="submit" class="send-button">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          </button>
        </form>
      </div>
      <div class="chat-footer">Reduce Your Mental Load</div>
    </div>
  `;
  if (window.lucide && window.lucide.createIcons) window.lucide.createIcons();

  const chatThread = document.getElementById('chatThread');
  const chatInput = document.querySelector('.chat-input');
  const chatForm = document.querySelector('.chat-input-form');
  const charCount = document.getElementById('charCount');

  // Smart chip suggestions for first-time users
  const suggestions = [
    "Remind me about something",
    "Check my calendar",
    "Review recent emails",
    "Help me unblock a problem",
    "Add golf this Saturday at 10am to my calendar"
  ];

  // --- Chat History Persistence ---
  const CHAT_HISTORY_KEY = 'homeops_chat_history';

  function saveChatHistory(messages) {
    localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(messages));
  }

  function loadChatHistory() {
    const raw = localStorage.getItem(CHAT_HISTORY_KEY);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  // Onboarding: clear chat history for first-time user
  if (!localStorage.getItem('homeops_onboarded')) {
    localStorage.removeItem('homeops_chat_history');
    localStorage.removeItem('homeops_chat_draft');
    localStorage.setItem('homeops_onboarded', '1');
  }

  // Remove onboarding overlay logic
  // Instead, on chat initialization, if there are no messages, add a welcome message from HomeOps

  const WELCOME_MESSAGE = `
<div class="homeops-welcome-message">
  <div class="welcome-intro"><b>Hi—I'm HomeOps</b>, your personal chief of staff and your mental load operating system.<br>My job is simple: help you run your life more efficiently.</div>
  <div class="welcome-sub">How can I help you today?</div>
  <ul class="welcome-examples">
    <li><i data-lucide="brain"></i> What's going on at my kid’s school this week?</li>
    <li><i data-lucide="calendar-plus"></i> Add Lucy’s dentist appointment for Thursday at 2pm.</li>
    <li><i data-lucide="box"></i> When did I last order paper towels?</li>
    <li><i data-lucide="banknote"></i> Anything from the club I should know about?</li>
    <li><i data-lucide="stethoscope"></i> Put a doctor’s appointment on my calendar</li>
    <li><i data-lucide="bell"></i> Remind me about something</li>
    <li><i data-lucide="help-circle"></i> Help me unblock a problem</li>
  </ul>
</div>`;

  // On page load, load chat history and render
  messages = loadChatHistory();
  if (messages.length === 0) {
    addMessage('agent', WELCOME_MESSAGE);
  }
  renderMessages();
  chatInput.value = '';

  // Draft saving
  chatInput.value = localStorage.getItem('homeops_chat_draft') || '';
  chatInput.addEventListener('input', () => {
    localStorage.setItem('homeops_chat_draft', chatInput.value);
    chatInput.style.height = 'auto';
    chatInput.style.height = Math.min(chatInput.scrollHeight, 72) + 'px';
  });

  // Animate input bar after first message
  function expandInputBar() {
    chatForm.classList.remove('compact');
    chatForm.classList.add('expanded');
    chatInput.rows = 2;
    chatInput.style.minHeight = '48px';
    chatInput.style.maxHeight = '120px';
  }

  // Markdown rendering (basic)
  function renderMarkdown(text) {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
      .replace(/\n\n/g, '<br/><br/>')
      .replace(/\n/g, '<br/>')
      .replace(/\- (.*?)(?=\n|$)/g, '<li>$1</li>')
      .replace(/<li>(.*?)<\/li>/g, '<ul><li>$1</li></ul>');
  }

  // Render all messages with grouping and animation
  function renderMessages() {
    chatThread.innerHTML = '';
    messages.forEach((msg, idx) => {
      const group = document.createElement('div');
      group.className = 'message-group';
      const row = document.createElement('div');
      row.className = 'message-row ' + msg.sender;
      if (msg.sender === 'agent') {
        const avatar = document.createElement('span');
        avatar.className = 'agent-avatar';
        avatar.innerHTML = "<img src='img/homeops-logo.svg' alt='HomeOps' />";
        row.appendChild(avatar);
        const bubble = document.createElement('div');
        bubble.className = 'message-bubble';
        bubble.innerHTML = renderMarkdown(msg.text);
        row.appendChild(bubble);
      } else {
        const bubble = document.createElement('div');
        bubble.className = 'message-bubble';
        bubble.textContent = msg.text;
        row.appendChild(bubble);
      }
      group.appendChild(row);
      // Timestamp below, faded
      const ts = document.createElement('div');
      ts.className = 'message-timestamp';
      ts.textContent = msg.time;
      group.appendChild(ts);
      chatThread.appendChild(group);
    });
    // Always scroll to bottom after rendering messages
    setTimeout(() => {
      chatThread.scrollTop = chatThread.scrollHeight;
    }, 0);
  }
  
  // Typing indicator
  function showTyping() {
    const typing = document.createElement('div');
    typing.className = 'typing-indicator';
    for (let i = 0; i < 3; i++) {
      const dot = document.createElement('div');
      dot.className = 'typing-dot';
      typing.appendChild(dot);
    }
    chatThread.appendChild(typing);
    // Scroll to show typing indicator
    setTimeout(() => {
      chatThread.scrollTop = chatThread.scrollHeight;
    }, 10);
    return typing;
  }
  function removeTyping(typing) {
    if (typing && typing.parentNode) typing.parentNode.removeChild(typing);
  }
  
  // Add a message
  function addMessage(sender, text) {
    const now = new Date();
    messages.push({ sender, text, time: now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) });
    saveChatHistory(messages);
    renderMessages();
  }
  
  // Replace getAgentReply with real backend call and direct calendar injection
  async function getAgentReply(userText) {
    try {
      const res = await fetch('/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          user_id: user && user.uid ? user.uid : 'test_user',
          context: {} // Add more context if needed (tone, calendar, etc)
        })
      });
      if (!res.ok) throw new Error('Agent API error');
      const data = await res.json();
      // If events are present, add the first event directly to the calendar
      if (data.events && Array.isArray(data.events) && data.events.length > 0) {
        const event = data.events[0];
        // Prepare event data for API
          const eventData = {
          user_id: user && user.uid ? user.uid : 'test_user',
          title: event.title || '',
          start: event.start || '',
          allDay: !!event.allDay,
          location: event.location || '',
          description: event.description || ''
        };
        // Add end time if available
        if (event.end) eventData.end = event.end;
        // POST to /api/add-event
          fetch('/api/add-event', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(eventData)
          })
        .then(res => res.json())
          .then(result => {
            if (result.success) {
            showToast('Event added to your calendar!');
            // Refresh calendar if open
            if (window.calendar && typeof window.calendar.refetchEvents === 'function') {
                window.calendar.refetchEvents();
              }
            } else if (result.duplicate) {
            showToast('Event already exists in your calendar!');
            } else {
            showToast('Failed to add event to calendar');
          }
        })
        .catch(() => showToast('Error adding event to calendar'));
      }
      return data.reply || data.message || JSON.stringify(data);
    } catch (err) {
      console.error('Agent error:', err);
      return "Sorry, I'm having trouble connecting to HomeOps right now.";
    }
  }
  
  // Simple toast/snackbar
  function showToast(msg) {
    let toast = document.getElementById('homeops-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'homeops-toast';
      toast.style.position = 'fixed';
      toast.style.bottom = '32px';
      toast.style.left = '50%';
      toast.style.transform = 'translateX(-50%)';
      toast.style.background = 'linear-gradient(90deg,#7E5EFF,#B8A3FF)';
      toast.style.color = '#fff';
      toast.style.padding = '14px 32px';
      toast.style.borderRadius = '999px';
      toast.style.fontSize = '16px';
      toast.style.fontWeight = '600';
      toast.style.boxShadow = '0 4px 24px rgba(126,94,255,0.13)';
      toast.style.zIndex = '9999';
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.style.opacity = '1';
    setTimeout(() => { toast.style.opacity = '0'; }, 2600);
  }
  
  // Handle form submit
  chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = chatInput.value.trim();
    if (!text) return;
    // Remove onboarding overlay if present
    // const welcome = document.getElementById('homeops-welcome');
    // if (welcome) {
    //   welcome.remove();
    //   document.body.style.overflow = '';
    //   markWelcomeSeen();
    // }
    addMessage('user', text);
    chatInput.value = '';
    expandInputBar();
    // Typing indicator
    const typing = showTyping();
    try {
      const reply = await getAgentReply(text);
      removeTyping(typing);
      addMessage('agent', reply);
    } catch (err) {
      removeTyping(typing);
      addMessage('agent', "Sorry, I'm having trouble connecting to HomeOps right now.");
    }
  });
  // Attach event listeners to CTA buttons
  document.addEventListener('click', function(e) {
    if (e.target.classList.contains('homeops-welcome-cta') || e.target.closest('.homeops-welcome-cta')) {
      const btn = e.target.classList.contains('homeops-welcome-cta') ? e.target : e.target.closest('.homeops-welcome-cta');
      console.log('[HomeOps] CTA pill clicked:', btn.getAttribute('data-action'));
      // const welcome = document.getElementById('homeops-welcome');
      // if (welcome) {
      //   console.log('[DEBUG] Removing homeops-welcome overlay');
      //   welcome.remove();
      //   document.body.style.overflow = '';
      //   markWelcomeSeen();
      // }
      // Fill chat input and trigger send based on data-action
      const action = btn.getAttribute('data-action');
      let prompt = '';
      if (action === 'start-chat') {
        prompt = "Hi!";
      }
      if (prompt) {
        const chatInput = document.querySelector('.chat-input');
        const chatForm = document.querySelector('.chat-input-form');
        if (chatInput && chatForm) {
          chatInput.value = prompt;
          chatInput.focus();
          setTimeout(() => {
            const submitEvent = new Event('submit', {bubbles: true, cancelable: true});
            const dispatched = chatForm.dispatchEvent(submitEvent);
            console.log('[HomeOps] Dispatched submit:', dispatched);
            // Fallback: manually call submit if event not handled
            if (!dispatched) {
              if (typeof chatForm.submit === 'function') chatForm.submit();
            }
          }, 250);
        } else {
          console.warn('[HomeOps] Could not find chat input or form');
        }
      }
    }
  });
  
  // Remove char count and handle Enter/Shift+Enter for textarea
  chatInput.removeEventListener('keydown', window._homeopsEnterHandler || (()=>{}));
  window._homeopsEnterHandler = function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      chatForm.dispatchEvent(new Event('submit', {bubbles:true}));
    }
    // Shift+Enter inserts newline (default)
  };
  chatInput.addEventListener('keydown', window._homeopsEnterHandler);
  if (charCount) charCount.remove();
};
