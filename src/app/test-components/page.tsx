'use client'

import { useState } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function TestComponentsPage() {
  const [sliderValue, setSliderValue] = useState([50])
  const [selectValue, setSelectValue] = useState("")

  return (
    <div className="container mx-auto p-8 space-y-8">
      <h1 className="text-2xl font-bold">Component Test Page</h1>

      <Card>
        <CardHeader>
          <CardTitle>Select Component Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select value={selectValue} onValueChange={setSelectValue}>
            <SelectTrigger>
              <SelectValue placeholder="Select a type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hut">Hut</SelectItem>
              <SelectItem value="shelter">Shelter</SelectItem>
              <SelectItem value="all">All Types</SelectItem>
            </SelectContent>
          </Select>
          <p>Selected: {selectValue || 'None'}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Slider Component Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label>Capacity: {sliderValue[0]} people</label>
            <Slider
              value={sliderValue}
              onValueChange={setSliderValue}
              max={200}
              step={5}
              className="w-full"
            />
          </div>
          <p>Value: {sliderValue[0]}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Button Test</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={() => alert('Button works!')}>
            Test Button
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}