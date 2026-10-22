import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { NavLink, Outlet } from 'react-router'
import { Archive, FileUp, LayoutGrid, LogOut, Menu, NotebookPen, Rows3, Search, Trash2, X } from 'lucide-react'
import { IconAction } from '@/components/IconAction'
import { LogoMark } from '@/components/NotebookArt'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'
import { useAuth } from '@/lib/auth-context'
import { parseKeepFiles } from '@/lib/keep-import'
import { useNoteStore } from '@/lib/notes-context'
import { isDemoMode } from '@/lib/supabase'
import { cn } from '@/lib/utils'

export type Layout = 'grid' | 'list'

export interface ShellContext {
  query: string
  layout: Layout
}

const NAV = [
  { to: '/', label: 'Notlar', icon: NotebookPen },
  { to: '/archive', label: 'Arşiv', icon: Archive },
  { to: '/trash', label: 'Çöp kutusu', icon: Trash2 },
] as const

const LAYOUT_KEY = 'noteapp:layout'

function readLayout(): Layout {
  try {
    return localStorage.getItem(LAYOUT_KEY) === 'list' ? 'list' : 'grid'
  } catch {
    return 'grid'
  }
}

export function AppShell() {
  const { state, signOut } = useAuth()
  const { importNotes } = useNoteStore()
  const importInput = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const [layout, setLayout] = useState<Layout>(readLayout)
  // Masaüstünde menü daraltılır (yalnızca ikonlar), mobilde soldan çekilen çekmece olur.
  const [collapsed, setCollapsed] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    try {
      localStorage.setItem(LAYOUT_KEY, layout)
    } catch {
      // gizli sekme vb. – tercih kaydedilmez
    }
  }, [layout])

  const email = state.status === 'signed-in' ? state.user.email : ''

  const onKeepFiles = async (files: File[]) => {
    try {
      const { notes, skipped, withAttachments } = await parseKeepFiles(files)
      if (notes.length === 0) {
        toast.error('İçe aktarılacak Keep notu bulunamadı')
        return
      }
      const added = importNotes(notes)
      const extras = [
        added < notes.length && `${notes.length - added} not zaten vardı`,
        skipped > 0 && `${skipped} dosya atlandı (çöp kutusu/boş)`,
        withAttachments > 0 && `${withAttachments} notun görselleri aktarılamadı`,
      ].filter(Boolean)
      toast.success(`${added} not içe aktarıldı`, { description: extras.join(' · ') || undefined })
    } catch {
      toast.error('Dosyalar okunamadı')
    }
  }

  const toggleMenu = () => {
    if (window.matchMedia('(min-width: 768px)').matches) setCollapsed((c) => !c)
    else setDrawerOpen((o) => !o)
  }

  return (
    <div className="flex h-dvh">
      {/* Mobil çekmece arka planı */}
      <div
        aria-hidden
        onClick={() => setDrawerOpen(false)}
        className={cn(
          'fixed inset-0 z-30 bg-[rgb(23_17_46/0.45)] transition-opacity duration-300 md:hidden',
          drawerOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
      />

      <aside
        aria-label="Bölümler"
        className={cn(
          'z-40 flex shrink-0 flex-col bg-night pt-6 pb-5 text-white',
          'max-md:fixed max-md:inset-y-0 max-md:left-0 max-md:w-[17rem] max-md:origin-bottom-left max-md:transition-[translate,rotate,opacity,visibility] max-md:duration-500 max-md:ease-(--ease-out-expo)',
          drawerOpen ? 'max-md:shadow-[16px_0_40px_-20px_rgb(0_0_0/0.6)]' : 'max-md:invisible max-md:-translate-x-full max-md:-rotate-6 max-md:opacity-0',
          'md:transition-[width] md:duration-300 md:ease-(--ease-out-expo)',
          collapsed ? 'md:w-[5.25rem]' : 'md:w-[16.5rem]',
        )}
      >
        <div className={cn('mb-9 flex items-center gap-3 px-6', collapsed && 'md:justify-center md:px-0')}>
          <LogoMark className="size-9 shrink-0" />
          <span className={cn('text-[1.45rem] [font-weight:800] tracking-[-0.02em] [font-stretch:88%]', collapsed && 'md:hidden')}>NoteA+</span>
        </div>

        <nav className="flex flex-col gap-1.5 px-3">
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end
              viewTransition
              title={collapsed ? label : undefined}
              onClick={() => setDrawerOpen(false)}
              className={({ isActive }) =>
                cn(
                  'relative flex h-12 items-center gap-3.5 rounded-xl pr-4 pl-11 text-[1rem] font-semibold whitespace-nowrap transition-colors duration-200',
                  isActive ? 'bg-white/10 text-white' : 'text-white/75 hover:bg-white/6 hover:text-white',
                  collapsed && 'md:justify-center md:gap-0 md:px-0',
                )
              }
            >
              {({ isActive }) => (
                <>
                  {/* Kitap ayracı kurdelesi: seçili bölümde asılı durur, bölüm değişince kayar */}
                  {isActive && (
                    <span
                      aria-hidden
                      style={{ viewTransitionName: 'nav-ribbon' } as CSSProperties}
                      className={cn(
                        'absolute -top-1.5 left-3.5 h-[3.6rem] w-3.5 origin-top bg-fuchsia-pop shadow-[2px_3px_6px_-2px_rgb(0_0_0/0.5)] [clip-path:polygon(0_0,100%_0,100%_100%,50%_82%,0_100%)] animate-[ribbon-wave_3.5s_ease-in-out_infinite]',
                        collapsed && 'md:left-1.5',
                      )}
                    />
                  )}
                  <Icon className={cn('size-5 shrink-0', isActive && 'text-lemon')} />
                  <span className={cn(collapsed && 'md:sr-only')}>{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <p className={cn('mt-auto truncate px-6 text-xs text-white/60', collapsed && 'md:hidden')} title={email}>
          {email}
        </p>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <input
          ref={importInput}
          type="file"
          accept=".zip,.json"
          multiple
          hidden
          onChange={(e) => {
            const files = Array.from(e.target.files ?? [])
            e.target.value = ''
            if (files.length) void onKeepFiles(files)
          }}
        />
        <header className="flex h-[4.5rem] shrink-0 items-center gap-1.5 px-2 sm:gap-3 sm:px-6">
          <IconAction label="Menü" className="size-11 text-ink" onClick={toggleMenu}>
            <Menu />
          </IconAction>
          <LogoMark className="size-8 shrink-0 md:hidden" />

          <label className="group mx-auto flex h-12 w-full min-w-0 max-w-2xl items-center gap-2.5 rounded-full bg-white px-4 shadow-[0_2px_10px_-4px_rgb(23_17_46/0.18)] ring-1 ring-ink/8 transition-[box-shadow] focus-within:shadow-[0_0_0_4px_var(--lemon),0_6px_18px_-8px_rgb(23_17_46/0.3)]">
            <Search className="size-[19px] shrink-0 text-ink/60 transition-[color,rotate] duration-300 group-focus-within:-rotate-12 group-focus-within:text-electric" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Notlarda ara"
              aria-label="Notlarda ara"
              className="h-full min-w-0 flex-1 bg-transparent text-[1rem] font-medium outline-none placeholder:text-ink/55"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label="Aramayı temizle"
                className="animate-pop rounded-full p-1 text-ink/70 hover:bg-ink/10"
              >
                <X className="size-4" />
              </button>
            )}
          </label>

          <IconAction
            label={layout === 'grid' ? 'Liste görünümü' : 'Izgara görünümü'}
            className="size-11 shrink-0 text-ink"
            onClick={() => setLayout((l) => (l === 'grid' ? 'list' : 'grid'))}
          >
            {layout === 'grid' ? <Rows3 /> : <LayoutGrid />}
          </IconAction>

          <DropdownMenu>
            <DropdownMenuTrigger
              aria-label="Hesap"
              className="flex size-11 shrink-0 items-center justify-center rounded-full bg-fuchsia-pop text-base font-extrabold text-[#3B0019] uppercase shadow-[0_6px_14px_-6px_var(--fuchsia-pop)] transition-[rotate,scale] duration-300 ease-(--ease-spring) hover:-rotate-12 hover:scale-105 active:scale-95"
            >
              {email.charAt(0) || '?'}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-60 rounded-xl">
              <DropdownMenuLabel className="truncate font-normal text-muted-foreground">{email}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => importInput.current?.click()}>
                <FileUp /> Google Keep'ten içe aktar
              </DropdownMenuItem>
              {!isDemoMode && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => void signOut()}>
                    <LogOut /> Çıkış yap
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        {isDemoMode && (
          <p className="mx-3 mb-2 rounded-2xl bg-lemon px-4 py-2 text-center text-sm font-medium text-[#2E1065] sm:mx-6">
            Demo modu: notlar yalnızca bu tarayıcıda saklanır. Senkron için <code>.env</code> dosyasına Supabase bilgilerini ekleyin.
          </p>
        )}

        <main className="min-h-0 flex-1 overflow-y-auto px-4 pt-4 pb-24 sm:px-8">
          <Outlet context={{ query, layout } satisfies ShellContext} />
        </main>
      </div>
    </div>
  )
}
