import React, { useState, useEffect, useRef } from 'react'
import './AttractionTypeFilter.css'

function AttractionTypeFilter({ visibleTypes, toggleType, isOpen, setIsOpen, availableTypes, showAirports, setShowAirports, visibleRegions, regions, currentMapView, showVisitedOnly, setShowVisitedOnly, showUnvisitedOnly, setShowUnvisitedOnly }) {
  const filterRef = useRef(null)

  // Close filter panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target) && 
          !event.target.closest('.filter-icon-button')) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [isOpen, setIsOpen])

  // Attraction types with their display names and icons
  const allAttractionTypes = [
    { key: 'NationalParks', label: 'National Parks', icon: '🏞️' },
    { key: 'UNESCO', label: 'UNESCO Sites', icon: '🏛️' },
    { key: 'Temples', label: 'Temples', icon: '🕉️' },
    { key: 'Jyotirlinga', label: 'Jyotirlinga', icon: '🔱' },
    { key: 'ShaktiPeetha', label: 'Shakti Peetha', icon: '🌸' },
    { key: 'Matham', label: 'Matham', icon: '⛩️' },
    { key: 'DivyaDesam', label: 'Divya Desam', icon: '🕉️' },
    { key: 'Forts', label: 'Forts', icon: '🏰' },
    { key: 'TrekkingFlights', label: 'Trekking', icon: '🏔️' },
    { key: 'MostPhotographed', label: 'Most Photographed', icon: '📷' }
  ]

  // Check if map is showing the whole world (low zoom level)
  const isWorldView = !currentMapView || !currentMapView.zoom || currentMapView.zoom <= 3
  
  // Check if map is zoomed into India, Nepal, or Sri Lanka based on center and zoom
  const isMapZoomedIntoIndia = currentMapView && 
                               currentMapView.center && 
                               currentMapView.zoom >= 4 &&
                               !isWorldView &&
                               currentMapView.center.lat >= 6.0 && currentMapView.center.lat <= 37.0 &&
                               currentMapView.center.lng >= 68.0 && currentMapView.center.lng <= 97.0
  
  const isMapZoomedIntoNepal = currentMapView && 
                               currentMapView.center && 
                               currentMapView.zoom >= 5 &&
                               !isWorldView &&
                               currentMapView.center.lat >= 26.0 && currentMapView.center.lat <= 31.0 &&
                               currentMapView.center.lng >= 80.0 && currentMapView.center.lng <= 89.0
  
  const isMapZoomedIntoSriLanka = currentMapView && 
                                  currentMapView.center && 
                                  currentMapView.zoom >= 5 &&
                                  !isWorldView &&
                                  currentMapView.center.lat >= 5.5 && currentMapView.center.lat <= 10.0 &&
                                  currentMapView.center.lng >= 79.0 && currentMapView.center.lng <= 82.0
  
  // Determine if we're in a country-focused view (India, Nepal, or Sri Lanka)
  const indiaRegionsVisible = visibleRegions && (
    visibleRegions['India-Parks'] === true || 
    visibleRegions['India-UNESCO'] === true || 
    visibleRegions['India-Jyotirlinga'] === true || 
    visibleRegions['India-ShaktiPeetha'] === true || 
    visibleRegions['India-OtherTemples'] === true || 
    visibleRegions['India-Matham'] === true || 
    visibleRegions['India-DivyaDesam'] === true || 
    visibleRegions['India-Forts'] === true
  )
  
  const nepalRegionsVisible = visibleRegions && (
    visibleRegions['Nepal-Parks'] === true || 
    visibleRegions['Nepal-Temples'] === true || 
    visibleRegions['Nepal-UNESCO'] === true || 
    visibleRegions['Nepal-TrekkingFlights'] === true
  )
  
  const sriLankaRegionsVisible = visibleRegions && (
    visibleRegions['Sri Lanka-Parks'] === true || 
    visibleRegions['Sri Lanka-Temples'] === true || 
    visibleRegions['Sri Lanka-UNESCO'] === true
  )
  
  const allRegionsVisible = visibleRegions && Object.values(visibleRegions).every(value => value === true)
  const isCountryFocusedByRegions = !allRegionsVisible && (indiaRegionsVisible || nepalRegionsVisible || sriLankaRegionsVisible)
  const isCountryFocusedByZoom = isMapZoomedIntoIndia || isMapZoomedIntoNepal || isMapZoomedIntoSriLanka
  
  const isCountryFocusedView = isCountryFocusedByZoom || isCountryFocusedByRegions
  
  // Filter to show only types available in the selected region
  // In general view, group temple types under "Temples"
  let filteredTypes = availableTypes 
    ? allAttractionTypes.filter(type => {
        if (type.key === 'Jyotirlinga' || type.key === 'ShaktiPeetha' || type.key === 'Matham' || type.key === 'DivyaDesam') {
          // In country-focused view, show these separately if available
          // In general view, they're grouped under "Temples"
          return isCountryFocusedView && availableTypes[type.key] === true
        }
        return availableTypes[type.key] === true
      })
    : allAttractionTypes

  const toggleAll = () => {
    const allVisible = attractionTypes.every(type => visibleTypes[type.key])
    attractionTypes.forEach(type => {
      if (allVisible) {
        // Turn all off
        if (visibleTypes[type.key]) {
          toggleType(type.key)
        }
      } else {
        // Turn all on
        if (!visibleTypes[type.key]) {
          toggleType(type.key)
        }
      }
    })
  }

  const allVisible = filteredTypes.length > 0 && filteredTypes.every(type => visibleTypes[type.key])
  const someVisible = filteredTypes.some(type => visibleTypes[type.key])

  return (
    <>
      <button
        className="filter-icon-button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Filter by attraction type"
        title="Filter by attraction type"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M2.5 5H17.5M5 10H15M7.5 15H12.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </button>

      {isOpen && (
        <div className="attraction-type-filter-panel" ref={filterRef}>
          <div className="filter-panel-header">
            <h3>Filter by Type</h3>
            <button
              className="filter-close-button"
              onClick={() => setIsOpen(false)}
              aria-label="Close filter"
            >
              ×
            </button>
          </div>
          
          {filteredTypes.length > 0 && (
            <div className="filter-actions">
              <button
                className="toggle-all-button"
                onClick={toggleAll}
              >
                {allVisible ? 'Deselect All' : 'Select All'}
              </button>
            </div>
          )}

          <div className="filter-type-list">
            {filteredTypes.length === 0 ? (
              <div className="filter-empty-message">
                No attraction types available in the selected region.
              </div>
            ) : (
              filteredTypes.map(type => (
                <label key={type.key} className="filter-type-item">
                  <input
                    type="checkbox"
                    checked={visibleTypes[type.key] || false}
                    onChange={() => toggleType(type.key)}
                  />
                  <span className="filter-type-icon">{type.icon}</span>
                  <span className="filter-type-label">{type.label}</span>
                </label>
              ))
            )}
          </div>

          {/* Visited Places Filter Section */}
          <div className="visited-filter-section" style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #e0e0e0', flexShrink: 0 }}>
            <label className="filter-type-item">
              <input
                type="checkbox"
                checked={showVisitedOnly || false}
                onChange={(e) => {
                  setShowVisitedOnly(e.target.checked)
                  if (e.target.checked) setShowUnvisitedOnly(false)
                }}
              />
              <span className="filter-type-icon">✓</span>
              <span className="filter-type-label">Visited Only</span>
            </label>
            <label className="filter-type-item" style={{ marginTop: '6px' }}>
              <input
                type="checkbox"
                checked={showUnvisitedOnly || false}
                onChange={(e) => {
                  setShowUnvisitedOnly(e.target.checked)
                  if (e.target.checked) setShowVisitedOnly(false)
                }}
              />
              <span className="filter-type-icon">○</span>
              <span className="filter-type-label">Unvisited Only</span>
            </label>
          </div>

          {/* Airport Toggle Section - Show dynamically when airports are available */}
          {availableTypes && availableTypes.Airports && (
            <div className="airport-toggle-section" style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #e0e0e0', flexShrink: 0 }}>
              <label className="filter-type-item airport-toggle">
                <input
                  type="checkbox"
                  checked={showAirports || false}
                  onChange={(e) => setShowAirports(e.target.checked)}
                />
                <span className="filter-type-icon">✈️</span>
                <span className="filter-type-label">Show Airports</span>
              </label>
              <p className="filter-hint-small" style={{ marginTop: '6px', fontSize: '11px', color: '#666', padding: '0 14px' }}>
                Toggle to show/hide airport markers near visible parks (within 200 miles)
              </p>
            </div>
          )}
        </div>
      )}
    </>
  )
}

export default AttractionTypeFilter

