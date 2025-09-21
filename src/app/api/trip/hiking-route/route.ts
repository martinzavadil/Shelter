import { NextRequest, NextResponse } from 'next/server'

// Polyline decoder function for OpenRouteService encoded geometry
function decodePolyline(encoded: string, precision: number = 5): [number, number][] {
  const factor = Math.pow(10, precision)
  const len = encoded.length
  let index = 0
  let lat = 0
  let lng = 0
  const coordinates: [number, number][] = []

  while (index < len) {
    let byte = 0
    let shift = 0
    let result = 0

    do {
      byte = encoded.charCodeAt(index++) - 63
      result |= (byte & 0x1f) << shift
      shift += 5
    } while (byte >= 0x20)

    const deltaLat = ((result & 1) !== 0 ? ~(result >> 1) : (result >> 1))
    lat += deltaLat

    shift = 0
    result = 0

    do {
      byte = encoded.charCodeAt(index++) - 63
      result |= (byte & 0x1f) << shift
      shift += 5
    } while (byte >= 0x20)

    const deltaLng = ((result & 1) !== 0 ? ~(result >> 1) : (result >> 1))
    lng += deltaLng

    coordinates.push([lat / factor, lng / factor])
  }

  return coordinates
}

interface HikingRouteRequest {
  startLat: number
  startLng: number
  endLat: number
  endLng: number
}

interface OpenRouteServiceResponse {
  routes?: Array<{
    geometry?: number[][]
    summary: {
      distance: number
      duration: number
    }
    segments: Array<{
      steps: Array<{
        instruction: string
        distance: number
        duration: number
        way_points?: [number, number]
      }>
    }>
  }>
  features?: Array<{
    geometry: {
      coordinates: number[][]
    }
    properties: {
      summary: {
        distance: number
        duration: number
      }
      segments: Array<{
        steps: Array<{
          instruction: string
          distance: number
          duration: number
        }>
      }>
    }
  }>
}

export async function POST(request: NextRequest) {
  try {
    const { startLat, startLng, endLat, endLng }: HikingRouteRequest = await request.json()
    console.log('Hiking route request:', { startLat, startLng, endLat, endLng })

    if (!startLat || !startLng || !endLat || !endLng) {
      return NextResponse.json(
        { error: 'Missing required coordinates' },
        { status: 400 }
      )
    }

    const apiKey = process.env.OPENROUTESERVICE_API_KEY
    console.log('API key available:', !!apiKey)
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OpenRouteService API key not configured' },
        { status: 500 }
      )
    }

    // Try hiking first, then fallback to walking
    let response: Response
    let routeType = 'hiking'

    try {
      // Try foot-hiking first
      response = await fetch('https://api.openrouteservice.org/v2/directions/foot-hiking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          coordinates: [[startLng, startLat], [endLng, endLat]],
          format: 'geojson',
          instructions: true,
          elevation: true,
          geometry: true,
          geometry_simplify: false,
          extra_info: ['surface', 'steepness', 'waycategory']
        })
      })

      if (!response.ok) {
        throw new Error('Hiking route failed')
      }
    } catch (error) {
      console.log('Hiking route failed, falling back to walking. Error:', error)
      // Fallback to foot-walking
      response = await fetch('https://api.openrouteservice.org/v2/directions/foot-walking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          coordinates: [[startLng, startLat], [endLng, endLat]],
          format: 'geojson',
          instructions: true,
          elevation: true,
          geometry: true,
          geometry_simplify: false
        })
      })
      routeType = 'walking'

      console.log('Walking route response status:', response.status)
      if (!response.ok) {
        const errorText = await response.text()
        console.error('OpenRouteService API error (walking):', errorText)
        return NextResponse.json(
          { error: 'Failed to calculate route' },
          { status: response.status }
        )
      }
    }

    const data: OpenRouteServiceResponse = await response.json()
    console.log('OpenRouteService response structure:', {
      hasRoutes: !!data.routes,
      routesLength: data.routes?.length,
      hasFeatures: !!data.features,
      featuresLength: data.features?.length
    })

    // Detailed logging for geometry structure
    if (data.features && data.features.length > 0) {
      const feature = data.features[0]
      console.log('GeoJSON feature geometry:', {
        type: feature.geometry?.coordinates ? 'has coordinates' : 'no coordinates',
        coordinatesLength: feature.geometry?.coordinates?.length,
        firstCoord: feature.geometry?.coordinates?.[0],
        lastCoord: feature.geometry?.coordinates?.[feature.geometry.coordinates.length - 1]
      })
    }

    if (data.routes && data.routes.length > 0) {
      const route = data.routes[0]
      console.log('Route geometry:', {
        hasGeometry: !!route.geometry,
        geometryType: typeof route.geometry,
        geometryLength: Array.isArray(route.geometry) ? route.geometry.length : 'not array',
        geometryValue: route.geometry
      })
    }

    let route: any, summary: any, steps: any, coordinates: [number, number][]

    // Handle both GeoJSON and standard format
    if (data.features && data.features.length > 0) {
      // GeoJSON format
      const feature = data.features[0]
      route = feature
      summary = feature.properties.summary
      steps = feature.properties.segments[0]?.steps || []
      coordinates = feature.geometry.coordinates.map(coord => [coord[1], coord[0]])
    } else if (data.routes && data.routes.length > 0) {
      // Standard format
      route = data.routes[0]
      summary = route.summary
      steps = route.segments[0]?.steps || []

      if (route.geometry) {
        if (Array.isArray(route.geometry)) {
          // Array format: coordinates
          coordinates = route.geometry.map(coord => [coord[1], coord[0]])
        } else if (typeof route.geometry === 'string') {
          // Encoded polyline string: decode it
          console.log('Decoding polyline geometry...')
          const decodedCoords = decodePolyline(route.geometry)
          coordinates = decodedCoords
          console.log(`Decoded ${decodedCoords.length} coordinate points`)
        } else {
          console.log('Unknown geometry format, using direct line')
          coordinates = [[startLat, startLng], [endLat, endLng]]
        }
      } else {
        console.log('No geometry available, using direct line')
        coordinates = [[startLat, startLng], [endLat, endLng]]
      }
    } else {
      console.log('No routes or features found in response')
      return NextResponse.json(
        { error: 'No hiking route found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      route: {
        coordinates,
        distance: summary.distance, // meters
        duration: summary.duration, // seconds
        steps: steps.map(step => ({
          instruction: step.instruction,
          distance: step.distance,
          duration: step.duration
        })),
        routeType
      }
    })

  } catch (error) {
    console.error('Hiking route calculation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}