'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MapPin, Users, Mountain, Check, Plus } from 'lucide-react'

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

interface ShelterSelectorProps {
  shelters: Shelter[]
  selectedShelters: Shelter[]
  onShelterToggle: (shelter: Shelter) => void
}

export function ShelterSelector({ shelters, selectedShelters, onShelterToggle }: ShelterSelectorProps) {
  const isSelected = (shelterId: string) => {
    return selectedShelters.some(s => s.id === shelterId)
  }

  const getSelectionOrder = (shelterId: string) => {
    const index = selectedShelters.findIndex(s => s.id === shelterId)
    return index >= 0 ? index + 1 : null
  }

  return (
    <div className="space-y-2 max-h-96 overflow-y-auto">
      {shelters.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">
          No shelters found
        </p>
      ) : (
        shelters.map((shelter) => {
          const selected = isSelected(shelter.id)
          const order = getSelectionOrder(shelter.id)

          return (
            <div
              key={shelter.id}
              className={`border rounded-lg p-3 transition-colors ${
                selected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-sm truncate">{shelter.name}</h4>
                    {selected && order && (
                      <Badge variant="secondary" className="text-xs">
                        #{order}
                      </Badge>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                    <span className="capitalize">{shelter.type}</span>
                    {shelter.elevation && (
                      <span className="flex items-center gap-1">
                        <Mountain className="h-3 w-3" />
                        {shelter.elevation}m
                      </span>
                    )}
                    {shelter.capacity && (
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {shelter.capacity}
                      </span>
                    )}
                    <span className={shelter.isFree ? 'text-green-600' : 'text-orange-600'}>
                      {shelter.isFree ? 'Free' : 'Paid'}
                    </span>
                  </div>

                  {shelter.latitude && shelter.longitude && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                      <MapPin className="h-3 w-3" />
                      {shelter.latitude.toFixed(3)}, {shelter.longitude.toFixed(3)}
                    </div>
                  )}
                </div>

                <Button
                  variant={selected ? "default" : "outline"}
                  size="sm"
                  onClick={() => onShelterToggle(shelter)}
                  className="flex-shrink-0"
                >
                  {selected ? (
                    <Check className="h-3 w-3" />
                  ) : (
                    <Plus className="h-3 w-3" />
                  )}
                </Button>
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}