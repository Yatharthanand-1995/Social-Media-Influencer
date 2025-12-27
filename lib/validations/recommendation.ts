import { z } from 'zod'
import { platformSchema } from './influencer'

// Campaign goal enum
export const campaignGoalSchema = z.enum(['awareness', 'sales', 'engagement'])

// Recommendation request schema
export const recommendationRequestSchema = z.object({
  industry: z.array(z.string()).min(1, "At least one industry is required"),
  campaignGoal: campaignGoalSchema.optional(),
  targetAudience: z.object({
    ageGroups: z.array(z.string()).optional(),
    gender: z.object({
      male: z.number().min(0).max(100).optional(),
      female: z.number().min(0).max(100).optional(),
      other: z.number().min(0).max(100).optional(),
    }).optional(),
    locations: z.array(z.string()).optional(),
  }),
  budget: z.object({
    min: z.number().min(0),
    max: z.number().min(0),
  }).refine(
    (data) => data.max >= data.min,
    {
      message: "Budget max must be greater than or equal to budget min",
      path: ["max"],
    }
  ),
  // Accept platform strings (will be converted to uppercase in API)
  platforms: z.array(z.string()).min(1, "At least one platform is required"),
  // ContentType can be a string or array of strings for flexibility
  contentType: z.union([z.string(), z.array(z.string())]).optional(),
})

// Type export
export type RecommendationRequest = z.infer<typeof recommendationRequestSchema>

// Validation helper function
export function validateRecommendationRequest(data: unknown) {
  return recommendationRequestSchema.parse(data)
}
