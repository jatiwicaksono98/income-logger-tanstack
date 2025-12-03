# TanStack Start + Better Auth Starter

A production-ready starter template combining [TanStack Start](https://tanstack.com/start) with [Better Auth](https://www.better-auth.com/) for authentication, [Drizzle ORM](https://orm.drizzle.team/) for database access, and [Neon](https://neon.tech/) PostgreSQL.

## Features

- 🔐 **Authentication** — Email/password + Google OAuth via Better Auth
- 🗄️ **Database** — PostgreSQL with Drizzle ORM (configured for Neon)
- 🎨 **UI Components** — Pre-built shadcn/ui components
- 📝 **Forms** — TanStack Form with Zod validation
- 🛡️ **Route Protection** — Server-side middleware for protected routes
- 🔔 **Toast Notifications** — Sonner for user feedback

## Prerequisites

Before you begin, ensure you have:

- [Node.js](https://nodejs.org/) v18 or higher
- [pnpm](https://pnpm.io/) package manager
- A [Neon](https://neon.tech/) database (free tier available)
- Google OAuth credentials (optional, for social login)

## Quick Start

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd tanstack-start-better-auth-starter
pnpm install
```

### 2. Set Up Environment Variables

Create a `.env` file in the root directory:

```env
# Database (Required)
DATABASE_URL="postgresql://user:password@host/database?sslmode=require"

# Google OAuth (Optional - remove from lib/auth.ts if not using)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Better Auth Secret (Required for production)
BETTER_AUTH_SECRET="your-random-secret-string"
```

### 3. Set Up the Database

Push the schema to your database:

```bash
pnpm drizzle-kit push
```

Or generate and run migrations:

```bash
pnpm drizzle-kit generate
pnpm drizzle-kit migrate
```

### 4. Start the Development Server

```bash
pnpm dev
```

Your app is now running at [http://localhost:3000](http://localhost:3000)

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | Neon PostgreSQL connection string |
| `GOOGLE_CLIENT_ID` | No | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | No | Google OAuth client secret |
| `BETTER_AUTH_SECRET` | Production | Secret for signing tokens |

### Getting a Neon Database URL

1. Create a free account at [neon.tech](https://neon.tech/)
2. Create a new project
3. Copy the connection string from the dashboard

### Setting Up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Navigate to **APIs & Services > Credentials**
4. Click **Create Credentials > OAuth client ID**
5. Select **Web application**
6. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
7. Copy the Client ID and Client Secret

## Project Structure

```
├── db/
│   ├── drizzle.ts          # Database connection
│   └── schema.ts           # Drizzle schema (users, sessions, accounts)
├── lib/
│   ├── auth.ts             # Better Auth server configuration
│   ├── auth-client.ts      # Better Auth client
│   └── middleware.ts       # Auth middleware for protected routes
├── src/
│   ├── components/
│   │   ├── ui/             # shadcn/ui components
│   │   ├── header.tsx      # App header with auth state
│   │   ├── login-form.tsx  # Login form component
│   │   └── signup-form.tsx # Signup form component
│   ├── routes/
│   │   ├── __root.tsx      # Root layout
│   │   ├── index.tsx       # Home page
│   │   ├── login.tsx       # Login page
│   │   ├── signup.tsx      # Signup page
│   │   ├── dashboard.tsx   # Protected dashboard
│   │   └── api/auth/$.ts   # Auth API handler
│   └── styles.css          # Global styles (Tailwind)
├── drizzle.config.ts       # Drizzle Kit configuration
└── components.json         # shadcn/ui configuration
```

## Authentication

### How It Works

This starter uses Better Auth with Drizzle adapter:

- **Server-side**: `lib/auth.ts` configures the auth instance
- **Client-side**: `lib/auth-client.ts` provides React hooks
- **API Routes**: `src/routes/api/auth/$.ts` handles all auth endpoints

### Using Auth in Components

```tsx
import { authClient } from 'lib/auth-client'

function MyComponent() {
  // Get current session
  const { data: session } = authClient.useSession()

  if (session) {
    return <p>Welcome, {session.user.name}!</p>
  }

  return <p>Please log in</p>
}
```

### Sign In / Sign Up

```tsx
// Email sign in
await authClient.signIn.email({
  email: 'user@example.com',
  password: 'password123',
  callbackURL: '/dashboard',
})

// Email sign up
await authClient.signUp.email({
  email: 'user@example.com',
  password: 'password123',
  name: 'John Doe',
  callbackURL: '/dashboard',
})

// Google sign in
await authClient.signIn.social({
  provider: 'google',
  callbackURL: '/dashboard',
})

// Sign out
await authClient.signOut()
```

### Protecting Routes

Use the auth middleware to protect server-side routes:

```tsx
import { createFileRoute } from '@tanstack/react-router'
import { authMiddleware } from 'lib/middleware'

export const Route = createFileRoute('/protected')({
  component: ProtectedPage,
  server: {
    middleware: [authMiddleware],
  },
})
```

Users without a valid session will be redirected to `/login`.

## Customization

### Adding More OAuth Providers

Edit `lib/auth.ts` to add providers:

```ts
export const auth = betterAuth({
  // ...existing config
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    },
  },
})
```

### Removing Google OAuth

If you don't need Google OAuth:

1. Remove the `socialProviders` section from `lib/auth.ts`
2. Remove the Google sign-in button from login/signup forms
3. Remove `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` from `.env`

### Adding UI Components

Use shadcn/ui to add new components:

```bash
pnpx shadcn@latest add button
pnpx shadcn@latest add dialog
pnpx shadcn@latest add dropdown-menu
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server on port 3000 |
| `pnpm build` | Build for production |
| `pnpm serve` | Preview production build |
| `pnpm test` | Run tests with Vitest |
| `pnpm lint` | Run ESLint |
| `pnpm format` | Run Prettier |
| `pnpm check` | Format and lint fix |
| `pnpm drizzle-kit push` | Push schema to database |
| `pnpm drizzle-kit studio` | Open Drizzle Studio |

## Database Schema

The starter includes Better Auth's required tables:

- **user** — User accounts (id, name, email, emailVerified, image)
- **session** — Active sessions with tokens
- **account** — OAuth accounts linked to users
- **verification** — Email verification tokens

### Viewing Your Data

Launch Drizzle Studio to browse your database:

```bash
pnpm drizzle-kit studio
```

## Production Deployment

### Environment Variables

Ensure these are set in your production environment:

```env
DATABASE_URL="your-production-database-url"
BETTER_AUTH_SECRET="a-long-random-string"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### Update Auth Client Base URL

In `lib/auth-client.ts`, update the `baseURL` for production:

```ts
export const authClient = createAuthClient({
  baseURL: process.env.NODE_ENV === 'production' 
    ? 'https://your-domain.com' 
    : 'http://localhost:3000'
})
```

### Build and Deploy

```bash
pnpm build
```

Deploy the `.output` directory to your hosting provider.

## Tech Stack

- [TanStack Start](https://tanstack.com/start) — Full-stack React framework
- [TanStack Router](https://tanstack.com/router) — Type-safe routing
- [TanStack Form](https://tanstack.com/form) — Powerful form management
- [Better Auth](https://www.better-auth.com/) — Authentication library
- [Drizzle ORM](https://orm.drizzle.team/) — TypeScript ORM
- [Neon](https://neon.tech/) — Serverless PostgreSQL
- [Tailwind CSS](https://tailwindcss.com/) — Utility-first CSS
- [shadcn/ui](https://ui.shadcn.com/) — UI component library
- [Zod](https://zod.dev/) — Schema validation
- [Sonner](https://sonner.emilkowal.ski/) — Toast notifications

## Demo Files

Files and folders prefixed with `demo` contain example code showcasing various TanStack Start features (SSR modes, API requests, server functions). You can safely delete these once you're familiar with the patterns.

## Troubleshooting

### Database Connection Issues

- Verify your `DATABASE_URL` is correct
- Ensure SSL mode is enabled (`?sslmode=require`)
- Check that your IP is allowed in Neon's settings

### Google OAuth Not Working

- Verify redirect URI matches exactly: `http://localhost:3000/api/auth/callback/google`
- Check that OAuth consent screen is configured
- Ensure credentials are for "Web application" type

### Auth Middleware Redirect Loop

- Clear browser cookies
- Check that `/login` route exists and is accessible
- Verify the auth API handler at `/api/auth/$` is working

## License

MIT

---

Built with ❤️ using the TanStack ecosystem
