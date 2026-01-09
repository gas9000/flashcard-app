import { deckService } from '../services/deck.service'
import { getUser, json, errorResponse, parseBody, validateBody, parseSearchParams } from '../lib/api-utils'
import { createDeckSchema, updateDeckSchema, deckQuerySchema } from '../lib/validation'

export async function handleDecks(req: Request, url: URL): Promise<Response> {
  const user = await getUser(req)
  if (!user) {
    return errorResponse('Unauthorized', 401)
  }

  const pathParts = url.pathname.split('/').filter(Boolean)
  const deckId = pathParts[2] ? parseInt(pathParts[2]) : null

  if (req.method === 'GET') {
    if (deckId) {
      const deck = await deckService.getById(deckId, user.id)
      if (!deck) {
        return errorResponse('Deck not found', 404)
      }
      return json(deck)
    }

    const queryParams = parseSearchParams(url, deckQuerySchema)
    if ('error' in queryParams) {
      return errorResponse(queryParams.error)
    }

    const decks = await deckService.getAll(user.id, queryParams.data.categoryId)
    return json(decks)
  }

  if (req.method === 'POST') {
    const body = await parseBody(req)
    const validation = validateBody(body, createDeckSchema)

    if ('error' in validation) {
      return errorResponse(validation.error)
    }

    const deck = await deckService.create(validation.data, user.id)
    return json(deck, 201)
  }

  if (req.method === 'PUT' || req.method === 'PATCH') {
    if (!deckId) {
      return errorResponse('Deck ID required', 400)
    }

    const body = await parseBody(req)
    const validation = validateBody(body, updateDeckSchema)

    if ('error' in validation) {
      return errorResponse(validation.error)
    }

    const deck = await deckService.update(deckId, validation.data, user.id)
    if (!deck) {
      return errorResponse('Deck not found', 404)
    }

    return json(deck)
  }

  if (req.method === 'DELETE') {
    if (!deckId) {
      return errorResponse('Deck ID required', 400)
    }

    const deleted = await deckService.delete(deckId, user.id)
    if (!deleted) {
      return errorResponse('Deck not found', 404)
    }

    return json({ success: true })
  }

  return errorResponse('Method not allowed', 405)
}
