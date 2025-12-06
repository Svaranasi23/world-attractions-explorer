import React, { useState, useEffect } from 'react'
import StatisticsPanel from './StatisticsPanel'
import FilterPanel from './FilterPanel'
import './TabPanel.css'

function TabPanel({ activeTab, setActiveTab, parks, regions, visibleRegions, toggleRegion, toggleAllUSRegions, areAllUSRegionsVisible, toggleAllIndiaRegions, areAllIndiaRegionsVisible, toggleAllNepalRegions, areAllNepalRegionsVisible, toggleAllSriLankaRegions, areAllSriLankaRegionsVisible, showAirports, setShowAirports }) {
  const [isOpen, setIsOpen] = useState(false)
  const [currentView, setCurrentView] = useState(null) // null = menu list, 'filters' or 'stats' = content view

  const toggleMenu = () => {
    setIsOpen(!isOpen)
    if (!isOpen) {
      setCurrentView(null) // Reset to menu when opening
    }
  }

  const closeMenu = () => {
    setIsOpen(false)
    setCurrentView(null)
  }

  const handleMenuClick = (view) => {
    setCurrentView(view)
    setActiveTab(view)
  }

  const handleBack = () => {
    setCurrentView(null)
  }

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && !event.target.closest('.hamburger-menu') && !event.target.closest('.hamburger-button')) {
        closeMenu()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      // Prevent body scroll when menu is open on mobile
      document.body.style.overflow = 'hidden'
      // Add class to body to adjust zoom controls position
      document.body.classList.add('menu-open')
    } else {
      document.body.style.overflow = ''
      document.body.classList.remove('menu-open')
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.body.style.overflow = ''
      document.body.classList.remove('menu-open')
    }
  }, [isOpen])

  return (
    <>
      {/* Hamburger Menu Button */}
      <button
        className="hamburger-button"
        onClick={toggleMenu}
        aria-label="Toggle menu"
        aria-expanded={isOpen}
      >
        <span className={`hamburger-icon ${isOpen ? 'open' : ''}`}>
          <span></span>
          <span></span>
          <span></span>
        </span>
      </button>

      {/* Overlay */}
      {isOpen && (
        <div className="menu-overlay" onClick={closeMenu}></div>
      )}

      {/* Slide-in Drawer */}
      <div className={`hamburger-menu ${isOpen ? 'open' : ''}`}>
        <div className="menu-header">
          {currentView && (
            <button
              className="menu-back-button"
              onClick={handleBack}
              aria-label="Back to menu"
            >
              ←
            </button>
          )}
          <h2>{currentView ? (currentView === 'filters' ? '🔍 Filters' : '📊 Statistics') : 'Menu'}</h2>
          <button
            className="menu-close-button"
            onClick={closeMenu}
            aria-label="Close menu"
          >
            ×
          </button>
        </div>

        {!currentView ? (
          /* Menu Items List */
          <div className="menu-items">
            <button
              className="menu-item"
              onClick={() => handleMenuClick('filters')}
            >
              <span className="menu-item-icon">🔍</span>
              <span className="menu-item-text">Filters</span>
              <span className="menu-item-arrow">→</span>
            </button>
            <button
              className="menu-item"
              onClick={() => handleMenuClick('stats')}
            >
              <span className="menu-item-icon">📊</span>
              <span className="menu-item-text">Statistics</span>
              <span className="menu-item-arrow">→</span>
            </button>
          </div>
        ) : (
          /* Content View */
          <div className="tab-content">
            {currentView === 'stats' && (
              <StatisticsPanel
                parks={parks}
                regions={regions}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
              />
            )}
            {currentView === 'filters' && (
              <FilterPanel
                regions={regions}
                visibleRegions={visibleRegions}
                toggleRegion={toggleRegion}
                toggleAllUSRegions={toggleAllUSRegions}
                areAllUSRegionsVisible={areAllUSRegionsVisible}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                showAirports={showAirports}
                setShowAirports={setShowAirports}
                toggleAllIndiaRegions={toggleAllIndiaRegions}
                areAllIndiaRegionsVisible={areAllIndiaRegionsVisible}
                toggleAllNepalRegions={toggleAllNepalRegions}
                areAllNepalRegionsVisible={areAllNepalRegionsVisible}
                toggleAllSriLankaRegions={toggleAllSriLankaRegions}
                areAllSriLankaRegionsVisible={areAllSriLankaRegionsVisible}
              />
            )}
          </div>
        )}
      </div>
    </>
  )
}

export default TabPanel

