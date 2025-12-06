import React, { useState } from 'react'
import './FilterPanel.css'

function FilterPanel({ regions, visibleRegions, toggleRegion, toggleAllUSRegions, areAllUSRegionsVisible, toggleAllIndiaRegions, areAllIndiaRegionsVisible, toggleAllNepalRegions, areAllNepalRegionsVisible, toggleAllSriLankaRegions, areAllSriLankaRegionsVisible, activeTab, setActiveTab, showAirports, setShowAirports }) {
  const usRegions = ['West', 'South', 'Midwest', 'Northeast', 'Alaska', 'Hawaii']
  const totalUSParks = usRegions.reduce((sum, region) => sum + (regions[region]?.length || 0), 0)
  const allUSVisible = areAllUSRegionsVisible()
  const [isExpanded, setIsExpanded] = useState(true)
  const [usaExpanded, setUsaExpanded] = useState(false)
  const [indiaExpanded, setIndiaExpanded] = useState(false)
  const [nepalExpanded, setNepalExpanded] = useState(false)
  const [sriLankaExpanded, setSriLankaExpanded] = useState(false)
  
  const indiaSubRegions = ['India-Parks', 'India-UNESCO', 'India-Jyotirlinga', 'India-ShaktiPeetha', 'India-OtherTemples', 'India-Mutts', 'India-DivyaDesam', 'India-Forts']
  const totalIndiaParks = (regions['India-Parks']?.length || 0) + (regions['India-UNESCO']?.length || 0) + (regions['India-Jyotirlinga']?.length || 0) + (regions['India-ShaktiPeetha']?.length || 0) + (regions['India-OtherTemples']?.length || 0) + (regions['India-Mutts']?.length || 0) + (regions['India-DivyaDesam']?.length || 0) + (regions['India-Forts']?.length || 0)
  const allIndiaVisible = areAllIndiaRegionsVisible()
  
  const nepalSubRegions = ['Nepal-Parks', 'Nepal-Temples', 'Nepal-UNESCO', 'Nepal-TrekkingFlights']
  const totalNepalSites = (regions['Nepal-Parks']?.length || 0) + (regions['Nepal-Temples']?.length || 0) + (regions['Nepal-UNESCO']?.length || 0) + (regions['Nepal-TrekkingFlights']?.length || 0)
  const allNepalVisible = areAllNepalRegionsVisible()
  
  const sriLankaSubRegions = ['Sri Lanka-Parks', 'Sri Lanka-Temples', 'Sri Lanka-UNESCO']
  const totalSriLankaSites = (regions['Sri Lanka-Parks']?.length || 0) + (regions['Sri Lanka-Temples']?.length || 0) + (regions['Sri Lanka-UNESCO']?.length || 0)
  const allSriLankaVisible = areAllSriLankaRegionsVisible()

  const handleRegionToggle = (region, checked) => {
    toggleRegion(region, checked)
  }

  const handleUSToggle = (checked) => {
    toggleAllUSRegions(checked, checked)
  }

  const handleIndiaToggle = (checked) => {
    toggleAllIndiaRegions(checked, checked)
  }

  const handleNepalToggle = (checked) => {
    toggleAllNepalRegions(checked, checked)
  }

  const handleSriLankaToggle = (checked) => {
    toggleAllSriLankaRegions(checked, checked)
  }

  return (
    <div className="filter-panel">
      <div className="filter-header" onClick={() => setIsExpanded(!isExpanded)}>
        <h3>🔍 Filter by Region</h3>
        <span className="collapse-icon">{isExpanded ? '▼' : '▶'}</span>
      </div>
      {isExpanded && (
        <>
          <p className="filter-hint">
            Check/uncheck regions to show/hide parks on the map
          </p>
          <div className="filter-list">
            {/* USA as top-level filter */}
            <div className="usa-filter-group">
              <div className="usa-header" onClick={() => setUsaExpanded(!usaExpanded)}>
                <label className="filter-item usa-parent" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={allUSVisible}
                    onChange={(e) => handleUSToggle(e.target.checked)}
                  />
                  <strong style={{ color: '#2e7d32', fontSize: '14px' }}>🇺🇸 United States</strong> ({totalUSParks} parks)
                </label>
                <span className="collapse-icon-small">{usaExpanded ? '▼' : '▶'}</span>
              </div>
              
              {/* Nested US regions */}
              {usaExpanded && (
                <div className="nested-regions">
                  {usRegions.map(region => (
                    <label key={region} className="filter-item nested-item">
                      <input
                        type="checkbox"
                        checked={visibleRegions[region] !== false}
                        onChange={(e) => handleRegionToggle(region, e.target.checked)}
                      />
                      <span>{region}</span> ({regions[region]?.length || 0} parks)
                    </label>
                  ))}
                </div>
              )}
            </div>
        
            {/* Other Countries */}
            {regions.Canada && (
              <label key="Canada" className="filter-item canada-item">
                <input
                  type="checkbox"
                  checked={visibleRegions.Canada !== false}
                  onChange={(e) => handleRegionToggle('Canada', e.target.checked)}
                />
                <strong style={{ color: '#d32f2f' }}>🇨🇦 Canada</strong> ({regions.Canada.length} parks)
              </label>
            )}
            
            {/* India as top-level filter with sub-filters */}
            {(regions['India-Parks'] || regions['India-UNESCO'] || regions['India-Jyotirlinga']) && (
              <div className="india-filter-group">
                <div className="india-header" onClick={() => setIndiaExpanded(!indiaExpanded)}>
                  <label className="filter-item india-parent" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={allIndiaVisible}
                      onChange={(e) => handleIndiaToggle(e.target.checked)}
                    />
                    <strong style={{ color: '#ff9800', fontSize: '14px' }}>🇮🇳 India</strong> ({totalIndiaParks} sites)
                  </label>
                  <span className="collapse-icon-small">{indiaExpanded ? '▼' : '▶'}</span>
                </div>
                
                {/* Nested India sub-regions */}
                {indiaExpanded && (
                  <div className="nested-regions">
                    {regions['India-Parks'] && (
                      <label key="India-Parks" className="filter-item nested-item">
                        <input
                          type="checkbox"
                          checked={visibleRegions['India-Parks'] !== false}
                          onChange={(e) => handleRegionToggle('India-Parks', e.target.checked)}
                        />
                        <span>🏞️ Parks</span> ({regions['India-Parks'].length} parks)
                      </label>
                    )}
                    {regions['India-UNESCO'] && (
                      <label key="India-UNESCO" className="filter-item nested-item">
                        <input
                          type="checkbox"
                          checked={visibleRegions['India-UNESCO'] !== false}
                          onChange={(e) => handleRegionToggle('India-UNESCO', e.target.checked)}
                        />
                        <span>🏛️ UNESCO Sites</span> ({regions['India-UNESCO'].length} sites)
                      </label>
                    )}
                    {regions['India-Jyotirlinga'] && (
                      <label key="India-Jyotirlinga" className="filter-item nested-item">
                        <input
                          type="checkbox"
                          checked={visibleRegions['India-Jyotirlinga'] !== false}
                          onChange={(e) => handleRegionToggle('India-Jyotirlinga', e.target.checked)}
                        />
                        <span>🔱 Jyotirlinga Temples</span> ({regions['India-Jyotirlinga'].length} temples)
                      </label>
                    )}
                    {regions['India-ShaktiPeetha'] && (
                      <label key="India-ShaktiPeetha" className="filter-item nested-item">
                        <input
                          type="checkbox"
                          checked={visibleRegions['India-ShaktiPeetha'] !== false}
                          onChange={(e) => handleRegionToggle('India-ShaktiPeetha', e.target.checked)}
                        />
                        <span>🌸 Shakti Peethas</span> ({regions['India-ShaktiPeetha'].length} peethas)
                      </label>
                    )}
                    {regions['India-OtherTemples'] && (
                      <label key="India-OtherTemples" className="filter-item nested-item">
                        <input
                          type="checkbox"
                          checked={visibleRegions['India-OtherTemples'] !== false}
                          onChange={(e) => handleRegionToggle('India-OtherTemples', e.target.checked)}
                        />
                        <span>🕉️ Major Temples</span> ({regions['India-OtherTemples'].length} temples)
                      </label>
                    )}
                    {regions['India-Mutts'] && (
                      <label key="India-Mutts" className="filter-item nested-item">
                        <input
                          type="checkbox"
                          checked={visibleRegions['India-Mutts'] !== false}
                          onChange={(e) => handleRegionToggle('India-Mutts', e.target.checked)}
                        />
                        <span>🏛️ Maths</span> ({regions['India-Mutts'].length} maths)
                      </label>
                    )}
                    {regions['India-DivyaDesam'] && (
                      <label key="India-DivyaDesam" className="filter-item nested-item">
                        <input
                          type="checkbox"
                          checked={visibleRegions['India-DivyaDesam'] !== false}
                          onChange={(e) => handleRegionToggle('India-DivyaDesam', e.target.checked)}
                        />
                        <span>🐚 Divya Desams</span> ({regions['India-DivyaDesam'].length} desams)
                      </label>
                    )}
                    {regions['India-Forts'] && (
                      <label key="India-Forts" className="filter-item nested-item">
                        <input
                          type="checkbox"
                          checked={visibleRegions['India-Forts'] !== false}
                          onChange={(e) => handleRegionToggle('India-Forts', e.target.checked)}
                        />
                        <span>🏰 Historic Forts</span> ({regions['India-Forts'].length} forts)
                      </label>
                    )}
                  </div>
                )}
              </div>
            )}
            
            {/* Nepal as top-level filter with sub-filters */}
            {(regions['Nepal-Parks'] || regions['Nepal-Temples']) && (
              <div className="nepal-filter-group">
                <div className="nepal-header" onClick={() => setNepalExpanded(!nepalExpanded)}>
                  <label className="filter-item nepal-parent" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={allNepalVisible}
                      onChange={(e) => handleNepalToggle(e.target.checked)}
                    />
                    <strong style={{ color: '#ff5722', fontSize: '14px' }}>🇳🇵 Nepal</strong> ({totalNepalSites} sites)
                  </label>
                  <span className="collapse-icon-small">{nepalExpanded ? '▼' : '▶'}</span>
                </div>
                
                {/* Nested Nepal sub-regions */}
                {nepalExpanded && (
                  <div className="nested-regions">
                    {regions['Nepal-Parks'] && (
                      <label key="Nepal-Parks" className="filter-item nested-item">
                        <input
                          type="checkbox"
                          checked={visibleRegions['Nepal-Parks'] !== false}
                          onChange={(e) => handleRegionToggle('Nepal-Parks', e.target.checked)}
                        />
                        <span>🏞️ Parks</span> ({regions['Nepal-Parks'].length} parks)
                      </label>
                    )}
                    {regions['Nepal-Temples'] && (
                      <label key="Nepal-Temples" className="filter-item nested-item">
                        <input
                          type="checkbox"
                          checked={visibleRegions['Nepal-Temples'] !== false}
                          onChange={(e) => handleRegionToggle('Nepal-Temples', e.target.checked)}
                        />
                        <span>🕉️ Temples</span> ({regions['Nepal-Temples'].length} temples)
                      </label>
                    )}
                    {regions['Nepal-UNESCO'] && (
                      <label key="Nepal-UNESCO" className="filter-item nested-item">
                        <input
                          type="checkbox"
                          checked={visibleRegions['Nepal-UNESCO'] !== false}
                          onChange={(e) => handleRegionToggle('Nepal-UNESCO', e.target.checked)}
                        />
                        <span>🏛️ UNESCO Sites</span> ({regions['Nepal-UNESCO'].length} sites)
                      </label>
                    )}
                    {regions['Nepal-TrekkingFlights'] && (
                      <label key="Nepal-TrekkingFlights" className="filter-item nested-item">
                        <input
                          type="checkbox"
                          checked={visibleRegions['Nepal-TrekkingFlights'] !== false}
                          onChange={(e) => handleRegionToggle('Nepal-TrekkingFlights', e.target.checked)}
                        />
                        <span>⛰️ Trekking</span> ({regions['Nepal-TrekkingFlights'].length} routes)
                      </label>
                    )}
                  </div>
                )}
              </div>
            )}
            
            {/* Sri Lanka as top-level filter with sub-filters */}
            {(regions['Sri Lanka-Parks'] || regions['Sri Lanka-Temples'] || regions['Sri Lanka-UNESCO']) && (
              <div className="sri-lanka-filter-group">
                <div className="sri-lanka-header" onClick={() => setSriLankaExpanded(!sriLankaExpanded)}>
                  <label className="filter-item sri-lanka-parent" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={allSriLankaVisible}
                      onChange={(e) => handleSriLankaToggle(e.target.checked)}
                    />
                    <strong style={{ color: '#4caf50', fontSize: '14px' }}>🇱🇰 Sri Lanka</strong> ({totalSriLankaSites} sites)
                  </label>
                  <span className="collapse-icon-small">{sriLankaExpanded ? '▼' : '▶'}</span>
                </div>
                
                {/* Nested Sri Lanka sub-regions */}
                {sriLankaExpanded && (
                  <div className="nested-regions">
                    {regions['Sri Lanka-Parks'] && (
                      <label key="Sri Lanka-Parks" className="filter-item nested-item">
                        <input
                          type="checkbox"
                          checked={visibleRegions['Sri Lanka-Parks'] !== false}
                          onChange={(e) => handleRegionToggle('Sri Lanka-Parks', e.target.checked)}
                        />
                        <span>🏞️ Parks</span> ({regions['Sri Lanka-Parks'].length} parks)
                      </label>
                    )}
                    {regions['Sri Lanka-Temples'] && (
                      <label key="Sri Lanka-Temples" className="filter-item nested-item">
                        <input
                          type="checkbox"
                          checked={visibleRegions['Sri Lanka-Temples'] !== false}
                          onChange={(e) => handleRegionToggle('Sri Lanka-Temples', e.target.checked)}
                        />
                        <span>🕉️ Temples</span> ({regions['Sri Lanka-Temples'].length} temples)
                      </label>
                    )}
                    {regions['Sri Lanka-UNESCO'] && (
                      <label key="Sri Lanka-UNESCO" className="filter-item nested-item">
                        <input
                          type="checkbox"
                          checked={visibleRegions['Sri Lanka-UNESCO'] !== false}
                          onChange={(e) => handleRegionToggle('Sri Lanka-UNESCO', e.target.checked)}
                        />
                        <span>🏛️ UNESCO Sites</span> ({regions['Sri Lanka-UNESCO'].length} sites)
                      </label>
                    )}
                  </div>
                )}
              </div>
            )}
            
            {regions['Costa Rica'] && (
              <label key="Costa Rica" className="filter-item costa-rica-item">
                <input
                  type="checkbox"
                  checked={visibleRegions['Costa Rica'] !== false}
                  onChange={(e) => handleRegionToggle('Costa Rica', e.target.checked)}
                />
                <strong style={{ color: '#9c27b0' }}>🇨🇷 Costa Rica</strong> ({regions['Costa Rica'].length} parks)
              </label>
            )}
            
            {/* Asia UNESCO Sites */}
            {regions['Asia-UNESCO'] && (
              <label key="Asia-UNESCO" className="filter-item asia-unesco-item">
                <input
                  type="checkbox"
                  checked={visibleRegions['Asia-UNESCO'] !== false}
                  onChange={(e) => handleRegionToggle('Asia-UNESCO', e.target.checked)}
                />
                <strong style={{ color: '#2196f3', fontSize: '14px' }}>🏛️ Asia UNESCO Sites</strong> ({regions['Asia-UNESCO'].length} sites)
              </label>
            )}
          </div>
          
          <div className="airport-toggle-section">
            <label className="filter-item airport-toggle">
              <input
                type="checkbox"
                checked={showAirports}
                onChange={(e) => setShowAirports(e.target.checked)}
              />
              <strong>✈️ Show Airports</strong>
            </label>
            <p className="filter-hint-small">
              Toggle to show/hide airport markers near visible parks (within 200 miles)
            </p>
          </div>

          <p className="filter-note">
            ✅ All regions are visible by default
          </p>
        </>
      )}
    </div>
  )
}

export default FilterPanel

