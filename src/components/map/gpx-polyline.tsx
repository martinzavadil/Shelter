'use client'

import { useEffect } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'

interface GPXPolylineProps {
  geoJsonData: any
  routeName: string
}

export function GPXPolyline({ geoJsonData, routeName }: GPXPolylineProps) {
  const map = useMap()

  useEffect(() => {
    if (!geoJsonData || !map) return

    // Create a layer group for the GPX data
    const layerGroup = L.layerGroup()

    // Style for the polylines
    const lineStyle = {
      color: '#ef4444', // Red color
      weight: 4,
      opacity: 0.8,
      dashArray: '5, 10'
    }

    // Style for waypoints
    const waypointStyle = {
      radius: 6,
      fillColor: '#ef4444',
      color: '#ffffff',
      weight: 2,
      opacity: 1,
      fillOpacity: 0.8
    }

    // Add all features to the map
    const geoJsonLayer = L.geoJSON(geoJsonData, {
      style: () => lineStyle,
      pointToLayer: (feature, latlng) => {
        // Create circle markers for waypoints
        return L.circleMarker(latlng, waypointStyle)
      },
      onEachFeature: (feature, layer) => {
        // Add popup with feature information
        let popupContent = `<strong>${routeName}</strong><br/>`

        if (feature.properties) {
          if (feature.properties.name) {
            popupContent += `Name: ${feature.properties.name}<br/>`
          }
          if (feature.properties.desc) {
            popupContent += `Description: ${feature.properties.desc}<br/>`
          }
          if (feature.geometry.type === 'LineString') {
            const coords = feature.geometry.coordinates
            popupContent += `Points: ${coords.length}<br/>`

            // Calculate approximate distance
            let distance = 0
            for (let i = 1; i < coords.length; i++) {
              const prev = L.latLng(coords[i-1][1], coords[i-1][0])
              const curr = L.latLng(coords[i][1], coords[i][0])
              distance += prev.distanceTo(curr)
            }
            popupContent += `Distance: ${(distance / 1000).toFixed(2)} km`
          }
        }

        layer.bindPopup(popupContent)
      }
    })

    layerGroup.addLayer(geoJsonLayer)
    layerGroup.addTo(map)

    // Fit map bounds to the GPX data
    const bounds = geoJsonLayer.getBounds()
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [20, 20] })
    }

    // Store reference for cleanup
    ;(map as any)._gpxLayer = layerGroup

    // Cleanup function
    return () => {
      if ((map as any)._gpxLayer) {
        map.removeLayer((map as any)._gpxLayer)
        ;(map as any)._gpxLayer = null
      }
    }
  }, [geoJsonData, routeName, map])

  return null // This component doesn't render anything directly
}