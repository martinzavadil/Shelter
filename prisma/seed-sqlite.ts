import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const shelters = [
  // Swiss Alps
  { name: "Monte Rosa Hut", description: "Historic mountain hut with stunning views of Monte Rosa massif. Popular base for climbing expeditions.", type: "hut", isFree: false, capacity: 130, isServiced: true, accessibility: JSON.stringify(["foot"]), amenities: JSON.stringify(["toilet", "water", "food"]), latitude: 45.9205, longitude: 7.8671, elevation: 2883 },
  { name: "Matterhorn Hut", description: "Iconic shelter beneath the legendary Matterhorn peak. Essential stop for climbers attempting the Hörnli Ridge.", type: "hut", isFree: false, capacity: 80, isServiced: true, accessibility: JSON.stringify(["foot"]), amenities: JSON.stringify(["toilet", "water", "food", "electricity"]), latitude: 45.9763, longitude: 7.6581, elevation: 3260 },
  { name: "Cabane du Mont Fort", type: "hut", isFree: false, capacity: 70, isServiced: true, accessibility: JSON.stringify(["foot"]), amenities: JSON.stringify(["toilet", "water", "food"]), latitude: 46.0833, longitude: 7.3000, elevation: 2457 },
  { name: "Refuge des Dix", type: "hut", isFree: false, capacity: 120, isServiced: true, accessibility: JSON.stringify(["foot"]), amenities: JSON.stringify(["toilet", "water", "food", "wifi"]), latitude: 46.0167, longitude: 7.5333, elevation: 2928 },
  { name: "Cabane de Moiry", type: "hut", isFree: false, capacity: 110, isServiced: true, accessibility: JSON.stringify(["foot"]), amenities: JSON.stringify(["toilet", "water", "food"]), latitude: 46.1167, longitude: 7.6167, elevation: 2825 },

  // Austrian Alps
  { name: "Franz Senn Hut", type: "hut", isFree: false, capacity: 170, isServiced: true, accessibility: JSON.stringify(["foot"]), amenities: JSON.stringify(["toilet", "water", "food", "wifi"]), latitude: 47.0833, longitude: 11.1500, elevation: 2147 },
  { name: "Similaun Hut", type: "hut", isFree: false, capacity: 80, isServiced: true, accessibility: JSON.stringify(["foot"]), amenities: JSON.stringify(["toilet", "water", "food"]), latitude: 46.7833, longitude: 10.8667, elevation: 3019 },
  { name: "Kitzsteinhorn Hut", type: "hut", isFree: false, capacity: 45, isServiced: true, accessibility: JSON.stringify(["foot"]), amenities: JSON.stringify(["toilet", "water", "food", "electricity"]), latitude: 47.1833, longitude: 12.7333, elevation: 2261 },

  // Italian Alps
  { name: "Refugio Lagazuoi", type: "hut", isFree: false, capacity: 60, isServiced: true, accessibility: JSON.stringify(["foot"]), amenities: JSON.stringify(["toilet", "water", "food"]), latitude: 46.5333, longitude: 12.0000, elevation: 2752 },
  { name: "Rifugio Tosa", type: "hut", isFree: false, capacity: 50, isServiced: true, accessibility: JSON.stringify(["foot"]), amenities: JSON.stringify(["toilet", "water", "food"]), latitude: 46.2167, longitude: 10.6000, elevation: 2439 },

  // French Alps
  { name: "Refuge du Goûter", description: "High-altitude refuge on Mont Blanc route. Essential stop for summit attempts.", type: "hut", isFree: false, capacity: 120, isServiced: true, accessibility: JSON.stringify(["foot"]), amenities: JSON.stringify(["toilet", "water", "food"]), latitude: 45.8514, longitude: 6.8306, elevation: 3835 },
  { name: "Refuge de la Pilatte", type: "hut", isFree: false, capacity: 80, isServiced: true, accessibility: JSON.stringify(["foot"]), amenities: JSON.stringify(["toilet", "water", "food"]), latitude: 44.9333, longitude: 6.4167, elevation: 1317 },

  // Emergency Shelters
  { name: "Val Müstair Shelter", type: "shelter", isFree: true, capacity: 20, isServiced: false, accessibility: JSON.stringify(["foot", "bike"]), amenities: JSON.stringify(["toilet"]), latitude: 46.6000, longitude: 10.4333, elevation: 1800 },
  { name: "Engadin Emergency Hut", type: "shelter", isFree: true, capacity: 12, isServiced: false, accessibility: JSON.stringify(["foot"]), amenities: JSON.stringify(["toilet"]), latitude: 46.5167, longitude: 9.8167, elevation: 2200 },
  { name: "Tyrol Valley Shelter", type: "shelter", isFree: true, capacity: 15, isServiced: false, accessibility: JSON.stringify(["foot", "bike"]), amenities: JSON.stringify(["toilet"]), latitude: 47.2000, longitude: 11.8000, elevation: 1650 },
]

async function main() {
  console.log('🌱 Seeding database...')

  // Clear existing data
  await prisma.shelterList.deleteMany()
  await prisma.photo.deleteMany()
  await prisma.review.deleteMany()
  await prisma.shelter.deleteMany()

  console.log('🗑️ Cleared existing shelters')

  // Insert shelters
  for (const shelter of shelters) {
    const created = await prisma.shelter.create({
      data: shelter,
    })
    console.log(`✅ Created shelter: ${created.name}`)
  }

  console.log(`🎉 Seeded ${shelters.length} shelters successfully!`)
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })