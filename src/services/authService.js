// Authentication service using Firebase Auth

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
  sendPasswordResetEmail
} from 'firebase/auth'
import { auth } from './firebaseConfig'

// Check if Firebase is initialized
const isFirebaseAvailable = () => {
  return auth !== null && auth !== undefined
}

// Sign up with email and password
export const signUp = async (email, password, displayName = '') => {
  if (!isFirebaseAvailable()) {
    return { success: false, error: 'Firebase is not initialized. Please check your configuration.' }
  }
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    if (displayName && userCredential.user) {
      await updateProfile(userCredential.user, { displayName })
    }
    return { success: true, user: userCredential.user }
  } catch (error) {
    console.error('Sign up error:', error)
    return { success: false, error: error.message || 'Sign up failed' }
  }
}

// Sign in with email and password
export const signIn = async (email, password) => {
  if (!isFirebaseAvailable()) {
    return { success: false, error: 'Firebase is not initialized. Please check your configuration.' }
  }
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    return { success: true, user: userCredential.user }
  } catch (error) {
    console.error('Sign in error:', error)
    return { success: false, error: error.message || 'Sign in failed' }
  }
}

// Sign in with Google
export const signInWithGoogle = async () => {
  if (!isFirebaseAvailable()) {
    return { success: false, error: 'Firebase is not initialized. Please check your configuration.' }
  }
  try {
    const provider = new GoogleAuthProvider()
    const userCredential = await signInWithPopup(auth, provider)
    return { success: true, user: userCredential.user }
  } catch (error) {
    console.error('Google sign in error:', error)
    // Handle popup closed by user
    if (error.code === 'auth/popup-closed-by-user') {
      return { success: false, error: 'Sign in was cancelled' }
    }
    return { success: false, error: error.message || 'Google sign in failed' }
  }
}

// Sign out
export const signOutUser = async () => {
  if (!isFirebaseAvailable()) {
    return { success: false, error: 'Firebase is not initialized' }
  }
  try {
    await signOut(auth)
    return { success: true }
  } catch (error) {
    console.error('Sign out error:', error)
    return { success: false, error: error.message || 'Sign out failed' }
  }
}

// Get current user
export const getCurrentUser = () => {
  if (!isFirebaseAvailable()) {
    return null
  }
  try {
    return auth.currentUser
  } catch (error) {
    console.error('Get current user error:', error)
    return null
  }
}

// Send password reset email
export const resetPassword = async (email) => {
  if (!isFirebaseAvailable()) {
    return { success: false, error: 'Firebase is not initialized. Please check your configuration.' }
  }
  try {
    // Validate email format first
    if (!email || !email.includes('@')) {
      return { success: false, error: 'Please enter a valid email address' }
    }
    
    await sendPasswordResetEmail(auth, email, {
      url: window.location.origin,
      handleCodeInApp: false
    })
    console.log('Password reset email sent successfully to:', email)
    return { success: true }
  } catch (error) {
    console.error('Password reset error:', error)
    // Provide user-friendly error messages
    let errorMessage = 'Failed to send password reset email'
    if (error.code === 'auth/user-not-found') {
      errorMessage = 'No account found with this email address'
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Invalid email address'
    } else if (error.code === 'auth/too-many-requests') {
      errorMessage = 'Too many requests. Please wait a few minutes and try again.'
    } else if (error.code === 'auth/quota-exceeded') {
      errorMessage = 'Email quota exceeded. Please try again later.'
    } else if (error.code === 'auth/unauthorized-continue-uri') {
      const currentDomain = window.location.hostname
      errorMessage = `Domain "${currentDomain}" is not authorized. Please add this domain to Firebase authorized domains. See console for details.`
      console.error('🔴 Domain authorization error!')
      console.error('Current domain:', currentDomain)
      console.error('Full origin:', window.location.origin)
      console.error('')
      console.error('📋 To fix this:')
      console.error('1. Go to: https://console.firebase.google.com/')
      console.error('2. Select project: world-attractions-explorer')
      console.error('3. Go to: Authentication → Settings → Authorized domains')
      console.error(`4. Click "Add domain" and add: ${currentDomain}`)
      console.error('5. Wait 2-3 minutes for changes to propagate')
      console.error('6. Try password reset again')
    } else {
      errorMessage = error.message || errorMessage
    }
    return { success: false, error: errorMessage }
  }
}

// Listen to auth state changes
export const onAuthStateChange = (callback) => {
  if (!isFirebaseAvailable()) {
    console.warn('Firebase auth not available, returning no-op unsubscribe')
    return () => {} // Return a no-op function
  }
  try {
    return onAuthStateChanged(auth, callback)
  } catch (error) {
    console.error('Auth state change listener error:', error)
    return () => {} // Return a no-op function
  }
}

