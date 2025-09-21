'use client'

import dynamic from 'next/dynamic'
import { Loader } from 'lucide-react'

const EmergencyFinderClient = dynamic(
  () => import('@/components/emergency/emergency-finder-client').then(mod => ({ default: mod.EmergencyFinderClient })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-96">
        <Loader className="h-8 w-8 animate-spin" />
      </div>
    )
  }
)

export default function EmergencyPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-red-600">Emergency Shelter Finder</h1>
        <p className="text-muted-foreground">
          Instantly find the nearest shelter using your current location in emergency situations
        </p>
      </div>

      <EmergencyFinderClient />
    </div>
  )
}