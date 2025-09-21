import { supabase } from '@/lib/supabase'
import { TripBuilderClient } from '@/components/trip/trip-builder-client'

async function getShelters() {
  try {
    const { data: shelters, error } = await supabase
      .from('shelters')
      .select('*')
      .not('latitude', 'is', null)
      .not('longitude', 'is', null)
      .order('name', { ascending: true })

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

export default async function TripBuilderPage() {
  const shelters = await getShelters()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Trip Builder</h1>
        <p className="text-muted-foreground">
          Plan your mountain adventure by selecting shelters and estimating daily stages
        </p>
      </div>

      <TripBuilderClient initialShelters={shelters} />
    </div>
  )
}