import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

// Initialize Supabase client
const supabaseUrl = 'https://zetkokzmdpvitkvyoxbl.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpldGtva3ptZHB2aXRrdnlveGJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzOTU1MTcsImV4cCI6MjA3Mzk3MTUxN30.WpNzWw6dU7QidZ7QH2oKXPVAjjfEjEmHumfVDJf41p4'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

interface CSVRow {
  id: string
  type: string
  lat: string
  lon: string
  name: string
  operator?: string
  opening_hours?: string
  description?: string
  capacity?: string
  'capacity:persons'?: string
  fee?: string
  access?: string
  seasonal?: string
  ele?: string
  start_date?: string
  source?: string
  website?: string
  phone?: string
  email?: string
  amenity?: string
  shelter_type?: string
  tourism?: string
  building?: string
  drinking_water?: string
  fireplace?: string
  stove?: string
  heating?: string
  bunks?: string
  mattress?: string
  bed?: string
  toilet?: string
  shower?: string
  indoor_seating?: string
  covered?: string
  reservation?: string
  image?: string
  wikidata?: string
  wikipedia?: string
}

function parseCSVLine(line: string): string[] {
  const fields: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]

    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === '|' && !inQuotes) {
      fields.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }

  fields.push(current.trim())
  return fields
}

function mapCSVToShelter(csvRow: CSVRow): any {
  // Determine shelter type
  let shelterType = 'hut'
  if (csvRow.shelter_type === 'basic_hut' || csvRow.amenity === 'shelter') {
    shelterType = 'shelter'
  } else if (csvRow.tourism === 'wilderness_hut' || csvRow.tourism === 'alpine_hut') {
    shelterType = 'hut'
  }

  // Parse capacity
  let capacity = null
  if (csvRow.capacity && !isNaN(Number(csvRow.capacity))) {
    capacity = Number(csvRow.capacity)
  } else if (csvRow['capacity:persons'] && !isNaN(Number(csvRow['capacity:persons']))) {
    capacity = Number(csvRow['capacity:persons'])
  }

  // Parse coordinates
  const latitude = csvRow.lat && !isNaN(Number(csvRow.lat)) ? Number(csvRow.lat) : null
  const longitude = csvRow.lon && !isNaN(Number(csvRow.lon)) ? Number(csvRow.lon) : null

  // Parse elevation
  const elevation = csvRow.ele && !isNaN(Number(csvRow.ele)) ? Number(csvRow.ele) : null

  // Determine if free
  const isFree = !csvRow.fee || csvRow.fee === 'no' || csvRow.fee === 'free'

  // Determine if serviced
  const isServiced = csvRow.operator ? true : false

  // Build amenities array
  const amenities: string[] = []
  if (csvRow.toilet === 'yes') amenities.push('toilet')
  if (csvRow.drinking_water === 'yes') amenities.push('water')
  if (csvRow.shower === 'yes') amenities.push('shower')
  if (csvRow.heating === 'yes' || csvRow.fireplace === 'yes' || csvRow.stove === 'yes') amenities.push('heating')
  if (isServiced) amenities.push('food')

  // Build accessibility array
  const accessibility: string[] = ['foot'] // Default for mountain shelters
  if (csvRow.access && csvRow.access.includes('car')) accessibility.push('car')
  if (csvRow.access && csvRow.access.includes('bike')) accessibility.push('bike')

  return {
    id: `csv-${csvRow.id}`, // Prefix to avoid ID conflicts
    name: csvRow.name || 'Unnamed Shelter',
    description: csvRow.description || null,
    type: shelterType,
    isFree,
    capacity,
    isServiced,
    accessibility,
    amenities,
    latitude,
    longitude,
    elevation,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
}

async function importShelters() {
  try {
    console.log('🚀 Starting shelter import...')

    // Read CSV file
    const csvPath = path.join(process.cwd(), 'list_shelter.csv')
    const csvContent = fs.readFileSync(csvPath, 'utf-8')
    const lines = csvContent.split('\n').filter(line => line.trim())

    console.log(`📄 Found ${lines.length - 1} shelters in CSV file`)

    // Parse header
    const headerFields = parseCSVLine(lines[0])
    console.log('📊 CSV Headers:', headerFields.slice(0, 10), '...')

    // Clear existing shelter data
    console.log('🗑️ Clearing existing shelter data...')

    // Delete related data first
    const { error: reviewsError } = await supabase.from('reviews').delete().neq('id', '')
    if (reviewsError) console.log('Note: Reviews deletion error (might not exist):', reviewsError.message)

    const { error: photosError } = await supabase.from('photos').delete().neq('id', '')
    if (photosError) console.log('Note: Photos deletion error (might not exist):', photosError.message)

    const { error: listsError } = await supabase.from('shelter_lists').delete().neq('id', '')
    if (listsError) console.log('Note: Shelter lists deletion error (might not exist):', listsError.message)

    // Delete shelters
    const { error: sheltersError } = await supabase.from('shelters').delete().neq('id', '')
    if (sheltersError) {
      console.error('❌ Error clearing shelters:', sheltersError)
      return
    }

    console.log('✅ Existing data cleared')

    // Process and insert shelters in batches
    const batchSize = 100
    let inserted = 0
    let errors = 0

    for (let i = 1; i < lines.length; i += batchSize) {
      const batchLines = lines.slice(i, i + batchSize)
      const shelters: any[] = []

      for (const line of batchLines) {
        try {
          const fields = parseCSVLine(line)
          const csvRow: any = {}

          // Map fields to object
          headerFields.forEach((header, index) => {
            csvRow[header] = fields[index] || ''
          })

          // Skip if no name or coordinates
          if (!csvRow.name || !csvRow['@lat'] || !csvRow['@lon']) {
            continue
          }

          // Rename fields to match our expectation
          csvRow.id = csvRow['@id']
          csvRow.type = csvRow['@type']
          csvRow.lat = csvRow['@lat']
          csvRow.lon = csvRow['@lon']

          const shelter = mapCSVToShelter(csvRow)

          // Only add if we have valid coordinates
          if (shelter.latitude && shelter.longitude) {
            shelters.push(shelter)
          }
        } catch (error) {
          console.log(`⚠️ Error processing line ${i + batchLines.indexOf(line)}:`, error)
          errors++
        }
      }

      if (shelters.length > 0) {
        const { error: insertError } = await supabase
          .from('shelters')
          .insert(shelters)

        if (insertError) {
          console.error(`❌ Error inserting batch starting at line ${i}:`, insertError)
          errors += shelters.length
        } else {
          inserted += shelters.length
          console.log(`✅ Inserted batch: ${shelters.length} shelters (total: ${inserted})`)
        }
      }
    }

    console.log('\n🎉 Import completed!')
    console.log(`✅ Successfully imported: ${inserted} shelters`)
    console.log(`❌ Errors: ${errors}`)

    // Verify import
    const { count } = await supabase
      .from('shelters')
      .select('*', { count: 'exact', head: true })

    console.log(`📊 Total shelters in database: ${count}`)

  } catch (error) {
    console.error('💥 Import failed:', error)
  }
}

// Run the import
importShelters()