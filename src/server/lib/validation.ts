import { z } from 'zod'

// Category schemas
export const createCategorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format').optional(),
})

export const updateCategorySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
})

// Deck schemas
export const createDeckSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().max(500).optional(),
  categoryId: z.number().int().positive().optional(),
})

export const updateDeckSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  categoryId: z.number().int().positive().nullable().optional(),
})

// Card schemas
export const createCardSchema = z.object({
  deckId: z.number().int().positive(),
  front: z.string().min(1, 'Front is required').max(1000),
  back: z.string().min(1, 'Back is required').max(1000),
  tags: z.array(z.string()).optional(),
})

export const updateCardSchema = z.object({
  front: z.string().min(1).max(1000).optional(),
  back: z.string().min(1).max(1000).optional(),
  tags: z.array(z.string()).optional(),
})

// Review schema
export const submitReviewSchema = z.object({
  cardId: z.number().int().positive(),
  quality: z.number().int().min(0).max(5),
})

// Query params
export const deckQuerySchema = z.object({
  categoryId: z.number().int().positive().optional(),
})

export const cardQuerySchema = z.object({
  deckId: z.number().int().positive(),
})

export const dueCardsQuerySchema = z.object({
  deckId: z.number().int().positive().optional(),
  limit: z.number().int().positive().max(100).optional(),
})

export type CreateCategoryInput = z.infer<typeof createCategorySchema>
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>
export type CreateDeckInput = z.infer<typeof createDeckSchema>
export type UpdateDeckInput = z.infer<typeof updateDeckSchema>
export type CreateCardInput = z.infer<typeof createCardSchema>
export type UpdateCardInput = z.infer<typeof updateCardSchema>
export type SubmitReviewInput = z.infer<typeof submitReviewSchema>
export type DeckQueryInput = z.infer<typeof deckQuerySchema>
export type CardQueryInput = z.infer<typeof cardQuerySchema>
export type DueCardsQueryInput = z.infer<typeof dueCardsQuerySchema>
