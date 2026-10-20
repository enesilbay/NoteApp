import { useState, type FormEvent } from 'react'
import { Navigate } from 'react-router'
import { Loader2 } from 'lucide-react'
import { LogoMark, NotebookArt } from '@/components/NotebookArt'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/lib/auth-context'
import { COVERS, coverStyle } from '@/lib/covers'

type Mode = 'sign-in' | 'sign-up'

const ERRORS: Record<string, string> = {
  'Invalid login credentials': 'E-posta veya şifre hatalı.',
  'Email not confirmed': 'Giriş yapmadan önce e-postanı onayla.',
  'User already registered': 'Bu e-posta ile zaten bir hesap var.',
}

const ELECTRIC = COVERS.find((c) => c.id === 'elektrik') ?? COVERS[0]

function toMessage(err: unknown) {
  const msg = err instanceof Error ? err.message : String(err)
  return ERRORS[msg] ?? msg
}

export function LoginPage() {
  const { state, signIn, signUp, signInWithGoogle } = useAuth()
  const [mode, setMode] = useState<Mode>('sign-in')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)

  if (state.status === 'signed-in') return <Navigate to="/" replace />

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    setInfo(null)
    try {
      if (mode === 'sign-in') await signIn(email, password)
      else if (await signUp(email, password)) {
        setInfo('Hesabın oluşturuldu. Giriş yapmak için e-postana gelen bağlantıya tıkla.')
        setMode('sign-in')
      }
    } catch (err) {
      setError(toMessage(err))
    } finally {
      setBusy(false)
    }
  }

  const google = async () => {
    setError(null)
    try {
      await signInWithGoogle()
    } catch (err) {
      setError(toMessage(err))
    }
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-4 py-10">
      <NotebookArt className="mb-3 w-48 text-ink sm:w-56" />
      <h1 className="animate-drop mb-1.5 text-center text-[2.2rem] leading-none sm:text-[2.6rem] [font-weight:800] tracking-[-0.03em] [font-stretch:85%] [--i:2]">
        Notların, her cihazda.
      </h1>
      <p className="animate-drop mb-9 text-center text-[1.05rem] font-medium text-ink/75 [--i:3]">Telefonda yaz, tablette çiz, bilgisayarda düzenle.</p>

      <div
        style={coverStyle(ELECTRIC)}
        className="cover card-shadow animate-drop relative w-full max-w-[25.5rem] rounded-[24px] px-2.5 pt-7 pb-2.5 [--drop-rot:-3deg] [--i:4]"
      >
        <div aria-hidden className="spiral pointer-events-none absolute inset-x-4 -top-[11px]" />
        <div aria-hidden className="absolute inset-y-0 right-9 w-3 bg-fuchsia-pop shadow-[2px_0_6px_-2px_rgb(0_0_0/0.4)]" />

        <div className="relative rounded-[18px] bg-white px-6 pt-6 pb-7 text-ink">
          <div className="mb-6 flex items-center gap-2.5">
            <LogoMark className="size-9" />
            <h2 className="text-[1.6rem] [font-weight:800] tracking-[-0.02em] [font-stretch:88%]">{mode === 'sign-in' ? 'Giriş yap' : 'Hesap oluştur'}</h2>
          </div>

          <form onSubmit={submit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email" className="font-bold">E-posta</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 rounded-xl bg-white text-base"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password" className="font-bold">Şifre</Label>
              <Input
                id="password"
                type="password"
                autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'}
                minLength={6}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 rounded-xl bg-white text-base"
              />
              {mode === 'sign-up' && <p className="text-xs font-medium text-ink/65">En az 6 karakter.</p>}
            </div>

            {error && (
              <p role="alert" className="animate-pop rounded-xl bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">
                {error}
              </p>
            )}
            {info && <p className="animate-pop rounded-xl bg-[#1EE3A4]/25 px-3 py-2 text-sm font-medium text-[#00382A]">{info}</p>}

            <button
              type="submit"
              disabled={busy}
              className="mt-1 flex h-12 items-center justify-center gap-2 rounded-full bg-ink text-base font-bold text-white shadow-[0_10px_20px_-10px_rgb(23_17_46/0.8)] transition-[background-color,scale] hover:bg-night active:scale-[0.98] disabled:opacity-60"
            >
              {busy && <Loader2 className="size-4 animate-spin" />}
              {mode === 'sign-in' ? 'Giriş yap' : 'Kayıt ol'}
            </button>
          </form>

          <div className="my-5 flex items-center gap-3 text-xs font-bold text-ink/55">
            <span className="h-px flex-1 bg-border" /> veya <span className="h-px flex-1 bg-border" />
          </div>

          <button
            type="button"
            onClick={google}
            className="flex h-12 w-full items-center justify-center gap-2.5 rounded-full border-2 border-ink/12 bg-white font-bold transition-[background-color,scale] hover:bg-accent active:scale-[0.98]"
          >
            <GoogleIcon /> Google ile devam et
          </button>
        </div>

        <p className="relative px-3 pt-3 pb-1 text-center text-sm font-medium">
          {mode === 'sign-in' ? 'Hesabın yok mu?' : 'Zaten hesabın var mı?'}{' '}
          <button
            type="button"
            className="font-extrabold underline decoration-white/50 decoration-2 underline-offset-4 hover:decoration-white"
            onClick={() => {
              setMode(mode === 'sign-in' ? 'sign-up' : 'sign-in')
              setError(null)
            }}
          >
            {mode === 'sign-in' ? 'Kayıt ol' : 'Giriş yap'}
          </button>
        </p>
      </div>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="size-4">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.1A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.44.34-2.1V7.06H2.18A11 11 0 0 0 1 12c0 1.77.42 3.45 1.18 4.94l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38z" />
    </svg>
  )
}
