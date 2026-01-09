const API_BASE = '/api'

async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(error.error || `HTTP ${response.status}`)
  }

  return response.json()
}

export const api = {
  categories: {
    getAll: () => fetchAPI<Category[]>('/categories'),
    getById: (id: number) => fetchAPI<Category>(`/categories/${id}`),
    create: (data: CreateCategoryInput) =>
      fetchAPI<Category>('/categories', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: number, data: UpdateCategoryInput) =>
      fetchAPI<Category>(`/categories/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: number) =>
      fetchAPI<{ success: boolean }>(`/categories/${id}`, {
        method: 'DELETE',
      }),
  },

  decks: {
    getAll: (categoryId?: number) =>
      fetchAPI<DeckWithStats[]>(
        `/decks${categoryId ? `?categoryId=${categoryId}` : ''}`
      ),
    getById: (id: number) => fetchAPI<DeckWithStats>(`/decks/${id}`),
    create: (data: CreateDeckInput) =>
      fetchAPI<Deck>('/decks', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: number, data: UpdateDeckInput) =>
      fetchAPI<Deck>(`/decks/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: number) =>
      fetchAPI<{ success: boolean }>(`/decks/${id}`, {
        method: 'DELETE',
      }),
  },

  cards: {
    getAll: (deckId: number) => fetchAPI<Card[]>(`/cards?deckId=${deckId}`),
    getById: (id: number) => fetchAPI<Card>(`/cards/${id}`),
    create: (data: CreateCardInput) =>
      fetchAPI<Card>('/cards', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: number, data: UpdateCardInput) =>
      fetchAPI<Card>(`/cards/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: number) =>
      fetchAPI<{ success: boolean }>(`/cards/${id}`, {
        method: 'DELETE',
      }),
  },

  reviews: {
    getDue: (params?: { deckId?: number; limit?: number }) =>
      fetchAPI<CardWithReview[]>(
        `/reviews/due${params ? `?${new URLSearchParams(params as Record<string, string>).toString()}` : ''}`
      ),
    getStats: (deckId?: number) =>
      fetchAPI<ReviewStats>(
        `/reviews/stats${deckId ? `?deckId=${deckId}` : ''}`
      ),
    getHistory: (cardId: number) =>
      fetchAPI<CardReview[]>(`/reviews/history?cardId=${cardId}`),
    submit: (data: SubmitReviewInput) =>
      fetchAPI<CardReview>('/reviews', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },
}

export type Category = {
  id: number
  userId: string
  name: string
  color: string | null
  createdAt: Date
}

export type Deck = {
  id: number
  userId: string
  name: string
  description: string | null
  categoryId: number | null
  createdAt: Date
  updatedAt: Date
}

export type DeckWithStats = Deck & {
  cardCount: number
}

export type Card = {
  id: number
  deckId: number
  front: string
  back: string
  tags: string[]
  createdAt: Date
  updatedAt: Date
}

export type CardReview = {
  id: number
  cardId: number
  userId: string
  quality: number
  easinessFactor: number
  interval: number
  repetitions: number
  nextReview: Date
  lastReviewed: Date
}

export type CardWithReview = Card & {
  lastReview?: CardReview
}

export type ReviewStats = {
  total: number
  new: number
  learning: number
  review: number
  due: number
}

export type CreateCategoryInput = {
  name: string
  color?: string
}

export type UpdateCategoryInput = {
  name?: string
  color?: string
}

export type CreateDeckInput = {
  name: string
  description?: string
  categoryId?: number
}

export type UpdateDeckInput = {
  name?: string
  description?: string
  categoryId?: number | null
}

export type CreateCardInput = {
  deckId: number
  front: string
  back: string
  tags?: string[]
}

export type UpdateCardInput = {
  front?: string
  back?: string
  tags?: string[]
}

export type SubmitReviewInput = {
  cardId: number
  quality: number
}
