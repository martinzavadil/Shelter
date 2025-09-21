'use client'

import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet'
import { Icon } from 'leaflet'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDistance, estimateWalkingTime } from '@/lib/emergency-utils'
import { AlertTriangle, Navigation, Clock, Users, Mountain } from 'lucide-react'
import 'leaflet/dist/leaflet.css'

// Fix for default markers in Leaflet with Next.js
import L from 'leaflet'
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

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

interface WalkingRoute {
  coordinates: [number, number][]
  distance: number
  duration: number
  steps: Array<{
    instruction: string
    distance: number
    duration: number
  }>
}

interface EmergencyResult {
  userLocation: UserLocation
  nearestShelter: NearestShelter
  distance: number
  route?: WalkingRoute
}

interface EmergencyMapProps {
  userLocation: UserLocation | null
  emergencyResult: EmergencyResult | null
}

export function EmergencyMap({ userLocation, emergencyResult }: EmergencyMapProps) {
  // Custom markers
  const userIcon = new Icon({
    iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTAiIGZpbGw9IiNlZjQ0NDQiIHN0cm9rZT0iI2ZmZmZmZiIgc3Ryb2tlLXdpZHRoPSIyIi8+CjxjaXJjbGUgY3g9IjEyIiBjeT0iMTIiIHI9IjMiIGZpbGw9IiNmZmZmZmYiLz4KPC9zdmc+',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -10],
  })

  const shelterIcon = new Icon({
    iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTMgMTJMMTIgM0wyMSAxMlYyMEgxNlYxNkgxMlYyMEg3VjEySDNaIiBmaWxsPSIjMTZhMzRhIiBzdHJva2U9IiNmZmZmZmYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8L3N2Zz4K',
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30],
  })

  // Determine map center and zoom
  let center: [number, number] = [46.8182, 8.2275] // Default: Swiss Alps
  let zoom = 6

  if (emergencyResult) {
    // Center map to show both user location and nearest shelter
    const lat1 = emergencyResult.userLocation.latitude
    const lng1 = emergencyResult.userLocation.longitude
    const lat2 = emergencyResult.nearestShelter.latitude
    const lng2 = emergencyResult.nearestShelter.longitude

    center = [(lat1 + lat2) / 2, (lng1 + lng2) / 2]

    // Calculate zoom based on distance
    const distance = emergencyResult.distance
    if (distance < 1) zoom = 15
    else if (distance < 5) zoom = 12
    else if (distance < 20) zoom = 10
    else zoom = 8
  } else if (userLocation) {
    center = [userLocation.latitude, userLocation.longitude]
    zoom = 12
  }

  // Polyline coordinates - use route if available, otherwise direct line
  const polylinePositions: [number, number][] = emergencyResult
    ? emergencyResult.route
      ? emergencyResult.route.coordinates
      : [
          [emergencyResult.userLocation.latitude, emergencyResult.userLocation.longitude],
          [emergencyResult.nearestShelter.latitude, emergencyResult.nearestShelter.longitude]
        ]
    : []

  if (!userLocation && !emergencyResult) {
    return (
      <Card className="h-[600px]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            Emergency Map
          </CardTitle>
          <CardDescription>
            Use your current location to find the nearest emergency shelter
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <Navigation className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Get your location to see emergency shelter directions
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-[600px]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          Emergency Route
        </CardTitle>
        <CardDescription>
          {emergencyResult
            ? emergencyResult.route
              ? `${(emergencyResult.route.distance / 1000).toFixed(1)} km walking route to nearest shelter`
              : `${formatDistance(emergencyResult.distance)} straight line to nearest shelter`
            : 'Your current location'
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="h-[500px] relative">
          <MapContainer
            center={center}
            zoom={zoom}
            style={{ height: '100%', width: '100%' }}
            zoomControl={true}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />

            {/* User Location Marker */}
            {userLocation && (
              <Marker
                position={[userLocation.latitude, userLocation.longitude]}
                icon={userIcon}
              >
                <Popup>
                  <div className="text-center">
                    <h3 className="font-semibold text-red-600 mb-2">Your Location</h3>
                    <p className="text-sm text-muted-foreground">
                      {userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)}
                    </p>
                  </div>
                </Popup>
              </Marker>
            )}

            {/* Nearest Shelter Marker */}
            {emergencyResult && (
              <Marker
                position={[emergencyResult.nearestShelter.latitude, emergencyResult.nearestShelter.longitude]}
                icon={shelterIcon}
              >
                <Popup>
                  <div className="min-w-[200px]">
                    <h3 className="font-semibold text-green-600 mb-2">
                      {emergencyResult.nearestShelter.name}
                    </h3>

                    <div className="flex gap-2 mb-2">
                      <Badge variant="outline" className="capitalize">
                        {emergencyResult.nearestShelter.type}
                      </Badge>
                      <Badge variant={emergencyResult.nearestShelter.isFree ? "secondary" : "outline"}>
                        {emergencyResult.nearestShelter.isFree ? 'Free' : 'Paid'}
                      </Badge>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Navigation className="h-3 w-3 text-red-500" />
                        <span>{formatDistance(emergencyResult.distance)} away</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3 text-blue-500" />
                        <span>{estimateWalkingTime(emergencyResult.distance)} walk</span>
                      </div>

                      {emergencyResult.nearestShelter.capacity && (
                        <div className="flex items-center gap-2">
                          <Users className="h-3 w-3 text-gray-500" />
                          <span>{emergencyResult.nearestShelter.capacity} people</span>
                        </div>
                      )}

                      {emergencyResult.nearestShelter.elevation && (
                        <div className="flex items-center gap-2">
                          <Mountain className="h-3 w-3 text-gray-500" />
                          <span>{emergencyResult.nearestShelter.elevation}m</span>
                        </div>
                      )}
                    </div>

                    {emergencyResult.nearestShelter.description && (
                      <p className="text-xs text-muted-foreground mt-2">
                        {emergencyResult.nearestShelter.description}
                      </p>
                    )}
                  </div>
                </Popup>
              </Marker>
            )}

            {/* Emergency Route Line */}
            {polylinePositions.length >= 2 && (
              <Polyline
                positions={polylinePositions}
                pathOptions={{
                  color: emergencyResult?.route ? '#16a34a' : '#ef4444',
                  weight: emergencyResult?.route ? 5 : 4,
                  opacity: 0.8,
                  dashArray: emergencyResult?.route ? undefined : '10, 10'
                }}
              />
            )}
          </MapContainer>
        </div>
      </CardContent>
    </Card>
  )
}