import { createContext, useContext } from 'react'
import type { ImportedNote } from './keep-import'
import type { Note, NotePatch } from './types'

export interface NoteActionsValue {
  createNote(fields: Pick<Note, 'title' | 'content' | 'color'>): void
  /** Dışarıdan gelen notları toplu ekler; zaten var olanları (başlık + içerik aynı) atlar. Eklenen sayıyı döner. */
  importNotes(items: ImportedNote[]): number
  updateNote(id: string, patch: NotePatch): void
  deleteForever(ids: string[]): void
}

export interface NotesContextValue extends NoteActionsValue {
  notes: Note[]
  loading: boolean
}

export const NotesContext = createContext<NotesContextValue | null>(null)
/** Yalnızca eylemler: değeri sabittir, notlar değişince tüketenleri yeniden çizdirmez. */
export const NoteActionsContext = createContext<NoteActionsValue | null>(null)

export function useNotes() {
  const ctx = useContext(NotesContext)
  if (!ctx) throw new Error('useNotes, NotesProvider içinde kullanılmalı')
  return ctx
}

export function useNoteStore() {
  const ctx = useContext(NoteActionsContext)
  if (!ctx) throw new Error('useNoteStore, NotesProvider içinde kullanılmalı')
  return ctx
}
