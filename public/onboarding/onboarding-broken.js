// Simplified Onboarding State
let currentStep = 1;
let userData = {
  children: [],
  schools: [],
  keywords: [],
  priorities: ['school', 'sports', 'birthdays'],
  emailConnected: false
};

// Sample emails for calibration
const sampleEmails = [
  {
    sender: "Woods Academy",
    subject: "Early Dismissal Tomorrow - 2:00 PM",
    snippet: "Due to teacher professional development, all students will be dismissed at 2:00 PM tomorrow. Please arrange pickup accordingly.",
    priority: "School",
    keywords: ["early dismissal", "pickup", "2:00 PM"]
  },
  {
    sender: "Roosevelt PTA",
    subject: "Permission Slip Due Friday - Field Trip",
    snippet: "Please return the signed permission slip for next week's science museum field trip by Friday.",
    priority: "School",
    keywords: ["permission slip", "field trip", "Friday"]
  },
  {
    sender: "Soccer Club Registration",
    subject: "Uniform Day - This Saturday",
    snippet: "Reminder: This Saturday is uniform day. All players should wear their complete team uniform for team photos.",
    priority: "Sports",
    keywords: ["uniform day", "Saturday", "team photos"]
  },
  {
    sender: "Emily's Mom",
    subject: "Birthday Party Invitation - Emma's 8th Birthday",
    snippet: "You're invited to Emma's 8th birthday party this Sunday at 2 PM. RSVP by Thursday please!",
    priority: "Birthday",
    keywords: ["birthday party", "Sunday", "RSVP", "Thursday"]
  }
];

// Initialize onboarding
document.addEventListener('DOMContentLoaded', function() {
  setupEventListeners();
});

// Event Listeners
function setupEventListeners() {
  // Form inputs
  const childrenInput = document.getElementById('children');
  const schoolsInput = document.getElementById('schools');
  const keywordsInput = document.getElementById('keywords');

  if (childrenInput) childrenInput.addEventListener('input', updateFormData);
  if (schoolsInput) schoolsInput.addEventListener('input', updateFormData);
  if (keywordsInput) keywordsInput.addEventListener('input', updateFormData);

  // Priority chips
  const chips = document.querySelectorAll('.chip');
  chips.forEach(chip => {
    chip.addEventListener('click', toggleChip);
  });
}

// Update form data
function updateFormData() {
  const childrenInput = document.getElementById('children');
  const schoolsInput = document.getElementById('schools');
  const keywordsInput = document.getElementById('keywords');

  if (childrenInput) {
    userData.children = childrenInput.value.split(',').map(s => s.trim()).filter(s => s);
  }
  
  if (schoolsInput) {
    userData.schools = schoolsInput.value.split(',').map(s => s.trim()).filter(s => s);
  }
  
  if (keywordsInput) {
    userData.keywords = keywordsInput.value.split(',').map(s => s.trim()).filter(s => s);
  }

  // Update priorities from active chips
  const activeChips = document.querySelectorAll('.chip.active');
  userData.priorities = Array.from(activeChips).map(chip => chip.dataset.value);
}

// Toggle priority chip
function toggleChip(event) {
  event.currentTarget.classList.toggle('active');
  updateFormData();
}

// Navigation functions
function nextStep() {
  const currentStepEl = document.querySelector('.step.active');
  
  if (currentStep === 1) {
    // Landing to Form
    currentStepEl.classList.remove('active');
    document.getElementById('step-form').classList.add('active');
    currentStep = 2;
  } else if (currentStep === 2) {
    // Form to OAuth
    updateFormData();
    currentStepEl.classList.remove('active');
    document.getElementById('step-oauth').classList.add('active');
    currentStep = 3;
  } else if (currentStep === 3) {
    // OAuth to Calibration
    currentStepEl.classList.remove('active');
    document.getElementById('step-calibration').classList.add('active');
    populateEmailSamples();
    currentStep = 4;
  }
}

function goBack() {
  const currentStepEl = document.querySelector('.step.active');
  
  if (currentStep === 4) {
    // Calibration to OAuth
    currentStepEl.classList.remove('active');
    document.getElementById('step-oauth').classList.add('active');
    currentStep = 3;
  } else if (currentStep === 3) {
    // OAuth to Form
    currentStepEl.classList.remove('active');
    document.getElementById('step-form').classList.add('active');
    currentStep = 2;
  } else if (currentStep === 2) {
    // Form to Landing
    currentStepEl.classList.remove('active');
    document.getElementById('step-landing').classList.add('active');
    currentStep = 1;
  }
}

// Gmail OAuth simulation
function connectGmail() {
  const allowBtn = document.querySelector('.btn-allow');
  allowBtn.textContent = 'Connecting...';
  allowBtn.disabled = true;
  
  // Simulate OAuth delay
  setTimeout(() => {
    userData.emailConnected = true;
    nextStep();
  }, 2000);
}

// Populate email samples for calibration
function populateEmailSamples() {
  const samplesContainer = document.getElementById('emailSamples');
  if (!samplesContainer) return;

  // Filter and customize samples based on user data
  let relevantSamples = [...sampleEmails];
  
  // Add user-specific keywords to samples if provided
  if (userData.children.length > 0) {
    relevantSamples[0].snippet = relevantSamples[0].snippet.replace('all students', `all students including ${userData.children[0]}`);
  }
  
  if (userData.schools.length > 0) {
    relevantSamples[0].sender = userData.schools[0] || 'Woods Academy';
    relevantSamples[1].sender = `${userData.schools[0]} PTA` || 'Roosevelt PTA';
  }

  // Generate HTML for email samples
  samplesContainer.innerHTML = relevantSamples.map(email => `
    <div class="email-sample">
      <div class="email-header">
        <div class="email-sender">${email.sender}</div>
        <div class="email-priority">${email.priority}</div>
      </div>
      <div class="email-subject">${email.subject}</div>
      <div class="email-snippet">${email.snippet}</div>
      <div class="email-keywords">
        ${email.keywords.map(keyword => `<span class="keyword-tag">${keyword}</span>`).join('')}
      </div>
    </div>
  `).join('');
}

// Finish onboarding
function finishOnboarding() {
  const currentStepEl = document.querySelector('.step.active');
  currentStepEl.classList.remove('active');
  document.getElementById('step-success').classList.add('active');
  currentStep = 5;
  
  // Log the collected data
  console.log('Onboarding completed with data:', userData);
  
  // In a real app, send this data to the server
  // fetch('/api/onboarding/complete', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(userData)
  // });
}

// Go to dashboard
function goToDashboard() {
  // In a real app, redirect to the main dashboard
  window.location.href = '/app';
}
