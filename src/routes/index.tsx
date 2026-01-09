import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useSession } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, Brain, Clock, TrendingUp } from 'lucide-react'

export const Route = createFileRoute('/')({
  component: Index,
})

function Index() {
  const navigate = useNavigate()
  const { data: session } = useSession()

  if (session) {
    navigate({ to: '/dashboard' })
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-4">
            <BookOpen className="w-12 h-12 text-blue-600" />
            <h1 className="text-5xl font-bold">Flashcards</h1>
          </div>
          <p className="text-xl text-gray-600 mb-8">
            Master any subject with spaced repetition learning
          </p>
          <div className="flex gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => navigate({ to: '/signup' })}
            >
              Get Started
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate({ to: '/login' })}
            >
              Sign In
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <Brain className="w-8 h-8 text-blue-600 mb-2" />
              <CardTitle>Smart Learning</CardTitle>
              <CardDescription>
                Powered by the proven SM-2 spaced repetition algorithm
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Clock className="w-8 h-8 text-green-600 mb-2" />
              <CardTitle>Optimized Reviews</CardTitle>
              <CardDescription>
                Study cards at the perfect moment for maximum retention
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <TrendingUp className="w-8 h-8 text-purple-600 mb-2" />
              <CardTitle>Track Progress</CardTitle>
              <CardDescription>
                Monitor your learning journey with detailed statistics
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  )
}
