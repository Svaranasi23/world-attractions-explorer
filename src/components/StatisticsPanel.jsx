import React, { useMemo, useState } from 'react'
import './StatisticsPanel.css'

function StatisticsPanel({ parks, regions, activeTab, setActiveTab }) {
  const [expandedCountries, setExpandedCountries] = useState({})

  const toggleCountry = (country) => {
    setExpandedCountries(prev => ({
      ...prev,
      [country]: !prev[country]
    }))
  }

  const stats = useMemo(() => {
    const stateCounts = {}
    const provinceCounts = {}
    const indiaStateCounts = {}
    const nepalStateCounts = {}
    const sriLankaStateCounts = {}
    const costaRicaStateCounts = {}
    const countryCounts = { 'United States': 0, 'Canada': 0, 'India': 0, 'Nepal': 0, 'Sri Lanka': 0, 'Costa Rica': 0 }

    parks.forEach(park => {
      const country = park.Country || 'United States'
      countryCounts[country] = (countryCounts[country] || 0) + 1

      const states = (park.States || '').split(',').map(s => s.trim()).filter(s => s)

      if (country === 'Canada') {
        states.forEach(prov => {
          if (prov) provinceCounts[prov] = (provinceCounts[prov] || 0) + 1
        })
      } else if (country === 'United States') {
        states.forEach(state => {
          if (state) stateCounts[state] = (stateCounts[state] || 0) + 1
        })
      } else if (country === 'India') {
        states.forEach(state => {
          if (state) indiaStateCounts[state] = (indiaStateCounts[state] || 0) + 1
        })
      } else if (country === 'Nepal') {
        states.forEach(state => {
          if (state) nepalStateCounts[state] = (nepalStateCounts[state] || 0) + 1
        })
      } else if (country === 'Sri Lanka') {
        states.forEach(state => {
          if (state) sriLankaStateCounts[state] = (sriLankaStateCounts[state] || 0) + 1
        })
      } else if (country === 'Costa Rica') {
        states.forEach(state => {
          if (state) costaRicaStateCounts[state] = (costaRicaStateCounts[state] || 0) + 1
        })
      }
    })

    const topStates = Object.entries(stateCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)

    const topProvinces = Object.entries(provinceCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)

    const topIndiaStates = Object.entries(indiaStateCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)

    const topNepalStates = Object.entries(nepalStateCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)

    const topSriLankaStates = Object.entries(sriLankaStateCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)

    const topCostaRicaStates = Object.entries(costaRicaStateCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)

    return { topStates, topProvinces, topIndiaStates, topNepalStates, topSriLankaStates, topCostaRicaStates, countryCounts }
  }, [parks])

  const totalIndiaAttractions = (regions['India-Parks']?.length || 0) + 
                                 (regions['India-UNESCO']?.length || 0) + 
                                 (regions['India-Jyotirlinga']?.length || 0) + 
                                 (regions['India-ShaktiPeetha']?.length || 0) + 
                                 (regions['India-OtherTemples']?.length || 0) + 
                                 (regions['India-Mutts']?.length || 0) + 
                                 (regions['India-DivyaDesam']?.length || 0) + 
                                 (regions['India-Forts']?.length || 0)

  return (
    <div className="statistics-panel">
      <h3>📊 Statistics</h3>
      <p><strong>Total Attractions:</strong> {parks.length}</p>

      <div className="country-summary">
        <div className="country-item">
          <div 
            className="country-header"
            onClick={() => toggleCountry('United States')}
          >
            <span className="country-name">🇺🇸 United States</span>
            <span className="country-count">{stats.countryCounts['United States'] || 0}</span>
            <span className="collapse-icon">{expandedCountries['United States'] ? '▼' : '▶'}</span>
          </div>
          {expandedCountries['United States'] && (
            <div className="country-details">
              <p>Total Parks: {(regions.West?.length || 0) + (regions.South?.length || 0) + (regions.Midwest?.length || 0) + (regions.Northeast?.length || 0) + (regions.Alaska?.length || 0) + (regions.Hawaii?.length || 0)}</p>
              <ul>
                <li>West: {regions.West?.length || 0}</li>
                <li>South: {regions.South?.length || 0}</li>
                <li>Midwest: {regions.Midwest?.length || 0}</li>
                <li>Northeast: {regions.Northeast?.length || 0}</li>
                <li>Alaska: {regions.Alaska?.length || 0}</li>
                <li>Hawaii: {regions.Hawaii?.length || 0}</li>
              </ul>
              {stats.topStates.length > 0 && (
                <div>
                  <p><strong>Top 10 States:</strong></p>
                  <ol>
                    {stats.topStates.map(([state, count]) => (
                      <li key={state}>
                        {state}: {count} attraction{count > 1 ? 's' : ''}
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="country-item">
          <div 
            className="country-header"
            onClick={() => toggleCountry('Canada')}
          >
            <span className="country-name">🇨🇦 Canada</span>
            <span className="country-count">{stats.countryCounts['Canada'] || 0}</span>
            <span className="collapse-icon">{expandedCountries['Canada'] ? '▼' : '▶'}</span>
          </div>
          {expandedCountries['Canada'] && (
            <div className="country-details">
              <p>Total Parks: {regions.Canada?.length || 0}</p>
              {stats.topProvinces.length > 0 && (
                <div>
                  <p><strong>Top 10 Provinces:</strong></p>
                  <ol>
                    {stats.topProvinces.map(([province, count]) => (
                      <li key={province}>
                        {province}: {count} attraction{count > 1 ? 's' : ''}
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="country-item">
          <div 
            className="country-header"
            onClick={() => toggleCountry('India')}
          >
            <span className="country-name">🇮🇳 India</span>
            <span className="country-count">{stats.countryCounts['India'] || 0}</span>
            <span className="collapse-icon">{expandedCountries['India'] ? '▼' : '▶'}</span>
          </div>
          {expandedCountries['India'] && (
            <div className="country-details">
              <p>Total Attractions: {totalIndiaAttractions}</p>
              <ul>
                <li>🏞️ Parks: {regions['India-Parks']?.length || 0}</li>
                <li>🏛️ UNESCO Sites: {regions['India-UNESCO']?.length || 0}</li>
                <li>🔱 Jyotirlinga Temples: {regions['India-Jyotirlinga']?.length || 0}</li>
                <li>🌸 Shakti Peethas: {regions['India-ShaktiPeetha']?.length || 0}</li>
                <li>🕉️ Major Temples: {regions['India-OtherTemples']?.length || 0}</li>
                <li>🏛️ Maths: {regions['India-Mutts']?.length || 0}</li>
                <li>🐚 Divya Desams: {regions['India-DivyaDesam']?.length || 0}</li>
                <li>🏰 Historic Forts: {regions['India-Forts']?.length || 0}</li>
              </ul>
              {stats.topIndiaStates.length > 0 && (
                <div>
                  <p><strong>Top 10 States:</strong></p>
                  <ol>
                    {stats.topIndiaStates.map(([state, count]) => (
                      <li key={state}>
                        {state}: {count} attraction{count > 1 ? 's' : ''}
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="country-item">
          <div 
            className="country-header"
            onClick={() => toggleCountry('Nepal')}
          >
            <span className="country-name">🇳🇵 Nepal</span>
            <span className="country-count">{stats.countryCounts['Nepal'] || 0}</span>
            <span className="collapse-icon">{expandedCountries['Nepal'] ? '▼' : '▶'}</span>
          </div>
          {expandedCountries['Nepal'] && (
            <div className="country-details">
              <p>Total Attractions: {(regions['Nepal-Parks']?.length || 0) + (regions['Nepal-Temples']?.length || 0) + (regions['Nepal-UNESCO']?.length || 0) + (regions['Nepal-TrekkingFlights']?.length || 0)}</p>
              <ul>
                <li>🏞️ Parks: {regions['Nepal-Parks']?.length || 0}</li>
                <li>🛕 Temples: {regions['Nepal-Temples']?.length || 0}</li>
                <li>🏛️ UNESCO Sites: {regions['Nepal-UNESCO']?.length || 0}</li>
                <li>⛰️ Trekking & Flights: {regions['Nepal-TrekkingFlights']?.length || 0}</li>
              </ul>
              {stats.topNepalStates.length > 0 && (
                <div>
                  <p><strong>Top 10 Provinces/Districts:</strong></p>
                  <ol>
                    {stats.topNepalStates.map(([state, count]) => (
                      <li key={state}>
                        {state}: {count} attraction{count > 1 ? 's' : ''}
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="country-item">
          <div 
            className="country-header"
            onClick={() => toggleCountry('Sri Lanka')}
          >
            <span className="country-name">🇱🇰 Sri Lanka</span>
            <span className="country-count">{stats.countryCounts['Sri Lanka'] || 0}</span>
            <span className="collapse-icon">{expandedCountries['Sri Lanka'] ? '▼' : '▶'}</span>
          </div>
          {expandedCountries['Sri Lanka'] && (
            <div className="country-details">
              <p>Total Attractions: {(regions['Sri Lanka-Parks']?.length || 0) + (regions['Sri Lanka-Temples']?.length || 0)}</p>
              <ul>
                <li>🏞️ Parks: {regions['Sri Lanka-Parks']?.length || 0}</li>
                <li>🛕 Temples: {regions['Sri Lanka-Temples']?.length || 0}</li>
              </ul>
              {stats.topSriLankaStates.length > 0 && (
                <div>
                  <p><strong>Top 10 Provinces:</strong></p>
                  <ol>
                    {stats.topSriLankaStates.map(([state, count]) => (
                      <li key={state}>
                        {state}: {count} attraction{count > 1 ? 's' : ''}
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="country-item">
          <div 
            className="country-header"
            onClick={() => toggleCountry('Costa Rica')}
          >
            <span className="country-name">🇨🇷 Costa Rica</span>
            <span className="country-count">{stats.countryCounts['Costa Rica'] || 0}</span>
            <span className="collapse-icon">{expandedCountries['Costa Rica'] ? '▼' : '▶'}</span>
          </div>
          {expandedCountries['Costa Rica'] && (
            <div className="country-details">
              <p>Total Parks: {regions['Costa Rica']?.length || 0}</p>
              {stats.topCostaRicaStates.length > 0 && (
                <div>
                  <p><strong>Top 10 Provinces:</strong></p>
                  <ol>
                    {stats.topCostaRicaStates.map(([state, count]) => (
                      <li key={state}>
                        {state}: {count} attraction{count > 1 ? 's' : ''}
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="tip-box">
        <p>
          <strong>💡 Tip:</strong> Use the <strong>Filters</strong> tab to toggle regions and explore the map!
        </p>
      </div>
    </div>
  )
}

export default StatisticsPanel
