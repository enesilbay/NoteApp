import { useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { App as CapApp } from '@capacitor/app'
import { Browser } from '@capacitor/browser'
import { AuthContext, type AuthContextValue, type AuthState } from '@/lib/auth-context'
import { isNative, NATIVE_AUTH_CALLBACK, siteUrl, supabase } from '@/lib/supabase'

const DEMO_STATE: AuthState = { status: 'signed-in', user: { id: 'local', email: 'Demo modu' } }

function toState(session: Session | null): AuthState {
  if (!session) return { status: 'signed-out' }
  return { status: 'signed-in', user: { id: session.user.id, email: session.user.email ?? '' } }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(supabase ? { status: 'loading' } : DEMO_STATE)

  useEffect(() => {
    if (!supabase) return
    const client = supabase
    client.auth.getSession().then(({ data }) => setState(toState(data.session)))
    const { data } = client.auth.onAuthStateChange((_event, session) => setState(toState(session)))

    // Android: Google girişi sistem tarayıcısında biter, oturum bilgisi uygulamaya derin bağlantıyla döner
    const listener = isNative
      ? CapApp.addListener('appUrlOpen', async ({ url }) => {
          if (!url.startsWith(NATIVE_AUTH_CALLBACK)) return
          const params = new URLSearchParams(url.split('#')[1] ?? url.split('?')[1] ?? '')
          const access_token = params.get('access_token')
          const refresh_token = params.get('refresh_token')
          if (access_token && refresh_token) await client.auth.setSession({ access_token, refresh_token })
          void Browser.close()
        })
      : null

    return () => {
      data.subscription.unsubscribe()
      void listener?.then((l) => l.remove())
    }
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
          options: { emailRedirectTo: siteUrl },
        })
        if (error) throw error
        return data.session === null
      },
      async signInWithGoogle() {
        if (!supabase) return
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: isNative
            ? { redirectTo: NATIVE_AUTH_CALLBACK, skipBrowserRedirect: true }
            : { redirectTo: window.location.origin },
        })
        if (error) throw error
        // Google, uygulama içi WebView'de girişi engeller; bu yüzden sistem tarayıcısında açılır
        if (isNative && data.url) await Browser.open({ url: data.url })
      },
      async sendPasswordReset(email) {
        if (!supabase) return
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${siteUrl}/reset-password` })
        if (error) throw error
      },
      async updatePassword(password) {
        if (!supabase) return
        const { error } = await supabase.auth.updateUser({ password })
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
