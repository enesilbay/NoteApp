import type { CSSProperties } from 'react'
import { cn } from '@/lib/utils'

const BOOKS = [
  { x: 14, y: 40, fill: '#FFE019', band: '#7C3AED', rot: '-9deg', delay: '0s' },
  { x: 104, y: 30, fill: '#FF3D8F', band: '#FFE019', rot: '8deg', delay: '-1.6s' },
  { x: 58, y: 14, fill: '#2F5BFF', band: '#FF7A1A', rot: '-2deg', delay: '-3.1s' },
]

function Spiral({ x, y, w }: { x: number; y: number; w: number }) {
  const rings = Math.floor(w / 9)
  return (
    <g>
      {Array.from({ length: rings }, (_, i) => {
        const cx = x + 6 + i * 9
        return (
          <g key={i}>
            <circle cx={cx} cy={y + 5} r="1.6" fill="rgb(20 10 40 / 0.45)" />
            <path d={`M${cx - 1.4} ${y + 5.5} C${cx - 2} ${y - 1} ${cx + 2} ${y - 1} ${cx + 1.4} ${y + 5.5}`} fill="none" stroke="#C9C8D6" strokeWidth="1.4" strokeLinecap="round" />
          </g>
        )
      })}
    </g>
  )
}

/** Havada hafifçe salınan üç spiralli defter; boş durumlar ve giriş ekranı için çizim. */
export function NotebookArt({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 160" className={cn('overflow-visible', className)} aria-hidden>
      <ellipse cx="100" cy="152" rx="72" ry="6" fill="currentColor" opacity="0.1" />
      {BOOKS.map((b) => (
        <g
          key={b.fill}
          className="animate-bob"
          style={{ transformBox: 'fill-box', transformOrigin: 'center', '--bob-rot': b.rot, animationDelay: b.delay } as CSSProperties}
        >
          <rect x={b.x} y={b.y} width="80" height="104" rx="9" fill={b.fill} />
          <rect x={b.x + 60} y={b.y} width="7" height="104" fill={b.band} />
          <rect x={b.x + 12} y={b.y + 22} width="40" height="5" rx="2.5" fill="#1B1530" opacity="0.75" />
          <rect x={b.x + 12} y={b.y + 33} width="30" height="4" rx="2" fill="#1B1530" opacity="0.4" />
          <rect x={b.x + 12} y={b.y + 42} width="36" height="4" rx="2" fill="#1B1530" opacity="0.4" />
          <Spiral x={b.x} y={b.y} w={80} />
        </g>
      ))}
    </svg>
  )
}

/** Uygulama işareti: lastik bantlı, spiralli elektrik mavisi defter. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <rect x="4" y="5" width="24" height="25" rx="5" fill="#2F5BFF" />
      <rect x="20" y="5" width="3.5" height="25" fill="#FF3D8F" />
      <rect x="8" y="13" width="9" height="2.4" rx="1.2" fill="#fff" />
      <rect x="8" y="18" width="6" height="2.4" rx="1.2" fill="#fff" opacity="0.6" />
      {[9, 14, 19, 24].map((cx) => (
        <path key={cx} d={`M${cx - 1.2} 8 C${cx - 1.8} 2 ${cx + 1.8} 2 ${cx + 1.2} 8`} fill="none" stroke="#FFE019" strokeWidth="1.6" strokeLinecap="round" />
      ))}
    </svg>
  )
}
