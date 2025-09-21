'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { MapPin, Users, Mountain, Heart, Check, Loader } from 'lucide-react'
import { ShelterActions } from '@/components/shelter/shelter-actions'

interface ShelterListItem {
  id: string
  listType: string
  createdAt: string
  shelter: {
    id: string
    name: string
    description: string | null
    type: string
    latitude: number | null
    longitude: number | null
    elevation: number | null
    isFree: boolean
    capacity: number | null
    isServiced: boolean
    amenities: string[]
    photos: { url: string }[]
    _count: { reviews: number }
  }
}

interface ListsData {
  wishlist: ShelterListItem[]
  visited: ShelterListItem[]
}

export function MyListsClient() {
  const { data: session, status } = useSession()
  const [lists, setLists] = useState<ListsData>({ wishlist: [], visited: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session?.user?.id) {
      fetchLists()
    } else if (status !== 'loading') {
      setLoading(false)
    }
  }, [session?.user?.id, status])

  const fetchLists = async () => {
    try {
      const response = await fetch('/api/shelter-lists')
      if (response.ok) {
        const data = await response.json()
        setLists(data)
      }
    } catch (error) {
      console.error('Error fetching lists:', error)
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading your lists...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!session?.user?.id) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Please log in</h3>
          <p className="text-muted-foreground mb-4">
            You need to be logged in to view your wishlist and visited shelters.
          </p>
          <Button asChild>
            <Link href="/login">Sign In</Link>
          </Button>
        </div>
      </div>
    )
  }

  const ShelterGrid = ({ items, emptyIcon, emptyTitle, emptyDescription }: {
    items: ShelterListItem[]
    emptyIcon: React.ReactNode
    emptyTitle: string
    emptyDescription: string
  }) => (
    <>
      {items.length === 0 ? (
        <div className="text-center py-12">
          {emptyIcon}
          <h3 className="text-lg font-semibold mb-2">{emptyTitle}</h3>
          <p className="text-muted-foreground mb-4">{emptyDescription}</p>
          <Button asChild>
            <Link href="/discover">Discover Shelters</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <Card key={item.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                {item.shelter.photos[0] && (
                  <div className="aspect-video relative overflow-hidden rounded-lg mb-3">
                    <img
                      src={item.shelter.photos[0].url}
                      alt={`Photo of ${item.shelter.name}`}
                      className="object-cover w-full h-full"
                    />
                  </div>
                )}
                <CardTitle className="text-lg">{item.shelter.name}</CardTitle>
                <CardDescription className="flex items-center gap-2">
                  <MapPin className="h-3 w-3" />
                  <span className="capitalize">{item.shelter.type}</span>
                  {item.shelter.elevation && (
                    <>
                      <Mountain className="h-3 w-3 ml-2" />
                      <span>{item.shelter.elevation}m</span>
                    </>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                {item.shelter.description && (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {item.shelter.description}
                  </p>
                )}

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4 text-sm">
                    {item.shelter.capacity && (
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        <span>{item.shelter.capacity}</span>
                      </div>
                    )}
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      item.shelter.isFree
                        ? 'bg-green-100 text-green-800'
                        : 'bg-orange-100 text-orange-800'
                    }`}>
                      {item.shelter.isFree ? 'Free' : 'Paid'}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {item.shelter._count.reviews} reviews
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  {item.shelter.amenities.length > 0 && (
                    <div>
                      <div className="flex flex-wrap gap-1">
                        {item.shelter.amenities.slice(0, 3).map((amenity) => (
                          <span
                            key={amenity}
                            className="px-2 py-1 bg-primary/10 text-primary rounded text-xs capitalize"
                          >
                            {amenity}
                          </span>
                        ))}
                        {item.shelter.amenities.length > 3 && (
                          <span className="px-2 py-1 bg-muted text-muted-foreground rounded text-xs">
                            +{item.shelter.amenities.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="text-xs text-muted-foreground mb-3">
                  Added on {new Date(item.createdAt).toLocaleDateString()}
                </div>

                <div className="space-y-3">
                  <ShelterActions shelterId={item.shelter.id} className="w-full" />
                  <Button asChild className="w-full" variant="outline">
                    <Link href={`/shelter/${item.shelter.id}`}>
                      View Details
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  )

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">My Shelter Lists</h1>
        <p className="text-muted-foreground text-lg">
          Keep track of shelters you want to visit and places you've already been.
        </p>
      </div>

      <Tabs defaultValue="wishlist" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="wishlist" className="flex items-center gap-2">
            <Heart className="h-4 w-4" />
            Wishlist ({lists.wishlist.length})
          </TabsTrigger>
          <TabsTrigger value="visited" className="flex items-center gap-2">
            <Check className="h-4 w-4" />
            Visited ({lists.visited.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="wishlist" className="mt-6">
          <ShelterGrid
            items={lists.wishlist}
            emptyIcon={<Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />}
            emptyTitle="Your wishlist is empty"
            emptyDescription="Start adding shelters you'd like to visit to your wishlist."
          />
        </TabsContent>

        <TabsContent value="visited" className="mt-6">
          <ShelterGrid
            items={lists.visited}
            emptyIcon={<Check className="h-12 w-12 text-muted-foreground mx-auto mb-4" />}
            emptyTitle="No visited shelters yet"
            emptyDescription="Mark shelters as visited when you've been there."
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}