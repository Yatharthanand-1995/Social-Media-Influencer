import { z } from 'zod'

// YouTube import schema
export const youtubeImportSchema = z.object({
  channelInput: z.string()
    .min(1, "Channel handle or ID is required")
    .max(200)
    .refine(
      (val) => {
        // Must be either @username format or UC... channel ID format
        return val.startsWith('@') || val.startsWith('UC') || val.startsWith('http')
      },
      {
        message: "Must be a channel handle (@username), channel ID (UC...), or YouTube URL",
      }
    ),
})

// Batch YouTube import schema
export const batchYoutubeImportSchema = z.object({
  channelInputs: z.array(z.string()).min(1).max(10),
})

// Type exports
export type YouTubeImportInput = z.infer<typeof youtubeImportSchema>
export type BatchYouTubeImportInput = z.infer<typeof batchYoutubeImportSchema>

// Validation helper functions
export function validateYouTubeImport(data: unknown) {
  return youtubeImportSchema.parse(data)
}

export function validateBatchYouTubeImport(data: unknown) {
  return batchYoutubeImportSchema.parse(data)
}
