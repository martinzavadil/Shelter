import { NextRequest, NextResponse } from 'next/server'

interface RouteRequest {
  startLat: number
  startLng: number
  endLat: number
  endLng: number
}

interface OpenRouteServiceResponse {
  features: Array<{
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
    const { startLat, startLng, endLat, endLng }: RouteRequest = await request.json()

    if (!startLat || !startLng || !endLat || !endLng) {
      return NextResponse.json(
        { error: 'Missing required coordinates' },
        { status: 400 }
      )
    }

    const apiKey = process.env.OPENROUTESERVICE_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OpenRouteService API key not configured' },
        { status: 500 }
      )
    }

    // OpenRouteService API request
    const response = await fetch('https://api.openrouteservice.org/v2/directions/foot-walking', {
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
        extra_info: ['surface', 'steepness']
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('OpenRouteService API error:', errorText)
      return NextResponse.json(
        { error: 'Failed to calculate route' },
        { status: response.status }
      )
    }

    const data: OpenRouteServiceResponse = await response.json()

    if (!data.features || data.features.length === 0) {
      return NextResponse.json(
        { error: 'No route found' },
        { status: 404 }
      )
    }

    const route = data.features[0]
    const summary = route.properties.summary
    const steps = route.properties.segments[0]?.steps || []

    // Convert coordinates from [lng, lat] to [lat, lng] for Leaflet
    const coordinates = route.geometry.coordinates.map(coord => [coord[1], coord[0]])

    return NextResponse.json({
      route: {
        coordinates,
        distance: summary.distance, // meters
        duration: summary.duration, // seconds
        steps: steps.map(step => ({
          instruction: step.instruction,
          distance: step.distance,
          duration: step.duration
        }))
      }
    })

  } catch (error) {
    console.error('Route calculation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}