import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST() {
  try {
    // Add Clubco Vlněna Brno shelter to database
    const now = new Date().toISOString()
    const { data, error } = await supabase
      .from('shelters')
      .insert({
        id: 'clubco_vlnena_brno',
        name: 'Clubco Vlněna Brno',
        description: 'Coworkingové centrum v areálu Vlněna, moderní kancelářské prostory a eventový prostor v Brně.',
        type: 'coworking',
        latitude: 49.1908,
        longitude: 16.6136,
        elevation: 200,
        capacity: 200,
        isFree: false,
        isServiced: true,
        accessibility: ['permissive'],
        amenities: ['drinking_water', 'heating', 'bunks', 'mattress', 'bed', 'toilet', 'shower', 'indoor_seating', 'covered'],
        createdAt: now,
        updatedAt: now
      })
      .select()

    if (error) {
      console.error('Error adding Clubco shelter:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error adding Clubco shelter:', error)
    return NextResponse.json(
      { error: 'Failed to add Clubco shelter' },
      { status: 500 }
    )
  }
}