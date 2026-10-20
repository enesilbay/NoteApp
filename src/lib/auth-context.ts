import { createContext, useContext } from 'react'

export interface AuthUser {
  id: string
  email: string
}

export type AuthState =
  | { status: 'loading' }
  | { status: 'signed-out' }
  | { status: 'signed-in'; user: AuthUser }

export interface AuthContextValue {
  state: AuthState
  signIn(email: string, password: string): Promise<void>
  /** `true` dönerse kullanıcının e-postasını onaylaması gerekiyor. */
  signUp(email: string, password: string): Promise<boolean>
  signInWithGoogle(): Promise<void>
  sendPasswordReset(email: string): Promise<void>
  updatePassword(password: string): Promise<void>
  signOut(): Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth, AuthProvider içinde kullanılmalı')
  return ctx
}
