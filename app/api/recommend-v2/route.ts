import { NextRequest, NextResponse } from 'next/server'
import { matchBrandWithInfluencersEnhanced } from '@/lib/algorithms/matching-enhanced'
import { BrandRequirements } from '@/lib/algorithms/types'
import { recommendationRequestSchema } from '@/lib/validations/recommendation'
import { ZodError } from 'zod'

/**
 * Enhanced Recommendation API (V2)
 *
 * Uses the new 9-factor scoring system with enrichment data:
 * - Authenticity scores
 * - Performance trends
 * - Campaign reliability
 * - Advanced filtering
 *
 * POST /api/recommend-v2
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate request body
    const validatedRequest = recommendationRequestSchema.parse(body)

    // Normalize contentType to always be an array
    const contentType = validatedRequest.contentType
      ? Array.isArray(validatedRequest.contentType)
        ? validatedRequest.contentType
        : [validatedRequest.contentType]
      : undefined

    const brandRequirements: BrandRequirements = {
      ...validatedRequest,
      contentType,
      campaignGoal: validatedRequest.campaignGoal as 'awareness' | 'sales' | 'engagement' | undefined,
    }

    // Get limit from query params (default 10)
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '10')

    // Use enhanced matching algorithm
    const recommendations = await matchBrandWithInfluencersEnhanced(
      brandRequirements,
      Math.min(limit, 50) // Max 50 results
    )

    return NextResponse.json({
      success: true,
      count: recommendations.length,
      recommendations: recommendations.map((rec) => ({
        influencer: {
          id: rec.influencer.id,
          name: rec.influencer.name,
          primaryPlatform: rec.influencer.primaryPlatform,
          niche: rec.influencer.niche,
          location: rec.influencer.location,
          socialAccounts: rec.influencer.socialAccounts.map((acc) => ({
            platform: acc.platform,
            followersCount: acc.followersCount,
            engagementRate: acc.engagementRate,
            pricing: acc.pricing,
          })),
          // Include enrichment data summaries
          authenticityLevel: rec.insights.authenticityLevel,
          growthTrend: rec.insights.growthTrend,
          reliability: rec.insights.reliability,
        },
        score: rec.score,
        scoreBreakdown: rec.scoreBreakdown,
        roiMetrics: rec.roiMetrics,
        explanation: rec.explanation,
        matchReasons: rec.matchReasons,
        insights: rec.insights,
      })),
      algorithm: 'enhanced-v2',
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: 'Validation error',
          details: error.issues,
        },
        { status: 400 }
      )
    }

    console.error('Error generating enhanced recommendations:', error)
    return NextResponse.json(
      {
        error: 'Failed to generate recommendations',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
