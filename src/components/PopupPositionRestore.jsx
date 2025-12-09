import { useEffect, useRef } from 'react'
import { useMap } from 'react-leaflet'

function PopupPositionRestore() {
  const map = useMap()
  const originalCenterRef = useRef(null)
  const originalZoomRef = useRef(null)

  useEffect(() => {
    if (!map) return

    const handlePopupOpen = (e) => {
      // Capture the position immediately when popup opens
      // Use requestAnimationFrame to get it as early as possible
      requestAnimationFrame(() => {
        const currentCenter = map.getCenter()
        const currentZoom = map.getZoom()
        
        // Store the position
        originalCenterRef.current = currentCenter
        originalZoomRef.current = currentZoom
        
        // Check after autoPan completes if the position changed
        setTimeout(() => {
          const newCenter = map.getCenter()
          const latDiff = Math.abs(originalCenterRef.current.lat - newCenter.lat)
          const lngDiff = Math.abs(originalCenterRef.current.lng - newCenter.lng)
          
          // If the map didn't move (or moved very little), clear the stored position
          // so we don't restore when it wasn't needed
          if (latDiff < 0.0001 && lngDiff < 0.0001) {
            originalCenterRef.current = null
            originalZoomRef.current = null
          }
        }, 200) // Wait for autoPan animation to complete
      })
    }

    const handlePopupClose = (e) => {
      // Restore the original map position when popup closes
      if (originalCenterRef.current && originalZoomRef.current) {
        map.setView(originalCenterRef.current, originalZoomRef.current, {
          animate: true,
          duration: 0.3
        })
      }
      // Clear the stored position
      originalCenterRef.current = null
      originalZoomRef.current = null
    }

    map.on('popupopen', handlePopupOpen)
    map.on('popupclose', handlePopupClose)

    return () => {
      map.off('popupopen', handlePopupOpen)
      map.off('popupclose', handlePopupClose)
    }
  }, [map])

  return null
}

export default PopupPositionRestore

