import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { ProtectedRoute } from '@/components/protected-route'
import { Layout } from '@/components/layout'
import { api } from '@/lib/api-client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BookOpen, Brain, Clock, Plus, TrendingUp, Library } from 'lucide-react'

export const Route = createFileRoute('/dashboard')({
  component: DashboardPage,
})

function DashboardPage() {
  const { data: stats } = useQuery({
    queryKey: ['stats'],
    queryFn: () => api.reviews.getStats(),
  })

  const { data: decks } = useQuery({
    queryKey: ['decks'],
    queryFn: () => api.decks.getAll(),
  })

  const { data: dueCards } = useQuery({
    queryKey: ['due-cards'],
    queryFn: () => api.reviews.getDue({ limit: 5 }),
  })

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Dashboard</h1>
              <p className="text-gray-600 mt-1">Track your learning progress</p>
            </div>
            <Link to="/decks/new">
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                New Deck
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Cards</CardTitle>
                <BookOpen className="w-4 h-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.total || 0}</div>
                <p className="text-xs text-gray-500 mt-1">
                  Across {decks?.length || 0} decks
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Due Today</CardTitle>
                <Clock className="w-4 h-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.due || 0}</div>
                <p className="text-xs text-gray-500 mt-1">
                  Cards ready to review
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Learning</CardTitle>
                <Brain className="w-4 h-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.learning || 0}</div>
                <p className="text-xs text-gray-500 mt-1">
                  In learning phase
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Mastered</CardTitle>
                <TrendingUp className="w-4 h-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.review || 0}</div>
                <p className="text-xs text-gray-500 mt-1">
                  Cards in review
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Study Now</CardTitle>
                <CardDescription>
                  Cards due for review today
                </CardDescription>
              </CardHeader>
              <CardContent>
                {dueCards && dueCards.length > 0 ? (
                  <div className="space-y-3">
                    {dueCards.slice(0, 3).map((card) => (
                      <div
                        key={card.id}
                        className="p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <p className="font-medium">{card.front}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          {card.lastReview
                            ? `Last reviewed ${Math.floor((Date.now() - new Date(card.lastReview.lastReviewed).getTime()) / (1000 * 60 * 60 * 24))} days ago`
                            : 'New card'}
                        </p>
                      </div>
                    ))}
                    <Link to="/study">
                      <Button className="w-full mt-4">
                        Start Studying ({stats?.due || 0} cards)
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Brain className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p>No cards due for review</p>
                    <p className="text-sm mt-1">You're all caught up!</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Decks</CardTitle>
                <CardDescription>
                  Your most recently updated decks
                </CardDescription>
              </CardHeader>
              <CardContent>
                {decks && decks.length > 0 ? (
                  <div className="space-y-3">
                    {decks.slice(0, 5).map((deck) => (
                      <Link
                        key={deck.id}
                        to="/decks/$deckId"
                        params={{ deckId: deck.id.toString() }}
                        className="block p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{deck.name}</p>
                            {deck.description && (
                              <p className="text-sm text-gray-500 mt-1">
                                {deck.description}
                              </p>
                            )}
                          </div>
                          <span className="text-sm text-gray-500">
                            {deck.cardCount} cards
                          </span>
                        </div>
                      </Link>
                    ))}
                    <Link to="/decks">
                      <Button variant="outline" className="w-full mt-4">
                        View All Decks
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Library className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p>No decks yet</p>
                    <Link to="/decks/new">
                      <Button className="mt-4">Create Your First Deck</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  )
}
