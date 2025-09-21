import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    // Get shelters with photos and review counts
    const { data: shelters, error } = await supabase
      .from('shelters')
      .select(`
        id,
        name,
        description,
        type,
        isFree,
        capacity,
        isServiced,
        accessibility,
        amenities,
        latitude,
        longitude,
        elevation,
        photos(url),
        reviews(id)
      `)
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching shelters:', error)
      return NextResponse.json({ error: 'Failed to fetch shelters' }, { status: 500 })
    }

    // Transform data to match previous format
    const transformedShelters = shelters?.map(shelter => ({
      ...shelter,
      photos: shelter.photos?.slice(0, 1) || [],
      _count: {
        reviews: shelter.reviews?.length || 0
      }
    })) || []

    return NextResponse.json(transformedShelters)
  } catch (error) {
    console.error('Error fetching shelters:', error)
    return NextResponse.json({ error: 'Failed to fetch shelters' }, { status: 500 })
  }
}