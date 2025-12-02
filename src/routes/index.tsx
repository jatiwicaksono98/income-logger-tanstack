import { Button } from '@/components/ui/button'
import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/')({ component: App })

function App() {
  return (
    <main className="flex flex-col items-center justify-center pt-20 gap-4">
      <h1 className="text-4xl font-bold">TanStack Start Better Auth Starter</h1>
    </main>
  )
}
