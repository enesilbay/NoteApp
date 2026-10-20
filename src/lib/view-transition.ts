import { flushSync } from 'react-dom'

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Durum değişikliğini View Transition içinde uygular: kartlar yeni yerlerine kayar,
 * silinenler düşer, açılan not karttan büyür. Desteklenmiyorsa doğrudan uygular.
 * Yazarken yapılan otomatik kayıtlar için KULLANMAYIN (geçiş sırasında ekran donar).
 */
export function withViewTransition(update: () => void) {
  if (!document.startViewTransition || reducedMotion()) {
    update()
    return
  }
  document.startViewTransition(() => flushSync(update))
}
