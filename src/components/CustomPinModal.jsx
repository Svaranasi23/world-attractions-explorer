import React, { useState, useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { findNearbyParks, findNearbyAirports, calculateDistance } from '../services/dataService'
// Note: Nominatim API calls removed due to CORS restrictions
// Using location extraction from nearby attractions and airports instead
import { isPlaceVisited } from '../services/visitedPlacesService'
import { formatCoordinates } from '../utils/coordinateFormatter'
import './CustomPinModal.css'

const CustomPinModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  lat, 
  lon, 
  parks = [], 
  airports = [],
  visitedPlaces = {},
  onMarkVisited = null
}) => {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [locationInfo, setLocationInfo] = useState(null)
  const [loadingLocation, setLoadingLocation] = useState(false)
  const [locationSuggestions, setLocationSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  // Load location suggestions from nearby attractions and airports (no API calls due to CORS)
  useEffect(() => {
    let isMounted = true // Track if component is still mounted
    
    const loadSuggestions = async () => {
      if (!isOpen || !lat || !lon) {
        setLocationInfo(null)
        setLocationSuggestions([])
        setLoadingLocation(false)
        setName('')
        setShowSuggestions(false)
        return
      }
      
      setLoadingLocation(false) // No API loading needed initially
      setLocationInfo(null)
      setLocationSuggestions([])
      setName('')
      
      // Extract location suggestions from nearby attractions and airports
      const suggestions = []
      
      // Major temple cities list for better matching
      const majorTempleCities = [
        'Vijayawada', 'Ayodhya', 'Mathura', 'Vrindavan', 'Haridwar', 'Rishikesh', 
        'Udupi', 'Guruvayur', 'Sabarimala', 'Puri', 'Tirupati', 'Madurai', 
        'Kanchipuram', 'Kumbakonam', 'Srirangam', 'Chennai', 'Varanasi', 'Ujjain',
        'Dwarka', 'Badrinath', 'Kedarnath', 'Gangotri', 'Yamunotri', 'Rameswaram',
        'Shirdi', 'Tirumala', 'Tiruchirappalli', 'Thanjavur', 'Chidambaram', 'Kumbakonam'
      ]
      
      // Reverse geocoding function using BigDataCloud API (free, no API key, no CORS issues)
      const reverseGeocodeCity = async (lat, lon) => {
        try {
          const response = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`,
            {
              method: 'GET',
              headers: {
                'Accept': 'application/json'
              }
            }
          )
          
          if (!response.ok) {
            return null
          }
          
          const data = await response.json()
          
          // Extract city information
          const city = data.city || data.locality || data.principalSubdivision || null
          const state = data.principalSubdivision || data.administrativeArea || null
          const country = data.countryName || null
          
          if (city) {
            let cityName = city
            // Add state if available and different from city
            if (state && !cityName.toLowerCase().includes(state.toLowerCase())) {
              // Extract state abbreviation or name
              const stateAbbr = state.length <= 3 ? state : state.split(' ').map(w => w[0]).join('')
              cityName = `${city}, ${stateAbbr}`
            }
            
            return {
              name: cityName,
              fullName: cityName,
              source: 'reverseGeocode',
              distance: 0, // Exact location
              city: city,
              state: state,
              country: country
            }
          }
          
          return null
        } catch (error) {
          console.error('Reverse geocoding error:', error)
          return null
        }
      }
      
      // Extract city names from nearby attractions
      // Use the SAME city extraction logic as MapView.jsx for consistency
      if (parks && parks.length > 0) {
        // First, find all parks with distances
        const parksWithDistance = parks
          .map(park => {
            try {
              const parkLat = parseFloat(park.Latitude)
              const parkLon = parseFloat(park.Longitude)
              if (isNaN(parkLat) || isNaN(parkLon)) return null
              
              const distance = calculateDistance(lat, lon, parkLat, parkLon)
              return { park, distance }
            } catch {
              return null
            }
          })
          .filter(Boolean)
          .sort((a, b) => a.distance - b.distance) // Sort by distance, closest first
        
        // Process parks starting with the closest ones (prioritize parks at clicked location)
        const nearbyAttractions = []
        const seenCityNames = new Set() // Track unique city names
        
        for (const { park, distance } of parksWithDistance) {
          // Use wider radius for city suggestions (200 miles) but prioritize closer ones
          if (distance > 200) break
          
          // Extract city using the EXACT same logic as MapView.jsx
          let cityMatch = null
          const desc = park.Description || ''
          
          // Pattern 1: "Located in [City], [State]" - EXACT match from MapView
          let match = desc.match(/Located in ([^,]+),/i)
          if (match && match[1]) {
            cityMatch = match[1].trim()
            // Filter out common non-city words - EXACT match from MapView
            const invalidWords = ['Indrakeeladri Hill', 'Hill', 'River', 'Temple', 'on', 'at', 'the']
            if (invalidWords.some(word => cityMatch.toLowerCase().includes(word.toLowerCase()))) {
              cityMatch = null
            }
          }
          
          // Pattern 2: "in [City], [State]" - EXACT match from MapView
          if (!cityMatch) {
            match = desc.match(/in ([A-Z][a-z]+(?: [A-Z][a-z]+)?), [A-Z][a-z]+ (?:Province|State|District|Pradesh)/i)
            if (match && match[1]) {
              const potentialCity = match[1].trim()
              const invalidWords = ['Hill', 'River', 'Temple', 'on', 'at', 'the', 'Indrakeeladri']
              if (!invalidWords.some(word => potentialCity.toLowerCase().includes(word.toLowerCase()))) {
                cityMatch = potentialCity
              }
            }
          }
          
          // Pattern 3: Common major temple cities - EXACT match from MapView
          if (!cityMatch) {
            for (const cityName of majorTempleCities) {
              if (desc.includes(cityName)) {
                cityMatch = cityName
                break
              }
            }
          }
          
          // Pattern 4: Extract from States field for US cities (e.g., "Richmond, VA")
          // Common US city patterns in States field
          if (!cityMatch && park.States && park.Country === 'United States') {
            const statesStr = park.States
            // Pattern: "City, State" or "City State"
            const cityStateMatch = statesStr.match(/([A-Z][a-z]+(?: [A-Z][a-z]+)?),?\s+([A-Z]{2}|[A-Z][a-z]+)/)
            if (cityStateMatch && cityStateMatch[1]) {
              const potentialCity = cityStateMatch[1].trim()
              // Filter out state names and common non-city words
              const stateNames = ['Virginia', 'California', 'Texas', 'Florida', 'New York', 'Pennsylvania', 'Illinois', 'Ohio', 'Georgia', 'North Carolina', 'Michigan', 'New Jersey', 'Washington', 'Arizona', 'Massachusetts', 'Tennessee', 'Indiana', 'Missouri', 'Maryland', 'Wisconsin', 'Colorado', 'Minnesota', 'South Carolina', 'Alabama', 'Louisiana', 'Kentucky', 'Oregon', 'Oklahoma', 'Connecticut', 'Utah', 'Iowa', 'Nevada', 'Arkansas', 'Mississippi', 'Kansas', 'New Mexico', 'Nebraska', 'West Virginia', 'Idaho', 'Hawaii', 'New Hampshire', 'Maine', 'Montana', 'Rhode Island', 'Delaware', 'South Dakota', 'North Dakota', 'Alaska', 'Vermont', 'Wyoming', 'District of Columbia']
              const invalidWords = ['State', 'Province', 'County', 'Region', 'Area', 'District']
              if (!stateNames.some(state => potentialCity.toLowerCase() === state.toLowerCase()) &&
                  !invalidWords.some(word => potentialCity.toLowerCase().includes(word.toLowerCase())) &&
                  potentialCity.length > 2 && potentialCity.length < 30) {
                cityMatch = potentialCity
              }
            }
          }
          
          // Pattern 5: Try extracting from park Name if it contains a known city pattern
          if (!cityMatch && park.Name) {
            // Check if park name contains a city name followed by comma and state abbreviation
            const nameMatch = park.Name.match(/([A-Z][a-z]+(?: [A-Z][a-z]+)?),?\s+([A-Z]{2})/)
            if (nameMatch && nameMatch[1]) {
              const potentialCity = nameMatch[1].trim()
              if (potentialCity.length > 2 && potentialCity.length < 30) {
                cityMatch = potentialCity
              }
            }
          }
          
          // If we found a city, add it to suggestions
          if (cityMatch) {
            const cleanCity = cityMatch.trim()
            const cityKey = cleanCity.toLowerCase()
            
            // Final validation
            if (cleanCity.length > 2 && cleanCity.length < 50 && !seenCityNames.has(cityKey)) {
              seenCityNames.add(cityKey)
              
              nearbyAttractions.push({
                name: cleanCity,
                distance: distance,
                state: park.States || null,
                country: park.Country || null,
                parkName: park.Name || null,
                isVeryClose: distance < 2 // Flag for very close parks
              })
            }
          }
        }
        
        // Sort: very close parks first (< 2 miles), then by distance
        nearbyAttractions.sort((a, b) => {
          if (a.isVeryClose && !b.isVeryClose) return -1
          if (!a.isVeryClose && b.isVeryClose) return 1
          return a.distance - b.distance
        })
        
        // Add unique city suggestions
        const seenCities = new Set()
        nearbyAttractions.forEach(attraction => {
          const cityKey = attraction.name.toLowerCase()
          if (!seenCities.has(cityKey) && attraction.name) {
            seenCities.add(cityKey)
            let suggestionName = attraction.name
            if (attraction.state) {
              const statePart = attraction.state.split(',')[0].trim()
              // Only add state if it's different from the city name
              if (statePart && !suggestionName.toLowerCase().includes(statePart.toLowerCase())) {
                suggestionName += `, ${statePart}`
              }
            }
            suggestions.push({
              name: suggestionName,
              fullName: suggestionName,
              source: 'attraction',
              distance: attraction.distance,
              parkName: attraction.parkName
            })
          }
        })
      }
      
      // Use reverse geocoding as fallback (if no park-based suggestions found)
      // This works for ANY city, not just major ones
      if (suggestions.length === 0 || suggestions.every(s => s.source === 'airport')) {
        setLoadingLocation(true)
        try {
          const reverseGeocodeResult = await reverseGeocodeCity(lat, lon)
          
          if (isMounted && reverseGeocodeResult) {
            // Check if we already have this city from parks or airports
            const existing = suggestions.find(s => 
              s.name.toLowerCase().includes(reverseGeocodeResult.city.toLowerCase()) ||
              (reverseGeocodeResult.state && s.name.toLowerCase().includes(reverseGeocodeResult.state.toLowerCase()))
            )
            
            if (!existing) {
              suggestions.push(reverseGeocodeResult)
            }
          }
        } catch (error) {
          console.error('Reverse geocoding failed:', error)
        } finally {
          if (isMounted) {
            setLoadingLocation(false)
          }
        }
      }
      
      // Extract city names from nearby airports
      // But prioritize park-based suggestions when parks are very close
      if (airports && airports.length > 0) {
        const nearbyAirportsList = findNearbyAirports(lat, lon, airports, 100) // Increased from 50 to 100 miles
        nearbyAirportsList.forEach(airport => {
          if (airport.city) {
            const airportCity = airport.city.trim()
            // Avoid duplicates - don't add if we already have a park-based or known city suggestion
            const hasBetterSuggestion = suggestions.some(s => 
              s.source === 'attraction' || s.source === 'knownCity'
            )
            if (!hasBetterSuggestion && !suggestions.find(s => s.name.toLowerCase().includes(airportCity.toLowerCase()))) {
              suggestions.push({
                name: airportCity,
                fullName: `${airportCity} (${airport.iata || 'Airport'})`,
                source: 'airport',
                distance: airport.distance,
                isFromPark: false // Flag to help with prioritization
              })
            }
          }
        })
      }
      
      // Sort with priority: park-based > reverse geocode > airports, then by distance
      suggestions.sort((a, b) => {
        // Priority order: attraction > reverseGeocode > airport
        const priority = { 'attraction': 1, 'reverseGeocode': 2, 'airport': 3 }
        const aPriority = priority[a.source] || 99
        const bPriority = priority[b.source] || 99
        
        if (aPriority !== bPriority) {
          return aPriority - bPriority
        }
        
        // If same priority, sort by distance
        return (a.distance || 0) - (b.distance || 0)
      })
      
      // Debug logging (can be removed in production)
      if (suggestions.length > 0) {
        console.log('📍 Found location suggestions:', suggestions.length, suggestions)
        console.log('📍 Closest suggestion:', suggestions[0])
      } else {
        console.log('📍 No location suggestions found for coordinates:', lat, lon)
        // Log nearby parks for debugging
        if (parks && parks.length > 0) {
          const closestParks = parks
            .map(park => {
              try {
                const parkLat = parseFloat(park.Latitude)
                const parkLon = parseFloat(park.Longitude)
                if (isNaN(parkLat) || isNaN(parkLon)) return null
                const distance = calculateDistance(lat, lon, parkLat, parkLon)
                return { name: park.Name, distance, hasDescription: !!park.Description }
              } catch {
                return null
              }
            })
            .filter(Boolean)
            .sort((a, b) => a.distance - b.distance)
            .slice(0, 5)
          console.log('📍 Closest 5 parks:', closestParks)
        }
      }
      
      if (isMounted) {
        setLocationSuggestions(suggestions)
        
        // Auto-fill with first suggestion if available and auto-show suggestions
        if (suggestions.length > 0) {
          setName(suggestions[0].name)
          setShowSuggestions(true) // Auto-show suggestions when available
        } else {
          setShowSuggestions(false)
        }
      }
    }
    
    loadSuggestions()
    
    // Cleanup function
    return () => {
      isMounted = false
    }
  }, [isOpen, lat, lon, parks, airports])

  // Find nearby locations with full park objects
  const nearbyLocations = useMemo(() => {
    if (!isOpen || !parks || parks.length === 0) return { attractions: [], airports: [] }

    // Determine radius based on country (similar to MapView logic)
    // For now, use a standard 50 miles radius for suggestions
    const suggestionRadius = 50 // miles

    // Find nearby attractions - include full park objects
    const nearbyAttractionsWithParks = parks
      .map(park => {
        try {
          const otherLat = parseFloat(park.Latitude)
          const otherLon = parseFloat(park.Longitude)
          
          if (isNaN(otherLat) || isNaN(otherLon)) return null
          
          const distance = calculateDistance(lat, lon, otherLat, otherLon)
          
          if (distance <= suggestionRadius) {
            return {
              ...park, // Include full park object
              distance: distance
            }
          }
          return null
        } catch (error) {
          return null
        }
      })
      .filter(Boolean)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 5) // Limit to top 5

    // Find nearby airports
    const nearbyAirportsList = findNearbyAirports(lat, lon, airports, suggestionRadius)
      .slice(0, 3) // Limit to top 3

    return {
      attractions: nearbyAttractionsWithParks,
      airports: nearbyAirportsList
    }
  }, [isOpen, lat, lon, parks, airports])

  // Handle marking attraction as visited
  const handleToggleVisited = async (park) => {
    if (onMarkVisited && park) {
      await onMarkVisited(park)
    }
  }

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (name.trim()) {
      // Await the save operation to ensure it completes before closing
      await onSave(lat, lon, name.trim(), description.trim())
      setName('')
      setDescription('')
      onClose()
    }
  }

  const handleCancel = () => {
    setName('')
    setDescription('')
    onClose()
  }

  return createPortal(
    <div className="custom-pin-modal-overlay" onClick={handleCancel}>
      <div className="custom-pin-modal" onClick={(e) => e.stopPropagation()}>
        <div className="custom-pin-modal-header">
          <h2>📍 Add Custom Pin</h2>
          <button className="close-button" onClick={handleCancel}>×</button>
        </div>
        <form onSubmit={handleSubmit} className="custom-pin-form">
          <div className="form-group">
            <label htmlFor="pin-name">Location Name *</label>
            <div className="name-input-wrapper">
              <input
                id="pin-name"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  setShowSuggestions(false)
                }}
                onFocus={() => {
                  if (locationSuggestions.length > 0) {
                    setShowSuggestions(true)
                  }
                }}
                placeholder="e.g., My Favorite Spot"
                required
                autoFocus
              />
              {locationSuggestions.length > 0 && (
                <button
                  type="button"
                  className="suggestions-toggle"
                  onClick={() => setShowSuggestions(!showSuggestions)}
                  title="Show location suggestions"
                >
                  {showSuggestions ? '▼' : '▲'}
                </button>
              )}
            </div>
            {showSuggestions && locationSuggestions.length > 0 && (
              <div className="location-suggestions">
                <div className="suggestions-header">📍 Suggested Locations:</div>
                <ul className="suggestions-list">
                  {locationSuggestions.map((suggestion, index) => (
                    <li
                      key={index}
                      className="suggestion-item"
                      onClick={() => {
                        setName(suggestion.name)
                        setShowSuggestions(false)
                      }}
                    >
                      <span className="suggestion-name">{suggestion.name}</span>
                      {suggestion.source === 'attraction' && (
                        <span className="suggestion-badge">From Attraction</span>
                      )}
                      {suggestion.source === 'airport' && (
                        <span className="suggestion-badge">From Airport</span>
                      )}
                      {suggestion.distance && (
                        <span className="suggestion-distance">({suggestion.distance.toFixed(1)} mi)</span>
                      )}
                    </li>
                  ))}
                </ul>
                <div className="suggestions-note">
                  Or type your own location name
                </div>
              </div>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="pin-description">Description (optional)</label>
            <textarea
              id="pin-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add notes about this location..."
              rows="3"
            />
          </div>
          <div className="form-group">
            <p className="coordinates-info">
              Coordinates: {formatCoordinates(lat, lon, 6)}
            </p>
            {locationSuggestions.length > 0 && (
              <div className="location-info">
                <p className="location-name">
                  📍 <strong>Suggested locations found:</strong> {locationSuggestions.length} option{locationSuggestions.length !== 1 ? 's' : ''} available
                </p>
              </div>
            )}
          </div>

          {/* Nearby Locations Suggestions */}
          {(nearbyLocations.attractions.length > 0 || nearbyLocations.airports.length > 0) && (
            <div className="nearby-locations-section">
              <h3 className="nearby-locations-title">📍 Nearby Locations</h3>
              
              {nearbyLocations.attractions.length > 0 && (
                <div className="nearby-attractions">
                  <strong>🏞️ Nearby Attractions (within 50 mi):</strong>
                  <ul className="nearby-list">
                    {nearbyLocations.attractions.map((attraction, index) => {
                      const distance = attraction.distance
                      const unit = 'mi'
                      const isVisited = isPlaceVisited(attraction, visitedPlaces)
                      const attractionCity = attraction.Description 
                        ? (attraction.Description.match(/Located in ([^,]+),/i) || 
                           attraction.Description.match(/in ([A-Z][a-z]+(?: [A-Z][a-z]+)?),/i))?.[1]
                        : null
                      
                      return (
                        <li key={index} className="nearby-item">
                          <div className="attraction-info">
                            <span className="attraction-name">{attraction.Name}</span>
                            {attractionCity && (
                              <span className="attraction-city">📍 {attractionCity}</span>
                            )}
                            <span className="attraction-distance">({distance.toFixed(1)} {unit})</span>
                          </div>
                          {onMarkVisited && (
                            <button
                              type="button"
                              className={`visited-toggle ${isVisited ? 'visited' : ''}`}
                              onClick={() => handleToggleVisited(attraction)}
                              title={isVisited ? 'Mark as not visited' : 'Mark as visited'}
                            >
                              {isVisited ? '✓ Visited' : '○ Mark Visited'}
                            </button>
                          )}
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )}

              {nearbyLocations.airports.length > 0 && (
                <div className="nearby-airports">
                  <strong>✈️ Nearby Airports (within 50 mi):</strong>
                  <ul className="nearby-list">
                    {nearbyLocations.airports.map((airport, index) => {
                      const distance = airport.distance
                      const unit = 'mi'
                      return (
                        <li key={index} className="nearby-item">
                          <span className="airport-code">{airport.iata}</span>
                          <span className="airport-name">{airport.name}</span>
                          <span className="airport-distance">({distance.toFixed(1)} {unit})</span>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )}
            </div>
          )}

          <div className="form-actions">
            <button type="button" onClick={handleCancel} className="cancel-button">
              Cancel
            </button>
            <button type="submit" className="save-button">
              Save Pin
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  )
}

export default CustomPinModal

