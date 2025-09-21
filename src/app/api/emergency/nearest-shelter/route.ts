import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { calculateDistance } from '@/lib/emergency-utils'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const lat = searchParams.get('lat')
    const lng = searchParams.get('lng')

    if (!lat || !lng) {
      return NextResponse.json(
        { error: 'Latitude and longitude are required' },
        { status: 400 }
      )
    }

    const userLat = parseFloat(lat)
    const userLng = parseFloat(lng)

    if (isNaN(userLat) || isNaN(userLng)) {
      return NextResponse.json(
        { error: 'Invalid latitude or longitude' },
        { status: 400 }
      )
    }

    // Validate coordinate ranges
    if (userLat < -90 || userLat > 90 || userLng < -180 || userLng > 180) {
      return NextResponse.json(
        { error: 'Coordinates out of valid range' },
        { status: 400 }
      )
    }

    // Get all shelters with coordinates
    const { data: shelters, error } = await supabase
      .from('shelters')
      .select('id, name, description, type, latitude, longitude, elevation, capacity, isFree, isServiced, accessibility, amenities')
      .not('latitude', 'is', null)
      .not('longitude', 'is', null)

    if (error) {
      console.error('Error fetching shelters:', error)
      return NextResponse.json(
        { error: 'Failed to fetch shelters' },
        { status: 500 }
      )
    }

    if (!shelters || shelters.length === 0) {
      return NextResponse.json(
        { error: 'No shelters with coordinates found' },
        { status: 404 }
      )
    }

    // Calculate distances and find nearest
    let nearestShelter = null
    let minDistance = Infinity

    for (const shelter of shelters) {
      if (shelter.latitude && shelter.longitude) {
        const distance = calculateDistance(
          userLat,
          userLng,
          shelter.latitude,
          shelter.longitude
        )

        if (distance < minDistance) {
          minDistance = distance
          nearestShelter = {
            ...shelter,
            distance
          }
        }
      }
    }

    if (!nearestShelter) {
      return NextResponse.json(
        { error: 'No nearest shelter found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      userLocation: { latitude: userLat, longitude: userLng },
      nearestShelter,
      distance: minDistance
    })

  } catch (error) {
    console.error('Error finding nearest shelter:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}