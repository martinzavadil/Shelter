import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { writeFile } from 'fs/promises'
import { join } from 'path'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const shelterId = formData.get('shelterId') as string
    const photos = formData.getAll('photos') as File[]

    if (!shelterId || photos.length === 0) {
      return NextResponse.json(
        { error: 'Shelter ID and photos are required' },
        { status: 400 }
      )
    }

    // Check if shelter exists
    const shelter = await prisma.shelter.findUnique({
      where: { id: shelterId },
      include: { photos: true },
    })

    if (!shelter) {
      return NextResponse.json({ error: 'Shelter not found' }, { status: 404 })
    }

    // Check total photo count
    if (shelter.photos.length + photos.length > 5) {
      return NextResponse.json(
        { error: `Cannot upload ${photos.length} photos. Maximum 5 photos per shelter.` },
        { status: 400 }
      )
    }

    const maxFileSize = 3 * 1024 * 1024 // 3MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg']

    // Validate each photo
    for (const photo of photos) {
      if (!allowedTypes.includes(photo.type)) {
        return NextResponse.json(
          { error: 'Only JPG and PNG files are allowed' },
          { status: 400 }
        )
      }

      if (photo.size > maxFileSize) {
        return NextResponse.json(
          { error: 'File size must be less than 3MB' },
          { status: 400 }
        )
      }
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads')

    // Save photos and create database entries
    const uploadedPhotos = []

    for (const photo of photos) {
      const bytes = await photo.arrayBuffer()
      const buffer = Buffer.from(bytes)

      // Generate unique filename
      const timestamp = Date.now()
      const randomStr = Math.random().toString(36).substring(2, 15)
      const extension = photo.name.split('.').pop() || 'jpg'
      const filename = `${timestamp}-${randomStr}.${extension}`

      const filepath = join(uploadsDir, filename)

      // Ensure directory exists
      try {
        await writeFile(filepath, buffer)
      } catch (dirError) {
        // Try to create directory and retry
        const { mkdir } = await import('fs/promises')
        await mkdir(uploadsDir, { recursive: true })
        await writeFile(filepath, buffer)
      }

      const photoUrl = `/uploads/${filename}`

      // Save to database
      const dbPhoto = await prisma.photo.create({
        data: {
          shelterId,
          userId: session.user.id,
          url: photoUrl,
          filename,
        },
      })

      uploadedPhotos.push(dbPhoto)
    }

    return NextResponse.json({
      success: true,
      photos: uploadedPhotos,
      message: `Successfully uploaded ${uploadedPhotos.length} photo${uploadedPhotos.length !== 1 ? 's' : ''}`
    })
  } catch (error) {
    console.error('Error uploading photos:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}