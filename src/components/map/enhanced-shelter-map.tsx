'use client'

import { useEffect, useState, useCallback } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { Icon, DivIcon } from 'leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { FilterPanel, FilterState } from './filter-panel'
import { ResultsList } from './results-list'
import { GPXControls } from './gpx-controls'
import { GPXPolyline } from './gpx-polyline'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'

// Fix for default markers in Leaflet with Next.js
import L from 'leaflet'
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

interface Shelter {
  id: string
  name: string
  description?: string | null
  type: string
  isFree: boolean
  capacity: number | null
  isServiced: boolean
  accessibility: string[]
  amenities: string[]
  latitude: number | null
  longitude: number | null
  elevation: number | null
}

interface EnhancedShelterMapProps {
  initialShelters: Shelter[]
}

export default function EnhancedShelterMap({ initialShelters }: EnhancedShelterMapProps) {
  const [shelters, setShelters] = useState<Shelter[]>(initialShelters)
  const [isLoading, setIsLoading] = useState(false)
  const [filterPanelOpen, setFilterPanelOpen] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [filters, setFilters] = useState<FilterState>({
    query: '',
    type: null,
    isFree: null,
    minCapacity: 0,
    isServiced: null,
    accessibility: [],
    amenities: [],
  })

  // GPX state
  const [currentGPX, setCurrentGPX] = useState<any>(null)
  const [gpxFileName, setGpxFileName] = useState<string>('')

  const searchShelters = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()

      if (filters.query.trim()) params.set('q', filters.query.trim())
      if (filters.type) params.set('type', filters.type)
      if (filters.isFree !== null) params.set('isFree', filters.isFree.toString())
      if (filters.minCapacity > 0) params.set('minCapacity', filters.minCapacity.toString())
      if (filters.isServiced !== null) params.set('isServiced', filters.isServiced.toString())
      if (filters.accessibility.length > 0) params.set('accessibility', filters.accessibility.join(','))
      if (filters.amenities.length > 0) params.set('amenities', filters.amenities.join(','))

      const response = await fetch(`/api/shelters/search?${params}`)
      if (response.ok) {
        const data = await response.json()
        setShelters(data.shelters)
        setShowResults(true)
      }
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setIsLoading(false)
    }
  }, [filters])

  // Auto-search when filters change (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      searchShelters()
    }, 300)

    return () => clearTimeout(timer)
  }, [filters])

  // GPX handlers
  const handleGPXLoaded = (geoJsonData: any, fileName: string) => {
    setCurrentGPX(geoJsonData)
    setGpxFileName(fileName)
  }

  const handleClearRoute = () => {
    setCurrentGPX(null)
    setGpxFileName('')
  }

  // Generate route data for export
  const getCurrentRoute = () => {
    if (!currentGPX) return null

    // Find the first LineString feature for export
    const routeFeature = currentGPX.features?.find((feature: any) =>
      feature.geometry.type === 'LineString'
    )

    if (!routeFeature) return null

    return {
      name: gpxFileName.replace('.gpx', '') || 'Shelty Route',
      coordinates: routeFeature.geometry.coordinates
    }
  }

  // Custom marker icons
  const hutIcon = new Icon({
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  })

  const shelterIcon = new Icon({
    iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTMgMTJMMTIgM0wyMSAxMlYyMEgxNlYxNkgxMlYyMEg3VjEySDNaIiBmaWxsPSIjNjM2NjcxIiBzdHJva2U9IiNmZmZmZmYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8L3N2Zz4K',
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30],
  })

  // Custom cluster icon
  const createClusterCustomIcon = (cluster: any) => {
    const count = cluster.getChildCount()

    return new DivIcon({
      html: `<span class="cluster-icon">${count}</span>`,
      className: 'custom-marker-cluster',
      iconSize: [40, 40],
    })
  }

  // Center map on Europe (Alps region)
  const center: [number, number] = [46.8182, 8.2275] // Swiss Alps center
  const zoom = 6

  return (
    <div className="relative w-full h-full flex flex-col">
      {/* Filter Panel */}
      <FilterPanel
        isOpen={filterPanelOpen}
        onClose={() => setFilterPanelOpen(false)}
        filters={filters}
        onFiltersChange={setFilters}
        onSearch={searchShelters}
        onToggle={() => setFilterPanelOpen(!filterPanelOpen)}
        resultCount={shelters.length}
        isLoading={isLoading}
      />

      {/* Map Container */}
      <div className="flex-1 relative min-h-[500px]">
        <MapContainer
          center={center}
          zoom={zoom}
          style={{ height: '100%', width: '100%', minHeight: '500px' }}
          zoomControl={true}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />

          <MarkerClusterGroup
            chunkedLoading
            iconCreateFunction={createClusterCustomIcon}
            maxClusterRadius={80}
            spiderfyOnMaxZoom={true}
            showCoverageOnHover={true}
            zoomToBoundsOnClick={true}
          >
            {shelters.map((shelter) => {
              if (!shelter.latitude || !shelter.longitude) return null

              return (
                <Marker
                  key={shelter.id}
                  position={[shelter.latitude, shelter.longitude]}
                  icon={shelter.type === 'hut' ? hutIcon : shelterIcon}
                >
                  <Popup>
                    <div className="min-w-[200px] p-2">
                      <h3 className="font-semibold text-base mb-2">{shelter.name}</h3>
                      {shelter.description && (
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                          {shelter.description}
                        </p>
                      )}
                      <div className="space-y-1 text-sm">
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
                            <span>{shelter.capacity} people</span>
                          </div>
                        )}
                        {shelter.elevation && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Elevation:</span>
                            <span>{shelter.elevation}m</span>
                          </div>
                        )}
                      </div>
                      <div className="mt-3 pt-2 border-t">
                        <Button asChild size="sm" className="w-full">
                          <Link href={`/shelter/${shelter.id}`} style={{ color: 'white' }}>
                            View Details
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              )
            })}
          </MarkerClusterGroup>

          {/* GPX Polyline */}
          {currentGPX && (
            <GPXPolyline
              geoJsonData={currentGPX}
              routeName={gpxFileName}
            />
          )}
        </MapContainer>

        {/* GPX Controls */}
        <div className="absolute top-4 right-4 z-[1000] w-80">
          <GPXControls
            onGPXLoaded={handleGPXLoaded}
            onClearRoute={handleClearRoute}
            currentRoute={getCurrentRoute()}
          />
        </div>
      </div>

      {/* Results List */}
      {showResults && (
        <div className="border-t bg-background">
          <ResultsList shelters={shelters} isLoading={isLoading} />
        </div>
      )}

      <style jsx global>{`
        .custom-marker-cluster {
          background: rgba(255, 255, 255, 0.8);
          border: 2px solid #1f2937;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .cluster-icon {
          color: #1f2937;
          font-weight: bold;
          font-size: 14px;
        }
      `}</style>
    </div>
  )
}