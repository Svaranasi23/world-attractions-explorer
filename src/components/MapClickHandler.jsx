import { useMapEvents } from 'react-leaflet'

function MapClickHandler({ onMapClick, enabled = true }) {
  useMapEvents({
    click: (e) => {
      if (enabled) {
        // Check if click was on a marker or popup - if so, don't add pin
        const originalEvent = e.originalEvent
        const target = originalEvent.target
        
        // Don't add pin if clicking on:
        // - A marker
        // - A popup
        // - A control button
        // - The pin mode toggle button
        if (target && (
          target.closest('.leaflet-marker-icon') ||
          target.closest('.leaflet-popup') ||
          target.closest('.leaflet-control') ||
          target.closest('.pin-mode-toggle') ||
          target.closest('.map-legend-container') ||
          target.closest('.custom-pin-modal-overlay')
        )) {
          return
        }
        
        // Add pin at clicked location
        onMapClick(e.latlng.lat, e.latlng.lng)
      }
    }
  })

  return null
}

export default MapClickHandler

