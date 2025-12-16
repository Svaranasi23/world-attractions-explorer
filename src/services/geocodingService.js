// Service for reverse geocoding to get location names from coordinates

/**
 * Reverse geocode coordinates to get location information
 * Uses OpenStreetMap Nominatim API (free, no API key required)
 */
export const reverseGeocode = async (lat, lon) => {
  try {
    // Add delay to respect Nominatim's rate limit (1 request per second)
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Create a timeout promise (5 seconds)
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Geocoding request timeout')), 5000)
    })
    
    // Create the fetch promise
    // Note: Nominatim requires proper User-Agent and may have CORS restrictions
    // Using a proxy-friendly approach with proper headers
    const fetchPromise = fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1&namedetails=1`,
      {
        headers: {
          'User-Agent': 'WorldAttractionsExplorer/1.0 (https://world-attractions-explorer.vercel.app)', // Required by Nominatim
          'Accept-Language': 'en',
          'Referer': window.location.origin
        },
        mode: 'cors'
      }
    )
    
    // Race between fetch and timeout
    const response = await Promise.race([fetchPromise, timeoutPromise])
    
    if (!response.ok) {
      throw new Error(`Geocoding failed: ${response.status}`)
    }
    
    const data = await response.json()
    
    if (!data || !data.address) {
      return null
    }
    
    // Extract location information
    const address = data.address
    const locationInfo = {
      city: address.city || address.town || address.village || address.municipality || null,
      state: address.state || address.region || null,
      country: address.country || null,
      displayName: data.display_name || null,
      fullAddress: {
        city: address.city || address.town || address.village || null,
        state: address.state || address.region || null,
        country: address.country || null,
        county: address.county || null,
        postcode: address.postcode || null
      }
    }
    
    return locationInfo
  } catch (error) {
    console.error('Error reverse geocoding:', error)
    // Return null on any error (timeout, network, etc.)
    return null
  }
}

/**
 * Get nearby location suggestions using a search around the coordinates
 * This helps when the exact point doesn't have a city name
 */
export const getNearbyLocations = async (lat, lon, radius = 0.1) => {
  try {
    // Add delay to respect Nominatim's rate limit
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Geocoding request timeout')), 5000)
    })
    
    // Search for nearby places
    const fetchPromise = fetch(
      `https://nominatim.openstreetmap.org/search?format=json&lat=${lat}&lon=${lon}&radius=${radius}&addressdetails=1&limit=10&namedetails=1`,
      {
        headers: {
          'User-Agent': 'WorldAttractionsExplorer/1.0 (https://world-attractions-explorer.vercel.app)',
          'Accept-Language': 'en',
          'Referer': window.location.origin
        },
        mode: 'cors'
      }
    )
    
    const response = await Promise.race([fetchPromise, timeoutPromise])
    
    if (!response.ok) {
      throw new Error(`Geocoding failed: ${response.status}`)
    }
    
    const data = await response.json()
    
    if (!data || !Array.isArray(data) || data.length === 0) {
      return []
    }
    
    // Extract unique city/town names
    const locations = data
      .map(item => {
        const addr = item.address || {}
        const city = addr.city || addr.town || addr.village || addr.municipality || null
        const state = addr.state || addr.region || null
        const country = addr.country || null
        
        if (!city && !item.display_name) return null
        
        return {
          city: city,
          state: state,
          country: country,
          displayName: item.display_name || `${city || 'Unknown'}, ${state || country || ''}`,
          type: item.type || 'unknown'
        }
      })
      .filter(Boolean)
      .filter((item, index, self) => 
        // Remove duplicates based on city name
        index === self.findIndex(t => t.city === item.city && t.state === item.state)
      )
      .slice(0, 5) // Limit to 5 suggestions
    
    return locations
  } catch (error) {
    console.error('Error getting nearby locations:', error)
    return []
  }
}

/**
 * Get a formatted location string from coordinates
 */
export const getLocationString = async (lat, lon) => {
  const location = await reverseGeocode(lat, lon)
  if (!location) return null
  
  const parts = []
  if (location.city) parts.push(location.city)
  if (location.state) parts.push(location.state)
  if (location.country) parts.push(location.country)
  
  return parts.length > 0 ? parts.join(', ') : location.displayName
}

