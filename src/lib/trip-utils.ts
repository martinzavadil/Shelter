// Haversine formula for distance calculation between two points
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

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180)
}

// Time estimation with elevation penalty
export function estimateHikingTime(
  distanceKm: number,
  elevationGainM: number,
  baseSpeedKmh: number = 4
): number {
  // Base time from distance
  const baseTimeHours = distanceKm / baseSpeedKmh

  // Elevation penalty: +30 minutes per 300m gain
  const elevationPenaltyHours = Math.max(0, elevationGainM) / 300 * 0.5

  return baseTimeHours + elevationPenaltyHours
}

// Calculate elevation gain between two points
export function calculateElevationGain(elevation1: number, elevation2: number): number {
  return Math.max(0, elevation2 - elevation1)
}

// Format time for display
export function formatTime(hours: number): string {
  const h = Math.floor(hours)
  const m = Math.round((hours - h) * 60)

  if (h === 0) {
    return `${m}min`
  } else if (m === 0) {
    return `${h}h`
  } else {
    return `${h}h ${m}min`
  }
}

// Stage interface
export interface Stage {
  id: string
  day: number
  from: {
    id: string
    name: string
    latitude: number
    longitude: number
    elevation: number | null
  }
  to: {
    id: string
    name: string
    latitude: number
    longitude: number
    elevation: number | null
  }
  distance: number // km
  elevationGain: number // m
  estimatedTime: number // hours
}

// Trip calculation
export function calculateTripStages(
  shelters: Array<{
    id: string
    name: string
    latitude: number | null
    longitude: number | null
    elevation: number | null
  }>,
  maxDailyHours: number = 8
): Stage[] {
  if (shelters.length < 2) return []

  const stages: Stage[] = []
  let currentDay = 1
  let dailyTimeAccumulator = 0

  for (let i = 0; i < shelters.length - 1; i++) {
    const from = shelters[i]
    const to = shelters[i + 1]

    // Skip if missing coordinates
    if (!from.latitude || !from.longitude || !to.latitude || !to.longitude) {
      continue
    }

    const distance = calculateDistance(
      from.latitude,
      from.longitude,
      to.latitude,
      to.longitude
    )

    const elevationGain = calculateElevationGain(
      from.elevation || 0,
      to.elevation || 0
    )

    const estimatedTime = estimateHikingTime(distance, elevationGain)

    // Check if this stage would exceed daily limit
    if (dailyTimeAccumulator + estimatedTime > maxDailyHours && stages.length > 0) {
      currentDay++
      dailyTimeAccumulator = 0
    }

    const stage: Stage = {
      id: `${from.id}-${to.id}`,
      day: currentDay,
      from: {
        id: from.id,
        name: from.name,
        latitude: from.latitude,
        longitude: from.longitude,
        elevation: from.elevation
      },
      to: {
        id: to.id,
        name: to.name,
        latitude: to.latitude,
        longitude: to.longitude,
        elevation: to.elevation
      },
      distance,
      elevationGain,
      estimatedTime
    }

    stages.push(stage)
    dailyTimeAccumulator += estimatedTime
  }

  return stages
}

// Trip summary calculation
export function calculateTripSummary(stages: Stage[]) {
  const totalDistance = stages.reduce((sum, stage) => sum + stage.distance, 0)
  const totalElevationGain = stages.reduce((sum, stage) => sum + stage.elevationGain, 0)
  const totalTime = stages.reduce((sum, stage) => sum + stage.estimatedTime, 0)
  const totalDays = stages.length > 0 ? Math.max(...stages.map(s => s.day)) : 0

  return {
    totalDistance: Math.round(totalDistance * 10) / 10, // Round to 1 decimal
    totalElevationGain: Math.round(totalElevationGain),
    totalTime: Math.round(totalTime * 10) / 10,
    totalDays,
    stages: stages.length
  }
}