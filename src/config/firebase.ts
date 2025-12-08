// Firebase initialization for Expo app using React Native Firebase
// NOTE: For React Native Firebase, you need to configure:
// - Android: google-services.json in android/app/
// - iOS: GoogleService-Info.plist in ios/
// The config below is used to manually initialize if needed for Expo

import firebase from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';
import database from '@react-native-firebase/database';
// Firebase config - ensure this matches your Firebase project
// Note: With React Native Firebase, the native config files (google-services.json/GoogleService-Info.plist) 
// are the primary source of configuration when using native builds
const firebaseConfig = {
  apiKey: 'AIzaSyBwl9U2werI16C9zRhzb3WMHqFGjrJrm68',
  authDomain: 'aquatech-monitoring.firebaseapp.com',
  databaseURL: "https://aquatech-monitoring-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: 'aquatech-monitoring',
  storageBucket: 'aquatech-monitoring.firebasestorage.app',
  messagingSenderId: '104313651336586858862',
  appId: '1:81111367204:android:4ab3a75415e7034d3262b1',
  measurementId: 'G-ABC123DEF45',
};

// Initialize Firebase app if not already initialized
// React Native Firebase automatically handles app initialization from native config
// This manual initialization is only needed in certain scenarios
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Export auth instance - React Native Firebase handles persistence automatically
export const db = database();
export { auth };
export default firebase;
