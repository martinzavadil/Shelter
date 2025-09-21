// Reuse the Haversine formula from trip utils
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371 // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1)
  const dLon = toRadians(lon2 - lon1)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c // Distance in kilometers
}

// Calculate bearing from point A to point B
export function calculateBearing(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const dLon = toRadians(lon2 - lon1)
  const lat1Rad = toRadians(lat1)
  const lat2Rad = toRadians(lat2)

  const y = Math.sin(dLon) * Math.cos(lat2Rad)
  const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) -
           Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLon)

  const bearingRad = Math.atan2(y, x)
  const bearingDeg = toDegrees(bearingRad)

  // Normalize to 0-360 degrees
  return (bearingDeg + 360) % 360
}

// Convert bearing to compass direction
export function bearingToCompass(bearing: number): string {
  const directions = [
    'N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
    'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'
  ]

  const index = Math.round(bearing / 22.5) % 16
  return directions[index]
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180)
}

function toDegrees(radians: number): number {
  return radians * (180 / Math.PI)
}

// Format distance for display
export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)}m`
  } else if (km < 10) {
    return `${km.toFixed(1)}km`
  } else {
    return `${Math.round(km)}km`
  }
}

// Estimate walking time to shelter (for emergency context)
export function estimateWalkingTime(distanceKm: number): string {
  // Assume 3 km/h for emergency situations (slower than normal hiking)
  const hours = distanceKm / 3

  if (hours < 1) {
    const minutes = Math.round(hours * 60)
    return `${minutes} min`
  } else {
    const h = Math.floor(hours)
    const m = Math.round((hours - h) * 60)
    if (m === 0) {
      return `${h}h`
    } else {
      return `${h}h ${m}min`
    }
  }
}