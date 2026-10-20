export type NoteType = 'text' | 'checklist' | 'drawing'

/** `public.notes` satırıyla birebir aynı şekil. */
export interface Note {
  id: string
  user_id: string
  folder_id: string | null
  title: string
  type: NoteType
  content: string
  is_pinned: boolean
  is_archived: boolean
  is_locked: boolean
  color: string | null
  deleted_at: string | null
  created_at: string
  updated_at: string
}

export type NotePatch = Partial<
  Pick<Note, 'title' | 'content' | 'is_pinned' | 'is_archived' | 'deleted_at' | 'color' | 'folder_id'>
>

export type NoteChange =
  | { kind: 'upsert'; note: Note }
  | { kind: 'delete'; id: string }
