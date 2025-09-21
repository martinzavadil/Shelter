'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Upload, Download, Route, X } from 'lucide-react'
import { toast } from 'sonner'
import * as toGeoJSON from '@mapbox/togeojson'

interface GPXControlsProps {
  onGPXLoaded: (geoJsonData: any, fileName: string) => void
  onClearRoute: () => void
  currentRoute: any
  className?: string
}

export function GPXControls({ onGPXLoaded, onClearRoute, currentRoute, className }: GPXControlsProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.name.toLowerCase().endsWith('.gpx')) {
      toast.error('Please select a valid GPX file')
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB')
      return
    }

    setIsProcessing(true)

    try {
      const text = await file.text()

      // Parse XML
      const parser = new DOMParser()
      const xmlDoc = parser.parseFromString(text, 'application/xml')

      // Check for XML parsing errors
      const parseError = xmlDoc.querySelector('parsererror')
      if (parseError) {
        throw new Error('Invalid XML format')
      }

      // Check if it's a valid GPX file
      const gpxElement = xmlDoc.querySelector('gpx')
      if (!gpxElement) {
        throw new Error('Not a valid GPX file')
      }

      // Convert to GeoJSON using togeojson library
      const geoJson = toGeoJSON.gpx(xmlDoc)

      // Validate that we have some geometry
      if (!geoJson.features || geoJson.features.length === 0) {
        throw new Error('No track or route data found in GPX file')
      }

      // Check if we have LineString features (tracks/routes)
      const hasValidGeometry = geoJson.features.some(feature =>
        feature.geometry.type === 'LineString' &&
        feature.geometry.coordinates.length > 1
      )

      if (!hasValidGeometry) {
        throw new Error('No valid track or route geometry found')
      }

      toast.success(`GPX file "${file.name}" loaded successfully`)
      onGPXLoaded(geoJson, file.name)

    } catch (error) {
      console.error('GPX parsing error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to parse GPX file')
    } finally {
      setIsProcessing(false)
      // Clear the input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleExportGPX = () => {
    if (!currentRoute) {
      toast.error('No route to export')
      return
    }

    try {
      // Generate GPX content
      const gpxContent = generateGPXFromRoute(currentRoute)

      // Create and download file
      const blob = new Blob([gpxContent], { type: 'application/gpx+xml' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `sheltr-route-${new Date().toISOString().split('T')[0]}.gpx`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast.success('GPX file exported successfully')
    } catch (error) {
      console.error('GPX export error:', error)
      toast.error('Failed to export GPX file')
    }
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Route className="h-5 w-5" />
          GPX Routes
        </CardTitle>
        <CardDescription>
          Import GPX tracks or export current route
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Import GPX */}
        <div className="space-y-2">
          <Input
            ref={fileInputRef}
            type="file"
            accept=".gpx"
            onChange={handleFileSelect}
            disabled={isProcessing}
            className="cursor-pointer"
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
            className="w-full"
            variant="outline"
          >
            <Upload className="h-4 w-4 mr-2" />
            {isProcessing ? 'Processing...' : 'Import GPX File'}
          </Button>
        </div>

        {/* Export GPX */}
        <Button
          onClick={handleExportGPX}
          disabled={!currentRoute}
          className="w-full"
          variant="outline"
        >
          <Download className="h-4 w-4 mr-2" />
          Export Current Route
        </Button>

        {/* Clear Route */}
        {currentRoute && (
          <Button
            onClick={onClearRoute}
            variant="destructive"
            size="sm"
            className="w-full"
          >
            <X className="h-4 w-4 mr-2" />
            Clear Route
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

function generateGPXFromRoute(routeData: any): string {
  const { name = 'Sheltr Route', coordinates } = routeData

  const trackPoints = coordinates.map(([lng, lat, ele]: [number, number, number?]) => {
    const elevation = ele ? ` <ele>${ele}</ele>` : ''
    return `    <trkpt lat="${lat}" lon="${lng}">${elevation}</trkpt>`
  }).join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Sheltr" xmlns="http://www.topografix.com/GPX/1/1">
  <trk>
    <name>${name}</name>
    <trkseg>
${trackPoints}
    </trkseg>
  </trk>
</gpx>`
}