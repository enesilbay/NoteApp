import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { toast } from 'sonner'
import { useAuth } from '@/lib/auth-context'
import { NotesContext, type NotesContextValue } from '@/lib/notes-context'
import { createLocalRepo, createSupabaseRepo } from '@/lib/notes-repo'
import { supabase } from '@/lib/supabase'
import type { Note, NoteChange } from '@/lib/types'

export function NotesProvider({ children }: { children: ReactNode }) {
  const { state } = useAuth()
  const userId = state.status === 'signed-in' ? state.user.id : null

  const repo = useMemo(() => {
    if (!userId) return null
    return supabase ? createSupabaseRepo(supabase, userId) : createLocalRepo()
  }, [userId])

  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  // Yanıtı beklenen yazma işlemleri: bunların realtime yankısı, daha yeni yerel durumu ezmesin.
  const pending = useRef(new Map<string, number>())

  const reload = useCallback(async () => {
    if (!repo) return
    try {
      setNotes(await repo.list())
    } catch {
      toast.error('Notlar yüklenemedi')
    } finally {
      setLoading(false)
    }
  }, [repo])

  useEffect(() => {
    if (!repo) return
    let active = true
    repo
      .list()
      .then((list) => active && setNotes(list))
      .catch(() => toast.error('Notlar yüklenemedi'))
      .finally(() => active && setLoading(false))

    const applyChange = (change: NoteChange) => {
      if (change.kind === 'delete') {
        setNotes((prev) => prev.filter((n) => n.id !== change.id))
        return
      }
      if (pending.current.has(change.note.id)) return
      setNotes((prev) => {
        const i = prev.findIndex((n) => n.id === change.note.id)
        if (i === -1) return [...prev, change.note]
        const next = prev.slice()
        next[i] = change.note
        return next
      })
    }
    const unsubscribe = repo.subscribe(applyChange)

    // Uygulama arka plandayken kaçırılan değişiklikler için tekrar yükle
    const onVisible = () => {
      if (document.visibilityState === 'visible' && pending.current.size === 0) void reload()
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      active = false
      unsubscribe()
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [repo, reload])

  const track = useCallback(
    (ids: string[], op: Promise<void>) => {
      for (const id of ids) pending.current.set(id, (pending.current.get(id) ?? 0) + 1)
      op.catch(() => {
        toast.error('Değişiklik kaydedilemedi')
        void reload()
      }).finally(() => {
        for (const id of ids) {
          const left = (pending.current.get(id) ?? 1) - 1
          if (left > 0) pending.current.set(id, left)
          else pending.current.delete(id)
        }
      })
    },
    [reload],
  )

  const value = useMemo<NotesContextValue>(
    () => ({
      notes,
      loading,
      createNote(fields) {
        if (!repo || !userId) return
        const now = new Date().toISOString()
        const note: Note = {
          id: crypto.randomUUID(),
          user_id: userId,
          folder_id: null,
          type: 'text',
          is_pinned: false,
          is_archived: false,
          is_locked: false,
          deleted_at: null,
          created_at: now,
          updated_at: now,
          ...fields,
        }
        setNotes((prev) => [...prev, note])
        track([note.id], repo.create(note))
      },
      importNotes(items) {
        if (!repo || !userId) return 0
        const seen = new Set(notes.map((n) => `${n.title}\u0000${n.content}`))
        const fresh = items.filter((i) => !seen.has(`${i.title}\u0000${i.content}`))
        if (fresh.length === 0) return 0
        const imported: Note[] = fresh.map((i) => ({
          id: crypto.randomUUID(),
          user_id: userId,
          folder_id: null,
          type: 'text',
          is_locked: false,
          deleted_at: null,
          ...i,
        }))
        setNotes((prev) => [...prev, ...imported])
        track(
          imported.map((n) => n.id),
          repo.createMany(imported),
        )
        return imported.length
      },
      updateNote(id, patch) {
        if (!repo) return
        const now = new Date().toISOString()
        setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, ...patch, updated_at: now } : n)))
        track([id], repo.update(id, patch))
      },
      deleteForever(ids) {
        if (!repo || ids.length === 0) return
        setNotes((prev) => prev.filter((n) => !ids.includes(n.id)))
        track(ids, repo.remove(ids))
      },
    }),
    [notes, loading, repo, userId, track],
  )

  return <NotesContext value={value}>{children}</NotesContext>
}
