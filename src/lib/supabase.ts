import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

/** Ortam değişkenleri yoksa `null`: uygulama demo (yalnızca yerel) modunda çalışır. */
export const supabase = url && anonKey ? createClient(url, anonKey) : null

export const isDemoMode = supabase === null
