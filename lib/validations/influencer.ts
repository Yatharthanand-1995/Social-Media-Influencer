import { z } from 'zod'
import { Platform, ContentType } from '@prisma/client'
import { urlSchema, positiveNumberSchema, percentageSchema, currencySchema, nonNegativeNumberSchema } from './common'

// Platform enum validation
export const platformSchema = z.nativeEnum(Platform)

// Content type enum validation
export const contentTypeSchema = z.nativeEnum(ContentType)

// Create influencer schema
export const createInfluencerSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  bio: z.string().max(500, "Bio is too long").optional(),
  profileImageUrl: urlSchema,
  primaryPlatform: platformSchema,
  niche: z.array(z.string()).min(1, "At least one niche is required"),
  location: z.string().max(100).optional(),
})

// Update influencer schema (all fields optional)
export const updateInfluencerSchema = createInfluencerSchema.partial()

// Social account schema
export const createSocialAccountSchema = z.object({
  influencerId: z.string().uuid(),
  platform: platformSchema,
  handle: z.string().min(1, "Handle is required").max(100),
  followersCount: positiveNumberSchema.int(),
  avgViews: positiveNumberSchema.int().optional(),
  avgLikes: nonNegativeNumberSchema.int(),
  avgComments: nonNegativeNumberSchema.int(),
  engagementRate: percentageSchema,
})

// Audience demographics schema
export const audienceDemographicsSchema = z.object({
  socialAccountId: z.string().uuid(),
  ageGroup: z.record(z.string(), z.number()),
  genderSplit: z.record(z.string(), z.number()),
  topCountries: z.array(z.string()),
  interests: z.array(z.string()),
})

// Pricing schema
export const pricingSchema = z.object({
  socialAccountId: z.string().uuid(),
  contentType: contentTypeSchema,
  priceMin: positiveNumberSchema,
  priceMax: positiveNumberSchema.optional(),
  currency: currencySchema,
}).refine(
  (data) => !data.priceMax || data.priceMax >= data.priceMin,
  {
    message: "Price max must be greater than or equal to price min",
    path: ["priceMax"],
  }
)

// Validation helper function
export function validateInfluencer(data: unknown) {
  return createInfluencerSchema.parse(data)
}

export function validateInfluencerUpdate(data: unknown) {
  return updateInfluencerSchema.parse(data)
}
