// Quick test to create storage bucket through Supabase client
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://zetkokzmdpvitkvyoxbl.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY // Need service role key for admin operations

if (!supabaseServiceKey) {
  console.error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createBucket() {
  try {
    // Try to list buckets first
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()
    console.log('Existing buckets:', buckets)

    if (listError) {
      console.error('Error listing buckets:', listError)
      return
    }

    // Check if shelter-photos bucket exists
    const existingBucket = buckets.find(bucket => bucket.id === 'shelter-photos')
    if (existingBucket) {
      console.log('Bucket shelter-photos already exists:', existingBucket)
      return
    }

    // Create the bucket
    const { data, error } = await supabase.storage.createBucket('shelter-photos', {
      public: true,
      fileSizeLimit: 52428800, // 50MB
      allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    })

    if (error) {
      console.error('Error creating bucket:', error)
    } else {
      console.log('Bucket created successfully:', data)
    }
  } catch (error) {
    console.error('Unexpected error:', error)
  }
}

createBucket()