import { createContext, useContext } from 'react'
import type { ImportedNote } from './keep-import'
import type { Note, NotePatch } from './types'

export interface NotesContextValue {
  notes: Note[]
  loading: boolean
  createNote(fields: Pick<Note, 'title' | 'content' | 'color'>): void
  /** Dışarıdan gelen notları toplu ekler; zaten var olanları (başlık + içerik aynı) atlar. Eklenen sayıyı döner. */
  importNotes(items: ImportedNote[]): number
  updateNote(id: string, patch: NotePatch): void
  deleteForever(ids: string[]): void
}

export const NotesContext = createContext<NotesContextValue | null>(null)

export function useNotes() {
  const ctx = useContext(NotesContext)
  if (!ctx) throw new Error('useNotes, NotesProvider içinde kullanılmalı')
  return ctx
}
