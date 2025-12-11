// Service to manage visited places with localStorage persistence

const VISITED_PLACES_KEY = 'world-attractions-visited-places'
const USER_PROFILE_KEY = 'world-attractions-user-profile'

// Get a unique ID for a park/attraction
export const getPlaceId = (park) => {
  // Use coordinates as unique identifier (most reliable)
  const lat = parseFloat(park.Latitude)
  const lon = parseFloat(park.Longitude)
  if (!isNaN(lat) && !isNaN(lon)) {
    return `${lat.toFixed(6)}_${lon.toFixed(6)}`
  }
  // Fallback to name + country
  return `${park.Name || 'unknown'}_${park.Country || 'unknown'}`.replace(/[^a-zA-Z0-9_]/g, '_')
}

// Load visited places from localStorage
export const loadVisitedPlaces = () => {
  try {
    const stored = localStorage.getItem(VISITED_PLACES_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (error) {
    console.error('Error loading visited places:', error)
  }
  return {}
}

// Save visited places to localStorage
export const saveVisitedPlaces = (visitedPlaces) => {
  try {
    localStorage.setItem(VISITED_PLACES_KEY, JSON.stringify(visitedPlaces))
    return true
  } catch (error) {
    console.error('Error saving visited places:', error)
    return false
  }
}

// Mark a place as visited
export const markAsVisited = (park) => {
  const visitedPlaces = loadVisitedPlaces()
  const placeId = getPlaceId(park)
  visitedPlaces[placeId] = {
    name: park.Name,
    country: park.Country,
    visitedAt: new Date().toISOString(),
    coordinates: {
      lat: parseFloat(park.Latitude),
      lon: parseFloat(park.Longitude)
    }
  }
  saveVisitedPlaces(visitedPlaces)
  return visitedPlaces
}

// Mark a place as not visited
export const markAsNotVisited = (park) => {
  const visitedPlaces = loadVisitedPlaces()
  const placeId = getPlaceId(park)
  delete visitedPlaces[placeId]
  saveVisitedPlaces(visitedPlaces)
  return visitedPlaces
}

// Check if a place is visited
export const isPlaceVisited = (park, visitedPlaces = null) => {
  const places = visitedPlaces || loadVisitedPlaces()
  const placeId = getPlaceId(park)
  return !!places[placeId]
}

// Get visited count
export const getVisitedCount = (parks = []) => {
  const visitedPlaces = loadVisitedPlaces()
  return parks.filter(park => isPlaceVisited(park, visitedPlaces)).length
}

// Get visited places details
export const getVisitedPlacesDetails = () => {
  const visitedPlaces = loadVisitedPlaces()
  return Object.values(visitedPlaces)
}

// Clear all visited places
export const clearAllVisitedPlaces = () => {
  try {
    localStorage.removeItem(VISITED_PLACES_KEY)
    return true
  } catch (error) {
    console.error('Error clearing visited places:', error)
    return false
  }
}

// User Profile Management
export const loadUserProfile = () => {
  try {
    const stored = localStorage.getItem(USER_PROFILE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (error) {
    console.error('Error loading user profile:', error)
  }
  return {
    name: '',
    preferences: {
      showVisitedOnly: false,
      showUnvisitedOnly: false,
      highlightVisited: true
    }
  }
}

export const saveUserProfile = (profile) => {
  try {
    localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profile))
    return true
  } catch (error) {
    console.error('Error saving user profile:', error)
    return false
  }
}

