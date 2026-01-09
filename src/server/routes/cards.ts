import { cardService } from '../services/card.service'
import { getUser, json, errorResponse, parseBody, validateBody, parseSearchParams } from '../lib/api-utils'
import { createCardSchema, updateCardSchema, cardQuerySchema } from '../lib/validation'

export async function handleCards(req: Request, url: URL): Promise<Response> {
  const user = await getUser(req)
  if (!user) {
    return errorResponse('Unauthorized', 401)
  }

  const pathParts = url.pathname.split('/').filter(Boolean)
  const cardId = pathParts[2] ? parseInt(pathParts[2]) : null

  if (req.method === 'GET') {
    if (cardId) {
      const card = await cardService.getById(cardId, user.id)
      if (!card) {
        return errorResponse('Card not found', 404)
      }
      return json(card)
    }

    const queryParams = parseSearchParams(url, cardQuerySchema)
    if ('error' in queryParams) {
      return errorResponse(queryParams.error)
    }

    const cards = await cardService.getAll(queryParams.data.deckId, user.id)
    if (cards === null) {
      return errorResponse('Deck not found', 404)
    }

    return json(cards)
  }

  if (req.method === 'POST') {
    const body = await parseBody(req)
    const validation = validateBody(body, createCardSchema)

    if ('error' in validation) {
      return errorResponse(validation.error)
    }

    const card = await cardService.create(validation.data, user.id)
    if (!card) {
      return errorResponse('Deck not found', 404)
    }

    return json(card, 201)
  }

  if (req.method === 'PUT' || req.method === 'PATCH') {
    if (!cardId) {
      return errorResponse('Card ID required', 400)
    }

    const body = await parseBody(req)
    const validation = validateBody(body, updateCardSchema)

    if ('error' in validation) {
      return errorResponse(validation.error)
    }

    const card = await cardService.update(cardId, validation.data, user.id)
    if (!card) {
      return errorResponse('Card not found', 404)
    }

    return json(card)
  }

  if (req.method === 'DELETE') {
    if (!cardId) {
      return errorResponse('Card ID required', 400)
    }

    const deleted = await cardService.delete(cardId, user.id)
    if (!deleted) {
      return errorResponse('Card not found', 404)
    }

    return json({ success: true })
  }

  return errorResponse('Method not allowed', 405)
}
