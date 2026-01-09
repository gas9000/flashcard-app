import { db } from '../db'
import { categories } from '../db/schema'
import { eq, and } from 'drizzle-orm'
import type { CreateCategoryInput, UpdateCategoryInput } from '../lib/validation'

export class CategoryService {
  async getAll(userId: string) {
    return await db.select().from(categories).where(eq(categories.userId, userId))
  }

  async getById(id: number, userId: string) {
    const result = await db
      .select()
      .from(categories)
      .where(and(eq(categories.id, id), eq(categories.userId, userId)))
      .limit(1)

    return result[0] || null
  }

  async create(data: CreateCategoryInput, userId: string) {
    const result = await db
      .insert(categories)
      .values({
        userId,
        name: data.name,
        color: data.color,
      })
      .returning()

    return result[0]
  }

  async update(id: number, data: UpdateCategoryInput, userId: string) {
    const existing = await this.getById(id, userId)
    if (!existing) {
      return null
    }

    const result = await db
      .update(categories)
      .set({
        ...data,
      })
      .where(eq(categories.id, id))
      .returning()

    return result[0]
  }

  async delete(id: number, userId: string) {
    const existing = await this.getById(id, userId)
    if (!existing) {
      return false
    }

    await db.delete(categories).where(eq(categories.id, id))
    return true
  }
}

export const categoryService = new CategoryService()
