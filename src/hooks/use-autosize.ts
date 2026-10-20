import { useLayoutEffect, type RefObject } from 'react'

/** Textarea yüksekliğini içeriğe göre ayarlar (yazı tipi geç yüklenirse yeniden ölçer). */
export function useAutosize(ref: RefObject<HTMLTextAreaElement | null>, value: string) {
  useLayoutEffect(() => {
    const resize = () => {
      const el = ref.current
      if (!el) return
      el.style.height = 'auto'
      el.style.height = `${el.scrollHeight}px`
      // Yalnızca max-height'a takılınca kaydırma çubuğu göster
      el.style.overflowY = el.scrollHeight > el.clientHeight + 1 ? 'auto' : 'hidden'
    }
    resize()
    void document.fonts?.ready.then(resize)
  }, [ref, value])
}
