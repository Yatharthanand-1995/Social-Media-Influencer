// Brand Requirements Interface
export interface BrandRequirements {
  industry: string[]
  campaignGoal: 'awareness' | 'sales' | 'engagement'
  targetAudience: {
    ageGroups: string[]      // e.g., ["18-24", "25-34"]
    gender: {
      male: number           // percentage 0-100
      female: number         // percentage 0-100
      other: number          // percentage 0-100
    }
    locations: string[]      // e.g., ["US", "UK", "CA"]
  }
  budget: {
    min: number
    max: number
  }
  platforms: string[]        // e.g., ["instagram", "youtube"]
  contentType: string        // e.g., "post", "reel", "video"
}

// Score Breakdown Interface
export interface ScoreBreakdown {
  platformMatch: number      // 0-25
  nicheRelevance: number     // 0-25
  audienceOverlap: number    // 0-20
  engagementQuality: number  // 0-15
  budgetFit: number          // 0-10
  reachPotential: number     // 0-5
  total: number              // 0-100
}

// ROI Metrics Interface
export interface ROIMetrics {
  predictedReach: number
  costPerEngagement: number
  expectedImpressions: number
  estimatedROI: number
}

// Recommendation Result Interface
export interface RecommendationResult {
  influencer: any            // Full influencer object from database
  score: number              // Final score 0-100
  scoreBreakdown: ScoreBreakdown
  roiMetrics: ROIMetrics
  explanation: string        // Why this is a good match
  matchReasons: string[]     // Bullet points of match reasons
}

// Influencer for Scoring (simplified)
export interface InfluencerForScoring {
  id: string
  name: string
  primaryPlatform: string
  niche: string[]
  location: string | null
  socialAccounts: Array<{
    platform: string
    followersCount: number
    engagementRate: number
    avgLikes: number
    avgComments: number
    avgViews?: number
    pricing: Array<{
      contentType: string
      priceMin: number
      priceMax: number | null
    }>
    audienceDemographics?: {
      ageGroup: Record<string, number>
      genderSplit: Record<string, number>
      topCountries: string[]
    } | null
  }>
}
