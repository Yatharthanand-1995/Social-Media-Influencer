import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import 'dotenv/config'

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)

const prisma = new PrismaClient({
  adapter,
  log: ['error'],
})

const additionalInfluencers = [
  {
    name: 'Alex Gaming Pro',
    bio: 'Professional gamer & streamer | FPS expert | Tournament champion',
    primaryPlatform: 'youtube' as const,
    niche: ['gaming', 'tech'],
    location: 'Seattle, WA',
    profileImageUrl: 'https://ui-avatars.com/api/?name=Alex+Gaming&size=200',
    socialAccounts: [{
      platform: 'youtube' as const,
      handle: '@AlexGamingPro',
      followersCount: 2100000,
      avgViews: 450000,
      avgLikes: 32000,
      avgComments: 1200,
      engagementRate: 1.58,
      ageGroup: { '18-24': 52, '25-34': 35, '35-44': 10, '45+': 3 },
      genderSplit: { male: 85, female: 13, other: 2 },
      topCountries: ['US', 'UK', 'CA', 'DE'],
      interests: ['gaming', 'esports', 'technology', 'streaming'],
      pricing: [{ contentType: 'video', priceMin: 15000, priceMax: 22000 }]
    }]
  },
  {
    name: 'Bella Beauty',
    bio: 'Makeup artist & beauty guru | Cruelty-free advocate | 1M+ following',
    primaryPlatform: 'instagram' as const,
    niche: ['beauty', 'fashion', 'lifestyle'],
    location: 'London, UK',
    profileImageUrl: 'https://ui-avatars.com/api/?name=Bella+Beauty&size=200',
    socialAccounts: [{
      platform: 'instagram' as const,
      handle: '@bellabbeauty',
      followersCount: 1250000,
      avgViews: 85000,
      avgLikes: 68000,
      avgComments: 950,
      engagementRate: 5.51,
      ageGroup: { '18-24': 42, '25-34': 38, '35-44': 15, '45+': 5 },
      genderSplit: { female: 89, male: 9, other: 2 },
      topCountries: ['UK', 'US', 'CA', 'AU'],
      interests: ['beauty', 'makeup', 'skincare', 'fashion'],
      pricing: [
        { contentType: 'post', priceMin: 8000, priceMax: 12000 },
        { contentType: 'reel', priceMin: 12000, priceMax: 18000 }
      ]
    }]
  },
  {
    name: 'Mike Outdoor Adventures',
    bio: 'Hiking enthusiast | National Parks explorer | Adventure photographer',
    primaryPlatform: 'instagram' as const,
    niche: ['travel', 'lifestyle', 'fitness'],
    location: 'Denver, CO',
    profileImageUrl: 'https://ui-avatars.com/api/?name=Mike+Outdoor&size=200',
    socialAccounts: [{
      platform: 'instagram' as const,
      handle: '@mikeoutdoors',
      followersCount: 780000,
      avgViews: 62000,
      avgLikes: 45000,
      avgComments: 680,
      engagementRate: 5.86,
      ageGroup: { '18-24': 25, '25-34': 45, '35-44': 22, '45+': 8 },
      genderSplit: { male: 58, female: 40, other: 2 },
      topCountries: ['US', 'CA', 'UK', 'AU', 'NZ'],
      interests: ['hiking', 'camping', 'photography', 'nature'],
      pricing: [
        { contentType: 'post', priceMin: 4500, priceMax: 6500 },
        { contentType: 'reel', priceMin: 7000, priceMax: 10000 }
      ]
    }]
  },
  {
    name: 'Nina Vegan Kitchen',
    bio: 'Plant-based chef | Cookbook author | Making vegan delicious',
    primaryPlatform: 'tiktok' as const,
    niche: ['food', 'lifestyle', 'health'],
    location: 'Portland, OR',
    profileImageUrl: 'https://ui-avatars.com/api/?name=Nina+Vegan&size=200',
    socialAccounts: [{
      platform: 'tiktok' as const,
      handle: '@ninavegankitchen',
      followersCount: 1850000,
      avgViews: 520000,
      avgLikes: 68000,
      avgComments: 1300,
      engagementRate: 3.75,
      ageGroup: { '18-24': 35, '25-34': 45, '35-44': 15, '45+': 5 },
      genderSplit: { female: 75, male: 23, other: 2 },
      topCountries: ['US', 'UK', 'CA', 'AU'],
      interests: ['vegan', 'cooking', 'health', 'sustainability'],
      pricing: [{ contentType: 'video', priceMin: 9000, priceMax: 14000 }]
    }]
  },
  {
    name: 'David DIY Home',
    bio: 'Home improvement expert | Woodworking | DIY projects made simple',
    primaryPlatform: 'youtube' as const,
    niche: ['lifestyle', 'diy'],
    location: 'Austin, TX',
    profileImageUrl: 'https://ui-avatars.com/api/?name=David+DIY&size=200',
    socialAccounts: [{
      platform: 'youtube' as const,
      handle: '@DavidDIYHome',
      followersCount: 1450000,
      avgViews: 280000,
      avgLikes: 19000,
      avgComments: 850,
      engagementRate: 1.37,
      ageGroup: { '25-34': 38, '35-44': 35, '45+': 20, '18-24': 7 },
      genderSplit: { male: 72, female: 26, other: 2 },
      topCountries: ['US', 'CA', 'UK', 'AU'],
      interests: ['DIY', 'woodworking', 'home improvement', 'tools'],
      pricing: [{ contentType: 'video', priceMin: 10000, priceMax: 15000 }]
    }]
  },
  {
    name: 'Sophia Finance Tips',
    bio: 'CPA | Personal finance educator | Helping you build wealth',
    primaryPlatform: 'instagram' as const,
    niche: ['finance', 'lifestyle'],
    location: 'New York, NY',
    profileImageUrl: 'https://ui-avatars.com/api/?name=Sophia+Finance&size=200',
    socialAccounts: [{
      platform: 'instagram' as const,
      handle: '@sophiafinance',
      followersCount: 520000,
      avgViews: 38000,
      avgLikes: 26000,
      avgComments: 420,
      engagementRate: 5.08,
      ageGroup: { '25-34': 48, '35-44': 32, '18-24': 15, '45+': 5 },
      genderSplit: { female: 62, male: 36, other: 2 },
      topCountries: ['US', 'CA', 'UK'],
      interests: ['finance', 'investing', 'budgeting', 'career'],
      pricing: [
        { contentType: 'post', priceMin: 3500, priceMax: 5000 },
        { contentType: 'story', priceMin: 1200, priceMax: 1800 }
      ]
    }]
  },
  {
    name: 'Ryan Photography',
    bio: 'Professional photographer | Portrait & landscape specialist | Teaching photo skills',
    primaryPlatform: 'instagram' as const,
    niche: ['photography', 'art', 'lifestyle'],
    location: 'San Diego, CA',
    profileImageUrl: 'https://ui-avatars.com/api/?name=Ryan+Photo&size=200',
    socialAccounts: [{
      platform: 'instagram' as const,
      handle: '@ryanphotography',
      followersCount: 680000,
      avgViews: 55000,
      avgLikes: 42000,
      avgComments: 580,
      engagementRate: 6.26,
      ageGroup: { '18-24': 35, '25-34': 42, '35-44': 18, '45+': 5 },
      genderSplit: { male: 54, female: 44, other: 2 },
      topCountries: ['US', 'UK', 'CA', 'AU', 'JP'],
      interests: ['photography', 'art', 'travel', 'nature'],
      pricing: [
        { contentType: 'post', priceMin: 4200, priceMax: 6000 },
        { contentType: 'reel', priceMin: 6500, priceMax: 9000 }
      ]
    }]
  },
  {
    name: 'Jessica Yoga Flow',
    bio: 'Certified yoga instructor | Mindfulness coach | Inner peace through movement',
    primaryPlatform: 'youtube' as const,
    niche: ['fitness', 'lifestyle', 'health'],
    location: 'Bali, Indonesia',
    profileImageUrl: 'https://ui-avatars.com/api/?name=Jessica+Yoga&size=200',
    socialAccounts: [{
      platform: 'youtube' as const,
      handle: '@JessicaYogaFlow',
      followersCount: 920000,
      avgViews: 125000,
      avgLikes: 9200,
      avgComments: 580,
      engagementRate: 1.06,
      ageGroup: { '25-34': 45, '35-44': 32, '18-24': 18, '45+': 5 },
      genderSplit: { female: 82, male: 16, other: 2 },
      topCountries: ['US', 'UK', 'AU', 'CA', 'DE'],
      interests: ['yoga', 'meditation', 'wellness', 'fitness'],
      pricing: [{ contentType: 'video', priceMin: 6500, priceMax: 10000 }]
    }]
  },
  {
    name: 'Carlos Dance Moves',
    bio: 'Professional dancer | Choreographer | Dance tutorials & performances',
    primaryPlatform: 'tiktok' as const,
    niche: ['dance', 'entertainment', 'lifestyle'],
    location: 'Miami, FL',
    profileImageUrl: 'https://ui-avatars.com/api/?name=Carlos+Dance&size=200',
    socialAccounts: [{
      platform: 'tiktok' as const,
      handle: '@carlosdancemoves',
      followersCount: 3200000,
      avgViews: 850000,
      avgLikes: 112000,
      avgComments: 2100,
      engagementRate: 3.57,
      ageGroup: { '18-24': 58, '25-34': 32, '35-44': 8, '45+': 2 },
      genderSplit: { female: 65, male: 33, other: 2 },
      topCountries: ['US', 'MX', 'BR', 'UK', 'CA'],
      interests: ['dance', 'music', 'choreography', 'fitness'],
      pricing: [{ contentType: 'video', priceMin: 12000, priceMax: 18000 }]
    }]
  },
  {
    name: 'Emily Book Club',
    bio: 'Bookworm & reviewer | 500+ books read | Fantasy & mystery lover',
    primaryPlatform: 'instagram' as const,
    niche: ['books', 'lifestyle'],
    location: 'Boston, MA',
    profileImageUrl: 'https://ui-avatars.com/api/?name=Emily+Books&size=200',
    socialAccounts: [{
      platform: 'instagram' as const,
      handle: '@emilybookclub',
      followersCount: 380000,
      avgViews: 28000,
      avgLikes: 19500,
      avgComments: 420,
      engagementRate: 5.24,
      ageGroup: { '18-24': 32, '25-34': 45, '35-44': 18, '45+': 5 },
      genderSplit: { female: 78, male: 20, other: 2 },
      topCountries: ['US', 'UK', 'CA', 'AU'],
      interests: ['books', 'reading', 'literature', 'writing'],
      pricing: [
        { contentType: 'post', priceMin: 2200, priceMax: 3200 },
        { contentType: 'story', priceMin: 800, priceMax: 1200 }
      ]
    }]
  },
  {
    name: 'Tom Pet Care',
    bio: 'Veterinary assistant | Pet care expert | Dog training tips',
    primaryPlatform: 'youtube' as const,
    niche: ['pets', 'lifestyle'],
    location: 'Chicago, IL',
    profileImageUrl: 'https://ui-avatars.com/api/?name=Tom+Pet&size=200',
    socialAccounts: [{
      platform: 'youtube' as const,
      handle: '@TomPetCare',
      followersCount: 1120000,
      avgViews: 185000,
      avgLikes: 14000,
      avgComments: 820,
      engagementRate: 1.32,
      ageGroup: { '25-34': 38, '35-44': 35, '18-24': 20, '45+': 7 },
      genderSplit: { female: 58, male: 40, other: 2 },
      topCountries: ['US', 'UK', 'CA', 'AU'],
      interests: ['pets', 'dogs', 'cats', 'animals'],
      pricing: [{ contentType: 'video', priceMin: 7500, priceMax: 11000 }]
    }]
  },
  {
    name: 'Aria Music Vibes',
    bio: 'Singer-songwriter | Cover artist | Original music & tutorials',
    primaryPlatform: 'youtube' as const,
    niche: ['music', 'entertainment'],
    location: 'Nashville, TN',
    profileImageUrl: 'https://ui-avatars.com/api/?name=Aria+Music&size=200',
    socialAccounts: [{
      platform: 'youtube' as const,
      handle: '@AriaMusicVibes',
      followersCount: 1650000,
      avgViews: 320000,
      avgLikes: 24000,
      avgComments: 1400,
      engagementRate: 1.54,
      ageGroup: { '18-24': 45, '25-34': 38, '35-44': 12, '45+': 5 },
      genderSplit: { female: 62, male: 36, other: 2 },
      topCountries: ['US', 'UK', 'CA', 'AU', 'PH'],
      interests: ['music', 'singing', 'guitar', 'songwriting'],
      pricing: [{ contentType: 'video', priceMin: 11000, priceMax: 16000 }]
    }]
  },
  {
    name: 'Kevin Productivity Hacks',
    bio: 'Productivity coach | Time management expert | Helping you do more',
    primaryPlatform: 'instagram' as const,
    niche: ['productivity', 'lifestyle', 'business'],
    location: 'San Francisco, CA',
    profileImageUrl: 'https://ui-avatars.com/api/?name=Kevin+Prod&size=200',
    socialAccounts: [{
      platform: 'instagram' as const,
      handle: '@kevinproductivity',
      followersCount: 420000,
      avgViews: 32000,
      avgLikes: 21000,
      avgComments: 380,
      engagementRate: 5.09,
      ageGroup: { '25-34': 52, '35-44': 28, '18-24': 15, '45+': 5 },
      genderSplit: { male: 56, female: 42, other: 2 },
      topCountries: ['US', 'UK', 'CA', 'SG'],
      interests: ['productivity', 'business', 'entrepreneurship', 'self-improvement'],
      pricing: [
        { contentType: 'post', priceMin: 2800, priceMax: 4000 },
        { contentType: 'reel', priceMin: 4500, priceMax: 6500 }
      ]
    }]
  },
  {
    name: 'Luna Art Studio',
    bio: 'Digital artist | Procreate tutorials | Commission artist',
    primaryPlatform: 'instagram' as const,
    niche: ['art', 'design'],
    location: 'Tokyo, Japan',
    profileImageUrl: 'https://ui-avatars.com/api/?name=Luna+Art&size=200',
    socialAccounts: [{
      platform: 'instagram' as const,
      handle: '@lunaartstudio',
      followersCount: 580000,
      avgViews: 45000,
      avgLikes: 32000,
      avgComments: 520,
      engagementRate: 5.62,
      ageGroup: { '18-24': 48, '25-34': 38, '35-44': 10, '45+': 4 },
      genderSplit: { female: 68, male: 30, other: 2 },
      topCountries: ['US', 'JP', 'UK', 'CA', 'KR'],
      interests: ['art', 'drawing', 'design', 'animation'],
      pricing: [
        { contentType: 'post', priceMin: 3500, priceMax: 5000 },
        { contentType: 'reel', priceMin: 5500, priceMax: 7500 }
      ]
    }]
  },
  {
    name: 'Max Crypto Daily',
    bio: 'Crypto analyst | NFT collector | Web3 educator',
    primaryPlatform: 'twitter' as const,
    niche: ['crypto', 'tech', 'finance'],
    location: 'Dubai, UAE',
    profileImageUrl: 'https://ui-avatars.com/api/?name=Max+Crypto&size=200',
    socialAccounts: [{
      platform: 'twitter' as const,
      handle: '@maxcryptodaily',
      followersCount: 850000,
      avgLikes: 2800,
      avgComments: 420,
      engagementRate: 0.38,
      ageGroup: { '25-34': 45, '35-44': 32, '18-24': 18, '45+': 5 },
      genderSplit: { male: 82, female: 16, other: 2 },
      topCountries: ['US', 'UK', 'SG', 'AE', 'CA'],
      interests: ['cryptocurrency', 'blockchain', 'NFT', 'trading'],
      pricing: [
        { contentType: 'tweet', priceMin: 1500, priceMax: 2500 },
        { contentType: 'thread', priceMin: 3000, priceMax: 5000 }
      ]
    }]
  },
  {
    name: 'Zoe Fashion Trends',
    bio: 'Fashion stylist | Trend forecaster | Sustainable style advocate',
    primaryPlatform: 'instagram' as const,
    niche: ['fashion', 'lifestyle', 'beauty'],
    location: 'Paris, France',
    profileImageUrl: 'https://ui-avatars.com/api/?name=Zoe+Fashion&size=200',
    socialAccounts: [{
      platform: 'instagram' as const,
      handle: '@zoefashiontrends',
      followersCount: 920000,
      avgViews: 72000,
      avgLikes: 55000,
      avgComments: 820,
      engagementRate: 6.07,
      ageGroup: { '18-24': 38, '25-34': 45, '35-44': 13, '45+': 4 },
      genderSplit: { female: 86, male: 12, other: 2 },
      topCountries: ['FR', 'US', 'UK', 'IT', 'CA'],
      interests: ['fashion', 'style', 'luxury', 'sustainability'],
      pricing: [
        { contentType: 'post', priceMin: 6000, priceMax: 9000 },
        { contentType: 'reel', priceMin: 9000, priceMax: 13000 }
      ]
    }]
  }
]

async function main() {
  console.log('Starting extended seeding...')

  let count = 0
  for (const influencerData of additionalInfluencers) {
    const { socialAccounts, ...baseData } = influencerData

    try {
      const influencer = await prisma.influencer.create({
        data: {
          ...baseData,
          socialAccounts: {
            create: socialAccounts.map(account => {
              const { ageGroup, genderSplit, topCountries, interests, pricing, ...accountData } = account
              return {
                ...accountData,
                audienceDemographics: {
                  create: {
                    ageGroup,
                    genderSplit,
                    topCountries,
                    interests
                  }
                },
                pricing: {
                  create: pricing as any
                }
              }
            })
          }
        }
      })

      count++
      console.log(`✓ Created: ${influencer.name}`)
    } catch (error: any) {
      console.log(`✗ Failed: ${influencerData.name} - ${error.message}`)
    }
  }

  console.log(`\n✅ Extended seeding complete! Added ${count}/${additionalInfluencers.length} influencers.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    await pool.end()
  })
