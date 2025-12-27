import { createServerFn } from '@tanstack/react-start'
import { createMiddleware } from '@tanstack/react-start'
import { db } from 'db/drizzle'
import { dailyRecord } from 'db/schema'
import { auth } from 'lib/auth'
import { eq, and, desc } from 'drizzle-orm'
import { format } from 'date-fns'
import * as z from 'zod'

// Auth middleware for server functions
const recordAuthMiddleware = createMiddleware().server(
  async ({ next, request }) => {
    const session = await auth.api.getSession({ headers: request.headers })

    if (!session) {
      throw new Error('Unauthorized')
    }

    return next({ context: { user: session.user } })
  },
)

// Type for a daily record
export type DailyRecord = {
  id: string
  userId: string
  date: string
  transferAmount: number
  afternoonShiftAmount: number
  nightShiftAmount: number
  systemAmount: number
  createdAt: Date
  updatedAt: Date
}

// Get all records for the current user
export const getRecords = createServerFn({ method: 'GET' })
  .middleware([recordAuthMiddleware])
  .handler(async ({ context }) => {
    const user = context.user as { id: string }

    const records = await db
      .select()
      .from(dailyRecord)
      .where(eq(dailyRecord.userId, user.id))
      .orderBy(desc(dailyRecord.date))

    return records
  })

// Update record schema
const updateRecordSchema = z.object({
  id: z.string(),
  date: z.date({ message: 'Please select a date' }),
  transferAmount: z.number().min(0, 'Amount cannot be negative'),
  afternoonShiftAmount: z.number().min(0, 'Amount cannot be negative'),
  nightShiftAmount: z.number().min(0, 'Amount cannot be negative'),
  systemAmount: z.number().min(0, 'Amount cannot be negative'),
})

export type UpdateRecordData = z.infer<typeof updateRecordSchema>

// Update a record
export const updateRecord = createServerFn({ method: 'POST' })
  .middleware([recordAuthMiddleware])
  .inputValidator((data: UpdateRecordData) => updateRecordSchema.parse(data))
  .handler(async ({ data, context }) => {
    const user = context.user as { id: string }

    // Format date to Indonesian timezone (WIB = UTC+7)
    const dateInWIB = new Date(
      data.date.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }),
    )
    const dateString = format(dateInWIB, 'yyyy-MM-dd')

    const record = await db
      .update(dailyRecord)
      .set({
        date: dateString,
        transferAmount: data.transferAmount,
        afternoonShiftAmount: data.afternoonShiftAmount,
        nightShiftAmount: data.nightShiftAmount,
        systemAmount: data.systemAmount,
      })
      .where(and(eq(dailyRecord.id, data.id), eq(dailyRecord.userId, user.id)))
      .returning()

    return record[0]
  })

// Delete record schema
const deleteRecordSchema = z.object({
  id: z.string(),
})

export type DeleteRecordData = z.infer<typeof deleteRecordSchema>

// Delete a record
export const deleteRecord = createServerFn({ method: 'POST' })
  .middleware([recordAuthMiddleware])
  .inputValidator((data: DeleteRecordData) => deleteRecordSchema.parse(data))
  .handler(async ({ data, context }) => {
    const user = context.user as { id: string }

    await db
      .delete(dailyRecord)
      .where(and(eq(dailyRecord.id, data.id), eq(dailyRecord.userId, user.id)))

    return { success: true }
  })
