import { useEffect } from 'react'
import { useMap } from 'react-leaflet'

function MapController({ center, zoom, bounds, selectedPark, onPopupOpened }) {
  const map = useMap()

  useEffect(() => {
    if (bounds && Array.isArray(bounds) && bounds.length === 2) {
      // Fit map to bounds
      try {
        map.fitBounds(bounds, { 
          padding: [50, 50], 
          maxZoom: 8,
          animate: true,
          duration: 1.0
        })
      } catch (error) {
        console.error('Error fitting bounds:', error)
      }
    } else if (center && Array.isArray(center) && center.length === 2) {
      // Center and zoom to specific location
      map.setView(center, zoom || 6, { animate: true, duration: 1.0 })
    }
  }, [map, center, zoom, bounds])

  // Open popup for selected park
  useEffect(() => {
    if (selectedPark) {
      const lat = parseFloat(selectedPark.Latitude)
      const lon = parseFloat(selectedPark.Longitude)
      
      if (!isNaN(lat) && !isNaN(lon) && lat !== 0 && lon !== 0) {
        // Wait for map to finish animating, then find and open the marker popup
        const timer = setTimeout(() => {
          // Find the marker at this location
          let foundMarker = null
          map.eachLayer((layer) => {
            if (layer instanceof L.Marker) {
              const markerLat = layer.getLatLng().lat
              const markerLon = layer.getLatLng().lng
              // Check if coordinates match (within small tolerance)
              if (Math.abs(markerLat - lat) < 0.001 && Math.abs(markerLon - lon) < 0.001) {
                foundMarker = layer
              }
            }
          })
          
          if (foundMarker) {
            foundMarker.openPopup()
            if (onPopupOpened) {
              onPopupOpened()
            }
          }
        }, 1200) // Wait for map animation to complete (1s) + buffer
        
        return () => clearTimeout(timer)
      }
    }
  }, [map, selectedPark, onPopupOpened])

  return null
}

export default MapController

