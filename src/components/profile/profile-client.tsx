'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MapPin, Users, Mountain, Heart, Check, ExternalLink } from 'lucide-react'

interface Shelter {
  id: string
  name: string
  description: string | null
  type: string
  isFree: boolean
  capacity: number | null
  isServiced: boolean
  accessibility: string[]
  amenities: string[]
  latitude: number | null
  longitude: number | null
  elevation: number | null
  photos: { url: string }[]
  _count: { reviews: number }
}

interface ShelterListItem {
  id: string
  shelterId: string
  listType: string
  createdAt: string
  shelter: Shelter
}

export function ProfileClient() {
  const { data: session, status } = useSession()
  const [shelterLists, setShelterLists] = useState<{
    wishlist: ShelterListItem[]
    visited: ShelterListItem[]
  }>({
    wishlist: [],
    visited: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session?.user?.id) {
      fetchShelterLists()
    } else if (status !== 'loading') {
      setLoading(false)
    }
  }, [session?.user?.id, status])

  const fetchShelterLists = async () => {
    try {
      const response = await fetch('/api/shelter-lists')
      if (response.ok) {
        const data = await response.json()
        setShelterLists(data)
      }
    } catch (error) {
      console.error('Error fetching shelter lists:', error)
    } finally {
      setLoading(false)
    }
  }

  const removeFromList = async (shelterId: string, listType: string) => {
    try {
      const response = await fetch(
        `/api/shelter-lists?shelterId=${shelterId}&listType=${listType}`,
        { method: 'DELETE' }
      )

      if (response.ok) {
        // Refresh the lists
        fetchShelterLists()
      }
    } catch (error) {
      console.error('Error removing from list:', error)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading profile...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!session?.user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-4">Please Sign In</h1>
          <p className="text-muted-foreground mb-6">
            You need to be signed in to view your profile and shelter lists.
          </p>
          <Button asChild>
            <Link href="/api/auth/signin">Sign In</Link>
          </Button>
        </div>
      </div>
    )
  }

  const renderShelterCard = (item: ShelterListItem, listType: string) => (
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

        <div className="flex gap-2">
          <Button asChild className="flex-1" variant="outline">
            <Link href={`/shelter/${item.shelter.id}`}>
              <ExternalLink className="h-4 w-4 mr-2" />
              View Details
            </Link>
          </Button>
          <Button
            variant="outline"
            onClick={() => removeFromList(item.shelterId, listType)}
            className="px-3"
          >
            Remove
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Your Profile</h1>
        <p className="text-muted-foreground">
          Welcome back, {session.user.name || session.user.email}!
        </p>
      </div>

      <Tabs defaultValue="wishlist" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="wishlist" className="flex items-center gap-2">
            <Heart className="h-4 w-4" />
            Wishlist ({shelterLists.wishlist.length})
          </TabsTrigger>
          <TabsTrigger value="visited" className="flex items-center gap-2">
            <Check className="h-4 w-4" />
            Visited ({shelterLists.visited.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="wishlist" className="mt-6">
          {shelterLists.wishlist.length === 0 ? (
            <div className="text-center py-12">
              <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No wishlist items yet</h3>
              <p className="text-muted-foreground mb-4">
                Start adding shelters to your wishlist to see them here.
              </p>
              <Button asChild>
                <Link href="/discover">Discover Shelters</Link>
              </Button>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {shelterLists.wishlist.map((item) =>
                renderShelterCard(item, 'wishlist')
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="visited" className="mt-6">
          {shelterLists.visited.length === 0 ? (
            <div className="text-center py-12">
              <Check className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No visited shelters yet</h3>
              <p className="text-muted-foreground mb-4">
                Mark shelters as visited to track your adventures.
              </p>
              <Button asChild>
                <Link href="/map">Explore Map</Link>
              </Button>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {shelterLists.visited.map((item) =>
                renderShelterCard(item, 'visited')
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}