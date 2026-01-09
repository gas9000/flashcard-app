import { auth } from './auth'
import { handleCategories } from './routes/categories'
import { handleDecks } from './routes/decks'
import { handleCards } from './routes/cards'
import { handleReviews } from './routes/reviews'

const corsHeaders = {
  'Access-Control-Allow-Origin': 'http://localhost:5173',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Credentials': 'true',
}

function addCorsHeaders(response: Response): Response {
  const headers = new Headers(response.headers)
  Object.entries(corsHeaders).forEach(([key, value]) => {
    headers.set(key, value)
  })
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  })
}

const server = Bun.serve({
  port: 3000,
  async fetch(req) {
    const url = new URL(req.url)

    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      })
    }

    // Better-auth handles all /api/auth/* routes
    if (url.pathname.startsWith('/api/auth')) {
      const response = await auth.handler(req)
      return addCorsHeaders(response)
    }

    // API routes
    if (url.pathname.startsWith('/api')) {
      let response: Response

      // Categories routes
      if (url.pathname.startsWith('/api/categories')) {
        response = await handleCategories(req, url)
      }
      // Decks routes
      else if (url.pathname.startsWith('/api/decks')) {
        response = await handleDecks(req, url)
      }
      // Cards routes
      else if (url.pathname.startsWith('/api/cards')) {
        response = await handleCards(req, url)
      }
      // Reviews routes
      else if (url.pathname.startsWith('/api/reviews')) {
        response = await handleReviews(req, url)
      }
      // Not found
      else {
        response = new Response(JSON.stringify({ error: 'API endpoint not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        })
      }

      return addCorsHeaders(response)
    }

    // Serve Vite dev server or static files
    return new Response('Not found', { status: 404 })
  },
})

console.log(`🚀 Server running at http://localhost:${server.port}`)
