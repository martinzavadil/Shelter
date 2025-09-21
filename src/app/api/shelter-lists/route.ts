import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user exists in database
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found. Please log in again.' },
        { status: 401 }
      )
    }

    const { shelterId, listType } = await request.json()

    // Validate input
    if (!shelterId || !listType || !['wishlist', 'visited'].includes(listType)) {
      return NextResponse.json(
        { error: 'Shelter ID and listType (wishlist|visited) are required' },
        { status: 400 }
      )
    }

    // Check if shelter exists
    const shelter = await prisma.shelter.findUnique({
      where: { id: shelterId },
    })

    if (!shelter) {
      return NextResponse.json({ error: 'Shelter not found' }, { status: 404 })
    }

    // Check if already in list
    const existingEntry = await prisma.shelterList.findUnique({
      where: {
        userId_shelterId_listType: {
          userId: session.user.id,
          shelterId,
          listType,
        },
      },
    })

    if (existingEntry) {
      return NextResponse.json(
        { error: `Shelter already in ${listType}` },
        { status: 400 }
      )
    }

    // Add to list
    const shelterList = await prisma.shelterList.create({
      data: {
        userId: session.user.id,
        shelterId,
        listType,
      },
      include: {
        shelter: {
          select: {
            id: true,
            name: true,
            type: true,
            latitude: true,
            longitude: true,
            elevation: true,
            isFree: true,
            capacity: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      message: `Added to ${listType}`,
      shelterList
    })
  } catch (error) {
    console.error('Error adding to shelter list:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user exists in database
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found. Please log in again.' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const shelterId = searchParams.get('shelterId')
    const listType = searchParams.get('listType')

    // Validate input
    if (!shelterId || !listType || !['wishlist', 'visited'].includes(listType)) {
      return NextResponse.json(
        { error: 'Shelter ID and listType (wishlist|visited) are required' },
        { status: 400 }
      )
    }

    // Remove from list
    const deletedEntry = await prisma.shelterList.deleteMany({
      where: {
        userId: session.user.id,
        shelterId,
        listType,
      },
    })

    if (deletedEntry.count === 0) {
      return NextResponse.json(
        { error: `Shelter not found in ${listType}` },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Removed from ${listType}`
    })
  } catch (error) {
    console.error('Error removing from shelter list:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user exists in database
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found. Please log in again.' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const listType = searchParams.get('listType')

    // If listType is specified, filter by it
    const whereClause: any = {
      userId: session.user.id,
    }

    if (listType && ['wishlist', 'visited'].includes(listType)) {
      whereClause.listType = listType
    }

    const shelterLists = await prisma.shelterList.findMany({
      where: whereClause,
      include: {
        shelter: {
          select: {
            id: true,
            name: true,
            description: true,
            type: true,
            latitude: true,
            longitude: true,
            elevation: true,
            isFree: true,
            capacity: true,
            isServiced: true,
            amenities: true,
            photos: {
              take: 1,
              orderBy: { createdAt: 'desc' },
              select: { url: true }
            },
            _count: {
              select: { reviews: true }
            }
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Group by listType for easier frontend consumption
    const groupedLists = {
      wishlist: shelterLists.filter(item => item.listType === 'wishlist'),
      visited: shelterLists.filter(item => item.listType === 'visited'),
    }

    return NextResponse.json(listType ? shelterLists : groupedLists)
  } catch (error) {
    console.error('Error fetching shelter lists:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}