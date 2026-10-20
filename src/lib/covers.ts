import type { CSSProperties } from 'react'

/**
 * Defter kapakları: her canlı renk kendi tonundan koyu bir mürekkeple eşleşir (iki tonlu baskı).
 * `ink`, kapak üstündeki yazı/ikon rengidir; hepsi küçük metin için WCAG AA kontrastını sağlar.
 * `band`, sabitlenen notlardaki lastik bandın rengi.
 */
export const COVERS = [
  { id: 'limon', name: 'Limon', hex: '#FFE019', ink: '#2E1065', band: '#7C3AED' },
  { id: 'fusya', name: 'Fuşya', hex: '#FF3D8F', ink: '#3B0019', band: '#FFE019' },
  { id: 'elektrik', name: 'Elektrik', hex: '#2F5BFF', ink: '#FFFFFF', band: '#FF7A1A' },
  { id: 'nane', name: 'Nane', hex: '#1EE3A4', ink: '#00382A', band: '#FF3D8F' },
  { id: 'mandalina', name: 'Mandalina', hex: '#FF7A1A', ink: '#2B1000', band: '#2F5BFF' },
  { id: 'gokyuzu', name: 'Gökyüzü', hex: '#1EC8FF', ink: '#00243A', band: '#FF4D3D' },
  { id: 'mor', name: 'Mor', hex: '#7C3AED', ink: '#FFFFFF', band: '#1EE3A4' },
  { id: 'mercan', name: 'Mercan', hex: '#FF4D3D', ink: '#2A0500', band: '#1EC8FF' },
] as const

export type Cover = (typeof COVERS)[number]
export type CoverId = Cover['id']

/** İlk tasarımın renk kimlikleriyle kaydedilmiş notlar en yakın yeni kapağa eşlenir. */
const LEGACY: Record<string, CoverId> = {
  kobalt: 'elektrik',
  kirmizi: 'mercan',
  portakal: 'mandalina',
  aycicegi: 'limon',
  cimen: 'nane',
  turkuaz: 'gokyuzu',
  mor: 'mor',
  pembe: 'fusya',
}

function hash(s: string) {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0
  return Math.abs(h)
}

export function findCover(id: string | null | undefined): Cover | undefined {
  if (!id) return undefined
  const key = LEGACY[id] ?? id
  return COVERS.find((c) => c.id === key)
}

/** Rengi seçilmemiş notlar kimliklerinden türeyen sabit bir kapak alır, böylece masa hep renkli. */
export function coverOf(note: { id: string; color: string | null }): Cover {
  return findCover(note.color) ?? COVERS[hash(note.id) % COVERS.length]
}

export function coverStyle(cover: Cover): CSSProperties {
  return { '--cover': cover.hex, '--cover-ink': cover.ink, '--band': cover.band } as CSSProperties
}
