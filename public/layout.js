console.log("🧠 layout.js is loading");
async function initializeFirebase() {
  try {
    const response = await fetch('/api/firebase-config');
    const firebaseConfig = await response.json();
    firebase.initializeApp(firebaseConfig);
    return firebase.auth();
  } catch (error) {
    console.error('Failed to initialize Firebase:', error);
    throw error;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  console.log("🧠 layout.js is loading");

  try {
    window.calendar = null;
    window.calendarRendered = false;
    window.userId = null;
    window.userIdReady = false;

    lucide.createIcons();

    const views = document.querySelectorAll(".view");
    const navButtons = document.querySelectorAll(".nav-item");
    const bottomNavButtons = document.querySelectorAll(".bottom-nav button");
    const toggleTheme = document.getElementById("toggleTheme");

    function activateView(viewId) {
      // Hide all views
      document.querySelectorAll('.view').forEach(view => {
        view.classList.remove('active');
      });
      // Show the selected view
      const activeView = document.getElementById(`${viewId}-view`);
      if (activeView) {
        activeView.classList.add('active');
      }
      // Hide calendar unless calendar view is active
      const calendarEl = document.getElementById('calendar');
      if (calendarEl) {
        if (viewId === 'calendar') {
          calendarEl.style.display = 'block';
          if (!window.calendarRendered) {
            renderCalendar();
          }
        } else {
          calendarEl.style.display = 'none';
        }
      }
      // Update nav active state
      document.querySelectorAll('.nav-item').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-view') === viewId);
      });
      // Update bottom nav active state
      document.querySelectorAll('.bottom-nav button').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-view') === viewId);
      });
    }

    window.activateView = activateView;

    function handleNavClick(button) {
      const viewId = button.getAttribute("data-view");
      if (viewId) {
        activateView(viewId);
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

    // Only run Firebase Auth logic after Firebase is initialized
    initializeFirebase().then(authInstance => {
      const auth = authInstance;
      console.log("🔥 Firebase auth available, setting up auth state listener");
      // Check authentication state
      auth.onAuthStateChanged((user) => {
        if (!user) {
          // User is not signed in, redirect to login
          window.location.href = '/';
        } else {
          // User is signed in, display email
          document.getElementById('userEmail').textContent = user.email;
          window.userId = user.uid;
          window.userIdReady = true;
        }
      });

      // Handle logout
      document.getElementById('logoutBtn').addEventListener('click', async () => {
        try {
          await auth.signOut();
          // Redirect will happen automatically via onAuthStateChanged
        } catch (error) {
          console.error('Logout error:', error);
        }
      });

      // On load, set chat view as active
      activateView('chat');
    }).catch(error => {
      console.error('Firebase initialization failed:', error);
      document.body.innerHTML = '<div style="text-align: center; padding: 50px;"><h2>Service Unavailable</h2><p>Unable to initialize authentication service.</p></div>';
    });

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

    // --- Calendar logic remains outside, but only uses window.userIdReady/window.userId
    function renderCalendar() {
      console.log("🔄 renderCalendar called");
      console.log("🔄 window.userId:", window.userId);
      console.log("🔄 window.userIdReady:", window.userIdReady);
      console.log("🔄 window.calendarRendered:", window.calendarRendered);
      console.log("🔄 FullCalendar available:", typeof FullCalendar !== 'undefined');
      
      const calendarEl = document.getElementById("calendar");
      console.log("🔄 Calendar element found:", !!calendarEl);
      
      if (!calendarEl) {
        console.error("❌ Calendar element not found");
        return;
      }

      // Check calendar element dimensions
      const rect = calendarEl.getBoundingClientRect();
      console.log("🔄 Calendar element dimensions:", rect.width, "x", rect.height);
      console.log("🔄 Calendar element display:", window.getComputedStyle(calendarEl).display);
      console.log("🔄 Calendar element visibility:", window.getComputedStyle(calendarEl).visibility);

      // Force calendar element to have proper dimensions
      if (rect.height === 0) {
        console.log("⚠️ Calendar element has 0 dimensions, forcing size");
        calendarEl.style.height = "600px";
        calendarEl.style.minHeight = "600px";
        calendarEl.style.width = "100%";
        calendarEl.style.display = "block";
        console.log("🔄 Applied forced styles to calendar element");
      }

      if (typeof FullCalendar === "undefined") {
        console.error("❌ FullCalendar library not found");
        return;
      }

      if (window.calendarRendered) {
        console.log("🔄 Calendar already rendered, skipping");
        return;
      }

      console.log("🔄 Proceeding with calendar initialization");

      // Create calendar with proper event fetching
      window.calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: "dayGridMonth",
        height: "auto",
        headerToolbar: {
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay"
        },
        events: function(fetchInfo, successCallback, failureCallback) {
          const userId = window.userId || "ER4LFJqyUidTfc4a53DaPjeZYKE3";
          const url = `/api/get-events?user_id=${userId}`;
          console.log("🟢 FullCalendar fetching events from:", url);
          console.log("🟢 Current window.userId:", window.userId);
          
          fetch(url)
            .then(response => {
              console.log("🟢 Response status:", response.status);
              console.log("🟢 Response ok:", response.ok);
              return response.json();
            })
            .then(data => {
              console.log("🟢 Events fetched for calendar:", data);
              console.log("🟢 Events type:", typeof data);
              console.log("🟢 Events length:", data.length);
              
              if (Array.isArray(data)) {
                console.log("✅ Calling successCallback with events");
                successCallback(data);
              } else {
                console.warn("⚠️ Events data is not an array:", data);
                successCallback([]);
              }
            })
            .catch(error => {
              console.error("❌ Error fetching events:", error);
              failureCallback(error);
            });
        },
        eventDisplay: "block",
        dateClick: function(info) {
          const title = prompt("Add an event:");
          if (title) {
            const userId = window.userId || "ER4LFJqyUidTfc4a53DaPjeZYKE3";
            fetch("/api/add-event", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                user_id: userId,
                title: title,
                start: info.dateStr,
                allDay: true
              })
            })
            .then(response => response.json())
            .then(data => {
              if (data.success) {
                window.calendar.refetchEvents();
              }
            })
            .catch(error => console.error("Error adding event:", error));
          }
        }
      });

      window.calendar.render();
      window.calendarRendered = true;
      console.log("✅ Calendar initialized and rendered");
      
      // Force calendar to update its size
      setTimeout(() => {
        console.log("🔄 Forcing calendar updateSize after initialization");
        window.calendar.updateSize();
        const newRect = calendarEl.getBoundingClientRect();
        console.log("🔄 Calendar dimensions after updateSize:", newRect.width, "x", newRect.height);
      }, 100);
    }

  } catch (err) {
    console.error("💥 layout.js crash:", err);
  }
});
