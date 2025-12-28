import { AdvancedFilters, EnhancedInfluencerForScoring } from './types'

/**
 * Enhanced Filtering System
 *
 * Filters influencers based on both basic criteria and enrichment data:
 * - Basic: platform, niche, followers, engagement, location, budget
 * - Enrichment: authenticity, growth trend, risk level, reliability, content type
 */

/**
 * Apply all filters to a list of influencers
 */
export function applyAdvancedFilters(
  influencers: EnhancedInfluencerForScoring[],
  filters: AdvancedFilters
): EnhancedInfluencerForScoring[] {
  let filtered = influencers

  // Basic filters
  if (filters.platforms && filters.platforms.length > 0) {
    filtered = filterByPlatform(filtered, filters.platforms)
  }

  if (filters.niches && filters.niches.length > 0) {
    filtered = filterByNiche(filtered, filters.niches)
  }

  if (filters.minFollowers !== undefined || filters.maxFollowers !== undefined) {
    filtered = filterByFollowers(filtered, filters.minFollowers, filters.maxFollowers)
  }

  if (filters.minEngagement !== undefined || filters.maxEngagement !== undefined) {
    filtered = filterByEngagement(filtered, filters.minEngagement, filters.maxEngagement)
  }

  if (filters.locations && filters.locations.length > 0) {
    filtered = filterByLocation(filtered, filters.locations)
  }

  if (filters.budgetRange) {
    filtered = filterByBudget(filtered, filters.budgetRange.min, filters.budgetRange.max)
  }

  // Enrichment-based filters
  if (filters.minAuthenticityScore !== undefined) {
    filtered = filterByAuthenticity(filtered, filters.minAuthenticityScore)
  }

  if (filters.verifiedOnly) {
    filtered = filterVerifiedOnly(filtered)
  }

  if (filters.growthTrend) {
    filtered = filterByGrowthTrend(filtered, filters.growthTrend)
  }

  if (filters.riskLevelMax) {
    filtered = filterByRiskLevel(filtered, filters.riskLevelMax)
  }

  if (filters.minCampaignSuccess !== undefined) {
    filtered = filterByCampaignSuccess(filtered, filters.minCampaignSuccess)
  }

  if (filters.contentTypes && filters.contentTypes.length > 0) {
    filtered = filterByContentType(filtered, filters.contentTypes)
  }

  if (filters.postingFrequency) {
    filtered = filterByPostingFrequency(filtered, filters.postingFrequency)
  }

  if (filters.hasHistoricalData) {
    filtered = filterByHistoricalData(filtered)
  }

  if (filters.minReliabilityScore !== undefined) {
    filtered = filterByReliability(filtered, filters.minReliabilityScore)
  }

  return filtered
}

// ===================================
// BASIC FILTERS
// ===================================

function filterByPlatform(
  influencers: EnhancedInfluencerForScoring[],
  platforms: string[]
): EnhancedInfluencerForScoring[] {
  const platformsLower = platforms.map((p) => p.toLowerCase())
  return influencers.filter((inf) =>
    inf.socialAccounts.some((acc) => platformsLower.includes(acc.platform.toLowerCase()))
  )
}

function filterByNiche(
  influencers: EnhancedInfluencerForScoring[],
  niches: string[]
): EnhancedInfluencerForScoring[] {
  const nichesLower = niches.map((n) => n.toLowerCase())
  return influencers.filter((inf) =>
    inf.niche.some((n) => nichesLower.includes(n.toLowerCase()))
  )
}

function filterByFollowers(
  influencers: EnhancedInfluencerForScoring[],
  min?: number,
  max?: number
): EnhancedInfluencerForScoring[] {
  return influencers.filter((inf) => {
    const totalFollowers = inf.socialAccounts.reduce((sum, acc) => sum + acc.followersCount, 0)

    if (min !== undefined && totalFollowers < min) return false
    if (max !== undefined && totalFollowers > max) return false
    return true
  })
}

function filterByEngagement(
  influencers: EnhancedInfluencerForScoring[],
  min?: number,
  max?: number
): EnhancedInfluencerForScoring[] {
  return influencers.filter((inf) => {
    const avgEngagement =
      inf.socialAccounts.reduce((sum, acc) => sum + acc.engagementRate, 0) /
      inf.socialAccounts.length

    if (min !== undefined && avgEngagement < min) return false
    if (max !== undefined && avgEngagement > max) return false
    return true
  })
}

function filterByLocation(
  influencers: EnhancedInfluencerForScoring[],
  locations: string[]
): EnhancedInfluencerForScoring[] {
  const locationsLower = locations.map((l) => l.toLowerCase())
  return influencers.filter((inf) => {
    if (!inf.location) return false
    return locationsLower.some((loc) => inf.location!.toLowerCase().includes(loc))
  })
}

function filterByBudget(
  influencers: EnhancedInfluencerForScoring[],
  min: number,
  max: number
): EnhancedInfluencerForScoring[] {
  return influencers.filter((inf) => {
    // Check if any pricing falls within budget
    return inf.socialAccounts.some((acc) =>
      acc.pricing.some((price) => {
        const priceMax = price.priceMax || price.priceMin * 1.5
        // Price range overlaps with budget range
        return price.priceMin <= max && priceMax >= min
      })
    )
  })
}

// ===================================
// ENRICHMENT-BASED FILTERS
// ===================================

function filterByAuthenticity(
  influencers: EnhancedInfluencerForScoring[],
  minScore: number
): EnhancedInfluencerForScoring[] {
  return influencers.filter((inf) => {
    if (!inf.authenticity) return false
    return inf.authenticity.overallAuthenticityScore >= minScore
  })
}

function filterVerifiedOnly(
  influencers: EnhancedInfluencerForScoring[]
): EnhancedInfluencerForScoring[] {
  return influencers.filter((inf) => {
    if (!inf.authenticity) return false
    return inf.authenticity.isVerified
  })
}

function filterByGrowthTrend(
  influencers: EnhancedInfluencerForScoring[],
  trend: 'rising' | 'stable' | 'declining'
): EnhancedInfluencerForScoring[] {
  return influencers.filter((inf) => {
    // Check if any account has the required trend
    return inf.socialAccounts.some((acc) => {
      if (!acc.performanceSnapshots || acc.performanceSnapshots.length < 7) return false

      const snapshots = acc.performanceSnapshots.slice(0, 30)
      const growthRates = snapshots.map((s) => {
        if (s.followersCount === 0) return 0
        return (s.followersGrowth / s.followersCount) * 100
      })

      const avgGrowthRate = growthRates.reduce((sum, rate) => sum + rate, 0) / growthRates.length
      const monthlyGrowth = avgGrowthRate * 30

      if (trend === 'rising' && monthlyGrowth > 5) return true
      if (trend === 'stable' && monthlyGrowth >= -2 && monthlyGrowth <= 5) return true
      if (trend === 'declining' && monthlyGrowth < -2) return true

      return false
    })
  })
}

function filterByRiskLevel(
  influencers: EnhancedInfluencerForScoring[],
  maxRisk: 'low' | 'medium' | 'high'
): EnhancedInfluencerForScoring[] {
  const riskOrder = { low: 1, medium: 2, high: 3 }
  const maxRiskLevel = riskOrder[maxRisk]

  return influencers.filter((inf) => {
    if (!inf.authenticity) return true // Include if no data (benefit of doubt)
    const influencerRiskLevel = riskOrder[inf.authenticity.riskLevel as keyof typeof riskOrder] || 3
    return influencerRiskLevel <= maxRiskLevel
  })
}

function filterByCampaignSuccess(
  influencers: EnhancedInfluencerForScoring[],
  minSuccessRate: number
): EnhancedInfluencerForScoring[] {
  return influencers.filter((inf) => {
    if (!inf.campaignHistory || inf.campaignHistory.length === 0) return false

    const successfulCampaigns = inf.campaignHistory.filter((c) => c.deliveredOnTime).length
    const successRate = (successfulCampaigns / inf.campaignHistory.length) * 100

    return successRate >= minSuccessRate
  })
}

function filterByContentType(
  influencers: EnhancedInfluencerForScoring[],
  contentTypes: string[]
): EnhancedInfluencerForScoring[] {
  const contentTypesLower = contentTypes.map((c) => c.toLowerCase())

  return influencers.filter((inf) =>
    inf.socialAccounts.some((acc) =>
      acc.pricing.some((price) => contentTypesLower.includes(price.contentType.toLowerCase()))
    )
  )
}

function filterByPostingFrequency(
  influencers: EnhancedInfluencerForScoring[],
  frequency: 'daily' | 'weekly' | 'monthly'
): EnhancedInfluencerForScoring[] {
  const minPostsPerWeek = {
    daily: 5, // At least 5 posts per week
    weekly: 1, // At least 1 post per week
    monthly: 0.25, // At least 1 post per month
  }

  const minPosts = minPostsPerWeek[frequency]

  return influencers.filter((inf) =>
    inf.socialAccounts.some((acc) => {
      if (!acc.contentAnalysis) return false
      return acc.contentAnalysis.avgPostsPerWeek >= minPosts
    })
  )
}

function filterByHistoricalData(
  influencers: EnhancedInfluencerForScoring[]
): EnhancedInfluencerForScoring[] {
  return influencers.filter((inf) =>
    inf.socialAccounts.some(
      (acc) => acc.performanceSnapshots && acc.performanceSnapshots.length >= 7
    )
  )
}

function filterByReliability(
  influencers: EnhancedInfluencerForScoring[],
  minScore: number
): EnhancedInfluencerForScoring[] {
  return influencers.filter((inf) => {
    if (!inf.campaignHistory || inf.campaignHistory.length === 0) return false

    // Calculate reliability score (same logic as in scoring-v2.ts)
    const history = inf.campaignHistory
    let score = 0

    const onTimeCount = history.filter((c) => c.deliveredOnTime).length
    const onTimeRate = onTimeCount / history.length
    score += onTimeRate * 2

    const ratingsAvailable = history.filter((c) => c.qualityRating !== null)
    if (ratingsAvailable.length > 0) {
      const avgQuality =
        ratingsAvailable.reduce((sum, c) => sum + (c.qualityRating || 0), 0) /
        ratingsAvailable.length
      score += (avgQuality / 5) * 2
    } else {
      score += 1
    }

    const roiAvailable = history.filter((c) => c.roi !== null && c.roi !== undefined)
    if (roiAvailable.length > 0) {
      const avgROI = roiAvailable.reduce((sum, c) => sum + (c.roi || 0), 0) / roiAvailable.length
      if (avgROI > 300) score += 1
      else if (avgROI > 200) score += 0.75
      else if (avgROI > 150) score += 0.5
      else if (avgROI > 100) score += 0.25
    }

    const reliabilityScore = Math.min(5, score)
    return reliabilityScore >= minScore
  })
}

/**
 * Get count of influencers that would pass each filter individually
 * Useful for showing "X results" next to filter options
 */
export function getFilterCounts(
  influencers: EnhancedInfluencerForScoring[],
  filters: Partial<AdvancedFilters>
): Record<string, number> {
  const counts: Record<string, number> = {}

  if (filters.minAuthenticityScore !== undefined) {
    counts.authenticity = filterByAuthenticity(influencers, filters.minAuthenticityScore).length
  }

  if (filters.verifiedOnly) {
    counts.verified = filterVerifiedOnly(influencers).length
  }

  if (filters.growthTrend) {
    counts.growthTrend = filterByGrowthTrend(influencers, filters.growthTrend).length
  }

  if (filters.hasHistoricalData) {
    counts.historicalData = filterByHistoricalData(influencers).length
  }

  return counts
}
