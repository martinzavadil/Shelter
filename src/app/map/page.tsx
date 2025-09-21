import { supabase } from '@/lib/supabase'
import { Map } from '@/components/map/map-wrapper'

async function getShelters() {
  try {
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
        elevation
      `)
      .not('latitude', 'is', null)
      .not('longitude', 'is', null)

    if (error) {
      console.error('Error fetching shelters:', error)
      return []
    }

    return shelters || []
  } catch (error) {
    console.error('Error fetching shelters:', error)
    return []
  }
}

export default async function MapPage() {
  const shelters = await getShelters()

  return (
    <div className="h-[calc(100vh-4rem)]">
      <Map initialShelters={shelters} />
    </div>
  )
}