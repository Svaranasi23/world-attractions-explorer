import { useEffect } from 'react'
import { useMap } from 'react-leaflet'

function TooltipZIndexFix() {
  const map = useMap()

  useEffect(() => {
    if (!map) return

    const handleTooltipOpen = (e) => {
      // Dynamically position tooltip based on marker location to avoid UI elements
      setTimeout(() => {
        try {
          const tooltip = e.tooltip
          if (tooltip && tooltip._container && tooltip._source) {
            const container = tooltip._container
            const marker = tooltip._source
            
            // Get marker icon position
            const markerIcon = marker._icon
            if (!markerIcon) return
            
            const mapContainer = map.getContainer()
            const mapRect = mapContainer.getBoundingClientRect()
            const iconRect = markerIcon.getBoundingClientRect()
            const tooltipRect = container.getBoundingClientRect()
            const viewportHeight = window.innerHeight
            const topThreshold = 150 // Area at top where UI elements are
            
            // Calculate marker's vertical position relative to viewport
            const markerScreenY = iconRect.top + (iconRect.height / 2)
            const bottomThreshold = viewportHeight - 150
            
            // Get current tooltip position (relative to map container)
            const currentTop = parseFloat(container.style.top) || 0
            
            // Determine if we should show tooltip below or above marker
            if (markerScreenY < topThreshold) {
              // Marker is near top - show tooltip below to avoid search bar/menu
              // Calculate position relative to marker icon
              const iconBottom = iconRect.bottom - mapRect.top
              const newTop = iconBottom + 10 // 10px below marker
              
              // Update classes
              container.classList.remove('leaflet-tooltip-top', 'leaflet-tooltip-left', 'leaflet-tooltip-right')
              container.classList.add('leaflet-tooltip-bottom')
              
              // Set position directly
              container.style.setProperty('top', `${newTop}px`, 'important')
              container.style.setProperty('left', `${iconRect.left - mapRect.left + (iconRect.width / 2)}px`, 'important')
              container.style.setProperty('transform', 'translate(-50%, 0)', 'important')
              container.style.setProperty('margin-top', '0', 'important')
            } else if (markerScreenY > bottomThreshold) {
              // Marker is near bottom - show tooltip above
              const tooltipHeight = tooltipRect.height || 30
              const iconTop = iconRect.top - mapRect.top
              const newTop = iconTop - tooltipHeight - 10 // 10px above marker
              
              container.classList.remove('leaflet-tooltip-bottom', 'leaflet-tooltip-left', 'leaflet-tooltip-right')
              container.classList.add('leaflet-tooltip-top')
              
              container.style.setProperty('top', `${newTop}px`, 'important')
              container.style.setProperty('left', `${iconRect.left - mapRect.left + (iconRect.width / 2)}px`, 'important')
              container.style.setProperty('transform', 'translate(-50%, 0)', 'important')
              container.style.setProperty('margin-top', '0', 'important')
            } else {
              // Marker is in middle - keep default (top)
              container.classList.remove('leaflet-tooltip-bottom', 'leaflet-tooltip-left', 'leaflet-tooltip-right')
              if (!container.classList.contains('leaflet-tooltip-top')) {
                container.classList.add('leaflet-tooltip-top')
              }
            }
            
            // Set z-index
            container.style.setProperty('z-index', '1008', 'important')
            container.style.pointerEvents = 'none'
          }
        } catch (error) {
          // Silently fail
        }
      }, 10)
    }

    map.on('tooltipopen', handleTooltipOpen)

    return () => {
      map.off('tooltipopen', handleTooltipOpen)
    }
  }, [map])

  return null
}

export default TooltipZIndexFix
