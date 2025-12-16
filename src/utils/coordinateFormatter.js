/**
 * Format coordinates with correct direction indicators
 * @param {number} lat - Latitude (-90 to 90)
 * @param {number} lon - Longitude (-180 to 180)
 * @param {number} precision - Number of decimal places (default: 4)
 * @returns {string} Formatted coordinate string
 */
export const formatCoordinates = (lat, lon, precision = 4) => {
  const latDir = lat >= 0 ? 'N' : 'S'
  const lonDir = lon >= 0 ? 'E' : 'W'
  const latAbs = Math.abs(lat)
  const lonAbs = Math.abs(lon)
  
  return `${latAbs.toFixed(precision)}°${latDir}, ${lonAbs.toFixed(precision)}°${lonDir}`
}

