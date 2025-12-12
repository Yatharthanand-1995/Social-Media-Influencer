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

async function main() {
  console.log('Start seeding...')

  const influencer1 = await prisma.influencer.create({
    data: {
      name: 'Sarah Chen',
      bio: 'Fashion & lifestyle creator | Sustainable fashion advocate | 500k+ community',
      primaryPlatform: 'instagram',
      niche: ['fashion', 'lifestyle', 'beauty'],
      location: 'Los Angeles, CA',
      profileImageUrl: '/images/influencers/sarah-chen.jpg',
      socialAccounts: {
        create: [
          {
            platform: 'instagram',
            handle: '@sarahchen',
            followersCount: 523000,
            avgViews: 45000,
            avgLikes: 28500,
            avgComments: 450,
            engagementRate: 5.54,
            audienceDemographics: {
              create: {
                ageGroup: { '18-24': 35, '25-34': 45, '35-44': 15, '45+': 5 },
                genderSplit: { female: 68, male: 30, other: 2 },
                topCountries: ['US', 'CA', 'UK'],
                interests: ['fashion', 'beauty', 'lifestyle', 'travel']
              }
            },
            pricing: {
              create: [
                { contentType: 'post', priceMin: 3500, priceMax: 4500 },
                { contentType: 'story', priceMin: 1200, priceMax: 1500 },
                { contentType: 'reel', priceMin: 5000, priceMax: 6500 }
              ]
            }
          },
          {
            platform: 'tiktok',
            handle: '@sarahchen_',
            followersCount: 280000,
            avgViews: 150000,
            avgLikes: 18000,
            avgComments: 320,
            engagementRate: 6.54,
            pricing: {
              create: [
                { contentType: 'video', priceMin: 2500, priceMax: 3500 }
              ]
            }
          }
        ]
      }
    }
  })

  const influencer2 = await prisma.influencer.create({
    data: {
      name: 'Marcus Tech',
      bio: 'Tech reviewer & gadget enthusiast | Unboxing the future',
      primaryPlatform: 'youtube',
      niche: ['tech', 'gaming'],
      location: 'San Francisco, CA',
      profileImageUrl: '/images/influencers/marcus-tech.jpg',
      socialAccounts: {
        create: [
          {
            platform: 'youtube',
            handle: '@MarcusTech',
            followersCount: 890000,
            avgViews: 120000,
            avgLikes: 8500,
            avgComments: 650,
            engagementRate: 1.03,
            audienceDemographics: {
              create: {
                ageGroup: { '18-24': 45, '25-34': 35, '35-44': 15, '45+': 5 },
                genderSplit: { male: 78, female: 20, other: 2 },
                topCountries: ['US', 'UK', 'IN', 'CA'],
                interests: ['technology', 'gaming', 'gadgets', 'programming']
              }
            },
            pricing: {
              create: [
                { contentType: 'video', priceMin: 8000, priceMax: 12000 }
              ]
            }
          },
          {
            platform: 'twitter',
            handle: '@marcustech',
            followersCount: 125000,
            avgLikes: 450,
            avgComments: 80,
            engagementRate: 0.42,
            pricing: {
              create: [
                { contentType: 'tweet', priceMin: 500, priceMax: 800 }
              ]
            }
          }
        ]
      }
    }
  })

  const influencer3 = await prisma.influencer.create({
    data: {
      name: 'Fit with Emma',
      bio: 'Certified personal trainer | Nutrition coach | Helping you reach your goals',
      primaryPlatform: 'instagram',
      niche: ['fitness', 'lifestyle', 'food'],
      location: 'Miami, FL',
      profileImageUrl: '/images/influencers/fit-emma.jpg',
      socialAccounts: {
        create: [
          {
            platform: 'instagram',
            handle: '@fitwithemma',
            followersCount: 340000,
            avgViews: 28000,
            avgLikes: 19000,
            avgComments: 280,
            engagementRate: 5.67,
            audienceDemographics: {
              create: {
                ageGroup: { '18-24': 28, '25-34': 48, '35-44': 18, '45+': 6 },
                genderSplit: { female: 72, male: 26, other: 2 },
                topCountries: ['US', 'AU', 'UK'],
                interests: ['fitness', 'health', 'nutrition', 'wellness']
              }
            },
            pricing: {
              create: [
                { contentType: 'post', priceMin: 2500, priceMax: 3200 },
                { contentType: 'story', priceMin: 900, priceMax: 1200 },
                { contentType: 'reel', priceMin: 3500, priceMax: 4500 }
              ]
            }
          },
          {
            platform: 'youtube',
            handle: '@FitWithEmma',
            followersCount: 185000,
            avgViews: 45000,
            avgLikes: 3200,
            avgComments: 180,
            engagementRate: 1.84,
            pricing: {
              create: [
                { contentType: 'video', priceMin: 3000, priceMax: 4500 }
              ]
            }
          }
        ]
      }
    }
  })

  const influencer4 = await prisma.influencer.create({
    data: {
      name: 'Chef Antonio',
      bio: 'Italian cuisine specialist | Michelin-trained | Bringing restaurant quality home',
      primaryPlatform: 'tiktok',
      niche: ['food', 'lifestyle'],
      location: 'New York, NY',
      profileImageUrl: '/images/influencers/chef-antonio.jpg',
      socialAccounts: {
        create: [
          {
            platform: 'tiktok',
            handle: '@chefantonio',
            followersCount: 1200000,
            avgViews: 350000,
            avgLikes: 45000,
            avgComments: 850,
            engagementRate: 3.82,
            audienceDemographics: {
              create: {
                ageGroup: { '18-24': 38, '25-34': 42, '35-44': 15, '45+': 5 },
                genderSplit: { female: 58, male: 40, other: 2 },
                topCountries: ['US', 'UK', 'CA', 'AU'],
                interests: ['cooking', 'food', 'restaurants', 'recipes']
              }
            },
            pricing: {
              create: [
                { contentType: 'video', priceMin: 6000, priceMax: 9000 }
              ]
            }
          },
          {
            platform: 'instagram',
            handle: '@chefantonio_',
            followersCount: 425000,
            avgViews: 35000,
            avgLikes: 21000,
            avgComments: 380,
            engagementRate: 5.03,
            pricing: {
              create: [
                { contentType: 'post', priceMin: 3200, priceMax: 4000 },
                { contentType: 'reel', priceMin: 5500, priceMax: 7000 }
              ]
            }
          }
        ]
      }
    }
  })

  const influencer5 = await prisma.influencer.create({
    data: {
      name: 'Travel with Lisa',
      bio: 'Full-time traveler | 60+ countries | Budget travel tips & hidden gems',
      primaryPlatform: 'instagram',
      niche: ['travel', 'lifestyle'],
      location: 'Digital Nomad',
      profileImageUrl: '/images/influencers/travel-lisa.jpg',
      socialAccounts: {
        create: [
          {
            platform: 'instagram',
            handle: '@travelwithlisa',
            followersCount: 615000,
            avgViews: 52000,
            avgLikes: 35000,
            avgComments: 520,
            engagementRate: 5.77,
            audienceDemographics: {
              create: {
                ageGroup: { '18-24': 32, '25-34': 48, '35-44': 15, '45+': 5 },
                genderSplit: { female: 64, male: 34, other: 2 },
                topCountries: ['US', 'UK', 'AU', 'CA', 'DE'],
                interests: ['travel', 'adventure', 'photography', 'culture']
              }
            },
            pricing: {
              create: [
                { contentType: 'post', priceMin: 4000, priceMax: 5500 },
                { contentType: 'story', priceMin: 1500, priceMax: 2000 },
                { contentType: 'reel', priceMin: 6000, priceMax: 8000 }
              ]
            }
          },
          {
            platform: 'youtube',
            handle: '@TravelWithLisa',
            followersCount: 320000,
            avgViews: 85000,
            avgLikes: 6200,
            avgComments: 420,
            engagementRate: 2.07,
            pricing: {
              create: [
                { contentType: 'video', priceMin: 5000, priceMax: 7500 }
              ]
            }
          }
        ]
      }
    }
  })

  console.log('Seeding finished.')
  console.log('Created influencers:', {
    influencer1,
    influencer2,
    influencer3,
    influencer4,
    influencer5
  })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
