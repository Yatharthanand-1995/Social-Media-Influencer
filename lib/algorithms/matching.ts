import {
  BrandRequirements,
  InfluencerForScoring,
  RecommendationResult,
  ROIMetrics,
  ScoreBreakdown,
} from './types'
import { calculateFinalScore } from './scoring'

// Platform multipliers for reach calculation
const PLATFORM_MULTIPLIERS: Record<string, number> = {
  instagram: 1.5,
  tiktok: 2.0,
  youtube: 1.2,
  twitter: 1.0,
}

// Calculate ROI Metrics
export function calculateROI(
  influencer: InfluencerForScoring,
  brandRequirements: BrandRequirements
): ROIMetrics {
  let predictedReach = 0
  let expectedImpressions = 0
  let totalPrice = 0
  let totalEngagement = 0

  // Calculate for each requested platform
  for (const platform of brandRequirements.platforms) {
    const account = influencer.socialAccounts.find(
      (acc) => acc.platform.toLowerCase() === platform.toLowerCase()
    )

    if (account) {
      const multiplier = PLATFORM_MULTIPLIERS[platform.toLowerCase()] || 1.0
      const engagement = account.followersCount * (account.engagementRate / 100)

      // Predicted reach
      predictedReach += engagement * multiplier

      // Expected impressions (organic + algorithm boost)
      expectedImpressions +=
        account.followersCount * (account.engagementRate / 100) * 1.5 +
        account.followersCount * 0.1

      // Total engagement for CPE calculation
      totalEngagement += engagement

      // Get pricing
      const pricing = account.pricing.find(
        (p) => p.contentType.toLowerCase() === brandRequirements.contentType.toLowerCase()
      )

      if (pricing) {
        totalPrice += pricing.priceMin
      }
    }
  }

  // Cost per engagement
  const costPerEngagement = totalEngagement > 0 ? totalPrice / totalEngagement : 0

  // Estimated ROI (using conservative industry benchmarks)
  const avgConversionRate = 0.02 // 2%
  const avgCustomerValue = 50 // $50
  const estimatedRevenue = predictedReach * avgConversionRate * avgCustomerValue
  const estimatedROI = totalPrice > 0 ? ((estimatedRevenue - totalPrice) / totalPrice) * 100 : 0

  return {
    predictedReach: Math.round(predictedReach),
    costPerEngagement: Math.round(costPerEngagement * 100) / 100,
    expectedImpressions: Math.round(expectedImpressions),
    estimatedROI: Math.round(estimatedROI),
  }
}

// Generate explanation for why this is a good match
export function generateExplanation(
  influencer: InfluencerForScoring,
  scoreBreakdown: ScoreBreakdown,
  brandRequirements: BrandRequirements
): { explanation: string; matchReasons: string[] } {
  const matchReasons: string[] = []

  // Platform match
  if (scoreBreakdown.platformMatch >= 20) {
    const platforms = brandRequirements.platforms.join(', ')
    matchReasons.push(`Strong presence on ${platforms}`)
  }

  // Niche relevance
  if (scoreBreakdown.nicheRelevance >= 20) {
    const matchingNiches = influencer.niche.filter((n) =>
      brandRequirements.industry.some((i) => i.toLowerCase() === n.toLowerCase())
    )
    matchReasons.push(`Perfect fit for ${matchingNiches.join(', ')} industry`)
  }

  // Audience overlap
  if (scoreBreakdown.audienceOverlap >= 15) {
    matchReasons.push(`Audience demographics align with your target market`)
  }

  // Engagement quality
  if (scoreBreakdown.engagementQuality >= 12) {
    const avgEngagement =
      influencer.socialAccounts.reduce((sum, acc) => sum + acc.engagementRate, 0) /
      influencer.socialAccounts.length
    matchReasons.push(`High engagement rate (${avgEngagement.toFixed(2)}%)`)
  }

  // Budget fit
  if (scoreBreakdown.budgetFit >= 7) {
    matchReasons.push(`Pricing within your budget range`)
  }

  // Reach potential
  const totalFollowers = influencer.socialAccounts.reduce(
    (sum, acc) => sum + acc.followersCount,
    0
  )
  if (totalFollowers >= 500000) {
    matchReasons.push(
      `Large reach with ${(totalFollowers / 1000000).toFixed(1)}M+ total followers`
    )
  }

  // Generate summary explanation
  const explanation = `${influencer.name} is an excellent match for your ${brandRequirements.campaignGoal} campaign. They have a strong presence in the ${brandRequirements.industry.join(' and ')} niche with an engaged audience that matches your target demographics.`

  return { explanation, matchReasons }
}

// Main matching function
export function matchBrandWithInfluencers(
  brandRequirements: BrandRequirements,
  influencers: InfluencerForScoring[]
): RecommendationResult[] {
  const results: RecommendationResult[] = []

  for (const influencer of influencers) {
    // Calculate scores
    const scoreBreakdown = calculateFinalScore(brandRequirements, influencer)

    // Calculate ROI
    const roiMetrics = calculateROI(influencer, brandRequirements)

    // Generate explanation
    const { explanation, matchReasons } = generateExplanation(
      influencer,
      scoreBreakdown,
      brandRequirements
    )

    results.push({
      influencer,
      score: scoreBreakdown.total,
      scoreBreakdown,
      roiMetrics,
      explanation,
      matchReasons,
    })
  }

  // Sort by score (highest first)
  results.sort((a, b) => b.score - a.score)

  // Return top 10
  return results.slice(0, 10)
}
