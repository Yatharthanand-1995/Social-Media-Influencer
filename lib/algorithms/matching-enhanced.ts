import { prisma } from '@/lib/prisma'
import {
  BrandRequirements,
  EnhancedInfluencerForScoring,
  EnhancedRecommendationResult,
  ROIMetrics,
} from './types'
import { calculateEnhancedScore } from './scoring-v2'
import { calculateROI } from './matching' // Reuse existing ROI calculation

/**
 * Enhanced Matching Algorithm
 *
 * Fetches influencers with enrichment data and uses the enhanced 9-factor scoring system
 */

/**
 * Find best matching influencers using enhanced scoring
 */
export async function matchBrandWithInfluencersEnhanced(
  requirements: BrandRequirements,
  limit: number = 10
): Promise<EnhancedRecommendationResult[]> {
  // Fetch influencers with all enrichment data
  const influencers = await fetchInfluencersWithEnrichmentData()

  // Score each influencer
  const scoredInfluencers = influencers.map((influencer) => {
    const scoreBreakdown = calculateEnhancedScore(influencer, requirements)
    const roiMetrics = calculateROI(influencer, requirements)
    const insights = generateInsights(influencer)
    const { explanation, matchReasons } = generateExplanation(
      influencer,
      scoreBreakdown,
      insights
    )

    return {
      influencer,
      score: scoreBreakdown.total,
      scoreBreakdown,
      roiMetrics,
      explanation,
      matchReasons,
      insights,
    }
  })

  // Sort by score (highest first)
  scoredInfluencers.sort((a, b) => b.score - a.score)

  // Return top N
  return scoredInfluencers.slice(0, limit)
}

/**
 * Fetch influencers with all enrichment data from database
 */
async function fetchInfluencersWithEnrichmentData(): Promise<EnhancedInfluencerForScoring[]> {
  const influencers = await prisma.influencer.findMany({
    include: {
      authenticity: true,
      campaignHistory: {
        select: {
          deliveredOnTime: true,
          qualityRating: true,
          professionalismScore: true,
          roi: true,
        },
      },
      socialAccounts: {
        include: {
          audienceDemographics: true,
          pricing: true,
          performanceSnapshots: {
            orderBy: { snapshotDate: 'desc' },
            take: 90, // Last 90 snapshots for trend analysis
            select: {
              snapshotDate: true,
              followersCount: true,
              followersGrowth: true,
              engagementRate: true,
            },
          },
          contentAnalysis: {
            select: {
              bestPerformingType: true,
              avgPostsPerWeek: true,
              postingConsistency: true,
            },
          },
        },
      },
    },
  })

  // Transform to EnhancedInfluencerForScoring format
  return influencers.map((inf) => ({
    id: inf.id,
    name: inf.name,
    primaryPlatform: inf.primaryPlatform,
    niche: inf.niche,
    location: inf.location,
    authenticity: inf.authenticity
      ? {
          overallAuthenticityScore: inf.authenticity.overallAuthenticityScore,
          followerQualityScore: inf.authenticity.followerQualityScore,
          engagementAuthenticityScore: inf.authenticity.engagementAuthenticityScore,
          riskLevel: inf.authenticity.riskLevel,
          isVerified: inf.authenticity.isVerified,
        }
      : null,
    campaignHistory: inf.campaignHistory,
    socialAccounts: inf.socialAccounts.map((acc) => ({
      platform: acc.platform,
      followersCount: acc.followersCount,
      engagementRate: acc.engagementRate,
      avgLikes: acc.avgLikes,
      avgComments: acc.avgComments,
      avgViews: acc.avgViews,
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
      performanceSnapshots: acc.performanceSnapshots,
      contentAnalysis: acc.contentAnalysis
        ? {
            bestPerformingType: acc.contentAnalysis.bestPerformingType,
            avgPostsPerWeek: acc.contentAnalysis.avgPostsPerWeek,
            postingConsistency: acc.contentAnalysis.postingConsistency,
          }
        : null,
    })),
  }))
}

/**
 * Generate insights based on enrichment data
 */
function generateInsights(influencer: EnhancedInfluencerForScoring): EnhancedRecommendationResult['insights'] {
  const insights: EnhancedRecommendationResult['insights'] = {
    authenticityLevel: 'unknown',
    growthTrend: 'unknown',
    reliability: 'unknown',
    riskFactors: [],
  }

  // Authenticity level
  if (influencer.authenticity) {
    const score = influencer.authenticity.overallAuthenticityScore
    if (score >= 80) insights.authenticityLevel = 'high'
    else if (score >= 60) insights.authenticityLevel = 'medium'
    else insights.authenticityLevel = 'low'

    if (influencer.authenticity.riskLevel === 'high') {
      insights.riskFactors.push('High risk for fake followers or bot engagement')
    } else if (influencer.authenticity.riskLevel === 'medium') {
      insights.riskFactors.push('Moderate authenticity concerns detected')
    }
  }

  // Growth trend
  const accountsWithSnapshots = influencer.socialAccounts.filter(
    (acc) => acc.performanceSnapshots && acc.performanceSnapshots.length >= 7
  )

  if (accountsWithSnapshots.length > 0) {
    const account = accountsWithSnapshots[0]
    const snapshots = account.performanceSnapshots!.slice(0, 30)
    const growthRates = snapshots.map((s) => {
      if (s.followersCount === 0) return 0
      return (s.followersGrowth / s.followersCount) * 100
    })
    const avgGrowthRate = growthRates.reduce((sum, rate) => sum + rate, 0) / growthRates.length
    const monthlyGrowth = avgGrowthRate * 30

    if (monthlyGrowth > 5) insights.growthTrend = 'rising'
    else if (monthlyGrowth >= -2) insights.growthTrend = 'stable'
    else insights.growthTrend = 'declining'

    if (insights.growthTrend === 'declining') {
      insights.riskFactors.push('Declining follower growth detected')
    }
  }

  // Reliability
  if (influencer.campaignHistory && influencer.campaignHistory.length > 0) {
    const history = influencer.campaignHistory
    const onTimeRate =
      history.filter((c) => c.deliveredOnTime).length / history.length

    const ratingsAvailable = history.filter((c) => c.qualityRating !== null)
    const avgQuality =
      ratingsAvailable.length > 0
        ? ratingsAvailable.reduce((sum, c) => sum + (c.qualityRating || 0), 0) /
          ratingsAvailable.length
        : 3

    if (onTimeRate >= 0.9 && avgQuality >= 4) insights.reliability = 'excellent'
    else if (onTimeRate >= 0.75 && avgQuality >= 3.5) insights.reliability = 'good'
    else insights.reliability = 'fair'

    if (onTimeRate < 0.7) {
      insights.riskFactors.push('History of late deliveries')
    }
    if (avgQuality < 3) {
      insights.riskFactors.push('Below average quality ratings')
    }
  }

  return insights
}

/**
 * Generate explanation and match reasons
 */
function generateExplanation(
  influencer: EnhancedInfluencerForScoring,
  scoreBreakdown: any,
  insights: any
): { explanation: string; matchReasons: string[] } {
  const reasons: string[] = []

  // Platform and niche
  if (scoreBreakdown.platformMatch >= 15) {
    reasons.push(`Strong presence on your requested platforms`)
  }
  if (scoreBreakdown.nicheRelevance >= 15) {
    reasons.push(`Highly relevant niche alignment`)
  }

  // Audience
  if (scoreBreakdown.audienceOverlap >= 10) {
    reasons.push(`Excellent audience demographic match`)
  }

  // Engagement
  if (scoreBreakdown.engagementQuality >= 9) {
    reasons.push(`Exceptional engagement rates`)
  } else if (scoreBreakdown.engagementQuality >= 6) {
    reasons.push(`Good engagement quality`)
  }

  // Budget
  if (scoreBreakdown.budgetFit >= 6) {
    reasons.push(`Pricing aligns well with your budget`)
  }

  // Reach
  if (scoreBreakdown.reachPotential >= 4) {
    reasons.push(`Large reach potential with extensive following`)
  }

  // Authenticity (NEW)
  if (scoreBreakdown.authenticityScore >= 8) {
    reasons.push(`High authenticity score - verified genuine audience`)
  } else if (scoreBreakdown.authenticityScore < 5) {
    reasons.push(`⚠️ Lower authenticity score - review audience quality`)
  }

  // Performance trend (NEW)
  if (scoreBreakdown.performanceTrend >= 4) {
    reasons.push(`Strong growth trajectory - rising influencer`)
  } else if (scoreBreakdown.performanceTrend < 2) {
    reasons.push(`⚠️ Declining growth trend`)
  }

  // Reliability (NEW)
  if (scoreBreakdown.reliabilityScore >= 4) {
    reasons.push(`Excellent track record with past campaigns`)
  } else if (scoreBreakdown.reliabilityScore < 2) {
    reasons.push(`Limited campaign history - new collaborator`)
  }

  // Add risk factors
  if (insights.riskFactors.length > 0) {
    insights.riskFactors.forEach((factor: string) => reasons.push(`⚠️ ${factor}`))
  }

  // Generate overall explanation
  let explanation = `${influencer.name} scores ${scoreBreakdown.total.toFixed(1)}/100 as a match. `

  if (insights.authenticityLevel === 'high') {
    explanation += `This influencer has a highly authentic audience `
  } else if (insights.authenticityLevel === 'medium') {
    explanation += `This influencer has a moderately authentic audience `
  } else if (insights.authenticityLevel === 'low') {
    explanation += `⚠️ This influencer has authenticity concerns - `
  }

  if (insights.growthTrend === 'rising') {
    explanation += `with strong growth momentum. `
  } else if (insights.growthTrend === 'stable') {
    explanation += `with stable performance. `
  } else if (insights.growthTrend === 'declining') {
    explanation += `but is experiencing declining growth. `
  }

  if (insights.reliability === 'excellent') {
    explanation += `They have an excellent track record of successful campaigns.`
  } else if (insights.reliability === 'good') {
    explanation += `They have a good history of delivering quality work.`
  } else if (insights.reliability === 'unknown') {
    explanation += `This would be a new collaboration opportunity.`
  }

  return { explanation, matchReasons: reasons }
}
