import React, { useState, useEffect, useRef } from 'react'
import './AttractionTypeFilter.css'

function AttractionTypeFilter({ visibleTypes, toggleType, isOpen, setIsOpen }) {
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
  const attractionTypes = [
    { key: 'NationalParks', label: 'National Parks', icon: '🏞️' },
    { key: 'UNESCO', label: 'UNESCO Sites', icon: '🏛️' },
    { key: 'Temples', label: 'Temples', icon: '🕉️' },
    { key: 'Jyotirlinga', label: 'Jyotirlinga', icon: '🔱' },
    { key: 'ShaktiPeetha', label: 'Shakti Peetha', icon: '🌸' },
    { key: 'Mutts', label: 'Mutts', icon: '⛩️' },
    { key: 'DivyaDesam', label: 'Divya Desam', icon: '🕉️' },
    { key: 'Forts', label: 'Forts', icon: '🏰' },
    { key: 'TrekkingFlights', label: 'Trekking & Flights', icon: '✈️' }
  ]

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

  const allVisible = attractionTypes.every(type => visibleTypes[type.key])
  const someVisible = attractionTypes.some(type => visibleTypes[type.key])

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
          
          <div className="filter-actions">
            <button
              className="toggle-all-button"
              onClick={toggleAll}
            >
              {allVisible ? 'Deselect All' : 'Select All'}
            </button>
          </div>

          <div className="filter-type-list">
            {attractionTypes.map(type => (
              <label key={type.key} className="filter-type-item">
                <input
                  type="checkbox"
                  checked={visibleTypes[type.key] || false}
                  onChange={() => toggleType(type.key)}
                />
                <span className="filter-type-icon">{type.icon}</span>
                <span className="filter-type-label">{type.label}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </>
  )
}

export default AttractionTypeFilter

