import { useState } from 'react'
import { useRouter } from '@tanstack/react-router'
import { format, parseISO } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'
import { Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

import { type DailyRecord, deleteRecord } from '@/data/records'
import { EditRecordDialog } from './edit-record-dialog'

// Format number to IDR currency format
function formatIDR(value: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

// Format difference with +/- prefix
function formatDifference(value: number): string {
  const formatted = new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.abs(value))

  if (value > 0) {
    return `+Rp ${formatted}`
  } else if (value < 0) {
    return `-Rp ${formatted}`
  }
  return `Rp ${formatted}`
}

interface RecordsTableProps {
  records: DailyRecord[]
}

export function RecordsTable({ records }: RecordsTableProps) {
  const router = useRouter()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<DailyRecord | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDeleteClick = (record: DailyRecord) => {
    setSelectedRecord(record)
    setDeleteDialogOpen(true)
  }

  const handleEditClick = (record: DailyRecord) => {
    setSelectedRecord(record)
    setEditDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!selectedRecord) return

    setIsDeleting(true)
    try {
      await deleteRecord({ data: { id: selectedRecord.id } })
      toast.success('Record deleted successfully')
      router.invalidate()
    } catch (error) {
      toast.error('Failed to delete record')
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
      setSelectedRecord(null)
    }
  }

  const handleEditSuccess = () => {
    setEditDialogOpen(false)
    setSelectedRecord(null)
    router.invalidate()
  }

  if (records.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No records found. Create your first record to get started.
      </div>
    )
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Transfer</TableHead>
            <TableHead className="text-right">Afternoon Shift</TableHead>
            <TableHead className="text-right">Night Shift</TableHead>
            <TableHead className="text-right">System</TableHead>
            <TableHead className="text-right">Difference</TableHead>
            <TableHead className="text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.map((record) => {
            const difference =
              record.transferAmount +
              record.afternoonShiftAmount +
              record.nightShiftAmount -
              record.systemAmount

            return (
              <TableRow key={record.id}>
                <TableCell className="font-medium">
                  {format(parseISO(record.date), 'EEEE, dd MMM yyyy', {
                    locale: idLocale,
                  })}
                </TableCell>
                <TableCell className="text-right">
                  {formatIDR(record.transferAmount)}
                </TableCell>
                <TableCell className="text-right">
                  {formatIDR(record.afternoonShiftAmount)}
                </TableCell>
                <TableCell className="text-right">
                  {formatIDR(record.nightShiftAmount)}
                </TableCell>
                <TableCell className="text-right">
                  {formatIDR(record.systemAmount)}
                </TableCell>
                <TableCell
                  className={`text-right font-semibold ${difference > 0 ? 'text-green-600' : difference < 0 ? 'text-red-600' : ''}`}
                >
                  {formatDifference(difference)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleEditClick(record)}
                    >
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleDeleteClick(record)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              record for{' '}
              {selectedRecord &&
                format(parseISO(selectedRecord.date), 'EEEE, dd MMMM yyyy', {
                  locale: idLocale,
                })}
              .
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Dialog */}
      {selectedRecord && (
        <EditRecordDialog
          record={selectedRecord}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          onSuccess={handleEditSuccess}
        />
      )}
    </>
  )
}
