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
      'Western Asia UNESCO': 'WestAsia-UNESCO',
      // Individual Asian countries
      'China': 'EastAsia-UNESCO',
      'Japan': 'EastAsia-UNESCO',
      'South Korea': 'EastAsia-UNESCO',
      'North Korea': 'EastAsia-UNESCO',
      'Mongolia': 'EastAsia-UNESCO',
      'Thailand': 'SouthEastAsia-UNESCO',
      'Indonesia': 'SouthEastAsia-UNESCO',
      'Vietnam': 'SouthEastAsia-UNESCO',
      'Cambodia': 'SouthEastAsia-UNESCO',
      'Myanmar': 'SouthEastAsia-UNESCO',
      'Philippines': 'SouthEastAsia-UNESCO',
      'Malaysia': 'SouthEastAsia-UNESCO',
      'Singapore': 'SouthEastAsia-UNESCO',
      'Laos': 'SouthEastAsia-UNESCO',
      'Brunei': 'SouthEastAsia-UNESCO',
      'East Timor': 'SouthEastAsia-UNESCO',
      'Bangladesh': 'SouthAsia-UNESCO',
      'Pakistan': 'SouthAsia-UNESCO',
      'Afghanistan': 'SouthAsia-UNESCO',
      'Bhutan': 'SouthAsia-UNESCO',
      'Maldives': 'SouthAsia-UNESCO',
      'Kazakhstan': 'CentralAsia-UNESCO',
      'Kyrgyzstan': 'CentralAsia-UNESCO',
      'Tajikistan': 'CentralAsia-UNESCO',
      'Turkmenistan': 'CentralAsia-UNESCO',
      'Uzbekistan': 'CentralAsia-UNESCO',
      'Iran': 'WestAsia-UNESCO',
      'Iraq': 'WestAsia-UNESCO',
      'Jordan': 'WestAsia-UNESCO',
      'Lebanon': 'WestAsia-UNESCO',
      'Saudi Arabia': 'WestAsia-UNESCO',
      'Syria': 'WestAsia-UNESCO',
      'Turkey': 'WestAsia-UNESCO',
      'UAE': 'WestAsia-UNESCO',
      'Yemen': 'WestAsia-UNESCO',
      'Oman': 'WestAsia-UNESCO',
      'Qatar': 'WestAsia-UNESCO',
      'Kuwait': 'WestAsia-UNESCO',
      'Bahrain': 'WestAsia-UNESCO',
      'Israel': 'WestAsia-UNESCO',
      'Palestine': 'WestAsia-UNESCO'
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
      } else {
        // Individual Asian countries - show their regional UNESCO group
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
        className={`hamburger-button ${isOpen ? 'menu-open' : ''}`}
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
                  
                  {/* South Asia Countries */}
                  {regions['SouthAsia-UNESCO'] && regions['SouthAsia-UNESCO'].length > 0 && (
                    <>
                      {regions['SouthAsia-UNESCO'].some(p => p.Country === 'Bangladesh') && (
                        <button className="menu-country-item" onClick={() => handleCountryClick('Bangladesh')}>
                          <div className="country-info"><div className="country-name">🇧🇩 Bangladesh</div></div>
                        </button>
                      )}
                      {regions['SouthAsia-UNESCO'].some(p => p.Country === 'Pakistan') && (
                        <button className="menu-country-item" onClick={() => handleCountryClick('Pakistan')}>
                          <div className="country-info"><div className="country-name">🇵🇰 Pakistan</div></div>
                        </button>
                      )}
                      {regions['SouthAsia-UNESCO'].some(p => p.Country === 'Afghanistan') && (
                        <button className="menu-country-item" onClick={() => handleCountryClick('Afghanistan')}>
                          <div className="country-info"><div className="country-name">🇦🇫 Afghanistan</div></div>
                        </button>
                      )}
                      {regions['SouthAsia-UNESCO'].some(p => p.Country === 'Bhutan') && (
                        <button className="menu-country-item" onClick={() => handleCountryClick('Bhutan')}>
                          <div className="country-info"><div className="country-name">🇧🇹 Bhutan</div></div>
                        </button>
                      )}
                      {regions['SouthAsia-UNESCO'].some(p => p.Country === 'Maldives') && (
                        <button className="menu-country-item" onClick={() => handleCountryClick('Maldives')}>
                          <div className="country-info"><div className="country-name">🇲🇻 Maldives</div></div>
                        </button>
                      )}
                    </>
                  )}
                  
                  {/* Southeast Asia Countries */}
                  {regions['SouthEastAsia-UNESCO'] && regions['SouthEastAsia-UNESCO'].length > 0 && (
                    <>
                      {regions['SouthEastAsia-UNESCO'].some(p => p.Country === 'Thailand') && (
                        <button className="menu-country-item" onClick={() => handleCountryClick('Thailand')}>
                          <div className="country-info"><div className="country-name">🇹🇭 Thailand</div></div>
                        </button>
                      )}
                      {regions['SouthEastAsia-UNESCO'].some(p => p.Country === 'Indonesia') && (
                        <button className="menu-country-item" onClick={() => handleCountryClick('Indonesia')}>
                          <div className="country-info"><div className="country-name">🇮🇩 Indonesia</div></div>
                        </button>
                      )}
                      {regions['SouthEastAsia-UNESCO'].some(p => p.Country === 'Vietnam') && (
                        <button className="menu-country-item" onClick={() => handleCountryClick('Vietnam')}>
                          <div className="country-info"><div className="country-name">🇻🇳 Vietnam</div></div>
                        </button>
                      )}
                      {regions['SouthEastAsia-UNESCO'].some(p => p.Country === 'Cambodia') && (
                        <button className="menu-country-item" onClick={() => handleCountryClick('Cambodia')}>
                          <div className="country-info"><div className="country-name">🇰🇭 Cambodia</div></div>
                        </button>
                      )}
                      {regions['SouthEastAsia-UNESCO'].some(p => p.Country === 'Myanmar') && (
                        <button className="menu-country-item" onClick={() => handleCountryClick('Myanmar')}>
                          <div className="country-info"><div className="country-name">🇲🇲 Myanmar</div></div>
                        </button>
                      )}
                      {regions['SouthEastAsia-UNESCO'].some(p => p.Country === 'Philippines') && (
                        <button className="menu-country-item" onClick={() => handleCountryClick('Philippines')}>
                          <div className="country-info"><div className="country-name">🇵🇭 Philippines</div></div>
                        </button>
                      )}
                      {regions['SouthEastAsia-UNESCO'].some(p => p.Country === 'Malaysia') && (
                        <button className="menu-country-item" onClick={() => handleCountryClick('Malaysia')}>
                          <div className="country-info"><div className="country-name">🇲🇾 Malaysia</div></div>
                        </button>
                      )}
                      {regions['SouthEastAsia-UNESCO'].some(p => p.Country === 'Singapore') && (
                        <button className="menu-country-item" onClick={() => handleCountryClick('Singapore')}>
                          <div className="country-info"><div className="country-name">🇸🇬 Singapore</div></div>
                        </button>
                      )}
                      {regions['SouthEastAsia-UNESCO'].some(p => p.Country === 'Laos') && (
                        <button className="menu-country-item" onClick={() => handleCountryClick('Laos')}>
                          <div className="country-info"><div className="country-name">🇱🇦 Laos</div></div>
                        </button>
                      )}
                      {regions['SouthEastAsia-UNESCO'].some(p => p.Country === 'Brunei') && (
                        <button className="menu-country-item" onClick={() => handleCountryClick('Brunei')}>
                          <div className="country-info"><div className="country-name">🇧🇳 Brunei</div></div>
                        </button>
                      )}
                      {regions['SouthEastAsia-UNESCO'].some(p => p.Country === 'East Timor') && (
                        <button className="menu-country-item" onClick={() => handleCountryClick('East Timor')}>
                          <div className="country-info"><div className="country-name">🇹🇱 East Timor</div></div>
                        </button>
                      )}
                    </>
                  )}
                  
                  {/* East Asia Countries */}
                  {regions['EastAsia-UNESCO'] && regions['EastAsia-UNESCO'].length > 0 && (
                    <>
                      {regions['EastAsia-UNESCO'].some(p => p.Country === 'China') && (
                        <button className="menu-country-item" onClick={() => handleCountryClick('China')}>
                          <div className="country-info"><div className="country-name">🇨🇳 China</div></div>
                        </button>
                      )}
                      {regions['EastAsia-UNESCO'].some(p => p.Country === 'Japan') && (
                        <button className="menu-country-item" onClick={() => handleCountryClick('Japan')}>
                          <div className="country-info"><div className="country-name">🇯🇵 Japan</div></div>
                        </button>
                      )}
                      {regions['EastAsia-UNESCO'].some(p => p.Country === 'South Korea') && (
                        <button className="menu-country-item" onClick={() => handleCountryClick('South Korea')}>
                          <div className="country-info"><div className="country-name">🇰🇷 South Korea</div></div>
                        </button>
                      )}
                      {regions['EastAsia-UNESCO'].some(p => p.Country === 'North Korea') && (
                        <button className="menu-country-item" onClick={() => handleCountryClick('North Korea')}>
                          <div className="country-info"><div className="country-name">🇰🇵 North Korea</div></div>
                        </button>
                      )}
                      {regions['EastAsia-UNESCO'].some(p => p.Country === 'Mongolia') && (
                        <button className="menu-country-item" onClick={() => handleCountryClick('Mongolia')}>
                          <div className="country-info"><div className="country-name">🇲🇳 Mongolia</div></div>
                        </button>
                      )}
                    </>
                  )}
                  
                  {/* Central Asia Countries */}
                  {regions['CentralAsia-UNESCO'] && regions['CentralAsia-UNESCO'].length > 0 && (
                    <>
                      {regions['CentralAsia-UNESCO'].some(p => p.Country === 'Kazakhstan') && (
                        <button className="menu-country-item" onClick={() => handleCountryClick('Kazakhstan')}>
                          <div className="country-info"><div className="country-name">🇰🇿 Kazakhstan</div></div>
                        </button>
                      )}
                      {regions['CentralAsia-UNESCO'].some(p => p.Country === 'Kyrgyzstan') && (
                        <button className="menu-country-item" onClick={() => handleCountryClick('Kyrgyzstan')}>
                          <div className="country-info"><div className="country-name">🇰🇬 Kyrgyzstan</div></div>
                        </button>
                      )}
                      {regions['CentralAsia-UNESCO'].some(p => p.Country === 'Tajikistan') && (
                        <button className="menu-country-item" onClick={() => handleCountryClick('Tajikistan')}>
                          <div className="country-info"><div className="country-name">🇹🇯 Tajikistan</div></div>
                        </button>
                      )}
                      {regions['CentralAsia-UNESCO'].some(p => p.Country === 'Turkmenistan') && (
                        <button className="menu-country-item" onClick={() => handleCountryClick('Turkmenistan')}>
                          <div className="country-info"><div className="country-name">🇹🇲 Turkmenistan</div></div>
                        </button>
                      )}
                      {regions['CentralAsia-UNESCO'].some(p => p.Country === 'Uzbekistan') && (
                        <button className="menu-country-item" onClick={() => handleCountryClick('Uzbekistan')}>
                          <div className="country-info"><div className="country-name">🇺🇿 Uzbekistan</div></div>
                        </button>
                      )}
                    </>
                  )}
                  
                  {/* West Asia / Middle East Countries */}
                  {regions['WestAsia-UNESCO'] && regions['WestAsia-UNESCO'].length > 0 && (
                    <>
                      {regions['WestAsia-UNESCO'].some(p => p.Country === 'Iran') && (
                        <button className="menu-country-item" onClick={() => handleCountryClick('Iran')}>
                          <div className="country-info"><div className="country-name">🇮🇷 Iran</div></div>
                        </button>
                      )}
                      {regions['WestAsia-UNESCO'].some(p => p.Country === 'Iraq') && (
                        <button className="menu-country-item" onClick={() => handleCountryClick('Iraq')}>
                          <div className="country-info"><div className="country-name">🇮🇶 Iraq</div></div>
                        </button>
                      )}
                      {regions['WestAsia-UNESCO'].some(p => p.Country === 'Jordan') && (
                        <button className="menu-country-item" onClick={() => handleCountryClick('Jordan')}>
                          <div className="country-info"><div className="country-name">🇯🇴 Jordan</div></div>
                        </button>
                      )}
                      {regions['WestAsia-UNESCO'].some(p => p.Country === 'Lebanon') && (
                        <button className="menu-country-item" onClick={() => handleCountryClick('Lebanon')}>
                          <div className="country-info"><div className="country-name">🇱🇧 Lebanon</div></div>
                        </button>
                      )}
                      {regions['WestAsia-UNESCO'].some(p => p.Country === 'Saudi Arabia') && (
                        <button className="menu-country-item" onClick={() => handleCountryClick('Saudi Arabia')}>
                          <div className="country-info"><div className="country-name">🇸🇦 Saudi Arabia</div></div>
                        </button>
                      )}
                      {regions['WestAsia-UNESCO'].some(p => p.Country === 'Syria') && (
                        <button className="menu-country-item" onClick={() => handleCountryClick('Syria')}>
                          <div className="country-info"><div className="country-name">🇸🇾 Syria</div></div>
                        </button>
                      )}
                      {regions['WestAsia-UNESCO'].some(p => p.Country === 'Turkey') && (
                        <button className="menu-country-item" onClick={() => handleCountryClick('Turkey')}>
                          <div className="country-info"><div className="country-name">🇹🇷 Turkey</div></div>
                        </button>
                      )}
                      {regions['WestAsia-UNESCO'].some(p => p.Country === 'UAE' || p.Country === 'United Arab Emirates') && (
                        <button className="menu-country-item" onClick={() => handleCountryClick('UAE')}>
                          <div className="country-info"><div className="country-name">🇦🇪 UAE</div></div>
                        </button>
                      )}
                      {regions['WestAsia-UNESCO'].some(p => p.Country === 'Yemen') && (
                        <button className="menu-country-item" onClick={() => handleCountryClick('Yemen')}>
                          <div className="country-info"><div className="country-name">🇾🇪 Yemen</div></div>
                        </button>
                      )}
                      {regions['WestAsia-UNESCO'].some(p => p.Country === 'Oman') && (
                        <button className="menu-country-item" onClick={() => handleCountryClick('Oman')}>
                          <div className="country-info"><div className="country-name">🇴🇲 Oman</div></div>
                        </button>
                      )}
                      {regions['WestAsia-UNESCO'].some(p => p.Country === 'Qatar') && (
                        <button className="menu-country-item" onClick={() => handleCountryClick('Qatar')}>
                          <div className="country-info"><div className="country-name">🇶🇦 Qatar</div></div>
                        </button>
                      )}
                      {regions['WestAsia-UNESCO'].some(p => p.Country === 'Kuwait') && (
                        <button className="menu-country-item" onClick={() => handleCountryClick('Kuwait')}>
                          <div className="country-info"><div className="country-name">🇰🇼 Kuwait</div></div>
                        </button>
                      )}
                      {regions['WestAsia-UNESCO'].some(p => p.Country === 'Bahrain') && (
                        <button className="menu-country-item" onClick={() => handleCountryClick('Bahrain')}>
                          <div className="country-info"><div className="country-name">🇧🇭 Bahrain</div></div>
                        </button>
                      )}
                      {regions['WestAsia-UNESCO'].some(p => p.Country === 'Israel') && (
                        <button className="menu-country-item" onClick={() => handleCountryClick('Israel')}>
                          <div className="country-info"><div className="country-name">🇮🇱 Israel</div></div>
                        </button>
                      )}
                      {regions['WestAsia-UNESCO'].some(p => p.Country === 'Palestine') && (
                        <button className="menu-country-item" onClick={() => handleCountryClick('Palestine')}>
                          <div className="country-info"><div className="country-name">🇵🇸 Palestine</div></div>
                        </button>
                      )}
                    </>
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

