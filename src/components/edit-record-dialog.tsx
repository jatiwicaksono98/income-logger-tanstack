import { useForm } from '@tanstack/react-form'
import { format, parseISO } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'
import { CalendarIcon } from 'lucide-react'
import { toast } from 'sonner'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'

import * as z from 'zod'
import { type DailyRecord, updateRecord } from '@/data/records'

const formSchema = z.object({
  date: z.date({ message: 'Please select a date' }),
  transferAmount: z.number().min(0, 'Amount cannot be negative'),
  afternoonShiftAmount: z.number().min(0, 'Amount cannot be negative'),
  nightShiftAmount: z.number().min(0, 'Amount cannot be negative'),
  systemAmount: z.number().min(0, 'Amount cannot be negative'),
})

// Format number to IDR currency format
function formatIDR(value: number | string): string {
  const num =
    typeof value === 'string'
      ? parseInt(value.replace(/\D/g, ''), 10) || 0
      : value
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num)
}

// Parse IDR formatted string to number
function parseIDR(value: string): number {
  return parseInt(value.replace(/\D/g, ''), 10) || 0
}

interface EditRecordDialogProps {
  record: DailyRecord
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function EditRecordDialog({
  record,
  open,
  onOpenChange,
  onSuccess,
}: EditRecordDialogProps) {
  const form = useForm({
    defaultValues: {
      date: parseISO(record.date),
      transferAmount: record.transferAmount,
      afternoonShiftAmount: record.afternoonShiftAmount,
      nightShiftAmount: record.nightShiftAmount,
      systemAmount: record.systemAmount,
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        await updateRecord({
          data: {
            id: record.id,
            ...value,
          },
        })
        toast.success('Record updated successfully')
        onSuccess()
      } catch (error) {
        if (error instanceof Error) {
          if (
            error.message.includes('unique') ||
            error.message.includes('duplicate')
          ) {
            toast.error('A record for this date already exists')
          } else {
            toast.error(error.message)
          }
        } else {
          toast.error('Failed to update record')
        }
      }
    },
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Record</DialogTitle>
          <DialogDescription>
            Update the record for{' '}
            {format(parseISO(record.date), 'EEEE, dd MMMM yyyy', {
              locale: idLocale,
            })}
          </DialogDescription>
        </DialogHeader>

        <form
          id="edit-record-form"
          onSubmit={(e) => {
            e.preventDefault()
            form.handleSubmit()
          }}
        >
          <FieldGroup>
            <form.Field
              name="date"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Date</FieldLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          id={field.name}
                          variant="outline"
                          className={cn(
                            'w-full justify-start text-left font-normal',
                            !field.state.value && 'text-muted-foreground',
                          )}
                          type="button"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.state.value ? (
                            format(field.state.value, 'EEEE, dd MMMM yyyy', {
                              locale: idLocale,
                            })
                          ) : (
                            <span>Pilih tanggal</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.state.value}
                          onSelect={(date) => date && field.handleChange(date)}
                          locale={idLocale}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                )
              }}
            />

            <form.Field
              name="transferAmount"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>
                      Transfer Amount
                    </FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={formatIDR(field.state.value)}
                      onBlur={field.handleBlur}
                      onChange={(e) =>
                        field.handleChange(parseIDR(e.target.value))
                      }
                      aria-invalid={isInvalid}
                      placeholder="Rp 0"
                      autoComplete="off"
                      type="text"
                      inputMode="numeric"
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                )
              }}
            />

            <form.Field
              name="afternoonShiftAmount"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>
                      Afternoon Shift Amount
                    </FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={formatIDR(field.state.value)}
                      onBlur={field.handleBlur}
                      onChange={(e) =>
                        field.handleChange(parseIDR(e.target.value))
                      }
                      aria-invalid={isInvalid}
                      placeholder="Rp 0"
                      autoComplete="off"
                      type="text"
                      inputMode="numeric"
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                )
              }}
            />

            <form.Field
              name="nightShiftAmount"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>
                      Night Shift Amount
                    </FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={formatIDR(field.state.value)}
                      onBlur={field.handleBlur}
                      onChange={(e) =>
                        field.handleChange(parseIDR(e.target.value))
                      }
                      aria-invalid={isInvalid}
                      placeholder="Rp 0"
                      autoComplete="off"
                      type="text"
                      inputMode="numeric"
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                )
              }}
            />

            <form.Field
              name="systemAmount"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>System Amount</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={formatIDR(field.state.value)}
                      onBlur={field.handleBlur}
                      onChange={(e) =>
                        field.handleChange(parseIDR(e.target.value))
                      }
                      aria-invalid={isInvalid}
                      placeholder="Rp 0"
                      autoComplete="off"
                      type="text"
                      inputMode="numeric"
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                )
              }}
            />

            <Field>
              <Button type="submit" className="w-full">
                Save Changes
              </Button>
            </Field>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  )
}
