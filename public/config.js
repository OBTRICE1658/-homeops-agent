// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDx_ygwnomCIM-1kqY6GJBjYkHy5UaR_g8",
  authDomain: "homeops-web.firebaseapp.com",
  projectId: "homeops-web",
  storageBucket: "homeops-web.appspot.com",
  messagingSenderId: "620328376664",
  appId: "1:620328376664:web:e1aa715f26f4a2f143ad2d",
  measurementId: "G-Q4924PYF55"
};

// Initialize Firebase (compat style)
firebase.initializeApp(firebaseConfig);

// Backend API configuration
const BACKEND_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:3000'  // Local development
  : `https://${window.location.hostname}`;  // Production - use same hostname

// Helper function to make API calls
async function apiCall(endpoint, options = {}) {
  const url = `${BACKEND_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  });
  
  if (!response.ok) {
    throw new Error(`API call failed: ${response.status}`);
  }
  
  return response.json();
} 