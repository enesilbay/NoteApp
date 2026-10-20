import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { LogoMark } from '@/components/NotebookArt'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/lib/auth-context'

/** E-postadaki sıfırlama bağlantısı buraya gelir; Supabase bağlantıdaki geçici oturumu otomatik açar. */
export function ResetPasswordPage() {
  const { state, updatePassword } = useAuth()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await updatePassword(password)
      toast.success('Şifren güncellendi')
      navigate('/', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center px-4 py-10">
      <div className="card-shadow w-full max-w-[25.5rem] rounded-[24px] bg-white px-6 pt-6 pb-7 text-ink">
        <div className="mb-6 flex items-center gap-2.5">
          <LogoMark className="size-9" />
          <h1 className="text-[1.6rem] [font-weight:800] tracking-[-0.02em] [font-stretch:88%]">Yeni şifre belirle</h1>
        </div>

        {state.status === 'loading' && <Loader2 className="mx-auto size-6 animate-spin text-muted-foreground" aria-label="Yükleniyor" />}

        {state.status === 'signed-out' && (
          <p className="text-[1rem] font-medium text-ink/75">
            Bu bağlantı geçersiz ya da süresi dolmuş.{' '}
            <Link to="/login" className="font-extrabold text-ink underline decoration-2 underline-offset-4">
              Giriş ekranından
            </Link>{' '}
            yeni bir sıfırlama bağlantısı iste.
          </p>
        )}

        {state.status === 'signed-in' && (
          <form onSubmit={submit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="new-password" className="font-bold">Yeni şifre</Label>
              <Input
                id="new-password"
                type="password"
                autoComplete="new-password"
                minLength={6}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 rounded-xl bg-white text-base"
              />
              <p className="text-xs font-medium text-ink/65">En az 6 karakter.</p>
            </div>

            {error && (
              <p role="alert" className="animate-pop rounded-xl bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={busy}
              className="mt-1 flex h-12 items-center justify-center gap-2 rounded-full bg-ink text-base font-bold text-white shadow-[0_10px_20px_-10px_rgb(23_17_46/0.8)] transition-[background-color,scale] hover:bg-night active:scale-[0.98] disabled:opacity-60"
            >
              {busy && <Loader2 className="size-4 animate-spin" />}
              Şifreyi kaydet
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
