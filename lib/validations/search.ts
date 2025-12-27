import { z } from 'zod'
import { Platform } from '@prisma/client'
import { platformSchema } from './influencer'

// Search and filter schema
export const searchInfluencersSchema = z.object({
  // Filters - accept string (will be validated against Platform enum in API)
  platform: z.string().optional(),
  niche: z.string().max(100).optional(),
  minFollowers: z.coerce.number().min(0).optional(),
  maxFollowers: z.coerce.number().min(0).optional(),
  minEngagement: z.coerce.number().min(0).max(100).optional(),
  maxEngagement: z.coerce.number().min(0).max(100).optional(),
  location: z.string().max(100).optional(),

  // Sorting
  sortBy: z.enum(['createdAt', 'followers', 'engagement']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),

  // Pagination
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
}).refine(
  (data) => {
    // If both minFollowers and maxFollowers are provided, min should be <= max
    if (data.minFollowers !== undefined && data.maxFollowers !== undefined) {
      return data.minFollowers <= data.maxFollowers
    }
    return true
  },
  {
    message: "Min followers must be less than or equal to max followers",
    path: ["minFollowers"],
  }
).refine(
  (data) => {
    // If both minEngagement and maxEngagement are provided, min should be <= max
    if (data.minEngagement !== undefined && data.maxEngagement !== undefined) {
      return data.minEngagement <= data.maxEngagement
    }
    return true
  },
  {
    message: "Min engagement must be less than or equal to max engagement",
    path: ["minEngagement"],
  }
)

// Type export for use in API routes
export type SearchInfluencersInput = z.infer<typeof searchInfluencersSchema>

// Validation helper function
export function validateSearchParams(params: unknown) {
  return searchInfluencersSchema.parse(params)
}
