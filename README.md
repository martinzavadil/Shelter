# Sheltr - Mountain Shelters & Huts

A comprehensive web application for finding and managing mountain shelters and huts. Built as an 8-hour sprint MVP with modern web technologies.

## Features

- 🗺️ Interactive map with 50+ mountain shelters
- 🔍 Full-text search and advanced filters
- 📝 Shelter reviews and photo uploads
- 🧭 Trip planning with elevation calculations
- 🚨 Emergency shelter finder
- 📱 Responsive design for mobile and desktop

## Tech Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS, Shadcn UI
- **Backend**: Next.js API routes + tRPC
- **Database**: Supabase/Postgres with PostGIS
- **Maps**: Leaflet + OpenStreetMap
- **Authentication**: NextAuth (email/password)
- **Testing**: Playwright
- **Hosting**: Vercel

## Getting Started

### 1. Clone and Install

```bash
git clone <repository-url>
cd sheltr
npm install
```

### 2. Environment Setup

Copy the environment example file:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your configuration:

```bash
# Required: Database connection
DATABASE_URL="postgresql://username:password@localhost:5432/sheltr_db"

# Required: NextAuth configuration
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"

# Optional: Supabase for additional features
SUPABASE_URL="https://your-project-id.supabase.co"
SUPABASE_ANON_KEY="your-supabase-anon-key"
SUPABASE_STORAGE_BUCKET="shelter-photos"
```

### 3. Database Setup

Generate Prisma client and push schema:

```bash
npm run db:generate
npm run db:push
```

Seed the database with sample shelters:

```bash
npm run db:seed
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

### 5. Run Tests

```bash
npm run test           # Run Playwright tests
npm run test:headed    # Run tests with browser UI
npm run lint          # Run ESLint
```

## Project Structure

```
src/
├── app/                 # Next.js app router pages
├── components/          # React components
│   ├── ui/             # Shadcn UI components
│   └── layout/         # Layout components
├── lib/                # Utilities and configurations
└── styles/             # Global styles
```

## Development

- Uses Node.js 20 (see `.nvmrc`)
- Prettier configured for code formatting
- ESLint for code linting
- TypeScript for type safety

## Deployment

### Deploy to Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/sheltr)

#### Manual Deployment:

1. **Create Vercel Project:**
   ```bash
   npx vercel --prod
   ```

2. **Set Environment Variables:**
   In your Vercel dashboard, add these environment variables:
   ```
   DATABASE_URL=postgresql://...
   NEXTAUTH_SECRET=your-secret-here
   NEXTAUTH_URL=https://your-app.vercel.app
   SUPABASE_URL=https://...
   SUPABASE_ANON_KEY=...
   SUPABASE_STORAGE_BUCKET=shelter-photos
   ```

3. **Database Setup:**
   Run migrations on your production database:
   ```bash
   npx prisma db push --schema=./prisma/schema.prisma
   npx prisma db seed
   ```

### Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | ✅ | Random secret for NextAuth |
| `NEXTAUTH_URL` | ✅ | Your app's URL |
| `SUPABASE_URL` | ❌ | Supabase project URL |
| `SUPABASE_ANON_KEY` | ❌ | Supabase anonymous key |
| `SUPABASE_STORAGE_BUCKET` | ❌ | Storage bucket name |

## Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run test         # Run Playwright tests
npm run test:ui      # Interactive test runner
npm run test:headed  # Tests with browser UI
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema to database
npm run db:studio    # Open Prisma Studio
npm run db:seed      # Seed database with sample data
```

## Contributing

This is an MVP built in a sprint format. See the technical documentation for detailed architecture and implementation notes.
