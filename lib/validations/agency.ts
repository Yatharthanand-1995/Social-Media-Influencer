import { z } from "zod"

/**
 * Validation schemas for Agency-related API endpoints
 */

// Client Management Schemas
export const createClientSchema = z.object({
  name: z.string().min(1, "Client name is required").max(100),
  industry: z.string().min(1, "Industry is required").max(50),
  logo: z.string().url("Invalid logo URL").optional().nullable(),
  notes: z.string().max(1000, "Notes too long (max 1000 characters)").optional().nullable(),
})

export const updateClientSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  industry: z.string().min(1).max(50).optional(),
  logo: z.string().url().optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
})

export const clientIdSchema = z.object({
  id: z.string().uuid("Invalid client ID format"),
})

// Saved Search Schemas
export const createSavedSearchSchema = z.object({
  name: z.string().min(1, "Search name is required").max(100),
  clientId: z.string().uuid().optional().nullable(),
  searchCriteria: z.object({
    platforms: z.array(z.string()).optional(),
    niches: z.array(z.string()).optional(),
    minFollowers: z.number().optional(),
    maxFollowers: z.number().optional(),
    minEngagement: z.number().optional(),
    maxEngagement: z.number().optional(),
    location: z.string().optional(),
    minAuthenticityScore: z.number().min(0).max(100).optional(),
    verifiedOnly: z.boolean().optional(),
    growthTrend: z.enum(['rising', 'stable', 'declining']).optional(),
    riskLevelMax: z.enum(['low', 'medium', 'high']).optional(),
  }),
})

export const updateSavedSearchSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  clientId: z.string().uuid().optional().nullable(),
  searchCriteria: z.object({
    platforms: z.array(z.string()).optional(),
    niches: z.array(z.string()).optional(),
    minFollowers: z.number().optional(),
    maxFollowers: z.number().optional(),
    minEngagement: z.number().optional(),
    maxEngagement: z.number().optional(),
    location: z.string().optional(),
    minAuthenticityScore: z.number().min(0).max(100).optional(),
    verifiedOnly: z.boolean().optional(),
    growthTrend: z.enum(['rising', 'stable', 'declining']).optional(),
    riskLevelMax: z.enum(['low', 'medium', 'high']).optional(),
  }).optional(),
})

// Campaign Schemas
export const createCampaignSchema = z.object({
  clientId: z.string().uuid("Invalid client ID"),
  name: z.string().min(1, "Campaign name is required").max(100),
  goal: z.string().min(1, "Campaign goal is required").max(500),
  budget: z.number().positive("Budget must be positive"),
  startDate: z.string().datetime("Invalid start date format"),
  endDate: z.string().datetime("Invalid end date format"),
  status: z.enum(['planning', 'active', 'paused', 'completed', 'cancelled']).default('planning'),
  targetMetrics: z.record(z.string(), z.any()),
})

export const updateCampaignSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  goal: z.string().min(1).max(500).optional(),
  budget: z.number().positive().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  status: z.enum(['planning', 'active', 'paused', 'completed', 'cancelled']).optional(),
  targetMetrics: z.record(z.string(), z.any()).optional(),
})

// Campaign Collaboration Schemas
export const createCollaborationSchema = z.object({
  campaignId: z.string().uuid(),
  influencerId: z.string().uuid(),
  agreedPrice: z.number().positive(),
  contentType: z.enum(['POST', 'STORY', 'REEL', 'VIDEO', 'SHORT', 'TWEET']),
  deliverables: z.string().min(1).max(500),
  status: z.enum(['proposed', 'negotiating', 'confirmed', 'in_progress', 'delivered', 'approved', 'rejected']).default('proposed'),
})

export const updateCollaborationSchema = z.object({
  agreedPrice: z.number().positive().optional(),
  contentType: z.enum(['POST', 'STORY', 'REEL', 'VIDEO', 'SHORT', 'TWEET']).optional(),
  deliverables: z.string().min(1).max(500).optional(),
  status: z.enum(['proposed', 'negotiating', 'confirmed', 'in_progress', 'delivered', 'approved', 'rejected']).optional(),
  actualReach: z.number().int().nonnegative().optional().nullable(),
  actualEngagement: z.number().int().nonnegative().optional().nullable(),
  actualROI: z.number().optional().nullable(),
})

// Influencer List Schemas
export const createListSchema = z.object({
  clientId: z.string().uuid(),
  name: z.string().min(1, "List name is required").max(100),
  description: z.string().max(500).optional().nullable(),
  tags: z.array(z.string()).default([]),
})

export const updateListSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional().nullable(),
  tags: z.array(z.string()).optional(),
})

export const addToListSchema = z.object({
  influencerId: z.string().uuid(),
  notes: z.string().max(500).optional().nullable(),
  status: z.enum(['prospect', 'contacted', 'negotiating', 'confirmed', 'rejected']).default('prospect'),
})

export const updateListItemSchema = z.object({
  notes: z.string().max(500).optional().nullable(),
  status: z.enum(['prospect', 'contacted', 'negotiating', 'confirmed', 'rejected']).optional(),
})

// Type exports for use in API routes
export type CreateClientInput = z.infer<typeof createClientSchema>
export type UpdateClientInput = z.infer<typeof updateClientSchema>
export type CreateSavedSearchInput = z.infer<typeof createSavedSearchSchema>
export type UpdateSavedSearchInput = z.infer<typeof updateSavedSearchSchema>
export type CreateCampaignInput = z.infer<typeof createCampaignSchema>
export type UpdateCampaignInput = z.infer<typeof updateCampaignSchema>
export type CreateCollaborationInput = z.infer<typeof createCollaborationSchema>
export type UpdateCollaborationInput = z.infer<typeof updateCollaborationSchema>
export type CreateListInput = z.infer<typeof createListSchema>
export type UpdateListInput = z.infer<typeof updateListSchema>
export type AddToListInput = z.infer<typeof addToListSchema>
export type UpdateListItemInput = z.infer<typeof updateListItemSchema>
