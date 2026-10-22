import { useEffect, useEffectEvent, useRef, useState, type CSSProperties } from 'react'
import { useAutosize } from '@/hooks/use-autosize'
import { COVERS, coverStyle, type CoverId } from '@/lib/covers'
import { useNoteStore } from '@/lib/notes-context'
import { cn } from '@/lib/utils'
import { withViewTransition } from '@/lib/view-transition'

/**
 * Yeni defter: spiralli beyaz bir sayfa. Renk seçilince sayfanın kenarı o kapağa boyanır.
 * Dışarı tıklayınca veya Kapat'a basınca kaydeder; renk seçilmezse not kendi rengini alır.
 */
export function NoteComposer() {
  const { createNote } = useNoteStore()
  const [expanded, setExpanded] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [color, setColor] = useState<CoverId | null>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLTextAreaElement>(null)
  useAutosize(contentRef, content)

  const chosen = COVERS.find((c) => c.id === color)

  const close = () => {
    const hasText = title.trim() || content.trim()
    withViewTransition(() => {
      if (hasText) createNote({ title: title.trim(), content, color })
      setTitle('')
      setContent('')
      setColor(null)
      setExpanded(false)
    })
    contentRef.current?.blur()
  }
  const onOutsidePointer = useEffectEvent((e: PointerEvent) => {
    if (!rootRef.current?.contains(e.target as Node)) close()
  })

  useEffect(() => {
    if (!expanded) return
    const onPointerDown = (e: PointerEvent) => onOutsidePointer(e)
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [expanded])

  return (
    <div
      ref={rootRef}
      style={{ ...(chosen ? coverStyle(chosen) : { '--cover': '#ffffff' }), viewTransitionName: 'composer' } as CSSProperties}
      className="relative mb-12 max-w-xl pt-2.5"
      onKeyDown={(e) => {
        if (e.key === 'Escape') close()
      }}
    >
      <div
        className={cn(
          'relative rounded-[20px] bg-(--cover) p-1.5 transition-[background-color,box-shadow] duration-500',
          expanded
            ? 'shadow-[0_22px_40px_-22px_rgb(23_17_46/0.55)]'
            : 'shadow-[0_8px_22px_-16px_rgb(23_17_46/0.45)] ring-1 ring-ink/8',
        )}
      >
        <div aria-hidden className="spiral pointer-events-none absolute inset-x-3 -top-[11px]" />
        <div className="rounded-[15px] bg-white">
          <div className={cn('grid transition-[grid-template-rows] duration-400 ease-(--ease-out-expo)', expanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]')}>
            <div className="overflow-hidden" inert={!expanded}>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Başlık"
                aria-label="Başlık"
                className="w-full bg-transparent px-5 pt-6 pb-0.5 text-xl font-bold tracking-[-0.01em] outline-none placeholder:text-ink/45 [font-stretch:90%]"
              />
            </div>
          </div>
          <textarea
            ref={contentRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onFocus={() => setExpanded(true)}
            placeholder="Aklındakini yaz…"
            aria-label="Not içeriği"
            rows={1}
            className={cn(
              'block max-h-[55vh] w-full resize-none bg-transparent px-5 pb-4 text-[1rem] leading-relaxed outline-none placeholder:font-semibold placeholder:text-ink/55',
              expanded ? 'pt-2' : 'pt-6',
            )}
          />

          <div className={cn('grid transition-[grid-template-rows] duration-400 ease-(--ease-out-expo)', expanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]')}>
            <div className={cn('overflow-hidden transition-opacity duration-200', !expanded && 'opacity-0')} inert={!expanded}>
              <div className="flex flex-wrap items-center gap-1.5 border-t border-dashed border-ink/12 px-4 py-3">
                <span className="mr-1 text-xs font-bold text-ink/70">Kapak</span>
                {COVERS.map((c, i) => (
                  <button
                    key={c.id}
                    type="button"
                    aria-label={c.name}
                    aria-pressed={c.id === color}
                    title={c.name}
                    style={{ background: c.hex, '--i': i } as CSSProperties}
                    onClick={() => setColor(c.id === color ? null : c.id)}
                    className={cn(
                      'size-7 rounded-full shadow-[inset_0_-2px_0_rgb(0_0_0/0.15)] transition-[scale,box-shadow] duration-300 ease-(--ease-spring) hover:scale-115',
                      expanded && 'animate-pop',
                      c.id === color && 'scale-115 ring-[2.5px] ring-ink ring-offset-2',
                    )}
                  />
                ))}
                <button
                  type="button"
                  onClick={close}
                  className="ml-auto h-10 rounded-full bg-ink px-5 text-sm font-bold text-white transition-[scale,background-color] hover:bg-night active:scale-95"
                >
                  Kapat
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
