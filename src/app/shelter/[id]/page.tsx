import { notFound } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ShelterDetailClient } from '@/components/shelter/shelter-detail-client'
import { ArrowLeft, MapPin, Users, Mountain } from 'lucide-react'

async function getShelter(id: string) {
  try {
    const { data: shelter, error } = await supabase
      .from('shelters')
      .select(`
        *,
        reviews (
          id,
          rating,
          comment,
          createdAt
        ),
        photos (
          id,
          url,
          filename,
          createdAt
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching shelter:', error)
      return null
    }

    // Sort reviews and photos by createdAt desc and take only first 5
    if (shelter.reviews) {
      shelter.reviews = shelter.reviews
        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5)
    }

    if (shelter.photos) {
      shelter.photos = shelter.photos
        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5)
    }

    return shelter
  } catch (error) {
    console.error('Error fetching shelter:', error)
    return null
  }
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ShelterDetailPage({ params }: PageProps) {
  const { id } = await params
  const shelter = await getShelter(id)

  if (!shelter) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button variant="ghost" asChild>
          <Link href="/map">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Map
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{shelter.name}</CardTitle>
              <CardDescription className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {shelter.latitude && shelter.longitude && (
                  <span>
                    {shelter.latitude.toFixed(4)}, {shelter.longitude.toFixed(4)}
                  </span>
                )}
                {shelter.elevation && (
                  <>
                    <Mountain className="h-4 w-4 ml-2" />
                    <span>{shelter.elevation}m elevation</span>
                  </>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {shelter.description && (
                <div className="mb-6">
                  <h4 className="font-semibold mb-2">Description</h4>
                  <p className="text-sm text-muted-foreground">{shelter.description}</p>
                </div>
              )}

              {shelter.photos.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold mb-3">Photos</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {shelter.photos.map((photo) => (
                      <div key={photo.id} className="aspect-square relative overflow-hidden rounded-lg">
                        <img
                          src={photo.url}
                          alt={`Photo of ${shelter.name}`}
                          className="object-cover w-full h-full"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="font-semibold mb-2">Basic Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Type:</span>
                      <span className="capitalize">{shelter.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Cost:</span>
                      <span className={shelter.isFree ? 'text-green-600' : 'text-orange-600'}>
                        {shelter.isFree ? 'Free' : 'Paid'}
                      </span>
                    </div>
                    {shelter.capacity && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Capacity:</span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {shelter.capacity}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Serviced:</span>
                      <span>{shelter.isServiced ? 'Yes' : 'No'}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Access & Amenities</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Access:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {shelter.accessibility.map((access) => (
                          <span
                            key={access}
                            className="px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-xs capitalize"
                          >
                            {access}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Amenities:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {shelter.amenities.map((amenity) => (
                          <span
                            key={amenity}
                            className="px-2 py-1 bg-primary/10 text-primary rounded-md text-xs capitalize"
                          >
                            {amenity}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {shelter.reviews.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-semibold mb-3">Recent Reviews</h4>
                  <div className="space-y-3">
                    {shelter.reviews.map((review) => (
                      <div key={review.id} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <span
                                key={i}
                                className={`text-sm ${
                                  i < review.rating ? 'text-yellow-500' : 'text-gray-300'
                                }`}
                              >
                                ★
                              </span>
                            ))}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        {review.comment && (
                          <p className="text-sm text-muted-foreground">{review.comment}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <ShelterDetailClient
            shelterId={shelter.id}
            initialPhotoCount={shelter.photos.length}
          />
        </div>
      </div>
    </div>
  )
}