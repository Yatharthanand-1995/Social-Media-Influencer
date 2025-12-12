import { BrandRequirements, InfluencerForScoring, ScoreBreakdown } from './types'

// 1. Platform Match Score (0-25 points)
export function calculatePlatformMatchScore(
  brandRequirements: BrandRequirements,
  influencer: InfluencerForScoring
): number {
  const requestedPlatforms = brandRequirements.platforms
  let score = 0
  let matchedPlatforms = 0

  for (const requestedPlatform of requestedPlatforms) {
    const account = influencer.socialAccounts.find(
      (acc) => acc.platform.toLowerCase() === requestedPlatform.toLowerCase()
    )

    if (account) {
      matchedPlatforms++

      // Primary platform gets full points
      if (influencer.primaryPlatform.toLowerCase() === requestedPlatform.toLowerCase()) {
        score += 25 / requestedPlatforms.length
      }
      // Secondary platform with good engagement
      else if (account.engagementRate >= 2) {
        score += 20 / requestedPlatforms.length
      }
      // Platform exists but low engagement
      else {
        score += 10 / requestedPlatforms.length
      }
    }
  }

  // Bonus for having all requested platforms
  if (matchedPlatforms === requestedPlatforms.length && requestedPlatforms.length > 1) {
    score = Math.min(25, score + 5)
  }

  return Math.round(score * 100) / 100
}

// 2. Niche Relevance Score (0-25 points)
export function calculateNicheRelevanceScore(
  brandRequirements: BrandRequirements,
  influencer: InfluencerForScoring
): number {
  const brandIndustries = brandRequirements.industry.map((i) => i.toLowerCase())
  const influencerNiches = influencer.niche.map((n) => n.toLowerCase())

  const matchingNiches = brandIndustries.filter((industry) =>
    influencerNiches.includes(industry)
  )

  if (matchingNiches.length === 0) return 0

  // Calculate base score
  let score = (matchingNiches.length / brandIndustries.length) * 25

  // Bonus for exact match
  if (matchingNiches.length === brandIndustries.length) {
    score = Math.min(25, score + 5)
  }

  return Math.round(score * 100) / 100
}

// 3. Audience Overlap Score (0-20 points)
export function calculateAudienceOverlapScore(
  brandRequirements: BrandRequirements,
  influencer: InfluencerForScoring
): number {
  // Get primary account demographics
  const primaryAccount = influencer.socialAccounts.find(
    (acc) => acc.platform === influencer.primaryPlatform
  )

  if (!primaryAccount?.audienceDemographics) return 0

  const demographics = primaryAccount.audienceDemographics

  // Age overlap (50% weight)
  let ageScore = 0
  const brandAgeGroups = brandRequirements.targetAudience.ageGroups
  for (const ageGroup of brandAgeGroups) {
    const percentage = demographics.ageGroup[ageGroup] || 0
    ageScore += percentage
  }
  const ageMatch = Math.min(100, ageScore) / 100

  // Gender overlap (30% weight)
  const brandGender = brandRequirements.targetAudience.gender
  const influencerGender = demographics.genderSplit

  const genderOverlap =
    Math.min(
      (brandGender.male / 100) * (influencerGender.male || 0) +
      (brandGender.female / 100) * (influencerGender.female || 0) +
      (brandGender.other / 100) * (influencerGender.other || 0)
    , 100) / 100

  // Location overlap (20% weight)
  const brandLocations = brandRequirements.targetAudience.locations.map((l) =>
    l.toUpperCase()
  )
  const influencerLocations = demographics.topCountries.map((l) => l.toUpperCase())

  const locationMatches = brandLocations.filter((loc) =>
    influencerLocations.includes(loc)
  )
  const locationMatch = locationMatches.length > 0 ? 1 : 0

  const audienceScore = (ageMatch * 0.5 + genderOverlap * 0.3 + locationMatch * 0.2) * 20

  return Math.round(audienceScore * 100) / 100
}

// 4. Engagement Quality Score (0-15 points)
export function calculateEngagementScore(influencer: InfluencerForScoring): number {
  const engagementRates = influencer.socialAccounts.map((acc) => acc.engagementRate)
  const avgEngagement =
    engagementRates.reduce((sum, rate) => sum + rate, 0) / engagementRates.length

  if (avgEngagement >= 5) return 15 // High engagement
  if (avgEngagement >= 2) return 10 // Medium engagement
  return 5 // Low engagement
}

// 5. Budget Fit Score (0-10 points)
export function calculateBudgetFitScore(
  brandRequirements: BrandRequirements,
  influencer: InfluencerForScoring
): number {
  const contentType = brandRequirements.contentType
  const maxBudget = brandRequirements.budget.max

  // Get pricing for requested content type across all relevant platforms
  let prices: number[] = []

  for (const platform of brandRequirements.platforms) {
    const account = influencer.socialAccounts.find(
      (acc) => acc.platform.toLowerCase() === platform.toLowerCase()
    )

    if (account) {
      const pricing = account.pricing.find(
        (p) => p.contentType.toLowerCase() === contentType.toLowerCase()
      )

      if (pricing) {
        prices.push(pricing.priceMin)
      }
    }
  }

  if (prices.length === 0) return 0

  const avgPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length

  if (avgPrice <= maxBudget) return 10 // Within budget
  if (avgPrice <= maxBudget * 1.2) return 7 // Slightly over
  if (avgPrice <= maxBudget * 1.5) return 4 // Over but negotiable
  return 0 // Too expensive
}

// 6. Reach Potential Score (0-5 points)
export function calculateReachPotentialScore(influencer: InfluencerForScoring): number {
  const totalFollowers = influencer.socialAccounts.reduce(
    (sum, acc) => sum + acc.followersCount,
    0
  )

  if (totalFollowers === 0) return 0

  // Normalize using log scale (max at 10M+ followers)
  const reachScore = (Math.log10(totalFollowers) / 7) * 5

  return Math.round(Math.min(5, reachScore) * 100) / 100
}

// Calculate Final Score (combine all scores)
export function calculateFinalScore(
  brandRequirements: BrandRequirements,
  influencer: InfluencerForScoring
): ScoreBreakdown {
  const platformMatch = calculatePlatformMatchScore(brandRequirements, influencer)
  const nicheRelevance = calculateNicheRelevanceScore(brandRequirements, influencer)
  const audienceOverlap = calculateAudienceOverlapScore(brandRequirements, influencer)
  const engagementQuality = calculateEngagementScore(influencer)
  const budgetFit = calculateBudgetFitScore(brandRequirements, influencer)
  const reachPotential = calculateReachPotentialScore(influencer)

  const total = Math.round(
    platformMatch +
    nicheRelevance +
    audienceOverlap +
    engagementQuality +
    budgetFit +
    reachPotential
  )

  return {
    platformMatch,
    nicheRelevance,
    audienceOverlap,
    engagementQuality,
    budgetFit,
    reachPotential,
    total,
  }
}
