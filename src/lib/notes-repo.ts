import type { SupabaseClient } from '@supabase/supabase-js'
import type { Note, NoteChange, NotePatch } from './types'

export interface NotesRepo {
  list(): Promise<Note[]>
  create(note: Note): Promise<void>
  createMany(notes: Note[]): Promise<void>
  update(id: string, patch: NotePatch): Promise<void>
  remove(ids: string[]): Promise<void>
  /** Başka cihaz/sekmeden gelen değişiklikleri dinler; aboneliği bitiren fonksiyonu döner. */
  subscribe(onChange: (change: NoteChange) => void): () => void
}

export function createSupabaseRepo(client: SupabaseClient, userId: string): NotesRepo {
  const table = () => client.from('notes')

  return {
    async list() {
      const { data, error } = await table().select('*').eq('user_id', userId)
      if (error) throw error
      return data as Note[]
    },
    async create(note) {
      const { error } = await table().insert(note)
      if (error) throw error
    },
    async createMany(notes) {
      // Büyük içe aktarmalar tek istekte değil parçalar halinde gönderilir
      for (let i = 0; i < notes.length; i += 100) {
        const { error } = await table().insert(notes.slice(i, i + 100))
        if (error) throw error
      }
    },
    async update(id, patch) {
      const { error } = await table().update(patch).eq('id', id)
      if (error) throw error
    },
    async remove(ids) {
      const { error } = await table().delete().in('id', ids)
      if (error) throw error
    },
    subscribe(onChange) {
      const channel = client
        .channel(`notes:${userId}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'notes', filter: `user_id=eq.${userId}` },
          (payload) => {
            if (payload.eventType === 'DELETE') onChange({ kind: 'delete', id: (payload.old as Note).id })
            else onChange({ kind: 'upsert', note: payload.new as Note })
          },
        )
        .subscribe()
      return () => {
        void client.removeChannel(channel)
      }
    },
  }
}

const STORAGE_KEY = 'noteapp:notes'

/** Demo modu: notlar localStorage'da tutulur, sekmeler arası `storage` olayıyla senkronlanır. */
export function createLocalRepo(): NotesRepo {
  const read = (): Note[] => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as Note[]
    } catch {
      return []
    }
  }
  const write = (notes: Note[]) => localStorage.setItem(STORAGE_KEY, JSON.stringify(notes))

  return {
    async list() {
      return read()
    },
    async create(note) {
      write([...read(), note])
    },
    async createMany(notes) {
      write([...read(), ...notes])
    },
    async update(id, patch) {
      const now = new Date().toISOString()
      write(read().map((n) => (n.id === id ? { ...n, ...patch, updated_at: now } : n)))
    },
    async remove(ids) {
      write(read().filter((n) => !ids.includes(n.id)))
    },
    subscribe(onChange) {
      const handler = (e: StorageEvent) => {
        if (e.key !== STORAGE_KEY) return
        const next = read()
        const nextIds = new Set(next.map((n) => n.id))
        const prev = JSON.parse(e.oldValue ?? '[]') as Note[]
        for (const n of prev) if (!nextIds.has(n.id)) onChange({ kind: 'delete', id: n.id })
        for (const n of next) onChange({ kind: 'upsert', note: n })
      }
      window.addEventListener('storage', handler)
      return () => window.removeEventListener('storage', handler)
    },
  }
}
