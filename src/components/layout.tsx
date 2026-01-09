import { Link, useNavigate } from '@tanstack/react-router'
import { signOut, useSession } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { BookOpen, LayoutDashboard, Library, LogOut } from 'lucide-react'
import type { ReactNode } from 'react'

export function Layout({ children }: { children: ReactNode }) {
  const { data: session } = useSession()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate({ to: '/login' })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex gap-8">
              <Link
                to="/dashboard"
                className="flex items-center gap-2 font-semibold text-lg"
              >
                <BookOpen className="w-6 h-6" />
                Flashcards
              </Link>
              <div className="flex gap-4 items-center">
                <Link
                  to="/dashboard"
                  className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors [&.active]:bg-gray-100"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
                <Link
                  to="/decks"
                  className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors [&.active]:bg-gray-100"
                >
                  <Library className="w-4 h-4" />
                  Decks
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{session?.user.name}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="gap-2"
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </Button>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}
