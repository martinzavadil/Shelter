'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Upload, X } from 'lucide-react'

interface PhotoUploadProps {
  shelterId: string
  currentPhotoCount: number
  onPhotosUploaded: () => void
}

export function PhotoUpload({ shelterId, currentPhotoCount, onPhotosUploaded }: PhotoUploadProps) {
  const { data: session } = useSession()
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState('')

  if (!session) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Upload Photos</CardTitle>
          <CardDescription>Sign in to share photos of this shelter</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const maxFiles = 5 - currentPhotoCount
  const maxFileSize = 3 * 1024 * 1024 // 3MB

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setError('')

    // Validate file count
    if (files.length + currentPhotoCount > 5) {
      setError(`Can only upload ${maxFiles} more photos (max 5 total)`)
      return
    }

    // Validate file types and sizes
    const invalidFiles = files.filter(
      (file) =>
        !['image/jpeg', 'image/png', 'image/jpg'].includes(file.type) ||
        file.size > maxFileSize
    )

    if (invalidFiles.length > 0) {
      setError('Only JPG/PNG files under 3MB are allowed')
      return
    }

    setSelectedFiles(files)
  }

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return

    setIsUploading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('shelterId', shelterId)
      selectedFiles.forEach((file) => {
        formData.append('photos', file)
      })

      const response = await fetch('/api/photos', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        setSelectedFiles([])
        onPhotosUploaded()
      } else {
        const data = await response.json()
        setError(data.error || 'Upload failed')
      }
    } catch (error) {
      setError('Upload failed')
    } finally {
      setIsUploading(false)
    }
  }

  if (currentPhotoCount >= 5) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Upload Photos</CardTitle>
          <CardDescription>Maximum of 5 photos reached</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Photos</CardTitle>
        <CardDescription>
          Share photos of this shelter ({currentPhotoCount}/5 used)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Input
            type="file"
            accept="image/jpeg,image/png,image/jpg"
            multiple
            onChange={handleFileSelect}
            disabled={isUploading}
          />
          <p className="text-xs text-muted-foreground mt-1">
            JPG/PNG only, max 3MB each, up to {maxFiles} more photos
          </p>
        </div>

        {error && (
          <div className="text-sm text-red-500 bg-red-50 p-2 rounded">
            {error}
          </div>
        )}

        {selectedFiles.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Selected Files:</h4>
            {selectedFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between bg-secondary p-2 rounded">
                <span className="text-sm truncate">{file.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {(file.size / 1024 / 1024).toFixed(1)}MB
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                    disabled={isUploading}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <Button
          onClick={handleUpload}
          disabled={selectedFiles.length === 0 || isUploading}
          className="w-full"
        >
          <Upload className="h-4 w-4 mr-2" />
          {isUploading ? 'Uploading...' : `Upload ${selectedFiles.length} Photo${selectedFiles.length !== 1 ? 's' : ''}`}
        </Button>
      </CardContent>
    </Card>
  )
}