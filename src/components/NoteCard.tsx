import { memo, useEffect, useRef, type CSSProperties, type PointerEvent } from 'react'
import { Archive, ArchiveRestore, Pin, RotateCcw, Trash, Trash2 } from 'lucide-react'
import { CoverPicker } from '@/components/CoverPicker'
import { IconAction } from '@/components/IconAction'
import { coverOf, coverStyle } from '@/lib/covers'
import { useNoteActions } from '@/lib/note-actions'
import type { Note } from '@/lib/types'
import { cn } from '@/lib/utils'
import { trackOffscreen, withViewTransition } from '@/lib/view-transition'

export type View = 'notes' | 'archive' | 'trash'

interface Props {
  note: Note
  view: View
  index: number
  /** Düzenleyicide açıkken defter masadan kalkar: adını düzenleyiciye devreder (aynı ad iki yerde olamaz). */
  editing: boolean
  /** Izgara görünümü: telefonda iki sütuna sığan küçük kart; eylemler (çöp hariç) düzenleyicide. */
  compact: boolean
  onOpen(note: Note): void
}

const shortDate = new Intl.DateTimeFormat('tr', { day: 'numeric', month: 'short' })
const TILT_VARS = ['--rx', '--ry', '--mx', '--my']

/** Notlar değiştikçe yalnızca değişen kart yeniden çizilir (her kartta birkaç ipucu/açılır pencere var). */
export const NoteCard = memo(function NoteCard({ note, view, index, editing, compact, onOpen }: Props) {
  const actions = useNoteActions()
  const articleRef = useRef<HTMLElement>(null)
  const bookRef = useRef<HTMLDivElement>(null)
  const frame = useRef(0)
  const cover = coverOf(note)
  const inTrash = view === 'trash'
  const empty = !note.title && !note.content
  const act = (fn: (n: Note) => void) => () => withViewTransition(() => fn(note))

  useEffect(() => (articleRef.current ? trackOffscreen(articleRef.current) : undefined), [])
  useEffect(() => () => cancelAnimationFrame(frame.current), [])

  // Defter fareyi izleyerek eğilir, parlaklık imleçle kayar (dokunmatikte kapalı); kare başına bir kez
  const tilt = (e: PointerEvent<HTMLElement>) => {
    if (e.pointerType !== 'mouse' || inTrash || frame.current) return
    const { clientX, clientY } = e
    frame.current = requestAnimationFrame(() => {
      frame.current = 0
      const el = bookRef.current
      if (!el) return
      const r = el.getBoundingClientRect()
      const px = (clientX - r.left) / r.width
      const py = (clientY - r.top) / r.height
      el.style.setProperty('--ry', `${(px - 0.5) * 12}deg`)
      el.style.setProperty('--rx', `${(0.5 - py) * 9}deg`)
      el.style.setProperty('--mx', `${px * 100}%`)
      el.style.setProperty('--my', `${py * 100}%`)
    })
  }
  const untilt = () => {
    cancelAnimationFrame(frame.current)
    frame.current = 0
    TILT_VARS.forEach((v) => bookRef.current?.style.removeProperty(v))
  }

  return (
    <article
      ref={articleRef}
      data-note-id={note.id}
      style={
        {
          ...coverStyle(cover),
          '--i': index,
          '--drop-rot': `${index % 2 ? 4 : -4}deg`,
          viewTransitionName: editing ? undefined : `note-${note.id}`,
          viewTransitionClass: 'note-card',
        } as CSSProperties
      }
      className={cn(
        'group animate-drop offscreen-skip relative mb-6 break-inside-avoid pt-3 [perspective:900px]',
        compact && 'max-sm:mb-3.5',
        editing && 'invisible',
      )}
      onPointerMove={tilt}
      onPointerLeave={untilt}
    >
      <div
        ref={bookRef}
        role={inTrash ? undefined : 'button'}
        tabIndex={inTrash ? undefined : 0}
        aria-label={note.title || 'Başlıksız not'}
        onClick={inTrash ? undefined : () => onOpen(note)}
        onKeyDown={(e) => {
          if (!inTrash && e.target === e.currentTarget && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault()
            onOpen(note)
          }
        }}
        className={cn(
          'cover card-shadow relative rounded-[20px] [transform:translateY(var(--lift,0px))_rotateX(var(--rx,0deg))_rotateY(var(--ry,0deg))] transition-[transform,box-shadow,background-color] duration-500 ease-(--ease-out-expo) [transform-style:preserve-3d]',
          inTrash ? 'rotate-[-1.5deg] saturate-[0.35]' : 'cursor-pointer hover:[--lift:-6px] hover:duration-150 focus-visible:[--lift:-6px]',
        )}
      >
        <div aria-hidden className="spiral pointer-events-none absolute inset-x-3 -top-[10px]" />
        <div aria-hidden className="cover-sheen pointer-events-none absolute inset-0 rounded-[inherit] opacity-40 transition-opacity duration-300 group-hover:opacity-100" />

        {note.is_pinned && !inTrash && (
          <div
            aria-hidden
            className={cn(
              'animate-band absolute inset-y-0 right-7 w-2.5 bg-(--band) shadow-[inset_-2px_0_0_rgb(0_0_0/0.18),2px_0_6px_-2px_rgb(0_0_0/0.35)]',
              compact && 'max-sm:right-3.5 max-sm:w-2',
            )}
          />
        )}

        <div
          className={cn(
            'relative px-5 pt-7 pb-2',
            note.is_pinned && !inTrash && 'pr-12',
            compact && 'max-sm:px-3.5 max-sm:pt-6',
            compact && !inTrash && 'max-sm:pb-4',
            compact && note.is_pinned && !inTrash && 'max-sm:pr-8',
          )}
        >
          {note.title && (
            <h3
              className={cn(
                'text-[1.4rem] leading-[1.08] [font-weight:760] tracking-[-0.015em] text-balance break-words [font-stretch:88%]',
                compact && 'max-sm:text-[1.08rem]',
              )}
            >
              {note.title}
            </h3>
          )}
          {note.content && (
            <p
              className={cn(
                'line-clamp-[9] text-[0.95rem] leading-relaxed [font-weight:450] break-words whitespace-pre-wrap opacity-90',
                compact && 'max-sm:line-clamp-[10] max-sm:text-[0.86rem] max-sm:leading-snug',
                note.title && 'mt-2',
                note.title && compact && 'max-sm:mt-1.5',
              )}
            >
              {note.content}
            </p>
          )}
          {empty && <p className={cn('text-lg font-semibold opacity-70', compact && 'max-sm:text-base')}>Boş not</p>}
        </div>

        <footer
          className={cn('relative flex min-h-11 items-center gap-0.5 pr-2 pb-1.5 pl-5', compact && !inTrash && 'max-sm:hidden', compact && inTrash && 'max-sm:pl-3.5')}
          onClick={(e) => e.stopPropagation()}
        >
          <time dateTime={note.updated_at} className="mr-auto text-[0.75rem] font-bold tracking-[0.08em] uppercase tabular-nums opacity-80">
            {shortDate.format(new Date(note.updated_at))}
          </time>

          <div className="flex items-center opacity-0 transition-opacity duration-200 group-focus-within:opacity-100 group-hover:opacity-100 [@media(hover:none)]:opacity-100">
            {inTrash ? (
              <>
                <IconAction label="Geri yükle" onClick={act(actions.restore)}>
                  <RotateCcw />
                </IconAction>
                <IconAction label="Kalıcı olarak sil" onClick={act(actions.deleteForever)}>
                  <Trash />
                </IconAction>
              </>
            ) : (
              <>
                <IconAction label={note.is_pinned ? 'Sabitlemeyi kaldır' : 'Sabitle'} onClick={act(actions.togglePin)}>
                  <Pin className={cn(note.is_pinned && 'fill-current')} />
                </IconAction>
                <CoverPicker value={cover.id} onChange={(id) => actions.setColor(note, id)} />
                <IconAction label={note.is_archived ? 'Arşivden çıkar' : 'Arşivle'} onClick={act(actions.toggleArchive)}>
                  {note.is_archived ? <ArchiveRestore /> : <Archive />}
                </IconAction>
                <IconAction label="Çöpe at" onClick={act(actions.trash)}>
                  <Trash2 />
                </IconAction>
              </>
            )}
          </div>
        </footer>
      </div>
    </article>
  )
})
