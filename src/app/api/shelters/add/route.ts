import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const shelterData = await request.json()

    const newShelter = await prisma.shelter.create({
      data: {
        id: shelterData.id,
        name: shelterData.name,
        description: shelterData.description,
        type: shelterData.type,
        latitude: shelterData.latitude,
        longitude: shelterData.longitude,
        elevation: shelterData.elevation,
        capacity: shelterData.capacity,
        isFree: shelterData.is_free,
        isServiced: shelterData.is_serviced,
        accessibility: shelterData.accessibility || [],
        amenities: shelterData.amenities || [],
        // Additional fields can be added here as needed
      }
    })

    return NextResponse.json({ success: true, shelter: newShelter })
  } catch (error) {
    console.error('Error adding shelter:', error)
    return NextResponse.json(
      { error: 'Failed to add shelter' },
      { status: 500 }
    )
  }
}