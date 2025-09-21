'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MapPin, Users, Mountain, Heart, Filter, SlidersHorizontal } from 'lucide-react'
import { FilterPanel, FilterState } from '@/components/map/filter-panel'
import { ShelterActions } from '@/components/shelter/shelter-actions'

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

export function DiscoverClient() {
  const [shelters, setShelters] = useState<Shelter[]>([])
  const [filteredShelters, setFilteredShelters] = useState<Shelter[]>([])
  const [loading, setLoading] = useState(true)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [filters, setFilters] = useState<FilterState>({
    query: '',
    type: null,
    isFree: null,
    minCapacity: 0,
    isServiced: null,
    accessibility: [],
    amenities: [],
  })

  // Fetch shelters on mount
  useEffect(() => {
    async function fetchShelters() {
      try {
        const response = await fetch('/api/shelters')
        if (response.ok) {
          const data = await response.json()
          setShelters(data)
          setFilteredShelters(data)
        }
      } catch (error) {
        console.error('Error fetching shelters:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchShelters()
  }, [])

  // Apply filters whenever filters change
  useEffect(() => {
    applyFilters()
  }, [filters, shelters])

  const applyFilters = () => {
    let filtered = [...shelters]

    // Text search
    if (filters.query.trim()) {
      const query = filters.query.toLowerCase()
      filtered = filtered.filter(
        (shelter) =>
          shelter.name.toLowerCase().includes(query) ||
          shelter.description?.toLowerCase().includes(query) ||
          shelter.type.toLowerCase().includes(query)
      )
    }

    // Type filter
    if (filters.type) {
      filtered = filtered.filter((shelter) => shelter.type === filters.type)
    }

    // Free/Paid filter
    if (filters.isFree !== null) {
      filtered = filtered.filter((shelter) => shelter.isFree === filters.isFree)
    }

    // Capacity filter
    if (filters.minCapacity > 0) {
      filtered = filtered.filter(
        (shelter) => shelter.capacity && shelter.capacity >= filters.minCapacity
      )
    }

    // Serviced filter
    if (filters.isServiced !== null) {
      filtered = filtered.filter((shelter) => shelter.isServiced === filters.isServiced)
    }

    // Accessibility filter
    if (filters.accessibility.length > 0) {
      filtered = filtered.filter((shelter) =>
        filters.accessibility.some((access) => shelter.accessibility.includes(access))
      )
    }

    // Amenities filter
    if (filters.amenities.length > 0) {
      filtered = filtered.filter((shelter) =>
        filters.amenities.some((amenity) => shelter.amenities.includes(amenity))
      )
    }

    setFilteredShelters(filtered)
  }

  const hasActiveFilters =
    filters.query.trim() !== '' ||
    filters.type !== null ||
    filters.isFree !== null ||
    filters.minCapacity > 0 ||
    filters.isServiced !== null ||
    filters.accessibility.length > 0 ||
    filters.amenities.length > 0

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading shelters...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 relative">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Discover Mountain Shelters</h1>
        <p className="text-muted-foreground text-lg">
          Browse through our collection of mountain shelters and huts across Europe.
          Find the perfect refuge for your next adventure.
        </p>
      </div>

      {/* Mobile Filter Button */}
      <div className="lg:hidden mb-6">
        <Button
          onClick={() => setFiltersOpen(true)}
          variant="outline"
          className="w-full"
        >
          <SlidersHorizontal className="h-4 w-4 mr-2" />
          Filters
          {hasActiveFilters && (
            <span className="ml-2 bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs">
              {filteredShelters.length}
            </span>
          )}
        </Button>
      </div>

      <div className="flex gap-6">
        {/* Desktop Filter Sidebar */}
        <div className="hidden lg:block w-80 shrink-0">
          <div className="sticky top-4">
            <FilterPanel
              isOpen={true}
              onClose={() => {}}
              filters={filters}
              onFiltersChange={setFilters}
              onSearch={applyFilters}
              onToggle={() => {}}
              resultCount={filteredShelters.length}
              isLoading={false}
            />
          </div>
        </div>

        {/* Mobile Filter Overlay */}
        {filtersOpen && (
          <div className="lg:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-50">
            <div className="fixed inset-y-0 left-0 w-80 bg-background border-r">
              <FilterPanel
                isOpen={true}
                onClose={() => setFiltersOpen(false)}
                filters={filters}
                onFiltersChange={setFilters}
                onSearch={() => {
                  applyFilters()
                  setFiltersOpen(false)
                }}
                onToggle={() => setFiltersOpen(false)}
                resultCount={filteredShelters.length}
                isLoading={false}
              />
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1">
          {filteredShelters.length === 0 ? (
            <div className="text-center py-12">
              <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {hasActiveFilters ? 'No shelters match your filters' : 'No shelters found'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {hasActiveFilters
                  ? 'Try adjusting your search criteria or clearing some filters.'
                  : 'Try checking back later or explore the map.'}
              </p>
              <div className="flex gap-2 justify-center">
                {hasActiveFilters && (
                  <Button
                    variant="outline"
                    onClick={() =>
                      setFilters({
                        query: '',
                        type: null,
                        isFree: null,
                        minCapacity: 0,
                        isServiced: null,
                        accessibility: [],
                        amenities: [],
                      })
                    }
                  >
                    Clear Filters
                  </Button>
                )}
                <Button asChild>
                  <Link href="/map">View Map</Link>
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-6">
                <p className="text-sm text-muted-foreground">
                  Found {filteredShelters.length} of {shelters.length} mountain shelters
                  {hasActiveFilters && ' (filtered)'}
                </p>
                <Button variant="outline" asChild>
                  <Link href="/map">View on Map</Link>
                </Button>
              </div>

              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {filteredShelters.map((shelter) => (
                  <Card key={shelter.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      {shelter.photos[0] && (
                        <div className="aspect-video relative overflow-hidden rounded-lg mb-3">
                          <img
                            src={shelter.photos[0].url}
                            alt={`Photo of ${shelter.name}`}
                            className="object-cover w-full h-full"
                          />
                        </div>
                      )}
                      <CardTitle className="text-lg">{shelter.name}</CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <MapPin className="h-3 w-3" />
                        <span className="capitalize">{shelter.type}</span>
                        {shelter.elevation && (
                          <>
                            <Mountain className="h-3 w-3 ml-2" />
                            <span>{shelter.elevation}m</span>
                          </>
                        )}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      {shelter.description && (
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                          {shelter.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4 text-sm">
                          {shelter.capacity && (
                            <div className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              <span>{shelter.capacity}</span>
                            </div>
                          )}
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            shelter.isFree
                              ? 'bg-green-100 text-green-800'
                              : 'bg-orange-100 text-orange-800'
                          }`}>
                            {shelter.isFree ? 'Free' : 'Paid'}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {shelter._count.reviews} reviews
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        {shelter.amenities.length > 0 && (
                          <div>
                            <div className="flex flex-wrap gap-1">
                              {shelter.amenities.slice(0, 3).map((amenity) => (
                                <span
                                  key={amenity}
                                  className="px-2 py-1 bg-primary/10 text-primary rounded text-xs capitalize"
                                >
                                  {amenity}
                                </span>
                              ))}
                              {shelter.amenities.length > 3 && (
                                <span className="px-2 py-1 bg-muted text-muted-foreground rounded text-xs">
                                  +{shelter.amenities.length - 3} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="space-y-3">
                        <Button asChild className="w-full" variant="outline">
                          <Link href={`/shelter/${shelter.id}`}>
                            View Details
                          </Link>
                        </Button>
                        {/* Temporarily disabled due to Prisma errors
                        <ShelterActions shelterId={shelter.id} className="w-full" />
                        */}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}