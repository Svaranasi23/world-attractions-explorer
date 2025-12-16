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
          
          // Debug: Log the full API response to understand structure
          console.log('📍 Reverse geocoding API response:', data)
          
          const country = data.countryName || data.countryCode || null
          const isIndia = country === 'India' || country === 'IN'
          
          // Extract city information - BigDataCloud API structure
          // For India, administrative levels are more important due to dense population
          let finalCity = null
          let state = null
          
          if (isIndia && data.localityInfo?.administrative) {
            // For India, check administrative levels more carefully
            // Order typically: 0=country, 1=state, 2=district, 3=subdistrict, 4=city/town, 5=village
            const adminLevels = data.localityInfo.administrative.sort((a, b) => a.order - b.order)
            
            // Log administrative levels for debugging
            console.log('📍 India administrative levels:', adminLevels)
            
            // For India, prefer city/town (order 4-5) over village (order 6+)
            // Try to find the most specific city/town name
            for (const level of adminLevels) {
              // Order 4-5 are typically city/town/municipality
              if (level.order >= 4 && level.order <= 5 && level.name) {
                // Skip if it's a state name (usually order 1)
                if (level.order !== 1) {
                  finalCity = level.name
                  break
                }
              }
            }
            
            // If no city found, try order 6-7 (village/town)
            if (!finalCity) {
              for (const level of adminLevels) {
                if (level.order >= 6 && level.order <= 7 && level.name) {
                  finalCity = level.name
                  break
                }
              }
            }
            
            // Extract state (usually order 1)
            const stateLevel = adminLevels.find(a => a.order === 1)
            if (stateLevel) {
              state = stateLevel.name
            }
          }
          
          // Fallback to standard fields if not found in administrative levels
          if (!finalCity) {
            finalCity = data.city || 
                       data.locality || 
                       data.localityInfo?.administrative?.find(a => a.order === 6)?.name ||
                       data.localityInfo?.administrative?.find(a => a.order === 7)?.name ||
                       data.principalSubdivision || 
                       null
          }
          
          if (!state) {
            state = data.principalSubdivision || 
                   data.administrativeArea || 
                   data.localityInfo?.administrative?.find(a => a.order === 4)?.name ||
                   null
          }
          
          // Additional fallback: check all administrative levels for city-like names
          if (!finalCity && data.localityInfo?.administrative) {
            const adminLevels = data.localityInfo.administrative
            // Look for any level that might be a city (skip country and state)
            for (const level of adminLevels) {
              if (level.order > 1 && level.order < 8 && level.name) {
                // Check if it looks like a city name (not too long, not a state)
                const name = level.name.trim()
                if (name.length > 2 && name.length < 50 && 
                    !name.toLowerCase().includes('district') &&
                    !name.toLowerCase().includes('state')) {
                  finalCity = name
                  break
                }
              }
            }
          }
          
          if (finalCity) {
            let cityName = finalCity.trim()
            
            // Add state if available and different from city
            if (state && !cityName.toLowerCase().includes(state.toLowerCase())) {
              // For India, use full state name
              if (isIndia) {
                cityName = `${cityName}, ${state}`
              } else if (country === 'United States' && state.length > 3) {
                // For US, try to abbreviate
                const stateAbbr = state.split(' ').map(w => w[0]).join('').toUpperCase()
                cityName = `${cityName}, ${stateAbbr}`
              } else {
                cityName = `${cityName}, ${state}`
              }
            }
            
            console.log('📍 Extracted city:', { cityName, finalCity, state, country })
            
            return {
              name: cityName,
              fullName: cityName,
              source: 'reverseGeocode',
              distance: 0, // Exact location
              city: finalCity,
              state: state,
              country: country
            }
          }
          
          console.log('📍 No city found in reverse geocoding response')
          
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
      
      // Always use reverse geocoding to get the actual city name from coordinates
      // This works for ANY city worldwide (India, US, etc.)
      // Park-based suggestions are prioritized, but reverse geocoding provides the actual location
      setLoadingLocation(true)
      try {
        const reverseGeocodeResult = await reverseGeocodeCity(lat, lon)
        
        if (isMounted && reverseGeocodeResult) {
          // Check if we already have this EXACT city from parks or airports
          // Only match on city name, not state (to avoid false matches in same state)
          const geocodeCity = reverseGeocodeResult.city.toLowerCase().trim()
          const existing = suggestions.find(s => {
            const sName = s.name.toLowerCase()
            // Extract just the city part (before comma) from suggestion
            const sCity = sName.split(',')[0].trim()
            
            // Match only if city names are the same (not just state)
            // Allow small variations (e.g., "Guntur" matches "Guntur, Andhra Pradesh")
            return sCity === geocodeCity || 
                   sName.startsWith(geocodeCity + ',') ||
                   (geocodeCity.length > 3 && sCity.includes(geocodeCity)) ||
                   (sCity.length > 3 && geocodeCity.includes(sCity))
          })
          
          // Always add reverse geocode result - it's the most accurate (distance = 0)
          // Even if a similar city exists, the reverse geocode is the exact location
          if (!existing) {
            suggestions.push(reverseGeocodeResult)
          } else {
            // If we found a match, replace it with reverse geocode since it's more accurate
            const existingIndex = suggestions.findIndex(s => {
              const sName = s.name.toLowerCase()
              const sCity = sName.split(',')[0].trim()
              return sCity === geocodeCity || 
                     sName.startsWith(geocodeCity + ',') ||
                     (geocodeCity.length > 3 && sCity.includes(geocodeCity))
            })
            
            if (existingIndex >= 0) {
              // Always replace with reverse geocode - it's the exact location (distance = 0)
              // This ensures "Guntur" from reverse geocode replaces "Vijayawada" from a distant attraction
              suggestions[existingIndex] = reverseGeocodeResult
            } else {
              // If no exact match found, add it anyway
              suggestions.push(reverseGeocodeResult)
            }
          }
        }
      } catch (error) {
        console.error('Reverse geocoding failed:', error)
      } finally {
        if (isMounted) {
          setLoadingLocation(false)
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
      
      // Sort with priority: reverse geocode (exact location) > close park-based > airports, then by distance
      suggestions.sort((a, b) => {
        // Reverse geocode (distance = 0) should always be first - it's the exact location
        if (a.distance === 0 && b.distance !== 0) return -1
        if (a.distance !== 0 && b.distance === 0) return 1
        
        // If both are reverse geocode (distance = 0), they're equal
        if (a.distance === 0 && b.distance === 0) return 0
        
        // For non-exact locations, prioritize close park-based suggestions (< 5 miles) over others
        const aIsClosePark = a.source === 'attraction' && a.distance < 5
        const bIsClosePark = b.source === 'attraction' && b.distance < 5
        
        if (aIsClosePark && !bIsClosePark) return -1
        if (!aIsClosePark && bIsClosePark) return 1
        
        // Then prioritize by source type: attraction > reverseGeocode > airport
        const priority = { 'attraction': 1, 'reverseGeocode': 2, 'airport': 3 }
        const aPriority = priority[a.source] || 99
        const bPriority = priority[b.source] || 99
        
        if (aPriority !== bPriority) {
          return aPriority - bPriority
        }
        
        // Finally, sort by distance (closest first)
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

