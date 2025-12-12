import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { matchBrandWithInfluencers } from '@/lib/algorithms/matching'
import { BrandRequirements } from '@/lib/algorithms/types'

export async function POST(request: NextRequest) {
  try {
    const brandRequirements: BrandRequirements = await request.json()

    // Fetch all influencers with full data
    const influencers = await prisma.influencer.findMany({
      include: {
        socialAccounts: {
          include: {
            audienceDemographics: true,
            pricing: true,
          },
        },
      },
    })

    // Convert to scoring format
    const influencersForScoring = influencers.map((inf) => ({
      id: inf.id,
      name: inf.name,
      primaryPlatform: inf.primaryPlatform,
      niche: inf.niche,
      location: inf.location,
      socialAccounts: inf.socialAccounts.map((acc) => ({
        platform: acc.platform,
        followersCount: acc.followersCount,
        engagementRate: acc.engagementRate,
        avgLikes: acc.avgLikes,
        avgComments: acc.avgComments,
        avgViews: acc.avgViews || 0,
        pricing: acc.pricing.map((p) => ({
          contentType: p.contentType,
          priceMin: p.priceMin,
          priceMax: p.priceMax,
        })),
        audienceDemographics: acc.audienceDemographics
          ? {
              ageGroup: acc.audienceDemographics.ageGroup as Record<string, number>,
              genderSplit: acc.audienceDemographics.genderSplit as Record<string, number>,
              topCountries: acc.audienceDemographics.topCountries,
            }
          : null,
      })),
    }))

    // Run matching algorithm
    const recommendations = matchBrandWithInfluencers(
      brandRequirements,
      influencersForScoring
    )

    // Enrich with full influencer data for display
    const enrichedRecommendations = recommendations.map((rec) => ({
      ...rec,
      influencer: influencers.find((inf) => inf.id === rec.influencer.id),
    }))

    return NextResponse.json({
      recommendations: enrichedRecommendations,
      count: enrichedRecommendations.length,
    })
  } catch (error) {
    console.error('Error generating recommendations:', error)
    return NextResponse.json(
      { error: 'Failed to generate recommendations' },
      { status: 500 }
    )
  }
}
