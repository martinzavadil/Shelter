import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  // Search parameters
  const query = searchParams.get('q') || ''

  // Filter parameters
  const type = searchParams.get('type') // 'hut' | 'shelter' | null
  const isFree = searchParams.get('isFree') // 'true' | 'false' | null
  const minCapacity = searchParams.get('minCapacity') // number or null
  const isServiced = searchParams.get('isServiced') // 'true' | 'false' | null

  // Array parameters (comma-separated)
  const accessibility = searchParams.get('accessibility')?.split(',').filter(Boolean) || []
  const amenities = searchParams.get('amenities')?.split(',').filter(Boolean) || []

  try {
    // Build WHERE conditions
    const whereConditions: any = {
      AND: [
        { latitude: { not: null } },
        { longitude: { not: null } },
      ],
    }

    // Full-text search on name and description
    if (query.trim()) {
      // Use Postgres full-text search
      whereConditions.AND.push({
        OR: [
          {
            name: {
              contains: query,
              mode: 'insensitive',
            },
          },
          {
            description: {
              contains: query,
              mode: 'insensitive',
            },
          },
        ],
      })
    }

    // Type filter
    if (type) {
      whereConditions.AND.push({ type })
    }

    // Free/Paid filter
    if (isFree !== null) {
      whereConditions.AND.push({ isFree: isFree === 'true' })
    }

    // Minimum capacity filter
    if (minCapacity) {
      const capacity = parseInt(minCapacity)
      if (!isNaN(capacity)) {
        whereConditions.AND.push({
          capacity: { gte: capacity },
        })
      }
    }

    // Serviced filter
    if (isServiced !== null) {
      whereConditions.AND.push({ isServiced: isServiced === 'true' })
    }

    // Accessibility filter - shelter must have ALL specified accessibility options
    if (accessibility.length > 0) {
      whereConditions.AND.push({
        accessibility: {
          hasEvery: accessibility,
        },
      })
    }

    // Amenities filter - shelter must have ALL specified amenities
    if (amenities.length > 0) {
      whereConditions.AND.push({
        amenities: {
          hasEvery: amenities,
        },
      })
    }

    // Execute query
    const shelters = await prisma.shelter.findMany({
      where: whereConditions,
      select: {
        id: true,
        name: true,
        description: true,
        type: true,
        isFree: true,
        capacity: true,
        isServiced: true,
        accessibility: true,
        amenities: true,
        latitude: true,
        longitude: true,
        elevation: true,
      },
      orderBy: [
        { name: 'asc' },
      ],
    })

    return NextResponse.json({
      shelters,
      count: shelters.length,
      query: {
        q: query,
        type,
        isFree,
        minCapacity,
        isServiced,
        accessibility,
        amenities,
      },
    })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: 'Failed to search shelters' },
      { status: 500 }
    )
  }
}