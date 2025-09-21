import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/trips - Get user's trips
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const trips = await prisma.trip.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        shelterIds: true,
        estimatedDays: true,
        createdAt: true
      }
    })

    return NextResponse.json({ trips })
  } catch (error) {
    console.error('Error fetching trips:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/trips - Create new trip
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, shelterIds, estimatedDays } = await request.json()

    // Validate input
    if (!name || !shelterIds || !Array.isArray(shelterIds) || shelterIds.length < 2) {
      return NextResponse.json(
        { error: 'Trip name and at least 2 shelter IDs are required' },
        { status: 400 }
      )
    }

    // Validate that all shelters exist
    const existingShelters = await prisma.shelter.findMany({
      where: { id: { in: shelterIds } },
      select: { id: true }
    })

    if (existingShelters.length !== shelterIds.length) {
      return NextResponse.json(
        { error: 'One or more shelters not found' },
        { status: 404 }
      )
    }

    // Create trip
    const trip = await prisma.trip.create({
      data: {
        userId: session.user.id,
        name: name.trim(),
        shelterIds,
        estimatedDays: estimatedDays || null
      }
    })

    return NextResponse.json({ success: true, trip })
  } catch (error) {
    console.error('Error creating trip:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}