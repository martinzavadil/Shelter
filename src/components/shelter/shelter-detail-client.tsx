'use client'

import { useState } from 'react'
import { ReviewForm } from './review-form'
import { PhotoUpload } from './photo-upload'

interface ShelterDetailClientProps {
  shelterId: string
  initialPhotoCount: number
}

export function ShelterDetailClient({ shelterId, initialPhotoCount }: ShelterDetailClientProps) {
  const [refreshKey, setRefreshKey] = useState(0)

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1)
    // Force page refresh to show new data
    window.location.reload()
  }

  return (
    <div className="space-y-6">
      <ReviewForm
        shelterId={shelterId}
        onReviewSubmitted={handleRefresh}
      />
      <PhotoUpload
        shelterId={shelterId}
        currentPhotoCount={initialPhotoCount}
        onPhotosUploaded={handleRefresh}
      />
    </div>
  )
}