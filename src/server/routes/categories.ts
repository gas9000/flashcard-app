import { categoryService } from '../services/category.service'
import { getUser, json, errorResponse, parseBody, validateBody } from '../lib/api-utils'
import { createCategorySchema, updateCategorySchema } from '../lib/validation'

export async function handleCategories(req: Request, url: URL): Promise<Response> {
  const user = await getUser(req)
  if (!user) {
    return errorResponse('Unauthorized', 401)
  }

  const pathParts = url.pathname.split('/').filter(Boolean)
  const categoryId = pathParts[2] ? parseInt(pathParts[2]) : null

  if (req.method === 'GET') {
    if (categoryId) {
      const category = await categoryService.getById(categoryId, user.id)
      if (!category) {
        return errorResponse('Category not found', 404)
      }
      return json(category)
    }

    const categories = await categoryService.getAll(user.id)
    return json(categories)
  }

  if (req.method === 'POST') {
    const body = await parseBody(req)
    const validation = validateBody(body, createCategorySchema)

    if ('error' in validation) {
      return errorResponse(validation.error)
    }

    const category = await categoryService.create(validation.data, user.id)
    return json(category, 201)
  }

  if (req.method === 'PUT' || req.method === 'PATCH') {
    if (!categoryId) {
      return errorResponse('Category ID required', 400)
    }

    const body = await parseBody(req)
    const validation = validateBody(body, updateCategorySchema)

    if ('error' in validation) {
      return errorResponse(validation.error)
    }

    const category = await categoryService.update(categoryId, validation.data, user.id)
    if (!category) {
      return errorResponse('Category not found', 404)
    }

    return json(category)
  }

  if (req.method === 'DELETE') {
    if (!categoryId) {
      return errorResponse('Category ID required', 400)
    }

    const deleted = await categoryService.delete(categoryId, user.id)
    if (!deleted) {
      return errorResponse('Category not found', 404)
    }

    return json({ success: true })
  }

  return errorResponse('Method not allowed', 405)
}
