import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabaseClient'

type AuthContextValue = {
  session: Session | null
  user: User | null
  isLoading: boolean
  error: string
}

const AuthContext = createContext<AuthContextValue | null>(null)

type AuthProviderProps = {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let receivedAuthEvent = false
    let isMounted = true

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      receivedAuthEvent = true
      if (isMounted) {
        setSession(nextSession)
        setIsLoading(false)
        setError('')
      }
    })

    void supabase.auth
      .getSession()
      .then(({ data, error: sessionError }) => {
        if (!isMounted || receivedAuthEvent) {
          return
        }

        if (sessionError) {
          setError('We couldn’t restore your session. Please try refreshing.')
        } else {
          setSession(data.session)
        }
        setIsLoading(false)
      })
      .catch(() => {
        if (isMounted && !receivedAuthEvent) {
          setError('We couldn’t restore your session. Please try refreshing.')
          setIsLoading(false)
        }
      })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  return (
    <AuthContext.Provider
      value={{ session, user: session?.user ?? null, isLoading, error }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider.')
  }

  return context
}
