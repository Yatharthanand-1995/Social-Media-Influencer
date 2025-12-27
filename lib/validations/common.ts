import { z } from 'zod'

// Common reusable validation schemas

export const urlSchema = z.string().url().max(500).optional()

export const emailSchema = z.string().email()

export const percentageSchema = z.number().min(0).max(100)

export const positiveNumberSchema = z.number().positive()

export const positiveIntSchema = z.number().int().positive()

export const nonNegativeNumberSchema = z.number().min(0)

export const phoneSchema = z.string().regex(/^\+?[1-9]\d{1,14}$/).optional()

export const currencySchema = z.string().length(3).default("USD")

// Common pagination schemas
export const paginationSchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

// Common sorting schema
export const sortOrderSchema = z.enum(['asc', 'desc']).default('desc')
