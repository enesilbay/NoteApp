import { useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { AuthContext, type AuthContextValue, type AuthState } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'

const DEMO_STATE: AuthState = { status: 'signed-in', user: { id: 'local', email: 'Demo modu' } }

function toState(session: Session | null): AuthState {
  if (!session) return { status: 'signed-out' }
  return { status: 'signed-in', user: { id: session.user.id, email: session.user.email ?? '' } }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(supabase ? { status: 'loading' } : DEMO_STATE)

  useEffect(() => {
    if (!supabase) return
    supabase.auth.getSession().then(({ data }) => setState(toState(data.session)))
    const { data } = supabase.auth.onAuthStateChange((_event, session) => setState(toState(session)))
    return () => data.subscription.unsubscribe()
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      state,
      async signIn(email, password) {
        if (!supabase) return
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      },
      async signUp(email, password) {
        if (!supabase) return false
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        })
        if (error) throw error
        return data.session === null
      },
      async signInWithGoogle() {
        if (!supabase) return
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: { redirectTo: window.location.origin },
        })
        if (error) throw error
      },
      async signOut() {
        if (!supabase) return
        await supabase.auth.signOut()
      },
    }),
    [state],
  )

  return <AuthContext value={value}>{children}</AuthContext>
}
