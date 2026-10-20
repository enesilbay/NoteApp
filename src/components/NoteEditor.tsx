import { useEffect, useEffectEvent, useRef, useState, type CSSProperties } from 'react'
import { Dialog as DialogPrimitive } from 'radix-ui'
import { Archive, ArchiveRestore, Pin, Trash2 } from 'lucide-react'
import { CoverPicker } from '@/components/CoverPicker'
import { IconAction } from '@/components/IconAction'
import { useAutosize } from '@/hooks/use-autosize'
import { coverOf, coverStyle } from '@/lib/covers'
import { formatEdited } from '@/lib/format'
import { useNoteActions } from '@/lib/note-actions'
import { useNotes } from '@/lib/notes-context'
import type { Note } from '@/lib/types'
import { cn } from '@/lib/utils'
import { withViewTransition } from '@/lib/view-transition'

const SAVE_DELAY_MS = 600

interface Props {
  note: Note | null
  onClose(): void
}

/**
 * Açık defter. Karttan büyüyerek gelir (View Transition: aynı ad); ardından kapak ve iki sayfa
 * sol menteşe üzerinde art arda çevrilir. Telefonda tüm ekranı kendi rengiyle kaplar.
 */
export function NoteEditor({ note, onClose }: Props) {
  return (
    <DialogPrimitive.Root open={note !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          style={{ viewTransitionName: 'editor-scrim' } as CSSProperties}
          className="fixed inset-0 z-50 bg-[rgb(23_17_46/0.55)] backdrop-blur-[3px]"
        />
        {note && <EditorBody key={note.id} note={note} onClose={onClose} />}
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}

function EditorBody({ note, onClose }: { note: Note; onClose(): void }) {
  const { updateNote } = useNotes()
  const actions = useNoteActions()
  const cover = coverOf(note)
  // Taslak düzenleyiciye aittir: realtime'dan gelen eski bir yankı yazılanı ezmez.
  const [title, setTitle] = useState(note.title)
  const [content, setContent] = useState(note.content)
  const contentRef = useRef<HTMLTextAreaElement>(null)
  useAutosize(contentRef, content)

  const saved = useRef({ title: note.title, content: note.content })
  const draft = useRef({ title: note.title, content: note.content })
  const timer = useRef<number | undefined>(undefined)

  const flush = () => {
    window.clearTimeout(timer.current)
    const { title, content } = draft.current
    if (title === saved.current.title && content === saved.current.content) return
    saved.current = { title, content }
    updateNote(note.id, { title, content })
  }
  const flushOnUnmount = useEffectEvent(flush)
  useEffect(() => () => flushOnUnmount(), [])

  const edit = (next: Partial<typeof draft.current>) => {
    draft.current = { ...draft.current, ...next }
    if (next.title !== undefined) setTitle(next.title)
    if (next.content !== undefined) setContent(next.content)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(flush, SAVE_DELAY_MS)
  }

  const runAndClose = (action: (n: Note) => void) => {
    flush()
    withViewTransition(() => {
      action({ ...note, title, content })
      onClose()
    })
  }

  return (
    <DialogPrimitive.Content
      aria-describedby={undefined}
      style={{ ...coverStyle(cover), viewTransitionName: `note-${note.id}` } as CSSProperties}
      className={cn(
        'cover fixed inset-0 z-[51] flex flex-col px-2 pt-[max(1.6rem,calc(env(safe-area-inset-top)+1.2rem))] pb-[max(0.25rem,env(safe-area-inset-bottom))] [perspective:1800px] transition-[background-color] duration-500 outline-none',
        'sm:inset-auto sm:top-[6vh] sm:left-1/2 sm:max-h-[86dvh] sm:w-[min(40rem,calc(100vw-2rem))] sm:-translate-x-1/2 sm:rounded-[24px] sm:px-2.5 sm:pt-7 sm:pb-1 sm:shadow-[0_40px_80px_-30px_rgb(23_17_46/0.7)]',
      )}
    >
      <DialogPrimitive.Title className="sr-only">Notu düzenle</DialogPrimitive.Title>
      <div aria-hidden className="spiral pointer-events-none absolute inset-x-4 top-[max(0.1rem,env(safe-area-inset-top))] sm:-top-[11px]" />

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[18px] bg-white text-ink sm:min-h-[min(24rem,60dvh)]">
        <div className="min-h-0 flex-1 overflow-y-auto px-1 pb-4">
          <input
            value={title}
            onChange={(e) => edit({ title: e.target.value })}
            placeholder="Başlık"
            aria-label="Başlık"
            className="w-full bg-transparent px-5 pt-6 pb-1 text-[1.9rem] leading-tight [font-weight:780] tracking-[-0.02em] outline-none placeholder:text-ink/35 [font-stretch:88%]"
          />
          <textarea
            ref={contentRef}
            value={content}
            onChange={(e) => edit({ content: e.target.value })}
            placeholder="Yazmaya başla…"
            aria-label="Not içeriği"
            autoFocus
            rows={4}
            className="block w-full resize-none bg-transparent px-5 pt-2 text-[1.05rem] leading-[1.7] outline-none placeholder:text-ink/45"
          />
        </div>
      </div>

      <div className="flex items-center gap-0.5 pt-1.5 pl-3">
        <p className="mr-auto truncate text-xs font-bold opacity-90">
          <span className="max-sm:hidden">Düzenlendi: </span>
          {formatEdited(note.updated_at)}
        </p>
        <IconAction label={note.is_pinned ? 'Sabitlemeyi kaldır' : 'Sabitle'} onClick={() => withViewTransition(() => actions.togglePin(note))}>
          <Pin className={cn(note.is_pinned && 'fill-current')} />
        </IconAction>
        <CoverPicker value={cover.id} onChange={(id) => actions.setColor(note, id)} />
        <IconAction label={note.is_archived ? 'Arşivden çıkar' : 'Arşivle'} onClick={() => runAndClose(actions.toggleArchive)}>
          {note.is_archived ? <ArchiveRestore /> : <Archive />}
        </IconAction>
        <IconAction label="Çöpe at" onClick={() => runAndClose(actions.trash)}>
          <Trash2 />
        </IconAction>
        <DialogPrimitive.Close className="ml-1 h-10 rounded-full bg-(--cover-ink) px-5 text-sm font-bold text-(--cover) transition-[scale,opacity] hover:opacity-90 active:scale-95">
          Kapat
        </DialogPrimitive.Close>
      </div>

      {/* Açılış: önce iki sayfa (altta), en üstte adı yazan kapak; üstten başlayarak çevrilir */}
      <div aria-hidden className="pointer-events-none absolute inset-0 [transform-style:preserve-3d]">
        <div className="animate-leaf absolute inset-x-2 top-7 bottom-2 rounded-[18px] bg-[#f3f0fb] [backface-visibility:hidden] sm:inset-x-2.5" style={{ animationDelay: '380ms' }} />
        <div className="animate-leaf absolute inset-x-2 top-7 bottom-2 rounded-[18px] bg-white [backface-visibility:hidden] sm:inset-x-2.5" style={{ animationDelay: '270ms' }} />
        <div className="cover animate-leaf absolute inset-0 flex flex-col justify-center px-8 [backface-visibility:hidden] sm:rounded-[24px]" style={{ animationDelay: '120ms' }}>
          <p className="line-clamp-3 text-[2.6rem] leading-[1] [font-weight:800] tracking-[-0.02em] [font-stretch:85%]">{title || 'Başlıksız not'}</p>
        </div>
      </div>
    </DialogPrimitive.Content>
  )
}
