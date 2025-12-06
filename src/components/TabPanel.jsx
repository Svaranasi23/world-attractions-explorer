import React, { useState, useEffect } from 'react'
import StatisticsPanel from './StatisticsPanel'
import FilterPanel from './FilterPanel'
import './TabPanel.css'

function TabPanel({ activeTab, setActiveTab, parks, regions, visibleRegions, toggleRegion, toggleAllUSRegions, areAllUSRegionsVisible, toggleAllIndiaRegions, areAllIndiaRegionsVisible, toggleAllNepalRegions, areAllNepalRegionsVisible, toggleAllSriLankaRegions, areAllSriLankaRegionsVisible, showAirports, setShowAirports }) {
  const [isMinimized, setIsMinimized] = useState(false)
  const [isHidden, setIsHidden] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleMinimize = () => {
    setIsMinimized(true)
    setIsHidden(false)
  }

  const handleClose = () => {
    setIsHidden(true)
    setIsMinimized(false)
  }

  const handleExpand = () => {
    setIsMinimized(false)
    setIsHidden(false)
  }

  // If minimized, show a small bar that can be clicked to expand
  if (isMobile && isMinimized && !isHidden) {
    return (
      <div className="tabbed-panel minimized" onClick={handleExpand}>
        <div className="tab-headers">
          <button
            className={`tab-button ${activeTab === 'filters' ? 'active' : ''}`}
            onClick={(e) => {
              e.stopPropagation()
              setActiveTab('filters')
              handleExpand()
            }}
          >
            🔍 Filters
          </button>
          <button
            className={`tab-button ${activeTab === 'stats' ? 'active' : ''}`}
            onClick={(e) => {
              e.stopPropagation()
              setActiveTab('stats')
              handleExpand()
            }}
          >
            📊 Statistics
          </button>
        </div>
      </div>
    )
  }

  // If hidden, show nothing (or a small floating button to show panel)
  if (isMobile && isHidden) {
    return (
      <button
        className="mobile-show-panel-button"
        onClick={handleExpand}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: '#4CAF50',
          color: 'white',
          border: 'none',
          fontSize: '24px',
          cursor: 'pointer',
          zIndex: 999,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        ☰
      </button>
    )
  }

  return (
    <div className={`tabbed-panel ${isMinimized ? 'minimized' : ''} ${isHidden ? 'hidden' : ''}`}>
      {isMobile && (
        <>
          <button
            className="mobile-minimize-button"
            onClick={handleMinimize}
            aria-label="Minimize panel"
          >
            −
          </button>
          <button
            className="mobile-close-button"
            onClick={handleClose}
            aria-label="Close panel"
          >
            ×
          </button>
        </>
      )}
      <div className="tab-headers">
        <button
          className={`tab-button ${activeTab === 'filters' ? 'active' : ''}`}
          onClick={() => setActiveTab('filters')}
        >
          🔍 Filters
        </button>
        <button
          className={`tab-button ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          📊 Statistics
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'stats' && (
          <StatisticsPanel
            parks={parks}
            regions={regions}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        )}
        {activeTab === 'filters' && (
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
    </div>
  )
}

export default TabPanel

