'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { X, Search, Filter } from 'lucide-react'

export interface FilterState {
  query: string
  type: string | null
  isFree: boolean | null
  minCapacity: number
  isServiced: boolean | null
  accessibility: string[]
  amenities: string[]
}

interface FilterPanelProps {
  isOpen: boolean
  onClose: () => void
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  onSearch: () => void
  onToggle: () => void
  resultCount?: number
  isLoading?: boolean
}

const ACCESSIBILITY_OPTIONS = [
  { value: 'car', label: 'Car' },
  { value: 'foot', label: 'On Foot' },
  { value: 'bike', label: 'Bike' },
  { value: 'public_transport', label: 'Public Transport' },
]

const AMENITIES_OPTIONS = [
  { value: 'toilet', label: 'Toilet' },
  { value: 'water', label: 'Water' },
  { value: 'electricity', label: 'Electricity' },
  { value: 'wifi', label: 'WiFi' },
  { value: 'food', label: 'Food' },
]

export function FilterPanel({
  isOpen,
  onClose,
  filters,
  onFiltersChange,
  onSearch,
  onToggle,
  resultCount,
  isLoading,
}: FilterPanelProps) {
  const updateFilter = (updates: Partial<FilterState>) => {
    onFiltersChange({ ...filters, ...updates })
  }

  const handleAccessibilityChange = (value: string, checked: boolean) => {
    const newAccessibility = checked
      ? [...filters.accessibility, value]
      : filters.accessibility.filter((item) => item !== value)
    updateFilter({ accessibility: newAccessibility })
  }

  const handleAmenityChange = (value: string, checked: boolean) => {
    const newAmenities = checked
      ? [...filters.amenities, value]
      : filters.amenities.filter((item) => item !== value)
    updateFilter({ amenities: newAmenities })
  }

  const clearFilters = () => {
    onFiltersChange({
      query: '',
      type: null,
      isFree: null,
      minCapacity: 0,
      isServiced: null,
      accessibility: [],
      amenities: [],
    })
  }

  const hasActiveFilters =
    filters.query.trim() !== '' ||
    filters.type !== null ||
    filters.isFree !== null ||
    filters.minCapacity > 0 ||
    filters.isServiced !== null ||
    filters.accessibility.length > 0 ||
    filters.amenities.length > 0

  if (!isOpen) {
    return (
      <div className="absolute top-4 left-4 z-[1000]">
        <Button
          onClick={onToggle}
          size="sm"
          variant="outline"
          className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80"
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters
          {hasActiveFilters && (
            <span className="ml-2 bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs">
              {resultCount || 0}
            </span>
          )}
        </Button>
      </div>
    )
  }

  return (
    <div className="absolute top-4 left-4 z-[1000] w-80 max-h-[calc(100vh-2rem)] overflow-visible">
      <Card className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 overflow-visible">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Search & Filters</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          {resultCount !== undefined && (
            <CardDescription>
              {resultCount} shelter{resultCount !== 1 ? 's' : ''} found
            </CardDescription>
          )}
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Search */}
          <div className="space-y-2">
            <Label htmlFor="search">Search</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Search shelters..."
                value={filters.query}
                onChange={(e) => updateFilter({ query: e.target.value })}
                className="pl-9"
              />
            </div>
          </div>

          {/* Basic Filters */}
          <div className="space-y-4">
            <h4 className="font-medium">Basic Filters</h4>

            {/* Type */}
            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={filters.type || 'all'}
                onValueChange={(value) => updateFilter({ type: value === 'all' ? null : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Any type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any type</SelectItem>
                  <SelectItem value="hut">Hut</SelectItem>
                  <SelectItem value="shelter">Shelter</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Free/Paid */}
            <div className="space-y-2">
              <Label>Cost</Label>
              <Select
                value={filters.isFree === null ? 'all' : filters.isFree ? 'free' : 'paid'}
                onValueChange={(value) =>
                  updateFilter({
                    isFree: value === 'all' ? null : value === 'free'
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Any cost" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any cost</SelectItem>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Capacity */}
            <div className="space-y-2">
              <Label>Minimum Capacity: {filters.minCapacity} people</Label>
              <Slider
                value={[filters.minCapacity]}
                onValueChange={([value]) => updateFilter({ minCapacity: value })}
                max={200}
                step={5}
                className="w-full"
              />
            </div>
          </div>

          {/* Advanced Filters */}
          <div className="space-y-4">
            <h4 className="font-medium">Advanced Filters</h4>

            {/* Serviced */}
            <div className="space-y-2">
              <Label>Serviced</Label>
              <Select
                value={filters.isServiced === null ? 'all' : filters.isServiced ? 'yes' : 'no'}
                onValueChange={(value) =>
                  updateFilter({
                    isServiced: value === 'all' ? null : value === 'yes'
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any</SelectItem>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Accessibility */}
            <div className="space-y-2">
              <Label>Accessibility</Label>
              <div className="grid gap-2">
                {ACCESSIBILITY_OPTIONS.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`accessibility-${option.value}`}
                      checked={filters.accessibility.includes(option.value)}
                      onCheckedChange={(checked) =>
                        handleAccessibilityChange(option.value, checked as boolean)
                      }
                    />
                    <Label
                      htmlFor={`accessibility-${option.value}`}
                      className="text-sm font-normal"
                    >
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Amenities */}
            <div className="space-y-2">
              <Label>Amenities</Label>
              <div className="grid gap-2">
                {AMENITIES_OPTIONS.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`amenity-${option.value}`}
                      checked={filters.amenities.includes(option.value)}
                      onCheckedChange={(checked) =>
                        handleAmenityChange(option.value, checked as boolean)
                      }
                    />
                    <Label
                      htmlFor={`amenity-${option.value}`}
                      className="text-sm font-normal"
                    >
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4 border-t">
            <Button onClick={onSearch} disabled={isLoading} className="flex-1">
              {isLoading ? 'Searching...' : 'Apply Filters'}
            </Button>
            {hasActiveFilters && (
              <Button variant="outline" onClick={clearFilters}>
                Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}