import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-5xl font-bold tracking-tight text-foreground mb-6">
          Find Your Perfect
          <span className="text-primary"> Mountain Shelter</span>
        </h1>

        <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
          Discover mountain shelters and huts for your next adventure. Plan trips,
          find emergency shelter, and explore the great outdoors with confidence.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
          <Button asChild size="lg" className="w-full sm:w-auto min-w-[200px]">
            <Link href="/map">
              Open Map
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="w-full sm:w-auto min-w-[200px]">
            <Link href="/discover">
              Discover Shelters
            </Link>
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-8 text-left">
          <div className="p-6 border border-border rounded-lg">
            <h3 className="text-lg font-semibold mb-3">Interactive Map</h3>
            <p className="text-muted-foreground">
              Explore shelters on an interactive map with filters for type, capacity, and amenities.
            </p>
          </div>
          <div className="p-6 border border-border rounded-lg">
            <h3 className="text-lg font-semibold mb-3">Trip Planning</h3>
            <p className="text-muted-foreground">
              Plan multi-stage trips with time and elevation calculations for your adventures.
            </p>
          </div>
          <div className="p-6 border border-border rounded-lg">
            <h3 className="text-lg font-semibold mb-3">Emergency Finder</h3>
            <p className="text-muted-foreground">
              Quickly find the nearest shelter in emergency situations with basic routing.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
