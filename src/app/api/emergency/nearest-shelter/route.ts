import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
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
    const shelters = await prisma.shelter.findMany({
      where: {
        AND: [
          { latitude: { not: null } },
          { longitude: { not: null } }
        ]
      },
      select: {
        id: true,
        name: true,
        description: true,
        type: true,
        latitude: true,
        longitude: true,
        elevation: true,
        capacity: true,
        isFree: true,
        isServiced: true,
        accessibility: true,
        amenities: true
      }
    })

    if (shelters.length === 0) {
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