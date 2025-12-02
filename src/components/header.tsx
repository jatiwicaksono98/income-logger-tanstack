import { Link, useNavigate } from '@tanstack/react-router'
import { Button } from './ui/button'
import { authClient } from 'lib/auth-client'

export default function Header() {
  const { data: session } = authClient.useSession()
  const navigate = useNavigate()

  const logout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          navigate({ to: '/login' })
        },
      },
    })
  }

  return (
    <header className="flex justify-between items-center p-4">
      <h1 className="text-2xl font-bold">
        <Link to="/">My App</Link>
      </h1>

      <nav className="flex gap-4">
        {session ? (
          <Button onClick={logout}>Logout</Button>
        ) : (
          <>
            <Button asChild>
              <Link to="/login">Login</Link>
            </Button>
            <Button asChild>
              <Link to="/signup">Signup</Link>
            </Button>
          </>
        )}
      </nav>
    </header>
  )
}
