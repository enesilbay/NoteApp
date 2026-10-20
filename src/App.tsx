import type { ReactNode } from 'react'
import { Navigate, Route, Routes } from 'react-router'
import { Loader2 } from 'lucide-react'
import { AppShell } from '@/components/AppShell'
import { NotesProvider } from '@/components/NotesProvider'
import { useAuth } from '@/lib/auth-context'
import { LoginPage } from '@/pages/LoginPage'
import { DownloadPage } from '@/pages/DownloadPage'
import { NotesPage } from '@/pages/NotesPage'
import { ResetPasswordPage } from '@/pages/ResetPasswordPage'

function RequireAuth({ children }: { children: ReactNode }) {
  const { state } = useAuth()
  if (state.status === 'loading') {
    return (
      <div className="flex h-dvh items-center justify-center text-muted-foreground">
        <Loader2 className="size-6 animate-spin" aria-label="Yükleniyor" />
      </div>
    )
  }
  if (state.status === 'signed-out') return <Navigate to="/login" replace />
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/indir" element={<DownloadPage />} />
      <Route
        element={
          <RequireAuth>
            <NotesProvider>
              <AppShell />
            </NotesProvider>
          </RequireAuth>
        }
      >
        <Route index element={<NotesPage view="notes" />} />
        <Route path="archive" element={<NotesPage view="archive" />} />
        <Route path="trash" element={<NotesPage view="trash" />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
