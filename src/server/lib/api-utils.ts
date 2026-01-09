import { auth } from '../auth'
import { z } from 'zod'

export async function getUser(req: Request) {
  const session = await auth.api.getSession({ headers: req.headers })
  if (!session?.user) {
    return null
  }
  return session.user
}

export function json(data: unknown, status: number = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

export function errorResponse(message: string, status: number = 400) {
  return json({ error: message }, status)
}

export async function parseBody(req: Request) {
  try {
    return await req.json()
  } catch {
    return null
  }
}

export function parseSearchParams<T>(url: URL, schema: z.ZodSchema<T>): { data: T } | { error: string } {
  const params: Record<string, string | number> = {}

  for (const [key, value] of url.searchParams.entries()) {
    const num = Number(value)
    params[key] = isNaN(num) ? value : num
  }

  const result = schema.safeParse(params)
  if (!result.success) {
    return { error: result.error.issues[0].message }
  }

  return { data: result.data }
}

export function validateBody<T>(body: unknown, schema: z.ZodSchema<T>): { data: T } | { error: string } {
  const result = schema.safeParse(body)
  if (!result.success) {
    return { error: result.error.issues[0].message }
  }
  return { data: result.data }
}
