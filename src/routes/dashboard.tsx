import { createFileRoute, Link } from '@tanstack/react-router'
import { authMiddleware } from 'lib/middleware'
import { getRecords } from '@/data/records'
import { RecordsTable } from '@/components/records-table'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Plus } from 'lucide-react'

export const Route = createFileRoute('/dashboard')({
  component: RouteComponent,
  server: {
    middleware: [authMiddleware],
  },
  loader: async () => {
    const records = await getRecords()
    return { records }
  },
})

function RouteComponent() {
  const { records } = Route.useLoaderData()

  return (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl">Daily Records</CardTitle>
            <CardDescription>
              Manage your daily transfer and shift records
            </CardDescription>
          </div>
          <Button asChild>
            <Link to="/record">
              <Plus className="mr-2 h-4 w-4" />
              Add Record
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <RecordsTable records={records} />
        </CardContent>
      </Card>
    </div>
  )
}
