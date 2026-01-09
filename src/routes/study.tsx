import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { ProtectedRoute } from '@/components/protected-route'
import { Layout } from '@/components/layout'
import { api } from '@/lib/api-client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react'

type SearchParams = {
  deckId?: number
}

export const Route = createFileRoute('/study')({
  component: StudyPage,
  validateSearch: (search: Record<string, unknown>): SearchParams => {
    return {
      deckId: search.deckId ? Number(search.deckId) : undefined,
    }
  },
})

function StudyPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { deckId } = Route.useSearch()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [sessionStats, setSessionStats] = useState({
    total: 0,
    correct: 0,
    incorrect: 0,
  })

  const { data: dueCards, isLoading } = useQuery({
    queryKey: ['due-cards', deckId],
    queryFn: () => api.reviews.getDue({ deckId, limit: 50 }),
  })

  const submitReviewMutation = useMutation({
    mutationFn: api.reviews.submit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stats'] })
      queryClient.invalidateQueries({ queryKey: ['due-cards'] })
    },
  })

  if (isLoading) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="text-center py-12">Loading cards...</div>
        </Layout>
      </ProtectedRoute>
    )
  }

  if (!dueCards || dueCards.length === 0) {
    return (
      <ProtectedRoute>
        <Layout>
          <Card>
            <CardContent className="text-center py-12">
              <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
              <h2 className="text-2xl font-bold mb-2">All Done!</h2>
              <p className="text-gray-600 mb-6">
                No cards due for review right now. Great work!
              </p>
              <Button onClick={() => navigate({ to: '/dashboard' })}>
                Back to Dashboard
              </Button>
            </CardContent>
          </Card>
        </Layout>
      </ProtectedRoute>
    )
  }

  const currentCard = dueCards[currentIndex]
  const progress = ((currentIndex + 1) / dueCards.length) * 100

  const handleRating = async (quality: number) => {
    await submitReviewMutation.mutateAsync({
      cardId: currentCard.id,
      quality,
    })

    setSessionStats((prev) => ({
      total: prev.total + 1,
      correct: quality >= 3 ? prev.correct + 1 : prev.correct,
      incorrect: quality < 3 ? prev.incorrect + 1 : prev.incorrect,
    }))

    if (currentIndex < dueCards.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setShowAnswer(false)
    } else {
      navigate({ to: '/dashboard' })
    }
  }

  const qualityOptions = [
    { value: 0, label: 'Complete Blackout', color: 'bg-red-500', description: "Didn't remember at all" },
    { value: 1, label: 'Incorrect', color: 'bg-orange-500', description: 'Wrong, but recognized answer' },
    { value: 2, label: 'Hard', color: 'bg-yellow-500', description: 'Correct, but very difficult' },
    { value: 3, label: 'Good', color: 'bg-blue-500', description: 'Correct with some effort' },
    { value: 4, label: 'Easy', color: 'bg-green-500', description: 'Correct, fairly easy' },
    { value: 5, label: 'Perfect', color: 'bg-emerald-500', description: 'Perfect recall' },
  ]

  return (
    <ProtectedRoute>
      <Layout>
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate({ to: '/dashboard' })}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Exit Study
            </Button>
            <div className="flex gap-4 text-sm">
              <Badge variant="outline" className="gap-1">
                <CheckCircle className="w-3 h-3 text-green-500" />
                {sessionStats.correct}
              </Badge>
              <Badge variant="outline" className="gap-1">
                <XCircle className="w-3 h-3 text-red-500" />
                {sessionStats.incorrect}
              </Badge>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Card {currentIndex + 1} of {dueCards.length}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} />
          </div>

          <Card className="min-h-[300px]">
            <CardHeader>
              <CardTitle className="text-center">
                {showAnswer ? 'Answer' : 'Question'}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center min-h-[200px]">
              <div className="text-center space-y-6 w-full">
                <p className="text-2xl font-medium px-6">
                  {currentCard.front}
                </p>

                {showAnswer && (
                  <div className="pt-6 border-t">
                    <p className="text-xl text-gray-700 px-6">
                      {currentCard.back}
                    </p>
                  </div>
                )}

                {!showAnswer && (
                  <Button
                    size="lg"
                    onClick={() => setShowAnswer(true)}
                    className="mt-6"
                  >
                    Show Answer
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {showAnswer && (
            <Card>
              <CardHeader>
                <CardTitle className="text-center text-lg">
                  How well did you know this?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {qualityOptions.map((option) => (
                    <Button
                      key={option.value}
                      onClick={() => handleRating(option.value)}
                      disabled={submitReviewMutation.isPending}
                      className={`h-auto py-4 flex flex-col items-start ${option.color} hover:opacity-90`}
                      variant="default"
                    >
                      <span className="font-semibold mb-1">{option.label}</span>
                      <span className="text-xs opacity-90 font-normal">
                        {option.description}
                      </span>
                    </Button>
                  ))}
                </div>
                <p className="text-center text-sm text-gray-500 mt-4">
                  Be honest with your rating - it helps the algorithm schedule reviews optimally
                </p>
              </CardContent>
            </Card>
          )}

          {currentCard.tags && currentCard.tags.length > 0 && (
            <div className="flex gap-2 justify-center flex-wrap">
              {currentCard.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  )
}
