import type { ComponentProps } from 'react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

/** Yuvarlak, ipuçlu ikon düğmesi. Rengini bulunduğu yüzeyden (kapak mürekkebi) alır. */
export function IconAction({ label, className, ...props }: ComponentProps<'button'> & { label: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label={label}
          className={cn(
            'inline-flex size-9 shrink-0 items-center justify-center rounded-full transition-[background-color,scale] duration-200 hover:bg-current/15 active:scale-90 [&_svg]:size-[18px] [&_svg]:transition-transform [&_svg]:duration-300 hover:[&_svg]:-rotate-6',
            className,
          )}
          {...props}
        />
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}
