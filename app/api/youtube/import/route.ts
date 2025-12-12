import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCompleteChannelData } from '@/lib/youtube'

export async function POST(request: NextRequest) {
  try {
    const { channelIdentifier } = await request.json()

    if (!channelIdentifier) {
      return NextResponse.json(
        { error: 'Channel ID or handle is required' },
        { status: 400 }
      )
    }

    // Fetch YouTube data
    const youtubeData = await getCompleteChannelData(channelIdentifier)

    if (!youtubeData) {
      return NextResponse.json(
        { error: 'Channel not found or API error' },
        { status: 404 }
      )
    }

    const { channelData, metrics, niche } = youtubeData

    // Check if influencer already exists
    const existingInfluencer = await prisma.influencer.findFirst({
      where: {
        socialAccounts: {
          some: {
            platform: 'youtube',
            handle: channelData.channelHandle || channelData.channelId,
          },
        },
      },
    })

    if (existingInfluencer) {
      return NextResponse.json(
        { error: 'This YouTube channel is already in the database' },
        { status: 409 }
      )
    }

    // Estimate pricing based on subscriber count
    const estimatedPricing = estimateYouTubePricing(channelData.subscriberCount)

    // Create influencer with YouTube account
    const influencer = await prisma.influencer.create({
      data: {
        name: channelData.channelTitle,
        profileImageUrl: channelData.thumbnailUrl,
        bio: channelData.description.slice(0, 500), // Limit bio length
        primaryPlatform: 'youtube',
        niche: niche,
        location: channelData.country || null,
        socialAccounts: {
          create: {
            platform: 'youtube',
            handle: channelData.channelHandle || channelData.channelId,
            followersCount: channelData.subscriberCount,
            avgViews: metrics.avgViews,
            avgLikes: metrics.avgLikes,
            avgComments: metrics.avgComments,
            engagementRate: metrics.engagementRate,
            pricing: {
              create: [
                {
                  contentType: 'video',
                  priceMin: estimatedPricing.video.min,
                  priceMax: estimatedPricing.video.max,
                  currency: 'USD',
                },
                {
                  contentType: 'short',
                  priceMin: estimatedPricing.short.min,
                  priceMax: estimatedPricing.short.max,
                  currency: 'USD',
                },
              ],
            },
            audienceDemographics: {
              create: {
                // YouTube API doesn't provide demographics without OAuth
                // Using general estimates based on niche
                ageGroup: getDefaultAgeDistribution(niche),
                genderSplit: { male: 50, female: 48, other: 2 },
                topCountries: channelData.country ? [channelData.country, 'US'] : ['US'],
                interests: niche,
              },
            },
          },
        },
      },
      include: {
        socialAccounts: {
          include: {
            pricing: true,
            audienceDemographics: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      influencer,
      message: `Successfully imported ${channelData.channelTitle}`,
    })
  } catch (error) {
    console.error('Error importing YouTube channel:', error)
    return NextResponse.json(
      { error: 'Failed to import YouTube channel', details: String(error) },
      { status: 500 }
    )
  }
}

// Estimate pricing based on subscriber count (industry benchmarks)
function estimateYouTubePricing(subscriberCount: number) {
  // Pricing formula: roughly $0.01-0.02 per subscriber for video integration
  const baseRateMin = subscriberCount * 0.01
  const baseRateMax = subscriberCount * 0.02

  return {
    video: {
      min: Math.round(Math.max(500, baseRateMin)), // Minimum $500
      max: Math.round(baseRateMax),
    },
    short: {
      min: Math.round(Math.max(200, baseRateMin * 0.3)), // Shorts are cheaper
      max: Math.round(baseRateMax * 0.4),
    },
  }
}

// Default age distribution based on niche
function getDefaultAgeDistribution(niches: string[]): Record<string, number> {
  // Gaming/Tech skews younger
  if (niches.some(n => ['gaming', 'tech'].includes(n))) {
    return { '18-24': 45, '25-34': 35, '35-44': 15, '45+': 5 }
  }

  // Fitness/Beauty balanced
  if (niches.some(n => ['fitness', 'beauty', 'fashion'].includes(n))) {
    return { '18-24': 30, '25-34': 40, '35-44': 20, '45+': 10 }
  }

  // Food/Travel/Lifestyle slightly older
  if (niches.some(n => ['food', 'travel', 'lifestyle'].includes(n))) {
    return { '18-24': 20, '25-34': 35, '35-44': 30, '45+': 15 }
  }

  // Default balanced distribution
  return { '18-24': 25, '25-34': 35, '35-44': 25, '45+': 15 }
}
