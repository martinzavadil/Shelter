import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Debug: List available buckets
    const { data: buckets, error: bucketsError } = await supabaseAdmin.storage.listBuckets()
    console.log('Available buckets:', buckets)
    if (bucketsError) {
      console.log('Buckets error:', bucketsError)
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
    const { data: shelter, error: shelterError } = await supabaseAdmin
      .from('shelters')
      .select('id')
      .eq('id', shelterId)
      .single()

    if (shelterError || !shelter) {
      return NextResponse.json({ error: 'Shelter not found' }, { status: 404 })
    }

    // Check current photo count
    const { data: existingPhotos, error: photosError } = await supabaseAdmin
      .from('photos')
      .select('id')
      .eq('shelterId', shelterId)

    if (photosError) {
      return NextResponse.json({ error: 'Failed to check existing photos' }, { status: 500 })
    }

    const currentPhotoCount = existingPhotos?.length || 0

    // Check total photo count
    if (currentPhotoCount + photos.length > 5) {
      return NextResponse.json(
        { error: `Cannot upload ${photos.length} photos. Maximum 5 photos per shelter (${currentPhotoCount} already exist).` },
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

    // Save photos with fallback to local storage if Supabase Storage fails
    const uploadedPhotos = []

    for (const photo of photos) {
      const bytes = await photo.arrayBuffer()

      // Generate unique filename
      const timestamp = Date.now()
      const randomStr = Math.random().toString(36).substring(2, 15)
      const extension = photo.name.split('.').pop() || 'jpg'
      const filename = `${shelterId}/${timestamp}-${randomStr}.${extension}`

      let photoUrl: string
      let storagePath: string

      // Try Supabase Storage first
      const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
        .from('shelter-photos')
        .upload(filename, bytes, {
          contentType: photo.type,
          upsert: false
        })

      if (uploadError) {
        console.error('Supabase Storage upload error:', uploadError)
        console.log('Falling back to local file storage...')

        // Fallback to local file storage
        const { writeFile, mkdir } = await import('fs/promises')
        const { join } = await import('path')

        const uploadsDir = join(process.cwd(), 'public', 'uploads')
        const localFilename = `${timestamp}-${randomStr}.${extension}`
        const filepath = join(uploadsDir, localFilename)

        try {
          // Ensure directory exists
          await mkdir(uploadsDir, { recursive: true })
          await writeFile(filepath, Buffer.from(bytes))

          photoUrl = `/uploads/${localFilename}`
          storagePath = localFilename
          console.log(`Photo saved locally: ${photoUrl}`)
        } catch (fileError) {
          console.error('Local file storage error:', fileError)
          return NextResponse.json(
            { error: `Failed to upload ${photo.name}: Storage not available` },
            { status: 500 }
          )
        }
      } else {
        // Supabase Storage success
        const { data: publicUrlData } = supabaseAdmin.storage
          .from('shelter-photos')
          .getPublicUrl(filename)

        photoUrl = publicUrlData.publicUrl
        storagePath = uploadData.path
        console.log(`Photo saved to Supabase Storage: ${photoUrl}`)
      }

      // Save to database
      const { data: dbPhoto, error: dbError } = await supabaseAdmin
        .from('photos')
        .insert({
          shelterId,
          userId: session.user.id,
          url: photoUrl,
          filename: storagePath,
        })
        .select()
        .single()

      if (dbError) {
        console.error('Database insert error:', dbError)

        // Try to cleanup uploaded file (only if it was uploaded to Supabase)
        if (!uploadError) {
          await supabaseAdmin.storage
            .from('shelter-photos')
            .remove([filename])
        }

        return NextResponse.json(
          { error: `Failed to save photo data: ${dbError.message}` },
          { status: 500 }
        )
      }

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