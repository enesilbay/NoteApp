import type { CoverId } from './covers'

/** Google Takeout > Keep çıktısındaki tek bir not dosyasının kullandığımız alanları. */
interface KeepNote {
  title?: string
  textContent?: string
  listContent?: { text: string; isChecked: boolean }[]
  color?: string
  isTrashed?: boolean
  isPinned?: boolean
  isArchived?: boolean
  labels?: { name: string }[]
  attachments?: unknown[]
  createdTimestampUsec?: number
  userEditedTimestampUsec?: number
}

export interface ImportedNote {
  title: string
  content: string
  color: CoverId | null
  is_pinned: boolean
  is_archived: boolean
  created_at: string
  updated_at: string
}

export interface KeepImportResult {
  notes: ImportedNote[]
  /** Çöp kutusundakiler, boş notlar ve okunamayan dosyalar */
  skipped: number
  /** Görsel eki olduğu için eki aktarılamayan not sayısı */
  withAttachments: number
}

const COLOR_MAP: Record<string, CoverId> = {
  RED: 'mercan',
  ORANGE: 'mandalina',
  YELLOW: 'limon',
  GREEN: 'nane',
  TEAL: 'nane',
  BLUE: 'gokyuzu',
  CERULEAN: 'elektrik',
  PURPLE: 'mor',
  PINK: 'fusya',
}

const usecToIso = (usec: number | undefined) => (usec ? new Date(usec / 1000).toISOString() : new Date().toISOString())

function convert(raw: KeepNote): ImportedNote | null {
  const lines: string[] = []
  if (raw.textContent) lines.push(raw.textContent)
  if (raw.listContent?.length) {
    lines.push(...raw.listContent.map((item) => `${item.isChecked ? '☑' : '☐'} ${item.text}`))
  }
  if (raw.labels?.length) lines.push('', raw.labels.map((l) => `#${l.name.replace(/\s+/g, '_')}`).join(' '))

  const title = raw.title?.trim() ?? ''
  const content = lines.join('\n').trim()
  if (!title && !content) return null

  return {
    title,
    content,
    color: COLOR_MAP[raw.color ?? ''] ?? null,
    is_pinned: !!raw.isPinned && !raw.isArchived,
    is_archived: !!raw.isArchived,
    created_at: usecToIso(raw.createdTimestampUsec ?? raw.userEditedTimestampUsec),
    updated_at: usecToIso(raw.userEditedTimestampUsec ?? raw.createdTimestampUsec),
  }
}

/** Seçilen .zip (Takeout arşivi) ve/veya .json dosyalarından Keep notlarını okur. */
export async function parseKeepFiles(files: File[]): Promise<KeepImportResult> {
  const texts: string[] = []
  for (const file of files) {
    if (/\.zip$/i.test(file.name)) {
      const { unzipSync, strFromU8 } = await import('fflate')
      const entries = unzipSync(new Uint8Array(await file.arrayBuffer()), {
        filter: (f) => /(^|\/)Keep\/[^/]+\.json$/i.test(f.name),
      })
      for (const data of Object.values(entries)) texts.push(strFromU8(data))
    } else if (/\.json$/i.test(file.name)) {
      texts.push(await file.text())
    }
  }

  const result: KeepImportResult = { notes: [], skipped: 0, withAttachments: 0 }
  for (const text of texts) {
    let raw: KeepNote
    try {
      raw = JSON.parse(text) as KeepNote
    } catch {
      result.skipped++
      continue
    }
    const note = raw.isTrashed ? null : convert(raw)
    if (!note) {
      result.skipped++
      continue
    }
    if (raw.attachments?.length) result.withAttachments++
    result.notes.push(note)
  }
  return result
}
