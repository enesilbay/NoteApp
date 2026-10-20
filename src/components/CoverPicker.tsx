import { useState, type CSSProperties } from 'react'
import { Check, Palette } from 'lucide-react'
import { IconAction } from '@/components/IconAction'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { COVERS, coverStyle, type CoverId } from '@/lib/covers'
import { cn } from '@/lib/utils'

interface Props {
  value: CoverId | null
  onChange(id: CoverId): void
}

/** Kapak rengi seçici: her renk, tepesinde spiral teli olan minik bir defter. */
export function CoverPicker({ value, onChange }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <IconAction label="Kapak rengi" onClick={(e) => e.stopPropagation()}>
          <Palette />
        </IconAction>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-auto rounded-2xl border-0 p-3.5 shadow-[0_18px_40px_-16px_rgb(23_17_46/0.5)]"
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <p className="mb-2.5 px-0.5 text-sm font-bold">Kapak rengi</p>
        <div className="grid grid-cols-4 gap-2.5" role="radiogroup" aria-label="Kapak rengi">
          {COVERS.map((c, i) => {
            const selected = c.id === value
            return (
              <button
                key={c.id}
                type="button"
                role="radio"
                aria-checked={selected}
                aria-label={c.name}
                title={c.name}
                style={{ ...coverStyle(c), '--i': i } as CSSProperties}
                className={cn(
                  'cover animate-pop relative flex h-[3.6rem] w-12 items-center justify-center rounded-[9px] pt-2 shadow-[0_4px_10px_-4px_rgb(0_0_0/0.4)] transition-[translate,rotate] duration-300 ease-(--ease-spring) hover:-translate-y-1 hover:-rotate-6',
                  selected && '-translate-y-1 ring-[2.5px] ring-ink ring-offset-2',
                )}
                onClick={() => {
                  onChange(c.id)
                  setOpen(false)
                }}
              >
                <span aria-hidden className="spiral absolute inset-x-0.5 -top-2 scale-75" />
                {selected && <Check className="size-5" strokeWidth={3} />}
              </button>
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
}
