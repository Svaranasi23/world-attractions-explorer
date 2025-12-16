// Service to manage custom pins with localStorage persistence and Firebase sync

import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from './firebaseConfig'
import { getCurrentUser } from './authService'

const CUSTOM_PINS_KEY = 'world-attractions-custom-pins'
const SYNC_TIMESTAMP_KEY = 'world-attractions-custom-pins-sync-timestamp'

// Get a unique ID for a custom pin
export const getCustomPinId = (lat, lon) => {
  return `custom_${lat.toFixed(6)}_${lon.toFixed(6)}_${Date.now()}`
}

// Load custom pins from localStorage
export const loadCustomPins = () => {
  try {
    const stored = localStorage.getItem(CUSTOM_PINS_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (error) {
    console.error('Error loading custom pins:', error)
  }
  return {}
}

// Load custom pins from Firestore for authenticated user
export const loadCustomPinsFromFirestore = async (userId) => {
  try {
    if (!userId || !db) return null
    
    const userDocRef = doc(db, 'users', userId)
    const userDoc = await getDoc(userDocRef)
    
    if (userDoc.exists()) {
      const data = userDoc.data()
      return data.customPins || {}
    }
    return {}
  } catch (error) {
    console.error('Error loading custom pins from Firestore:', error)
    return null
  }
}

// Save custom pins to Firestore for authenticated user
export const saveCustomPinsToFirestore = async (userId, customPins) => {
  try {
    if (!userId || !db) return false
    
    const userDocRef = doc(db, 'users', userId)
    await setDoc(userDocRef, {
      customPins,
      lastUpdated: serverTimestamp(),
      updatedAt: new Date().toISOString()
    }, { merge: true })
    
    // Update sync timestamp in localStorage
    localStorage.setItem(SYNC_TIMESTAMP_KEY, new Date().toISOString())
    return true
  } catch (error) {
    console.error('Error saving custom pins to Firestore:', error)
    return false
  }
}

// Sync custom pins: merge Firestore data with localStorage
export const syncCustomPins = async () => {
  const user = getCurrentUser()
  if (!user) {
    // Not logged in, just use localStorage
    return loadCustomPins()
  }
  
  try {
    // Load from Firestore
    const firestorePins = await loadCustomPinsFromFirestore(user.uid)
    if (firestorePins === null) {
      // Error loading from Firestore, use localStorage
      return loadCustomPins()
    }
    
    // Load from localStorage
    const localPins = loadCustomPins()
    
    // Merge: Firestore takes precedence (more recent), but include any local-only entries
    const merged = { ...localPins, ...firestorePins }
    
    // Save merged data to both localStorage and Firestore
    saveCustomPins(merged)
    await saveCustomPinsToFirestore(user.uid, merged)
    
    return merged
  } catch (error) {
    console.error('Error syncing custom pins:', error)
    return loadCustomPins()
  }
}

// Save custom pins to localStorage
export const saveCustomPins = (customPins) => {
  try {
    localStorage.setItem(CUSTOM_PINS_KEY, JSON.stringify(customPins))
    return true
  } catch (error) {
    console.error('Error saving custom pins:', error)
    return false
  }
}

// Add a custom pin
export const addCustomPin = async (lat, lon, name, description = '') => {
  const customPins = loadCustomPins()
  const pinId = getCustomPinId(lat, lon)
  
  customPins[pinId] = {
    id: pinId,
    name: name || 'Custom Location',
    description: description || '',
    coordinates: {
      lat: lat,
      lon: lon
    },
    createdAt: new Date().toISOString()
  }
  
  saveCustomPins(customPins)
  
  // Sync to Firestore if user is logged in
  const user = getCurrentUser()
  if (user) {
    await saveCustomPinsToFirestore(user.uid, customPins)
  }
  
  return customPins
}

// Delete a custom pin
export const deleteCustomPin = async (pinId) => {
  const customPins = loadCustomPins()
  delete customPins[pinId]
  saveCustomPins(customPins)
  
  // Sync to Firestore if user is logged in
  const user = getCurrentUser()
  if (user) {
    await saveCustomPinsToFirestore(user.uid, customPins)
  }
  
  return customPins
}

// Get all custom pins as array
export const getCustomPinsArray = () => {
  const customPins = loadCustomPins()
  return Object.values(customPins)
}

