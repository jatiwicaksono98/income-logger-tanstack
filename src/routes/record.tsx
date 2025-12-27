import { createFileRoute, Link } from '@tanstack/react-router'
import { authMiddleware } from 'lib/middleware'
import { RecordForm } from '@/components/record-form'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export const Route = createFileRoute('/record')({
  component: RouteComponent,
  server: {
    middleware: [authMiddleware],
  },
})

function RouteComponent() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Button variant="ghost" asChild className="mb-4">
          <Link to="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
        <RecordForm />
      </div>
    </div>
  )
}
