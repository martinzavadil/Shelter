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

    const { shelterId, rating, comment } = await request.json()

    // Validate input
    if (!shelterId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Shelter ID and rating (1-5) are required' },
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

    // Check if user already reviewed this shelter
    const existingReview = await prisma.review.findFirst({
      where: {
        shelterId,
        userId: session.user.id,
      },
    })

    if (existingReview) {
      return NextResponse.json(
        { error: 'You have already reviewed this shelter' },
        { status: 400 }
      )
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        shelterId,
        userId: session.user.id,
        rating,
        comment: comment || null,
      },
    })

    return NextResponse.json({ success: true, review })
  } catch (error) {
    console.error('Error creating review:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}