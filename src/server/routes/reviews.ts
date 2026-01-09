import { reviewService } from '../services/review.service'
import { getUser, json, errorResponse, parseBody, validateBody, parseSearchParams } from '../lib/api-utils'
import { submitReviewSchema, dueCardsQuerySchema } from '../lib/validation'

export async function handleReviews(req: Request, url: URL): Promise<Response> {
  const user = await getUser(req)
  if (!user) {
    return errorResponse('Unauthorized', 401)
  }

  const pathParts = url.pathname.split('/').filter(Boolean)
  const action = pathParts[2]

  if (req.method === 'GET') {
    if (action === 'due') {
      const queryParams = parseSearchParams(url, dueCardsQuerySchema)
      if ('error' in queryParams) {
        return errorResponse(queryParams.error)
      }

      const dueCards = await reviewService.getDueCards(
        user.id,
        queryParams.data.deckId,
        queryParams.data.limit
      )
      return json(dueCards)
    }

    if (action === 'stats') {
      const deckIdParam = url.searchParams.get('deckId')
      const deckId = deckIdParam ? parseInt(deckIdParam) : undefined

      const stats = await reviewService.getStats(user.id, deckId)
      return json(stats)
    }

    if (action === 'history') {
      const cardIdParam = url.searchParams.get('cardId')
      if (!cardIdParam) {
        return errorResponse('Card ID required', 400)
      }

      const cardId = parseInt(cardIdParam)
      const history = await reviewService.getCardReviewHistory(cardId, user.id)

      if (history === null) {
        return errorResponse('Card not found', 404)
      }

      return json(history)
    }

    return errorResponse('Invalid endpoint', 404)
  }

  if (req.method === 'POST') {
    const body = await parseBody(req)
    const validation = validateBody(body, submitReviewSchema)

    if ('error' in validation) {
      return errorResponse(validation.error)
    }

    const review = await reviewService.submitReview(validation.data, user.id)
    if (!review) {
      return errorResponse('Card not found', 404)
    }

    return json(review, 201)
  }

  return errorResponse('Method not allowed', 405)
}
