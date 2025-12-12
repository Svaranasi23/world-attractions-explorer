// Firebase configuration
// Replace these values with your Firebase project configuration
// Get these from: Firebase Console > Project Settings > General > Your apps

import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// Your web app's Firebase configuration
// Configuration for world-attractions-explorer Firebase project
// Get these values from environment variables (.env file)
// See .env.example for the required variables

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
}

// Validate that required environment variables are set
if (!firebaseConfig.apiKey) {
  console.warn('Firebase API key is missing. Please set VITE_FIREBASE_API_KEY in your .env file.')
}

// Initialize Firebase with error handling
let app, auth, db

try {
  app = initializeApp(firebaseConfig)
  auth = getAuth(app)
  db = getFirestore(app)
} catch (error) {
  console.error('Firebase initialization error:', error)
  // Create fallback objects to prevent crashes
  app = null
  auth = null
  db = null
}

// Initialize Firebase Authentication and get a reference to the service
export { auth }

// Initialize Cloud Firestore and get a reference to the service
export { db }

export default app

