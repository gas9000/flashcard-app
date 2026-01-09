# Flashcard app API documentation

## Authentication

All API endpoints (except `/api/auth/*`) require authentication. The user session is managed by better-auth.

## Base URL

```
http://localhost:3000/api
```

## Endpoints

### Categories

#### GET /categories

Get all categories for the authenticated user.

**Response:**

```json
[
  {
    "id": 1,
    "userId": "user123",
    "name": "Language Learning",
    "color": "#FF5733",
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
]
```

#### GET /categories/:id
Get a specific category by ID.

#### POST /categories
Create a new category.

**Request Body:**

```json
{
  "name": "Programming",
  "color": "#3498db"
}
```

#### PUT /categories/:id

Update a category.

**Request Body:**

```json
{
  "name": "Updated Name",
  "color": "#e74c3c"
}
```

#### DELETE /categories/:id

Delete a category.

---

### Decks

#### GET /decks

Get all decks for the authenticated user.

**Query Parameters:**

- `categoryId` (optional): Filter by category ID

**Response:**

```json
[
  {
    "id": 1,
    "userId": "user123",
    "name": "Spanish Vocabulary",
    "description": "Common Spanish words and phrases",
    "categoryId": 1,
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z",
    "cardCount": 50
  }
]
```

#### GET /decks/:id

Get a specific deck by ID with card count.

#### POST /decks

Create a new deck.

**Request Body:**

```json
{
  "name": "Japanese Kanji",
  "description": "JLPT N5 Kanji",
  "categoryId": 1
}
```

#### PUT /decks/:id

Update a deck.

**Request Body:**

```json
{
  "name": "Updated Deck Name",
  "description": "Updated description",
  "categoryId": 2
}
```

#### DELETE /decks/:id

Delete a deck (cascades to cards and reviews).

---

### Cards

#### GET /cards

Get all cards in a deck.

**Query Parameters:**

- `deckId` (required): The deck ID

**Response:**

```json
[
  {
    "id": 1,
    "deckId": 1,
    "front": "Hola",
    "back": "Hello",
    "tags": ["greetings", "basic"],
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  }
]
```

#### GET /cards/:id

Get a specific card by ID.

#### POST /cards

Create a new card.

**Request Body:**

```json
{
  "deckId": 1,
  "front": "Adiós",
  "back": "Goodbye",
  "tags": ["greetings"]
}
```

#### PUT /cards/:id

Update a card.

**Request Body:**

```json
{
  "front": "Updated front",
  "back": "Updated back",
  "tags": ["updated", "tags"]
}
```

#### DELETE /cards/:id
Delete a card.

---

### Reviews

#### GET /reviews/due
Get cards due for review.

**Query Parameters:**
- `deckId` (optional): Filter by deck ID
- `limit` (optional): Maximum number of cards (default: 20, max: 100)

**Response:**
```json
[
  {
    "id": 1,
    "deckId": 1,
    "front": "Hola",
    "back": "Hello",
    "tags": ["greetings"],
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z",
    "lastReview": {
      "id": 1,
      "cardId": 1,
      "userId": "user123",
      "quality": 4,
      "easinessFactor": 2.5,
      "interval": 6,
      "repetitions": 2,
      "nextReview": "2025-01-07T00:00:00.000Z",
      "lastReviewed": "2025-01-01T00:00:00.000Z"
    }
  }
]
```

#### GET /reviews/stats
Get review statistics.

**Query Parameters:**
- `deckId` (optional): Filter by deck ID

**Response:**
```json
{
  "total": 100,
  "new": 20,
  "learning": 30,
  "review": 50,
  "due": 15
}
```

#### GET /reviews/history
Get review history for a card.

**Query Parameters:**
- `cardId` (required): The card ID

**Response:**
```json
[
  {
    "id": 1,
    "cardId": 1,
    "userId": "user123",
    "quality": 4,
    "easinessFactor": 2.5,
    "interval": 6,
    "repetitions": 2,
    "nextReview": "2025-01-07T00:00:00.000Z",
    "lastReviewed": "2025-01-01T00:00:00.000Z"
  }
]
```

#### POST /reviews
Submit a card review.

**Request Body:**
```json
{
  "cardId": 1,
  "quality": 4
}
```

**Quality Ratings:**
- 0 - Complete blackout
- 1 - Incorrect, but recognized
- 2 - Incorrect, but seemed easy
- 3 - Correct with difficulty
- 4 - Correct with hesitation
- 5 - Perfect recall

**Response:**
```json
{
  "id": 1,
  "cardId": 1,
  "userId": "user123",
  "quality": 4,
  "easinessFactor": 2.5,
  "interval": 6,
  "repetitions": 2,
  "nextReview": "2025-01-07T00:00:00.000Z",
  "lastReviewed": "2025-01-01T00:00:00.000Z"
}
```

---

## Error Responses

All endpoints return errors in the following format:

```json
{
  "error": "Error message here"
}
```

Common HTTP status codes:

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (not logged in)
- `404` - Not Found
- `405` - Method Not Allowed
- `500` - Internal Server Error

---

## Frontend Usage

Use the provided API client in `src/lib/api-client.ts`:

```typescript
import { api } from '@/lib/api-client'

const categories = await api.categories.getAll()

const deck = await api.decks.create({
  name: 'My Deck',
  description: 'My description',
  categoryId: 1
})

const dueCards = await api.reviews.getDue({ limit: 10 })

await api.reviews.submit({
  cardId: 1,
  quality: 5
})
```
