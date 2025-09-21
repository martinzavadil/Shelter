'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { History, Calendar, Trash2, Eye } from 'lucide-react'
import { toast } from 'sonner'

interface Trip {
  id: string
  name: string
  shelterIds: string[]
  estimatedDays: number | null
  createdAt: string
}

interface SavedTripsProps {
  onTripLoad: (shelterIds: string[]) => void
}

export function SavedTrips({ onTripLoad }: SavedTripsProps) {
  const { data: session } = useSession()
  const [trips, setTrips] = useState<Trip[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const fetchTrips = async () => {
    if (!session) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/trips')
      if (response.ok) {
        const data = await response.json()
        setTrips(data.trips)
      }
    } catch (error) {
      console.error('Failed to fetch trips:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchTrips()
  }, [session])

  const handleDeleteTrip = async (tripId: string) => {
    try {
      const response = await fetch(`/api/trips/${tripId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setTrips(prev => prev.filter(trip => trip.id !== tripId))
        toast.success('Trip deleted successfully')
      } else {
        toast.error('Failed to delete trip')
      }
    } catch (error) {
      toast.error('Failed to delete trip')
    }
  }

  const handleLoadTrip = (trip: Trip) => {
    onTripLoad(trip.shelterIds)
    toast.success(`Loaded trip: ${trip.name}`)
  }

  if (!session) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Saved Trips
        </CardTitle>
        <CardDescription>
          Load your previously saved trips
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">Loading trips...</p>
          </div>
        ) : trips.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">No saved trips yet</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {trips.map((trip) => (
              <div
                key={trip.id}
                className="border rounded-lg p-3 space-y-2"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm truncate">{trip.name}</h4>
                    <div className="flex gap-2 text-xs text-muted-foreground mt-1">
                      <span>{trip.shelterIds.length} shelters</span>
                      {trip.estimatedDays && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {trip.estimatedDays} days
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(trip.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleLoadTrip(trip)}
                    className="flex-1"
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    Load
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteTrip(trip.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}