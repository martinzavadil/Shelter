# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Sheltr is a Next.js 15 application for finding and managing mountain shelters and huts. It's built with TypeScript, Tailwind CSS, and uses both Prisma and Supabase in a hybrid architecture for data management.

## Development Commands

```bash
# Development
npm run dev          # Start dev server with Turbopack
npm run build        # Build for production with Turbopack
npm run start        # Start production server

# Database
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema to database
npm run db:studio    # Open Prisma Studio
npm run db:seed      # Seed database with sample data

# Testing & Quality
npm run test         # Run Playwright tests
npm run test:ui      # Interactive test runner
npm run test:headed  # Tests with browser UI
npm run lint         # Run ESLint
```

## Architecture

### Hybrid Database Architecture
The application uses a hybrid Prisma + Supabase approach:
- **Prisma**: Primary ORM with schema definition and client generation
- **Supabase**: Direct client for performance-critical operations and storage
- **Migration**: Many API routes have been converted from Prisma to Supabase for better performance

### Key Components Structure
```
src/
├── app/
│   ├── api/                 # Next.js API routes (mostly converted to Supabase)
│   ├── (auth)/             # Authentication pages
│   ├── discover/           # Search and discovery features
│   ├── my-lists/           # User's wishlist and visited shelters
│   ├── profile/            # User profile with shelter lists
│   └── shelter/[id]/       # Individual shelter details
├── components/
│   ├── ui/                 # Shadcn/ui components
│   ├── map/                # Leaflet-based map components
│   ├── shelter/            # Shelter-specific components
│   ├── trip/               # Trip planning components
│   └── emergency/          # Emergency shelter finder
└── lib/
    ├── auth.ts             # NextAuth configuration
    ├── prisma.ts           # Prisma client
    ├── supabase.ts         # Supabase clients
    └── utils.ts            # Utility functions
```

### API Architecture
Most API routes have been migrated from Prisma to Supabase for better performance:
- **Authentication**: Still uses Prisma via NextAuth adapter
- **Shelter operations**: Converted to Supabase (`/api/shelters/*`)
- **Photos**: Supabase Storage with local fallback (`/api/photos`)
- **Lists**: User's wishlist/visited shelters (`/api/shelter-lists`)
- **Emergency**: Nearest shelter finder (`/api/emergency/nearest-shelter`)

### Database Schema
Core entities:
- **Shelters**: Mountain huts/shelters with geodata, amenities, accessibility
- **Photos**: File uploads stored in Supabase Storage with fallback to local
- **Reviews**: User ratings and comments
- **Trips**: Trip planning with shelter sequences
- **Users**: NextAuth-managed authentication
- **ShelterLists**: User's wishlist and visited shelters

### Key Features
1. **Interactive Map**: Leaflet with OpenStreetMap, clustering, GPX import
2. **Search & Filters**: Full-text search with advanced filtering
3. **Photo Upload**: Supabase Storage with local fallback
4. **Trip Planning**: Multi-shelter route planning with elevation
5. **Emergency Mode**: GPS-based nearest shelter finder
6. **User Lists**: Wishlist and visited shelter tracking

## Environment Configuration

Required environment variables:
```bash
# Database
DATABASE_URL="postgresql://..."              # Prisma connection
NEXT_PUBLIC_SUPABASE_URL="https://..."       # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."          # Supabase anon key
SUPABASE_SERVICE_KEY="..."                   # Supabase service role key

# Authentication
NEXTAUTH_SECRET="..."                        # Random secret for NextAuth
NEXTAUTH_URL="http://localhost:3000"         # App URL

# Storage (optional)
SUPABASE_STORAGE_BUCKET="shelter-photos"     # Storage bucket name
```

## Database Setup

1. **Initial setup**:
   ```bash
   npm run db:generate
   npm run db:push
   npm run db:seed
   ```

2. **Supabase Storage setup** (if bucket doesn't exist):
   ```sql
   INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
   VALUES ('shelter-photos', 'shelter-photos', true, 52428800,
           ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']);
   ```

## Important Implementation Notes

### Photo Upload System
- Uses Supabase Storage as primary, local filesystem as fallback
- Files are stored with shelter-specific paths: `{shelterId}/{timestamp}-{random}.{ext}`
- Enforces 5 photos max per shelter, 3MB max file size
- Supports JPG, PNG formats

### Authentication Flow
- NextAuth with credentials provider
- Prisma adapter for user management
- JWT strategy for sessions
- Custom login page at `/login`

### Map Integration
- Leaflet with react-leaflet
- Marker clustering for performance
- GPX file import for routes
- Responsive design for mobile

### API Error Handling
- All API routes have comprehensive error handling
- Photo upload has fallback mechanism
- Consistent error response format

## Testing

- **Playwright**: E2E testing framework
- **Test commands**: Use `npm run test:ui` for interactive debugging
- **Coverage**: Focus on critical user flows (auth, search, upload)

## Deployment

- **Platform**: Designed for Vercel deployment
- **Database**: PostgreSQL with PostGIS extension
- **Storage**: Supabase Storage with local fallback
- **Build**: Uses Turbopack for faster builds

## Development Tips

1. **Database changes**: Always update both Prisma schema and Supabase accordingly
2. **Photo uploads**: Test both Supabase Storage and local fallback scenarios
3. **Maps**: Leaflet requires dynamic imports due to SSR issues
4. **Performance**: Large shelter datasets benefit from Supabase's optimized queries
5. **Authentication**: User ID is available in session.user.id after authentication