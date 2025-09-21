import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST() {
  try {
    // Update Clubco Vlněna Brno GPS coordinates
    const { data, error } = await supabase
      .from('shelters')
      .update({
        latitude: 49.18987354023911,
        longitude: 16.61736713796561,
        updatedAt: new Date().toISOString()
      })
      .eq('id', 'clubco_vlnena_brno')
      .select()

    if (error) {
      console.error('Error updating Clubco GPS:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ error: 'Shelter not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: 'GPS coordinates updated successfully',
      data: data[0],
      oldCoordinates: { latitude: 49.1908, longitude: 16.6136 },
      newCoordinates: { latitude: 49.18987354023911, longitude: 16.61736713796561 }
    })
  } catch (error) {
    console.error('Error updating Clubco GPS:', error)
    return NextResponse.json(
      { error: 'Failed to update GPS coordinates' },
      { status: 500 }
    )
  }
}