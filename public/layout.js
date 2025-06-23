console.log("🧠 layout.js is loading");
document.addEventListener("DOMContentLoaded", () => {
  console.log("🧠 layout.js is loading");

  try {
    window.calendar = null;
    window.calendarRendered = false;
    window.userIdReady = false; // Global flag to track if userId is ready

    lucide.createIcons();

    const views = document.querySelectorAll(".view");
    const navButtons = document.querySelectorAll(".nav-item");
    const bottomNavButtons = document.querySelectorAll(".bottom-nav button");
    const toggleTheme = document.getElementById("toggleTheme");

    function activateView(viewId) {
      console.log("🔄 Switching to view:", viewId);

      views.forEach((view) => {
        view.style.display = "none";
      });

      const activeView = document.getElementById(`${viewId}-view`);
      if (activeView) {
        activeView.style.display = "block";
        console.log("✅ Activated view:", viewId);
      } else {
        console.warn("🚫 View not found:", viewId);
      }

      // Handle calendar rendering and refreshing
      if (viewId === "calendar") {
        // Defensive: Only initialize if userId is set and ready
        if (!window.userId || !window.userIdReady) {
          console.warn("⏳ Tried to initialize calendar before userId was ready. Waiting...");
          const calendarEl = document.getElementById("calendar");
          if (calendarEl) {
            calendarEl.innerHTML = '<div style="color:orange;text-align:center;padding:2em;">⏳ Loading user data... Please wait for authentication.</div>';
          }
          // Retry after 500ms
          setTimeout(() => {
            if (window.userId && window.userIdReady && !window.calendarRendered) {
              console.log("🟢 Retrying calendar initialization after userId became available");
              renderCalendar();
            }
          }, 500);
          return;
        }
        if (!window.calendarRendered) {
          renderCalendar();
        } else if (window.calendar) {
          console.log("🔄 Calendar view activated.");
          // Force FullCalendar to re-render and update its size/layout
          setTimeout(() => {
            if (window.calendar && typeof window.calendar.render === 'function') {
              window.calendar.render();
              console.log("🔄 Called calendar.render() after view switch");
            }
            if (window.calendar && typeof window.calendar.updateSize === 'function') {
              window.calendar.updateSize();
              console.log("🔄 Called calendar.updateSize() after view switch");
            }
          }, 50);
        }
      }
    }

    window.activateView = activateView;

    // Global function to initialize calendar when userId is available
    window.initializeCalendarIfReady = function() {
      if (window.userId && window.userIdReady && !window.calendarRendered) {
        console.log("🟢 initializeCalendarIfReady called, userId ready");
        renderCalendar();
      } else if (!window.userId || !window.userIdReady) {
        console.log("⏳ initializeCalendarIfReady called, but userId not ready yet");
      } else {
        console.log("ℹ️ initializeCalendarIfReady called, calendar already rendered");
      }
    };

    function handleNavClick(button) {
      const viewId = button.getAttribute("data-view");
      if (viewId) {
        activateView(viewId);

        // Update active class for sidebar nav
        navButtons.forEach((btn) => {
          btn.classList.toggle("active", btn.getAttribute("data-view") === viewId);
        });
      }
    }

    navButtons.forEach(button => {
      button.addEventListener("click", () => handleNavClick(button));
    });

    bottomNavButtons.forEach(button => {
      button.addEventListener("click", () => {
        const viewId = button.getAttribute("data-view");
        if (viewId) {
          activateView(viewId);
        }
      });
    });

    function renderCalendar() {
      console.log("🔄 renderCalendar called");
      console.log("🔄 window.userId:", window.userId);
      console.log("🔄 window.userIdReady:", window.userIdReady);
      console.log("🔄 window.calendarRendered:", window.calendarRendered);
      
      // Prevent duplicate initialization
      if (window.calendarRendered && window.calendar) {
        console.log("ℹ️ Calendar already rendered, skipping duplicate initialization");
        return;
      }
      
      const calendarEl = document.getElementById("calendar");
      if (!calendarEl || typeof FullCalendar === "undefined") {
        console.error("Calendar element or FullCalendar library not found.");
        if (calendarEl) {
          calendarEl.innerHTML = '<div style="color:red;text-align:center;padding:2em;">❌ Calendar failed to load. Please check your internet connection and that FullCalendar CSS/JS are included.</div>';
        }
        return;
      }
      
      if (!window.userId || !window.userIdReady) {
        console.error("❌ window.userId is not ready when trying to render calendar");
        calendarEl.innerHTML = '<div style="color:orange;text-align:center;padding:2em;">⏳ Loading user data...</div>';
        
        // Retry in 1 second if userId becomes available
        setTimeout(() => {
          if (window.userId && window.userIdReady && !window.calendarRendered) {
            console.log("🟢 Retrying calendar initialization after userId became available");
            renderCalendar();
          } else if (!window.userId) {
            calendarEl.innerHTML = '<div style="color:red;text-align:center;padding:2em;">❌ User not authenticated. Please log in again.</div>';
          }
        }, 1000);
        return;
      }
      
      console.log("✅ Proceeding with calendar initialization");
      window.calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: "dayGridMonth",
        height: "auto",
        headerToolbar: {
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay"
        },
        events: function(fetchInfo, successCallback, failureCallback) {
          const url = `/api/get-events?user_id=${window.userId}`;
          console.log("🟢 FullCalendar fetching events from:", url);
          console.log("🟢 Current window.userId:", window.userId);
          fetch(url)
            .then(response => {
              console.log("🟢 Response status:", response.status);
              console.log("🟢 Response ok:", response.ok);
              return response.json();
            })
            .then(events => {
              console.log("🟢 Events fetched for calendar:", events);
              console.log("🟢 Events type:", typeof events);
              console.log("🟢 Events length:", Array.isArray(events) ? events.length : 'not an array');
              if (!Array.isArray(events) || events.length === 0) {
                console.log("⚠️ No events found, showing warning");
                calendarEl.innerHTML = '<div style="color:orange;text-align:center;padding:2em;">⚠️ No events found for your account.</div>';
                successCallback([]);
                return;
              }
              console.log("✅ Calling successCallback with events");
              successCallback(events);
            })
            .catch(err => {
              console.error("❌ Error fetching events:", err);
              calendarEl.innerHTML = '<div style="color:red;text-align:center;padding:2em;">❌ Failed to fetch events from server.</div>';
              failureCallback(err);
            });
        }
      });
      window.calendar.render();
      window.calendarRendered = true;
      console.log("✅ Calendar initialized");

      // Add any events that were created before the calendar was ready
      if (window.pendingCalendarEvents && window.pendingCalendarEvents.length > 0) {
        window.pendingCalendarEvents.forEach(event => {
          window.calendar.addEvent(event);
        });
        window.pendingCalendarEvents = []; // Clear the queue
        console.log("✅ Added pending events to calendar.");
      }
    }

    const clearEventsBtn = document.getElementById("clear-events-btn");
    if (clearEventsBtn) {
      clearEventsBtn.addEventListener("click", async () => {
        if (!confirm("Are you sure you want to delete ALL your calendar events? This cannot be undone.")) {
          return;
        }
        if (!window.userId) {
          alert("Could not clear events: User not identified.");
          return;
        }
        try {
          const res = await fetch("/api/clear-events", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user_id: window.userId }),
          });
          const result = await res.json();
          if (result.success) {
            alert("All events have been cleared.");
            if (window.calendar) {
              window.calendar.refetchEvents();
            }
          } else {
            alert("Error clearing events: " + result.error);
          }
        } catch (err) {
          alert("An error occurred while clearing events.");
          console.error("Clear events error:", err);
        }
      });
    }

    // Default to chat view on load
    activateView("chat");
    document.querySelector('.nav-item[data-view="chat"]').classList.add("active");

    if (toggleTheme) {
      toggleTheme.addEventListener("click", () => {
        document.body.classList.toggle("dark");
      });
    }

    const reframeBtn = document.querySelector('.reframe-btn');
    const reframeInput = document.querySelector('.reframe-input');
    const reframeOutput = document.querySelector('.reframe-output');

    if (reframeBtn) {
      reframeBtn.addEventListener('click', async () => {
        const challenge = reframeInput.value;
        if (!challenge.trim()) {
          reframeOutput.innerHTML = `<p style="color: #c0392b;">Please enter a challenge first.</p>`;
          return;
        }

        reframeOutput.innerHTML = '<p>Getting your re-frame...</p>';
        reframeBtn.disabled = true;

        try {
          const response = await fetch('/api/reframe-protocol', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ challenge })
          });

          if (!response.ok) {
            throw new Error('Failed to get a response from the server.');
          }

          const data = await response.json();
          
          reframeOutput.innerHTML = `
            <div class="reframe-result">
              <h4>${data.title}</h4>
              <p class="reframe-core">"${data.reframe}"</p>
              <h5>${data.action.header}</h5>
              <ul>
                ${data.action.steps.map(step => `<li>${step}</li>`).join('')}
              </ul>
              <h6>The Science Behind It</h6>
              <p class="reframe-science">${data.science}</p>
            </div>
          `;

        } catch (error) {
          reframeOutput.innerHTML = `<p style="color: #c0392b;">Sorry, something went wrong. Please try again.</p>`;
          console.error('Re-frame Error:', error);
        } finally {
          reframeBtn.disabled = false;
        }
      });
    }

    if (typeof firebase !== 'undefined' && firebase.auth) {
      firebase.auth().onAuthStateChanged((user) => {
        if (user) {
          window.userId = user.uid;
          console.log('✅ window.userId set:', window.userId);
          // Only initialize calendar if it hasn't been rendered yet
          if (!window.calendarRendered) {
            renderCalendar();
            console.log('🔄 Calendar initialized after userId set');
          }
        }
      });
    }

  } catch (err) {
    console.error("💥 layout.js crash:", err);
  }
});
