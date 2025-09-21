import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

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
    // Build Supabase query
    let supabaseQuery = supabase
      .from('shelters')
      .select('id, name, description, type, isFree, capacity, isServiced, accessibility, amenities, latitude, longitude, elevation')
      .not('latitude', 'is', null)
      .not('longitude', 'is', null)
      .order('name', { ascending: true })

    // Full-text search on name and description
    if (query.trim()) {
      supabaseQuery = supabaseQuery.or(`name.ilike.%${query}%, description.ilike.%${query}%`)
    }

    // Type filter
    if (type) {
      supabaseQuery = supabaseQuery.eq('type', type)
    }

    // Free/Paid filter
    if (isFree !== null) {
      supabaseQuery = supabaseQuery.eq('isFree', isFree === 'true')
    }

    // Minimum capacity filter
    if (minCapacity) {
      const capacity = parseInt(minCapacity)
      if (!isNaN(capacity)) {
        supabaseQuery = supabaseQuery.gte('capacity', capacity)
      }
    }

    // Serviced filter
    if (isServiced !== null) {
      supabaseQuery = supabaseQuery.eq('isServiced', isServiced === 'true')
    }

    // Accessibility filter - shelter must have ALL specified accessibility options
    if (accessibility.length > 0) {
      supabaseQuery = supabaseQuery.contains('accessibility', accessibility)
    }

    // Amenities filter - shelter must have ALL specified amenities
    if (amenities.length > 0) {
      supabaseQuery = supabaseQuery.contains('amenities', amenities)
    }

    // Execute query
    const { data: shelters, error } = await supabaseQuery

    if (error) {
      console.error('Supabase search error:', error)
      return NextResponse.json(
        { error: 'Failed to search shelters' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      shelters: shelters || [],
      count: shelters?.length || 0,
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