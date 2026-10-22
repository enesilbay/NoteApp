import { flushSync } from 'react-dom'

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

let seq = 0

/**
 * Durum değişikliğini View Transition içinde uygular: kartlar yeni yerlerine kayar,
 * silinenler düşer, açılan not karttan büyür. Desteklenmiyorsa doğrudan uygular.
 * `solo` verilirse yalnızca o notun kartı geçişe katılır (aç/kapat): diğer kartların
 * görüntüsü alınmaz, geçiş çok daha hafif olur.
 * Yazarken yapılan otomatik kayıtlar için KULLANMAYIN (geçiş sırasında ekran donar).
 */
export function withViewTransition(update: () => void, { solo }: { solo?: string } = {}) {
  if (!document.startViewTransition || reducedMotion()) {
    update()
    return
  }
  const root = document.documentElement
  const token = ++seq
  document.querySelectorAll('[data-vt-keep]').forEach((el) => el.removeAttribute('data-vt-keep'))
  root.classList.toggle('vt-solo', solo !== undefined)
  if (solo !== undefined) document.querySelector(`[data-note-id="${CSS.escape(solo)}"]`)?.setAttribute('data-vt-keep', '')

  const transition = document.startViewTransition(() => flushSync(update))
  void transition.finished.finally(() => {
    if (token !== seq) return
    root.classList.remove('vt-solo')
    document.querySelectorAll('[data-vt-keep]').forEach((el) => el.removeAttribute('data-vt-keep'))
  })
}

const observers = new WeakMap<Element, IntersectionObserver>()

/**
 * Kaydırma alanının epey dışındaki kartları `data-vt-off` ile işaretler; CSS bunları geçişten çıkarır.
 * Yüzlerce notta her geçişin tüm kartların görüntüsünü alması donmanın asıl sebebiydi.
 */
export function trackOffscreen(el: Element) {
  const root = el.closest('main')
  if (!root) return () => {}
  let observer = observers.get(root)
  if (!observer) {
    observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) e.target.toggleAttribute('data-vt-off', !e.isIntersecting)
      },
      { root, rootMargin: '50% 0px' },
    )
    observers.set(root, observer)
  }
  observer.observe(el)
  return () => observer.unobserve(el)
}
