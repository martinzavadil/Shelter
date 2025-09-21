import { prisma } from '@/lib/prisma'
import { Map } from '@/components/map/map-wrapper'

async function getShelters() {
  try {
    const shelters = await prisma.shelter.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        type: true,
        isFree: true,
        capacity: true,
        isServiced: true,
        accessibility: true,
        amenities: true,
        latitude: true,
        longitude: true,
        elevation: true,
      },
      where: {
        AND: [
          { latitude: { not: null } },
          { longitude: { not: null } },
        ],
      },
    })
    return shelters
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