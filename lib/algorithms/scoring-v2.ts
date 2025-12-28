import {
  BrandRequirements,
  EnhancedScoreBreakdown,
  EnhancedInfluencerForScoring,
} from './types'

/**
 * Enhanced Scoring Algorithm (Version 2)
 *
 * 9-Factor Scoring System:
 * 1. Platform Match (0-20 points) - Adjusted from 25
 * 2. Niche Relevance (0-20 points) - Adjusted from 25
 * 3. Audience Overlap (0-15 points) - Adjusted from 20
 * 4. Engagement Quality (0-12 points) - Adjusted from 15
 * 5. Budget Fit (0-8 points) - Adjusted from 10
 * 6. Reach Potential (0-5 points) - Unchanged
 * 7. Authenticity Score (0-10 points) - NEW
 * 8. Performance Trend (0-5 points) - NEW
 * 9. Reliability Score (0-5 points) - NEW
 *
 * Total: 0-100 points
 */

/**
 * Calculate complete enhanced score for an influencer
 */
export function calculateEnhancedScore(
  influencer: EnhancedInfluencerForScoring,
  requirements: BrandRequirements
): EnhancedScoreBreakdown {
  const platformMatch = calculatePlatformMatch(influencer, requirements)
  const nicheRelevance = calculateNicheRelevance(influencer, requirements)
  const audienceOverlap = calculateAudienceOverlap(influencer, requirements)
  const engagementQuality = calculateEngagementQuality(influencer, requirements)
  const budgetFit = calculateBudgetFit(influencer, requirements)
  const reachPotential = calculateReachPotential(influencer)

  // NEW: Enrichment-based scoring
  const authenticityScore = calculateAuthenticityScore(influencer)
  const performanceTrend = calculatePerformanceTrendScore(influencer)
  const reliabilityScore = calculateReliabilityScore(influencer)

  const total =
    platformMatch +
    nicheRelevance +
    audienceOverlap +
    engagementQuality +
    budgetFit +
    reachPotential +
    authenticityScore +
    performanceTrend +
    reliabilityScore

  return {
    platformMatch,
    nicheRelevance,
    audienceOverlap,
    engagementQuality,
    budgetFit,
    reachPotential,
    authenticityScore,
    performanceTrend,
    reliabilityScore,
    total: Math.round(total * 10) / 10, // Round to 1 decimal
  }
}

/**
 * 1. Platform Match Score (0-20 points)
 * Awards points for matching requested platforms
 */
function calculatePlatformMatch(
  influencer: EnhancedInfluencerForScoring,
  requirements: BrandRequirements
): number {
  let score = 0
  const requestedPlatforms = requirements.platforms.map((p) => p.toLowerCase())

  // Check if influencer has accounts on requested platforms
  const matchingAccounts = influencer.socialAccounts.filter((account) =>
    requestedPlatforms.includes(account.platform.toLowerCase())
  )

  if (matchingAccounts.length === 0) return 0

  // Base score for having requested platform
  score += 10

  // Bonus if primary platform matches
  if (requestedPlatforms.includes(influencer.primaryPlatform.toLowerCase())) {
    score += 5
  }

  // Bonus for multiple matching platforms
  if (matchingAccounts.length > 1) {
    score += Math.min(5, matchingAccounts.length * 2)
  }

  return Math.min(20, score)
}

/**
 * 2. Niche Relevance Score (0-20 points)
 * Measures overlap between influencer niche and brand industry
 */
function calculateNicheRelevance(
  influencer: EnhancedInfluencerForScoring,
  requirements: BrandRequirements
): number {
  const industrySet = new Set(requirements.industry.map((i) => i.toLowerCase()))
  const nicheSet = new Set(influencer.niche.map((n) => n.toLowerCase()))

  // Direct matches
  const directMatches = influencer.niche.filter((niche) =>
    industrySet.has(niche.toLowerCase())
  ).length

  if (directMatches === 0) return 0

  // Full score for perfect overlap
  if (directMatches >= requirements.industry.length) {
    return 20
  }

  // Partial score based on match percentage
  const matchPercentage = directMatches / requirements.industry.length
  return Math.round(20 * matchPercentage)
}

/**
 * 3. Audience Overlap Score (0-15 points)
 * Evaluates demographic alignment with target audience
 */
function calculateAudienceOverlap(
  influencer: EnhancedInfluencerForScoring,
  requirements: BrandRequirements
): number {
  let score = 0
  const targetAudience = requirements.targetAudience

  // Get primary account demographics
  const primaryAccount = influencer.socialAccounts.find(
    (acc) => acc.platform.toLowerCase() === influencer.primaryPlatform.toLowerCase()
  )

  if (!primaryAccount?.audienceDemographics) {
    return 5 // Default score if no demographic data
  }

  const demographics = primaryAccount.audienceDemographics

  // Age overlap (0-7 points)
  if (targetAudience.ageGroups && targetAudience.ageGroups.length > 0) {
    const ageOverlap = targetAudience.ageGroups.reduce((sum, ageGroup) => {
      return sum + (demographics.ageGroup[ageGroup] || 0)
    }, 0)
    score += Math.min(7, (ageOverlap / 100) * 7)
  }

  // Gender overlap (0-5 points)
  if (targetAudience.gender) {
    let genderScore = 0
    if (targetAudience.gender.male) {
      const diff = Math.abs(targetAudience.gender.male - (demographics.genderSplit.male || 0))
      genderScore += Math.max(0, 2.5 - diff / 40)
    }
    if (targetAudience.gender.female) {
      const diff = Math.abs(targetAudience.gender.female - (demographics.genderSplit.female || 0))
      genderScore += Math.max(0, 2.5 - diff / 40)
    }
    score += genderScore
  }

  // Location overlap (0-3 points)
  if (targetAudience.locations && targetAudience.locations.length > 0) {
    const locationMatches = targetAudience.locations.filter((loc) =>
      demographics.topCountries.some((country) => country.toLowerCase().includes(loc.toLowerCase()))
    ).length

    score += Math.min(3, locationMatches * 1.5)
  }

  return Math.min(15, Math.round(score))
}

/**
 * 4. Engagement Quality Score (0-12 points)
 * Evaluates engagement rate relative to follower count
 */
function calculateEngagementQuality(
  influencer: EnhancedInfluencerForScoring,
  requirements: BrandRequirements
): number {
  const requestedPlatforms = requirements.platforms.map((p) => p.toLowerCase())
  const relevantAccounts = influencer.socialAccounts.filter((account) =>
    requestedPlatforms.includes(account.platform.toLowerCase())
  )

  if (relevantAccounts.length === 0) return 0

  // Calculate average engagement rate
  const avgEngagement =
    relevantAccounts.reduce((sum, acc) => sum + acc.engagementRate, 0) /
    relevantAccounts.length

  // Engagement rate benchmarks by follower count
  const totalFollowers = relevantAccounts.reduce((sum, acc) => sum + acc.followersCount, 0)

  let expectedEngagement = 3.0 // Default 3%
  if (totalFollowers < 10000) {
    expectedEngagement = 5.0 // 5% for micro-influencers
  } else if (totalFollowers < 100000) {
    expectedEngagement = 3.5 // 3.5% for mid-tier
  } else if (totalFollowers < 1000000) {
    expectedEngagement = 2.0 // 2% for macro
  } else {
    expectedEngagement = 1.5 // 1.5% for mega
  }

  // Score based on how engagement compares to expected
  const ratio = avgEngagement / expectedEngagement

  if (ratio >= 1.5) return 12 // Exceptional
  if (ratio >= 1.2) return 10 // Excellent
  if (ratio >= 1.0) return 8 // Good
  if (ratio >= 0.8) return 6 // Fair
  if (ratio >= 0.5) return 3 // Below average
  return 1 // Poor
}

/**
 * 5. Budget Fit Score (0-8 points)
 * Evaluates if influencer pricing aligns with brand budget
 */
function calculateBudgetFit(
  influencer: EnhancedInfluencerForScoring,
  requirements: BrandRequirements
): number {
  const requestedPlatforms = requirements.platforms.map((p) => p.toLowerCase())
  const requestedContentTypes = requirements.contentType?.map((c) => c.toLowerCase()) || []

  let bestFitScore = 0

  for (const account of influencer.socialAccounts) {
    if (!requestedPlatforms.includes(account.platform.toLowerCase())) continue

    for (const pricing of account.pricing) {
      // Skip if content type doesn't match (if specified)
      if (
        requestedContentTypes.length > 0 &&
        !requestedContentTypes.includes(pricing.contentType.toLowerCase())
      ) {
        continue
      }

      const minPrice = pricing.priceMin
      const maxPrice = pricing.priceMax || pricing.priceMin * 1.5

      const brandMin = requirements.budget.min
      const brandMax = requirements.budget.max

      // Perfect fit: price range overlaps with budget
      if (minPrice <= brandMax && maxPrice >= brandMin) {
        // Calculate overlap percentage
        const overlapMin = Math.max(minPrice, brandMin)
        const overlapMax = Math.min(maxPrice, brandMax)
        const overlapRange = overlapMax - overlapMin
        const budgetRange = brandMax - brandMin

        const fitScore = Math.min(8, (overlapRange / budgetRange) * 8)
        bestFitScore = Math.max(bestFitScore, fitScore)
      }
    }
  }

  return Math.round(bestFitScore)
}

/**
 * 6. Reach Potential Score (0-5 points)
 * Awards points based on total follower count
 */
function calculateReachPotential(influencer: EnhancedInfluencerForScoring): number {
  const totalFollowers = influencer.socialAccounts.reduce(
    (sum, acc) => sum + acc.followersCount,
    0
  )

  if (totalFollowers >= 1000000) return 5 // Mega influencers
  if (totalFollowers >= 500000) return 4
  if (totalFollowers >= 100000) return 3 // Macro influencers
  if (totalFollowers >= 50000) return 2
  if (totalFollowers >= 10000) return 1 // Micro influencers
  return 0
}

/**
 * 7. Authenticity Score (0-10 points) - NEW
 * Uses enrichment data to score influencer authenticity
 */
export function calculateAuthenticityScore(influencer: EnhancedInfluencerForScoring): number {
  if (!influencer.authenticity) {
    return 5 // Neutral score if no data available
  }

  const auth = influencer.authenticity

  // Convert 0-100 authenticity score to 0-10 scale
  let score = (auth.overallAuthenticityScore / 100) * 10

  // Bonus for verification
  if (auth.isVerified) {
    score = Math.min(10, score + 1)
  }

  // Penalty for high risk
  if (auth.riskLevel === 'high') {
    score *= 0.5
  } else if (auth.riskLevel === 'medium') {
    score *= 0.8
  }

  return Math.round(score * 10) / 10
}

/**
 * 8. Performance Trend Score (0-5 points) - NEW
 * Analyzes growth trajectory from performance snapshots
 */
export function calculatePerformanceTrendScore(influencer: EnhancedInfluencerForScoring): number {
  // Check if we have performance snapshots for any account
  const accountsWithData = influencer.socialAccounts.filter(
    (acc) => acc.performanceSnapshots && acc.performanceSnapshots.length >= 7
  )

  if (accountsWithData.length === 0) {
    return 2.5 // Neutral score if no historical data
  }

  let totalTrendScore = 0
  let accountsAnalyzed = 0

  for (const account of accountsWithData) {
    const snapshots = account.performanceSnapshots!
    if (snapshots.length < 7) continue

    // Analyze growth trend
    const recentSnapshots = snapshots.slice(0, 30) // Last 30 snapshots
    const growthRates = recentSnapshots.map((s) => {
      if (s.followersCount === 0) return 0
      return (s.followersGrowth / s.followersCount) * 100
    })

    const avgGrowthRate = growthRates.reduce((sum, rate) => sum + rate, 0) / growthRates.length

    // Calculate trend score based on monthly growth rate
    let trendScore = 2.5 // Start neutral

    if (avgGrowthRate * 30 > 10) {
      // > 10% monthly growth = Rising
      trendScore = 4.5
    } else if (avgGrowthRate * 30 > 5) {
      // 5-10% monthly = Good growth
      trendScore = 4.0
    } else if (avgGrowthRate * 30 > 2) {
      // 2-5% monthly = Moderate growth
      trendScore = 3.5
    } else if (avgGrowthRate * 30 > 0) {
      // 0-2% monthly = Stable
      trendScore = 3.0
    } else if (avgGrowthRate * 30 > -2) {
      // Small decline
      trendScore = 2.0
    } else {
      // Declining
      trendScore = 1.0
    }

    totalTrendScore += trendScore
    accountsAnalyzed++
  }

  if (accountsAnalyzed === 0) return 2.5

  return Math.round((totalTrendScore / accountsAnalyzed) * 10) / 10
}

/**
 * 9. Reliability Score (0-5 points) - NEW
 * Based on past campaign performance and professionalism
 */
export function calculateReliabilityScore(influencer: EnhancedInfluencerForScoring): number {
  if (!influencer.campaignHistory || influencer.campaignHistory.length === 0) {
    return 2.5 // Neutral score for new influencers
  }

  const history = influencer.campaignHistory
  let score = 0

  // On-time delivery rate (0-2 points)
  const onTimeCount = history.filter((c) => c.deliveredOnTime).length
  const onTimeRate = onTimeCount / history.length
  score += onTimeRate * 2

  // Average quality rating (0-2 points)
  const ratingsAvailable = history.filter((c) => c.qualityRating !== null)
  if (ratingsAvailable.length > 0) {
    const avgQuality =
      ratingsAvailable.reduce((sum, c) => sum + (c.qualityRating || 0), 0) /
      ratingsAvailable.length
    score += (avgQuality / 5) * 2 // Assuming 5-star rating
  } else {
    score += 1 // Neutral if no ratings
  }

  // ROI performance bonus (0-1 point)
  const roiAvailable = history.filter((c) => c.roi !== null && c.roi !== undefined)
  if (roiAvailable.length > 0) {
    const avgROI = roiAvailable.reduce((sum, c) => sum + (c.roi || 0), 0) / roiAvailable.length
    if (avgROI > 300) score += 1 // Exceptional ROI
    else if (avgROI > 200) score += 0.75
    else if (avgROI > 150) score += 0.5
    else if (avgROI > 100) score += 0.25
  }

  return Math.min(5, Math.round(score * 10) / 10)
}
