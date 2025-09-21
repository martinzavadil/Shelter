'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { MapPin, Users, Mountain, Star } from 'lucide-react'

interface Shelter {
  id: string
  name: string
  description?: string | null
  type: string
  isFree: boolean
  capacity: number | null
  latitude: number | null
  longitude: number | null
  elevation: number | null
}

interface ResultsListProps {
  shelters: Shelter[]
  isLoading?: boolean
}

export function ResultsList({ shelters, isLoading }: ResultsListProps) {
  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-muted rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-muted rounded w-full"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (shelters.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No shelters found matching your criteria.</p>
        <p className="text-sm mt-2">Try adjusting your filters or search terms.</p>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg">
          {shelters.length} Result{shelters.length !== 1 ? 's' : ''}
        </h3>
      </div>

      {shelters.map((shelter) => (
        <Card key={shelter.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-medium text-base hover:text-primary">
                <Link href={`/shelter/${shelter.id}`}>
                  {shelter.name}
                </Link>
              </h4>
              <div className="flex items-center gap-2 text-xs">
                <span className={`px-2 py-1 rounded-full ${
                  shelter.isFree
                    ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                    : 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300'
                }`}>
                  {shelter.isFree ? 'Free' : 'Paid'}
                </span>
                <span className="px-2 py-1 bg-secondary text-secondary-foreground rounded-full capitalize">
                  {shelter.type}
                </span>
              </div>
            </div>

            {shelter.description && (
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                {shelter.description}
              </p>
            )}

            <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
              {shelter.capacity && (
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  <span>{shelter.capacity}</span>
                </div>
              )}
              {shelter.elevation && (
                <div className="flex items-center gap-1">
                  <Mountain className="h-3 w-3" />
                  <span>{shelter.elevation}m</span>
                </div>
              )}
              {shelter.latitude && shelter.longitude && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  <span>
                    {shelter.latitude.toFixed(3)}, {shelter.longitude.toFixed(3)}
                  </span>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Star className="h-3 w-3" />
                <span>No reviews yet</span>
              </div>
              <Button asChild size="sm" variant="outline">
                <Link href={`/shelter/${shelter.id}`}>
                  View Details
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}