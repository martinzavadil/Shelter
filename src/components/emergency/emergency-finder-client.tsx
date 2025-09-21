'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { EmergencyMap } from './emergency-map'
import { calculateBearing, bearingToCompass, formatDistance, estimateWalkingTime } from '@/lib/emergency-utils'
import { MapPin, Navigation, Clock, AlertTriangle, Loader, Users, Mountain } from 'lucide-react'
import { toast } from 'sonner'

interface UserLocation {
  latitude: number
  longitude: number
}

interface NearestShelter {
  id: string
  name: string
  description: string | null
  type: string
  latitude: number
  longitude: number
  elevation: number | null
  capacity: number | null
  isFree: boolean
  isServiced: boolean
  accessibility: string[]
  amenities: string[]
  distance: number
}

interface EmergencyResult {
  userLocation: UserLocation
  nearestShelter: NearestShelter
  distance: number
}

export function EmergencyFinderClient() {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null)
  const [emergencyResult, setEmergencyResult] = useState<EmergencyResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isGettingLocation, setIsGettingLocation] = useState(false)

  const findNearestShelter = async (lat: number, lng: number) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/emergency/nearest-shelter?lat=${lat}&lng=${lng}`)

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to find nearest shelter')
      }

      const result = await response.json()
      setEmergencyResult(result)
      toast.success('Nearest shelter found!')

    } catch (error) {
      console.error('Error finding shelter:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to find nearest shelter')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by this browser')
      return
    }

    setIsGettingLocation(true)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setUserLocation({ latitude, longitude })
        setIsGettingLocation(false)

        // Automatically find nearest shelter
        findNearestShelter(latitude, longitude)
      },
      (error) => {
        console.error('Geolocation error:', error)
        let errorMessage = 'Failed to get your location'

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied. Please enable location permissions.'
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable.'
            break
          case error.TIMEOUT:
            errorMessage = 'Location request timed out.'
            break
        }

        toast.error(errorMessage)
        setIsGettingLocation(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    )
  }


  const clearResults = () => {
    setEmergencyResult(null)
    setUserLocation(null)
  }

  // Calculate bearing and compass direction if we have results
  const bearing = emergencyResult
    ? calculateBearing(
        emergencyResult.userLocation.latitude,
        emergencyResult.userLocation.longitude,
        emergencyResult.nearestShelter.latitude,
        emergencyResult.nearestShelter.longitude
      )
    : 0

  const compassDirection = emergencyResult ? bearingToCompass(bearing) : ''

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Location Input */}
      <div className="lg:col-span-1 space-y-6">
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Your Location
            </CardTitle>
            <CardDescription>
              Use your current location to find the nearest emergency shelter
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={handleUseMyLocation}
              disabled={isGettingLocation || isLoading}
              className="w-full bg-red-600 hover:bg-red-700"
            >
              {isGettingLocation ? (
                <Loader className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <MapPin className="h-4 w-4 mr-2" />
              )}
              {isGettingLocation ? 'Getting Location...' : 'Use My Location'}
            </Button>


            {emergencyResult && (
              <Button
                variant="ghost"
                onClick={clearResults}
                className="w-full"
              >
                Clear Results
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Emergency Results */}
        {emergencyResult && (
          <Card className="border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-600">
                <Navigation className="h-5 w-5" />
                Nearest Shelter Found
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">{emergencyResult.nearestShelter.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="capitalize">
                    {emergencyResult.nearestShelter.type}
                  </Badge>
                  <Badge variant={emergencyResult.nearestShelter.isFree ? "secondary" : "outline"}>
                    {emergencyResult.nearestShelter.isFree ? 'Free' : 'Paid'}
                  </Badge>
                </div>
              </div>

              {emergencyResult.nearestShelter.description && (
                <p className="text-sm text-muted-foreground">
                  {emergencyResult.nearestShelter.description}
                </p>
              )}

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <Navigation className="h-4 w-4 text-red-500" />
                  <div>
                    <div className="font-medium">{formatDistance(emergencyResult.distance)}</div>
                    <div className="text-xs text-muted-foreground">Distance</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-500" />
                  <div>
                    <div className="font-medium">{estimateWalkingTime(emergencyResult.distance)}</div>
                    <div className="text-xs text-muted-foreground">Walking</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-purple-500" />
                  <div>
                    <div className="font-medium">{Math.round(bearing)}° {compassDirection}</div>
                    <div className="text-xs text-muted-foreground">Bearing</div>
                  </div>
                </div>

                {emergencyResult.nearestShelter.elevation && (
                  <div className="flex items-center gap-2">
                    <Mountain className="h-4 w-4 text-gray-500" />
                    <div>
                      <div className="font-medium">{emergencyResult.nearestShelter.elevation}m</div>
                      <div className="text-xs text-muted-foreground">Elevation</div>
                    </div>
                  </div>
                )}
              </div>

              {emergencyResult.nearestShelter.capacity && (
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>Capacity: {emergencyResult.nearestShelter.capacity} people</span>
                </div>
              )}

              {emergencyResult.nearestShelter.amenities.length > 0 && (
                <div>
                  <div className="text-sm font-medium mb-2">Available:</div>
                  <div className="flex flex-wrap gap-1">
                    {emergencyResult.nearestShelter.amenities.map((amenity) => (
                      <Badge key={amenity} variant="secondary" className="text-xs capitalize">
                        {amenity}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Emergency Map */}
      <div className="lg:col-span-2">
        <EmergencyMap
          userLocation={userLocation}
          emergencyResult={emergencyResult}
        />
      </div>
    </div>
  )
}