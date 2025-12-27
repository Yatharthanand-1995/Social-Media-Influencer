// Type definitions for Influencer-related data structures

export interface PricingInput {
  contentType: string
  priceMin: number
  priceMax?: number | null
  currency?: string
}

export interface AudienceDemographicsInput {
  ageGroup: Record<string, number>
  genderSplit: Record<string, number>
  topCountries: string[]
  interests: string[]
}

export interface SocialAccountInput {
  platform: string
  handle: string
  followersCount: number
  avgViews?: number | null
  avgLikes: number
  avgComments: number
  engagementRate: number
  audienceDemographics?: AudienceDemographicsInput
  pricing?: PricingInput[]
}

export interface CreateInfluencerInput {
  name: string
  bio?: string | null
  profileImageUrl?: string | null
  primaryPlatform: string
  niche: string[]
  location?: string | null
  socialAccounts?: SocialAccountInput[]
}
