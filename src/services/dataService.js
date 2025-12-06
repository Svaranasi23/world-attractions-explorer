import Papa from 'papaparse'

/**
 * Load CSV data from the data directory
 */
export const loadCSVData = async (filename) => {
  try {
    const response = await fetch(`/data/${filename}`)
    const text = await response.text()
    
    return new Promise((resolve, reject) => {
      Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          resolve(results.data)
        },
        error: (error) => {
          reject(error)
        }
      })
    })
  } catch (error) {
    console.error(`Error loading ${filename}:`, error)
    return []
  }
}

/**
 * Load all parks data (US, Canadian, and Indian)
 */
export const loadParksData = async () => {
  try {
    const [usParks, canadianParks, indianParks, indianUnescoSites, indianJyotirlinga, indianShaktiPeethas, indianOtherTemples, indianMutts, indianDivyaDesams, indianForts, nepalParks, nepalTemples, nepalUnescoSites, nepalTrekkingFlights, sriLankaParks, sriLankaTemples, sriLankaUnescoSites, costaRicaParks, chinaUnescoSites, japanUnescoSites, thailandUnescoSites, indonesiaUnescoSites, vietnamUnescoSites, cambodiaUnescoSites, myanmarUnescoSites, bangladeshUnescoSites, pakistanUnescoSites] = await Promise.all([
      loadCSVData('US_National_Parks.csv'),
      loadCSVData('Canadian_National_Parks.csv').catch(() => []),
      loadCSVData('Indian_National_Parks.csv').catch(() => []),
      loadCSVData('India_UNESCO_Sites.csv').catch(() => []),
      loadCSVData('India_Jyotirlinga_Temples.csv').catch(() => []),
      loadCSVData('India_Shakti_Peethas.csv').catch(() => []),
      loadCSVData('India_Other_Temples.csv').catch(() => []),
      loadCSVData('India_Mutts.csv').catch(() => []),
      loadCSVData('India_Divya_Desams.csv').catch(() => []),
      loadCSVData('India_Forts.csv').catch(() => []),
      loadCSVData('Nepal_National_Parks.csv').catch(() => []),
      loadCSVData('Nepal_Temples.csv').catch(() => []),
      loadCSVData('Nepal_UNESCO_Sites.csv').catch(() => []),
      loadCSVData('Nepal_Trekking_Flights.csv').catch(() => []),
      loadCSVData('Sri_Lanka_National_Parks.csv').catch(() => []),
      loadCSVData('Sri_Lanka_Temples.csv').catch(() => []),
      loadCSVData('Sri_Lanka_UNESCO_Sites.csv').catch(() => []),
      loadCSVData('Costa_Rica_National_Parks.csv').catch(() => []),
      loadCSVData('China_UNESCO_Sites.csv').catch(() => []),
      loadCSVData('Japan_UNESCO_Sites.csv').catch(() => []),
      loadCSVData('Thailand_UNESCO_Sites.csv').catch(() => []),
      loadCSVData('Indonesia_UNESCO_Sites.csv').catch(() => []),
      loadCSVData('Vietnam_UNESCO_Sites.csv').catch(() => []),
      loadCSVData('Cambodia_UNESCO_Sites.csv').catch(() => []),
      loadCSVData('Myanmar_UNESCO_Sites.csv').catch(() => []),
      loadCSVData('Bangladesh_UNESCO_Sites.csv').catch(() => []),
      loadCSVData('Pakistan_UNESCO_Sites.csv').catch(() => [])
    ])
    
    // Process US parks
    const processedUSParks = usParks.map(park => ({
      ...park,
      Country: 'United States',
      id: `us-${park.Park_Code || Math.random()}`
    }))
    
    // Process Canadian parks
    const processedCanadianParks = canadianParks.map(park => ({
      Park_Code: park.Park_Code || '',
      Name: park.Name || '',
      Designation: 'National Park',
      States: park.Province || '',
      Latitude: park.Latitude || '0',
      Longitude: park.Longitude || '0',
      Description: `Canadian National Park in ${park.Province || ''}`,
      URL: '',
      Country: 'Canada',
      id: `ca-${park.Park_Code || Math.random()}`
    }))
    
    // Process Indian parks
    const processedIndianParks = indianParks.map(park => ({
      Park_Code: park.Park_Code || '',
      Name: park.Name || '',
      Designation: park.Designation || 'National Park',
      States: park.States || '',
      Latitude: park.Latitude || '0',
      Longitude: park.Longitude || '0',
      Description: park.Description || `Indian National Park in ${park.States || ''}`,
      URL: park.URL || '',
      Country: 'India',
      IndiaCategory: 'Parks', // Categorize as regular parks
      id: `in-${park.Park_Code || Math.random()}`
    }))
    
    // Process Indian UNESCO sites
    const processedIndianUnesco = indianUnescoSites.map(site => ({
      Park_Code: site.Park_Code || '',
      Name: site.Name || '',
      Designation: site.Designation || 'UNESCO World Heritage Site',
      States: site.States || '',
      Latitude: site.Latitude || '0',
      Longitude: site.Longitude || '0',
      Description: site.Description || `UNESCO World Heritage Site in ${site.States || ''}`,
      URL: site.URL || '',
      Country: 'India',
      IndiaCategory: 'UNESCO', // Categorize as UNESCO sites
      UNESCO_Year: site.UNESCO_Year || '',
      id: `in-unesco-${site.Park_Code || Math.random()}`
    }))
    
    // Process Indian Jyotirlinga temples
    const processedIndianJyotirlinga = indianJyotirlinga
      .filter(temple => {
        // Filter out temples with empty names or invalid coordinates
        const name = temple.Name || ''
        const lat = parseFloat(temple.Latitude || '0')
        const lon = parseFloat(temple.Longitude || '0')
        return name.trim() !== '' && !isNaN(lat) && !isNaN(lon) && lat !== 0 && lon !== 0
      })
      .map(temple => ({
        Park_Code: temple.Park_Code || '',
        Name: temple.Name || '',
        Designation: temple.Designation || 'Jyotirlinga Temple',
        States: temple.States || '',
        Latitude: temple.Latitude || '0',
        Longitude: temple.Longitude || '0',
        Description: temple.Description || `Jyotirlinga Temple in ${temple.States || ''}`,
        URL: temple.URL || '',
        Country: 'India',
        IndiaCategory: 'Jyotirlinga', // Categorize as Jyotirlinga temples
        Jyotirlinga_Number: temple.Jyotirlinga_Number || '',
        id: `in-jyotirlinga-${temple.Park_Code || Math.random()}`
      }))
    
    // Process Indian Shakti Peethas (18 Ashtadasha Maha Shakti Peethas)
    // Note: Most are in India, but one (Shankari) is in Sri Lanka
    const processedIndianShaktiPeethas = indianShaktiPeethas
      .filter(peetha => {
        // Filter out peethas with empty names or invalid coordinates
        const name = peetha.Name || ''
        const lat = parseFloat(peetha.Latitude || '0')
        const lon = parseFloat(peetha.Longitude || '0')
        return name.trim() !== '' && !isNaN(lat) && !isNaN(lon) && lat !== 0 && lon !== 0
      })
      .map(peetha => ({
        Park_Code: peetha.Park_Code || '',
        Name: peetha.Name || '',
        Designation: peetha.Designation || 'Shakti Peetha',
        States: peetha.States || '',
        Latitude: peetha.Latitude || '0',
        Longitude: peetha.Longitude || '0',
        Description: peetha.Description || `Shakti Peetha in ${peetha.States || ''}`,
        URL: peetha.URL || '',
        Country: peetha.Country || 'India', // Preserve original country (most are India, one is Sri Lanka)
        IndiaCategory: 'ShaktiPeetha', // Categorize as Shakti Peethas for filtering
        Shakti_Peetha_Number: peetha.Shakti_Peetha_Number || '',
        Body_Part: peetha.Body_Part || '',
        id: `in-shakti-${peetha.Park_Code || Math.random()}`
      }))
    
    // Process Indian Major Temples
    const processedIndianOtherTemples = indianOtherTemples
        .filter(temple => {
          // Filter out temples with empty names or invalid coordinates
          const name = temple.Name || ''
          const lat = parseFloat(temple.Latitude || '0')
          const lon = parseFloat(temple.Longitude || '0')
          return name.trim() !== '' && !isNaN(lat) && !isNaN(lon) && lat !== 0 && lon !== 0
        })
        .map(temple => ({
          Park_Code: temple.Park_Code || '',
          Name: temple.Name || '',
          Designation: temple.Designation || 'Temple',
          States: temple.States || '',
          Latitude: temple.Latitude || '0',
          Longitude: temple.Longitude || '0',
          Description: temple.Description || `Temple in ${temple.States || ''}`,
          URL: temple.URL || '',
          Country: 'India',
          IndiaCategory: 'OtherTemples', // Categorize as Major Temples for filtering
        Temple_Category: temple.Temple_Category || '',
        Element: temple.Element || '',
        Planet: temple.Planet || '',
        id: `in-other-temple-${temple.Park_Code || Math.random()}`
      }))
    
    // Process Nepal parks
    const processedNepalParks = nepalParks.map(park => ({
      Park_Code: park.Park_Code || '',
      Name: park.Name || '',
      Designation: park.Designation || 'National Park',
      States: park.States || '',
      Latitude: park.Latitude || '0',
      Longitude: park.Longitude || '0',
      Description: park.Description || `Nepal National Park in ${park.States || ''}`,
      URL: park.URL || '',
      Country: 'Nepal',
      id: `np-${park.Park_Code || Math.random()}`
    }))
    
    // Process Nepal temples
    const processedNepalTemples = nepalTemples.map(temple => ({
      Park_Code: temple.Park_Code || '',
      Name: temple.Name || '',
      Designation: temple.Designation || 'Temple',
      States: temple.States || '',
      Latitude: temple.Latitude || '0',
      Longitude: temple.Longitude || '0',
      Description: temple.Description || `Temple in ${temple.States || ''}`,
      URL: temple.URL || '',
      Country: 'Nepal',
      NepalCategory: 'Temples',
      Temple_Type: temple.Temple_Type || '',
      id: `np-temple-${temple.Park_Code || Math.random()}`
    }))
    
    // Process Nepal UNESCO sites
    const processedNepalUnesco = nepalUnescoSites.map(site => ({
      Park_Code: site.Park_Code || '',
      Name: site.Name || '',
      Designation: site.Designation || 'UNESCO World Heritage Site',
      States: site.States || '',
      Latitude: site.Latitude || '0',
      Longitude: site.Longitude || '0',
      Description: site.Description || `UNESCO World Heritage Site in ${site.States || ''}`,
      URL: site.URL || '',
      Country: 'Nepal',
      NepalCategory: 'UNESCO', // Categorize as UNESCO sites
      UNESCO_Year: site.UNESCO_Year || '',
      id: `np-unesco-${site.Park_Code || Math.random()}`
    }))
    
    // Process Nepal Trekking Routes and Mountain Flights
    const processedNepalTrekkingFlights = nepalTrekkingFlights.map(activity => ({
      Park_Code: activity.Park_Code || '',
      Name: activity.Name || '',
      Designation: activity.Designation || 'Himalayan Activity',
      States: activity.States || '',
      Latitude: activity.Latitude || '0',
      Longitude: activity.Longitude || '0',
      Description: activity.Description || `Himalayan activity in ${activity.States || ''}`,
      URL: activity.URL || '',
      Country: 'Nepal',
      NepalCategory: 'TrekkingFlights', // Categorize as Trekking and Flights
      Activity_Type: activity.Activity_Type || '',
      Duration_Days: activity.Duration_Days || '',
      Difficulty: activity.Difficulty || '',
      id: `np-trekking-${activity.Park_Code || Math.random()}`
    }))
    
    // Process Sri Lanka parks
    const processedSriLankaParks = sriLankaParks.map(park => ({
      Park_Code: park.Park_Code || '',
      Name: park.Name || '',
      Designation: park.Designation || 'National Park',
      States: park.States || '',
      Latitude: park.Latitude || '0',
      Longitude: park.Longitude || '0',
      Description: park.Description || `Sri Lanka National Park in ${park.States || ''}`,
      URL: park.URL || '',
      Country: 'Sri Lanka',
      id: `lk-${park.Park_Code || Math.random()}`
    }))
    
    // Process Sri Lanka temples
    const processedSriLankaTemples = sriLankaTemples.map(temple => ({
      Park_Code: temple.Park_Code || '',
      Name: temple.Name || '',
      Designation: temple.Designation || 'Temple',
      States: temple.States || '',
      Latitude: temple.Latitude || '0',
      Longitude: temple.Longitude || '0',
      Description: temple.Description || `Temple in ${temple.States || ''}`,
      URL: temple.URL || '',
      Country: 'Sri Lanka',
      SriLankaCategory: 'Temples',
      Temple_Type: temple.Temple_Type || '',
      id: `lk-temple-${temple.Park_Code || Math.random()}`
    }))
    
    // Process Sri Lanka UNESCO sites
    const processedSriLankaUnesco = sriLankaUnescoSites.map(site => ({
      Park_Code: site.Park_Code || '',
      Name: site.Name || '',
      Designation: site.Designation || 'UNESCO World Heritage Site',
      States: site.States || '',
      Latitude: site.Latitude || '0',
      Longitude: site.Longitude || '0',
      Description: site.Description || `UNESCO World Heritage Site in ${site.States || ''}`,
      URL: site.URL || '',
      Country: 'Sri Lanka',
      SriLankaCategory: 'UNESCO', // Categorize as UNESCO sites
      UNESCO_Year: site.UNESCO_Year || '',
      id: `lk-unesco-${site.Park_Code || Math.random()}`
    }))
    
    // Process Costa Rica parks
    const processedCostaRicaParks = costaRicaParks.map(park => ({
      Park_Code: park.Park_Code || '',
      Name: park.Name || '',
      Designation: park.Designation || 'National Park',
      States: park.States || '',
      Latitude: park.Latitude || '0',
      Longitude: park.Longitude || '0',
      Description: park.Description || `Costa Rica National Park in ${park.States || ''}`,
      URL: park.URL || '',
      Country: 'Costa Rica',
      id: `cr-${park.Park_Code || Math.random()}`
    }))
    
    // Process Asian UNESCO sites
    const processedChinaUnesco = chinaUnescoSites.map(site => ({
      Park_Code: site.Park_Code || '',
      Name: site.Name || '',
      Designation: site.Designation || 'UNESCO World Heritage Site',
      States: site.States || '',
      Latitude: site.Latitude || '0',
      Longitude: site.Longitude || '0',
      Description: site.Description || `UNESCO World Heritage Site in ${site.States || ''}`,
      URL: site.URL || '',
      Country: 'China',
      UNESCO_Year: site.UNESCO_Year || '',
      id: `cn-unesco-${site.Park_Code || Math.random()}`
    }))
    
    const processedJapanUnesco = japanUnescoSites.map(site => ({
      Park_Code: site.Park_Code || '',
      Name: site.Name || '',
      Designation: site.Designation || 'UNESCO World Heritage Site',
      States: site.States || '',
      Latitude: site.Latitude || '0',
      Longitude: site.Longitude || '0',
      Description: site.Description || `UNESCO World Heritage Site in ${site.States || ''}`,
      URL: site.URL || '',
      Country: 'Japan',
      UNESCO_Year: site.UNESCO_Year || '',
      id: `jp-unesco-${site.Park_Code || Math.random()}`
    }))
    
    const processedThailandUnesco = thailandUnescoSites.map(site => ({
      Park_Code: site.Park_Code || '',
      Name: site.Name || '',
      Designation: site.Designation || 'UNESCO World Heritage Site',
      States: site.States || '',
      Latitude: site.Latitude || '0',
      Longitude: site.Longitude || '0',
      Description: site.Description || `UNESCO World Heritage Site in ${site.States || ''}`,
      URL: site.URL || '',
      Country: 'Thailand',
      UNESCO_Year: site.UNESCO_Year || '',
      id: `th-unesco-${site.Park_Code || Math.random()}`
    }))
    
    const processedIndonesiaUnesco = indonesiaUnescoSites.map(site => ({
      Park_Code: site.Park_Code || '',
      Name: site.Name || '',
      Designation: site.Designation || 'UNESCO World Heritage Site',
      States: site.States || '',
      Latitude: site.Latitude || '0',
      Longitude: site.Longitude || '0',
      Description: site.Description || `UNESCO World Heritage Site in ${site.States || ''}`,
      URL: site.URL || '',
      Country: 'Indonesia',
      UNESCO_Year: site.UNESCO_Year || '',
      id: `id-unesco-${site.Park_Code || Math.random()}`
    }))
    
    const processedVietnamUnesco = vietnamUnescoSites.map(site => ({
      Park_Code: site.Park_Code || '',
      Name: site.Name || '',
      Designation: site.Designation || 'UNESCO World Heritage Site',
      States: site.States || '',
      Latitude: site.Latitude || '0',
      Longitude: site.Longitude || '0',
      Description: site.Description || `UNESCO World Heritage Site in ${site.States || ''}`,
      URL: site.URL || '',
      Country: 'Vietnam',
      UNESCO_Year: site.UNESCO_Year || '',
      id: `vn-unesco-${site.Park_Code || Math.random()}`
    }))
    
    const processedCambodiaUnesco = cambodiaUnescoSites.map(site => ({
      Park_Code: site.Park_Code || '',
      Name: site.Name || '',
      Designation: site.Designation || 'UNESCO World Heritage Site',
      States: site.States || '',
      Latitude: site.Latitude || '0',
      Longitude: site.Longitude || '0',
      Description: site.Description || `UNESCO World Heritage Site in ${site.States || ''}`,
      URL: site.URL || '',
      Country: 'Cambodia',
      UNESCO_Year: site.UNESCO_Year || '',
      id: `kh-unesco-${site.Park_Code || Math.random()}`
    }))
    
    const processedMyanmarUnesco = myanmarUnescoSites.map(site => ({
      Park_Code: site.Park_Code || '',
      Name: site.Name || '',
      Designation: site.Designation || 'UNESCO World Heritage Site',
      States: site.States || '',
      Latitude: site.Latitude || '0',
      Longitude: site.Longitude || '0',
      Description: site.Description || `UNESCO World Heritage Site in ${site.States || ''}`,
      URL: site.URL || '',
      Country: 'Myanmar',
      UNESCO_Year: site.UNESCO_Year || '',
      id: `mm-unesco-${site.Park_Code || Math.random()}`
    }))
    
    const processedBangladeshUnesco = bangladeshUnescoSites.map(site => ({
      Park_Code: site.Park_Code || '',
      Name: site.Name || '',
      Designation: site.Designation || 'UNESCO World Heritage Site',
      States: site.States || '',
      Latitude: site.Latitude || '0',
      Longitude: site.Longitude || '0',
      Description: site.Description || `UNESCO World Heritage Site in ${site.States || ''}`,
      URL: site.URL || '',
      Country: 'Bangladesh',
      UNESCO_Year: site.UNESCO_Year || '',
      id: `bd-unesco-${site.Park_Code || Math.random()}`
    }))
    
    const processedPakistanUnesco = pakistanUnescoSites.map(site => ({
      Park_Code: site.Park_Code || '',
      Name: site.Name || '',
      Designation: site.Designation || 'UNESCO World Heritage Site',
      States: site.States || '',
      Latitude: site.Latitude || '0',
      Longitude: site.Longitude || '0',
      Description: site.Description || `UNESCO World Heritage Site in ${site.States || ''}`,
      URL: site.URL || '',
      Country: 'Pakistan',
      UNESCO_Year: site.UNESCO_Year || '',
      id: `pk-unesco-${site.Park_Code || Math.random()}`
    }))
    
    // Process Indian Mutts
    const processedIndianMutts = indianMutts
      .filter(mutt => {
        // Filter out mutts with empty names or invalid coordinates
        const name = mutt.Name || ''
        const lat = parseFloat(mutt.Latitude || '0')
        const lon = parseFloat(mutt.Longitude || '0')
        return name.trim() !== '' && !isNaN(lat) && !isNaN(lon) && lat !== 0 && lon !== 0
      })
      .map(mutt => ({
        Park_Code: mutt.Park_Code || '',
        Name: mutt.Name || '',
        Designation: mutt.Designation || 'Mutt',
        States: mutt.States || '',
        Latitude: mutt.Latitude || '0',
        Longitude: mutt.Longitude || '0',
        Description: mutt.Description || `Mutt in ${mutt.States || ''}`,
        URL: mutt.URL || '',
        Country: 'India',
        IndiaCategory: 'Mutts', // Categorize as Mutts for filtering
        Mutt_Category: mutt.Mutt_Category || '',
        id: `in-mutt-${mutt.Park_Code || Math.random()}`
      }))
    
    // Process Indian Divya Desams
    const processedIndianDivyaDesams = indianDivyaDesams
      .filter(desam => {
        // Filter out desams with empty names or invalid coordinates
        const name = desam.Name || ''
        const lat = parseFloat(desam.Latitude || '0')
        const lon = parseFloat(desam.Longitude || '0')
        return name.trim() !== '' && !isNaN(lat) && !isNaN(lon) && lat !== 0 && lon !== 0
      })
      .map(desam => ({
        Park_Code: desam.Park_Code || '',
        Name: desam.Name || '',
        Designation: desam.Designation || 'Divya Desam',
        States: desam.States || '',
        Latitude: desam.Latitude || '0',
        Longitude: desam.Longitude || '0',
        Description: desam.Description || `Divya Desam in ${desam.States || ''}`,
        URL: desam.URL || '',
        Country: 'India',
        IndiaCategory: 'DivyaDesam', // Categorize as Divya Desams for filtering
        Divya_Desam_Number: desam.Divya_Desam_Number || '',
        id: `in-divya-${desam.Park_Code || Math.random()}`
      }))
    
    // Process Indian Historic Forts
    const processedIndianForts = indianForts
      .filter(fort => {
        // Filter out forts with empty names or invalid coordinates
        const name = fort.Name || ''
        const lat = parseFloat(fort.Latitude || '0')
        const lon = parseFloat(fort.Longitude || '0')
        return name.trim() !== '' && !isNaN(lat) && !isNaN(lon) && lat !== 0 && lon !== 0
      })
      .map(fort => ({
        Park_Code: fort.Park_Code || '',
        Name: fort.Name || '',
        Designation: fort.Designation || 'Historic Fort',
        States: fort.States || '',
        Latitude: fort.Latitude || '0',
        Longitude: fort.Longitude || '0',
        Description: fort.Description || `Historic Fort in ${fort.States || ''}`,
        URL: fort.URL || '',
        Country: 'India',
        IndiaCategory: 'Forts', // Categorize as Forts for filtering
        Fort_Category: fort.Fort_Category || '',
        id: `in-fort-${fort.Park_Code || Math.random()}`
      }))
    
    return [...processedUSParks, ...processedCanadianParks, ...processedIndianParks, ...processedIndianUnesco, ...processedIndianJyotirlinga, ...processedIndianShaktiPeethas, ...processedIndianOtherTemples, ...processedIndianMutts, ...processedIndianDivyaDesams, ...processedIndianForts, ...processedNepalParks, ...processedNepalTemples, ...processedNepalUnesco, ...processedNepalTrekkingFlights, ...processedSriLankaParks, ...processedSriLankaTemples, ...processedSriLankaUnesco, ...processedCostaRicaParks, ...processedChinaUnesco, ...processedJapanUnesco, ...processedThailandUnesco, ...processedIndonesiaUnesco, ...processedVietnamUnesco, ...processedCambodiaUnesco, ...processedMyanmarUnesco, ...processedBangladeshUnesco, ...processedPakistanUnesco]
  } catch (error) {
    console.error('Error loading parks data:', error)
    return []
  }
}

/**
 * Load airports data
 */
export const loadAirportsData = async () => {
  try {
    return await loadCSVData('Major_Airports.csv')
  } catch (error) {
    console.error('Error loading airports data:', error)
    return []
  }
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in miles
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 3958.8 // Earth's radius in miles
  
  const lat1Rad = (lat1 * Math.PI) / 180
  const lat2Rad = (lat2 * Math.PI) / 180
  const deltaLat = ((lat2 - lat1) * Math.PI) / 180
  const deltaLon = ((lon2 - lon1) * Math.PI) / 180
  
  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.sin(deltaLon / 2) ** 2
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  
  return R * c
}

/**
 * Find nearby airports within a given radius (in miles)
 */
export const findNearbyAirports = (parkLat, parkLon, airports, radius = 200) => {
  return airports
    .map(airport => {
      try {
        const airportLat = parseFloat(airport.Latitude)
        const airportLon = parseFloat(airport.Longitude)
        
        if (isNaN(airportLat) || isNaN(airportLon)) return null
        
        const distance = calculateDistance(parkLat, parkLon, airportLat, airportLon)
        
        if (distance <= radius) {
          return {
            name: airport.Name || '',
            iata: airport.IATA || '',
            city: airport.City || '',
            distance: distance
          }
        }
        return null
      } catch (error) {
        return null
      }
    })
    .filter(Boolean)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 5) // Top 5 closest
}

/**
 * Find nearby parks within a given radius (in miles)
 */
export const findNearbyParks = (parkLat, parkLon, parkName, allParks, radius = 300) => {
  return allParks
    .map(park => {
      if (park.Name === parkName) return null // Skip self
      
      try {
        const otherLat = parseFloat(park.Latitude)
        const otherLon = parseFloat(park.Longitude)
        
        if (isNaN(otherLat) || isNaN(otherLon)) return null
        
        const distance = calculateDistance(parkLat, parkLon, otherLat, otherLon)
        
        if (distance <= radius) {
          return {
            name: park.Name,
            distance: distance,
            lat: otherLat,
            lon: otherLon
          }
        }
        return null
      } catch (error) {
        return null
      }
    })
    .filter(Boolean)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 5) // Top 5 closest
}

/**
 * Categorize parks by region
 */
export const categorizeParksByRegion = (parks) => {
  const westStates = ['CA', 'OR', 'WA', 'NV', 'ID', 'MT', 'WY', 'UT', 'CO', 'AZ', 'NM']
  const midwestStates = ['ND', 'SD', 'NE', 'KS', 'MN', 'IA', 'MO', 'WI', 'IL', 'MI', 'IN', 'OH']
  const southStates = ['TX', 'OK', 'AR', 'LA', 'MS', 'AL', 'TN', 'KY', 'WV', 'VA', 'NC', 'SC', 'GA', 'FL']
  const northeastStates = ['ME', 'NH', 'VT', 'MA', 'RI', 'CT', 'NY', 'NJ', 'PA', 'MD', 'DE']
  
  const regions = {
    West: [],
    Midwest: [],
    South: [],
    Northeast: [],
    Alaska: [],
    Hawaii: [],
    Canada: [],
    'India-Parks': [],
    'India-UNESCO': [],
    'India-Jyotirlinga': [],
    'India-ShaktiPeetha': [],
    'India-OtherTemples': [],
    'India-Mutts': [],
    'India-DivyaDesam': [],
    'India-Forts': [],
    'Nepal-Parks': [],
    'Nepal-Temples': [],
    'Nepal-UNESCO': [],
    'Nepal-TrekkingFlights': [],
    'Sri Lanka-Parks': [],
    'Sri Lanka-Temples': [],
    'Sri Lanka-UNESCO': [],
    'Costa Rica': [],
    'SouthEastAsia-UNESCO': [],
    'EastAsia-UNESCO': [],
    'SouthAsia-UNESCO': []
  }
  
  parks.forEach(park => {
    const country = park.Country || 'United States'
    const states = (park.States || '').split(',').map(s => s.trim())
    
    // Check for Shakti Peethas first (they can be in India or Sri Lanka)
    // All 18 Ashtadasha Maha Shakti Peethas should be under India-ShaktiPeetha
    if (park.IndiaCategory === 'ShaktiPeetha') {
      regions['India-ShaktiPeetha'].push(park)
    } else if (country === 'Canada') {
      regions.Canada.push(park)
    } else if (country === 'India') {
      // Separate India parks, UNESCO sites, Jyotirlinga temples, Shakti Peethas, Major Temples, Mutts, Divya Desams, and Forts
      if (park.IndiaCategory === 'UNESCO') {
        regions['India-UNESCO'].push(park)
      } else if (park.IndiaCategory === 'Jyotirlinga') {
        regions['India-Jyotirlinga'].push(park)
      } else if (park.IndiaCategory === 'ShaktiPeetha') {
        regions['India-ShaktiPeetha'].push(park)
      } else if (park.IndiaCategory === 'OtherTemples') {
        regions['India-OtherTemples'].push(park)
      } else if (park.IndiaCategory === 'Mutts') {
        regions['India-Mutts'].push(park)
      } else if (park.IndiaCategory === 'DivyaDesam') {
        regions['India-DivyaDesam'].push(park)
      } else if (park.IndiaCategory === 'Forts') {
        regions['India-Forts'].push(park)
      } else {
        regions['India-Parks'].push(park)
      }
    } else if (country === 'Nepal') {
      // Separate Nepal parks, temples, UNESCO sites, and trekking/flights
      if (park.NepalCategory === 'UNESCO') {
        regions['Nepal-UNESCO'].push(park)
      } else if (park.NepalCategory === 'Temples') {
        regions['Nepal-Temples'].push(park)
      } else if (park.NepalCategory === 'TrekkingFlights') {
        regions['Nepal-TrekkingFlights'].push(park)
      } else {
        regions['Nepal-Parks'].push(park)
      }
    } else if (country === 'Sri Lanka') {
      // Separate Sri Lanka parks, temples, and UNESCO sites
      if (park.SriLankaCategory === 'UNESCO') {
        regions['Sri Lanka-UNESCO'].push(park)
      } else if (park.SriLankaCategory === 'Temples') {
        regions['Sri Lanka-Temples'].push(park)
      } else {
        regions['Sri Lanka-Parks'].push(park)
      }
    } else if (country === 'Costa Rica') {
      regions['Costa Rica'].push(park)
    } else if (['Thailand', 'Indonesia', 'Vietnam', 'Cambodia', 'Myanmar', 'Philippines', 'Malaysia', 'Singapore', 'Laos', 'Brunei', 'East Timor'].includes(country)) {
      // South East Asian countries
      regions['SouthEastAsia-UNESCO'].push(park)
    } else if (['China', 'Japan', 'South Korea', 'North Korea', 'Mongolia'].includes(country)) {
      // East Asian countries
      regions['EastAsia-UNESCO'].push(park)
    } else if (['Bangladesh', 'Pakistan', 'Afghanistan', 'Bhutan', 'Maldives', 'Nepal', 'Sri Lanka'].includes(country)) {
      // South Asian countries (Nepal and Sri Lanka are now included here, but also kept in their specific sub-regions)
      // Note: Nepal and Sri Lanka parks are also added to their specific sub-regions above
      if (country === 'Nepal' || country === 'Sri Lanka') {
        // These are already handled above in their specific sub-regions, but we also add to SouthAsia for grouping
        regions['SouthAsia-UNESCO'].push(park)
      } else {
        regions['SouthAsia-UNESCO'].push(park)
      }
    } else {
      if (states.includes('AK')) {
        regions.Alaska.push(park)
      } else if (states.includes('HI')) {
        regions.Hawaii.push(park)
      } else if (states.some(s => westStates.includes(s))) {
        regions.West.push(park)
      } else if (states.some(s => midwestStates.includes(s))) {
        regions.Midwest.push(park)
      } else if (states.some(s => southStates.includes(s))) {
        regions.South.push(park)
      } else if (states.some(s => northeastStates.includes(s))) {
        regions.Northeast.push(park)
      }
    }
  })
  
  return regions
}

