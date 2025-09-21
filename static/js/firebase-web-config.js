/**
 * Firebase Web Configuration
 * This file will be populated by the server with actual Firebase configuration
 * from firebase-web-config.json or environment variables.
 */

// The server will inject the actual configuration before this script runs
// In case the server injection fails, use default empty values
window.firebaseConfig = window.firebaseConfig || (typeof firebaseWebConfig !== 'undefined' ? JSON.parse(firebaseWebConfig) : {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: "",
  measurementId: "" // Optional
});

/**
 * Initialize Firebase app if it hasn't been initialized already
 */
if (typeof firebase !== 'undefined' && !firebase.apps.length && window.firebaseConfig.apiKey) {
  try {
    firebase.initializeApp(window.firebaseConfig);
  } catch (error) {
    console.error('Error initializing Firebase:', error);
  }
} else if (typeof firebase === 'undefined') {
  console.warn('Firebase SDK not loaded. Some Firebase features may not work.');
}