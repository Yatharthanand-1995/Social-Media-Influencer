// Brand Requirements Interface
export interface BrandRequirements {
  industry: string[]
  campaignGoal?: 'awareness' | 'sales' | 'engagement'
  targetAudience: {
    ageGroups?: string[]      // e.g., ["18-24", "25-34"]
    gender?: {
      male?: number           // percentage 0-100
      female?: number         // percentage 0-100
      other?: number          // percentage 0-100
    }
    locations?: string[]      // e.g., ["US", "UK", "CA"]
  }
  budget: {
    min: number
    max: number
  }
  platforms: string[]        // e.g., ["instagram", "youtube"]
  contentType?: string[]        // e.g., ["post", "reel", "video"]
}

// Score Breakdown Interface (Original - 6 factors)
export interface ScoreBreakdown {
  platformMatch: number      // 0-25
  nicheRelevance: number     // 0-25
  audienceOverlap: number    // 0-20
  engagementQuality: number  // 0-15
  budgetFit: number          // 0-10
  reachPotential: number     // 0-5
  total: number              // 0-100
}

// Enhanced Score Breakdown Interface (9 factors)
export interface EnhancedScoreBreakdown {
  // Adjusted weights for existing factors
  platformMatch: number        // 0-20 (was 25)
  nicheRelevance: number       // 0-20 (was 25)
  audienceOverlap: number      // 0-15 (was 20)
  engagementQuality: number    // 0-12 (was 15)
  budgetFit: number            // 0-8 (was 10)
  reachPotential: number       // 0-5 (unchanged)

  // New factors from enrichment data
  authenticityScore: number    // 0-10
  performanceTrend: number     // 0-5
  reliabilityScore: number     // 0-5

  total: number                // 0-100
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
  influencer: InfluencerForScoring  // Influencer object with scoring data
  score: number                      // Final score 0-100
  scoreBreakdown: ScoreBreakdown
  roiMetrics: ROIMetrics
  explanation: string                // Why this is a good match
  matchReasons: string[]             // Bullet points of match reasons
}

// Enhanced Recommendation Result Interface
export interface EnhancedRecommendationResult {
  influencer: EnhancedInfluencerForScoring
  score: number                      // Final score 0-100
  scoreBreakdown: EnhancedScoreBreakdown
  roiMetrics: ROIMetrics
  explanation: string
  matchReasons: string[]
  // Additional insights from enrichment data
  insights: {
    authenticityLevel: 'high' | 'medium' | 'low' | 'unknown'
    growthTrend: 'rising' | 'stable' | 'declining' | 'unknown'
    reliability: 'excellent' | 'good' | 'fair' | 'unknown'
    riskFactors: string[]
  }
}

// Advanced Filtering Options
export interface AdvancedFilters {
  // Basic filters
  platforms?: string[]
  niches?: string[]
  minFollowers?: number
  maxFollowers?: number
  minEngagement?: number
  maxEngagement?: number
  locations?: string[]
  budgetRange?: { min: number; max: number }

  // Enrichment-based filters
  minAuthenticityScore?: number
  verifiedOnly?: boolean
  growthTrend?: 'rising' | 'stable' | 'declining'
  riskLevelMax?: 'low' | 'medium' | 'high'
  minCampaignSuccess?: number  // Percentage of successful campaigns
  contentTypes?: string[]
  postingFrequency?: 'daily' | 'weekly' | 'monthly'
  hasHistoricalData?: boolean
  minReliabilityScore?: number
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

// Enhanced Influencer for Scoring (with enrichment data)
export interface EnhancedInfluencerForScoring extends InfluencerForScoring {
  // Authenticity data
  authenticity?: {
    overallAuthenticityScore: number
    followerQualityScore: number
    engagementAuthenticityScore: number
    riskLevel: string
    isVerified: boolean
  } | null

  // Campaign history for reliability scoring
  campaignHistory?: Array<{
    deliveredOnTime: boolean
    qualityRating: number | null
    professionalismScore: number | null
    roi: number | null
  }>

  // Social accounts with enriched data
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
    // Performance snapshots for trend analysis
    performanceSnapshots?: Array<{
      snapshotDate: Date
      followersCount: number
      followersGrowth: number
      engagementRate: number
    }>
    // Content analysis
    contentAnalysis?: {
      bestPerformingType: string
      avgPostsPerWeek: number
      postingConsistency: number
    } | null
  }>
}
