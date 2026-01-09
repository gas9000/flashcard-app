import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { ProtectedRoute } from '@/components/protected-route'
import { Layout } from '@/components/layout'
import { api } from '@/lib/api-client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Library, BookOpen } from 'lucide-react'

export const Route = createFileRoute('/decks/')({
  component: DecksPage,
})

function DecksPage() {
  const { data: decks, isLoading } = useQuery({
    queryKey: ['decks'],
    queryFn: () => api.decks.getAll(),
  })

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Decks</h1>
              <p className="text-gray-600 mt-1">Manage your flashcard decks</p>
            </div>
            <Link to="/decks/new">
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                New Deck
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading decks...</p>
            </div>
          ) : decks && decks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {decks.map((deck) => (
                <Link
                  key={deck.id}
                  to="/decks/$deckId"
                  params={{ deckId: deck.id.toString() }}
                >
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                    <CardHeader>
                      <CardTitle className="flex items-start justify-between">
                        <span className="line-clamp-1">{deck.name}</span>
                        <BookOpen className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      </CardTitle>
                      {deck.description && (
                        <CardDescription className="line-clamp-2">
                          {deck.description}
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">
                          {deck.cardCount} {deck.cardCount === 1 ? 'card' : 'cards'}
                        </span>
                        <span className="text-gray-400">
                          Updated {new Date(deck.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Library className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium mb-2">No decks yet</h3>
                <p className="text-gray-500 mb-6">
                  Create your first deck to start learning
                </p>
                <Link to="/decks/new">
                  <Button>Create Deck</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  )
}
