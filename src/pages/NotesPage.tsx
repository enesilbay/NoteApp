import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useOutletContext } from 'react-router'
import { Loader2, Pin } from 'lucide-react'
import type { ShellContext } from '@/components/AppShell'
import { NotebookArt } from '@/components/NotebookArt'
import { NoteCard, type View } from '@/components/NoteCard'
import { NoteComposer } from '@/components/NoteComposer'
import { NoteEditor } from '@/components/NoteEditor'
import { useNotes } from '@/lib/notes-context'
import type { Note } from '@/lib/types'
import { cn } from '@/lib/utils'
import { withViewTransition } from '@/lib/view-transition'

const TITLES: Record<View, string> = { notes: 'Notlar', archive: 'Arşiv', trash: 'Çöp kutusu' }

const EMPTY: Record<View, { title: string; text: string }> = {
  notes: { title: 'Masan henüz boş', text: 'Yukarıdaki kutuya yazmaya başla; her not kendi renkli defterine dönüşür.' },
  archive: { title: 'Arşivde not yok', text: 'Kaldırmak istemediğin ama her gün görmek de istemediğin notları arşivle.' },
  trash: { title: 'Çöp kutusu boş', text: 'Çöpe attığın notlar sen boşaltana kadar burada bekler.' },
}

function inView(note: Note, view: View) {
  if (view === 'trash') return note.deleted_at !== null
  if (note.deleted_at !== null) return false
  return view === 'archive' ? note.is_archived : !note.is_archived
}

/** Kartın yaklaşık yüksekliği (satır cinsinden): sütunları dengelemek için ölçmeden tahmin edilir. */
function estimateHeight(note: Note) {
  const lines = note.content
    ? note.content.split('\n').reduce((sum, line) => sum + Math.max(1, Math.ceil(line.length / 22)), 0)
    : 0
  return 3 + (note.title ? 2 : 0) + Math.min(lines, 10)
}

/** Keep gibi akan ızgara: notlar soldan sağa sırayla, her biri o an en kısa sütuna yerleşir. */
function toColumns(items: Note[], count: number) {
  const columns: Note[][] = Array.from({ length: count }, () => [])
  const heights = new Array<number>(count).fill(0)
  for (const note of items) {
    const i = heights.indexOf(Math.min(...heights))
    columns[i].push(note)
    heights[i] += estimateHeight(note)
  }
  return columns
}

/** Telefonda 2 sütun; daha geniş ekranlarda 16rem'lik sütunlardan sığdığı kadar. */
function useColumnCount() {
  const ref = useRef<HTMLDivElement>(null)
  const [count, setCount] = useState(2)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const update = () => {
      const width = el.clientWidth
      setCount(width < 600 ? 2 : Math.max(2, Math.floor((width + 20) / (256 + 20))))
    }
    update()
    const observer = new ResizeObserver(update)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])
  return [ref, count] as const
}

function matches(note: Note, query: string) {
  const q = query.trim().toLocaleLowerCase('tr')
  return !q || note.title.toLocaleLowerCase('tr').includes(q) || note.content.toLocaleLowerCase('tr').includes(q)
}

export function NotesPage({ view }: { view: View }) {
  const { notes, loading, deleteForever } = useNotes()
  const { query, layout } = useOutletContext<ShellContext>()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [boardRef, columnCount] = useColumnCount()

  const visible = useMemo(
    () =>
      notes
        .filter((n) => inView(n, view) && matches(n, query))
        .sort((a, b) => b.created_at.localeCompare(a.created_at)),
    [notes, view, query],
  )
  const pinned = view === 'notes' ? visible.filter((n) => n.is_pinned) : []
  const others = view === 'notes' ? visible.filter((n) => !n.is_pinned) : visible
  const editing = notes.find((n) => n.id === editingId) ?? null

  const open = (n: Note) => withViewTransition(() => setEditingId(n.id))
  const close = () => withViewTransition(() => setEditingId(null))

  const card = (note: Note, index: number) => (
    <NoteCard
      key={note.id}
      note={note}
      view={view}
      index={index}
      editing={note.id === editingId}
      compact={layout === 'grid'}
      onOpen={open}
    />
  )

  const grid = (items: Note[], offset = 0) => {
    if (layout === 'list') return <div className="mx-auto max-w-2xl">{items.map((n, i) => card(n, offset + i))}</div>
    const order = new Map(items.map((n, i) => [n.id, offset + i]))
    return (
      <div className="flex items-start gap-3 sm:gap-5">
        {toColumns(items, columnCount).map((column, i) => (
          <div key={i} className="min-w-0 flex-1">
            {column.map((n) => card(n, order.get(n.id) ?? 0))}
          </div>
        ))}
      </div>
    )
  }

  const sectionTitle = (text: string, icon?: boolean) => (
    <h2 className={cn('mb-2 flex items-center gap-1.5 px-1 text-[0.95rem] font-bold text-ink/80', layout === 'list' && 'mx-auto max-w-2xl')}>
      {icon && <Pin className="size-4 fill-fuchsia-pop text-fuchsia-pop" />}
      {text}
    </h2>
  )

  const count = visible.length

  return (
    <div ref={boardRef}>
      <div className={cn('mb-6 flex flex-wrap items-baseline gap-x-3 gap-y-2', layout === 'list' && 'mx-auto max-w-2xl')}>
        <h1 className="text-[2.3rem] leading-none [font-weight:800] tracking-[-0.03em] [font-stretch:85%] sm:text-[2.9rem]">{TITLES[view]}</h1>
        {!loading && count > 0 && (
          <span className="rounded-full bg-lemon px-2.5 py-0.5 text-sm font-bold text-[#2E1065] tabular-nums">
            {query ? `${count} sonuç` : `${count} not`}
          </span>
        )}
        {view === 'trash' && count > 0 && (
          <button
            type="button"
            className="ml-auto rounded-full bg-destructive px-4 py-2 text-sm font-bold text-white transition-[scale,background-color] hover:bg-[#b5173a] active:scale-95"
            onClick={() => withViewTransition(() => deleteForever(visible.map((n) => n.id)))}
          >
            Çöp kutusunu boşalt
          </button>
        )}
      </div>

      {view === 'notes' && <NoteComposer />}

      {loading ? (
        <div className="flex justify-center pt-16 text-electric">
          <Loader2 className="size-7 animate-spin" aria-label="Yükleniyor" />
        </div>
      ) : count === 0 ? (
        <EmptyState
          title={query ? 'Eşleşen not yok' : EMPTY[view].title}
          text={query ? `“${query}” için başlıkta ya da metinde bir şey bulunamadı.` : EMPTY[view].text}
        />
      ) : (
        <>
          {pinned.length > 0 && (
            <section className="mb-8">
              {sectionTitle('Sabitlenenler', true)}
              {grid(pinned)}
            </section>
          )}
          {others.length > 0 && (
            <section>
              {pinned.length > 0 && sectionTitle('Diğerleri')}
              {grid(others, pinned.length)}
            </section>
          )}
        </>
      )}

      <NoteEditor note={editing} onClose={close} />
    </div>
  )
}

function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <div className="flex flex-col items-center px-4 pt-[6vh] text-center text-ink">
      <NotebookArt className="mb-7 w-52 sm:w-60" />
      <p className="text-2xl [font-weight:800] tracking-[-0.02em] [font-stretch:88%]">{title}</p>
      <p className="mt-2 max-w-sm text-[1rem] leading-relaxed text-ink/75">{text}</p>
    </div>
  )
}
