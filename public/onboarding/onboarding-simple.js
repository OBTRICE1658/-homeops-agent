/**
 * HomeOps.ai Onboarding Flow - Clean & Simple
 */

// Global state
let currentStepIndex = 0;
let onboardingState = {
  name: '',
  email: '',
  role: '',
  priorities: []
};

// Step definitions
const steps = [
  {
    id: 'welcome',
    title: 'Welcome to HomeOps',
    subtitle: 'Your personal operating system for family life.',
    content: renderWelcomeStep
  },
  {
    id: 'profile',
    title: 'Tell us about yourself',
    subtitle: 'This helps us personalize your experience.',
    content: renderProfileStep
  },
  {
    id: 'priorities',
    title: 'What matters most?',
    subtitle: 'Choose your top 3 priorities for family management.',
    content: renderPrioritiesStep
  },
  {
    id: 'complete',
    title: 'You\'re all set!',
    subtitle: 'Welcome to your new command center.',
    content: renderCompleteStep
  }
];

// Step render functions
function renderWelcomeStep() {
  return `
    <div class="welcome-content">
      <div style="font-size: 48px; margin-bottom: 20px;">🏠</div>
      <p style="font-size: 18px; color: #64748b; margin-bottom: 40px;">
        Transform family chaos into organized clarity with your personal AI assistant.
      </p>
      <button class="btn btn-primary" onclick="nextStep()">
        Get Started
      </button>
    </div>
  `;
}

function renderProfileStep() {
  return `
    <div class="form-group">
      <label class="form-label">What's your name?</label>
      <input type="text" class="form-input" id="name" placeholder="Enter your name" 
             value="${onboardingState.name}" onchange="updateState('name', this.value)">
    </div>
    
    <div class="form-group">
      <label class="form-label">Email address</label>
      <input type="email" class="form-input" id="email" placeholder="your@email.com" 
             value="${onboardingState.email}" onchange="updateState('email', this.value)">
    </div>
    
    <div class="form-group">
      <label class="form-label">What's your role in the family?</label>
      <div class="selection-grid">
        ${renderRoleOptions()}
      </div>
    </div>
  `;
}

function renderRoleOptions() {
  const roles = [
    { id: 'parent', title: 'Parent/Guardian', description: 'Managing family logistics' },
    { id: 'partner', title: 'Co-parent', description: 'Sharing family responsibilities' },
    { id: 'caregiver', title: 'Caregiver', description: 'Supporting family members' }
  ];
  
  return roles.map(role => `
    <div class="selection-card ${onboardingState.role === role.id ? 'selected' : ''}" 
         onclick="selectRole('${role.id}')">
      <div class="selection-card-title">${role.title}</div>
      <div class="selection-card-description">${role.description}</div>
    </div>
  `).join('');
}

function renderPrioritiesStep() {
  const priorityOptions = [
    { id: 'schedule', title: 'Schedule Management', description: 'Coordinating calendars and activities' },
    { id: 'communication', title: 'Family Communication', description: 'Staying connected and informed' },
    { id: 'tasks', title: 'Household Tasks', description: 'Managing chores and responsibilities' },
    { id: 'kids', title: 'Kid Activities', description: 'School events and extracurriculars' },
    { id: 'health', title: 'Health & Wellness', description: 'Appointments and medical care' },
    { id: 'finances', title: 'Family Finances', description: 'Budgeting and expense tracking' }
  ];
  
  return `
    <div class="form-group">
      <div class="selection-grid">
        ${priorityOptions.map(priority => `
          <div class="selection-card ${onboardingState.priorities.includes(priority.id) ? 'selected' : ''}" 
               onclick="togglePriority('${priority.id}')">
            <div class="selection-card-title">${priority.title}</div>
            <div class="selection-card-description">${priority.description}</div>
          </div>
        `).join('')}
      </div>
      <p style="font-size: 14px; color: #64748b; margin-top: 16px; text-align: center;">
        Select up to 3 priorities
      </p>
    </div>
  `;
}

function renderCompleteStep() {
  return `
    <div class="welcome-content">
      <div style="font-size: 48px; margin-bottom: 20px;">✨</div>
      <p style="font-size: 18px; color: #64748b; margin-bottom: 40px;">
        Your HomeOps command center is ready! We'll help you stay organized and focused on what matters most.
      </p>
      <button class="btn btn-primary" onclick="completeOnboarding()">
        Enter HomeOps
      </button>
    </div>
  `;
}

// State management functions
function updateState(key, value) {
  onboardingState[key] = value;
}

function selectRole(roleId) {
  onboardingState.role = roleId;
  renderCurrentStep();
}

function togglePriority(priorityId) {
  const priorities = onboardingState.priorities;
  const index = priorities.indexOf(priorityId);
  
  if (index > -1) {
    priorities.splice(index, 1);
  } else if (priorities.length < 3) {
    priorities.push(priorityId);
  }
  
  renderCurrentStep();
}

// Navigation functions
function nextStep() {
  if (canProceed()) {
    if (currentStepIndex < steps.length - 1) {
      currentStepIndex++;
      renderCurrentStep();
    }
  }
}

function prevStep() {
  if (currentStepIndex > 0) {
    currentStepIndex--;
    renderCurrentStep();
  }
}

function canProceed() {
  const currentStep = steps[currentStepIndex];
  
  switch (currentStep.id) {
    case 'welcome':
      return true;
    case 'profile':
      return onboardingState.name && onboardingState.email && onboardingState.role;
    case 'priorities':
      return onboardingState.priorities.length > 0;
    default:
      return true;
  }
}

function completeOnboarding() {
  // Save state and redirect
  localStorage.setItem('homeopsOnboarding', JSON.stringify(onboardingState));
  window.location.href = '/';
}

// Rendering functions
function renderCurrentStep() {
  const step = steps[currentStepIndex];
  
  // Update progress
  const progressFill = document.querySelector('.progress-fill');
  const progressText = document.querySelector('.progress-text');
  
  if (progressFill && progressText) {
    const progress = ((currentStepIndex + 1) / steps.length) * 100;
    progressFill.style.width = `${progress}%`;
    progressText.textContent = `Step ${currentStepIndex + 1} of ${steps.length}`;
  }
  
  // Update content
  const titleElement = document.querySelector('.step-title');
  const subtitleElement = document.querySelector('.step-subtitle');
  const contentElement = document.querySelector('.step-content');
  
  if (titleElement) titleElement.textContent = step.title;
  if (subtitleElement) subtitleElement.textContent = step.subtitle;
  if (contentElement) contentElement.innerHTML = step.content();
  
  // Update navigation
  updateNavigation();
}

function updateNavigation() {
  const navigation = document.querySelector('.navigation');
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === steps.length - 1;
  const canContinue = canProceed();
  
  let navHTML = '';
  
  if (!isFirstStep) {
    navHTML += '<button class="btn btn-secondary" onclick="prevStep()">Back</button>';
  }
  
  navHTML += '<div class="nav-spacer"></div>';
  
  if (!isLastStep) {
    navHTML += `<button class="btn btn-primary" onclick="nextStep()" ${!canContinue ? 'disabled' : ''}>
      Continue
    </button>`;
  }
  
  navigation.innerHTML = navHTML;
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  renderCurrentStep();
});
