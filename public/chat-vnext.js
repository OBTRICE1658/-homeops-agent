// chat.js - Main chat functionality for HomeOps UI vNext
// Import overlay functionality (will be available globally)
// import { Overlay } from './overlay.js';

const thread = document.getElementById('chat-thread');
const form = document.getElementById('composer');
const input = document.getElementById('composer-input');

function el(tag, cls, html) { 
  const e = document.createElement(tag); 
  if (cls) e.className = cls; 
  if (html) e.innerHTML = html; 
  return e; 
}

function pushMessage(text, role = 'me', ctas = []) {
  const m = el('div', `message ${role === 'me' ? 'me' : ''}`);
  m.textContent = text;
  
  if (ctas.length) {
    const row = el('div', 'email-actions');
    ctas.forEach((cta) => {
      const b = el('button', 'chip');
      b.textContent = cta.label;
      b.addEventListener('click', () => handleCta(cta));
      row.appendChild(b);
    });
    m.appendChild(row);
  }
  
  thread.appendChild(m);
  thread.scrollTop = thread.scrollHeight;
}

async function handleCta(cta) {
  try {
    switch (cta.type) {
      case 'open_email_overlay':
        await EmailPanel.load();
        window.Overlay.open('email-overlay');
        break;
      case 'open_calendar_overlay':
        await CalendarPanel.ensure();
        window.Overlay.open('calendar-overlay');
        break;
      case 'add_to_calendar':
        await CalendarPanel.quickAdd(cta.payload);
        window.Overlay.open('calendar-overlay');
        break;
      default:
        console.warn('Unknown CTA', cta);
    }
  } catch (error) {
    console.error('CTA handler error:', error);
    toast('Something went wrong. Please try again.');
  }
}

// Chat form submission
form?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  
  pushMessage(text, 'me');
  input.value = '';
  input.disabled = true;

  try {
    const res = await fetch('/api/chat', { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify({ message: text, userId: 'me' }) 
    });
    
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    
    const data = await res.json();
    
    // Handle enhanced chat response structure
    const reply = data.response || data.reply || 'I received your message but couldn\'t generate a response.';
    pushMessage(reply);
    
    // Add CTAs if present
    if (Array.isArray(data.ctas) && data.ctas.length) {
      const last = thread.lastElementChild;
      const row = el('div', 'email-actions');
      data.ctas.forEach((cta) => {
        const b = el('button', 'chip'); 
        b.textContent = cta.label; 
        b.addEventListener('click', () => handleCta(cta)); 
        row.appendChild(b);
      });
      last.appendChild(row);
    }
  } catch (err) {
    console.error('Chat error:', err);
    pushMessage('Sorry — I hit a snag. Try again in a moment.');
  } finally {
    input.disabled = false;
    input.focus();
  }
});

// ---------- Email Overlay ----------
export const EmailPanel = (() => {
  const listEl = document.getElementById('email-list');
  let loaded = false;

  async function load(force = false) {
    if (loaded && !force) return;
    renderSkeletons();
    
    try {
      const res = await fetch('/api/email/important?limit=20');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      
      const data = await res.json();
      renderList(data.items || []);
      loaded = true;
    } catch (e) {
      console.error('Email load error:', e);
      listEl.innerHTML = `<div class="error-message">Couldn't load emails. Please try again.</div>`;
    }
  }

  function renderSkeletons(n = 6) {
    listEl.innerHTML = '';
    for (let i = 0; i < n; i++) {
      const card = el('div', 'email-card skeleton');
      card.style.height = '96px';
      listEl.appendChild(card);
    }
  }

  function renderList(items) {
    if (!items.length) {
      listEl.innerHTML = `
        <div class="empty-state">
          <h3>No important emails</h3>
          <p>Your inbox is all caught up!</p>
        </div>
      `;
      return;
    }
    
    listEl.innerHTML = '';
    items.forEach((it) => listEl.appendChild(renderCard(it)));
  }

  function renderCard(it) {
    const card = el('article', 'email-card');
    
    const subject = el('div', 'email-meta');
    subject.innerHTML = `<strong>${escapeHtml(it.subject)}</strong>`;
    
    const meta = el('div', 'email-meta');
    meta.innerHTML = `${escapeHtml(it.from)} • ${formatDate(it.receivedAt)}`;
    
    const summary = el('div', '');
    summary.textContent = it.summary || 'No summary available';
    
    const actions = el('div', 'email-actions');

    // Add to Calendar (if payload present)
    const addAct = it.suggestedActions?.find(a => a.type === 'add_to_calendar');
    if (addAct) {
      const b = el('button', 'chip');
      b.textContent = 'Add to Calendar';
      b.addEventListener('click', async () => {
        try {
          await CalendarPanel.quickAdd(addAct.payload, it);
          toast('Event added to calendar');
        } catch (error) {
          toast('Could not add event');
        }
      });
      actions.appendChild(b);
    }

    // Draft Reply
    const draftBtn = el('button', 'chip'); 
    draftBtn.textContent = 'Draft Reply';
    draftBtn.addEventListener('click', async () => {
      try {
        draftBtn.disabled = true;
        draftBtn.textContent = 'Drafting...';
        const draft = await draftReply(it.messageId);
        copyToClipboard(draft);
        toast('AI draft copied to clipboard');
      } catch (error) {
        toast('Could not generate draft');
      } finally {
        draftBtn.disabled = false;
        draftBtn.textContent = 'Draft Reply';
      }
    });

    // Open in Gmail
    const openBtn = el('button', 'chip'); 
    openBtn.textContent = 'View Email';
    openBtn.addEventListener('click', () => {
      const url = it.gmailUrl || `https://mail.google.com/mail/u/0/#inbox/${it.threadId}`;
      window.open(url, '_blank');
    });

    actions.appendChild(draftBtn);
    actions.appendChild(openBtn);

    card.appendChild(subject); 
    card.appendChild(meta); 
    card.appendChild(summary); 
    card.appendChild(actions);
    
    return card;
  }

  async function draftReply(messageId) {
    const res = await fetch('/api/email/draft', { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify({ messageId, styleHints: { tone: 'polite' } }) 
    });
    
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    
    const data = await res.json();
    return data.draft || '';
  }

  return { load };
})();

// ---------- Calendar Overlay ----------
export const CalendarPanel = (() => {
  let bootstrapped = false;
  let calendar = null;

  async function ensure() {
    if (bootstrapped) return; 
    bootstrapped = true;
    
    try {
      // Lazy load FullCalendar
      await loadScript('https://cdn.jsdelivr.net/npm/fullcalendar@6.1.15/index.global.min.js');
      render();
    } catch (error) {
      console.error('Calendar init error:', error);
      const root = document.getElementById('calendar-root');
      root.innerHTML = `<div class="error-message">Could not load calendar. Please refresh and try again.</div>`;
    }
  }

  function render() {
    const root = document.getElementById('calendar-root');
    root.innerHTML = '';
    const calEl = document.createElement('div');
    root.appendChild(calEl);
    
    calendar = new window.FullCalendar.Calendar(calEl, {
      initialView: window.innerWidth < 700 ? 'listWeek' : 'dayGridMonth',
      height: '100%',
      headerToolbar: { 
        start: 'prev,next today', 
        center: 'title', 
        end: 'dayGridMonth,timeGridDay,listWeek' 
      },
      events: async (info, success, failure) => {
        try {
          const res = await fetch(`/api/calendar-events/me`);
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          
          const data = await res.json();
          success(data.items || data.events || []);
        } catch (e) { 
          console.error('Calendar events error:', e);
          failure(e); 
        }
      },
      eventClick: (arg) => {
        const event = arg.event;
        const startTime = event.start?.toLocaleString() || 'No time';
        toast(`${event.title} — ${startTime}`);
      },
      // Handle responsive view switching
      windowResize: function() {
        if (window.innerWidth < 700) {
          calendar.changeView('listWeek');
        } else {
          calendar.changeView('dayGridMonth');
        }
      }
    });
    
    calendar.render();
  }

  async function quickAdd(payload, emailItem) {
    await ensure();
    
    const body = {
      title: payload?.title || (emailItem?.subject ?? 'HomeOps Event'),
      start: payload?.start,
      end: payload?.end,
      description: payload?.description || `Created from email: ${emailItem?.subject || 'Unknown'}`,
      origin: 'email-decoder',
      context: emailItem ? { 
        from: emailItem.from, 
        subject: emailItem.subject, 
        messageId: emailItem.messageId 
      } : null
    };
    
    try {
      const res = await fetch('/api/calendar-events', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(body) 
      });
      
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      
      // Refresh calendar events
      if (calendar) {
        calendar.refetchEvents();
      }
      
      toast('Event added to calendar');
    } catch (e) {
      console.error('Calendar add error:', e);
      toast('Could not add event');
    }
  }

  return { ensure, quickAdd };
})();

// ---------- Utilities ----------
function escapeHtml(s='') { 
  return s.replace(/[&<>"]/g, (c) => ({
    '&':'&amp;',
    '<':'&lt;',
    '>':'&gt;',
    '"':'&quot;'
  }[c])); 
}

function copyToClipboard(text) { 
  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(text);
  } else {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
  }
}

function toast(msg) {
  const t = el('div', 'toast'); 
  t.textContent = msg; 
  document.body.appendChild(t); 
  
  setTimeout(() => {
    t.style.opacity = '0';
    setTimeout(() => t.remove(), 200);
  }, 2000);
}

function loadScript(src) { 
  return new Promise((resolve, reject) => { 
    const s = document.createElement('script'); 
    s.src = src; 
    s.onload = resolve; 
    s.onerror = reject; 
    document.head.appendChild(s); 
  }); 
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else {
    return date.toLocaleDateString();
  }
}

// Preload email overlay after idle
window.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => EmailPanel.load().catch(()=>{}), 1200);
});
