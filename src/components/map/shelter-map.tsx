'use client'

import { useEffect, useState, useMemo } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { Icon, DivIcon } from 'leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search } from 'lucide-react'
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
  type: string
  isFree: boolean
  capacity: number | null
  latitude: number | null
  longitude: number | null
  elevation: number | null
}

interface ShelterMapProps {
  shelters: Shelter[]
}

export default function ShelterMap({ shelters }: ShelterMapProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchTerm])

  // Filter shelters based on search
  const filteredShelters = useMemo(() => {
    if (!debouncedSearchTerm) return shelters

    return shelters.filter(shelter =>
      shelter.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    )
  }, [shelters, debouncedSearchTerm])

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
    <div className="relative w-full h-full">
      {/* Floating Search */}
      <div className="absolute top-4 left-4 z-[1000] bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 rounded-lg shadow-lg p-4 border">
        <div className="flex items-center space-x-2 min-w-[300px]">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search shelters..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border-0 bg-transparent focus-visible:ring-0"
          />
        </div>
        {debouncedSearchTerm && (
          <div className="mt-2 text-sm text-muted-foreground">
            Found {filteredShelters.length} shelter{filteredShelters.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Map Container */}
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

        <MarkerClusterGroup
          chunkedLoading
          iconCreateFunction={createClusterCustomIcon}
          maxClusterRadius={80}
          spiderfyOnMaxZoom={true}
          showCoverageOnHover={true}
          zoomToBoundsOnClick={true}
        >
          {filteredShelters.map((shelter) => {
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
                        <Link href={`/shelter/${shelter.id}`}>
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
      </MapContainer>

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