import { db } from '../db'
import { cardReviews, cards, decks } from '../db/schema'
import { eq, and, desc } from 'drizzle-orm'
import { calculateNextReview } from '../lib/spaced-repetition'
import type { SubmitReviewInput } from '../lib/validation'

export class ReviewService {
  async getDueCards(userId: string, deckId?: number, limit: number = 20) {
    let query = db
      .select({
        card: cards,
        lastReview: cardReviews,
      })
      .from(cards)
      .innerJoin(decks, eq(cards.deckId, decks.id))
      .leftJoin(
        cardReviews,
        and(
          eq(cardReviews.cardId, cards.id),
          eq(cardReviews.userId, userId)
        )
      )
      .where(eq(decks.userId, userId))
      .$dynamic()

    if (deckId !== undefined) {
      query = query.where(and(eq(decks.userId, userId), eq(cards.deckId, deckId)))
    }

    const allCards = await query

    const now = new Date()
    const dueCards = allCards.filter((item) => {
      if (!item.lastReview) {
        return true
      }
      return item.lastReview.nextReview <= now
    })

    return dueCards.slice(0, limit).map((item) => ({
      ...item.card,
      lastReview: item.lastReview || undefined,
    }))
  }

  async getCardReviewHistory(cardId: number, userId: string) {
    const card = await db
      .select()
      .from(cards)
      .innerJoin(decks, eq(cards.deckId, decks.id))
      .where(and(eq(cards.id, cardId), eq(decks.userId, userId)))
      .limit(1)

    if (!card[0]) {
      return null
    }

    return await db
      .select()
      .from(cardReviews)
      .where(and(eq(cardReviews.cardId, cardId), eq(cardReviews.userId, userId)))
      .orderBy(desc(cardReviews.lastReviewed))
  }

  async getLatestReview(cardId: number, userId: string) {
    const result = await db
      .select()
      .from(cardReviews)
      .where(and(eq(cardReviews.cardId, cardId), eq(cardReviews.userId, userId)))
      .orderBy(desc(cardReviews.lastReviewed))
      .limit(1)

    return result[0] || null
  }

  async submitReview(data: SubmitReviewInput, userId: string) {
    const card = await db
      .select()
      .from(cards)
      .innerJoin(decks, eq(cards.deckId, decks.id))
      .where(and(eq(cards.id, data.cardId), eq(decks.userId, userId)))
      .limit(1)

    if (!card[0]) {
      return null
    }

    const latestReview = await this.getLatestReview(data.cardId, userId)

    const reviewResult = calculateNextReview(
      data.quality,
      latestReview?.easinessFactor || 2.5,
      latestReview?.interval || 0,
      latestReview?.repetitions || 0
    )

    const result = await db
      .insert(cardReviews)
      .values({
        cardId: data.cardId,
        userId,
        quality: data.quality,
        easinessFactor: reviewResult.easinessFactor,
        interval: reviewResult.interval,
        repetitions: reviewResult.repetitions,
        nextReview: reviewResult.nextReview,
        lastReviewed: new Date(),
      })
      .returning()

    return result[0]
  }

  async getStats(userId: string, deckId?: number) {
    const now = new Date()

    let cardsQuery = db
      .select({
        cardId: cards.id,
        deckId: cards.deckId,
        lastReview: cardReviews,
      })
      .from(cards)
      .innerJoin(decks, eq(cards.deckId, decks.id))
      .leftJoin(
        cardReviews,
        and(
          eq(cardReviews.cardId, cards.id),
          eq(cardReviews.userId, userId)
        )
      )
      .where(eq(decks.userId, userId))
      .$dynamic()

    if (deckId !== undefined) {
      cardsQuery = cardsQuery.where(and(eq(decks.userId, userId), eq(cards.deckId, deckId)))
    }

    const allCards = await cardsQuery

    const stats = {
      total: allCards.length,
      new: 0,
      learning: 0,
      review: 0,
      due: 0,
    }

    for (const card of allCards) {
      if (!card.lastReview) {
        stats.new++
      } else if (card.lastReview.repetitions < 2) {
        stats.learning++
      } else {
        stats.review++
      }

      if (!card.lastReview || card.lastReview.nextReview <= now) {
        stats.due++
      }
    }

    return stats
  }
}

export const reviewService = new ReviewService()
