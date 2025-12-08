import React, { useState, useEffect, useMemo, useRef, createRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, FeatureGroup, LayerGroup, useMap, GeoJSON, ZoomControl, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet.heat'
import { loadParksData, loadAirportsData, findNearbyAirports, findNearbyParks, categorizeParksByRegion, calculateDistance } from '../services/dataService'
import TabPanel from '../components/TabPanel'
import MapController from '../components/MapController'
import AttractionTypeFilter from '../components/AttractionTypeFilter'
import AttractionSearch from '../components/AttractionSearch'
import './MapView.css'

// Fix for default marker icons in React Leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

// Component to show country boundaries only when zoomed in
function CountryBoundariesLayer({ data }) {
  const map = useMap()
  const [zoom, setZoom] = useState(map.getZoom())

  useEffect(() => {
    const updateZoom = () => {
      setZoom(map.getZoom())
    }
    
    map.on('zoomend', updateZoom)
    updateZoom() // Initial zoom level
    
    return () => {
      map.off('zoomend', updateZoom)
    }
  }, [map])

  // Only show boundaries when zoomed in (zoom level > 5)
  if (!data || zoom <= 5) {
    return null
  }

  return (
    <GeoJSON
      data={data}
      style={{
        color: '#1a1a1a',
        weight: 2.5,
        opacity: 0.9,
        fillColor: 'transparent',
        fillOpacity: 0
      }}
    />
  )
}

// Component to show coastlines
function CoastlinesLayer({ data }) {
  const map = useMap()
  const [zoom, setZoom] = useState(map.getZoom())

  useEffect(() => {
    const updateZoom = () => {
      setZoom(map.getZoom())
    }
    
    map.on('zoomend', updateZoom)
    updateZoom()
    
    return () => {
      map.off('zoomend', updateZoom)
    }
  }, [map])

  if (!data || zoom <= 4) {
    return null
  }

  return (
    <GeoJSON
      data={data}
      style={{
        color: '#4a90e2',
        weight: 1.5,
        opacity: 0.6,
        fillColor: 'transparent',
        fillOpacity: 0
      }}
    />
  )
}

// Component to show rivers
function RiversLayer({ data }) {
  const map = useMap()
  const [zoom, setZoom] = useState(map.getZoom())

  useEffect(() => {
    const updateZoom = () => {
      setZoom(map.getZoom())
    }
    
    map.on('zoomend', updateZoom)
    updateZoom()
    
    return () => {
      map.off('zoomend', updateZoom)
    }
  }, [map])

  if (!data || zoom <= 6) {
    return null
  }

  return (
    <GeoJSON
      data={data}
      style={{
        color: '#5dade2',
        weight: 1,
        opacity: 0.5,
        fillColor: 'transparent',
        fillOpacity: 0
      }}
    />
  )
}

// Component to show lakes
function LakesLayer({ data }) {
  const map = useMap()
  const [zoom, setZoom] = useState(map.getZoom())

  useEffect(() => {
    const updateZoom = () => {
      setZoom(map.getZoom())
    }
    
    map.on('zoomend', updateZoom)
    updateZoom()
    
    return () => {
      map.off('zoomend', updateZoom)
    }
  }, [map])

  if (!data || zoom <= 6) {
    return null
  }

  return (
    <GeoJSON
      data={data}
      style={{
        color: '#5dade2',
        weight: 1,
        opacity: 0.4,
        fillColor: '#aed6f1',
        fillOpacity: 0.3
      }}
    />
  )
}

function MapView() {
  const [parks, setParks] = useState([])
  const [airports, setAirports] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedRegion, setSelectedRegion] = useState(null)
  const [countryBoundaries, setCountryBoundaries] = useState(null)
  const [coastlines, setCoastlines] = useState(null)
  const [rivers, setRivers] = useState(null)
  const [lakes, setLakes] = useState(null)
  const [visibleRegions, setVisibleRegions] = useState({
    West: true,
    South: true,
    Midwest: true,
    Northeast: true,
    Alaska: true,
    Hawaii: true,
    Canada: true,
    'India-Parks': true,
    'India-UNESCO': true,
    'India-Jyotirlinga': true,
    'India-ShaktiPeetha': true,
    'India-OtherTemples': true,
    'India-Mutts': true,
    'India-DivyaDesam': true,
    'India-Forts': true,
    'Nepal-Parks': true,
    'Nepal-Temples': true,
    'Nepal-UNESCO': true,
    'Nepal-TrekkingFlights': true,
    'Sri Lanka-Parks': true,
    'Sri Lanka-Temples': true,
    'Sri Lanka-UNESCO': true,
    'Costa Rica': true,
    'SouthEastAsia-UNESCO': true,
    'EastAsia-UNESCO': true,
    'SouthAsia-UNESCO': true,
    'CentralAsia-UNESCO': true,
    'WestAsia-UNESCO': true,
    'CentralAmerica-UNESCO': true
  })
  const [showHeatMap, setShowHeatMap] = useState(false)
  const [showAirports, setShowAirports] = useState(false)
  const [activeTab, setActiveTab] = useState('stats')
  const [mapFocus, setMapFocus] = useState(null)
  const mapRef = useRef(null)
  const [filterPanelOpen, setFilterPanelOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedParkForPopup, setSelectedParkForPopup] = useState(null)
  const [selectedParkId, setSelectedParkId] = useState(null)
  const markerRefs = useRef({})
  const [visibleAttractionTypes, setVisibleAttractionTypes] = useState({
    NationalParks: true,
    UNESCO: true,
    Temples: true,
    Jyotirlinga: true,
    ShaktiPeetha: true,
    Mutts: true,
    DivyaDesam: true,
    Forts: true,
    TrekkingFlights: true,
    MostPhotographed: true
  })

  useEffect(() => {
    const loadData = async () => {
      try {
        const [parksData, airportsData] = await Promise.all([
          loadParksData(),
          loadAirportsData()
        ])
        setParks(parksData)
        setAirports(airportsData)
        setLoading(false)
      } catch (error) {
        console.error('Error loading data:', error)
        setLoading(false)
      }
    }
    loadData()
  }, [])

  useEffect(() => {
    // Load geographic layers
    const loadGeoLayers = async () => {
      // Load country boundaries
      let boundariesData = null
      try {
        const response = await fetch('https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson')
        if (response.ok) {
          boundariesData = await response.json()
          setCountryBoundaries(boundariesData)
        }
      } catch (error) {
        console.error('Error loading country boundaries:', error)
        try {
          const response = await fetch('https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json')
          if (response.ok) {
            boundariesData = await response.json()
            setCountryBoundaries(boundariesData)
          }
        } catch (fallbackError) {
          console.error('Error loading country boundaries from fallback:', fallbackError)
        }
      }

      // Load coastlines - using same data as country boundaries (coastlines are part of boundaries)
      // In a production app, you'd load a dedicated coastlines GeoJSON
      if (boundariesData) {
        setCoastlines(boundariesData)
      }

      // Note: Rivers and lakes would require dedicated GeoJSON datasets
      // For now, these are placeholders that can be loaded when data sources are available
      // Example sources: Natural Earth, OpenStreetMap extracts, etc.
    }
    loadGeoLayers()
  }, [])

  const regions = useMemo(() => {
    return categorizeParksByRegion(parks)
  }, [parks])

  // Determine which attraction types are available in the currently visible regions
  const availableAttractionTypes = useMemo(() => {
    const availableTypes = new Set()
    
    // Get all parks in visible regions
    const visibleParks = parks.filter(park => {
      const country = park.Country || 'United States'
      const states = (park.States || '').split(',').map(s => s.trim())
      
      let region = null
      
      // Check for Shakti Peethas first
      if (park.IndiaCategory === 'ShaktiPeetha') {
        region = 'India-ShaktiPeetha'
      } else if (country === 'Canada') {
        region = 'Canada'
      } else if (country === 'India') {
        if (park.IndiaCategory === 'UNESCO') {
          region = 'India-UNESCO'
        } else if (park.IndiaCategory === 'Jyotirlinga') {
          region = 'India-Jyotirlinga'
        } else if (park.IndiaCategory === 'ShaktiPeetha') {
          region = 'India-ShaktiPeetha'
        } else if (park.IndiaCategory === 'OtherTemples') {
          region = 'India-OtherTemples'
        } else if (park.IndiaCategory === 'Mutts') {
          region = 'India-Mutts'
        } else if (park.IndiaCategory === 'DivyaDesam') {
          region = 'India-DivyaDesam'
        } else if (park.IndiaCategory === 'Forts') {
          region = 'India-Forts'
        } else {
          region = 'India-Parks'
        }
      } else if (country === 'Nepal') {
        if (park.NepalCategory === 'UNESCO') {
          region = 'Nepal-UNESCO'
        } else if (park.NepalCategory === 'Temples') {
          region = 'Nepal-Temples'
        } else if (park.NepalCategory === 'TrekkingFlights') {
          region = 'Nepal-TrekkingFlights'
        } else {
          region = 'Nepal-Parks'
        }
      } else if (country === 'Sri Lanka') {
        if (park.SriLankaCategory === 'UNESCO') {
          region = 'Sri Lanka-UNESCO'
        } else if (park.SriLankaCategory === 'Temples') {
          region = 'Sri Lanka-Temples'
        } else {
          region = 'Sri Lanka-Parks'
        }
      } else if (country === 'Costa Rica') {
        region = 'Costa Rica'
      } else if (['Thailand', 'Indonesia', 'Vietnam', 'Cambodia', 'Myanmar', 'Philippines', 'Malaysia', 'Singapore', 'Laos', 'Brunei', 'East Timor'].includes(country)) {
        region = 'SouthEastAsia-UNESCO'
      } else if (['China', 'Japan', 'South Korea', 'North Korea', 'Mongolia'].includes(country)) {
        region = 'EastAsia-UNESCO'
      } else if (['Bangladesh', 'Pakistan', 'Afghanistan', 'Bhutan', 'Maldives'].includes(country)) {
        region = 'SouthAsia-UNESCO'
      } else if (['Kazakhstan', 'Kyrgyzstan', 'Tajikistan', 'Turkmenistan', 'Uzbekistan'].includes(country)) {
        region = 'CentralAsia-UNESCO'
      } else if (['Iran', 'Iraq', 'Jordan', 'Lebanon', 'Saudi Arabia', 'Syria', 'Turkey', 'UAE', 'United Arab Emirates', 'Yemen', 'Oman', 'Qatar', 'Kuwait', 'Bahrain', 'Israel', 'Palestine'].includes(country)) {
        region = 'WestAsia-UNESCO'
      } else if (['Belize', 'Guatemala', 'Honduras', 'El Salvador', 'Nicaragua', 'Panama', 'Mexico'].includes(country)) {
        region = 'CentralAmerica-UNESCO'
      } else if (country === 'United States') {
        // US regions
        const stateCodes = states.map(s => {
          const parts = s.split(' ')
          return parts[parts.length - 1]
        })
        if (stateCodes.some(code => ['CA', 'OR', 'WA', 'NV', 'ID', 'MT', 'WY', 'UT', 'CO', 'AZ', 'NM'].includes(code))) {
          region = 'West'
        } else if (stateCodes.some(code => ['ND', 'SD', 'NE', 'KS', 'MN', 'IA', 'MO', 'WI', 'IL', 'MI', 'IN', 'OH'].includes(code))) {
          region = 'Midwest'
        } else if (stateCodes.some(code => ['TX', 'OK', 'AR', 'LA', 'MS', 'AL', 'TN', 'KY', 'WV', 'VA', 'NC', 'SC', 'GA', 'FL'].includes(code))) {
          region = 'South'
        } else if (stateCodes.some(code => ['ME', 'NH', 'VT', 'MA', 'RI', 'CT', 'NY', 'NJ', 'PA', 'MD', 'DE'].includes(code))) {
          region = 'Northeast'
        } else if (stateCodes.includes('AK')) {
          region = 'Alaska'
        } else if (stateCodes.includes('HI')) {
          region = 'Hawaii'
        }
      }
      
      return region && visibleRegions[region] === true
    })
    
    // Determine attraction types from visible parks
    visibleParks.forEach(park => {
      const country = park.Country || 'United States'
      const description = park.Description ? String(park.Description).toLowerCase() : ''
      const name = park.Name ? String(park.Name).toLowerCase() : ''
      
      const isMostPhotographed = description.includes('most photographed') || 
                                 description.includes('popular photography') ||
                                 name.includes('most photographed')
      
      // Check if it's most photographed
      if (isMostPhotographed) {
        availableTypes.add('MostPhotographed')
      }
      
      if (park.IndiaCategory === 'Jyotirlinga') {
        availableTypes.add('Jyotirlinga')
      } else if (park.IndiaCategory === 'ShaktiPeetha') {
        availableTypes.add('ShaktiPeetha')
      } else if (park.IndiaCategory === 'Mutts') {
        availableTypes.add('Mutts')
      } else if (park.IndiaCategory === 'DivyaDesam') {
        availableTypes.add('DivyaDesam')
      } else if (park.IndiaCategory === 'Forts') {
        availableTypes.add('Forts')
      } else if (park.IndiaCategory === 'UNESCO' || park.NepalCategory === 'UNESCO' || park.SriLankaCategory === 'UNESCO' || 
                 (park.Designation && park.Designation.toUpperCase().includes('UNESCO')) ||
                 ['Thailand', 'Indonesia', 'Vietnam', 'Cambodia', 'Myanmar', 'Philippines', 'Malaysia', 'Singapore', 'Laos', 'Brunei', 'East Timor',
                  'China', 'Japan', 'South Korea', 'North Korea', 'Mongolia',
                  'Bangladesh', 'Pakistan', 'Afghanistan', 'Bhutan', 'Maldives',
                  'Kazakhstan', 'Kyrgyzstan', 'Tajikistan', 'Turkmenistan', 'Uzbekistan',
                  'Iran', 'Iraq', 'Jordan', 'Lebanon', 'Saudi Arabia', 'Syria', 'Turkey', 'UAE', 'United Arab Emirates', 'Yemen', 'Oman', 'Qatar', 'Kuwait', 'Bahrain', 'Israel', 'Palestine',
                  'Belize', 'Guatemala', 'Honduras', 'El Salvador', 'Nicaragua', 'Panama', 'Mexico'].includes(country)) {
        availableTypes.add('UNESCO')
      } else if (park.IndiaCategory === 'OtherTemples' || park.NepalCategory === 'Temples' || park.SriLankaCategory === 'Temples') {
        availableTypes.add('Temples')
      } else if (park.NepalCategory === 'TrekkingFlights') {
        availableTypes.add('TrekkingFlights')
      } else {
        availableTypes.add('NationalParks')
      }
    })
    
    // If all regions are visible (World Attractions view), show all types
    const allRegionsVisible = Object.values(visibleRegions).every(value => value === true)
    if (allRegionsVisible) {
      return {
        NationalParks: true,
        UNESCO: true,
        Temples: true,
        Jyotirlinga: true,
        ShaktiPeetha: true,
        Mutts: true,
        DivyaDesam: true,
        Forts: true,
        TrekkingFlights: true,
        MostPhotographed: true
      }
    }
    
    return {
      NationalParks: availableTypes.has('NationalParks'),
      UNESCO: availableTypes.has('UNESCO'),
      Temples: availableTypes.has('Temples'),
      Jyotirlinga: availableTypes.has('Jyotirlinga'),
      ShaktiPeetha: availableTypes.has('ShaktiPeetha'),
      Mutts: availableTypes.has('Mutts'),
      DivyaDesam: availableTypes.has('DivyaDesam'),
      Forts: availableTypes.has('Forts'),
      TrekkingFlights: availableTypes.has('TrekkingFlights'),
      MostPhotographed: availableTypes.has('MostPhotographed')
    }
  }, [parks, visibleRegions])

  const heatMapData = useMemo(() => {
    return parks
      .map(park => {
        const lat = parseFloat(park.Latitude)
        const lon = parseFloat(park.Longitude)
        if (!isNaN(lat) && !isNaN(lon) && lat !== 0 && lon !== 0) {
          return [lat, lon, 1]
        }
        return null
      })
      .filter(Boolean)
  }, [parks])

  const filteredParks = useMemo(() => {
    
    // If all regions are explicitly set to false or undefined, return empty array
    const allRegionsHidden = Object.values(visibleRegions).every(value => value === false || value === undefined)
    if (allRegionsHidden) {
      return []
    }
    
    return parks.filter(park => {
      // Filter out parks with missing or empty essential data
      const parkName = (park.Name || '').trim()
      if (!parkName || parkName === '') {
        return false
      }
      
      if (!park.Latitude || !park.Longitude) {
        return false
      }
      
      const lat = parseFloat(park.Latitude)
      const lon = parseFloat(park.Longitude)
      // Only filter out if both coordinates are 0 or invalid (not if just one is 0)
      if (isNaN(lat) || isNaN(lon) || (lat === 0 && lon === 0)) {
        return false
      }
      
      const country = park.Country || 'United States'
      const states = (park.States || '').split(',').map(s => s.trim())
      
      let region = null
      
      // Check for Shakti Peethas first (they can be in India or Sri Lanka)
      // All 18 Ashtadasha Maha Shakti Peethas should be under India-ShaktiPeetha
      if (park.IndiaCategory === 'ShaktiPeetha') {
        region = 'India-ShaktiPeetha'
      } else if (country === 'Canada') {
        region = 'Canada'
      } else if (country === 'India') {
        // Use IndiaCategory to determine sub-region
        if (park.IndiaCategory === 'UNESCO') {
          region = 'India-UNESCO'
        } else if (park.IndiaCategory === 'Jyotirlinga') {
          region = 'India-Jyotirlinga'
        } else if (park.IndiaCategory === 'ShaktiPeetha') {
          region = 'India-ShaktiPeetha'
        } else if (park.IndiaCategory === 'OtherTemples') {
          region = 'India-OtherTemples'
        } else if (park.IndiaCategory === 'Mutts') {
          region = 'India-Mutts'
        } else if (park.IndiaCategory === 'DivyaDesam') {
          region = 'India-DivyaDesam'
        } else if (park.IndiaCategory === 'Forts') {
          region = 'India-Forts'
        } else {
          region = 'India-Parks'
        }
      } else if (country === 'Nepal') {
        // Use NepalCategory to determine sub-region - ensure all Nepal parks get a region
        // If NepalCategory is missing or invalid, default to Nepal-Parks
        if (park.NepalCategory === 'UNESCO') {
          region = 'Nepal-UNESCO'
        } else if (park.NepalCategory === 'Temples') {
          region = 'Nepal-Temples'
        } else if (park.NepalCategory === 'TrekkingFlights') {
          region = 'Nepal-TrekkingFlights'
        } else {
          // Default to Nepal-Parks for all other Nepal entries
          region = 'Nepal-Parks'
        }
      } else if (country === 'Sri Lanka') {
        // Use SriLankaCategory to determine sub-region
        if (park.SriLankaCategory === 'UNESCO') {
          region = 'Sri Lanka-UNESCO'
        } else if (park.SriLankaCategory === 'Temples') {
          region = 'Sri Lanka-Temples'
        } else {
          region = 'Sri Lanka-Parks'
        }
      } else if (country === 'Costa Rica') {
        region = 'Costa Rica'
      } else if (['Thailand', 'Indonesia', 'Vietnam', 'Cambodia', 'Myanmar', 'Philippines', 'Malaysia', 'Singapore', 'Laos', 'Brunei', 'East Timor'].includes(country)) {
        // South East Asian countries
        region = 'SouthEastAsia-UNESCO'
      } else if (['China', 'Japan', 'South Korea', 'North Korea', 'Mongolia'].includes(country)) {
        // East Asian countries
        region = 'EastAsia-UNESCO'
      } else if (['Bangladesh', 'Pakistan', 'Afghanistan', 'Bhutan', 'Maldives'].includes(country)) {
        // South Asian countries (excluding India, Nepal, Sri Lanka)
        region = 'SouthAsia-UNESCO'
      } else if (['Kazakhstan', 'Kyrgyzstan', 'Tajikistan', 'Turkmenistan', 'Uzbekistan'].includes(country)) {
        // Central Asian countries
        region = 'CentralAsia-UNESCO'
      } else if (['Iran', 'Iraq', 'Jordan', 'Lebanon', 'Saudi Arabia', 'Syria', 'Turkey', 'UAE', 'United Arab Emirates', 'Yemen', 'Oman', 'Qatar', 'Kuwait', 'Bahrain', 'Israel', 'Palestine'].includes(country)) {
        // West Asian / Middle Eastern countries
        region = 'WestAsia-UNESCO'
      } else if (['Belize', 'Guatemala', 'Honduras', 'El Salvador', 'Nicaragua', 'Panama', 'Mexico'].includes(country)) {
        // Central American countries
        region = 'CentralAmerica-UNESCO'
      } else if (country === 'United States') {
        if (states.includes('AK')) {
          region = 'Alaska'
        } else if (states.includes('HI')) {
          region = 'Hawaii'
        } else {
          const westStates = ['CA', 'OR', 'WA', 'NV', 'ID', 'MT', 'WY', 'UT', 'CO', 'AZ', 'NM']
          const midwestStates = ['ND', 'SD', 'NE', 'KS', 'MN', 'IA', 'MO', 'WI', 'IL', 'MI', 'IN', 'OH']
          const southStates = ['TX', 'OK', 'AR', 'LA', 'MS', 'AL', 'TN', 'KY', 'WV', 'VA', 'NC', 'SC', 'GA', 'FL']
          const northeastStates = ['ME', 'NH', 'VT', 'MA', 'RI', 'CT', 'NY', 'NJ', 'PA', 'MD', 'DE']
          
          if (states.some(s => westStates.includes(s))) {
            region = 'West'
          } else if (states.some(s => midwestStates.includes(s))) {
            region = 'Midwest'
          } else if (states.some(s => southStates.includes(s))) {
            region = 'South'
          } else if (states.some(s => northeastStates.includes(s))) {
            region = 'Northeast'
          } else {
            // Default to West for US parks without matching states
            region = 'West'
          }
        }
      }
      
      // Only show park if region is explicitly set and exists in visibleRegions
      if (!region || !(region in visibleRegions)) {
        return false
      }
      
      // Explicitly check that the region is visible (only true means visible)
      // When all countries are deselected, all regions should be false, so this will return false
      const isVisible = visibleRegions[region] === true
      
      // Additional safety check: if park is in Nepal region but region is not visible, filter it out
      if (region === 'Nepal-Parks' || region === 'Nepal-Temples' || region === 'Nepal-UNESCO') {
        if (!isVisible) {
          return false
        }
        // Double-check Nepal parks: ensure the country matches
        if (country !== 'Nepal') {
          return false
        }
      }
      
      return isVisible
    })
    .filter(park => {
      // Final safety filter: explicitly remove any Nepal parks if their regions are not visible
      if (park.Country === 'Nepal') {
        const isNepalPark = !park.NepalCategory || (park.NepalCategory !== 'Temples' && park.NepalCategory !== 'UNESCO' && park.NepalCategory !== 'TrekkingFlights')
        const isNepalTemple = park.NepalCategory === 'Temples'
        const isNepalUnesco = park.NepalCategory === 'UNESCO'
        const isNepalTrekkingFlights = park.NepalCategory === 'TrekkingFlights'
        
        if (isNepalPark && visibleRegions['Nepal-Parks'] !== true) {
          return false
        }
        if (isNepalTemple && visibleRegions['Nepal-Temples'] !== true) {
          return false
        }
        if (isNepalUnesco && visibleRegions['Nepal-UNESCO'] !== true) {
          return false
        }
        if (isNepalTrekkingFlights && visibleRegions['Nepal-TrekkingFlights'] !== true) {
          return false
        }
      }
      // Final safety filter: explicitly remove any Sri Lanka parks if their regions are not visible
      if (park.Country === 'Sri Lanka') {
        const isSriLankaPark = !park.SriLankaCategory || (park.SriLankaCategory !== 'Temples' && park.SriLankaCategory !== 'UNESCO')
        const isSriLankaTemple = park.SriLankaCategory === 'Temples'
        const isSriLankaUnesco = park.SriLankaCategory === 'UNESCO'
        
        if (isSriLankaPark && visibleRegions['Sri Lanka-Parks'] !== true) {
          return false
        }
        if (isSriLankaTemple && visibleRegions['Sri Lanka-Temples'] !== true) {
          return false
        }
        if (isSriLankaUnesco && visibleRegions['Sri Lanka-UNESCO'] !== true) {
          return false
        }
      }
      return true
    })
    .filter(park => {
      // Check if it's most photographed
      const description = park.Description ? String(park.Description).toLowerCase() : ''
      const name = park.Name ? String(park.Name).toLowerCase() : ''
      const isMostPhotographed = description.includes('most photographed') || 
                                 description.includes('popular photography') ||
                                 name.includes('most photographed')
      
      // Check if it's a national park
      const designation = park.Designation ? String(park.Designation) : ''
      const isNationalPark = designation.toLowerCase().includes('national park')
      
      // Filter by attraction type
      let attractionType = null
      const country = park.Country || 'United States'
      
      // Determine attraction type
      if (park.IndiaCategory === 'Jyotirlinga') {
        attractionType = 'Jyotirlinga'
      } else if (park.IndiaCategory === 'ShaktiPeetha') {
        attractionType = 'ShaktiPeetha'
      } else if (park.IndiaCategory === 'Mutts') {
        attractionType = 'Mutts'
      } else if (park.IndiaCategory === 'DivyaDesam') {
        attractionType = 'DivyaDesam'
      } else if (park.IndiaCategory === 'Forts') {
        attractionType = 'Forts'
      } else if (park.IndiaCategory === 'UNESCO' || park.NepalCategory === 'UNESCO' || park.SriLankaCategory === 'UNESCO' || 
                 (park.Designation && park.Designation.toUpperCase().includes('UNESCO')) ||
                 ['Thailand', 'Indonesia', 'Vietnam', 'Cambodia', 'Myanmar', 'Philippines', 'Malaysia', 'Singapore', 'Laos', 'Brunei', 'East Timor',
                  'China', 'Japan', 'South Korea', 'North Korea', 'Mongolia',
                  'Bangladesh', 'Pakistan', 'Afghanistan', 'Bhutan', 'Maldives',
                  'Kazakhstan', 'Kyrgyzstan', 'Tajikistan', 'Turkmenistan', 'Uzbekistan',
                  'Iran', 'Iraq', 'Jordan', 'Lebanon', 'Saudi Arabia', 'Syria', 'Turkey', 'UAE', 'United Arab Emirates', 'Yemen', 'Oman', 'Qatar', 'Kuwait', 'Bahrain', 'Israel', 'Palestine',
                  'Belize', 'Guatemala', 'Honduras', 'El Salvador', 'Nicaragua', 'Panama', 'Mexico'].includes(country)) {
        attractionType = 'UNESCO'
      } else if (park.IndiaCategory === 'OtherTemples' || park.NepalCategory === 'Temples' || park.SriLankaCategory === 'Temples') {
        attractionType = 'Temples'
      } else if (park.NepalCategory === 'TrekkingFlights') {
        attractionType = 'TrekkingFlights'
      } else if (isNationalPark) {
        attractionType = 'NationalParks'
      } else {
        // For non-national parks (waterfalls, reserves, etc.), they don't have a specific type
        // They will be filtered by MostPhotographed filter if they are most photographed
        // Otherwise, they should still show (default behavior)
        attractionType = null
      }
      
      // Special handling for most photographed attractions:
      // - If it's a most photographed national park: show if EITHER MostPhotographed OR NationalParks filter is on
      // - If it's a most photographed non-national park: show only if MostPhotographed filter is on
      if (isMostPhotographed) {
        if (isNationalPark) {
          // Most photographed national park: show if MostPhotographed OR NationalParks is on
          if (!visibleAttractionTypes.MostPhotographed && !visibleAttractionTypes.NationalParks) {
            return false
          }
        } else {
          // Most photographed non-national park (waterfalls, reserves, etc.): show only if MostPhotographed is on
          if (!visibleAttractionTypes.MostPhotographed) {
            return false
          }
        }
      } else {
        // Not most photographed: check the regular attraction type filter
        // If attractionType is null (non-national parks that aren't most photographed), show them by default
        if (attractionType && !visibleAttractionTypes[attractionType]) {
          return false
        }
      }
      
      return true
    })
    .filter(park => {
      // Filter by search query
      if (!searchQuery || searchQuery.trim() === '') {
        return true
      }
      
      const query = searchQuery.toLowerCase().trim()
      const name = (park.Name || '').toLowerCase()
      const description = (park.Description || '').toLowerCase()
      const country = (park.Country || '').toLowerCase()
      const states = (park.States || '').toLowerCase()
      
      return name.includes(query) || 
             description.includes(query) || 
             country.includes(query) ||
             states.includes(query)
    })
  }, [parks, visibleRegions, visibleAttractionTypes, searchQuery])

  // Filter airports to show only those near visible parks
  const filteredAirports = useMemo(() => {
    if (!showAirports || filteredParks.length === 0 || airports.length === 0) {
      return []
    }

    const airportRadius = 200 // miles - same as used in park popups
    const relevantAirports = new Map() // Use Map to avoid duplicates
    const countriesWithParks = new Set() // Track countries with visible parks

    filteredParks.forEach(park => {
      try {
        const parkLat = parseFloat(park.Latitude)
        const parkLon = parseFloat(park.Longitude)
        const country = park.Country || 'United States'
        countriesWithParks.add(country)
        
        if (isNaN(parkLat) || isNaN(parkLon) || parkLat === 0 || parkLon === 0) {
          return
        }

        // Find airports near this park
        airports.forEach(airport => {
          try {
            const airportLat = parseFloat(airport.Latitude)
            const airportLon = parseFloat(airport.Longitude)
            
            if (isNaN(airportLat) || isNaN(airportLon)) return

            const distance = calculateDistance(parkLat, parkLon, airportLat, airportLon)
            
            if (distance <= airportRadius) {
              // Use IATA code as key to avoid duplicates
              const key = airport.IATA || `${airportLat}-${airportLon}`
              if (!relevantAirports.has(key)) {
                relevantAirports.set(key, {
                  ...airport,
                  distance: distance,
                  nearbyPark: park.Name
                })
              } else {
                // Update if this park is closer
                const existing = relevantAirports.get(key)
                if (distance < existing.distance) {
                  relevantAirports.set(key, {
                    ...airport,
                    distance: distance,
                    nearbyPark: park.Name
                  })
                }
              }
            }
          } catch (error) {
            // Skip invalid airport
          }
        })
      } catch (error) {
        // Skip invalid park
      }
    })

    // Fallback: If no airports found within radius, show airports in the same countries
    if (relevantAirports.size === 0) {
      airports.forEach(airport => {
        const airportCountry = airport.Country || ''
        if (countriesWithParks.has(airportCountry)) {
          const key = airport.IATA || `${airport.Latitude}-${airport.Longitude}`
          if (!relevantAirports.has(key)) {
            relevantAirports.set(key, {
              ...airport,
              distance: null,
              nearbyPark: null
            })
          }
        }
      })
    }

    return Array.from(relevantAirports.values())
  }, [showAirports, filteredParks, airports])

  const areAllUSRegionsVisible = () => {
    const usRegions = ['West', 'South', 'Midwest', 'Northeast', 'Alaska', 'Hawaii']
    return usRegions.every(region => visibleRegions[region] !== false)
  }

  // Calculate center and bounds for a region
  const getRegionBounds = (regionName) => {
    const regionParks = regions[regionName] || []
    if (regionParks.length === 0) return null

    const validParks = regionParks.filter(park => {
      const lat = parseFloat(park.Latitude)
      const lon = parseFloat(park.Longitude)
      return !isNaN(lat) && !isNaN(lon) && lat !== 0 && lon !== 0
    })

    if (validParks.length === 0) return null

    const lats = validParks.map(p => parseFloat(p.Latitude))
    const lons = validParks.map(p => parseFloat(p.Longitude))

    const minLat = Math.min(...lats)
    const maxLat = Math.max(...lats)
    const minLon = Math.min(...lons)
    const maxLon = Math.max(...lons)

    return [[minLat, minLon], [maxLat, maxLon]]
  }

  // Get center point for a region
  const getRegionCenter = (regionName) => {
    const bounds = getRegionBounds(regionName)
    if (!bounds) {
      // Fallback centers for countries and sub-regions
      const countryCenters = {
        'Canada': { center: [56.1304, -106.3468], zoom: 4 },
        'India': { center: [20.5937, 78.9629], zoom: 5 },
        'India-Parks': { center: [20.5937, 78.9629], zoom: 5 },
        'India-UNESCO': { center: [20.5937, 78.9629], zoom: 5 },
        'India-Jyotirlinga': { center: [20.5937, 78.9629], zoom: 5 },
        'India-ShaktiPeetha': { center: [20.5937, 78.9629], zoom: 5 },
        'India-OtherTemples': { center: [20.5937, 78.9629], zoom: 5 },
        'India-Mutts': { center: [20.5937, 78.9629], zoom: 5 },
        'India-DivyaDesam': { center: [20.5937, 78.9629], zoom: 5 },
        'India-Forts': { center: [20.5937, 78.9629], zoom: 5 },
        'Nepal': { center: [28.3949, 84.1240], zoom: 7 },
        'Nepal-Parks': { center: [28.3949, 84.1240], zoom: 7 },
        'Nepal-Temples': { center: [27.7172, 85.3240], zoom: 8 },
        'Nepal-UNESCO': { center: [27.7172, 85.3240], zoom: 7 },
        'Nepal-TrekkingFlights': { center: [28.3949, 84.1240], zoom: 7 },
        'Sri Lanka': { center: [7.8731, 80.7718], zoom: 7 },
        'Sri Lanka-Parks': { center: [7.8731, 80.7718], zoom: 7 },
        'Sri Lanka-Temples': { center: [7.2944, 80.6414], zoom: 8 },
        'Sri Lanka-UNESCO': { center: [7.8731, 80.7718], zoom: 7 },
        'Costa Rica': { center: [9.7489, -83.7534], zoom: 7 },
        'SouthEastAsia-UNESCO': { center: [5.0, 105.0], zoom: 5 },
        'EastAsia-UNESCO': { center: [35.0, 120.0], zoom: 4 },
        'SouthAsia-UNESCO': { center: [28.0, 75.0], zoom: 5 },
        'CentralAsia-UNESCO': { center: [45.0, 70.0], zoom: 4 },
        'WestAsia-UNESCO': { center: [30.0, 45.0], zoom: 4 },
        'CentralAmerica-UNESCO': { center: [17.0, -90.0], zoom: 5 }
      }
      return countryCenters[regionName] || null
    }

    // Use bounds for better fit
    return { center: null, zoom: null, bounds: bounds }
  }

  const handleRegionFocus = (regionName) => {
    if (regionName === 'World') {
      // Focus on world view (default center and zoom)
      setMapFocus({ center: [30.0, 0.0], zoom: 2, bounds: null })
    } else if (regionName === 'United States') {
      // Focus on US (center of continental US)
      setMapFocus({ center: [39.8283, -98.5795], zoom: 4, bounds: null })
    } else if (regionName === 'India') {
      // Focus on India (center of India)
      setMapFocus({ center: [20.5937, 78.9629], zoom: 5, bounds: null })
    } else {
      const regionData = getRegionCenter(regionName)
      if (regionData) {
        setMapFocus(regionData)
      }
    }
  }

  const toggleRegion = (region, shouldFocus = false) => {
    setVisibleRegions(prev => {
      const newValue = !prev[region]
      // Focus map if region is being enabled
      if (newValue && shouldFocus) {
        setTimeout(() => handleRegionFocus(region), 100)
      }
      return {
        ...prev,
        [region]: newValue
      }
    })
  }

  const setRegionVisibility = (regionUpdates) => {
    setVisibleRegions(prev => {
      return {
        ...prev,
        ...regionUpdates
      }
    })
  }

  const toggleAllUSRegions = (show, shouldFocus = false) => {
    const usRegions = ['West', 'South', 'Midwest', 'Northeast', 'Alaska', 'Hawaii']
    setVisibleRegions(prev => {
      const updated = { ...prev }
      usRegions.forEach(region => {
        updated[region] = show
      })
      // Focus map if US regions are being enabled
      if (show && shouldFocus) {
        setTimeout(() => handleRegionFocus('United States'), 100)
      }
      return updated
    })
  }

  const toggleAllIndiaRegions = (show, shouldFocus = false) => {
    const indiaRegions = ['India-Parks', 'India-UNESCO', 'India-Jyotirlinga', 'India-ShaktiPeetha', 'India-OtherTemples', 'India-Mutts', 'India-DivyaDesam', 'India-Forts']
    setVisibleRegions(prev => {
      const updated = { ...prev }
      indiaRegions.forEach(region => {
        updated[region] = show
      })
      // Focus map if India regions are being enabled
      if (show && shouldFocus) {
        setTimeout(() => handleRegionFocus('India'), 100)
      }
      return updated
    })
  }

  const areAllIndiaRegionsVisible = () => {
    const indiaRegions = ['India-Parks', 'India-UNESCO', 'India-Jyotirlinga', 'India-ShaktiPeetha', 'India-OtherTemples', 'India-Mutts', 'India-DivyaDesam', 'India-Forts']
    return indiaRegions.every(region => visibleRegions[region] !== false)
  }

  const toggleAllNepalRegions = (show, shouldFocus = false) => {
    const nepalRegions = ['Nepal-Parks', 'Nepal-Temples', 'Nepal-UNESCO', 'Nepal-TrekkingFlights']
    setVisibleRegions(prev => {
      const updated = { ...prev }
      nepalRegions.forEach(region => {
        updated[region] = show
      })
      if (show && shouldFocus) {
        setTimeout(() => handleRegionFocus('Nepal'), 100)
      }
      return updated
    })
  }

  const areAllNepalRegionsVisible = () => {
    const nepalRegions = ['Nepal-Parks', 'Nepal-Temples', 'Nepal-UNESCO', 'Nepal-TrekkingFlights']
    return nepalRegions.every(region => visibleRegions[region] !== false)
  }

  const toggleAllSriLankaRegions = (show, shouldFocus = false) => {
    const sriLankaRegions = ['Sri Lanka-Parks', 'Sri Lanka-Temples', 'Sri Lanka-UNESCO']
    setVisibleRegions(prev => {
      const updated = { ...prev }
      sriLankaRegions.forEach(region => {
        updated[region] = show
      })
      if (show && shouldFocus) {
        setTimeout(() => handleRegionFocus('Sri Lanka'), 100)
      }
      return updated
    })
  }

  const areAllSriLankaRegionsVisible = () => {
    const sriLankaRegions = ['Sri Lanka-Parks', 'Sri Lanka-Temples', 'Sri Lanka-UNESCO']
    return sriLankaRegions.every(region => visibleRegions[region] !== false)
  }

  const getParkIcon = (park) => {
    // Check if it's a most photographed attraction
    const description = park.Description ? String(park.Description).toLowerCase() : ''
    const name = park.Name ? String(park.Name).toLowerCase() : ''
    const isMostPhotographed = description.includes('most photographed') || 
                               description.includes('popular photography') ||
                               name.includes('most photographed')
    
    // Light red colors for most photographed attractions
    const mostPhotographedBg = '#FFB6C1'
    const mostPhotographedBorder = '#FF8C9F'
    
    // Light green colors for national parks
    const nationalParkBg = '#90EE90' // Light green
    const nationalParkBorder = '#7CB342' // Darker green border
    
    // Check if it's explicitly categorized as a temple FIRST - temples should get temple icon even if they mention UNESCO
    const isNepalTemple = park.NepalCategory === 'Temples'
    const isSriLankaTemple = park.SriLankaCategory === 'Temples'
    const isIndiaTemple = park.IndiaCategory === 'OtherTemples' || park.IndiaCategory === 'Jyotirlinga'
    
    // If it's explicitly a temple, check for temple icons first (before UNESCO check)
    if (isNepalTemple || isSriLankaTemple) {
      // Check if this temple is also a UNESCO site
      const descriptionUpper = park.Description ? String(park.Description).toUpperCase() : ''
      const designationUpper = park.Designation ? String(park.Designation).toUpperCase() : ''
      const isTempleUnesco = park.NepalCategory === 'UNESCO' ||
                             park.SriLankaCategory === 'UNESCO' ||
                             designationUpper.includes('UNESCO') ||
                             descriptionUpper.includes('UNESCO')
      
      // Use temple icon (🕉️ Om) - light red if most photographed, blue background if UNESCO, saffron if not
      const bgColor = isMostPhotographed ? mostPhotographedBg : (isTempleUnesco ? '#81D4FA' : '#FF9933')
      const borderColor = isMostPhotographed ? mostPhotographedBorder : (isTempleUnesco ? '#4FC3F7' : '#FF8C00')
      
      return L.divIcon({
        className: 'temple-marker',
        html: `<div style="
          background-color: ${bgColor};
          width: 20px;
          height: 20px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          border: 2px solid ${borderColor};
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 1px 3px rgba(0,0,0,0.3);
        ">
          <div style="
            transform: rotate(45deg);
            color: white;
            font-weight: bold;
            font-size: 11px;
            line-height: 1;
            text-shadow: 0 1px 2px rgba(0,0,0,0.3);
          ">🕉️</div>
        </div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 20],
        popupAnchor: [0, -20]
      })
    }
    
    // Check if it's a UNESCO site - UNESCO sites should get UNESCO icon
    // But only if NOT explicitly categorized as a temple
    const isUnesco = park.IndiaCategory === 'UNESCO' || 
                     park.NepalCategory === 'UNESCO' ||
                     park.SriLankaCategory === 'UNESCO' ||
                     (park.Designation && park.Designation.toUpperCase().includes('UNESCO') && !isNepalTemple && !isSriLankaTemple && !isIndiaTemple) ||
                     (park.Description && park.Description.toUpperCase().includes('UNESCO WORLD HERITAGE') && !isNepalTemple && !isSriLankaTemple && !isIndiaTemple) ||
                     (park.Country === 'Costa Rica' && park.Designation && park.Designation.toUpperCase().includes('UNESCO'))
    
    if (isUnesco) {
      // Use custom UNESCO icon - light red if most photographed, light blue otherwise
      const bgColor = isMostPhotographed ? mostPhotographedBg : '#81D4FA'
      const borderColor = isMostPhotographed ? mostPhotographedBorder : '#4FC3F7'
      return L.divIcon({
        className: 'unesco-marker',
        html: `<div style="
          background-color: ${bgColor};
          width: 20px;
          height: 20px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          border: 2px solid ${borderColor};
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 1px 3px rgba(0,0,0,0.3);
        ">
          <div style="
            transform: rotate(45deg);
            color: white;
            font-weight: bold;
            font-size: 11px;
            line-height: 1;
            text-shadow: 0 1px 2px rgba(0,0,0,0.3);
          ">🏛️</div>
        </div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 20],
        popupAnchor: [0, -20]
      })
    }
    
    // Check if it's a Jyotirlinga temple
    const isJyotirlinga = park.IndiaCategory === 'Jyotirlinga' || 
                          (park.Designation && park.Designation.includes('Jyotirlinga'))
    
    if (isJyotirlinga) {
      // Check if this temple is also a UNESCO site
      const descriptionUpper = park.Description ? String(park.Description).toUpperCase() : ''
      const designationUpper = park.Designation ? String(park.Designation).toUpperCase() : ''
      const isTempleUnesco = park.IndiaCategory === 'UNESCO' ||
                             designationUpper.includes('UNESCO') ||
                             descriptionUpper.includes('UNESCO')
      
      // Use custom Jyotirlinga icon with trishul emoji (🔱) - light red if most photographed, blue background if UNESCO, saffron if not
      // Trishul is Shiva's divine weapon - a three-pronged spear
      const bgColor = isMostPhotographed ? mostPhotographedBg : (isTempleUnesco ? '#81D4FA' : '#FF9933')
      const borderColor = isMostPhotographed ? mostPhotographedBorder : (isTempleUnesco ? '#4FC3F7' : '#FF8C00')
      
      return L.divIcon({
        className: 'jyotirlinga-marker',
        html: `<div style="
          background-color: ${bgColor};
          width: 20px;
          height: 20px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          border: 2px solid ${borderColor};
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 1px 3px rgba(0,0,0,0.3);
        ">
          <div style="
            transform: rotate(45deg);
            color: white;
            font-size: 12px;
            line-height: 1;
            text-shadow: 0 1px 3px rgba(0,0,0,0.5);
          ">🔱</div>
        </div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 20],
        popupAnchor: [0, -20]
      })
    }
    
    // Check if it's a Shakti Peetha
    const isShaktiPeetha = park.IndiaCategory === 'ShaktiPeetha' || 
                           (park.Designation && park.Designation.includes('Shakti Peetha'))
    
    if (isShaktiPeetha) {
      // Use custom Shakti Peetha icon with lotus emoji (🌸) - light red if most photographed, saffron otherwise
      const bgColor = isMostPhotographed ? mostPhotographedBg : '#FF9933'
      const borderColor = isMostPhotographed ? mostPhotographedBorder : '#FF8C00'
      return L.divIcon({
        className: 'shakti-peetha-marker',
        html: `<div style="
          background-color: ${bgColor};
          width: 20px;
          height: 20px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          border: 2px solid ${borderColor};
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 1px 3px rgba(0,0,0,0.3);
        ">
          <div style="
            transform: rotate(45deg);
            color: white;
            font-size: 12px;
            line-height: 1;
            text-shadow: 0 1px 3px rgba(0,0,0,0.5);
          ">🌸</div>
        </div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 20],
        popupAnchor: [0, -20]
      })
    }
    
    // Check if it's an Other Temple (Char Dham, Pancha Bhoota, Navagraha, etc.)
    const isOtherTemple = park.IndiaCategory === 'OtherTemples' || 
                          (park.Designation && (park.Designation.includes('Char Dham') || 
                                                park.Designation.includes('Pancha Bhoota') || 
                                                park.Designation.includes('Navagraha') ||
                                                park.Designation.includes('Major Temple') ||
                                                park.Designation.includes('Major Pilgrimage Site') ||
                                                park.Designation.includes('Sikh Temple') ||
                                                park.Designation.includes('UNESCO Temple')))
    
    if (isOtherTemple) {
      // Check if this temple is also a UNESCO site
      const descriptionUpper = park.Description ? String(park.Description).toUpperCase() : ''
      const designationUpper = park.Designation ? String(park.Designation).toUpperCase() : ''
      const isTempleUnesco = park.IndiaCategory === 'UNESCO' ||
                             designationUpper.includes('UNESCO') ||
                             descriptionUpper.includes('UNESCO')
      
      // Use custom Other Temple icon with Om emoji (🕉️) - light red if most photographed, blue background if UNESCO, saffron if not
      const bgColor = isMostPhotographed ? mostPhotographedBg : (isTempleUnesco ? '#81D4FA' : '#FF9933')
      const borderColor = isMostPhotographed ? mostPhotographedBorder : (isTempleUnesco ? '#4FC3F7' : '#FF8C00')
      
      return L.divIcon({
        className: 'other-temple-marker',
        html: `<div style="
          background-color: ${bgColor};
          width: 20px;
          height: 20px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          border: 2px solid ${borderColor};
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 1px 3px rgba(0,0,0,0.3);
        ">
          <div style="
            transform: rotate(45deg);
            color: white;
            font-size: 12px;
            line-height: 1;
            text-shadow: 0 1px 3px rgba(0,0,0,0.5);
          ">🕉️</div>
        </div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 20],
        popupAnchor: [0, -20]
      })
    }
    
    // Check if it's a Divya Desam
    const isDivyaDesam = park.IndiaCategory === 'DivyaDesam' || 
                         (park.Designation && park.Designation.includes('Divya Desam'))
    
    if (isDivyaDesam) {
      // Use custom Divya Desam icon with conch shell emoji (🐚) - light red if most photographed, saffron otherwise
      const bgColor = isMostPhotographed ? mostPhotographedBg : '#FF9933'
      const borderColor = isMostPhotographed ? mostPhotographedBorder : '#FF8C00'
      return L.divIcon({
        className: 'divya-desam-marker',
        html: `<div style="
          background-color: ${bgColor};
          width: 20px;
          height: 20px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          border: 2px solid ${borderColor};
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 1px 3px rgba(0,0,0,0.3);
        ">
          <div style="
            transform: rotate(45deg);
            color: white;
            font-size: 12px;
            line-height: 1;
            text-shadow: 0 1px 3px rgba(0,0,0,0.5);
          ">🐚</div>
        </div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 20],
        popupAnchor: [0, -20]
      })
    }
    
    // Check if it's a Math (Monastery)
    const isMath = park.IndiaCategory === 'Mutts' || 
                   (park.Designation && park.Designation.includes('Mutt'))
    
    if (isMath) {
      // Use custom Math icon with monastery emoji (🏛️) - light red if most photographed, saffron otherwise
      const bgColor = isMostPhotographed ? mostPhotographedBg : '#FF9933'
      const borderColor = isMostPhotographed ? mostPhotographedBorder : '#FF8C00'
      return L.divIcon({
        className: 'math-marker',
        html: `<div style="
          background-color: ${bgColor};
          width: 20px;
          height: 20px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          border: 2px solid ${borderColor};
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 1px 3px rgba(0,0,0,0.3);
        ">
          <div style="
            transform: rotate(45deg);
            color: white;
            font-size: 12px;
            line-height: 1;
            text-shadow: 0 1px 3px rgba(0,0,0,0.5);
          ">🏛️</div>
        </div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 20],
        popupAnchor: [0, -20]
      })
    }
    
    // Check if it's a Historic Fort
    const isFort = park.IndiaCategory === 'Forts' || 
                   (park.Designation && park.Designation.includes('Fort'))
    
    if (isFort) {
      // Use custom Fort icon with castle emoji (🏰) - light red if most photographed, brown/terracotta otherwise
      const bgColor = isMostPhotographed ? mostPhotographedBg : '#8B4513'
      const borderColor = isMostPhotographed ? mostPhotographedBorder : '#654321'
      return L.divIcon({
        className: 'fort-marker',
        html: `<div style="
          background-color: ${bgColor};
          width: 20px;
          height: 20px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          border: 2px solid ${borderColor};
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 1px 3px rgba(0,0,0,0.3);
        ">
          <div style="
            transform: rotate(45deg);
            color: white;
            font-size: 12px;
            line-height: 1;
            text-shadow: 0 1px 3px rgba(0,0,0,0.5);
          ">🏰</div>
        </div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 20],
        popupAnchor: [0, -20]
      })
    }
    
    
    // Check if it's a Nepal Trekking Route or Mountain Flight
    const isNepalTrekkingFlights = park.NepalCategory === 'TrekkingFlights'
    
    if (isNepalTrekkingFlights) {
      // Use custom Nepal Trekking/Flights icon with mountain emoji (⛰️) - light red if most photographed, blue otherwise
      const bgColor = isMostPhotographed ? mostPhotographedBg : '#2196F3'
      const borderColor = isMostPhotographed ? mostPhotographedBorder : '#1976D2'
      return L.divIcon({
        className: 'nepal-trekking-flights-marker',
        html: `<div style="
          background-color: ${bgColor};
          width: 20px;
          height: 20px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          border: 2px solid ${borderColor};
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 1px 3px rgba(0,0,0,0.3);
        ">
          <div style="
            transform: rotate(45deg);
            color: white;
            font-size: 12px;
            line-height: 1;
            text-shadow: 0 1px 3px rgba(0,0,0,0.5);
          ">⛰️</div>
        </div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 20],
        popupAnchor: [0, -20]
      })
    }
    
    // Check if it's a national park (Designation includes "National Park")
    const designation = park.Designation ? String(park.Designation) : ''
    const isNationalPark = designation.toLowerCase().includes('national park')
    
    // Regular park icons - national parks get tree emoji (🌲)
    if (isNationalPark) {
      // National park: tree emoji (🌲)
      // If most photographed, use light red background, otherwise light green
      const bgColor = isMostPhotographed ? mostPhotographedBg : nationalParkBg
      const borderColor = isMostPhotographed ? mostPhotographedBorder : nationalParkBorder
      
      return L.divIcon({
        className: 'park-marker',
        html: `<div style="
          background-color: ${bgColor};
          width: 20px;
          height: 20px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          border: 2px solid ${borderColor};
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 1px 3px rgba(0,0,0,0.3);
        ">
          <div style="
            transform: rotate(45deg);
            color: white;
            font-weight: bold;
            font-size: 11px;
            line-height: 1;
            text-shadow: 0 1px 2px rgba(0,0,0,0.3);
          ">🌲</div>
        </div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 20],
        popupAnchor: [0, -20]
      })
    }
    
    // If it's most photographed but NOT a national park (waterfalls, reserves, etc.), use camera emoji (📷)
    if (isMostPhotographed) {
      return L.divIcon({
        className: 'most-photographed-marker',
        html: `<div style="
          background-color: ${mostPhotographedBg};
          width: 20px;
          height: 20px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          border: 2px solid ${mostPhotographedBorder};
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 1px 3px rgba(0,0,0,0.3);
        ">
          <div style="
            transform: rotate(45deg);
            color: white;
            font-weight: bold;
            font-size: 11px;
            line-height: 1;
            text-shadow: 0 1px 2px rgba(0,0,0,0.3);
          ">📷</div>
        </div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 20],
        popupAnchor: [0, -20]
      })
    }
    
    // Default fallback for other attractions (non-national parks, not most photographed)
    // Use tree emoji with light green as default
    return L.divIcon({
      className: 'park-marker',
      html: `<div style="
        background-color: ${nationalParkBg};
        width: 20px;
        height: 20px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 2px solid ${nationalParkBorder};
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 1px 3px rgba(0,0,0,0.3);
      ">
        <div style="
          transform: rotate(45deg);
          color: white;
          font-weight: bold;
          font-size: 11px;
          line-height: 1;
          text-shadow: 0 1px 2px rgba(0,0,0,0.3);
        ">🌲</div>
      </div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 20],
      popupAnchor: [0, -20]
    })
  }

  const getAirportIcon = (airport) => {
    // Use white for all airports
    const color = '#FFFFFF' // White
    const borderColor = '#666666' // Dark gray border
    
    // Create custom airplane icon with white background
    return L.divIcon({
      className: 'airport-marker',
      html: `<div style="
        background-color: ${color};
        width: 22px;
        height: 22px;
        border-radius: 50%;
        border: 2px solid ${borderColor};
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 1px 4px rgba(0,0,0,0.4);
        transform: rotate(0deg);
      ">
        <div style="
          color: #333333;
          font-size: 12px;
          line-height: 1;
          transform: rotate(0deg);
        ">✈️</div>
      </div>`,
      iconSize: [22, 22],
      iconAnchor: [11, 11],
      popupAnchor: [0, -11]
    })
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading World Attractions data...</p>
      </div>
    )
  }

  const toggleAttractionType = (type) => {
    setVisibleAttractionTypes(prev => ({
      ...prev,
      [type]: !prev[type]
    }))
  }

  const handleSearch = (query) => {
    setSearchQuery(query)
  }

  const handleSelectAttraction = (park) => {
    const lat = parseFloat(park.Latitude)
    const lon = parseFloat(park.Longitude)
    
    if (!isNaN(lat) && !isNaN(lon) && lat !== 0 && lon !== 0) {
      // Set the park to open popup after map focuses
      setSelectedParkForPopup(park)
      
      // Focus the map on the attraction
      setMapFocus({
        center: [lat, lon],
        zoom: 12
      })
    }
  }

  return (
    <div className="map-view">
      <AttractionSearch
        parks={parks}
        onSearch={handleSearch}
        onSelectAttraction={handleSelectAttraction}
      />
      <AttractionTypeFilter
        visibleTypes={visibleAttractionTypes}
        toggleType={toggleAttractionType}
        isOpen={filterPanelOpen}
        setIsOpen={setFilterPanelOpen}
        availableTypes={availableAttractionTypes}
      />
      <MapContainer
        center={[30.0, 0.0]}
        zoom={2}
        style={{ height: '100vh', width: '100%' }}
        minZoom={2}
        maxZoom={18}
        zoomControl={false}
        ref={mapRef}
      >
        <ZoomControl position="bottomright" />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
        />
        
        {/* Geographic Layers */}
        {/* Coastlines - shown at zoom > 4 */}
        {coastlines && (
          <CoastlinesLayer data={coastlines} />
        )}
        
        {/* Country Boundaries - shown at zoom > 5 */}
        {countryBoundaries && (
          <CountryBoundariesLayer data={countryBoundaries} />
        )}
        
        {/* Rivers - shown at zoom > 6 */}
        {rivers && (
          <RiversLayer data={rivers} />
        )}
        
        {/* Lakes - shown at zoom > 6 */}
        {lakes && (
          <LakesLayer data={lakes} />
        )}
        
        <MapController
          center={mapFocus?.center}
          zoom={mapFocus?.zoom}
          bounds={mapFocus?.bounds}
          selectedPark={selectedParkForPopup}
          onPopupOpened={() => setSelectedParkForPopup(null)}
        />
        
        {/* Park Markers */}
        {filteredParks.map((park, index) => {
          // Skip invalid park objects
          if (!park || typeof park !== 'object') {
            return null
          }
          
          // Skip parks with empty or missing names
          const parkName = (park.Name || '').trim()
          if (!parkName || parkName === '') {
            return null
          }
          
          const lat = parseFloat(park.Latitude)
          const lon = parseFloat(park.Longitude)
          
          // Fix: Allow negative longitudes (west of prime meridian)
          // The check should only filter out invalid coordinates, not negative ones
          if (isNaN(lat) || isNaN(lon) || (lat === 0 && lon === 0)) {
            return null
          }
          
          // Additional safety: if park is from Nepal but Nepal regions are not visible, skip it
          const country = park.Country || 'United States'
          if (country === 'Nepal') {
            const nepalParksVisible = visibleRegions['Nepal-Parks'] === true
            const nepalTemplesVisible = visibleRegions['Nepal-Temples'] === true
            const nepalUnescoVisible = visibleRegions['Nepal-UNESCO'] === true
            const nepalTrekkingFlightsVisible = visibleRegions['Nepal-TrekkingFlights'] === true
            
            // If all Nepal regions are false or undefined, definitely skip
            if (nepalParksVisible !== true && nepalTemplesVisible !== true && nepalUnescoVisible !== true && nepalTrekkingFlightsVisible !== true) {
              return null
            }
            
            // Double-check: if it's a temple but temples are not visible, skip
            if (park.NepalCategory === 'Temples' && nepalTemplesVisible !== true) {
              return null
            }
            // If it's UNESCO but UNESCO is not visible, skip
            if (park.NepalCategory === 'UNESCO' && nepalUnescoVisible !== true) {
              return null
            }
            // If it's TrekkingFlights but TrekkingFlights is not visible, skip
            if (park.NepalCategory === 'TrekkingFlights' && nepalTrekkingFlightsVisible !== true) {
              return null
            }
            // If it's not a temple, UNESCO, or TrekkingFlights but parks are not visible, skip
            if (park.NepalCategory !== 'Temples' && park.NepalCategory !== 'UNESCO' && park.NepalCategory !== 'TrekkingFlights' && nepalParksVisible !== true) {
              return null
            }
          }
          
          // Additional safety: if park is from Sri Lanka but Sri Lanka regions are not visible, skip it
          if (country === 'Sri Lanka') {
            const sriLankaParksVisible = visibleRegions['Sri Lanka-Parks'] === true
            const sriLankaTemplesVisible = visibleRegions['Sri Lanka-Temples'] === true
            const sriLankaUnescoVisible = visibleRegions['Sri Lanka-UNESCO'] === true
            
            // If all Sri Lanka regions are false or undefined, definitely skip
            if (sriLankaParksVisible !== true && sriLankaTemplesVisible !== true && sriLankaUnescoVisible !== true) {
              return null
            }
            
            // Double-check: if it's a temple but temples are not visible, skip
            if (park.SriLankaCategory === 'Temples' && sriLankaTemplesVisible !== true) {
              return null
            }
            // If it's UNESCO but UNESCO is not visible, skip
            if (park.SriLankaCategory === 'UNESCO' && sriLankaUnescoVisible !== true) {
              return null
            }
            // If it's not a temple or UNESCO but parks are not visible, skip
            if (park.SriLankaCategory !== 'Temples' && park.SriLankaCategory !== 'UNESCO' && sriLankaParksVisible !== true) {
              return null
            }
          }

          const nearbyAirports = findNearbyAirports(lat, lon, airports, 200)
          
          // Determine nearby parks radius based on country
          // Asian countries: 100 km, others: 300 miles
          const asianCountries = ['India', 'Nepal', 'Sri Lanka', 'China', 'Japan', 'South Korea', 'North Korea', 'Thailand', 'Vietnam', 'Indonesia', 'Malaysia', 'Philippines', 'Singapore', 'Bangladesh', 'Pakistan', 'Myanmar', 'Cambodia', 'Laos', 'Mongolia', 'Bhutan', 'Maldives', 'Afghanistan']
          const isAsianCountry = asianCountries.includes(country)
          const nearbyParksRadius = isAsianCountry ? 62.1371 : 300 // 100 km = 62.1371 miles
          const nearbyParks = findNearbyParks(lat, lon, park.Name, parks, nearbyParksRadius)
          
          // (country already declared above)
          let locationLabel = 'State(s)'
          if (country === 'Canada') {
            locationLabel = 'Province(s)'
          } else if (country === 'India') {
            locationLabel = 'State(s)'
          } else if (country === 'Nepal') {
            locationLabel = 'Province/District'
          } else if (country === 'Sri Lanka') {
            locationLabel = 'Province'
          } else if (country === 'Costa Rica') {
            locationLabel = 'Province(s)'
          }
          
          // Determine if country uses metric system (all except US)
          const useMetric = country !== 'United States'
          const milesToKm = 1.60934

          return (
            <Marker
              key={park.id || index}
              position={[lat, lon]}
              icon={getParkIcon(park)}
            >
              <Popup>
                <div className="park-popup">
                  <h3>{park.Name}</h3>
                  <p><strong>🌍 Country:</strong> {country}</p>
                  {(() => {
                    // Extract city from description
                    let city = null
                    if (park.Description) {
                      const desc = park.Description
                      
                      // Pattern 1: "Located in [City], [State]"
                      let match = desc.match(/Located in ([^,]+),/i)
                      if (match && match[1]) {
                        city = match[1].trim()
                        // Filter out common non-city words
                        const invalidWords = ['Indrakeeladri Hill', 'Hill', 'River', 'Temple', 'on', 'at', 'the']
                        if (invalidWords.some(word => city.toLowerCase().includes(word.toLowerCase()))) {
                          city = null
                        }
                      }
                      
                      // Pattern 2: "in [City], [State]" (for cases like "on Indrakeeladri Hill in Vijayawada")
                      if (!city) {
                        match = desc.match(/in ([A-Z][a-z]+(?: [A-Z][a-z]+)?), [A-Z][a-z]+ (?:Province|State|District|Pradesh)/i)
                        if (match && match[1]) {
                          const potentialCity = match[1].trim()
                          const invalidWords = ['Hill', 'River', 'Temple', 'on', 'at', 'the', 'Indrakeeladri']
                          if (!invalidWords.some(word => potentialCity.toLowerCase().includes(word.toLowerCase()))) {
                            city = potentialCity
                          }
                        }
                      }
                      
                      // Pattern 3: Common major temple cities
                      if (!city) {
                        const majorTempleCities = [
                          'Vijayawada', 'Ayodhya', 'Mathura', 'Vrindavan', 'Haridwar', 'Rishikesh', 
                          'Udupi', 'Guruvayur', 'Sabarimala', 'Puri', 'Tirupati', 'Madurai', 
                          'Kanchipuram', 'Kumbakonam', 'Srirangam', 'Chennai', 'Varanasi', 'Ujjain',
                          'Dwarka', 'Badrinath', 'Kedarnath', 'Gangotri', 'Yamunotri', 'Rameswaram',
                          'Shirdi', 'Tirumala', 'Tiruchirappalli', 'Thanjavur', 'Chidambaram', 'Kumbakonam'
                        ]
                        for (const cityName of majorTempleCities) {
                          if (desc.includes(cityName)) {
                            city = cityName
                            break
                          }
                        }
                      }
                    }
                    return city ? <p><strong>🏙️ City:</strong> {city}</p> : null
                  })()}
                  <p><strong>📍 {locationLabel}:</strong> {park.States || 'N/A'}</p>
                  <p><strong>🏞️ Designation:</strong> {park.Designation || 'N/A'}</p>
                  {park.IndiaCategory === 'ShaktiPeetha' && park.Body_Part && (
                    <p><strong>🌸 Body Part:</strong> {park.Body_Part}</p>
                  )}
                  {park.IndiaCategory === 'Jyotirlinga' && park.Jyotirlinga_Number && (
                    <p><strong>🔱 Jyotirlinga Number:</strong> {park.Jyotirlinga_Number}</p>
                  )}
                  {park.Description && (
                    <p className="description">{park.Description.substring(0, 200)}...</p>
                  )}
                  {park.URL && (
                    <p>
                      <a href={park.URL} target="_blank" rel="noopener noreferrer">
                        {(() => {
                          if (park.IndiaCategory === 'Jyotirlinga') {
                            return '🌐 Visit Temple Website →'
                          } else if (park.IndiaCategory === 'ShaktiPeetha') {
                            return '🌐 Visit Shakti Peetha Website →'
                          } else if (park.IndiaCategory === 'UNESCO') {
                            return '🌐 Visit UNESCO Site →'
                          } else if (park.NepalCategory === 'Temples' || park.SriLankaCategory === 'Temples') {
                            return '🌐 Visit Temple Website →'
                          } else if (country === 'United States') {
                            return '🌐 Visit NPS Website →'
                          } else if (country === 'Canada') {
                            return '🌐 Visit Parks Canada Website →'
                          } else if (country === 'Nepal') {
                            return '🌐 Visit Nepal Parks Website →'
                          } else if (country === 'Sri Lanka') {
                            return '🌐 Visit Sri Lanka Parks Website →'
                          } else {
                            return '🌐 Visit Website →'
                          }
                        })()}
                      </a>
                    </p>
                  )}
                  {nearbyAirports.length > 0 && (
                    <div className="nearby-section">
                      <strong>✈️ Nearby Airports:</strong>
                      <ul>
                        {nearbyAirports.map((airport, i) => {
                          const distance = useMetric ? (airport.distance * milesToKm) : airport.distance
                          const unit = useMetric ? 'km' : 'mi'
                          return (
                            <li key={i}>
                              {airport.iata} - {airport.name} ({distance.toFixed(1)} {unit})
                            </li>
                          )
                        })}
                      </ul>
                    </div>
                  )}
                  {nearbyParks.length > 0 && (
                    <div className="nearby-section">
                      <strong>🏞️ Nearby Attractions (within {isAsianCountry ? '100 km' : (useMetric ? '483 km' : '300 mi')}):</strong>
                      <ul>
                        {nearbyParks.map((nearby, i) => {
                          const distance = useMetric ? (nearby.distance * milesToKm) : nearby.distance
                          const unit = useMetric ? 'km' : 'mi'
                          return (
                            <li key={i}>
                              {nearby.name} ({distance.toFixed(1)} {unit})
                            </li>
                          )
                        })}
                      </ul>
                    </div>
                  )}
                  <p className="coordinates">
                    Coordinates: {lat.toFixed(4)}°N, {lon.toFixed(4)}°W
                  </p>
                </div>
              </Popup>
            </Marker>
          )
        })}

        {/* Airport Markers - Only show airports near visible parks */}
        {filteredAirports.map((airport, index) => {
          const lat = parseFloat(airport.Latitude)
          const lon = parseFloat(airport.Longitude)
          
          if (isNaN(lat) || isNaN(lon) || lat === 0 || lon === 0) {
            return null
          }

          return (
            <Marker
              key={`airport-${airport.IATA || index}`}
              position={[lat, lon]}
              icon={getAirportIcon(airport)}
            >
              <Popup>
                <div className="airport-popup">
                  <h3>✈️ {airport.Name || 'Airport'}</h3>
                  {airport.IATA && (
                    <p><strong>IATA Code:</strong> {airport.IATA}</p>
                  )}
                  {airport.City && (
                    <p><strong>City:</strong> {airport.City}</p>
                  )}
                  {airport.Country && (
                    <p><strong>Country:</strong> {airport.Country}</p>
                  )}
                  {airport.nearbyPark && (
                    <p className="nearby-park-info">
                      <strong>📍 Near:</strong> {airport.nearbyPark} {airport.distance ? (() => {
                        const airportCountry = airport.Country || 'United States'
                        const useMetricAirport = airportCountry !== 'United States'
                        const distance = useMetricAirport ? (airport.distance * 1.60934) : airport.distance
                        const unit = useMetricAirport ? 'km' : 'mi'
                        return `(${distance.toFixed(1)} ${unit})`
                      })() : ''}
                    </p>
                  )}
                  {!airport.nearbyPark && airport.Country && (
                    <p className="nearby-park-info">
                      <strong>📍 Country:</strong> {airport.Country}
                    </p>
                  )}
                  <p className="coordinates">
                    Coordinates: {lat.toFixed(4)}°N, {lon.toFixed(4)}°W
                  </p>
                </div>
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>

      <TabPanel
        parks={parks}
        regions={regions}
        visibleRegions={visibleRegions}
        toggleRegion={toggleRegion}
        setRegionVisibility={setRegionVisibility}
        handleRegionFocus={handleRegionFocus}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
    </div>
  )
}

export default MapView

