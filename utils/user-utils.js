/**
 * HomeOps User Management Utilities
 * 
 * Shared functions for user creation and management across the HomeOps system.
 */

/**
 * Generate a unique user ID from an email address
 * @param {string} email - User's email address
 * @returns {string} Generated user ID
 */
function generateUserId(email) {
  // Simple user ID generation based on email
  return Buffer.from(email.toLowerCase()).toString('base64').replace(/[^a-zA-Z0-9]/g, '').substring(0, 16);
}

/**
 * Create a new user profile with default settings
 * @param {string} userId - Unique user identifier
 * @param {Object} userData - User data containing name and email
 * @returns {Object} Complete user profile
 */
function createNewUserProfile(userId, userData) {
  return {
    id: userId,
    name: userData.name || 'User',
    email: userData.email,
    preferences: {
      primaryFocus: 'family', // Default: family, work, personal
      emailBatching: true,
      notifications: {
        urgent: true,
        daily: true,
        weekly: false
      },
      insights: {
        aiGenerated: true,
        contextual: true,
        predictive: false
      }
    },
    mentalLoad: {
      currentScore: 65,
      trend: 'stable',
      history: []
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastLogin: new Date().toISOString()
  };
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if email is valid
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Create default user profile for backward compatibility
 * @param {string} userId - User ID
 * @returns {Object} User profile with default settings
 */
function createDefaultUserProfile(userId = 'default') {
  return {
    id: userId,
    preferences: {
      primaryFocus: 'family', // family, work, personal
      alertThreshold: 'medium', // low, medium, high
      timeZone: 'America/New_York',
      enabledIntegrations: ['gmail', 'calendar']
    },
    mentalLoadData: {
      weeklyPatterns: {},
      stressIndicators: [],
      successMetrics: {}
    },
    personalizedInsights: [],
    actionHistory: [],
    connectedAccounts: {
      gmail: null,
      calendar: null,
      slack: null
    }
  };
}

/**
 * Merge user profile with new data
 * @param {Object} existingProfile - Current user profile
 * @param {Object} newData - New data to merge
 * @returns {Object} Updated user profile
 */
function updateUserProfile(existingProfile, newData) {
  return {
    ...existingProfile,
    ...newData,
    preferences: {
      ...existingProfile.preferences,
      ...(newData.preferences || {})
    },
    updatedAt: new Date().toISOString()
  };
}

module.exports = {
  generateUserId,
  createNewUserProfile,
  isValidEmail,
  createDefaultUserProfile,
  updateUserProfile
};