import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user exists in database
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('id', session.user.id)
      .single()

    if (userError || !user) {
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
    const { data: shelter, error: shelterError } = await supabase
      .from('shelters')
      .select('id')
      .eq('id', shelterId)
      .single()

    if (shelterError || !shelter) {
      return NextResponse.json({ error: 'Shelter not found' }, { status: 404 })
    }

    // Check if already in list
    const { data: existingEntry } = await supabase
      .from('shelter_lists')
      .select('id')
      .eq('userId', session.user.id)
      .eq('shelterId', shelterId)
      .eq('listType', listType)
      .single()

    if (existingEntry) {
      return NextResponse.json(
        { error: `Shelter already in ${listType}` },
        { status: 400 }
      )
    }

    // Add to list
    const { data: shelterList, error: insertError } = await supabase
      .from('shelter_lists')
      .insert({
        userId: session.user.id,
        shelterId,
        listType,
      })
      .select(`
        *,
        shelter:shelters(
          id,
          name,
          type,
          latitude,
          longitude,
          elevation,
          isFree,
          capacity
        )
      `)
      .single()

    if (insertError) {
      return NextResponse.json(
        { error: 'Failed to add to list' },
        { status: 500 }
      )
    }

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
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('id', session.user.id)
      .single()

    if (userError || !user) {
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
    const { error: deleteError } = await supabase
      .from('shelter_lists')
      .delete()
      .eq('userId', session.user.id)
      .eq('shelterId', shelterId)
      .eq('listType', listType)

    if (deleteError) {
      return NextResponse.json(
        { error: `Failed to remove from ${listType}` },
        { status: 500 }
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
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('id', session.user.id)
      .single()

    if (userError || !user) {
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

    let query = supabase
      .from('shelter_lists')
      .select(`
        *,
        shelter:shelters(
          id,
          name,
          description,
          type,
          latitude,
          longitude,
          elevation,
          isFree,
          capacity,
          isServiced,
          amenities,
          photos(url),
          reviews(id)
        )
      `)
      .eq('userId', session.user.id)
      .order('createdAt', { ascending: false })

    if (listType && ['wishlist', 'visited'].includes(listType)) {
      query = query.eq('listType', listType)
    }

    const { data: shelterLists, error: listsError } = await query

    if (listsError) {
      return NextResponse.json(
        { error: 'Failed to fetch shelter lists' },
        { status: 500 }
      )
    }

    // Transform data to match previous format
    const transformedLists = shelterLists?.map(item => ({
      ...item,
      shelter: {
        ...item.shelter,
        photos: item.shelter?.photos?.slice(0, 1) || [],
        _count: {
          reviews: item.shelter?.reviews?.length || 0
        }
      }
    })) || []

    // Group by listType for easier frontend consumption
    const groupedLists = {
      wishlist: transformedLists.filter(item => item.listType === 'wishlist'),
      visited: transformedLists.filter(item => item.listType === 'visited'),
    }

    return NextResponse.json(listType ? transformedLists : groupedLists)
  } catch (error) {
    console.error('Error fetching shelter lists:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}