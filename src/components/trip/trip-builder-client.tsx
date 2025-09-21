'use client'

import { useState, useMemo } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ShelterSelector } from './shelter-selector'
import { TripPlanner } from './trip-planner'
import { SavedTrips } from './saved-trips'
import { calculateTripStages, calculateTripSummary, formatTime } from '@/lib/trip-utils'
import { Search, Route, Save, Users, Mountain, Clock } from 'lucide-react'
import { toast } from 'sonner'

interface Shelter {
  id: string
  name: string
  type: string
  latitude: number | null
  longitude: number | null
  elevation: number | null
  capacity: number | null
  isFree: boolean
}

interface TripBuilderClientProps {
  initialShelters: Shelter[]
}

export function TripBuilderClient({ initialShelters }: TripBuilderClientProps) {
  const { data: session } = useSession()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedShelters, setSelectedShelters] = useState<Shelter[]>([])
  const [tripName, setTripName] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  // Filter shelters based on search
  const filteredShelters = useMemo(() => {
    return initialShelters.filter(shelter =>
      shelter.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shelter.type.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [initialShelters, searchQuery])

  // Calculate trip stages and summary
  const tripStages = useMemo(() => {
    return calculateTripStages(selectedShelters)
  }, [selectedShelters])

  const tripSummary = useMemo(() => {
    return calculateTripSummary(tripStages)
  }, [tripStages])

  const handleShelterToggle = (shelter: Shelter) => {
    setSelectedShelters(prev => {
      const isSelected = prev.some(s => s.id === shelter.id)
      if (isSelected) {
        return prev.filter(s => s.id !== shelter.id)
      } else {
        return [...prev, shelter]
      }
    })
  }

  const handleShelterReorder = (dragIndex: number, hoverIndex: number) => {
    setSelectedShelters(prev => {
      const draggedShelter = prev[dragIndex]
      const newShelters = [...prev]
      newShelters.splice(dragIndex, 1)
      newShelters.splice(hoverIndex, 0, draggedShelter)
      return newShelters
    })
  }

  const handleSaveTrip = async () => {
    if (!session) {
      toast.error('Please sign in to save trips')
      return
    }

    if (selectedShelters.length < 2) {
      toast.error('Please select at least 2 shelters for your trip')
      return
    }

    if (!tripName.trim()) {
      toast.error('Please enter a trip name')
      return
    }

    setIsSaving(true)

    try {
      const response = await fetch('/api/trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: tripName.trim(),
          shelterIds: selectedShelters.map(s => s.id),
          estimatedDays: tripSummary.totalDays
        })
      })

      if (response.ok) {
        toast.success('Trip saved successfully!')
        setTripName('')
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to save trip')
      }
    } catch (error) {
      toast.error('Failed to save trip')
    } finally {
      setIsSaving(false)
    }
  }

  const clearTrip = () => {
    setSelectedShelters([])
    setTripName('')
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Shelter Selection */}
      <div className="lg:col-span-1 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Select Shelters
            </CardTitle>
            <CardDescription>
              Search and add shelters to your trip
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Input
                placeholder="Search shelters..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />

              <ShelterSelector
                shelters={filteredShelters}
                selectedShelters={selectedShelters}
                onShelterToggle={handleShelterToggle}
              />
            </div>
          </CardContent>
        </Card>

        {/* Trip Summary */}
        {selectedShelters.length > 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Route className="h-5 w-5" />
                Trip Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Route className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Distance:</span>
                  <span className="font-medium">{tripSummary.totalDistance} km</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Time:</span>
                  <span className="font-medium">{formatTime(tripSummary.totalTime)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mountain className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Elevation:</span>
                  <span className="font-medium">{tripSummary.totalElevationGain}m</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Days:</span>
                  <span className="font-medium">{tripSummary.totalDays}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Save Trip */}
        {session && selectedShelters.length > 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Save className="h-5 w-5" />
                Save Trip
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Enter trip name..."
                value={tripName}
                onChange={(e) => setTripName(e.target.value)}
              />
              <div className="flex gap-2">
                <Button
                  onClick={handleSaveTrip}
                  disabled={isSaving || !tripName.trim()}
                  className="flex-1"
                >
                  {isSaving ? 'Saving...' : 'Save Trip'}
                </Button>
                <Button variant="outline" onClick={clearTrip}>
                  Clear
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Saved Trips */}
        {session && (
          <SavedTrips
            onTripLoad={(shelterIds) => {
              const loadedShelters = initialShelters.filter(s =>
                shelterIds.includes(s.id)
              )
              // Maintain the order from the saved trip
              const orderedShelters = shelterIds
                .map(id => loadedShelters.find(s => s.id === id))
                .filter(Boolean) as Shelter[]
              setSelectedShelters(orderedShelters)
            }}
          />
        )}
      </div>

      {/* Trip Planning */}
      <div className="lg:col-span-2">
        <TripPlanner
          selectedShelters={selectedShelters}
          tripStages={tripStages}
          onShelterReorder={handleShelterReorder}
          onShelterRemove={(shelterId) => {
            setSelectedShelters(prev => prev.filter(s => s.id !== shelterId))
          }}
        />
      </div>
    </div>
  )
}