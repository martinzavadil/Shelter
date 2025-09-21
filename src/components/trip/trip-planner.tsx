'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Stage, formatTime } from '@/lib/trip-utils'
import { Route, Clock, Mountain, ArrowRight, GripVertical, X, MapPin } from 'lucide-react'

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

interface TripPlannerProps {
  selectedShelters: Shelter[]
  tripStages: Stage[]
  onShelterReorder: (dragIndex: number, hoverIndex: number) => void
  onShelterRemove: (shelterId: string) => void
}

export function TripPlanner({ selectedShelters, tripStages, onShelterReorder, onShelterRemove }: TripPlannerProps) {
  if (selectedShelters.length === 0) {
    return (
      <Card className="h-fit">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Route className="h-5 w-5" />
            Trip Planner
          </CardTitle>
          <CardDescription>
            Select shelters to start planning your trip
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Route className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Choose at least 2 shelters to see your trip stages
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Group stages by day
  const stagesByDay = tripStages.reduce((acc, stage) => {
    if (!acc[stage.day]) {
      acc[stage.day] = []
    }
    acc[stage.day].push(stage)
    return acc
  }, {} as Record<number, Stage[]>)

  const totalDays = Object.keys(stagesByDay).length

  return (
    <div className="space-y-6">
      {/* Selected Shelters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Selected Route ({selectedShelters.length} shelters)
          </CardTitle>
          <CardDescription>
            Drag to reorder • Click × to remove
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {selectedShelters.map((shelter, index) => (
              <div
                key={shelter.id}
                className="flex items-center gap-3 p-3 border rounded-lg bg-background"
              >
                <div className="flex items-center gap-2 text-muted-foreground">
                  <GripVertical className="h-4 w-4 cursor-grab" />
                  <Badge variant="outline" className="text-xs">
                    {index + 1}
                  </Badge>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium truncate">{shelter.name}</span>
                    <Badge variant="secondary" className="text-xs capitalize">
                      {shelter.type}
                    </Badge>
                  </div>
                  <div className="flex gap-3 text-xs text-muted-foreground mt-1">
                    {shelter.elevation && (
                      <span className="flex items-center gap-1">
                        <Mountain className="h-3 w-3" />
                        {shelter.elevation}m
                      </span>
                    )}
                    <span className={shelter.isFree ? 'text-green-600' : 'text-orange-600'}>
                      {shelter.isFree ? 'Free' : 'Paid'}
                    </span>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onShelterRemove(shelter.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Daily Stages */}
      {selectedShelters.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Route className="h-5 w-5" />
              Daily Stages ({totalDays} {totalDays === 1 ? 'day' : 'days'})
            </CardTitle>
            <CardDescription>
              Estimated hiking stages based on 4 km/h + elevation penalties
            </CardDescription>
          </CardHeader>
          <CardContent>
            {Object.keys(stagesByDay).length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  No valid stages could be calculated. Check that shelters have coordinates.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(stagesByDay)
                  .sort(([a], [b]) => parseInt(a) - parseInt(b))
                  .map(([day, stages]) => {
                    const dayTotalTime = stages.reduce((sum, stage) => sum + stage.estimatedTime, 0)
                    const dayTotalDistance = stages.reduce((sum, stage) => sum + stage.distance, 0)
                    const dayTotalElevation = stages.reduce((sum, stage) => sum + stage.elevationGain, 0)

                    return (
                      <div key={day} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-semibold flex items-center gap-2">
                            Day {day}
                            <Badge variant="outline">
                              {stages.length} stage{stages.length !== 1 ? 's' : ''}
                            </Badge>
                          </h3>
                          <div className="flex gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Route className="h-3 w-3" />
                              {dayTotalDistance.toFixed(1)} km
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatTime(dayTotalTime)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Mountain className="h-3 w-3" />
                              +{Math.round(dayTotalElevation)}m
                            </span>
                          </div>
                        </div>

                        <div className="space-y-3">
                          {stages.map((stage) => (
                            <div
                              key={stage.id}
                              className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
                            >
                              <div className="flex-1">
                                <div className="flex items-center gap-2 font-medium text-sm">
                                  <span className="truncate">{stage.from.name}</span>
                                  <ArrowRight className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                                  <span className="truncate">{stage.to.name}</span>
                                </div>
                                <div className="flex gap-4 text-xs text-muted-foreground mt-1">
                                  <span>{stage.distance.toFixed(1)} km</span>
                                  <span>{formatTime(stage.estimatedTime)}</span>
                                  {stage.elevationGain > 0 && (
                                    <span>+{Math.round(stage.elevationGain)}m elevation</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}