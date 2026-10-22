import { toast } from 'sonner'
import type { CoverId } from './covers'
import { useNoteStore } from './notes-context'
import type { Note } from './types'
import { withViewTransition } from './view-transition'

/**
 * Kart ve düzenleyicinin ortak eylemleri; geri alınabilenler "Geri al" bildirimi gösterir.
 * Çağıran taraf, kartların kayması için bunları `withViewTransition` içinde çağırır.
 */
export function useNoteActions() {
  const { updateNote, deleteForever } = useNoteStore()
  const undo = (fn: () => void) => () => withViewTransition(fn)

  return {
    togglePin(note: Note) {
      // Arşivdeki bir not sabitlenince arşivden çıkar
      updateNote(note.id, note.is_pinned ? { is_pinned: false } : { is_pinned: true, is_archived: false })
    },
    setColor(note: Note, color: CoverId) {
      updateNote(note.id, { color })
    },
    toggleArchive(note: Note) {
      const archived = !note.is_archived
      updateNote(note.id, { is_archived: archived, is_pinned: false })
      toast(archived ? 'Not arşivlendi' : 'Not arşivden çıkarıldı', {
        action: {
          label: 'Geri al',
          onClick: undo(() => updateNote(note.id, { is_archived: note.is_archived, is_pinned: note.is_pinned })),
        },
      })
    },
    trash(note: Note) {
      updateNote(note.id, { deleted_at: new Date().toISOString() })
      toast('Not çöp kutusuna taşındı', {
        action: { label: 'Geri al', onClick: undo(() => updateNote(note.id, { deleted_at: null })) },
      })
    },
    restore(note: Note) {
      updateNote(note.id, { deleted_at: null })
      toast('Not geri yüklendi')
    },
    deleteForever(note: Note) {
      deleteForever([note.id])
      toast('Not kalıcı olarak silindi')
    },
  }
}
