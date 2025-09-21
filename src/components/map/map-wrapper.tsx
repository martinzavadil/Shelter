'use client'

import dynamic from 'next/dynamic'

const Map = dynamic(() => import('./enhanced-shelter-map'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-muted">
      <div className="text-muted-foreground">Loading map...</div>
    </div>
  ),
})

export { Map }