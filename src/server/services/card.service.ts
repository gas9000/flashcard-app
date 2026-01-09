import { db } from '../db'
import { cards, decks } from '../db/schema'
import { eq, and } from 'drizzle-orm'
import type { CreateCardInput, UpdateCardInput } from '../lib/validation'

export class CardService {
  async getAll(deckId: number, userId: string) {
    const deck = await db
      .select()
      .from(decks)
      .where(and(eq(decks.id, deckId), eq(decks.userId, userId)))
      .limit(1)

    if (!deck[0]) {
      return null
    }

    return await db.select().from(cards).where(eq(cards.deckId, deckId))
  }

  async getById(id: number, userId: string) {
    const result = await db
      .select({
        card: cards,
        deck: decks,
      })
      .from(cards)
      .innerJoin(decks, eq(cards.deckId, decks.id))
      .where(and(eq(cards.id, id), eq(decks.userId, userId)))
      .limit(1)

    if (!result[0]) {
      return null
    }

    return result[0].card
  }

  async create(data: CreateCardInput, userId: string) {
    const deck = await db
      .select()
      .from(decks)
      .where(and(eq(decks.id, data.deckId), eq(decks.userId, userId)))
      .limit(1)

    if (!deck[0]) {
      return null
    }

    const result = await db
      .insert(cards)
      .values({
        deckId: data.deckId,
        front: data.front,
        back: data.back,
        tags: data.tags || [],
      })
      .returning()

    await db
      .update(decks)
      .set({ updatedAt: new Date() })
      .where(eq(decks.id, data.deckId))

    return result[0]
  }

  async update(id: number, data: UpdateCardInput, userId: string) {
    const existing = await this.getById(id, userId)
    if (!existing) {
      return null
    }

    const result = await db
      .update(cards)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(cards.id, id))
      .returning()

    await db
      .update(decks)
      .set({ updatedAt: new Date() })
      .where(eq(decks.id, existing.deckId))

    return result[0]
  }

  async delete(id: number, userId: string) {
    const existing = await this.getById(id, userId)
    if (!existing) {
      return false
    }

    await db.delete(cards).where(eq(cards.id, id))

    await db
      .update(decks)
      .set({ updatedAt: new Date() })
      .where(eq(decks.id, existing.deckId))

    return true
  }
}

export const cardService = new CardService()
