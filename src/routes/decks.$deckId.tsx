import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { ProtectedRoute } from '@/components/protected-route'
import { Layout } from '@/components/layout'
import { api } from '@/lib/api-client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Plus, Pencil, Trash2, Play, ArrowLeft } from 'lucide-react'

export const Route = createFileRoute('/decks/$deckId')({
  component: DeckDetailPage,
})

function DeckDetailPage() {
  const { deckId } = Route.useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [isAddingCard, setIsAddingCard] = useState(false)
  const [editingCard, setEditingCard] = useState<number | null>(null)
  const [deletingDeck, setDeletingDeck] = useState(false)

  const { data: deck, isLoading: deckLoading } = useQuery({
    queryKey: ['deck', deckId],
    queryFn: () => api.decks.getById(parseInt(deckId)),
  })

  const { data: cards, isLoading: cardsLoading } = useQuery({
    queryKey: ['cards', deckId],
    queryFn: () => api.cards.getAll(parseInt(deckId)),
  })

  const deleteDeckMutation = useMutation({
    mutationFn: () => api.decks.delete(parseInt(deckId)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['decks'] })
      navigate({ to: '/decks' })
    },
  })

  const deleteCardMutation = useMutation({
    mutationFn: api.cards.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards', deckId] })
      queryClient.invalidateQueries({ queryKey: ['deck', deckId] })
    },
  })

  if (deckLoading || cardsLoading) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="text-center py-12">Loading...</div>
        </Layout>
      </ProtectedRoute>
    )
  }

  if (!deck || cards === null) {
    return (
      <ProtectedRoute>
        <Layout>
          <Alert variant="destructive">
            <AlertDescription>Deck not found</AlertDescription>
          </Alert>
        </Layout>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate({ to: '/decks' })}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold">{deck.name}</h1>
              {deck.description && (
                <p className="text-gray-600 mt-1">{deck.description}</p>
              )}
            </div>
            <div className="flex gap-2">
              {cards && cards.length > 0 && (
                <Link
                  to="/study"
                  search={{ deckId: parseInt(deckId) }}
                >
                  <Button className="gap-2">
                    <Play className="w-4 h-4" />
                    Study
                  </Button>
                </Link>
              )}
              <Dialog open={deletingDeck} onOpenChange={setDeletingDeck}>
                <DialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Delete Deck</DialogTitle>
                    <DialogDescription>
                      Are you sure? This will delete all {deck.cardCount} cards in this deck.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setDeletingDeck(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => deleteDeckMutation.mutate()}
                      disabled={deleteDeckMutation.isPending}
                    >
                      Delete Deck
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">
              Cards ({cards?.length || 0})
            </h2>
            <Button
              onClick={() => setIsAddingCard(true)}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Card
            </Button>
          </div>

          {isAddingCard && (
            <CardForm
              deckId={parseInt(deckId)}
              onClose={() => setIsAddingCard(false)}
            />
          )}

          {cards && cards.length > 0 ? (
            <div className="grid gap-4">
              {cards.map((card) => (
                <div key={card.id}>
                  {editingCard === card.id ? (
                    <CardForm
                      deckId={parseInt(deckId)}
                      card={card}
                      onClose={() => setEditingCard(null)}
                    />
                  ) : (
                    <Card>
                      <CardContent className="pt-6">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-500 mb-1">Front</p>
                            <p className="font-medium">{card.front}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500 mb-1">Back</p>
                            <p className="font-medium">{card.back}</p>
                          </div>
                        </div>
                        {card.tags && card.tags.length > 0 && (
                          <div className="mt-3 flex gap-2 flex-wrap">
                            {card.tags.map((tag) => (
                              <span
                                key={tag}
                                className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                        <div className="flex gap-2 mt-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingCard(card.id)}
                          >
                            <Pencil className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteCardMutation.mutate(card.id)}
                            disabled={deleteCardMutation.isPending}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-gray-500 mb-4">No cards in this deck yet</p>
                <Button onClick={() => setIsAddingCard(true)}>
                  Add Your First Card
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  )
}

function CardForm({
  deckId,
  card,
  onClose,
}: {
  deckId: number
  card?: { id: number; front: string; back: string; tags: string[] }
  onClose: () => void
}) {
  const queryClient = useQueryClient()
  const [front, setFront] = useState(card?.front || '')
  const [back, setBack] = useState(card?.back || '')
  const [tags, setTags] = useState(card?.tags.join(', ') || '')
  const [error, setError] = useState('')

  const createMutation = useMutation({
    mutationFn: api.cards.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards', deckId.toString()] })
      queryClient.invalidateQueries({ queryKey: ['deck', deckId.toString()] })
      onClose()
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : 'Failed to create card')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: { front?: string; back?: string; tags?: string[] } }) =>
      api.cards.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards', deckId.toString()] })
      onClose()
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : 'Failed to update card')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!front.trim() || !back.trim()) {
      setError('Front and back are required')
      return
    }

    const tagArray = tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)

    if (card) {
      updateMutation.mutate({
        id: card.id,
        data: {
          front: front.trim(),
          back: back.trim(),
          tags: tagArray,
        },
      })
    } else {
      createMutation.mutate({
        deckId,
        front: front.trim(),
        back: back.trim(),
        tags: tagArray,
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{card ? 'Edit Card' : 'New Card'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="front">Front *</Label>
              <Textarea
                id="front"
                value={front}
                onChange={(e) => setFront(e.target.value)}
                placeholder="Question or prompt"
                rows={3}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="back">Back *</Label>
              <Textarea
                id="back"
                value={back}
                onChange={(e) => setBack(e.target.value)}
                placeholder="Answer or response"
                rows={3}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g., vocabulary, grammar, beginner"
            />
          </div>

          <div className="flex gap-3">
            <Button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {createMutation.isPending || updateMutation.isPending
                ? 'Saving...'
                : card
                  ? 'Update Card'
                  : 'Add Card'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
