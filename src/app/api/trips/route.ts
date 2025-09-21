import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

// GET /api/trips - Get user's trips
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: trips, error } = await supabase
      .from('trips')
      .select('id, name, shelterIds, estimatedDays, createdAt')
      .eq('userId', session.user.id)
      .order('createdAt', { ascending: false })

    if (error) {
      console.error('Error fetching trips:', error)
      return NextResponse.json(
        { error: 'Failed to fetch trips' },
        { status: 500 }
      )
    }

    return NextResponse.json({ trips: trips || [] })
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
    const { data: existingShelters, error: shelterError } = await supabase
      .from('shelters')
      .select('id')
      .in('id', shelterIds)

    if (shelterError) {
      console.error('Error validating shelters:', shelterError)
      return NextResponse.json(
        { error: 'Failed to validate shelters' },
        { status: 500 }
      )
    }

    if (!existingShelters || existingShelters.length !== shelterIds.length) {
      return NextResponse.json(
        { error: 'One or more shelters not found' },
        { status: 404 }
      )
    }

    // Create trip
    const { data: trip, error: tripError } = await supabase
      .from('trips')
      .insert({
        userId: session.user.id,
        name: name.trim(),
        shelterIds,
        estimatedDays: estimatedDays || null
      })
      .select()
      .single()

    if (tripError) {
      console.error('Error creating trip:', tripError)
      return NextResponse.json(
        { error: 'Failed to create trip' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, trip })
  } catch (error) {
    console.error('Error creating trip:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}