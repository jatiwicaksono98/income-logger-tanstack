import { useForm } from '@tanstack/react-form'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'
import { CalendarIcon } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
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
import { createServerFn } from '@tanstack/react-start'
import { createMiddleware } from '@tanstack/react-start'
import { db } from 'db/drizzle'
import { dailyRecord } from 'db/schema'
import { auth } from 'lib/auth'

const formSchema = z.object({
  date: z.date({ message: 'Please select a date' }),
  transferAmount: z.number().min(0, 'Amount cannot be negative'),
  afternoonShiftAmount: z.number().min(0, 'Amount cannot be negative'),
  nightShiftAmount: z.number().min(0, 'Amount cannot be negative'),
  systemAmount: z.number().min(0, 'Amount cannot be negative'),
})

type FormData = z.infer<typeof formSchema>

const recordAuthMiddleware = createMiddleware().server(
  async ({ next, request }) => {
    const session = await auth.api.getSession({ headers: request.headers })

    if (!session) {
      throw new Error('Unauthorized')
    }

    return next({ context: { user: session.user } })
  },
)

const createRecord = createServerFn({ method: 'POST' })
  .middleware([recordAuthMiddleware])
  .inputValidator((data: FormData) => formSchema.parse(data))
  .handler(async ({ data, context }) => {
    const user = context.user as { id: string }

    // Format date to Indonesian timezone (WIB = UTC+7)
    const dateInWIB = new Date(
      data.date.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }),
    )
    const dateString = format(dateInWIB, 'yyyy-MM-dd')

    const record = await db
      .insert(dailyRecord)
      .values({
        id: crypto.randomUUID(),
        userId: user.id,
        date: dateString,
        transferAmount: data.transferAmount,
        afternoonShiftAmount: data.afternoonShiftAmount,
        nightShiftAmount: data.nightShiftAmount,
        systemAmount: data.systemAmount,
      })
      .returning()

    return record[0]
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

// Get current date in Indonesian timezone
function getIndonesianDate(): Date {
  const now = new Date()
  const indonesianTime = new Date(
    now.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }),
  )
  return indonesianTime
}

export function RecordForm({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const navigate = useNavigate()

  const form = useForm({
    defaultValues: {
      date: getIndonesianDate(),
      transferAmount: 0,
      afternoonShiftAmount: 0,
      nightShiftAmount: 0,
      systemAmount: 0,
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        await createRecord({ data: value })
        toast.success('Record saved successfully')
        navigate({ to: '/dashboard' })
      } catch (error) {
        if (error instanceof Error) {
          // Check for unique constraint violation
          if (
            error.message.includes('unique') ||
            error.message.includes('duplicate')
          ) {
            toast.error('A record for this date already exists')
          } else {
            toast.error(error.message)
          }
        } else {
          toast.error('Failed to save record')
        }
      }
    },
  })

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Daily Record</CardTitle>
          <CardDescription>
            Enter today's transfer and shift amounts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            id="record-form"
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
                            onSelect={(date) =>
                              date && field.handleChange(date)
                            }
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
                      <FieldLabel htmlFor={field.name}>
                        System Amount
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

              <Field>
                <Button type="submit" className="w-full">
                  Save Record
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
