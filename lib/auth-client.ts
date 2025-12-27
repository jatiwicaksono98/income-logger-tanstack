import { createAuthClient } from 'better-auth/react'

export const authClient = createAuthClient({
  baseURL: 'https://income-logger-tanstack.appwrite.network',
})
