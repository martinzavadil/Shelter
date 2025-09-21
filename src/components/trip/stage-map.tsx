'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Stage } from '@/lib/trip-utils'
import { Route, Clock, Mountain, Loader, MapPin } from 'lucide-react'
import { toast } from 'sonner'

// Dynamic imports for react-leaflet components to avoid SSR issues
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false })
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false })
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false })
const Polyline = dynamic(() => import('react-leaflet').then(mod => mod.Polyline), { ssr: false })

interface HikingRoute {
  coordinates: [number, number][]
  distance: number
  duration: number
  steps: Array<{
    instruction: string
    distance: number
    duration: number
  }>
  routeType: 'hiking' | 'walking'
}

interface StageMapProps {
  stage: Stage
  className?: string
}

export function StageMap({ stage, className }: StageMapProps) {
  const [hikingRoute, setHikingRoute] = useState<HikingRoute | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showRoute, setShowRoute] = useState(false)
  const [leafletLoaded, setLeafletLoaded] = useState(false)
  const [icons, setIcons] = useState<{ shelterIcon: any; startIcon: any; endIcon: any } | null>(null)

  // Initialize leaflet icons on client side
  useEffect(() => {
    const initLeaflet = async () => {
      if (typeof window !== 'undefined') {
        const L = await import('leaflet')
        await import('leaflet/dist/leaflet.css')

        // Fix for default markers in Leaflet with Next.js
        delete (L.Icon.Default.prototype as any)._getIconUrl
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        })

        // Custom marker icons
        const shelterIcon = new L.Icon({
          iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTMgMTJMMTIgM0wyMSAxMlYyMEgxNlYxNkgxMlYyMEg3VjEySDNaIiBmaWxsPSIjMTZhMzRhIiBzdHJva2U9IiNmZmZmZmYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8L3N2Zz4K',
          iconSize: [25, 25],
          iconAnchor: [12, 25],
          popupAnchor: [0, -25],
        })

        const startIcon = new L.Icon({
          iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTAiIGZpbGw9IiMyMjc3MzMiIHN0cm9rZT0iI2ZmZmZmZiIgc3Ryb2tlLXdpZHRoPSIyIi8+Cjx0ZXh0IHg9IjEyIiB5PSIxNiIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjEyIiBmaWxsPSIjZmZmZmZmIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5TPC90ZXh0Pgo8L3N2Zz4K',
          iconSize: [20, 20],
          iconAnchor: [10, 10],
          popupAnchor: [0, -10],
        })

        const endIcon = new L.Icon({
          iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTAiIGZpbGw9IiNkYzI2MjYiIHN0cm9rZT0iI2ZmZmZmZiIgc3Ryb2tlLXdpZHRoPSIyIi8+Cjx0ZXh0IHg9IjEyIiB5PSIxNiIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjEyIiBmaWxsPSIjZmZmZmZmIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5FPC90ZXh0Pgo8L3N2Zz4K',
          iconSize: [20, 20],
          iconAnchor: [10, 10],
          popupAnchor: [0, -10],
        })

        setIcons({ shelterIcon, startIcon, endIcon })
        setLeafletLoaded(true)
      }
    }

    initLeaflet()
  }, [])

  // Calculate map center and bounds
  const fromLat = stage.from.latitude!
  const fromLng = stage.from.longitude!
  const toLat = stage.to.latitude!
  const toLng = stage.to.longitude!

  const centerLat = (fromLat + toLat) / 2
  const centerLng = (fromLng + toLng) / 2

  // Calculate zoom based on distance
  const distance = stage.distance
  let zoom = 10
  if (distance < 2) zoom = 14
  else if (distance < 5) zoom = 12
  else if (distance < 15) zoom = 10
  else zoom = 8

  const calculateHikingRoute = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/trip/hiking-route', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startLat: fromLat,
          startLng: fromLng,
          endLat: toLat,
          endLng: toLng,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to calculate hiking route')
      }

      const { route } = await response.json()
      setHikingRoute(route)
      setShowRoute(true)
      toast.success('Hiking route calculated!')

    } catch (error) {
      console.error('Error calculating hiking route:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to calculate hiking route')
    } finally {
      setIsLoading(false)
    }
  }

  // Direct line coordinates
  const directLine: [number, number][] = [[fromLat, fromLng], [toLat, toLng]]

  // Route coordinates (either hiking route or direct line)
  const routeCoordinates = showRoute && hikingRoute ? hikingRoute.coordinates : directLine

  // Show loading state until leaflet is ready
  if (!leafletLoaded || !icons) {
    return (
      <Card className={className}>
        <CardContent className="p-0">
          <div className="h-64 bg-muted rounded-lg animate-pulse flex items-center justify-center">
            <Loader className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardContent className="p-0">
        <div className="h-64 relative">
          <MapContainer
            center={[centerLat, centerLng]}
            zoom={zoom}
            style={{ height: '100%', width: '100%' }}
            zoomControl={true}
            scrollWheelZoom={false}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />

            {/* Start marker */}
            <Marker position={[fromLat, fromLng]} icon={icons.startIcon}>
              <Popup>
                <div className="min-w-[150px]">
                  <h3 className="font-semibold text-green-600 mb-1">Start</h3>
                  <p className="text-sm font-medium">{stage.from.name}</p>
                  <div className="flex gap-2 mt-1">
                    <Badge variant="outline" className="text-xs capitalize">
                      {stage.from.type}
                    </Badge>
                    {stage.from.elevation && (
                      <span className="text-xs text-muted-foreground">
                        {stage.from.elevation}m
                      </span>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>

            {/* End marker */}
            <Marker position={[toLat, toLng]} icon={icons.endIcon}>
              <Popup>
                <div className="min-w-[150px]">
                  <h3 className="font-semibold text-red-600 mb-1">End</h3>
                  <p className="text-sm font-medium">{stage.to.name}</p>
                  <div className="flex gap-2 mt-1">
                    <Badge variant="outline" className="text-xs capitalize">
                      {stage.to.type}
                    </Badge>
                    {stage.to.elevation && (
                      <span className="text-xs text-muted-foreground">
                        {stage.to.elevation}m
                      </span>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>

            {/* Route line */}
            <Polyline
              positions={routeCoordinates}
              pathOptions={{
                color: showRoute && hikingRoute ? '#16a34a' : '#6b7280',
                weight: showRoute && hikingRoute ? 4 : 3,
                opacity: 0.8,
                dashArray: showRoute && hikingRoute ? undefined : '5, 10'
              }}
            />
          </MapContainer>

          {/* Route control button */}
          <div className="absolute top-2 right-2 z-[1000]">
            {!showRoute ? (
              <Button
                size="sm"
                onClick={calculateHikingRoute}
                disabled={isLoading}
                className="bg-white/90 hover:bg-white text-foreground border shadow-sm"
              >
                {isLoading ? (
                  <Loader className="h-3 w-3 mr-1 animate-spin" />
                ) : (
                  <Route className="h-3 w-3 mr-1" />
                )}
                {isLoading ? 'Calculating...' : 'Show Route'}
              </Button>
            ) : (
              <div className="bg-white/90 border rounded px-2 py-1 shadow-sm">
                <div className="flex items-center gap-1 text-xs">
                  <Badge variant="secondary" className="text-xs">
                    {hikingRoute?.routeType === 'hiking' ? 'Hiking' : 'Walking'}
                  </Badge>
                  {hikingRoute && (
                    <span className="text-muted-foreground">
                      {(hikingRoute.distance / 1000).toFixed(1)}km
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Route information */}
        {showRoute && hikingRoute && (
          <div className="p-3 border-t bg-muted/30">
            <div className="flex justify-between items-center text-sm">
              <div className="flex gap-4">
                <span className="flex items-center gap-1">
                  <Route className="h-3 w-3 text-green-600" />
                  {(hikingRoute.distance / 1000).toFixed(1)} km
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3 text-blue-600" />
                  {Math.round(hikingRoute.duration / 60)} min
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowRoute(false)}
                className="text-xs h-auto p-1"
              >
                Hide Route
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}