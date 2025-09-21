import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const shelters = [
  // Swiss Alps
  { name: "Monte Rosa Hut", description: "Historic mountain hut with stunning views of Monte Rosa massif. Popular base for climbing expeditions.", type: "hut", isFree: false, capacity: 130, isServiced: true, accessibility: ["foot"], amenities: ["toilet", "water", "food"], latitude: 45.9205, longitude: 7.8671, elevation: 2883 },
  { name: "Matterhorn Hut", description: "Iconic shelter beneath the legendary Matterhorn peak. Essential stop for climbers attempting the Hörnli Ridge.", type: "hut", isFree: false, capacity: 80, isServiced: true, accessibility: ["foot"], amenities: ["toilet", "water", "food", "electricity"], latitude: 45.9763, longitude: 7.6581, elevation: 3260 },
  { name: "Cabane du Mont Fort", type: "hut", isFree: false, capacity: 70, isServiced: true, accessibility: ["foot"], amenities: ["toilet", "water", "food"], latitude: 46.0833, longitude: 7.3000, elevation: 2457 },
  { name: "Refuge des Dix", type: "hut", isFree: false, capacity: 120, isServiced: true, accessibility: ["foot"], amenities: ["toilet", "water", "food", "wifi"], latitude: 46.0167, longitude: 7.5333, elevation: 2928 },
  { name: "Cabane de Moiry", type: "hut", isFree: false, capacity: 110, isServiced: true, accessibility: ["foot"], amenities: ["toilet", "water", "food"], latitude: 46.1167, longitude: 7.6167, elevation: 2825 },
  { name: "Rotondo Hut", type: "hut", isFree: false, capacity: 60, isServiced: true, accessibility: ["foot"], amenities: ["toilet", "water", "food"], latitude: 46.5333, longitude: 8.4333, elevation: 2570 },
  { name: "Doldenhornhütte", type: "hut", isFree: false, capacity: 65, isServiced: true, accessibility: ["foot"], amenities: ["toilet", "water", "food"], latitude: 46.4833, longitude: 7.6833, elevation: 1915 },
  { name: "Grialetsch Hut", type: "hut", isFree: false, capacity: 40, isServiced: true, accessibility: ["foot"], amenities: ["toilet", "water"], latitude: 46.8333, longitude: 10.0833, elevation: 2542 },
  { name: "Val Müstair Shelter", type: "shelter", isFree: true, capacity: 20, isServiced: false, accessibility: ["foot", "bike"], amenities: ["toilet"], latitude: 46.6000, longitude: 10.4333, elevation: 1800 },
  { name: "Engadin Emergency Hut", type: "shelter", isFree: true, capacity: 12, isServiced: false, accessibility: ["foot"], amenities: ["toilet"], latitude: 46.5167, longitude: 9.8167, elevation: 2200 },

  // Austrian Alps
  { name: "Franz Senn Hut", type: "hut", isFree: false, capacity: 170, isServiced: true, accessibility: ["foot"], amenities: ["toilet", "water", "food", "wifi"], latitude: 47.0833, longitude: 11.1500, elevation: 2147 },
  { name: "Similaun Hut", type: "hut", isFree: false, capacity: 80, isServiced: true, accessibility: ["foot"], amenities: ["toilet", "water", "food"], latitude: 46.7833, longitude: 10.8667, elevation: 3019 },
  { name: "Kitzsteinhorn Hut", type: "hut", isFree: false, capacity: 45, isServiced: true, accessibility: ["foot"], amenities: ["toilet", "water", "food", "electricity"], latitude: 47.1833, longitude: 12.7333, elevation: 2261 },
  { name: "Dachstein Hut", type: "hut", isFree: false, capacity: 95, isServiced: true, accessibility: ["foot"], amenities: ["toilet", "water", "food"], latitude: 47.5500, longitude: 13.6167, elevation: 2741 },
  { name: "Warnsdorfer Hut", type: "hut", isFree: false, capacity: 55, isServiced: true, accessibility: ["foot"], amenities: ["toilet", "water", "food"], latitude: 47.0167, longitude: 12.9333, elevation: 2336 },
  { name: "Glorer Hut", type: "hut", isFree: false, capacity: 40, isServiced: true, accessibility: ["foot"], amenities: ["toilet", "water", "food"], latitude: 47.1000, longitude: 12.4000, elevation: 2651 },
  { name: "Hochschober Hut", type: "hut", isFree: false, capacity: 60, isServiced: true, accessibility: ["foot"], amenities: ["toilet", "water", "food"], latitude: 47.0667, longitude: 12.3333, elevation: 2322 },
  { name: "Tyrol Valley Shelter", type: "shelter", isFree: true, capacity: 15, isServiced: false, accessibility: ["foot", "bike"], amenities: ["toilet"], latitude: 47.2000, longitude: 11.8000, elevation: 1650 },
  { name: "Ötztal Emergency Hut", type: "shelter", isFree: true, capacity: 8, isServiced: false, accessibility: ["foot"], amenities: ["toilet"], latitude: 46.9000, longitude: 10.9000, elevation: 2800 },
  { name: "Salzburg Alpine Shelter", type: "shelter", isFree: true, capacity: 18, isServiced: false, accessibility: ["foot"], amenities: ["toilet", "water"], latitude: 47.4000, longitude: 13.2000, elevation: 1900 },

  // Italian Alps
  { name: "Rifugio Torino", type: "hut", isFree: false, capacity: 75, isServiced: true, accessibility: ["foot"], amenities: ["toilet", "water", "food", "electricity"], latitude: 45.8500, longitude: 6.8833, elevation: 3375 },
  { name: "Rifugio Gonella", type: "hut", isFree: false, capacity: 55, isServiced: true, accessibility: ["foot"], amenities: ["toilet", "water", "food"], latitude: 45.8167, longitude: 6.9167, elevation: 3071 },
  { name: "Rifugio Elisabetta", type: "hut", isFree: false, capacity: 40, isServiced: true, accessibility: ["foot"], amenities: ["toilet", "water", "food"], latitude: 45.7833, longitude: 6.9500, elevation: 2195 },
  { name: "Rifugio Vittorio Sella", type: "hut", isFree: false, capacity: 65, isServiced: true, accessibility: ["foot"], amenities: ["toilet", "water", "food"], latitude: 45.9167, longitude: 7.8667, elevation: 2584 },
  { name: "Rifugio Quintino Sella", type: "hut", isFree: false, capacity: 85, isServiced: true, accessibility: ["foot"], amenities: ["toilet", "water", "food", "wifi"], latitude: 45.9333, longitude: 7.8833, elevation: 3585 },
  { name: "Rifugio Benevolo", type: "hut", isFree: false, capacity: 50, isServiced: true, accessibility: ["foot"], amenities: ["toilet", "water", "food"], latitude: 45.6667, longitude: 7.3333, elevation: 2285 },
  { name: "Rifugio Coda", type: "hut", isFree: false, capacity: 30, isServiced: true, accessibility: ["foot"], amenities: ["toilet", "water"], latitude: 45.8000, longitude: 7.1000, elevation: 2280 },
  { name: "Val d'Aosta Shelter", type: "shelter", isFree: true, capacity: 12, isServiced: false, accessibility: ["foot"], amenities: ["toilet"], latitude: 45.7000, longitude: 7.4000, elevation: 2100 },
  { name: "Dolomites Emergency Hut", type: "shelter", isFree: true, capacity: 16, isServiced: false, accessibility: ["foot", "bike"], amenities: ["toilet", "water"], latitude: 46.5000, longitude: 12.0000, elevation: 2300 },
  { name: "Piedmont Valley Shelter", type: "shelter", isFree: true, capacity: 10, isServiced: false, accessibility: ["foot"], amenities: ["toilet"], latitude: 45.5000, longitude: 7.2000, elevation: 1800 },

  // French Alps
  { name: "Refuge du Goûter", type: "hut", isFree: false, capacity: 120, isServiced: true, accessibility: ["foot"], amenities: ["toilet", "water", "food", "wifi"], latitude: 45.8500, longitude: 6.8167, elevation: 3835 },
  { name: "Refuge de Tête Rousse", type: "hut", isFree: false, capacity: 70, isServiced: true, accessibility: ["foot"], amenities: ["toilet", "water", "food"], latitude: 45.8333, longitude: 6.8000, elevation: 3167 },
  { name: "Refuge du Nid d'Aigle", type: "hut", isFree: false, capacity: 40, isServiced: true, accessibility: ["foot"], amenities: ["toilet", "water"], latitude: 45.8167, longitude: 6.7833, elevation: 2372 },
  { name: "Refuge des Cosmiques", type: "hut", isFree: false, capacity: 148, isServiced: true, accessibility: ["foot"], amenities: ["toilet", "water", "food", "electricity"], latitude: 45.8667, longitude: 6.8833, elevation: 3613 },
  { name: "Refuge Albert Premier", type: "hut", isFree: false, capacity: 110, isServiced: true, accessibility: ["foot"], amenities: ["toilet", "water", "food"], latitude: 46.0000, longitude: 7.0333, elevation: 2702 },
  { name: "Refuge de l'Aigle", type: "hut", isFree: false, capacity: 35, isServiced: true, accessibility: ["foot"], amenities: ["toilet", "water", "food"], latitude: 45.9500, longitude: 6.9000, elevation: 3450 },
  { name: "Refuge du Plan", type: "hut", isFree: false, capacity: 50, isServiced: true, accessibility: ["foot"], amenities: ["toilet", "water", "food"], latitude: 45.9167, longitude: 6.9167, elevation: 2050 },
  { name: "Chamonix Valley Shelter", type: "shelter", isFree: true, capacity: 14, isServiced: false, accessibility: ["foot", "bike"], amenities: ["toilet"], latitude: 45.9000, longitude: 6.8500, elevation: 1600 },
  { name: "Mont Blanc Emergency Hut", type: "shelter", isFree: true, capacity: 8, isServiced: false, accessibility: ["foot"], amenities: ["toilet"], latitude: 45.8300, longitude: 6.8000, elevation: 2800 },
  { name: "Savoy Alpine Shelter", type: "shelter", isFree: true, capacity: 20, isServiced: false, accessibility: ["foot"], amenities: ["toilet", "water"], latitude: 45.7000, longitude: 6.7000, elevation: 1900 },

  // German Alps
  { name: "Watzmannhaus", type: "hut", isFree: false, capacity: 90, isServiced: true, accessibility: ["foot"], amenities: ["toilet", "water", "food"], latitude: 47.5667, longitude: 12.9167, elevation: 1930 },
  { name: "Kärlingerhaus", type: "hut", isFree: false, capacity: 80, isServiced: true, accessibility: ["foot"], amenities: ["toilet", "water", "food"], latitude: 47.5833, longitude: 12.8833, elevation: 1631 },
  { name: "Blaueishütte", type: "hut", isFree: false, capacity: 60, isServiced: true, accessibility: ["foot"], amenities: ["toilet", "water", "food"], latitude: 47.5500, longitude: 12.8500, elevation: 1651 },
  { name: "Münchner Haus", type: "hut", isFree: false, capacity: 108, isServiced: true, accessibility: ["foot"], amenities: ["toilet", "water", "food", "wifi"], latitude: 47.4167, longitude: 10.9833, elevation: 2959 },
  { name: "Knorrhütte", type: "hut", isFree: false, capacity: 65, isServiced: true, accessibility: ["foot"], amenities: ["toilet", "water", "food"], latitude: 47.4000, longitude: 11.0667, elevation: 2051 },
  { name: "Schneefernerhaus", type: "hut", isFree: false, capacity: 45, isServiced: true, accessibility: ["foot"], amenities: ["toilet", "water", "food", "electricity"], latitude: 47.4167, longitude: 10.9833, elevation: 2650 },
  { name: "Bavaria Mountain Shelter", type: "shelter", isFree: true, capacity: 16, isServiced: false, accessibility: ["foot", "bike"], amenities: ["toilet"], latitude: 47.5000, longitude: 12.5000, elevation: 1700 },
  { name: "Berchtesgaden Emergency Hut", type: "shelter", isFree: true, capacity: 12, isServiced: false, accessibility: ["foot"], amenities: ["toilet"], latitude: 47.6000, longitude: 13.0000, elevation: 1850 },

  // Slovenian Alps
  { name: "Kredarica Hut", type: "hut", isFree: false, capacity: 180, isServiced: true, accessibility: ["foot"], amenities: ["toilet", "water", "food", "wifi"], latitude: 46.3783, longitude: 13.8419, elevation: 2515 },
  { name: "Triglav Hut", type: "hut", isFree: false, capacity: 65, isServiced: true, accessibility: ["foot"], amenities: ["toilet", "water", "food"], latitude: 46.3833, longitude: 13.8333, elevation: 2864 },
  { name: "Vodnikov Dom", type: "hut", isFree: false, capacity: 70, isServiced: true, accessibility: ["foot"], amenities: ["toilet", "water", "food"], latitude: 46.3500, longitude: 13.8000, elevation: 1817 },
  { name: "Dom Planika", type: "hut", isFree: false, capacity: 45, isServiced: true, accessibility: ["foot"], amenities: ["toilet", "water", "food"], latitude: 46.3667, longitude: 13.8167, elevation: 2401 },
  { name: "Julian Alps Shelter", type: "shelter", isFree: true, capacity: 18, isServiced: false, accessibility: ["foot"], amenities: ["toilet", "water"], latitude: 46.4000, longitude: 13.7000, elevation: 1950 },
  { name: "Vipava Valley Shelter", type: "shelter", isFree: true, capacity: 14, isServiced: false, accessibility: ["foot", "bike"], amenities: ["toilet"], latitude: 46.0000, longitude: 14.0000, elevation: 1600 },

  // Carpathian Mountains (Romania)
  { name: "Cabana Omu", type: "hut", isFree: false, capacity: 85, isServiced: true, accessibility: ["foot"], amenities: ["toilet", "water", "food", "electricity"], latitude: 45.4167, longitude: 25.4667, elevation: 2507 },
  { name: "Cabana Malaiesti", type: "hut", isFree: false, capacity: 60, isServiced: true, accessibility: ["foot"], amenities: ["toilet", "water", "food"], latitude: 45.3833, longitude: 25.4833, elevation: 1724 },
  { name: "Cabana Piatra Arsa", type: "hut", isFree: false, capacity: 40, isServiced: true, accessibility: ["foot"], amenities: ["toilet", "water"], latitude: 45.4000, longitude: 25.4000, elevation: 1950 },
  { name: "Retezat Mountain Hut", type: "hut", isFree: false, capacity: 35, isServiced: true, accessibility: ["foot"], amenities: ["toilet", "water", "food"], latitude: 45.3667, longitude: 22.8833, elevation: 2040 },
  { name: "Fagaras Emergency Shelter", type: "shelter", isFree: true, capacity: 12, isServiced: false, accessibility: ["foot"], amenities: ["toilet"], latitude: 45.6000, longitude: 24.7000, elevation: 2100 },
  { name: "Bucegi Valley Shelter", type: "shelter", isFree: true, capacity: 20, isServiced: false, accessibility: ["foot", "bike"], amenities: ["toilet", "water"], latitude: 45.4000, longitude: 25.5000, elevation: 1800 },

  // Pyrenees (Spain/France border)
  { name: "Refugio de Goriz", type: "hut", isFree: false, capacity: 90, isServiced: true, accessibility: ["foot"], amenities: ["toilet", "water", "food"], latitude: 42.6667, longitude: -0.0333, elevation: 2200 },
  { name: "Refugio Angel Orus", type: "hut", isFree: false, capacity: 70, isServiced: true, accessibility: ["foot"], amenities: ["toilet", "water", "food"], latitude: 42.7000, longitude: 0.6667, elevation: 2100 },
  { name: "Refuge d'Espingo", type: "hut", isFree: false, capacity: 45, isServiced: true, accessibility: ["foot"], amenities: ["toilet", "water", "food"], latitude: 42.7833, longitude: 0.5333, elevation: 1967 },
  { name: "Refuge des Oulettes", type: "hut", isFree: false, capacity: 55, isServiced: true, accessibility: ["foot"], amenities: ["toilet", "water", "food"], latitude: 42.9167, longitude: -0.1833, elevation: 3100 },
  { name: "Pyrenees Valley Shelter", type: "shelter", isFree: true, capacity: 15, isServiced: false, accessibility: ["foot"], amenities: ["toilet"], latitude: 42.8000, longitude: 0.5000, elevation: 1650 },
  { name: "Aragon Emergency Hut", type: "shelter", isFree: true, capacity: 10, isServiced: false, accessibility: ["foot"], amenities: ["toilet"], latitude: 42.6500, longitude: -0.2000, elevation: 1950 },

  // Additional scattered shelters
  { name: "Black Forest Shelter", type: "shelter", isFree: true, capacity: 22, isServiced: false, accessibility: ["foot", "bike"], amenities: ["toilet", "water"], latitude: 48.0000, longitude: 8.0000, elevation: 1200 },
  { name: "Vosges Mountain Hut", type: "hut", isFree: false, capacity: 30, isServiced: true, accessibility: ["foot"], amenities: ["toilet", "water", "food"], latitude: 48.1000, longitude: 7.0000, elevation: 1350 },
  { name: "Tatra Emergency Shelter", type: "shelter", isFree: true, capacity: 8, isServiced: false, accessibility: ["foot"], amenities: ["toilet"], latitude: 49.2000, longitude: 20.0000, elevation: 2000 },
]

async function main() {
  console.log('Starting to seed database...')

  // Clear existing data
  await prisma.photo.deleteMany()
  await prisma.review.deleteMany()
  await prisma.trip.deleteMany()
  await prisma.shelter.deleteMany()

  console.log('Cleared existing data.')

  // Insert shelters
  for (const shelter of shelters) {
    await prisma.shelter.create({
      data: shelter,
    })
  }

  console.log(`Seeded ${shelters.length} shelters.`)

  // Sample reviews will be added when users register and test the app
  console.log('Shelters seeded successfully. Reviews can be added via the UI after user registration.')

  console.log('Database seeding completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })