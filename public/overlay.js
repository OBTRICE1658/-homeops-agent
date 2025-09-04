// overlay.js - Overlay management for HomeOps UI vNext
export const Overlay = (() => {
  let activeId = null;

  function open(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.hidden = false;
    document.body.style.overflow = 'hidden';
    activeId = id;
    trapFocus(el);
  }

  function close(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.hidden = true;
    document.body.style.overflow = '';
    activeId = null;
  }

  function trapFocus(root) {
    const focusables = root.querySelectorAll('button, [href], input, textarea, [tabindex]:not([tabindex="-1"])');
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    
    const handleKeydown = (e) => {
      if (e.key === 'Escape') {
        close(root.id);
        return;
      }
      
      if (e.key !== 'Tab') return;
      
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    };
    
    root.addEventListener('keydown', handleKeydown);
    
    // Focus first element after a brief delay
    setTimeout(() => first?.focus(), 0);
    
    // Store cleanup function for later removal
    root._keydownHandler = handleKeydown;
  }

  function bind() {
    const emailBtn = document.getElementById('btn-email');
    const calendarBtn = document.getElementById('btn-calendar');
    
    emailBtn?.addEventListener('click', () => open('email-overlay'));
    calendarBtn?.addEventListener('click', () => open('calendar-overlay'));
    
    // Handle close buttons and backdrop clicks
    document.querySelectorAll('[data-close]').forEach((el) => {
      el.addEventListener('click', (e) => {
        const overlayId = e.currentTarget.dataset.close;
        close(overlayId);
      });
    });
    
    // Global escape key handler
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && activeId) {
        close(activeId);
      }
    });
  }

  return { open, close, bind };
})();

// Make Overlay available globally for other modules
window.Overlay = Overlay;

// Initialize when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide icons
  if (window.lucide && window.lucide.createIcons) {
    window.lucide.createIcons();
  }
  
  // Bind overlay events
  Overlay.bind();
  
  // Focus composer input on desktop
  if (window.innerWidth >= 768) {
    const composerInput = document.getElementById('composer-input');
    setTimeout(() => composerInput?.focus(), 100);
  }
});
