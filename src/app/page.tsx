import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen w-full relative overflow-hidden" style={{ height: '100vh', width: '100vw' }}>
      {/* Background Image */}
      <div
        className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(/Back_img.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          backgroundAttachment: 'fixed',
          minHeight: '100vh',
          width: '100vw',
        }}
      ></div>

      {/* Content */}
      <div className="relative z-20 min-h-screen flex items-start justify-center" style={{ paddingTop: '40px' }}>
        <div className="container mx-auto px-4 py-12 w-full">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h1 className="text-5xl font-bold tracking-tight mb-6" style={{ color: '#202020' }}>
              Find Your Perfect
              <span style={{ color: '#202020' }}> Mountain Shelter</span>
            </h1>

            <p className="text-xl mb-12 max-w-2xl mx-auto" style={{ color: '#202020' }}>
              Discover mountain shelters and huts for your next adventure. Plan trips,
              find emergency shelter, and explore the great outdoors with confidence.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <Button asChild size="lg" className="w-full sm:w-auto min-w-[200px]">
                <Link href="/map">
                  Open Map
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full sm:w-auto min-w-[200px]" style={{ color: '#202020' }}>
                <Link href="/discover" style={{ color: '#202020' }}>
                  Discover Shelters
                </Link>
              </Button>
            </div>

            <div className="grid md:grid-cols-3 gap-8 text-left">
              <div className="p-6 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg">
                <h3 className="text-lg font-semibold mb-3 text-white">Interactive Map</h3>
                <p className="text-gray-200">
                  Explore shelters on an interactive map with filters for type, capacity, and amenities.
                </p>
              </div>
              <div className="p-6 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg">
                <h3 className="text-lg font-semibold mb-3 text-white">Trip Planning</h3>
                <p className="text-gray-200">
                  Plan multi-stage trips with time and elevation calculations for your adventures.
                </p>
              </div>
              <div className="p-6 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg">
                <h3 className="text-lg font-semibold mb-3 text-white">Emergency Finder</h3>
                <p className="text-gray-200">
                  Quickly find the nearest shelter in emergency situations with basic routing.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}