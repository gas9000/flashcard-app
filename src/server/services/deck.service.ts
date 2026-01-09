import { db } from '../db'
import { decks, cards } from '../db/schema'
import { eq, and, sql } from 'drizzle-orm'
import type { CreateDeckInput, UpdateDeckInput } from '../lib/validation'

export class DeckService {
  async getAll(userId: string, categoryId?: number) {
    const conditions = [eq(decks.userId, userId)]

    if (categoryId !== undefined) {
      conditions.push(eq(decks.categoryId, categoryId))
    }

    return await db
      .select({
        id: decks.id,
        name: decks.name,
        description: decks.description,
        categoryId: decks.categoryId,
        createdAt: decks.createdAt,
        updatedAt: decks.updatedAt,
        cardCount: sql<number>`(SELECT COUNT(*) FROM ${cards} WHERE ${cards.deckId} = ${decks.id})`,
      })
      .from(decks)
      .where(and(...conditions))
  }

  async getById(id: number, userId: string) {
    const result = await db
      .select({
        id: decks.id,
        name: decks.name,
        description: decks.description,
        categoryId: decks.categoryId,
        createdAt: decks.createdAt,
        updatedAt: decks.updatedAt,
        cardCount: sql<number>`(SELECT COUNT(*) FROM ${cards} WHERE ${cards.deckId} = ${decks.id})`,
      })
      .from(decks)
      .where(and(eq(decks.id, id), eq(decks.userId, userId)))
      .limit(1)

    return result[0] || null
  }

  async create(data: CreateDeckInput, userId: string) {
    const result = await db
      .insert(decks)
      .values({
        userId,
        name: data.name,
        description: data.description,
        categoryId: data.categoryId,
      })
      .returning()

    return result[0]
  }

  async update(id: number, data: UpdateDeckInput, userId: string) {
    const existing = await this.getById(id, userId)
    if (!existing) {
      return null
    }

    const result = await db
      .update(decks)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(decks.id, id))
      .returning()

    return result[0]
  }

  async delete(id: number, userId: string) {
    const existing = await this.getById(id, userId)
    if (!existing) {
      return false
    }

    await db.delete(decks).where(eq(decks.id, id))
    return true
  }
}

export const deckService = new DeckService()
