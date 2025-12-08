import React, { useState, useEffect, useMemo } from 'react'
import StatisticsPanel from './StatisticsPanel'
import './TabPanel.css'

function TabPanel({ activeTab, setActiveTab, parks, regions, visibleRegions, toggleRegion, setRegionVisibility, handleRegionFocus }) {
  const [isOpen, setIsOpen] = useState(false)
  const [currentView, setCurrentView] = useState(null) // null = menu list, 'stats' = content view
  
  // Expansion states for continents
  const [americasExpanded, setAmericasExpanded] = useState(false)
  const [asiaExpanded, setAsiaExpanded] = useState(false)

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

  // Handle continent click - focus map and filter
  const handleContinentClick = (continent) => {
    // Focus on continent center
    if (continent === 'Americas') {
      handleRegionFocus('United States') // Focus on US as center of Americas
    } else if (continent === 'Asia') {
      handleRegionFocus('India') // Focus on India as center of Asia
    }
    
    // Filter to show only this continent
    const allRegions = Object.keys(visibleRegions)
    
    if (continent === 'Americas') {
      // Show only Americas regions, hide all others
      const americasRegions = ['West', 'South', 'Midwest', 'Northeast', 'Alaska', 'Hawaii', 'Canada', 'Costa Rica', 'CentralAmerica-UNESCO']
      // Set all regions at once - show only Americas
      const newVisibleRegions = {}
      allRegions.forEach(region => {
        newVisibleRegions[region] = americasRegions.includes(region) ? true : false
      })
      setRegionVisibility(newVisibleRegions)
    } else if (continent === 'Asia') {
      // Show only Asia regions, hide all others
      const asiaRegions = ['India-Parks', 'India-UNESCO', 'India-Jyotirlinga', 'India-ShaktiPeetha', 'India-OtherTemples', 'India-Mutts', 'India-DivyaDesam', 'India-Forts',
                           'Nepal-Parks', 'Nepal-Temples', 'Nepal-UNESCO', 'Nepal-TrekkingFlights',
                           'Sri Lanka-Parks', 'Sri Lanka-Temples', 'Sri Lanka-UNESCO',
                           'SouthEastAsia-UNESCO', 'EastAsia-UNESCO', 'SouthAsia-UNESCO', 'CentralAsia-UNESCO', 'WestAsia-UNESCO']
      // Set all regions at once - show only Asia
      const newVisibleRegions = {}
      allRegions.forEach(region => {
        newVisibleRegions[region] = asiaRegions.includes(region) ? true : false
      })
      setRegionVisibility(newVisibleRegions)
    }
  }

  const handleWorldAttractionsClick = () => {
    // Focus on world view (default center)
    handleRegionFocus('World')
    
    // Show all regions
    const allRegions = Object.keys(visibleRegions)
    const newVisibleRegions = {}
    allRegions.forEach(region => {
      newVisibleRegions[region] = true
    })
    setRegionVisibility(newVisibleRegions)
  }

  const handleCountryClick = (country) => {
    // Map country names to region keys for focusing
    const countryRegionMap = {
      'United States': 'United States',
      'Canada': 'Canada',
      'Costa Rica': 'Costa Rica',
      'India': 'India',
      'Nepal': 'Nepal',
      'Sri Lanka': 'Sri Lanka',
      'Central America UNESCO': 'CentralAmerica-UNESCO',
      'South Asia UNESCO': 'SouthAsia-UNESCO',
      'South-eastern Asia UNESCO': 'SouthEastAsia-UNESCO',
      'Eastern Asia UNESCO': 'EastAsia-UNESCO',
      'Central Asia UNESCO': 'CentralAsia-UNESCO',
      'Western Asia UNESCO': 'WestAsia-UNESCO'
    }
    
    const regionKey = countryRegionMap[country]
    if (regionKey) {
      // Focus on the country
      handleRegionFocus(regionKey)
      
      // Determine which regions belong to this country
      let countryRegions = []
      if (country === 'United States') {
        countryRegions = ['West', 'South', 'Midwest', 'Northeast', 'Alaska', 'Hawaii']
      } else if (country === 'India') {
        countryRegions = ['India-Parks', 'India-UNESCO', 'India-Jyotirlinga', 'India-ShaktiPeetha', 'India-OtherTemples', 'India-Mutts', 'India-DivyaDesam', 'India-Forts']
      } else if (country === 'Nepal') {
        countryRegions = ['Nepal-Parks', 'Nepal-Temples', 'Nepal-UNESCO', 'Nepal-TrekkingFlights']
      } else if (country === 'Sri Lanka') {
        countryRegions = ['Sri Lanka-Parks', 'Sri Lanka-Temples', 'Sri Lanka-UNESCO']
      } else if (country === 'Canada') {
        countryRegions = ['Canada']
      } else if (country === 'Costa Rica') {
        countryRegions = ['Costa Rica']
      } else if (country.includes('UNESCO')) {
        countryRegions = [regionKey]
      }
      
      // Filter to show only this country - hide all others
      const allRegions = Object.keys(visibleRegions)
      // Set all regions at once - show only this country
      const newVisibleRegions = {}
      allRegions.forEach(region => {
        newVisibleRegions[region] = countryRegions.includes(region) ? true : false
      })
      setRegionVisibility(newVisibleRegions)
    }
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
              onClick={() => setCurrentView(null)}
              aria-label="Back"
            >
              ←
            </button>
          )}
          <h2>{currentView ? '📊 Statistics' : 'World Attractions'}</h2>
          <button
            className="menu-close-button"
            onClick={closeMenu}
            aria-label="Close menu"
          >
            ×
          </button>
        </div>

        {!currentView ? (
          /* Main Menu - Continents with Collapsible Countries */
          <div className="menu-navigation">
            {/* World Attractions - Show All */}
            <div className="menu-continent-group">
              <button
                className="menu-continent-item"
                onClick={handleWorldAttractionsClick}
              >
                <div className="continent-icon">🌍</div>
                <div className="continent-info">
                  <div className="continent-name">World Attractions</div>
                </div>
                <div className="menu-arrow">→</div>
              </button>
            </div>

            {/* Americas */}
            <div className="menu-continent-group">
              <button
                className="menu-continent-item"
                onClick={(e) => {
                  e.stopPropagation()
                  const newExpanded = !americasExpanded
                  setAmericasExpanded(newExpanded)
                  if (newExpanded) {
                    handleContinentClick('Americas')
                  }
                }}
              >
                <div className="continent-icon">🌎</div>
                <div className="continent-info">
                  <div className="continent-name">Americas</div>
                </div>
                <div className="menu-arrow">{americasExpanded ? '▼' : '▶'}</div>
              </button>
              {americasExpanded && (
                <div className="continent-countries">
                  <button
                    className="menu-country-item"
                    onClick={() => handleCountryClick('United States')}
                  >
                    <div className="country-info">
                      <div className="country-name">🇺🇸 United States</div>
                    </div>
                  </button>
                  {regions.Canada && regions.Canada.length > 0 && (
                    <button
                      className="menu-country-item"
                      onClick={() => handleCountryClick('Canada')}
                    >
                      <div className="country-info">
                        <div className="country-name">🇨🇦 Canada</div>
                      </div>
                    </button>
                  )}
                  {regions['Costa Rica'] && regions['Costa Rica'].length > 0 && (
                    <button
                      className="menu-country-item"
                      onClick={() => handleCountryClick('Costa Rica')}
                    >
                      <div className="country-info">
                        <div className="country-name">🇨🇷 Costa Rica</div>
                      </div>
                    </button>
                  )}
                  {regions['CentralAmerica-UNESCO'] && regions['CentralAmerica-UNESCO'].length > 0 && (
                    <button
                      className="menu-country-item"
                      onClick={() => handleCountryClick('Central America UNESCO')}
                    >
                      <div className="country-info">
                        <div className="country-name">🌎 Central America UNESCO</div>
                      </div>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Asia */}
            <div className="menu-continent-group">
              <button
                className="menu-continent-item"
                onClick={(e) => {
                  e.stopPropagation()
                  const newExpanded = !asiaExpanded
                  setAsiaExpanded(newExpanded)
                  if (newExpanded) {
                    handleContinentClick('Asia')
                  }
                }}
              >
                <div className="continent-icon">🌏</div>
                <div className="continent-info">
                  <div className="continent-name">Asia</div>
                </div>
                <div className="menu-arrow">{asiaExpanded ? '▼' : '▶'}</div>
              </button>
              {asiaExpanded && (
                <div className="continent-countries">
                  <button
                    className="menu-country-item"
                    onClick={() => handleCountryClick('India')}
                  >
                    <div className="country-info">
                      <div className="country-name">🇮🇳 India</div>
                    </div>
                  </button>
                  {regions['Nepal-Parks'] || regions['Nepal-Temples'] || regions['Nepal-UNESCO'] || regions['Nepal-TrekkingFlights'] ? (
                    <button
                      className="menu-country-item"
                      onClick={() => handleCountryClick('Nepal')}
                    >
                      <div className="country-info">
                        <div className="country-name">🇳🇵 Nepal</div>
                      </div>
                    </button>
                  ) : null}
                  {regions['Sri Lanka-Parks'] || regions['Sri Lanka-Temples'] || regions['Sri Lanka-UNESCO'] ? (
                    <button
                      className="menu-country-item"
                      onClick={() => handleCountryClick('Sri Lanka')}
                    >
                      <div className="country-info">
                        <div className="country-name">🇱🇰 Sri Lanka</div>
                      </div>
                    </button>
                  ) : null}
                  {regions['SouthAsia-UNESCO'] && regions['SouthAsia-UNESCO'].length > 0 && (
                    <button
                      className="menu-country-item"
                      onClick={() => handleCountryClick('South Asia UNESCO')}
                    >
                      <div className="country-info">
                        <div className="country-name">🌏 South Asia UNESCO</div>
                      </div>
                    </button>
                  )}
                  {regions['SouthEastAsia-UNESCO'] && regions['SouthEastAsia-UNESCO'].length > 0 && (
                    <button
                      className="menu-country-item"
                      onClick={() => handleCountryClick('South-eastern Asia UNESCO')}
                    >
                      <div className="country-info">
                        <div className="country-name">🌏 South-eastern Asia UNESCO</div>
                      </div>
                    </button>
                  )}
                  {regions['EastAsia-UNESCO'] && regions['EastAsia-UNESCO'].length > 0 && (
                    <button
                      className="menu-country-item"
                      onClick={() => handleCountryClick('Eastern Asia UNESCO')}
                    >
                      <div className="country-info">
                        <div className="country-name">🌏 Eastern Asia UNESCO</div>
                      </div>
                    </button>
                  )}
                  {regions['CentralAsia-UNESCO'] && regions['CentralAsia-UNESCO'].length > 0 && (
                    <button
                      className="menu-country-item"
                      onClick={() => handleCountryClick('Central Asia UNESCO')}
                    >
                      <div className="country-info">
                        <div className="country-name">🌏 Central Asia UNESCO</div>
                      </div>
                    </button>
                  )}
                  {regions['WestAsia-UNESCO'] && regions['WestAsia-UNESCO'].length > 0 && (
                    <button
                      className="menu-country-item"
                      onClick={() => handleCountryClick('Western Asia UNESCO')}
                    >
                      <div className="country-info">
                        <div className="country-name">🌏 Western Asia UNESCO</div>
                      </div>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Statistics */}
            <div className="menu-continent-group">
              <button
                className="menu-continent-item"
                onClick={() => handleMenuClick('stats')}
              >
                <div className="continent-icon">📊</div>
                <div className="continent-info">
                  <div className="continent-name">Statistics</div>
                </div>
                <div className="menu-arrow">→</div>
              </button>
            </div>
          </div>
        ) : (
          /* Statistics View */
          <div className="tab-content">
            {currentView === 'stats' && (
              <StatisticsPanel
                parks={parks}
                regions={regions}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
              />
            )}
          </div>
        )}
      </div>
    </>
  )
}

export default TabPanel

