# InfluencerMatch - Influencer Recommendation Platform

AI-powered platform to match brands with social media influencers based on reach, engagement, and ROI. Find the perfect influencer for your campaign across Instagram, YouTube, TikTok, and Twitter.

## Features

- **Smart Search & Discovery**: Browse and filter influencers by platform, niche, followers, engagement rate, and budget
- **AI-Powered Recommendations**: Get personalized influencer recommendations based on your brand's needs
- **Engagement Analytics**: View detailed metrics including engagement rates, followers, likes, comments, and views
- **Audience Demographics**: Understand influencer audiences by age, gender, location, and interests
- **Transparent Pricing**: See upfront pricing for different content types (posts, stories, reels, videos)
- **Multi-Platform Support**: Find influencers across Instagram, YouTube, TikTok, and Twitter

## Tech Stack

- **Frontend & Backend**: Next.js 14 (App Router with TypeScript)
- **Database**: PostgreSQL with Prisma ORM
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ installed
- PostgreSQL database (local or Supabase free tier)

### Installation

1. **Install dependencies**:
```bash
npm install
```

2. **Set up your database**:

**Option A: Use Supabase (Recommended for deployment)**
- Go to [https://supabase.com](https://supabase.com) and create a free account
- Create a new project
- Go to Settings > Database > Connection string > URI
- Copy the connection string

**Option B: Use local PostgreSQL**
- Install PostgreSQL if you don't have it
- Create a database named `influencer_platform`

3. **Configure environment variables**:
Update the `.env` file with your database connection string:
```env
DATABASE_URL="your-database-url-here"
```

For Supabase, it will look like:
```env
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres"
```

For local PostgreSQL:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/influencer_platform"
```

4. **Push the database schema**:
```bash
npm run db:push
```

This will create all the necessary tables in your database.

5. **Seed the database with sample data**:
```bash
npm run db:seed
```

This will add 5 sample influencers with complete data (engagement metrics, audience demographics, pricing) to test the platform.

6. **Run the development server**:
```bash
npm run dev
```

7. **Open your browser**:
Navigate to [http://localhost:3000](http://localhost:3000)

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the production application
- `npm start` - Start the production server
- `npm run lint` - Run ESLint
- `npm run db:push` - Push Prisma schema to database
- `npm run db:seed` - Seed database with sample data
- `npm run db:studio` - Open Prisma Studio to view/edit database

## Project Structure

```
influencer-platform/
├── app/                      # Next.js app directory
│   ├── layout.tsx           # Root layout with navigation
│   ├── page.tsx             # Homepage
│   ├── api/                 # API routes (to be added)
│   ├── discover/            # Search & filter page (to be added)
│   ├── recommendations/     # AI matching page (to be added)
│   ├── influencer/[id]/     # Individual profile page (to be added)
│   └── admin/               # Admin dashboard (to be added)
├── components/              # React components
│   └── Navigation.tsx       # Main navigation bar
├── lib/                     # Utility functions
│   ├── prisma.ts           # Prisma client
│   └── utils.ts            # Helper functions
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── seed.ts             # Sample data
└── public/                 # Static files
```

## Database Schema

### Tables

**Influencers**
- Basic info: name, bio, profile image, primary platform, niche, location

**Social Accounts**
- Platform-specific accounts with metrics: followers, engagement rate, avg likes/comments/views

**Audience Demographics**
- Age groups, gender split, top countries, interests

**Pricing**
- Content type pricing (posts, stories, reels, videos, tweets)

**Brands** (for future use)
- Brand profiles with target audience and budget

## Deployment

### Deploy to Vercel (Free)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Add your `DATABASE_URL` environment variable
5. Deploy

Vercel's free tier includes:
- Unlimited bandwidth
- Automatic HTTPS
- Preview deployments
- Built-in analytics

### Database Hosting

Use Supabase free tier:
- 500MB database storage
- 2GB bandwidth
- 50K monthly active users
- No credit card required

## Roadmap

### Phase 1: Foundation ✅
- [x] Next.js setup with TypeScript
- [x] Database schema with Prisma
- [x] Homepage with navigation
- [x] Seed data with sample influencers

### Phase 2: Core Features (In Progress)
- [ ] API routes for CRUD operations
- [ ] Discovery page with search and filters
- [ ] Influencer profile pages
- [ ] Admin dashboard for data entry

### Phase 3: Advanced Features
- [ ] Recommendation engine with scoring algorithm
- [ ] ROI calculations and predictions
- [ ] Advanced analytics and charts
- [ ] Export functionality

### Phase 4: Future Enhancements
- [ ] Brand accounts and saved searches
- [ ] Messaging system
- [ ] Campaign tracking
- [ ] Social media API integrations
- [ ] ML-based predictions

## Cost Breakdown (Free Tier)

| Service | Free Tier | Usage |
|---------|-----------|-------|
| Vercel Hosting | Unlimited bandwidth | ✅ Free |
| Supabase Database | 500MB storage | ✅ Free |
| Supabase Storage | 1GB files | ✅ Free |
| Vercel Analytics | Basic metrics | ✅ Free |

**Total Monthly Cost: $0**

---

Built with Next.js, Prisma, and Tailwind CSS
